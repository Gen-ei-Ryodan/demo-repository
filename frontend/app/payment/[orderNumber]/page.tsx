"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CreditCard, CheckCircle, XCircle, ArrowLeft, RefreshCw, Loader2 } from "lucide-react"
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
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting Payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

function PaymentContent() {
  const { token } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const orderNumber = params.orderNumber as string
  const snapTokenParam = searchParams.get("snap_token")

  const [order, setOrder] = useState<{ status: string; total: number; payment_status?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-your-client-key"

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${orderNumber}`)
      setOrder(data)
    } catch {
      setMessage("Failed to load order data.")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }, [orderNumber])

  useEffect(() => {
    if (!token) { router.push("/login"); return }
    fetchOrder()
  }, [token, router, fetchOrder])

  const openSnap = () => {
    const tokenSnap = snapTokenParam || (order as { midtrans_snap_token?: string } | null)?.midtrans_snap_token
    if (!tokenSnap) {
      setMessage("Snap token unavailable. Please repeat checkout.")
      setMessageType("error")
      return
    }

    const script = document.createElement("script")
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"
    script.setAttribute("data-client-key", clientKey)
    script.onload = () => {
      ;(window as unknown as Record<string, unknown> & {
        snap?: { pay: (t: string, o: Record<string, unknown>) => void; embed: (t: string, o: Record<string, unknown>) => void }
      }).snap?.pay(tokenSnap, {
        onSuccess: () => {
          setOrder((prev) => prev ? { ...prev, status: "paid", payment_status: "success" } : null)
          setMessage("Payment successful!")
          setMessageType("success")
          setTimeout(() => router.push("/orders"), 2000)
        },
        onPending: () => {
          setMessage("Payment pending. Please complete your payment.")
          setMessageType("success")
          fetchOrder()
        },
        onError: () => {
          setMessage("Payment failed. Please try again.")
          setMessageType("error")
        },
        onClose: () => {
          fetchOrder()
        },
      })
    }
    script.onerror = () => {
      setMessage("Failed to load Midtrans. Check your internet connection.")
      setMessageType("error")
    }
    document.body.appendChild(script)
  }

  const simulatePayment = async () => {
    setMessage("")
    setLoading(true)
    try {
      await api.post("/midtrans/callback", { order_id: orderNumber, transaction_status: "settlement" })
      await fetchOrder()
      setMessage("Payment successful! (simulation)")
      setMessageType("success")
      setTimeout(() => router.push("/orders"), 1500)
    } catch {
      setMessage("Failed to simulate payment.")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <button onClick={() => router.push("/orders")} className="flex items-center gap-1 text-gray-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={18} /> Back to Orders
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment</h1>
          <p className="text-gray-500 mb-8">Order Number: <span className="font-mono font-bold text-primary">{orderNumber}</span></p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : order ? (
            <>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.payment_status || order.status] || "bg-gray-100 text-gray-800"}`}>
                    {order.payment_status === "success" ? "Success" : order.payment_status === "failed" ? "Failed" : STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Order Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              </div>

              {message && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-lg p-4 mb-6 flex items-center gap-2 ${messageType === "success" ? "bg-green-50 text-success" : "bg-red-50 text-danger"}`}>
                  {messageType === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  {message}
                </motion.div>
              )}

              <div className="space-y-3">
                {(order.payment_status !== "success" && order.status !== "paid") && (
                  <button onClick={openSnap} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                    <CreditCard size={18} /> Pay Now
                  </button>
                )}
                <button onClick={fetchOrder} className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <RefreshCw size={18} /> Check Payment Status
                </button>
                <button onClick={simulatePayment} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-success text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50">
                  <CheckCircle size={18} /> Simulate Successful Payment
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Order not found</p>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
