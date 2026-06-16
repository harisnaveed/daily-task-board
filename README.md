# Daily Task Board

Daily Task Board is a React and PHP task management app built for learning how a frontend can communicate with backend APIs. The project includes the same task board connected in two different ways:

- REST API with `api/todo.php`
- GraphQL-style API with `api/todo-graphql.php`

Both APIs use the same JSON data file, so you can switch between REST and GraphQL while working with the same tasks.

## Features

- Add new tasks
- Edit existing tasks
- Delete tasks
- Mark tasks as done or active
- Clear completed tasks
- Search tasks
- Filter tasks by all, active, or done
- Progress stats for total, active, and completed tasks
- REST and GraphQL examples side by side
- PHP backend using a simple JSON file as storage

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Lucide React icons
- JavaScript

### Backend

- PHP
- REST API
- GraphQL-style API
- JSON file storage
- XAMPP Apache server

## Project Structure

```txt
daily-task-board/
  api/
    todo.php
    todo-graphql.php
    todos.json

  src/
    components/
      GraphQL.jsx
      Rest.jsx
      TodoBoard.jsx
    App.jsx
    index.css
    main.jsx

  package.json
  vite.config.js
  README.md
```

## How The App Works

React runs with Vite:

```txt
http://127.0.0.1:5173
```

PHP runs through XAMPP Apache:

```txt
http://localhost/React/todo-chatgpt/api
```

The React app sends requests to the PHP API. PHP reads and writes data in:

```txt
api/todos.json
```

## Requirements

Install these before running the project:

- Node.js
- npm
- XAMPP
- PHP, included with XAMPP

## How To Run On Your Machine

### 1. Put The Project Inside XAMPP

This project should be inside your XAMPP `htdocs` folder.

Current expected path:

```txt
C:\xampp\htdocs\React\todo-chatgpt
```

The API URLs in React currently point to:

```txt
http://localhost/React/todo-chatgpt/api/todo.php
http://localhost/React/todo-chatgpt/api/todo-graphql.php
```

If you rename or move the folder, update the API URLs in:

```txt
src/components/Rest.jsx
src/components/GraphQL.jsx
```

### 2. Start Apache

Open XAMPP Control Panel and start:

```txt
Apache
```

Then check the REST API in your browser:

```txt
http://localhost/React/todo-chatgpt/api/todo.php
```

You should see JSON data from `todos.json`.

### 3. Install Frontend Dependencies

From the project folder, run:

```bash
npm install
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```bash
npm.cmd install
```

### 4. Run React With Vite

```bash
npm run dev
```

Or on Windows:

```bash
npm.cmd run dev
```

Open the Vite URL:

```txt
http://127.0.0.1:5173
```

## Switching Between REST And GraphQL

The switch is handled in:

```txt
src/App.jsx
```

Use REST:

```jsx
const ActiveTodo = todoExamples.rest
// const ActiveTodo = todoExamples.graphql
```

Use GraphQL:

```jsx
// const ActiveTodo = todoExamples.rest
const ActiveTodo = todoExamples.graphql
```

Both components render the same UI through `TodoBoard.jsx`. Only the API logic changes.

## REST API

REST API file:

```txt
api/todo.php
```

REST data file:

```txt
api/todos.json
```

Base URL:

```txt
http://localhost/React/todo-chatgpt/api/todo.php
```

### REST Endpoints

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/api/todo.php` | Get all tasks |
| `POST` | `/api/todo.php` | Add a new task |
| `PUT` | `/api/todo.php` | Update a task title or done status |
| `DELETE` | `/api/todo.php?id=TASK_ID` | Delete one task |
| `DELETE` | `/api/todo.php?completed=1` | Clear completed tasks |

### REST Examples

Get all tasks:

```js
fetch('http://localhost/React/todo-chatgpt/api/todo.php')
```

Add a task:

```js
fetch('http://localhost/React/todo-chatgpt/api/todo.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Plan today work',
  }),
})
```

Update a task:

```js
fetch('http://localhost/React/todo-chatgpt/api/todo.php', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 'starter-1',
    title: 'Updated task title',
    done: true,
  }),
})
```

Delete a task:

```js
fetch('http://localhost/React/todo-chatgpt/api/todo.php?id=starter-1', {
  method: 'DELETE',
})
```

Clear completed tasks:

```js
fetch('http://localhost/React/todo-chatgpt/api/todo.php?completed=1', {
  method: 'DELETE',
})
```

## GraphQL API

GraphQL API file:

```txt
api/todo-graphql.php
```

GraphQL data file:

```txt
api/todos.json
```

Base URL:

```txt
http://localhost/React/todo-chatgpt/api/todo-graphql.php
```

This project uses a simple GraphQL-style PHP endpoint for learning purposes. It accepts GraphQL query strings and variables, then maps operation names to PHP logic. It does not require Composer or a GraphQL package.

### GraphQL Operations

| Operation | Type | Description |
| --- | --- | --- |
| `Todos` | Query | Get all tasks |
| `AddTodo` | Mutation | Add a new task |
| `UpdateTodo` | Mutation | Update task title or done status |
| `DeleteTodo` | Mutation | Delete one task |
| `ClearCompleted` | Mutation | Clear completed tasks |

### GraphQL Examples

Get all tasks:

```js
fetch('http://localhost/React/todo-chatgpt/api/todo-graphql.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    operationName: 'Todos',
    query: `
      query Todos {
        todos {
          id
          title
          done
          createdAt
        }
      }
    `,
    variables: {},
  }),
})
```

Add a task:

```js
fetch('http://localhost/React/todo-chatgpt/api/todo-graphql.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    operationName: 'AddTodo',
    query: `
      mutation AddTodo($title: String!) {
        addTodo(title: $title) {
          id
          title
          done
          createdAt
        }
      }
    `,
    variables: {
      title: 'Prepare daily plan',
    },
  }),
})
```

Update a task:

```js
fetch('http://localhost/React/todo-chatgpt/api/todo-graphql.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    operationName: 'UpdateTodo',
    query: `
      mutation UpdateTodo($id: ID!, $title: String, $done: Boolean) {
        updateTodo(id: $id, title: $title, done: $done) {
          id
          title
          done
          createdAt
        }
      }
    `,
    variables: {
      id: 'starter-1',
      title: 'Updated task title',
      done: true,
    },
  }),
})
```

Delete a task:

```js
fetch('http://localhost/React/todo-chatgpt/api/todo-graphql.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    operationName: 'DeleteTodo',
    query: `
      mutation DeleteTodo($id: ID!) {
        deleteTodo(id: $id)
      }
    `,
    variables: {
      id: 'starter-1',
    },
  }),
})
```

Clear completed tasks:

```js
fetch('http://localhost/React/todo-chatgpt/api/todo-graphql.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    operationName: 'ClearCompleted',
    query: `
      mutation ClearCompleted {
        clearCompleted
      }
    `,
    variables: {},
  }),
})
```

## Important Files

```txt
src/components/TodoBoard.jsx
```

Shared task board UI used by both REST and GraphQL examples.

```txt
src/components/Rest.jsx
```

REST fetch logic.

```txt
src/components/GraphQL.jsx
```

GraphQL fetch logic.

```txt
api/todo.php
```

PHP REST API.

```txt
api/todo-graphql.php
```

PHP GraphQL-style API.

```txt
api/todos.json
```

Simple JSON storage file used by both APIs.

## Available Scripts

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

Preview production build:

```bash
npm run preview
```

## Notes

- This project stores data in `api/todos.json`.
- This is good for learning API concepts.
- For a real production project, replace JSON storage with a database such as MySQL.
- If the React app cannot load data, make sure Apache is running in XAMPP.
- If you rename the project folder, update the API URLs in `Rest.jsx` and `GraphQL.jsx`.
