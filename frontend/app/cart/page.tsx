"use client"
export const dynamic = 'force-dynamic'

import { useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCartStore } from "@/store/cart"

const formatPrice = (n: number) => "Rp " + n.toLocaleString("id-ID")

const resolveImage = (p: { image?: string | null; image_url?: string | null }) => {
  if (p.image_url && typeof p.image_url === "string" && p.image_url.includes("://")) return p.image_url
  if (p.image && /^https?:\/\//.test(p.image)) return p.image
  if (p.image && !p.image.startsWith("http")) return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${p.image.replace(/^\/?storage\//, "")}`
  return p.image || ""
}

export default function CartPage() {
  const { cart, fetchCart, updateItem, removeItem } = useCartStore()
  const items = cart?.cart_items || []
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  useEffect(() => { fetchCart() }, [fetchCart])

  return (
    <div className="flex min-h-screen flex-col bg-[#fbf6ef]">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9a5f2e]">Your coffee ritual</p>
        <h1 className="mb-7 mt-2 font-display text-3xl font-bold text-gray-900">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">There are no products in your shopping cart.</p>
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.2 }} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_20px_rgba(78,43,19,0.05)]">
                    <Link href={`/products/${item.product.slug}`} className="w-20 h-20 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {resolveImage(item.product) ? (
                        <img src={resolveImage(item.product)} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="text-sm font-semibold text-gray-900 hover:text-primary line-clamp-2">{item.product.name}</Link>
                      <p className="text-sm font-bold text-primary mt-1">{formatPrice(item.product.price)}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button onClick={() => { if (item.quantity > 1) updateItem(item.id, item.quantity - 1) }} disabled={item.quantity <= 1} className="p-1.5 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold select-none">{item.quantity}</span>
                          <button onClick={() => updateItem(item.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="p-1.5 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900">{formatPrice(item.product.price * item.quantity)}</span>
                          <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-400 hover:text-danger transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>

            <div className="sticky top-24 h-fit space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_8px_20px_rgba(78,43,19,0.05)]">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="truncate max-w-[180px]">{item.product.name} x{item.quantity}</span>
                    <span className="font-medium shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total</span>
                <span className="text-xl font-extrabold text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <Link href="/checkout" className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
