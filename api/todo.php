<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . '/todos.json';

function send_json($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function read_todos($dataFile)
{
    if (!file_exists($dataFile)) {
        return [];
    }

    $contents = file_get_contents($dataFile);
    $todos = json_decode($contents, true);

    return is_array($todos) ? $todos : [];
}

function write_todos($dataFile, $todos)
{
    $json = json_encode(array_values($todos), JSON_PRETTY_PRINT);

    if (file_put_contents($dataFile, $json, LOCK_EX) === false) {
        send_json(['message' => 'Could not save todos.'], 500);
    }
}

function get_body()
{
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

function normalize_created_at($createdAt)
{
    if (!is_string($createdAt) || trim($createdAt) === '') {
        return gmdate('c');
    }

    $createdAt = trim($createdAt);

    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $createdAt)) {
        return $createdAt . 'T12:00:00';
    }

    if (strtotime($createdAt) === false) {
        send_json(['message' => 'Task date is invalid.'], 422);
    }

    return $createdAt;
}

$method = $_SERVER['REQUEST_METHOD'];
$todos = read_todos($dataFile);

if ($method === 'GET') {
    send_json($todos);
}

if ($method === 'POST') {
    $body = get_body();
    $title = trim($body['title'] ?? '');

    if ($title === '') {
        send_json(['message' => 'Task title is required.'], 422);
    }

    $todo = [
        'id' => uniqid('todo_', true),
        'title' => $title,
        'done' => false,
        'createdAt' => normalize_created_at($body['createdAt'] ?? ''),
    ];

    array_unshift($todos, $todo);
    write_todos($dataFile, $todos);
    send_json($todo, 201);
}

if ($method === 'PUT') {
    $body = get_body();
    $id = $body['id'] ?? '';

    if ($id === '') {
        send_json(['message' => 'Task id is required.'], 422);
    }

    foreach ($todos as $index => $todo) {
        if ($todo['id'] === $id) {
            if (array_key_exists('title', $body)) {
                $title = trim($body['title']);

                if ($title === '') {
                    send_json(['message' => 'Task title cannot be empty.'], 422);
                }

                $todos[$index]['title'] = $title;
            }

            if (array_key_exists('done', $body)) {
                $todos[$index]['done'] = (bool) $body['done'];
            }

            write_todos($dataFile, $todos);
            send_json($todos[$index]);
        }
    }

    send_json(['message' => 'Task not found.'], 404);
}

if ($method === 'DELETE') {
    if (isset($_GET['completed']) && $_GET['completed'] === '1') {
        $todos = array_filter($todos, fn ($todo) => empty($todo['done']));
        write_todos($dataFile, $todos);
        send_json(['message' => 'Completed tasks removed.']);
    }

    $id = $_GET['id'] ?? '';

    if ($id === '') {
        send_json(['message' => 'Task id is required.'], 422);
    }

    $nextTodos = array_filter($todos, fn ($todo) => $todo['id'] !== $id);

    if (count($nextTodos) === count($todos)) {
        send_json(['message' => 'Task not found.'], 404);
    }

    write_todos($dataFile, $nextTodos);
    send_json(['message' => 'Task deleted.']);
}

send_json(['message' => 'Method not allowed.'], 405);
