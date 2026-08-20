"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Bean, ChefHat, Coffee, CupSoda, Headphones, Package, ShieldCheck, ShoppingCart, Sparkles, Star, Truck } from "lucide-react"
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
  stock: number
  image?: string | null
  image_url?: string | null
  category: { id: number; name: string }
}

const formatPrice = (n: number) => "Rp " + n.toLocaleString("id-ID")

const resolveImage = (p: Product) => {
  if (p.image_url && typeof p.image_url === "string" && p.image_url.includes("://")) return p.image_url
  if (p.image && /^https?:\/\//.test(p.image)) return p.image
  if (p.image && !p.image.startsWith("http")) return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${p.image.replace(/^\/?storage\//, "")}`
  return p.image || ""
}

const categoryHighlights = [
  { name: "Coffee Beans", subtitle: "Single origin & blends", icon: Bean, categoryId: 8 },
  { name: "Brewing Gear", subtitle: "Manual brewing tools", icon: ChefHat, categoryId: 6 },
  { name: "Espresso Blends", subtitle: "Rich crema, bold flavor", icon: Coffee, categoryId: 2 },
  { name: "Mugs & Cups", subtitle: "Made for every pour", icon: CupSoda, categoryId: 7 },
  { name: "Cold Brew", subtitle: "Smooth & refreshing", icon: CupSoda, categoryId: 4 },
]

const collectionCards = [
  { name: "Single Origin", detail: "Traceable beans with a distinct character", icon: Bean, categoryId: 1, color: "bg-[#f5e7d5]" },
  { name: "Espresso Blend", detail: "Balanced roasts for your daily ritual", icon: Coffee, categoryId: 2, color: "bg-[#ead7c3]" },
  { name: "Brewing Gear", detail: "Tools that make every cup feel special", icon: ChefHat, categoryId: 6, color: "bg-[#eee4d8]" },
  { name: "Cold Brew", detail: "Slow-steeped and ready for sunny days", icon: CupSoda, categoryId: 4, color: "bg-[#e8e0d5]" },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)
  const triggerAnim = useCartAnimStore((s) => s.trigger)

  useEffect(() => {
    api.get("/products", { params: { per_page: 8 } })
      .then(({ data }) => setProducts(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = (product: Product, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    triggerAnim(product.name, rect.left + rect.width / 2, rect.top + rect.height / 2)
    addItem(product.id, 1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fbf6ef]">
      <Navbar />
      <main className="flex-1">
        <section className="coffee-hero-shell">
          <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 pb-12 pt-10 sm:px-6 md:grid-cols-[0.85fr_1.15fr] md:pb-16 md:pt-14 lg:px-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }} className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f3e2cd] px-4 py-2 text-[10px] font-extrabold tracking-[0.13em] text-[#68401f]"><Sparkles size={13} /> #1 COFFEE & EQUIPMENT DESTINATION</span>
              <h1 className="mt-6 max-w-[600px] font-display text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-[#392216] sm:text-6xl lg:text-[72px]">Enjoy the best coffee<br />with <span className="text-[#a8662f]">quality gear.</span></h1>
              <div className="mt-6 flex items-center gap-3"><span className="h-[2px] w-12 bg-[#8b572b]" /><Coffee size={18} className="text-[#8b572b]" /></div>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#6d5949] sm:text-lg">Discover selected beans, premium brewing tools, and coffee machines for a better cup every day.</p>
              <div className="mt-7 grid max-w-xl grid-cols-3 gap-3 border-y border-[#e5d4c0] py-5">
                <div className="flex items-start gap-2"><Truck size={21} className="mt-0.5 shrink-0 text-[#75471f]" /><span className="text-[11px] leading-4 text-[#806c5b]"><b className="block text-xs text-[#4b2c1b]">Fast Delivery</b>1-3 Days</span></div>
                <div className="flex items-start gap-2"><Bean size={21} className="mt-0.5 shrink-0 text-[#75471f]" /><span className="text-[11px] leading-4 text-[#806c5b]"><b className="block text-xs text-[#4b2c1b]">Premium Beans</b>100% Arabica</span></div>
                <div className="flex items-start gap-2"><Headphones size={21} className="mt-0.5 shrink-0 text-[#75471f]" /><span className="text-[11px] leading-4 text-[#806c5b]"><b className="block text-xs text-[#4b2c1b]">Expert Support</b>Ready to Help</span></div>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/products" className="inline-flex items-center gap-2 rounded-lg bg-[#805027] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_18px_rgba(104,58,24,0.18)] transition hover:bg-[#5e351b]">Shop Now <ArrowRight size={16} /></Link>
                <Link href="/products?category_id=6" className="inline-flex items-center gap-2 rounded-lg border border-[#a77b51] px-6 py-3.5 text-sm font-bold text-[#6c421f] transition hover:bg-white/70">View Catalog <ArrowRight size={16} /></Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="coffee-stage">
              <div className="stage-stat"><strong>1000+</strong><span>Premium Products</span></div>
              <div className="hero-leaf" />
              <div className="coffee-bag"><strong>Arabica</strong><span>100% premium beans</span></div>
              <div className="pour-over" />
              <div className="kettle"><span className="kettle-spout" /></div>
              <div className="coffee-machine"><div className="machine-panel" /><div className="machine-spout" /><div className="machine-handle" /><div className="machine-cup" /></div>
              <div className="bean-field" />
            </motion.div>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-1 max-w-[1360px] px-4 sm:px-6 lg:px-10">
          <div className="grid overflow-hidden rounded-2xl border border-[#eadcc9] bg-[#fffdf9] shadow-[0_14px_34px_rgba(78,43,19,0.08)] sm:grid-cols-2 lg:grid-cols-5">
            {categoryHighlights.map(({ name, subtitle, icon: Icon, categoryId }) => <Link key={name} href={`/products?category_id=${categoryId}`} className="group flex items-center gap-4 border-b border-[#eee3d7] px-5 py-5 transition hover:bg-[#fbf2e7] lg:border-b-0 lg:border-r last:border-r-0"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f2e2cf] text-[#6e421f] transition group-hover:bg-[#d49a55] group-hover:text-white"><Icon size={28} strokeWidth={1.6} /></span><span><b className="block text-sm text-[#4b2c1b]">{name}</b><small className="mt-1 block text-xs text-[#927d6a]">{subtitle}</small><small className="mt-2 block text-xs font-bold text-[#8b572b]">View Products <ArrowRight size={12} className="inline" /></small></span></Link>)}
          </div>
        </section>

        <section className="mx-auto max-w-[1360px] px-4 py-12 sm:px-6 lg:px-10">
          <div className="trust-strip grid grid-cols-2 gap-5 rounded-2xl px-5 py-5 sm:grid-cols-4 sm:px-8">
            <div className="flex items-center gap-3"><ShieldCheck size={25} className="text-[#805027]" /><span><b className="block text-xs text-[#4b2c1b]">Secure Payment</b><small className="text-[11px] text-[#927d6a]">100% protected</small></span></div>
            <div className="flex items-center gap-3"><ShieldCheck size={25} className="text-[#805027]" /><span><b className="block text-xs text-[#4b2c1b]">Official Warranty</b><small className="text-[11px] text-[#927d6a]">Shop with confidence</small></span></div>
            <div className="flex items-center gap-3"><Bean size={25} className="text-[#805027]" /><span><b className="block text-xs text-[#4b2c1b]">Original Products</b><small className="text-[11px] text-[#927d6a]">Freshly selected</small></span></div>
            <div className="flex items-center gap-3"><Headphones size={25} className="text-[#805027]" /><span><b className="block text-xs text-[#4b2c1b]">Customer Service</b><small className="text-[11px] text-[#927d6a]">Ready when you need us</small></span></div>
          </div>
        </section>

        <section className="mx-auto max-w-[1360px] px-4 pb-14 sm:px-6 lg:px-10">
          <div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9a5f2e]">Explore the collection</p><h2 className="mt-2 font-display text-3xl font-bold text-[#392216] sm:text-4xl">Find your perfect brew</h2></div><Link href="/products" className="hidden items-center gap-1 text-sm font-bold text-[#6c421f] hover:text-[#a8662f] sm:flex">View all categories <ArrowRight size={15} /></Link></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {collectionCards.map(({ name, detail, icon: Icon, categoryId, color }) => <Link key={name} href={`/products?category_id=${categoryId}`} className={`group relative min-h-[180px] overflow-hidden rounded-2xl border border-[#eadcc9] ${color} p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_30px_rgba(78,43,19,0.11)]`}><Icon size={76} strokeWidth={1} className="absolute -bottom-2 -right-2 text-[#70431f]/20 transition duration-500 group-hover:scale-110 group-hover:text-[#70431f]/30" /><span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-white/65 text-[#6e421f]"><Icon size={23} /></span><h3 className="relative z-10 mt-6 text-lg font-bold text-[#4b2c1b]">{name}</h3><p className="relative z-10 mt-1 max-w-[190px] text-xs leading-5 text-[#806c5b]">{detail}</p><span className="relative z-10 mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#8b572b]">Shop collection <ArrowRight size={13} /></span></Link>)}
          </div>
        </section>

        <section className="bg-[#fffdf9] py-14">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10">
            <div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9a5f2e]">Curated for you</p><h2 className="mt-2 font-display text-3xl font-bold text-[#392216] sm:text-4xl">Customer favorites</h2></div><Link href="/products" className="flex items-center gap-1 text-sm font-bold text-[#6c421f] hover:text-[#a8662f]">View all <ArrowRight size={15} /></Link></div>
            {loading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="animate-pulse rounded-2xl border border-[#eee3d7] p-4"><div className="aspect-square rounded-xl bg-[#f2e8dc]" /><div className="mt-4 h-3 w-3/4 rounded bg-[#f2e8dc]" /><div className="mt-2 h-3 w-1/2 rounded bg-[#f2e8dc]" /></div>)}</div> : <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} className="grid grid-cols-2 gap-4 md:grid-cols-4">{products.map((product) => <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} className="group overflow-hidden rounded-2xl border border-[#eadfd2] bg-[#fffdf9] transition hover:-translate-y-1 hover:border-[#c58a4e] hover:shadow-[0_18px_28px_rgba(78,43,19,0.1)]"><Link href={`/products/${product.slug}`}><div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#f6eee4]">{resolveImage(product) ? <img src={resolveImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <Coffee size={57} strokeWidth={1.1} className="text-[#8b572b]/45 transition group-hover:scale-110 group-hover:text-[#8b572b]" />}<span className="absolute left-3 top-3 rounded-full bg-[#4a2919] px-2.5 py-1 text-[10px] font-bold text-[#fff9f1]">Best Seller</span></div></Link><div className="p-4"><p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#a1846e]">{product.category.name}</p><Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-bold leading-5 text-[#4b2c1b] hover:text-[#a8662f]">{product.name}</Link><div className="mt-2 flex items-center gap-1 text-[11px] text-[#b97632]"><Star size={12} fill="currentColor" /> 4.9 <span className="text-[#a1846e]">| Stock {product.stock}</span></div><p className="mt-2 text-base font-extrabold text-[#392216]">{formatPrice(product.price)}</p><button onClick={(event) => handleAdd(product, event)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#8b572b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#643818]"><ShoppingCart size={14} /> Add to Cart</button></div></motion.div>)}</motion.div>}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
