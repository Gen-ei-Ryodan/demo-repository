"use client"
import { useEffect } from "react"
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"
import { ToastProvider } from "@/components/ui/toast"

export function Providers({ children }: { children: React.ReactNode }) {
  const { token, fetchUser } = useAuthStore()
  const { fetchCart } = useCartStore()

  useEffect(() => {
    if (token) {
      fetchUser().then(() => fetchCart())
    }
  }, [])

  return <ToastProvider>{children}</ToastProvider>
}
