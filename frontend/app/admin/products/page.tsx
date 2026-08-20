"use client"
export const dynamic = 'force-dynamic'


import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Upload } from "lucide-react"
import api from "@/lib/api"
import { SlideOver } from "@/components/ui/slide-over"
import { useToast } from "@/components/ui/toast"

interface Product {
  id: number
  name: string
  slug: string
  price: number
  stock: number
  weight: number
  description?: string
  image: string | null
  image_url?: string | null
  is_active: boolean
  category: { id: number; name: string } | null
  category_id?: number
}

interface Category {
  id: number
  name: string
}

interface Meta {
  current_page: number
  last_page: number
  total: number
}

const formatPrice = (n: number) => "Rp " + n.toLocaleString("id-ID")

const resolveImage = (p: { image?: string | null; image_url?: string | null }) => {
  if (p.image_url && typeof p.image_url === "string" && p.image_url.includes("://")) return p.image_url
  if (p.image && /^https?:\/\//.test(p.image)) return p.image
  if (p.image && !p.image.startsWith("http")) return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${p.image.replace(/^\/?storage\//, "")}`
  return p.image || ""
}

const emptyForm = {
  name: "",
  category_id: "",
  description: "",
  price: "",
  stock: "",
  weight: "",
  is_active: true,
}

export default function AdminProducts() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [page, setPage] = useState(1)
  const [toggling, setToggling] = useState<number | null>(null)

  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page }
      if (search) params.search = search
      if (categoryFilter) params.category_id = categoryFilter

      const { data } = await api.get("/admin/products", { params })
      setProducts(data.data)
      setMeta(data.meta || { current_page: 1, last_page: 1, total: data.data?.length || 0 })
    } catch {}
    setLoading(false)
  }, [page, search, categoryFilter])

  useEffect(() => {
    api.get("/admin/categories").then(({ data }) => {
      setCategories(data.data || data || [])
    })
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setImage(null)
    setPreview(null)
    setPanelOpen(true)
  }

  const openEdit = async (product: Product) => {
    setEditing(product)
    setForm({
      name: product.name || "",
      category_id: product.category_id?.toString() || product.category?.id?.toString() || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      weight: product.weight?.toString() || "",
      is_active: product.is_active ?? true,
    })
    setImage(null)
    setPreview(null)
    setPanelOpen(true)
    if (!product.description) {
      try {
        const { data } = await api.get(`/admin/products/${product.id}`)
        const p = data.data || data
        if (p) {
          setForm((f) => ({
            ...f,
            description: p.description || f.description,
          }))
          if (p.image_url && typeof p.image_url === "string" && p.image_url.includes("://")) {
            if (!preview) setPreview(p.image_url)
          } else if (p.image && !preview) {
            setPreview(resolveImage(p as Product))
          }
        }
      } catch {}
    } else if (product.image_url) {
      setPreview(resolveImage(product))
    }
  }

  const closePanel = () => setPanelOpen(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = new FormData()
      payload.append("name", form.name)
      payload.append("category_id", form.category_id)
      payload.append("description", form.description)
      payload.append("price", form.price)
      payload.append("stock", form.stock)
      payload.append("weight", form.weight)
      payload.append("is_active", form.is_active ? "1" : "0")
      if (image) payload.append("image", image)

      if (editing) {
        payload.append("_method", "PUT")
        await api.post(`/admin/products/${editing.id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        toast("success", "Produk berhasil diperbarui", form.name)
      } else {
        await api.post("/admin/products", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        toast("success", "Produk berhasil ditambahkan", form.name)
      }
      closePanel()
      fetchProducts()
    } catch (err: any) {
      toast("error", "Gagal menyimpan produk", err.response?.data?.message || "Terjadi kesalahan")
    }
    setSaving(false)
  }

  const toggleActive = async (product: Product) => {
    setToggling(product.id)
    try {
      await api.put(`/admin/products/${product.id}`, { is_active: !product.is_active })
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      )
      toast("success", !product.is_active ? "Produk diaktifkan" : "Produk dinonaktifkan", product.name)
    } catch {
      toast("error", "Gagal mengubah status produk")
    }
    setToggling(null)
  }

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Hapus produk "${product.name}"?`)) return
    try {
      await api.delete(`/admin/products/${product.id}`)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
      toast("success", "Produk dihapus", product.name)
    } catch (err: any) {
      toast("error", "Gagal menghapus produk", err.response?.data?.message || "Terjadi kesalahan")
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="mt-1 text-sm text-gray-500">
            {meta ? `${meta.total} total products` : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm font-medium text-gray-500">
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="text-sm text-gray-700 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    {resolveImage(product) ? (
                      <img
                        src={resolveImage(product)}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4">{product.category?.name || "-"}</td>
                  <td className="px-6 py-4">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        product.stock < 10 ? "text-red-600 font-semibold" : ""
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      disabled={toggling === product.id}
                      onClick={() => toggleActive(product)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        product.is_active ? "bg-green-500" : "bg-gray-300"
                      } ${toggling === product.id ? "opacity-50" : ""}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                          product.is_active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
            <p className="text-sm text-gray-500">
              Page {meta.current_page} of {meta.last_page}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    p === meta.current_page
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Create/Edit */}
      <SlideOver
        open={panelOpen}
        onClose={closePanel}
        title={editing ? "Edit Product" : "Add New Product"}
        subtitle={editing ? `Update product — ${editing.name}` : "Add a new product to your store"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required className={inputClass}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={inputClass} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (g)</label>
              <input type="number" name="weight" value={form.weight} onChange={handleChange} required min="0" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-primary hover:bg-gray-50 transition-colors">
              {preview ? (
                <img src={preview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload image</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              id="is_active"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active (visible to customers)
            </label>
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
              {saving ? "Saving..." : editing ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}