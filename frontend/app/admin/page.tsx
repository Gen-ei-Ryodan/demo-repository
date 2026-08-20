"use client"
export const dynamic = 'force-dynamic'


import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Package,
  ShoppingBag,
  DollarSign,
  ClipboardList,
} from "lucide-react"
import api from "@/lib/api"

interface DashboardData {
  total_products: number
  total_orders: number
  total_revenue: number
  orders_by_status: Record<string, number>
  recent_orders: {
    id: number
    order_number: string
    customer_name: string
    total: number
    status: string
    created_at: string
  }[]
}

const formatPrice = (n: number) => "Rp " + n.toLocaleString("id-ID")

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statsConfig = [
  { key: "total_products", label: "Total Products", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "total_orders", label: "Total Orders", icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "total_revenue", label: "Total Revenue", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
]

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => {
      setData(res.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Overview of your store</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map(({ key, label, icon: Icon, color, bg }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="rounded-xl bg-white p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {key === "total_revenue"
                    ? formatPrice(data[key as keyof DashboardData] as number)
                    : (data[key as keyof DashboardData] as number)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Orders by status card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-xl bg-white p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-lg bg-purple-50 p-3">
              <ClipboardList className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Orders by Status</p>
          </div>
          <div className="space-y-2">
            {Object.entries(data.orders_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
                  {status}
                </span>
                <span className="text-sm font-semibold text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent orders */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm font-medium text-gray-500">
                <th className="px-6 py-3">Order #</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recent_orders.map((order) => (
                <tr key={order.id} className="text-sm text-gray-700 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4">{order.customer_name}</td>
                  <td className="px-6 py-4">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
              {data.recent_orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
