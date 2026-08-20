"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Coffee, ShoppingCart, Search, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import api from "@/lib/api"
import { useCartStore } from "@/store/cart"
import { useCartAnimStore } from "@/store/cart-anim"

interface Product {
  id: number
  name: string
  slug: string
  price: number
  image: string | null
  image_url: string | null
  stock: number
  category: { id: number; name: string }
}

const formatPrice = (n: number) => "Rp " + n.toLocaleString("id-ID")

const resolveImage = (p: Product) => {
  if (p.image_url && p.image_url.includes("://")) return p.image_url
  if (p.image && /^https?:\/\//.test(p.image)) return p.image
  if (p.image && !p.image.startsWith("http")) return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${p.image.replace(/^\/?storage\//, "")}`
  return p.image || ""
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const triggerAnim = useCartAnimStore((s) => s.trigger)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [categoryId, setCategoryId] = useState(searchParams.get("category_id") || "")
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const urlSearch = searchParams.get("search") || ""
    const urlCategoryId = searchParams.get("category_id") || ""
    const urlPage = Number(searchParams.get("page")) || 1
    setSearch((value) => value === urlSearch ? value : urlSearch)
    setCategoryId((value) => value === urlCategoryId ? value : urlCategoryId)
    setPage((value) => value === urlPage ? value : urlPage)
  }, [searchParams])

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data)).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params: Record<string, string | number> = { per_page: 12, page }
    if (search) params.search = search
    if (categoryId) params.category_id = categoryId

    api.get("/products", { params }).then(({ data }) => {
      if (!cancelled) {
        setProducts(data.data || [])
        setTotalPages(data.meta?.last_page || 1)
      }
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoading(false)
    })

    const query = new URLSearchParams()
    if (search) query.set("search", search)
    if (categoryId) query.set("category_id", categoryId)
    if (page > 1) query.set("page", String(page))
    const queryString = query.toString()
    router.replace(`/products${queryString ? `?${queryString}` : ""}`, { scroll: false })

    return () => { cancelled = true }
  }, [search, categoryId, page, router])

  const handleAdd = (product: Product, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    triggerAnim(product.name, rect.left + rect.width / 2, rect.top + rect.height / 2)
    addItem(product.id, 1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fbf6ef]">
      <Navbar />
      <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-8 flex items-end justify-between">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9a5f2e]">Our collection</p><h1 className="mt-2 font-display text-3xl font-bold text-[#392216] sm:text-4xl">All Products</h1></div>
          <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#ddcbb8] px-3 py-2 text-sm text-[#68401f] hover:bg-white lg:hidden">
            {showFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />} Filter
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
          <aside className={`${showFilters ? "block" : "hidden"} mb-8 space-y-7 lg:block lg:mb-0`}>
            <div className="rounded-2xl border border-[#eadfd2] bg-white p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a806c]" />
                <input type="text" placeholder="Search products..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className="w-full rounded-xl border border-[#e3d5c6] bg-[#fffdf9] py-3 pl-9 pr-3 text-sm text-[#4b2c1b] outline-none focus:border-[#b87935] focus:ring-4 focus:ring-[#d49a55]/15" />
              </div>
            </div>
            <div className="rounded-2xl border border-[#eadfd2] bg-white p-4">
              <h3 className="mb-3 text-sm font-bold text-[#4b2c1b]">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => <button key={category.id} onClick={() => { setCategoryId(String(category.id) === categoryId ? "" : String(category.id)); setPage(1) }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${String(category.id) === categoryId ? "bg-[#f1dfca] font-semibold text-[#6c421f]" : "text-[#806c5b] hover:bg-[#fbf4eb]"}`}>{category.name}</button>)}
              </div>
            </div>
          </aside>

          <div>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => <div key={index} className="animate-pulse rounded-2xl border border-[#eadfd2] bg-white p-4"><div className="mb-3 aspect-square rounded-xl bg-[#f0e5d8]" /><div className="mb-2 h-4 w-3/4 rounded bg-[#f0e5d8]" /><div className="mb-3 h-3 w-1/2 rounded bg-[#f0e5d8]" /><div className="h-9 w-full rounded bg-[#f0e5d8]" /></div>)}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-[#eadfd2] bg-white py-24 text-center"><Coffee className="mx-auto mb-4 h-16 w-16 text-[#c79c73]" /><h3 className="mb-1 text-lg font-semibold text-[#4b2c1b]">No products found</h3><p className="mb-4 text-[#806c5b]">{search || categoryId ? "Try changing keywords or category filter." : "No products available at the moment."}</p>{(search || categoryId) && <button onClick={() => { setSearch(""); setCategoryId(""); setPage(1) }} className="text-sm font-semibold text-[#8b572b] hover:underline">Reset filter</button>}</div>
            ) : (
              <motion.div key={`${page}-${categoryId}-${search}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {products.map((product) => <motion.div key={product.id} layout className="group overflow-hidden rounded-2xl border border-[#eadfd2] bg-white transition hover:-translate-y-1 hover:border-[#c58a4e] hover:shadow-[0_18px_28px_rgba(78,43,19,0.1)]"><Link href={`/products/${product.slug}`}><div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#f6eee4]"><span className="absolute left-3 top-3 z-10 rounded-full bg-[#4a2919] px-2.5 py-1 text-[10px] font-bold text-[#fff9f1]">Fresh pick</span>{resolveImage(product) ? <img src={resolveImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <Coffee className="h-14 w-14 text-[#9f8068] transition group-hover:scale-110 group-hover:text-[#8b572b]" />}</div></Link><div className="p-4"><Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-semibold leading-5 text-[#4b2c1b] transition-colors hover:text-[#a8662f]">{product.name}</Link><p className="mt-1 text-xs text-[#9a806c]">{product.category.name}</p><p className="mt-2 text-sm font-bold text-[#6c421f]">{formatPrice(product.price)}</p><button onClick={(event) => handleAdd(product, event)} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#8b572b] px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#643818]"><ShoppingCart className="h-3.5 w-3.5" /> Add to Cart</button></div></motion.div>)}
              </motion.div>
            )}

            {totalPages > 1 && <div className="mt-10 flex items-center justify-center gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#ddcbb8] text-[#6c421f] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).filter((value) => value === 1 || value === totalPages || Math.abs(value - page) <= 1).map((value, index, values) => <div key={value} className="flex items-center gap-2">{index > 0 && values[index - 1] !== value - 1 && <span className="text-[#a1846e]">...</span>}<button onClick={() => setPage(value)} className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${value === page ? "bg-[#8b572b] text-white" : "border border-[#ddcbb8] text-[#6c421f] hover:bg-white"}`}>{value}</button></div>)}<button disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#ddcbb8] text-[#6c421f] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#fbf6ef]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d49a55] border-t-transparent" /></div>}><ProductsContent /></Suspense>
}
