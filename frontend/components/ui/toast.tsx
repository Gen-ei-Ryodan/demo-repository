"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, XCircle, Info, TriangleAlert, X } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastItem {
  id: number
  type: ToastType
  title: string
  description?: string
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const TOAST_STYLES: Record<ToastType, { icon: React.ReactNode; ring: string; bg: string; text: string; bar: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    ring: "ring-green-100",
    bg: "bg-green-50",
    text: "text-green-900",
    bar: "bg-green-500",
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-600" />,
    ring: "ring-red-100",
    bg: "bg-red-50",
    text: "text-red-900",
    bar: "bg-red-500",
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-600" />,
    ring: "ring-blue-100",
    bg: "bg-blue-50",
    text: "text-blue-900",
    bar: "bg-blue-500",
  },
  warning: {
    icon: <TriangleAlert className="h-5 w-5 text-amber-600" />,
    ring: "ring-amber-100",
    bg: "bg-amber-50",
    text: "text-amber-900",
    bar: "bg-amber-500",
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((type: ToastType, title: string, description?: string) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev.slice(-4), { id, type, title, description }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        <AnimatePresence>
          {toasts.map((t) => {
            const s = TOAST_STYLES[t.type]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl ${s.bg} ring-1 ${s.ring} shadow-lg`}
              >
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 shrink-0">{s.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${s.text}`}>{t.title}</p>
                    {t.description && (
                      <p className={`mt-0.5 text-xs ${s.text} opacity-80`}>{t.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    className={`shrink-0 rounded-md p-0.5 transition hover:opacity-70 ${s.text}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3.5, ease: "linear" }}
                  className={`h-1 ${s.bar}`}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}