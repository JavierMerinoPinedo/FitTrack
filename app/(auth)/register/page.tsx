"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push("/login?registered=1")
    } else {
      const data = await res.json()
      setError(data.error || "Error al registrarse")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">F</div>
          <h1 className="text-2xl font-bold text-slate-800">Crear cuenta</h1>
          <p className="text-slate-500 text-sm mt-1">Empieza tu transformacion hoy</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(["name", "email", "password"] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                {field === "name" ? "Nombre" : field === "email" ? "Email" : "Contraseña"}
              </label>
              <input
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                placeholder={field === "name" ? "Tu nombre" : field === "email" ? "tu@email.com" : "Minimo 8 caracteres"}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-emerald-600 font-medium hover:underline">
            Iniciar sesion
          </Link>
        </p>
      </div>
    </div>
  )
}
