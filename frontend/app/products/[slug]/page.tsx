"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Coffee, ShoppingCart, ArrowLeft, Minus, Plus, CheckCircle, ShieldCheck, Truck } from "lucide-react"
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
  description: string
  image: string | null
  image_url: string | null
  stock: number
  weight: number
  category: { id: number; name: string }
}

const formatPrice = (n: number) => "Rp " + n.toLocaleString("id-ID")

const resolveImage = (p: Product) => {
  if (p.image_url && p.image_url.includes("://")) return p.image_url
  if (p.image && /^https?:\/\//.test(p.image)) return p.image
  if (p.image && !p.image.startsWith("http")) return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${p.image.replace(/^\/?storage\//, "")}`
  return p.image || ""
}

function ProductDetailContent({ slug }: { slug: string }) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const triggerAnim = useCartAnimStore((s) => s.trigger)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    api.get(`/products/${slug}`).then(({ data }) => { if (!cancelled) setProduct(data.product || null) }).catch(() => { if (!cancelled) setProduct(null) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  const handleAddToCart = async (event: React.MouseEvent) => {
    if (!product) return
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    triggerAnim(product.name, rect.left + rect.width / 2, rect.top + rect.height / 2)
    await addItem(product.id, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = async () => {
    if (!product) return
    await addItem(product.id, qty)
    router.push("/cart")
  }

  if (loading) return <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-10 sm:px-6 lg:px-10"><div className="grid animate-pulse gap-10 md:grid-cols-2"><div className="aspect-square rounded-[2rem] bg-[#f0e5d8]" /><div className="space-y-4"><div className="h-5 w-1/3 rounded bg-[#f0e5d8]" /><div className="h-10 w-3/4 rounded bg-[#f0e5d8]" /><div className="h-7 w-1/4 rounded bg-[#f0e5d8]" /><div className="h-28 rounded bg-[#f0e5d8]" /></div></div></main>

  if (!product) return <main className="flex-1 px-4 py-24 text-center"><Coffee className="mx-auto mb-4 h-16 w-16 text-[#c79c73]" /><h2 className="mb-2 text-xl font-semibold text-[#4b2c1b]">Product not found</h2><Link href="/products" className="text-sm font-semibold text-[#8b572b] hover:underline">Back to products</Link></main>

  return (
    <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-8 sm:px-6 lg:px-10">
      <Link href="/products" className="mb-7 inline-flex items-center gap-1.5 text-sm text-[#806c5b] transition hover:text-[#4b2c1b]"><ArrowLeft className="h-4 w-4" /> Back to Products</Link>
      <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border border-[#eadfd2] bg-[#f4e8da] shadow-[0_18px_36px_rgba(78,43,19,0.08)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#d49a55]/20" /><div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-[#8b572b]/10" />
          {resolveImage(product) ? <img src={resolveImage(product)} alt={product.name} className="relative z-10 h-full w-full object-cover" /> : <Coffee className="relative z-10 h-32 w-32 text-[#8b572b]/55" />}
          <span className="absolute left-5 top-5 z-20 rounded-full bg-[#4a2919] px-3 py-1.5 text-xs font-bold text-white">Freshly selected</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
          <span className="inline-flex w-fit rounded-full bg-[#f1dfca] px-3 py-1.5 text-xs font-semibold text-[#6c421f]">{product.category.name}</span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-[-0.03em] text-[#392216] md:text-5xl">{product.name}</h1>
          <p className="mt-5 text-3xl font-extrabold text-[#6c421f]">{formatPrice(product.price)}</p>
          <div className="mt-4 flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} /><span className={`text-sm font-semibold ${product.stock > 0 ? "text-emerald-700" : "text-red-600"}`}>{product.stock > 0 ? `Stock: ${product.stock} available` : "Out of stock"}</span></div>
          <p className="mt-6 max-w-xl leading-7 text-[#6d5949]">{product.description || "No description available."}</p>
          <div className="mt-7 flex items-center gap-3"><span className="text-sm font-semibold text-[#4b2c1b]">Quantity</span><div className="inline-flex items-center overflow-hidden rounded-xl border border-[#ddcbb8] bg-white"><button onClick={() => setQty((value) => Math.max(1, value - 1))} disabled={qty <= 1} className="p-3 text-[#6c421f] hover:bg-[#fbf4eb] disabled:opacity-40"><Minus className="h-4 w-4" /></button><span className="w-12 text-center text-sm font-bold text-[#4b2c1b]">{qty}</span><button onClick={() => setQty((value) => Math.min(product.stock, value + 1))} disabled={qty >= product.stock} className="p-3 text-[#6c421f] hover:bg-[#fbf4eb] disabled:opacity-40"><Plus className="h-4 w-4" /></button></div></div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><button onClick={handleAddToCart} disabled={product.stock === 0} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8b572b] px-6 py-3.5 font-semibold text-white transition hover:bg-[#643818] disabled:opacity-50"><AnimatePresence mode="wait">{added ? <motion.span key="added" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Added!</motion.span> : <motion.span key="add" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Add to Cart</motion.span>}</AnimatePresence></button><button onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1 rounded-xl border border-[#9b693d] px-6 py-3.5 font-semibold text-[#6c421f] transition hover:bg-[#f4e8da] disabled:opacity-50">Buy Now</button></div>
          <div className="mt-8 grid gap-3 border-t border-[#eadfd2] pt-6 sm:grid-cols-2"><div className="flex items-center gap-2 text-sm text-[#806c5b]"><Truck size={18} className="text-[#8b572b]" /> Fast, trackable delivery</div><div className="flex items-center gap-2 text-sm text-[#806c5b]"><ShieldCheck size={18} className="text-[#8b572b]" /> Original coffee products</div></div>
        </motion.div>
      </div>
    </main>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  return <div className="flex min-h-screen flex-col bg-[#fbf6ef]"><Navbar /><ProductDetailContent key={slug} slug={slug} /><Footer /></div>
}
