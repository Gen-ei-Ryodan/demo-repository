"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCartAnimStore } from "@/store/cart-anim"
import { ShoppingCart } from "lucide-react"

export function CartAnimation() {
  const { flies } = useCartAnimStore()
  const [cartPos, setCartPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const update = () => {
      const el = document.getElementById("cart-icon")
      if (el) {
        const r = el.getBoundingClientRect()
        setCartPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }
    }
    update()
    window.addEventListener("scroll", update)
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <AnimatePresence>
      {flies.map((fly) => (
        <motion.div
          key={fly.id}
          initial={{
            position: "fixed",
            left: fly.x,
            top: fly.y,
            scale: 1,
            opacity: 1,
            zIndex: 9999,
            pointerEvents: "none",
          }}
          animate={{
            left: cartPos.x,
            top: cartPos.y,
            scale: 0.3,
            opacity: 0.4,
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
        >
          <ShoppingCart className="w-4 h-4" />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
