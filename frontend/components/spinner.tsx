"use client"
import { Loader2 } from "lucide-react"

export function Spinner({ size = 32 }: { size?: number }) {
  return <Loader2 className="animate-spin text-primary" size={size} />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size={40} />
    </div>
  )
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={48} />
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    </div>
  )
}
