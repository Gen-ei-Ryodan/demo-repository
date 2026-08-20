"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Truck, CreditCard, ShoppingBag, MapPin, Phone, User, FileText, ChevronDown, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"
import api from "@/lib/api"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { FullPageLoader } from "@/components/spinner"

const formatPrice = (n: number) => "Rp " + n.toLocaleString("id-ID")

interface WilayahItem { code: string; name: string }
interface ShippingRate { courier: string; service: string; name: string; price: number; eta: string }

const FALLBACK_SHIPPING: ShippingRate[] = [
  { courier: "jne", service: "REG", name: "JNE REG", price: 25000, eta: "2-3 days" },
  { courier: "jne", service: "YES", name: "JNE YES", price: 45000, eta: "1 day" },
  { courier: "tiki", service: "REG", name: "TIKI REG", price: 22000, eta: "2-4 days" },
  { courier: "pos", service: "Kilat", name: "POS Kilat", price: 20000, eta: "3-5 days" },
]

export default function CheckoutPage() {
  const { user, token } = useAuthStore()
  const { cart, total } = useCartStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  const [provinces, setProvinces] = useState<WilayahItem[]>([])
  const [regencies, setRegencies] = useState<WilayahItem[]>([])
  const [districts, setDistricts] = useState<WilayahItem[]>([])
  const [villages, setVillages] = useState<WilayahItem[]>([])

  const [loadingProv, setLoadingProv] = useState(false)
  const [loadingReg, setLoadingReg] = useState(false)
  const [loadingDis, setLoadingDis] = useState(false)
  const [loadingVil, setLoadingVil] = useState(false)

  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [loadingRates, setLoadingRates] = useState(false)
  const [isFallback, setIsFallback] = useState(false)

  const [shipping, setShipping] = useState({
    name: "", phone: "", address: "",
    province: "", regency: "", district: "", village: "",
    postal_code: "", notes: "",
  })

  const [selectedShipping, setSelectedShipping] = useState(0)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!token) { router.push("/login"); return }
    if (user) {
      const def = user?.default_address
      setShipping((prev) => ({
        ...prev,
        name: def?.name || user.name || "",
        phone: def?.phone || user.phone || "",
        address: def?.address || user.address || "",
        postal_code: def?.postal_code || user.postal_code || "",
      }))
    }
    if (cart && cart.cart_items.length === 0) router.push("/cart")
  }, [token, user, cart, router])

  useEffect(() => {
    api.get("/wilayah/provinces").then((r) => setProvinces(r.data.data || [])).catch(() => {})
  }, [])

  const fetchRegencies = (code: string) => {
    setRegencies([]); setDistricts([]); setVillages([]); setShippingRates([])
    setShipping((s) => ({ ...s, regency: "", district: "", village: "" }))
    if (!code) return
    setLoadingReg(true)
    api.get(`/wilayah/regencies/${code}`).then((r) => setRegencies(r.data.data || [])).catch(() => {}).finally(() => setLoadingReg(false))
  }

  const fetchDistricts = (code: string) => {
    setDistricts([]); setVillages([]); setShippingRates([])
    setShipping((s) => ({ ...s, district: "", village: "" }))
    if (!code) return
    setLoadingDis(true)
    api.get(`/wilayah/districts/${code}`).then((r) => setDistricts(r.data.data || [])).catch(() => {}).finally(() => setLoadingDis(false))
  }

  const fetchVillages = (code: string) => {
    setVillages([])
    setShipping((s) => ({ ...s, village: "" }))
    if (!code) return
    setLoadingVil(true)
    api.get(`/wilayah/villages/${code}`).then((r) => setVillages(r.data.data || [])).catch(() => {}).finally(() => setLoadingVil(false))
  }

  const fetchShippingRates = async (villageCode: string) => {
    if (!villageCode) return
    setLoadingRates(true)
    setShippingRates([])
    const totalWeight = cart?.cart_items.reduce((sum, i) => sum + i.product.weight * i.quantity, 0) || 1000
    try {
      const { data } = await api.post("/shipping/rates", {
        destination_area_id: villageCode,
        destination_postal_code: shipping.postal_code || "10110",
        weight: totalWeight,
        couriers: "jne,tiki,pos",
      })
      if (data?.pricing && Array.isArray(data.pricing) && data.pricing.length > 0) {
        const rates: ShippingRate[] = data.pricing.map((p: { courier_name?: string; courier_code?: string; service_type?: string; price?: number; duration?: string }) => ({
          courier: (p.courier_code || p.courier_name || "").toLowerCase(),
          service: p.service_type || "REG",
          name: `${p.courier_name || ""} ${p.service_type || ""}`,
          price: p.price || 0,
          eta: p.duration || "3-5 days",
        }))
        setShippingRates(rates)
        setIsFallback(false)
      } else {
        setShippingRates(FALLBACK_SHIPPING)
        setIsFallback(true)
      }
    } catch {
      setShippingRates(FALLBACK_SHIPPING)
      setIsFallback(true)
    } finally {
      setLoadingRates(false)
    }
  }

  const update = (key: string, val: string) => setShipping((s) => ({ ...s, [key]: val }))

  const appliedDefaultRef = useRef(false)

  useEffect(() => {
    const def = user?.default_address
    if (!def || appliedDefaultRef.current) return
    if (!def.province_code || !def.regency_code || !def.district_code || !def.village_code) return
    appliedDefaultRef.current = true

    const chain = async () => {
      try {
        let provData = provinces
        if (!provData.length) {
          provData = await api.get("/wilayah/provinces").then((r) => r.data.data || [])
          setProvinces(provData)
        }

        const reg = await api.get(`/wilayah/regencies/${def.province_code}`).then((r) => r.data.data || [])
        setRegencies(reg)
        setShipping((s) => ({ ...s, province: def.province_code!, regency: def.regency_code! }))

        const dis = await api.get(`/wilayah/districts/${def.regency_code}`).then((r) => r.data.data || [])
        setDistricts(dis)
        setShipping((s) => ({ ...s, district: def.district_code! }))

        const vil = await api.get(`/wilayah/villages/${def.district_code}`).then((r) => r.data.data || [])
        setVillages(vil)
        setShipping((s) => ({ ...s, village: def.village_code! }))

        await fetchShippingRates(def.village_code!)
      } catch {}
    }
    chain()
  }, [user])

  const subtotal = total()
  const activeRates = shippingRates.length > 0 ? shippingRates : FALLBACK_SHIPPING
  const shippingCost = activeRates[selectedShipping]?.price || 0
  const grandTotal = subtotal + shippingCost

  const handleSubmit = async () => {
    setError("")
    if (!shipping.province || !shipping.regency || !shipping.district || !shipping.village || !shipping.address) {
      setError("Please complete the shipping address.")
      return
    }
    setLoading(true)
    const chosen = activeRates[selectedShipping] || FALLBACK_SHIPPING[0]
    try {
      const provName = provinces.find((p) => p.code === shipping.province)?.name || ""
      const regName = regencies.find((r) => r.code === shipping.regency)?.name || ""
      const disName = districts.find((d) => d.code === shipping.district)?.name || ""
      const vilName = villages.find((v) => v.code === shipping.village)?.name || ""

      const { data } = await api.post("/orders", {
        shipping_address: {
          name: shipping.name,
          phone: shipping.phone,
          address: shipping.address,
          province: provName,
          regency: regName,
          district: disName,
          village: vilName,
          city: `${disName}, ${regName}`,
          postal_code: shipping.postal_code,
          province_code: shipping.province,
          regency_code: shipping.regency,
          district_code: shipping.district,
          village_code: shipping.village,
        },
        shipping_courier: chosen.courier,
        shipping_service: chosen.service,
        shipping_cost: chosen.price,
        notes: shipping.notes,
      })

      const snapToken = data.midtrans_snap_token
      const orderNumber = data.order_number
       if (!snapToken || !orderNumber) throw new Error("Failed to create snap token")
      useAuthStore.getState().fetchUser()
      router.push(`/payment/${orderNumber}?snap_token=${snapToken}`)
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response: { data?: { message?: string } } }).response?.data?.message
        : undefined
      setError(msg || "Failed to create order.")
      setLoading(false)
    }
  }

  const selectClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"

  if (!mounted || !token || !user) return <FullPageLoader />

  return (
    <div className="flex min-h-screen flex-col bg-[#fbf6ef]">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9a5f2e]">Almost there</p>
          <h1 className="mb-8 mt-2 font-display text-3xl font-bold text-gray-900">Checkout</h1>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-danger text-sm rounded-lg p-3 mb-6">{error}</motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <MapPin size={20} /> Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={shipping.name} onChange={(e) => update("name", e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={shipping.phone} onChange={(e) => update("phone", e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" required />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                    <input value={shipping.address} onChange={(e) => update("address", e.target.value)} placeholder="Jl. Contoh No. 123, RT/RW" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                      <div className="relative">
                        <select value={shipping.province} onChange={(e) => { update("province", e.target.value); fetchRegencies(e.target.value) }} className={selectClass}>
                          <option value="">Select Province</option>
                          {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Regency/City</label>
                      <div className="relative">
                        <select value={shipping.regency} onChange={(e) => { update("regency", e.target.value); fetchDistricts(e.target.value) }} className={selectClass} disabled={!shipping.province}>
                          <option value="">{loadingReg ? "Loading..." : "Select Regency/City"}</option>
                          {regencies.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <div className="relative">
                        <select value={shipping.district} onChange={(e) => { update("district", e.target.value); fetchVillages(e.target.value) }} className={selectClass} disabled={!shipping.regency}>
                          <option value="">{loadingDis ? "Loading..." : "Select District"}</option>
                          {districts.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                      <div className="relative">
                        <select value={shipping.village} onChange={(e) => { update("village", e.target.value); fetchShippingRates(e.target.value) }} className={selectClass} disabled={!shipping.district}>
                          <option value="">{loadingVil ? "Loading..." : "Select Village"}</option>
                          {villages.map((v) => <option key={v.code} value={v.code}>{v.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input value={shipping.postal_code} onChange={(e) => update("postal_code", e.target.value)} placeholder="12345" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                    <div className="relative">
                      <FileText size={18} className="absolute left-3 top-2.5 text-gray-400" />
                      <textarea value={shipping.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm resize-none" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Shipping Method */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Truck size={20} /> Shipping Method
                  {isFallback && shipping.village && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-normal">Estimated</span>}
                </h2>

                {loadingRates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <span className="ml-2 text-sm text-gray-500">Fetching shipping rates...</span>
                  </div>
                ) : !shipping.village ? (
                  <p className="text-sm text-gray-500 text-center py-8">Please select a destination village first</p>
                ) : (
                  <div className="space-y-3">
                    {activeRates.map((option, idx) => (
                      <label key={`${option.courier}-${option.service}-${idx}`} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedShipping === idx ? "border-primary bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <input type="radio" name="shipping" checked={selectedShipping === idx} onChange={() => setSelectedShipping(idx)} className="accent-primary w-4 h-4" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{option.name}</p>
                          <p className="text-sm text-gray-500">ETA: {option.eta}</p>
                        </div>
                        <p className="font-semibold text-gray-900">{formatPrice(option.price)}</p>
                      </label>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Order Items */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <ShoppingBag size={20} /> Order Summary
                </h2>
                {cart?.cart_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                      <p className="text-sm text-gray-500">{item.quantity} x {formatPrice(item.product.price)}</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Cost Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping.village ? formatPrice(shippingCost) : "-"}</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>{formatPrice(grandTotal)}</span></div>
                </div>
                <button onClick={handleSubmit} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                  <CreditCard size={18} />
                  {loading ? "Processing..." : "Pay with Midtrans"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
