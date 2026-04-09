"use client"
import { useState, useEffect } from "react"

const DAY_NAMES = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]
const MEAL_LABELS: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Comida",
  dinner: "Cena",
  snack: "Snack",
}
const MEAL_ICONS: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
}

export default function MealPlanPage() {
  const [tab, setTab] = useState<"meal" | "workout">("meal")
  const [mealPlan, setMealPlan] = useState<any>(null)
  const [workoutPlan, setWorkoutPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [preferences, setPreferences] = useState("")
  const [daysPerWeek, setDaysPerWeek] = useState(4)
  const [equipment, setEquipment] = useState("")
  const [selectedDay, setSelectedDay] = useState(0)

  async function loadPlans() {
    setLoading(true)
    const [mRes, wRes] = await Promise.all([
      fetch("/api/plans/meal"),
      fetch("/api/plans/workout"),
    ])
    const [m, w] = await Promise.all([mRes.json(), wRes.json()])
    setMealPlan(m)
    setWorkoutPlan(w)
    setLoading(false)
  }

  useEffect(() => { loadPlans() }, [])

  async function generateMeal() {
    setGenerating(true)
    const res = await fetch("/api/plans/meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences }),
    })
    if (res.ok) {
      setMealPlan(await res.json())
    } else {
      const err = await res.json().catch(() => ({}))
      alert("Error: " + (err.error ?? res.status) + (err.details ? "\nDetalle: " + err.details : ""))
    }
    setGenerating(false)
  }

  async function generateWorkout() {
    setGenerating(true)
    const res = await fetch("/api/plans/workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daysPerWeek, equipment }),
    })
    if (res.ok) {
      setWorkoutPlan(await res.json())
    } else {
      const err = await res.json().catch(() => ({}))
      alert("Error: " + (err.error ?? err.details ?? res.status))
    }
    setGenerating(false)
  }

  const currentDay = tab === "meal"
    ? mealPlan?.days?.find((d: any) => d.dayOfWeek === selectedDay)
    : workoutPlan?.days?.find((d: any) => d.dayOfWeek === selectedDay)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Planning semanal IA</h1>
        <p className="text-slate-500 text-sm mt-0.5">Generado por Claude AI segun tu perfil y objetivos</p>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setTab("meal")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "meal" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
        >
          🍽️ Comidas
        </button>
        <button
          onClick={() => setTab("workout")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "workout" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
        >
          💪 Ejercicios
        </button>
      </div>

      {/* Generador */}
      {tab === "meal" ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-slate-800 text-sm">Generar nuevo plan de comidas</h3>
          <input
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="Restricciones o preferencias (opcional): sin gluten, vegetariano..."
          />
          <button
            onClick={generateMeal}
            disabled={generating}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando con IA...
              </>
            ) : "🤖 Generar planning de comidas"}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-slate-800 text-sm">Generar nuevo plan de ejercicios</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dias de entreno/semana</label>
              <select
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                {[3, 4, 5, 6].map((d) => <option key={d} value={d}>{d} dias</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Equipamiento</label>
              <input
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Gym, mancuernas, sin equipo..."
              />
            </div>
          </div>
          <button
            onClick={generateWorkout}
            disabled={generating}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando con IA...
              </>
            ) : "🤖 Generar rutina semanal"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : ((tab === "meal" && !mealPlan) || (tab === "workout" && !workoutPlan)) ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-12 text-center">
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-slate-500 text-sm">No tienes ningun planning generado todavia</p>
          <p className="text-slate-400 text-xs mt-1">Pulsa el boton de arriba para generarlo con IA</p>
        </div>
      ) : (
        <>
          {/* Selector de dia */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {DAY_NAMES.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedDay === i
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-slate-600 border border-slate-100 hover:border-emerald-200"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Contenido del dia seleccionado */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">{DAY_NAMES[selectedDay]}</h3>

            {tab === "meal" && currentDay ? (
              <div className="space-y-3">
                {currentDay.meals.map((meal: any) => (
                  <div key={meal.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2">
                      <span>{MEAL_ICONS[meal.mealType] ?? "🍴"}</span>
                      <span className="font-medium text-slate-800 text-sm">{MEAL_LABELS[meal.mealType] ?? meal.mealType}</span>
                      <span className="ml-auto text-xs text-slate-400">{meal.calories} kcal</span>
                    </div>
                    <div className="px-5 py-3">
                      <p className="font-semibold text-slate-800 text-sm mb-1">{meal.name}</p>
                      <div className="flex gap-3 text-xs text-slate-400 mb-2">
                        <span>P: {meal.proteinG}g</span>
                        <span>C: {meal.carbsG}g</span>
                        <span>G: {meal.fatG}g</span>
                      </div>
                      {meal.recipe && (
                        <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-2">{meal.recipe}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : tab === "workout" && currentDay ? (
              currentDay.restDay ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-8 text-center">
                  <div className="text-3xl mb-2">😴</div>
                  <p className="font-medium text-slate-700">Dia de descanso</p>
                  <p className="text-slate-400 text-sm">Recuperacion activa o descanso completo</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-50">
                    <p className="font-semibold text-slate-800">{currentDay.name}</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {currentDay.exercises.map((ex: any, i: number) => (
                      <div key={ex.id} className="px-5 py-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{ex.name}</p>
                            {ex.notes && <p className="text-xs text-slate-400 mt-0.5">{ex.notes}</p>}
                          </div>
                          <div className="text-xs text-slate-500 text-right shrink-0 ml-4">
                            {ex.sets && <span>{ex.sets} series</span>}
                            {ex.reps && <span> × {ex.reps} reps</span>}
                            {ex.restSeconds && <div>Descanso: {ex.restSeconds}s</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <p className="text-slate-400 text-sm text-center py-6">Sin datos para este dia</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
