"use client"
import { useEffect, useMemo, useState } from "react"
import api from "../services/api"
import Layout from "../components/Layout"
import { TodoStatus } from "../utils/types"
import { toast } from "react-toastify"
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Save,
  Loader2,
} from "lucide-react"

type Todo = {
  id: string
  title: string
  description?: string
  status: TodoStatus
  createdAt: string
  user?: { name?: string | null } | null
}

const Dashboard = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(8)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: TodoStatus.PENDING as TodoStatus,
  })

  const resetForm = () =>
    setForm({
      title: "",
      description: "",
      status: TodoStatus.PENDING,
    })

  const openCreateModal = () => {
    setEditingTodoId(null)
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (t: Todo) => {
    setEditingTodoId(t.id)
    setForm({
      title: t.title,
      description: t.description || "",
      status: t.status,
    })
    setIsModalOpen(true)
  }

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const query =
        `?page=${page}&limit=${limit}` +
        (statusFilter ? `&status=${statusFilter}` : "") +
        (searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "")
      const res = await api.get(`/todos/get-all${query}`)
      setTodos(res.data.data.todos)
      setTotalPages(res.data.data.meta?.totalPages || 1)
      setTotalItems(res.data.data.meta?.totalItems || 0)
    } catch (err: any) {
      console.error(err)
      if (err.response?.status === 401) {
        toast.error("❌ Unauthorized. Please login again.")
      } else {
        toast.error("Something went wrong. Try again later.")
      }
    } finally {
      setLoading(false)
    }
  }

  const createTodo = async () => {
    if (!form.title.trim() || form.title.trim().length < 3) {
      toast.error("Title কমপক্ষে ৩ অক্ষরের হতে হবে")
      return
    }
    setSaving(true)
    try {
      await api.post("/todos/create", {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        status: form.status, // যদি ব্যাকএন্ড স্ট্যাটাস না নেয়, এটা বাদ দিন
      })
      toast.success(" Todo created successfully!")
      setIsModalOpen(false)
      resetForm()
      // নতুন ডেটা প্রথম পেজেই দেখতে চাইলে page=1 করুন
      setPage(1)
      await fetchTodos()
    } catch (err) {
      console.error(err)
      toast.error("Failed to create todo.")
    } finally {
      setSaving(false)
    }
  }

  const updateTodo = async () => {
    if (!editingTodoId) return
    if (!form.title.trim() || form.title.trim().length < 3) {
      toast.error("Title কমপক্ষে ৩ অক্ষরের হতে হবে")
      return
    }
    setSaving(true)
    try {
      await api.put(`/todos/${editingTodoId}`, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
      })
      toast.success(" Todo updated successfully!")
      setIsModalOpen(false)
      resetForm()
      setEditingTodoId(null)
      await fetchTodos()
    } catch (err) {
      console.error(err)
      toast.error("Failed to update todo.")
    } finally {
      setSaving(false)
    }
  }

  const updateTodoStatus = async (todoId: string, newStatus: TodoStatus) => {
    try {
      await api.put(`/todos/${todoId}`, { status: newStatus })
      toast.success(" Todo status updated successfully!")
      fetchTodos()
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to update todo status.")
    }
  }

  const deleteTodo = async (todoId: string) => {
    if (!confirm("Are you sure you want to delete this todo?")) return
    try {
      await api.delete(`/todos/${todoId}`)
      toast.success(" Todo deleted successfully!")
      // Optimistic: remove locally to feel instant
      setTodos(prev => prev.filter(t => t.id !== todoId))
      // then sync counts
      fetchTodos()
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to delete todo.")
    }
  }

  // debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1)
      fetchTodos()
    }, 400)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  useEffect(() => {
    fetchTodos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter])

  const getStatusIcon = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.DONE:
        return <CheckCircle className="w-4 h-4" />
      case TodoStatus.PENDING:
        return <Clock className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusClasses = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.DONE:
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case TodoStatus.PENDING:
        return "bg-amber-50 text-amber-700 border-amber-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  const pageWindow = useMemo(() => {
    const maxButtons = 5
    const start = Math.max(1, Math.min(page - 2, totalPages - (maxButtons - 1)))
    return Array.from({ length: Math.min(maxButtons, totalPages) }, (_, i) => start + i)
  }, [page, totalPages])

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-black0 to-indigo-900 bg-clip-text text-transparent mb-2">
                  My Todos
                </h1>
                <p className="text-slate-600 text-lg">Manage your tasks efficiently • {totalItems} total items</p>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-black hover:from-black  text-white px-6 py-3 rounded font-semibold border border-gray-500 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Todo
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/70 backdrop-blur-sm rounded border  border-gray-400/40 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="w-full lg:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search todos by title/description…"
                    className="w-full pl-10 pr-4 py-3 rounded border border-slate-200 bg-white/80 focus:ring-2 focus:ring-black0 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-3">
                <Filter className="text-slate-500 w-5 h-5" />
                <select
                  className="border border-slate-200 rounded px-4 py-3 bg-white/80 focus:ring-2 focus:ring-black0 focus:border-transparent transition-all duration-200 min-w-[140px]"
                  value={statusFilter || ""}
                  onChange={(e) => {
                    setStatusFilter(e.target.value || undefined)
                    setPage(1)
                  }}
                >
                  <option value="">All Status</option>
                  {Object.values(TodoStatus).map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin w-10 h-10 text-black0" />
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No todos found</h3>
                <p className="text-slate-500">
                  {searchQuery || statusFilter
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first todo to get started"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="group bg-white/80 backdrop-blur-sm rounded border  border-gray-400/40 transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-black0 transition-colors line-clamp-2">
                          {todo.title}
                        </h3>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => openEditModal(todo)}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 rounded-lg transition-all duration-200"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {todo.description && (
                        <p className="text-slate-600 mb-4 line-clamp-3">{todo.description}</p>
                      )}

                      {/* Status + Quick Actions */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded border text-sm font-medium ${getStatusClasses(
                            todo.status
                          )}`}
                        >
                          {getStatusIcon(todo.status)}
                          {todo.status.charAt(0) + todo.status.slice(1).toLowerCase()}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Mark as Done */}
                          {todo.status !== TodoStatus.DONE && (
                            <button
                              onClick={() => updateTodoStatus(todo.id, TodoStatus.DONE)}
                              className="opacity-0 group-hover:opacity-100 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </button>
                          )}

                          {/* Mark as In Progress */}
                          {todo.status !== TodoStatus.IN_PROGRESS && (
                            <button
                              onClick={() => updateTodoStatus(todo.id, TodoStatus.IN_PROGRESS)}
                              className="opacity-0 group-hover:opacity-100 border border-blue-200 hover:bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              In Progress
                            </button>
                          )}

                          {/* Mark as Pending */}
                          {todo.status !== TodoStatus.PENDING && (
                            <button
                              onClick={() => updateTodoStatus(todo.id, TodoStatus.PENDING)}
                              className="opacity-0 group-hover:opacity-100 border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                            >
                              <Clock className="w-4 h-4" />
                              Pending
                            </button>
                          )}


                        </div>
                      </div>


                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <div className="w-6 h-6 bg-gradient-to-br from-black to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {todo.user?.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <span>{todo.user?.name || "Unknown User"}</span>
                          <span>•</span>
                          <span>{new Date(todo.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} results
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  disabled={page === 1 || loading}
                  onClick={() => setPage(1)}
                >
                  First
                </button>
                <button
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {pageWindow.map((p) => (
                    <button
                      key={p}
                      className={`px-3 py-2 rounded-lg transition-colors ${p === page ? "bg-black0 text-white" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  disabled={page === totalPages || loading}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </button>
                <button
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  disabled={page === totalPages || loading}
                  onClick={() => setPage(totalPages)}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => (!saving ? setIsModalOpen(false) : null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="text-xl font-semibold text-slate-800">
                  {editingTodoId ? "Edit Todo" : "Create Todo"}
                </h3>
                <button
                  disabled={saving}
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                    placeholder="Enter todo title"
                    className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-black0 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                    placeholder="Optional details…"
                    rows={4}
                    className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-black0 focus:border-transparent resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as TodoStatus }))}
                    className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-black0 focus:border-transparent bg-white"
                  >
                    {Object.values(TodoStatus).map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-5 border-t flex items-center justify-end gap-3">
                <button
                  disabled={saving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={editingTodoId ? updateTodo : createTodo}
                  className="px-5 py-2.5 rounded-lg bg-black hover:bg-black0 text-white font-medium inline-flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingTodoId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Dashboard
