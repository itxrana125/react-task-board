import { useEffect, useRef, useState } from 'react'

const COLUMNS = [
  { id: 'todo', title: 'To Do', accent: 'bg-sky-500', chip: 'bg-sky-100 text-sky-700' },
  { id: 'doing', title: 'Doing', accent: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700' },
  { id: 'done', title: 'Done', accent: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700' },
]

const STORAGE_KEY = 'react-task-board.tasks.v1'

const seedTasks = [
  { id: 't1', title: 'Sketch the board layout', column: 'done' },
  { id: 't2', title: 'Set up Vite + Tailwind', column: 'done' },
  { id: 't3', title: 'Add drag-and-drop between columns', column: 'doing' },
  { id: 't4', title: 'Write project README', column: 'todo' },
]

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // fall through to seed data
  }
  return seedTasks
}

const uid = () => 't' + Math.random().toString(36).slice(2, 9)

function TaskCard({ task, columnId, onEdit, onDelete, onMove, onDragStart, onDragEnd, dragging }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={
        'group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md ' +
        (dragging ? 'opacity-40' : 'cursor-grab active:cursor-grabbing')
      }
    >
      {task.editing ? (
        <EditForm task={task} onEdit={onEdit} />
      ) : (
        <>
          <p
            onDoubleClick={() => onEdit(task.id, true)}
            className="break-words text-sm font-medium text-slate-800"
          >
            {task.title}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {COLUMNS.map((c) => {
                if (c.id === columnId) return null
                return (
                  <button
                    key={c.id}
                    onClick={() => onMove(task.id, c.id)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    {c.title}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => onEdit(task.id, true)}
                aria-label="Edit task"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-sky-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(task.id)}
                aria-label="Delete task"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function EditForm({ task, onEdit }) {
  const [value, setValue] = useState(task.title)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const submit = () => {
    const trimmed = value.trim()
    if (trimmed) onEdit(task.id, false, trimmed)
    else onEdit(task.id, false)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onEdit(task.id, false)
        }}
        className="w-full rounded-lg border border-sky-300 px-2.5 py-1.5 text-sm text-slate-800 outline-none ring-2 ring-sky-100 focus:border-sky-500"
      />
      <p className="mt-1.5 text-[11px] text-slate-400">Enter to save · Esc to cancel</p>
    </form>
  )
}

function AddTaskForm({ columnId, onAdd }) {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-slate-200 py-2.5 text-sm font-medium text-slate-400 transition hover:border-indigo-300 hover:text-indigo-500"
      >
        + Add task
      </button>
    )
  }

  const submit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) {
      onAdd(trimmed, columnId)
      setValue('')
      setOpen(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <textarea
        autoFocus
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit(e)
          }
          if (e.key === 'Escape') {
            setValue('')
            setOpen(false)
          }
        }}
        placeholder="What needs to be done?"
        className="w-full resize-none rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
      <div className="mt-2 flex gap-2">
        <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
          Add
        </button>
        <button
          type="button"
          onClick={() => {
            setValue('')
            setOpen(false)
          }}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [draggingId, setDraggingId] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = (title, column) =>
    setTasks((prev) => [...prev, { id: uid(), title, column, editing: false }])

  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id))

  const moveTask = (id, column) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, column } : t)))

  const editTask = (id, editing, title) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, editing, ...(title !== undefined ? { title } : {}) } : t
      )
    )

  const clearDone = () => setTasks((prev) => prev.filter((t) => t.column !== 'done'))

  const onDragStart = (e, id) => {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const onDrop = (e, column) => {
    e.preventDefault()
    setDragOver(null)
    const id = e.dataTransfer.getData('text/plain')
    if (id) moveTask(id, column)
    setDraggingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/60 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              📋 Task Board
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Drag cards between columns, or use the buttons. Your board is saved in this browser.
            </p>
          </div>
          <button
            onClick={clearDone}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-red-200 hover:text-red-600"
          >
            Clear “Done”
          </button>
        </header>

        {/* Board */}
        <div className="grid gap-4 sm:grid-cols-3">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.column === col.id)
            const isOver = dragOver === col.id && draggingId !== null
            return (
              <section
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(col.id)
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null)
                }}
                onDrop={(e) => onDrop(e, col.id)}
                className={
                  'flex flex-col gap-3 rounded-2xl border bg-slate-50/80 p-3 transition ' +
                  (isOver
                    ? 'border-indigo-400 bg-indigo-50/80 ring-2 ring-indigo-200'
                    : 'border-slate-200')
                }
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={'h-2.5 w-2.5 rounded-full ' + col.accent} />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      {col.title}
                    </h2>
                  </div>
                  <span className={'rounded-full px-2 py-0.5 text-xs font-semibold ' + col.chip}>
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex min-h-24 flex-col gap-2">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      columnId={col.id}
                      dragging={draggingId === task.id}
                      onDragStart={onDragStart}
                      onDragEnd={() => {
                        setDraggingId(null)
                        setDragOver(null)
                      }}
                      onEdit={editTask}
                      onDelete={deleteTask}
                      onMove={moveTask}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="rounded-xl py-6 text-center text-xs text-slate-400">
                      Drop tasks here
                    </p>
                  )}
                </div>

                <AddTaskForm columnId={col.id} onAdd={addTask} />
              </section>
            )
          })}
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Tasks are stored in your browser’s local storage — nothing is sent anywhere.
        </footer>
      </div>
    </div>
  )
}
