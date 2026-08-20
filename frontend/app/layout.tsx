import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { CartAnimation } from "@/components/cart-animation"

export const metadata: Metadata = {
  title: "CoffeeShop - Premium Coffee & Brewing Gear",
  description: "Premium coffee beans, brewing gear, and everything for the perfect cup",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          {children}
          <CartAnimation />
        </Providers>
      </body>
    </html>
  )
}
