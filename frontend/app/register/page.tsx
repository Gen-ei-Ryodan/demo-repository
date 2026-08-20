"use client"
export const dynamic = 'force-dynamic'


import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Lock, User, UserPlus } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface ValidationErrors {
  name?: string[]
  email?: string[]
  password?: string[]
  password_confirmation?: string[]
}

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(name, email, password, passwordConfirmation)
      router.push("/")
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response: { status: number; data?: { errors?: ValidationErrors; message?: string } } }).response?.status === 422
      ) {
        setErrors(
          (err as { response: { data?: { errors?: ValidationErrors } } }).response?.data?.errors || {}
        )
      } else {
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response: { data?: { message?: string } } }).response?.data?.message
            : undefined
        setErrors({ email: [message || "Registration failed. Please try again."] })
      }
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (field: keyof ValidationErrors) => {
    if (errors[field] && errors[field].length > 0) {
      return errors[field][0]
    }
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Register</h1>
          <p className="text-gray-500 text-center mb-8">Create a new account to start shopping</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors ${
                    fieldError("name") ? "border-danger" : "border-gray-300"
                  }`}
                  placeholder="Full name"
                  required
                />
              </div>
              {fieldError("name") && (
                <p className="text-danger text-sm mt-1">{fieldError("name")}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors ${
                    fieldError("email") ? "border-danger" : "border-gray-300"
                  }`}
                  placeholder="email@example.com"
                  required
                />
              </div>
              {fieldError("email") && (
                <p className="text-danger text-sm mt-1">{fieldError("email")}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors ${
                    fieldError("password") ? "border-danger" : "border-gray-300"
                  }`}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
              {fieldError("password") && (
                <p className="text-danger text-sm mt-1">{fieldError("password")}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <UserPlus size={18} />
              {loading ? "Processing..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Login here
            </Link>
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
