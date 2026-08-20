"use client"
export const dynamic = 'force-dynamic'


import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Eye, Package, MapPin, User, Calendar, CreditCard, Truck } from "lucide-react"
import api from "@/lib/api"
import { SlideOver } from "@/components/ui/slide-over"
import { useToast } from "@/components/ui/toast"

interface User {
  id: number
  name: string
  email: string
  phone: string | null
}

interface Order {
  id: number
  order_number: string
  user?: User
  total: number
  status: string
  shipping_awb?: string | null
  created_at: string
}

interface OrderItem {
  id: number
  name: string
  product_name?: string
  quantity: number
  price: number
  subtotal: number
  product?: { name?: string }
}

interface ShippingAddress {
  name?: string
  phone?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
}

interface OrderDetail extends Order {
  shipping_cost?: number
  shipping_courier?: string
  shipping_service?: string
  shipping_address?: ShippingAddress | string | null
  notes?: string | null
  payment_status?: string
  order_items?: OrderItem[]
  items?: OrderItem[]
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusOptions = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]

const formatPrice = (n: number) => "Rp " + n.toLocaleString("id-ID")

export default function AdminOrders() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [updating, setUpdating] = useState<number | null>(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [awb, setAwb] = useState("")
  const [statusError, setStatusError] = useState("")

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get("/admin/orders", { params })
      setOrders(data.data || data || [])
    } catch {}
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const openDetail = async (order: Order) => {
    setDetail(null)
    setDetailOpen(true)
    setDetailLoading(true)
    setStatusError("")
    try {
      const { data } = await api.get(`/admin/orders/${order.id}`)
      const o = data.data || data
      setDetail(o)
      setAwb(o.shipping_awb || "")
    } catch {
      toast("error", "Gagal memuat detail pesanan")
    }
    setDetailLoading(false)
  }

  const updateStatus = async (id: number, status: string, orderNumber: string) => {
    setStatusError("")
    if (status === "shipped" && !awb.trim()) {
      setStatusError("Nomor resi wajib diisi saat status menjadi shipped.")
      return
    }
    setUpdating(id)
    try {
      const { data } = await api.put(`/admin/orders/${id}/status`, { status, shipping_awb: awb })
      const o = data.data || data
      setDetail(o)
      setOrders((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
      toast("success", status === "shipped" ? "Pesanan dikirim" : "Status diperbarui", `${orderNumber} → ${status}`)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal mengubah status."
      setStatusError(message)
      toast("error", "Gagal memperbarui status", message)
    }
    setUpdating(null)
  }

  const handleStatusChange = (id: number, orderNumber: string, status: string) => {
    setStatusError("")
    if (status === "shipped") {
      setDetail((prev) => (prev ? { ...prev, status } : prev))
      return
    }
    updateStatus(id, status, orderNumber)
  }

  const lineStatusChange = async (order: Order, status: string) => {
    if (status === "shipped") {
      await openDetail(order)
      return
    }
    setUpdating(order.id)
    try {
      await api.put(`/admin/orders/${order.id}/status`, { status })
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status } : o))
      )
      toast("success", "Status diperbarui", `${order.order_number} → ${status}`)
    } catch {
      toast("error", "Gagal memperbarui status")
    }
    setUpdating(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="mt-1 text-sm text-gray-500">Manage customer orders</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
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
                <th className="px-6 py-3">Order #</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-5 w-full animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : (
                orders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4">{order.user?.name ?? "-"}</td>
                    <td className="px-6 py-4">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => lineStatusChange(order, e.target.value)}
                        disabled={updating === order.id}
                        className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
                          statusColors[order.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openDetail(order)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail */}
      <SlideOver
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detail ? `Order ${detail.order_number}` : "Order Detail"}
        subtitle={detail ? `Dibuat ${new Date(detail.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : ""}
        width="max-w-2xl"
      >
        {detailLoading || !detail ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Status selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[detail.status] || "bg-gray-100 text-gray-800"}`}>
                {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
              </span>
              <select
                value={detail.status}
                onChange={(e) => handleStatusChange(detail.id, detail.order_number, e.target.value)}
                disabled={updating === detail.id}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {statusError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {statusError}
              </div>
            )}

            {detail.status === "shipped" && (
              <div className="flex flex-wrap items-end gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
                <div className="flex-1 min-w-[220px]">
                  <label className="block text-xs font-semibold text-orange-800 mb-1">
                    Nomor Resi (AWB)
                  </label>
                  <input
                    type="text"
                    value={awb}
                    onChange={(e) => setAwb(e.target.value)}
                    placeholder="Contoh: JNE01234567890"
                    className="w-full rounded-lg border border-orange-300 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={() => updateStatus(detail.id, "shipped", detail.order_number)}
                  disabled={updating === detail.id}
                  className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
                >
                  {updating === detail.id ? "Menyimpan..." : "Simpan Resi & Kirim"}
                </button>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Customer */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-1">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <User className="h-4 w-4 text-gray-400" /> Customer
                </h4>
                <p className="text-sm font-medium text-gray-900">{detail.user?.name ?? "-"}</p>
                <p className="text-xs text-gray-500">{detail.user?.email ?? "-"}</p>
                {detail.user?.phone && <p className="text-xs text-gray-500">{detail.user.phone}</p>}
              </div>

              {/* Shipping */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <MapPin className="h-4 w-4 text-gray-400" /> Alamat Pengiriman
                </p>
                {typeof detail.shipping_address === "object" && detail.shipping_address ? (
                  <div className="space-y-0.5 text-xs text-gray-600">
                    <p>{detail.shipping_address.name}</p>
                    <p>{detail.shipping_address.phone}</p>
                    <p>{detail.shipping_address.address}</p>
                    <p>
                      {detail.shipping_address.city}, {detail.shipping_address.province}{" "}
                      {detail.shipping_address.postal_code}
                    </p>
                  </div>
                ) : (
                  <p className="break-words text-xs text-gray-600">
                    {typeof detail.shipping_address === "string" ? detail.shipping_address || "-" : "-"}
                  </p>
                )}
              </div>
            </div>

            {/* Payment & shipping meta */}
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <CreditCard className="h-4 w-4 text-gray-400" /> Pembayaran & Pengiriman
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400">Payment:</span> {detail.payment_status || "-"}
                </div>
                <div>
                  <span className="text-gray-400">Selesai Dibuat:</span>{" "}
                  {new Date(detail.created_at).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              {detail.shipping_awb && (
                <div className="mt-3 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-xs text-orange-800">
                  <b>Nomor Resi (AWB):</b> <span className="font-mono">{detail.shipping_awb}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Package className="h-4 w-4 text-gray-400" /> Order Items
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {(detail.order_items || detail.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.product?.name || item.name || item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 px-4 py-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice((detail.order_items || detail.items || []).reduce((s, i) => s + i.subtotal, 0))}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(detail.shipping_cost || 0)}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(detail.total)}</span>
                </div>
              </div>
            </div>

            {detail.notes && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <b>Catatan:</b> {detail.notes}
              </div>
            )}
          </div>
        )}
      </SlideOver>
    </div>
  )
}