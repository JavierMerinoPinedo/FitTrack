"use client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts"
import BodySilhouette, { BodyComparison } from "@/components/ui/BodySilhouette"

interface WeightLog { id: string; date: string; weightKg: number; notes: string | null }
interface Profile { heightCm: number | null; goalWeightKg: number | null }

export default function ProgressPage() {
  const [weights, setWeights] = useState<WeightLog[]>([])
  const [calorieData, setCalorieData] = useState<{ date: string; calories: number }[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [newWeight, setNewWeight] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/progress")
    const data = await res.json()
    setWeights(data.weights ?? [])
    setProfile(data.profile ?? null)

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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Progreso</h1>
        <p className="text-slate-500 text-sm mt-0.5">Evolucion de tu peso y calorias</p>
      </div>

      {/* Resumen — 3 columnas en todos los tamaños pero compacto */}
      {weights.length > 0 && (
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {[
            { label: "Inicial", value: `${firstWeight} kg` },
            { label: "Actual", value: `${lastWeight} kg` },
            {
              label: "Cambio",
              value: change ? `${Number(change) > 0 ? "+" : ""}${change} kg` : "—",
              color: change && Number(change) < 0 ? "text-emerald-600" : "text-red-500",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 md:p-4 text-center">
              <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
              <p className={`text-lg md:text-xl font-bold ${s.color ?? "text-slate-800"}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Silueta corporal */}
      {profile?.heightCm && weights.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-5">Evolucion de tu figura</h3>
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            {/* Comparacion superpuesta: inicio vs ahora */}
            {weights.length > 1 ? (
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Comparativa</p>
                <BodyComparison
                  initialWeight={weights[0].weightKg}
                  currentWeight={weights[weights.length - 1].weightKg}
                  heightCm={profile.heightCm}
                />
              </div>
            ) : (
              <div className="text-center py-4">
                <BodySilhouette
                  weightKg={weights[0].weightKg}
                  heightCm={profile.heightCm}
                  label="Ahora"
                  sublabel={format(new Date(weights[0].date), "d MMM yy", { locale: es })}
                />
                <p className="text-xs text-slate-400 mt-3">Registra mas pesajes para ver la evolucion</p>
              </div>
            )}

            {/* Objetivo */}
            {profile.goalWeightKg && (
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tu objetivo</p>
                <BodySilhouette
                  weightKg={profile.goalWeightKg}
                  heightCm={profile.heightCm}
                  label={`${profile.goalWeightKg} kg`}
                  sublabel={`faltan ${Math.max(0, weights[weights.length - 1].weightKg - profile.goalWeightKg).toFixed(1)} kg`}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Anotar peso — columna en movil, fila en escritorio */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 space-y-3">
        <h3 className="font-semibold text-slate-800 text-sm">Anotar peso de hoy</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="Peso en kg (ej: 82.5)"
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
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : (
        <>
          {/* Grafica de peso */}
          {weights.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Evolucion del peso</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weights.map((w) => ({ date: format(new Date(w.date), "dd/MM"), peso: w.weightKg }))} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#94a3b8" }} width={45} />
                  <Tooltip formatter={(v: any) => [`${v} kg`, "Peso"]} />
                  <Line type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Grafica de calorias */}
          {calorieData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Calorias ultimos 14 dias</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={calorieData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} width={45} />
                  <Tooltip formatter={(v: any) => [`${v} kcal`, "Calorias"]} />
                  <Bar dataKey="calories" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Historial */}
          {weights.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 md:px-5 py-4 border-b border-slate-50">
                <h3 className="font-semibold text-slate-800 text-sm">Historial de peso</h3>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {[...weights].reverse().map((w) => (
                  <div key={w.id} className="px-4 md:px-5 py-3 flex items-center justify-between">
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
