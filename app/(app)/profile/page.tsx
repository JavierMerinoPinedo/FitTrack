"use client"
import { useState, useEffect } from "react"

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentario (poco o nada de ejercicio)",
  light: "Ligero (1-3 dias/semana)",
  moderate: "Moderado (3-5 dias/semana)",
  active: "Activo (6-7 dias/semana)",
  very_active: "Muy activo (trabajo fisico intenso)",
}

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Perder peso",
  maintain: "Mantener peso",
  gain_muscle: "Ganar musculo",
}

export default function ProfilePage() {
  const [form, setForm] = useState({
    birthDate: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    goalWeightKg: "",
    activityLevel: "",
    goal: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
            gender: data.gender ?? "",
            heightCm: data.heightCm?.toString() ?? "",
            weightKg: data.weightKg?.toString() ?? "",
            goalWeightKg: data.goalWeightKg?.toString() ?? "",
            activityLevel: data.activityLevel ?? "",
            goal: data.goal ?? "",
          })
          setCalculatedCalories(data.dailyCalories ?? null)
        }
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setCalculatedCalories(data.dailyCalories ?? null)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="text-center py-12 text-slate-400">Cargando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mi perfil</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tus datos fisicos y objetivo. Se usan para calcular tus calorias y generar plannings.</p>
      </div>

      {calculatedCalories && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Tu objetivo calorico diario</p>
            <p className="text-xs text-emerald-600 mt-0.5">Calculado con formula Mifflin-St Jeor</p>
          </div>
          <span className="text-2xl font-bold text-emerald-700">{calculatedCalories} kcal</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
        <h3 className="font-semibold text-slate-800">Datos fisicos</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de nacimiento</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="">Selecciona...</option>
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Altura (cm)</label>
            <input
              type="number"
              value={form.heightCm}
              onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="175"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Peso actual (kg)</label>
            <input
              type="number"
              step="0.1"
              value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="80"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Peso objetivo (kg)</label>
            <input
              type="number"
              step="0.1"
              value={form.goalWeightKg}
              onChange={(e) => setForm({ ...form, goalWeightKg: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="70"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Nivel de actividad fisica</label>
          <div className="space-y-2">
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="activityLevel"
                  value={value}
                  checked={form.activityLevel === value}
                  onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}
                  className="accent-emerald-500"
                />
                <span className={`text-sm ${form.activityLevel === value ? "text-slate-800 font-medium" : "text-slate-600"}`}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Objetivo</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(GOAL_LABELS).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setForm({ ...form, goal: value })}
                className={`py-3 px-4 rounded-xl text-sm font-medium border transition-colors ${
                  form.goal === value
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "border-slate-200 text-slate-600 hover:border-emerald-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>
    </div>
  )
}
