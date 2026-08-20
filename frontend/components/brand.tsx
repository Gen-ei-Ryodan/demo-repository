"use client"

import Link from "next/link"

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 shrink-0" aria-label="CoffeeShop">
      <span className="relative flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#3a2115] text-[#e0a15e] shadow-[0_7px_16px_rgba(57,30,14,0.18)]">
        <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" aria-hidden="true">
          <path d="M12 16h21v10c0 7-4.4 11-10.5 11S12 33 12 26V16Z" fill="currentColor" opacity=".18" />
          <path d="M12 16h21v10c0 7-4.4 11-10.5 11S12 33 12 26V16Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M33 20h2.5a5.5 5.5 0 0 1 0 11H33" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M10 39h26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M17 9c0-2 2-2.3 2-4M25 9c0-2 2-2.3 2-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[23px] font-extrabold tracking-[-0.04em] text-[#3a2115]">
          Coffee<span className="text-[#b97632]">Shop</span>
        </span>
        {!compact && <span className="mt-1 block text-[10px] font-semibold tracking-[0.03em] text-[#806b5a]">Coffee & Equipment Specialist</span>}
      </span>
    </Link>
  )
}
