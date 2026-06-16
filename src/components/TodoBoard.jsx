import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  ListChecks,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

const filters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'done', label: 'Done' },
]

function TodoBoard({
  apiName,
  loadTasks,
  createTask,
  updateTask,
  removeTask,
  clearDoneTasks,
}) {
  const [tasks, setTasks] = useState([])
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    async function fetchTasks() {
      try {
        setIsLoading(true)
        setApiError('')
        setTasks(await loadTasks())
      } catch (error) {
        setApiError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [loadTasks])

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.done).length
    const total = tasks.length
    const active = total - completed
    const progress = total ? Math.round((completed / total) * 100) : 0

    return { active, completed, progress, total }
  }, [tasks])

  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'active') return !task.done
        if (filter === 'done') return task.done
        return true
      })
      .filter((task) => task.title.toLowerCase().includes(query.toLowerCase()))
  }, [filter, query, tasks])

  async function addTask(event) {
    event.preventDefault()

    if (!draft.trim()) return

    try {
      setIsSaving(true)
      setApiError('')
      const newTask = await createTask(draft)

      setTasks((currentTasks) => [newTask, ...currentTasks])
      setDraft('')
    } catch (error) {
      setApiError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function toggleTask(task) {
    try {
      setApiError('')
      const updatedTask = await updateTask(task.id, { done: !task.done })

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask,
        ),
      )
    } catch (error) {
      setApiError(error.message)
    }
  }

  async function deleteTask(taskId) {
    try {
      setApiError('')
      await removeTask(taskId)

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))

      if (editingId === taskId) {
        cancelEdit()
      }
    } catch (error) {
      setApiError(error.message)
    }
  }

  function startEdit(task) {
    setEditingId(task.id)
    setEditingTitle(task.title)
  }

  async function saveEdit(taskId) {
    const nextTitle = editingTitle.trim()

    if (!nextTitle) {
      deleteTask(taskId)
      return
    }

    try {
      setApiError('')
      const updatedTask = await updateTask(taskId, { title: nextTitle })

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      )
      cancelEdit()
    } catch (error) {
      setApiError(error.message)
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingTitle('')
  }

  async function clearCompleted() {
    try {
      setApiError('')
      await clearDoneTasks()

      setTasks((currentTasks) => currentTasks.filter((task) => !task.done))
    } catch (error) {
      setApiError(error.message)
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl content-center gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="rounded-lg border border-stone-200/80 bg-white/78 p-5 shadow-[0_24px_80px_rgba(20,40,32,0.12)] backdrop-blur md:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white shadow-lg shadow-teal-700/20">
              <ListChecks aria-hidden="true" size={24} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
                Focus Board
              </p>
              <h1 className="text-3xl font-bold leading-tight text-stone-950 sm:text-4xl">
                Today&apos;s Tasks
              </h1>
            </div>
          </div>

          <div className="mt-5 inline-flex rounded-lg border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-bold text-teal-800">
            {apiName}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="text-sm text-stone-500">Total</p>
              <p className="mt-1 text-2xl font-bold text-stone-950">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-700">Active</p>
              <p className="mt-1 text-2xl font-bold text-amber-900">{stats.active}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm text-emerald-700">Done</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">
                {stats.completed}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                <Sparkles aria-hidden="true" size={17} />
                Progress
              </div>
              <span className="text-sm font-bold text-stone-950">{stats.progress}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-400 transition-all duration-500"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-stone-600">
            <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3">
              <CalendarDays aria-hidden="true" className="text-teal-700" size={18} />
              <span>
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'full',
                }).format(new Date())}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3">
              <Clock3 aria-hidden="true" className="text-amber-600" size={18} />
              <span>{stats.active ? `${stats.active} open items` : 'All clear'}</span>
            </div>
          </div>
        </aside>

        <section className="rounded-lg border border-stone-200/80 bg-white/86 p-4 shadow-[0_24px_80px_rgba(20,40,32,0.12)] backdrop-blur sm:p-5 md:p-6">
          <form onSubmit={addTask} className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="new-task">
              New task
            </label>
            <input
              id="new-task"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a task"
              className="min-h-12 flex-1 rounded-lg border border-stone-300 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/12"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-stone-950 px-5 font-semibold text-white shadow-lg shadow-stone-950/15 transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-700/18 disabled:opacity-60"
            >
              <Plus aria-hidden="true" size={19} />
              {isSaving ? 'Adding' : 'Add'}
            </button>
          </form>

          {apiError ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {apiError}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative min-h-11 flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                size={18}
              />
              <label className="sr-only" htmlFor="search-tasks">
                Search tasks
              </label>
              <input
                id="search-tasks"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="min-h-11 w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-10 pr-3 text-sm text-stone-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/12"
              />
            </div>

            <div className="grid min-h-11 grid-cols-3 rounded-lg border border-stone-200 bg-stone-100 p-1">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    filter === item.id
                      ? 'bg-white text-teal-800 shadow-sm'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {isLoading ? (
              <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-12 text-center">
                <p className="font-semibold text-stone-900">Loading tasks...</p>
              </div>
            ) : visibleTasks.length ? (
              visibleTasks.map((task) => {
                const isEditing = editingId === task.id

                return (
                  <article
                    key={task.id}
                    className={`rounded-lg border p-3 transition ${
                      task.done
                        ? 'border-emerald-200 bg-emerald-50/80'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                      <button
                        type="button"
                        onClick={() => toggleTask(task)}
                        title={task.done ? 'Mark active' : 'Mark done'}
                        aria-label={task.done ? 'Mark active' : 'Mark done'}
                        className={`flex h-11 w-11 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-4 ${
                          task.done
                            ? 'border-emerald-300 bg-emerald-600 text-white focus:ring-emerald-600/18'
                            : 'border-stone-300 bg-stone-50 text-stone-500 hover:border-teal-600 hover:text-teal-700 focus:ring-teal-600/12'
                        }`}
                      >
                        {task.done ? (
                          <CheckCircle2 aria-hidden="true" size={22} />
                        ) : (
                          <Circle aria-hidden="true" size={22} />
                        )}
                      </button>

                      <div className="min-w-0">
                        {isEditing ? (
                          <>
                            <label className="sr-only" htmlFor={`edit-${task.id}`}>
                              Edit task
                            </label>
                            <input
                              id={`edit-${task.id}`}
                              value={editingTitle}
                              onChange={(event) => setEditingTitle(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') saveEdit(task.id)
                                if (event.key === 'Escape') cancelEdit()
                              }}
                              className="min-h-11 w-full rounded-lg border border-teal-600 bg-white px-3 text-base font-semibold text-stone-950 outline-none ring-4 ring-teal-600/12"
                              autoFocus
                            />
                          </>
                        ) : (
                          <p
                            className={`break-words text-base font-semibold ${
                              task.done
                                ? 'text-emerald-950 line-through decoration-emerald-700/55 decoration-2'
                                : 'text-stone-950'
                            }`}
                          >
                            {task.title}
                          </p>
                        )}
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-stone-400">
                          {task.done ? 'Completed' : 'Open'}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-none sm:grid-flow-col">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(task.id)}
                              title="Save"
                              aria-label="Save"
                              className="flex h-10 w-full items-center justify-center rounded-lg bg-teal-700 text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-700/18 sm:w-10"
                            >
                              <Save aria-hidden="true" size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              title="Cancel"
                              aria-label="Cancel"
                              className="flex h-10 w-full items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-600 transition hover:text-stone-950 focus:outline-none focus:ring-4 focus:ring-stone-400/18 sm:w-10"
                            >
                              <X aria-hidden="true" size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(task)}
                            title="Edit"
                            aria-label="Edit"
                            className="flex h-10 w-full items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-600 transition hover:border-teal-500 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-600/12 sm:w-10"
                          >
                            <Pencil aria-hidden="true" size={18} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          title="Delete"
                          aria-label="Delete"
                          className="flex h-10 w-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-500/12 sm:w-10"
                        >
                          <Trash2 aria-hidden="true" size={18} />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm">
                  <Check aria-hidden="true" size={22} />
                </div>
                <p className="mt-3 font-semibold text-stone-900">No tasks here</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-500">
              {stats.active ? `${stats.active} remaining` : 'Nothing remaining'}
            </p>
            <button
              type="button"
              onClick={clearCompleted}
              disabled={!stats.completed}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-45"
            >
              <Trash2 aria-hidden="true" size={16} />
              Clear done
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default TodoBoard
