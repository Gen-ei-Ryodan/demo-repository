"use client"

import Link from "next/link"
import { Coffee, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#2f1b13] text-[#d9c6b5]">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-3 text-white"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c98743] text-[#2f1b13]"><Coffee size={24} /></span><span className="text-2xl font-extrabold tracking-tight">Coffee<span className="text-[#d49a55]">Shop</span></span></div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#c4ae9b]">Premium beans, thoughtful brewing gear, and everyday rituals for people who take their coffee seriously.</p>
            <div className="mt-5 flex gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#d49a55]"><Coffee size={16} /></span><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#d49a55]"><Mail size={16} /></span></div>
          </div>
          <div>
            <h3 className="font-bold text-white">Shop</h3>
            <div className="mt-4 space-y-3 text-sm"><Link href="/products?category_id=8" className="block transition hover:text-white">Coffee Beans</Link><Link href="/products?category_id=6" className="block transition hover:text-white">Brewing Gear</Link><Link href="/products?category_id=2" className="block transition hover:text-white">Espresso Blends</Link><Link href="/products?category_id=7" className="block transition hover:text-white">Mugs & Cups</Link></div>
          </div>
          <div>
            <h3 className="font-bold text-white">Customer Care</h3>
            <div className="mt-4 space-y-3 text-sm"><Link href="/orders" className="block transition hover:text-white">Track Order</Link><Link href="/profile" className="block transition hover:text-white">My Profile</Link><Link href="/products" className="block transition hover:text-white">Shipping Info</Link><Link href="/products" className="block transition hover:text-white">FAQ</Link></div>
          </div>
          <div>
            <h3 className="font-bold text-white">Visit CoffeeShop</h3>
            <div className="mt-4 space-y-3 text-sm"><p className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-[#d49a55]" /> Jakarta, Indonesia</p><p className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-[#d49a55]" /> (021) 1234-5678</p><p className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-[#d49a55]" /> info@coffeeshop.id</p></div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-[#a88f7c]">&copy; {new Date().getFullYear()} CoffeeShop. Crafted for better coffee moments.</div>
      </div>
    </footer>
  )
}
