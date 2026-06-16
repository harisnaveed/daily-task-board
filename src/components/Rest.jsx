import TodoBoard from './TodoBoard'

const API_URL = 'http://localhost/React/todo-chatgpt/api/todo.php'

async function restRequest(url = '', options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong with the REST API.')
  }

  return data
}

function Rest() {
  return (
    <TodoBoard
      apiName="REST API"
      loadTasks={() => restRequest()}
      createTask={(title, taskDate) =>
        restRequest('', {
          method: 'POST',
          body: JSON.stringify({ title, createdAt: taskDate }),
        })
      }
      updateTask={(id, changes) =>
        restRequest('', {
          method: 'PUT',
          body: JSON.stringify({ id, ...changes }),
        })
      }
      removeTask={(id) =>
        restRequest(`?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        })
      }
      clearDoneTasks={() =>
        restRequest('?completed=1', {
          method: 'DELETE',
        })
      }
    />
  )
}

export default Rest
