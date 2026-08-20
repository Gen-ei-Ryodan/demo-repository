"use client"
export const dynamic = 'force-dynamic'


import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Package, Clock, ChevronRight } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import api from "@/lib/api"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const formatPrice = (n: number) => "Rp " + n.toLocaleString("id-ID")

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting Payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  expired: "Expired",
}

interface Order {
  id: number
  order_number: string
  status: string
  total: number
  shipping_cost: number
  created_at: string
}

export default function OrdersPage() {
  const { token } = useAuthStore()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders")
        setOrders(data.orders || data.data?.orders || data.data || [])
      } catch {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [token, router])

  if (!token) return null

  return (
    <div className="flex min-h-screen flex-col bg-[#fbf6ef]">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9a5f2e]">Your coffee journey</p>
          <h1 className="mb-2 mt-2 font-display text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mb-8">View and track your orders</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package size={36} className="text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">You haven&apos;t placed any orders yet.</p>
              <button
                onClick={() => router.push("/products")}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Start Shopping
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/orders/${order.order_number}`)}
                  className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_20px_rgba(78,43,19,0.05)] transition-shadow hover:shadow-[0_14px_28px_rgba(78,43,19,0.1)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-mono font-bold text-primary text-sm">
                        #{order.order_number}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Clock size={14} />
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
