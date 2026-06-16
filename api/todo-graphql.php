<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . '/todos.json';

function send_graphql($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function send_graphql_error($message, $status = 200)
{
    send_graphql([
        'data' => null,
        'errors' => [
            ['message' => $message],
        ],
    ], $status);
}

function read_todos_graphql($dataFile)
{
    if (!file_exists($dataFile)) {
        return [];
    }

    $contents = file_get_contents($dataFile);
    $todos = json_decode($contents, true);

    return is_array($todos) ? $todos : [];
}

function write_todos_graphql($dataFile, $todos)
{
    $json = json_encode(array_values($todos), JSON_PRETTY_PRINT);

    if (file_put_contents($dataFile, $json, LOCK_EX) === false) {
        send_graphql_error('Could not save todos.', 500);
    }
}

function operation_from_request($body)
{
    $operationName = $body['operationName'] ?? '';
    $query = $body['query'] ?? '';

    if ($operationName !== '') {
        return $operationName;
    }

    if (stripos($query, 'clearCompleted') !== false) return 'ClearCompleted';
    if (stripos($query, 'deleteTodo') !== false) return 'DeleteTodo';
    if (stripos($query, 'updateTodo') !== false) return 'UpdateTodo';
    if (stripos($query, 'addTodo') !== false) return 'AddTodo';
    if (stripos($query, 'todos') !== false) return 'Todos';

    return '';
}

function require_variable($variables, $name)
{
    if (!array_key_exists($name, $variables) || $variables[$name] === '') {
        send_graphql_error("Variable \"$name\" is required.");
    }

    return $variables[$name];
}

function normalize_created_at_graphql($createdAt)
{
    if (!is_string($createdAt) || trim($createdAt) === '') {
        return gmdate('c');
    }

    $createdAt = trim($createdAt);

    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $createdAt)) {
        return $createdAt . 'T12:00:00';
    }

    if (strtotime($createdAt) === false) {
        send_graphql_error('Task date is invalid.');
    }

    return $createdAt;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_graphql_error('GraphQL endpoint accepts POST requests only.', 405);
}

$body = json_decode(file_get_contents('php://input'), true);

if (!is_array($body)) {
    send_graphql_error('Request body must be valid JSON.', 400);
}

$variables = is_array($body['variables'] ?? null) ? $body['variables'] : [];
$operation = operation_from_request($body);
$todos = read_todos_graphql($dataFile);

if ($operation === 'Todos') {
    send_graphql([
        'data' => [
            'todos' => $todos,
        ],
    ]);
}

if ($operation === 'AddTodo') {
    $title = trim(require_variable($variables, 'title'));

    if ($title === '') {
        send_graphql_error('Task title is required.');
    }

    $todo = [
        'id' => uniqid('todo_', true),
        'title' => $title,
        'done' => false,
        'createdAt' => normalize_created_at_graphql($variables['createdAt'] ?? ''),
    ];

    array_unshift($todos, $todo);
    write_todos_graphql($dataFile, $todos);

    send_graphql([
        'data' => [
            'addTodo' => $todo,
        ],
    ]);
}

if ($operation === 'UpdateTodo') {
    $id = require_variable($variables, 'id');

    foreach ($todos as $index => $todo) {
        if ($todo['id'] === $id) {
            if (array_key_exists('title', $variables) && $variables['title'] !== null) {
                $title = trim($variables['title']);

                if ($title === '') {
                    send_graphql_error('Task title cannot be empty.');
                }

                $todos[$index]['title'] = $title;
            }

            if (array_key_exists('done', $variables) && $variables['done'] !== null) {
                $todos[$index]['done'] = (bool) $variables['done'];
            }

            write_todos_graphql($dataFile, $todos);

            send_graphql([
                'data' => [
                    'updateTodo' => $todos[$index],
                ],
            ]);
        }
    }

    send_graphql_error('Task not found.');
}

if ($operation === 'DeleteTodo') {
    $id = require_variable($variables, 'id');
    $nextTodos = array_filter($todos, fn ($todo) => $todo['id'] !== $id);

    if (count($nextTodos) === count($todos)) {
        send_graphql_error('Task not found.');
    }

    write_todos_graphql($dataFile, $nextTodos);

    send_graphql([
        'data' => [
            'deleteTodo' => true,
        ],
    ]);
}

if ($operation === 'ClearCompleted') {
    $todos = array_filter($todos, fn ($todo) => empty($todo['done']));
    write_todos_graphql($dataFile, $todos);

    send_graphql([
        'data' => [
            'clearCompleted' => true,
        ],
    ]);
}

send_graphql_error('Unknown GraphQL operation.');
