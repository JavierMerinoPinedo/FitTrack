"use client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts"

interface WeightLog { id: string; date: string; weightKg: number; notes: string | null }
interface FoodLog { date: string; calories: number }

export default function ProgressPage() {
  const [weights, setWeights] = useState<WeightLog[]>([])
  const [calorieData, setCalorieData] = useState<{ date: string; calories: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [newWeight, setNewWeight] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/progress")
    const data = await res.json()
    setWeights(data.weights ?? [])

    // Agrupa calorias por dia
    const byDay: Record<string, number> = {}
    for (const f of data.foodLast30 ?? []) {
      const d = format(new Date(f.date), "dd/MM")
      byDay[d] = (byDay[d] ?? 0) + f.calories
    }
    setCalorieData(Object.entries(byDay).slice(-14).map(([date, calories]) => ({ date, calories: Math.round(calories) })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveWeight() {
    if (!newWeight) return
    setSaving(true)
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg: newWeight, notes: newNotes }),
    })
    setNewWeight("")
    setNewNotes("")
    await load()
    setSaving(false)
  }

  const firstWeight = weights[0]?.weightKg
  const lastWeight = weights[weights.length - 1]?.weightKg
  const change = firstWeight && lastWeight ? (lastWeight - firstWeight).toFixed(1) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Progreso</h1>
        <p className="text-slate-500 text-sm mt-0.5">Evolucion de tu peso y calorias</p>
      </div>

      {/* Resumen */}
      {weights.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Peso inicial", value: `${firstWeight} kg` },
            { label: "Peso actual", value: `${lastWeight} kg` },
            {
              label: "Cambio total",
              value: change ? `${Number(change) > 0 ? "+" : ""}${change} kg` : "—",
              color: change && Number(change) < 0 ? "text-emerald-600" : "text-red-500",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color ?? "text-slate-800"}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Anotar peso */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <h3 className="font-semibold text-slate-800 text-sm">Anotar peso de hoy</h3>
        <div className="flex gap-3">
          <input
            type="number"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="Ej: 82.5"
          />
          <input
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="Notas (opcional)"
          />
          <button
            onClick={saveWeight}
            disabled={saving || !newWeight}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {saving ? "..." : "Guardar"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : (
        <>
          {/* Grafica de peso */}
          {weights.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Evolucion del peso</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weights.map((w) => ({ date: format(new Date(w.date), "dd/MM"), peso: w.weightKg }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip formatter={(v: any) => [`${v} kg`, "Peso"]} />
                  <Line type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Grafica de calorias */}
          {calorieData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Calorias ultimos 14 dias</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={calorieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip formatter={(v: any) => [`${v} kcal`, "Calorias"]} />
                  <Bar dataKey="calories" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Historial de peso */}
          {weights.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50">
                <h3 className="font-semibold text-slate-800 text-sm">Historial de peso</h3>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {[...weights].reverse().map((w) => (
                  <div key={w.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{w.weightKg} kg</p>
                      {w.notes && <p className="text-xs text-slate-400">{w.notes}</p>}
                    </div>
                    <p className="text-xs text-slate-400">
                      {format(new Date(w.date), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weights.length === 0 && calorieData.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-12 text-center">
              <div className="text-4xl mb-3">📈</div>
              <p className="text-slate-500 text-sm">Todavia no hay datos de progreso</p>
              <p className="text-slate-400 text-xs mt-1">Empieza anotando tu peso y registrando tus comidas</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
