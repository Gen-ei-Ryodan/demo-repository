"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Truck, MapPin, Clock, Package, CreditCard, CheckCircle, XCircle } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import api from "@/lib/api"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { PageLoader } from "@/components/spinner"

const formatPrice = (n: number) => "Rp " + n.toLocaleString("id-ID")

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800", shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800",
}
const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting Payment", paid: "Paid", processing: "Processing",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
}
const PAYMENT_LABELS: Record<string, string> = {
  pending: "Awaiting", success: "Success", failed: "Failed", expired: "Expired",
}
const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800", expired: "bg-gray-100 text-gray-800",
}

export default function OrderDetailPage() {
  const { token } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const orderNumber = params.orderNumber as string
  const [order, setOrder] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = useCallback(async () => {
    try { const { data } = await api.get(`/orders/${orderNumber}`); setOrder(data) }
    catch { router.push("/orders") }
    finally { setLoading(false) }
  }, [orderNumber, router])

  useEffect(() => {
    if (!token) { router.push("/login"); return }
    fetchOrder()
  }, [token, router, fetchOrder])

  if (!token || loading) return <PageLoader />
  if (!order) return null

  const o = order as Record<string, unknown>
  const status = (o.status as string) || "pending"
  const paymentStatus = (o.payment_status as string) || "pending"
  const total = (o.total as number) || 0
  const shippingCost = (o.shipping_cost as number) || 0
  const subtotal = total - shippingCost
  const addr = o.shipping_address as Record<string, string> | undefined
  const items = (o.order_items as Array<Record<string, unknown>>) || []
  const snapToken = o.midtrans_snap_token as string | undefined
  const date = (o.created_at as string) || ""
  const courier = (o.shipping_courier as string) || ""
  const service = (o.shipping_service as string) || ""
  const awb = (o.shipping_awb as string) || ""
  const notes = (o.notes as string) || ""

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 w-full overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Orders
          </Link>

          <div className="grid lg:grid-cols-[1fr_340px] gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-mono text-lg font-bold text-primary">#{orderNumber}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Clock size={13} />
                      {new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}`}>
                      {STATUS_LABELS[status] || status}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              {addr && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3"><MapPin size={16} className="text-gray-400" /> Shipping Address</h3>
                  <div className="space-y-0.5 text-sm text-gray-700">
                    <p className="font-semibold">{addr.name}</p>
                    <p>{addr.phone}</p>
                    <p>{addr.address}</p>
                    <p className="text-gray-500">{addr.village || ""}, {addr.district || ""}, {addr.city || ""}, {addr.province || ""} {addr.postal_code || ""}</p>
                  </div>
                </motion.div>
              )}

              {/* Shipping Method */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3"><Truck size={16} className="text-gray-400" /> Shipping</h3>
                <p className="text-sm text-gray-700 uppercase font-medium">{courier} - {service}</p>
                {awb && (
                  <div className="mt-3 rounded-lg bg-orange-50 border border-orange-200 px-4 py-3">
                    <p className="text-xs text-orange-700 font-semibold">Tracking Number (AWB)</p>
                    <p className="font-mono text-sm font-bold text-orange-900 mt-0.5">{awb}</p>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(awb)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-orange-700 hover:underline"
                    >
                      Track with Google
                    </a>
                  </div>
                )}
                {notes && <p className="text-xs text-gray-500 mt-1.5 italic">Note: {notes}</p>}
              </motion.div>

              {/* Products */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4"><Package size={16} className="text-gray-400" /> Product List</h3>
                <div className="divide-y divide-gray-100">
                  {items.map((item, i) => {
                    const p = item.product as Record<string, unknown> | undefined
                    return (
                      <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{(p?.name as string) || (item.name as string) || "Product"}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.quantity as number} x {formatPrice(item.price as number)}</p>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{formatPrice((item.price as number) * (item.quantity as number))}</p>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN — Sticky Summary */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Summary</h3>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[paymentStatus] || "bg-gray-100 text-gray-800"}`}>
                    <span className="flex items-center gap-1">
                      {paymentStatus === "success" ? <CheckCircle size={12} /> : paymentStatus === "failed" ? <XCircle size={12} /> : <CreditCard size={12} />}
                      {PAYMENT_LABELS[paymentStatus] || paymentStatus}
                    </span>
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{formatPrice(shippingCost)}</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold text-gray-900"><span>Total</span><span className="text-lg">{formatPrice(total)}</span></div>
                </div>

                {status === "pending" && paymentStatus !== "success" && (
                  <div className="space-y-2 pt-2">
                    {snapToken && (
                      <Link href={`/payment/${orderNumber}?snap_token=${snapToken}`} className="block w-full text-center bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition-colors font-medium text-sm">
                        Pay Now
                      </Link>
                    )}
                    <button onClick={fetchOrder} className="block w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm">
                      Refresh Status
                    </button>
                  </div>
                )}

                {(status === "paid" || status === "processing") && (
                  <button onClick={fetchOrder} className="block w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm">
                    Refresh Status
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
