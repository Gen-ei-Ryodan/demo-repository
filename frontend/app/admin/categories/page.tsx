"use client"
export const dynamic = 'force-dynamic'


import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit2, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { SlideOver } from "@/components/ui/slide-over"
import { useToast } from "@/components/ui/toast"

interface Category {
  id: number
  name: string
  slug: string
  products_count: number
}

export default function AdminCategories() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/admin/categories")
      setCategories(data.data || data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "" })
    setError(null)
    setPanelOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name })
    setError(null)
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setEditing(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, form)
        toast("success", "Kategori diperbarui", form.name)
      } else {
        await api.post("/admin/categories", form)
        toast("success", "Kategori ditambahkan", form.name)
      }
      closePanel()
      fetchCategories()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save category")
      toast("error", "Gagal menyimpan kategori", err.response?.data?.message || "Terjadi kesalahan")
    }
    setSaving(false)
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return
    try {
      await api.delete(`/admin/categories/${cat.id}`)
      setCategories((prev) => prev.filter((c) => c.id !== cat.id))
      toast("success", "Kategori dihapus", cat.name)
    } catch (err: any) {
      toast("error", "Gagal menghapus kategori", err.response?.data?.message || "Data masih dipakai produk lain")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="mt-1 text-sm text-gray-500">
            {categories.length} total categories
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left text-sm font-medium text-gray-500">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Products</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat, i) => (
              <motion.tr
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="text-sm text-gray-700 hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                <td className="px-6 py-4">{cat.products_count}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No categories yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over Create/Edit */}
      <SlideOver
        open={panelOpen}
        onClose={closePanel}
        title={editing ? "Edit Category" : "Add Category"}
        subtitle={editing ? `Update — ${editing.name}` : "Create a new category"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              required
              autoFocus
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
            <button
              type="button"
              onClick={closePanel}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}