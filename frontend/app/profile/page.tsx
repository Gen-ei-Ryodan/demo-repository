"use client"
export const dynamic = 'force-dynamic'


import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Mail, Phone, MapPin, Hash, Save, ChevronDown } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import api from "@/lib/api"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useToast } from "@/components/ui/toast"

interface WilayahItem { code: string; name: string }

export default function ProfilePage() {
  const { user, token, setUser } = useAuthStore()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    province: "",
    regency: "",
    district: "",
    village: "",
    postal_code: "",
  })

  const [provinces, setProvinces] = useState<WilayahItem[]>([])
  const [regencies, setRegencies] = useState<WilayahItem[]>([])
  const [districts, setDistricts] = useState<WilayahItem[]>([])
  const [villages, setVillages] = useState<WilayahItem[]>([])

  const [loadingReg, setLoadingReg] = useState(false)
  const [loadingDis, setLoadingDis] = useState(false)
  const [loadingVil, setLoadingVil] = useState(false)

  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }
    const def = user?.default_address
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        address: def?.address || user.address || "",
        province: def?.province_code || "",
        regency: def?.regency_code || "",
        district: def?.district_code || "",
        village: def?.village_code || "",
        postal_code: def?.postal_code || user.postal_code || "",
      })
    }
  }, [token, user, router])

  useEffect(() => {
    api.get("/wilayah/provinces").then((r) => setProvinces(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const def = user?.default_address
    if (!def?.province_code || !form.province) return
    let cancelled = false
    const chain = async () => {
      try {
        if (def.province_code === form.province) {
          const reg = await api.get(`/wilayah/regencies/${form.province}`).then((r) => r.data.data || [])
          if (cancelled) return
          setRegencies(reg)
          if (def.regency_code && def.regency_code === form.regency && !regencies.length) {
            const dis = await api.get(`/wilayah/districts/${form.regency}`).then((r) => r.data.data || [])
            if (cancelled) return
            setDistricts(dis)
            if (def.district_code && def.district_code === form.district) {
              const vil = await api.get(`/wilayah/villages/${form.district}`).then((r) => r.data.data || [])
              if (!cancelled) setVillages(vil)
            }
          }
        }
      } catch {}
    }
    chain()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.province, form.regency, form.district, user])

  const fetchRegencies = (code: string) => {
    setRegencies([]); setDistricts([]); setVillages([])
    setForm((f) => ({ ...f, province: code, regency: "", district: "", village: "" }))
    if (!code) return
    setLoadingReg(true)
    api.get(`/wilayah/regencies/${code}`).then((r) => setRegencies(r.data.data || [])).catch(() => {}).finally(() => setLoadingReg(false))
  }

  const fetchDistricts = (code: string) => {
    setDistricts([]); setVillages([])
    setForm((f) => ({ ...f, regency: code, district: "", village: "" }))
    if (!code) return
    setLoadingDis(true)
    api.get(`/wilayah/districts/${code}`).then((r) => setDistricts(r.data.data || [])).catch(() => {}).finally(() => setLoadingDis(false))
  }

  const fetchVillages = (code: string) => {
    setVillages([])
    setForm((f) => ({ ...f, district: code, village: "" }))
    if (!code) return
    setLoadingVil(true)
    api.get(`/wilayah/villages/${code}`).then((r) => setVillages(r.data.data || [])).catch(() => {}).finally(() => setLoadingVil(false))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    setError("")
    setLoading(true)
    try {
      const provName = provinces.find((p) => p.code === form.province)?.name || ""
      const regName = regencies.find((r) => r.code === form.regency)?.name || ""
      const disName = districts.find((d) => d.code === form.district)?.name || ""
      const vilName = villages.find((v) => v.code === form.village)?.name || ""

      const default_address = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        province: provName,
        regency: regName,
        district: disName,
        village: vilName,
        city: [disName, regName].filter(Boolean).join(", "),
        postal_code: form.postal_code,
        province_code: form.province,
        regency_code: form.regency,
        district_code: form.district,
        village_code: form.village,
      }

      const { data } = await api.put("/profile", {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: default_address.city,
        province: provName,
        postal_code: form.postal_code,
        default_address,
      })
      setUser(data.user)
      setSaved(true)
      toast("success", "Profile saved successfully", form.name)
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data?: { message?: string } } }).response?.data?.message
          : undefined
      setError(message || "Failed to save profile.")
      toast("error", "Failed to save profile", message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!token || !user) return null

  const selectClass = "w-full pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white appearance-none cursor-pointer text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"

  return (
    <div className="flex min-h-screen flex-col bg-[#fbf6ef]">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_12px_28px_rgba(78,43,19,0.07)]"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9a5f2e]">Your coffee account</p>
          <h1 className="mb-2 mt-2 font-display text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 mb-8">Manage your account info & shipping address</p>

          {saved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-50 text-success text-sm rounded-lg p-3 mb-6"
            >
              Profile saved successfully.
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 text-danger text-sm rounded-lg p-3 mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={user.email}
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  placeholder="0812-3456-7890"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="address"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  placeholder="Jl. Contoh No. 123, RT/RW"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <div className="relative">
                  <select value={form.province} onChange={(e) => fetchRegencies(e.target.value)} className={selectClass}>
                    <option value="">Select Province</option>
                    {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regency/City</label>
                <div className="relative">
                  <select value={form.regency} onChange={(e) => fetchDistricts(e.target.value)} className={selectClass} disabled={!form.province}>
                    <option value="">{loadingReg ? "Loading..." : "Select Regency/City"}</option>
                    {regencies.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <div className="relative">
                  <select value={form.district} onChange={(e) => fetchVillages(e.target.value)} className={selectClass} disabled={!form.regency}>
                    <option value="">{loadingDis ? "Loading..." : "Select District"}</option>
                    {districts.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                <div className="relative">
                  <select value={form.village} onChange={(e) => setForm((f) => ({ ...f, village: e.target.value }))} className={selectClass} disabled={!form.district}>
                    <option value="">{loadingVil ? "Loading..." : "Select Village"}</option>
                    {villages.map((v) => <option key={v.code} value={v.code}>{v.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <div className="relative">
                <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="postal_code"
                  value={form.postal_code}
                  onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  placeholder="12345"
                />
              </div>
            </div>

            {form.address && form.province && form.regency && form.district && form.village && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                Address will be auto-filled at checkout.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save"}
            </button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
