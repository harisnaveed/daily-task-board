import TodoBoard from "./TodoBoard";

const API_URL = "http://localhost/React/daily-task-board/api/todo-graphql.php";

async function graphqlRequest(query, variables = {}, operationName = "") {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables, operationName }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.message || "GraphQL request failed.");
  }

  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

function GraphQL() {
  return (
    <TodoBoard
      apiName="GraphQL API"
      loadTasks={async () => {
        const data = await graphqlRequest(
          `
            query Todos {
              todos {
                id
                title
                done
                createdAt
              }
            }
          `,
          {},
          "Todos",
        );

        return data.todos;
      }}
      createTask={async (title, taskDate) => {
        const data = await graphqlRequest(
          `
            mutation AddTodo($title: String!, $createdAt: String) {
              addTodo(title: $title, createdAt: $createdAt) {
                id
                title
                done
                createdAt
              }
            }
          `,
          { title, createdAt: taskDate },
          "AddTodo",
        );

        return data.addTodo;
      }}
      updateTask={async (id, changes) => {
        const data = await graphqlRequest(
          `
            mutation UpdateTodo($id: ID!, $title: String, $done: Boolean) {
              updateTodo(id: $id, title: $title, done: $done) {
                id
                title
                done
                createdAt
              }
            }
          `,
          { id, ...changes },
          "UpdateTodo",
        );

        return data.updateTodo;
      }}
      removeTask={async (id) => {
        const data = await graphqlRequest(
          `
            mutation DeleteTodo($id: ID!) {
              deleteTodo(id: $id)
            }
          `,
          { id },
          "DeleteTodo",
        );

        return data.deleteTodo;
      }}
      clearDoneTasks={async () => {
        const data = await graphqlRequest(
          `
            mutation ClearCompleted {
              clearCompleted
            }
          `,
          {},
          "ClearCompleted",
        );

        return data.clearCompleted;
      }}
    />
  );
}

export default GraphQL;
