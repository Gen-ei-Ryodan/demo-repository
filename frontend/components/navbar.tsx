"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"
import { BrandLogo } from "@/components/brand"
import {
  ChevronDown, CircleHelp, Headphones, LogOut, Menu, MapPin, Menu as MenuIcon,
  Package, Phone, Search, Settings, ShoppingCart, Truck, UserRound, X, ShieldCheck,
} from "lucide-react"

const utilityItems = [
  { icon: Truck, title: "FREE SHIPPING", detail: "Orders over Rp500.000" },
  { icon: Headphones, title: "FAST RESPONSE", detail: "0812-3456-7890" },
  { icon: Package, title: "TRACK ORDER", detail: "View your order status" },
  { icon: MapPin, title: "STORE LOCATION", detail: "Find a store near you" },
  { icon: CircleHelp, title: "HELP CENTER", detail: "Support & FAQ" },
]

export default function Navbar() {
  const { user, token, logout } = useAuthStore()
  const { itemCount, total } = useCartStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setProfileOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  const isAuth = mounted && Boolean(token)
  const isAdmin = mounted && user?.role === "admin"
  const count = itemCount()

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    router.push(`/products${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`)
    setMenuOpen(false)
  }

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-[#fffdf9] shadow-[0_5px_24px_rgba(61,35,19,0.10)]">
      <div className="hidden bg-[#2f1b13] text-[#fff9f1] md:block">
        <div className="mx-auto grid h-[66px] max-w-[1440px] grid-cols-5 items-center gap-5 px-6 lg:px-10">
          {utilityItems.map(({ icon: Icon, title, detail }) => (
            <div key={title} className="flex items-center gap-3 border-r border-white/10 last:border-r-0">
              <Icon size={22} strokeWidth={1.7} className="shrink-0 text-[#e2a360]" />
              <div className="min-w-0 leading-tight">
                <p className="text-[11px] font-extrabold tracking-wide">{title}</p>
                <p className="mt-1 truncate text-[11px] text-white/65">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-[#eee3d7] bg-[#fffdf9]">
        <div className="mx-auto flex min-h-[96px] max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:px-10">
          <BrandLogo />

          <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:flex">
            <div className="flex h-12 w-full overflow-hidden rounded-xl border border-[#e6dacd] bg-white shadow-[0_4px_16px_rgba(82,47,22,0.05)] focus-within:border-[#b87935] focus-within:ring-4 focus-within:ring-[#d49a55]/15">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coffee, brewing gear, or categories..." className="min-w-0 flex-1 bg-transparent px-5 text-sm text-[#38251a] outline-none placeholder:text-[#a9998b]" />
              <button type="button" className="flex items-center gap-2 border-l border-[#eee3d7] px-4 text-xs font-semibold text-[#6e5b4c] transition hover:bg-[#fbf6ef] hover:text-[#4b2c1b]">
                All Categories <ChevronDown size={14} />
              </button>
              <button type="submit" className="flex w-14 items-center justify-center bg-[#8b572b] text-white transition-colors hover:bg-[#6e421f]" aria-label="Search">
                <Search size={20} strokeWidth={2.2} />
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-4">
            {!mounted ? <div className="h-10 w-36" /> : isAuth ? (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 text-left">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4d6c7] bg-[#fbf2e7] text-[#6e421f]"><UserRound size={20} /></span>
                  <span className="hidden leading-tight lg:block"><span className="block text-[11px] text-[#927f70]">Hello,</span><span className="block max-w-[110px] truncate text-sm font-bold text-[#38251a]">{user?.name}</span></span>
                  <ChevronDown size={15} className={`text-[#806d5c] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {profileOpen && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 top-14 w-60 overflow-hidden rounded-2xl border border-[#eadfd2] bg-[#fffdf9] shadow-[0_18px_40px_rgba(57,31,15,0.15)]">
                    <div className="border-b border-[#eee3d7] bg-[#fbf4eb] px-4 py-4"><p className="text-sm font-bold text-[#38251a]">{user?.name}</p><p className="text-xs text-[#8d7968]">{user?.email}</p></div>
                    <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#5d4738] hover:bg-[#fbf4eb]"><UserRound size={16} /> My Profile</Link>
                    <Link href="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#5d4738] hover:bg-[#fbf4eb]"><Package size={16} /> My Orders</Link>
                    {isAdmin && <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#5d4738] hover:bg-[#fbf4eb]"><Settings size={16} /> Admin Panel</Link>}
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 border-t border-[#eee3d7] px-4 py-3 text-sm text-red-600 hover:bg-red-50"><LogOut size={16} /> Logout</button>
                  </motion.div>}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="hidden items-center gap-2 sm:flex"><UserRound size={24} className="text-[#4b2c1b]" /><span className="leading-tight"><span className="block text-[11px] text-[#927f70]">Account</span><span className="block text-sm font-semibold text-[#38251a]">Login / Register</span></span></Link>
            )}

            {isAuth && <Link href="/cart" id="cart-icon" className="group flex items-center gap-2 border-l border-[#eadfd2] pl-4">
              <span className="relative text-[#4b2c1b]"><ShoppingCart size={27} strokeWidth={1.7} /><motion.span key={count} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#c98743] px-1 text-[10px] font-extrabold text-white">{count}</motion.span></span>
              <span className="hidden leading-tight lg:block"><span className="block text-[11px] text-[#927f70]">Cart</span><span className="block text-sm font-bold text-[#38251a]">{total() ? `Rp ${total().toLocaleString("id-ID")}` : "Empty"}</span></span>
            </Link>}

            <button className="text-[#4b2c1b] md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">{menuOpen ? <X size={25} /> : <Menu size={25} />}</button>
          </div>
        </div>
      </div>

      <nav className="hidden bg-[#75471f] md:block">
        <div className="mx-auto flex h-[56px] max-w-[1440px] items-center gap-7 px-6 lg:px-10">
          <Link href="/products" className="flex h-10 items-center gap-2 rounded-lg border border-white/30 px-5 text-sm font-bold text-white transition hover:border-white/70 hover:bg-white/10"><MenuIcon size={17} /> All Categories</Link>
          <Link href="/" className="text-sm font-semibold text-white hover:text-[#f2c48c]">Home</Link>
          <Link href="/products?category_id=8" className="flex items-center gap-1 text-sm font-semibold text-white hover:text-[#f2c48c]">Coffee Beans <ChevronDown size={14} /></Link>
          <Link href="/products?category_id=6" className="flex items-center gap-1 text-sm font-semibold text-white hover:text-[#f2c48c]">Brewing Gear <ChevronDown size={14} /></Link>
          <Link href="/products?category_id=2" className="flex items-center gap-1 text-sm font-semibold text-white hover:text-[#f2c48c]">Espresso <ChevronDown size={14} /></Link>
          <Link href="/products?category_id=7" className="text-sm font-semibold text-white hover:text-[#f2c48c]">Accessories</Link>
          <Link href="/products" className="text-sm font-semibold text-white hover:text-[#f2c48c]">Promos</Link>
          <Link href="/products" className="text-sm font-semibold text-white hover:text-[#f2c48c]">Blog</Link>
          <Link href="/products" className="text-sm font-semibold text-white hover:text-[#f2c48c]">Contact</Link>
          <div className="ml-auto hidden items-center gap-4 lg:flex"><span className="flex items-center gap-1.5 text-xs text-white"><ShieldCheck size={15} className="text-[#f0bf84]" /> 100% Original</span><span className="flex items-center gap-1.5 text-xs text-white"><ShieldCheck size={15} className="text-[#f0bf84]" /> Secure Payment</span></div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[#eadfd2] bg-[#fffdf9] md:hidden"><div className="space-y-1 p-4">
          <form onSubmit={submitSearch} className="mb-3 flex h-11 overflow-hidden rounded-xl border border-[#e6dacd] bg-white"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coffee products..." className="min-w-0 flex-1 px-3 text-sm outline-none" /><button type="submit" className="bg-[#8b572b] px-4 text-white"><Search size={17} /></button></form>
          <Link href="/" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#4b2c1b] hover:bg-[#fbf4eb]">Home</Link>
          <Link href="/products?category_id=8" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#4b2c1b] hover:bg-[#fbf4eb]">Coffee Beans</Link>
          <Link href="/products?category_id=6" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#4b2c1b] hover:bg-[#fbf4eb]">Brewing Gear</Link>
          <Link href="/products" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#4b2c1b] hover:bg-[#fbf4eb]">All Products</Link>
          {isAuth && <><Link href="/cart" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#4b2c1b] hover:bg-[#fbf4eb]">Cart ({count})</Link><Link href="/profile" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#4b2c1b] hover:bg-[#fbf4eb]">My Profile</Link><Link href="/orders" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#4b2c1b] hover:bg-[#fbf4eb]">My Orders</Link><button onClick={handleLogout} className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Logout</button></>}
          {!isAuth && mounted && <Link href="/login" onClick={() => setMenuOpen(false)} className="block rounded-lg bg-[#8b572b] px-3 py-2.5 text-center text-sm font-bold text-white">Login / Register</Link>}
        </div></motion.div>}
      </AnimatePresence>
    </header>
  )
}
