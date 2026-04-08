"use client"
import { useState, useEffect } from "react"

interface Exercise {
  name: string
  sets: number | ""
  reps: number | ""
  weightKg: number | ""
  notes: string
}

interface WorkoutLog {
  id: string
  name: string
  durationMin: number | null
  exercises: { id: string; name: string; sets: number; reps: number; weightKg: number; notes: string }[]
}

export default function TrainingPage() {
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [workoutName, setWorkoutName] = useState("")
  const [duration, setDuration] = useState("")
  const [exercises, setExercises] = useState<Exercise[]>([{ name: "", sets: "", reps: "", weightKg: "", notes: "" }])
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/training")
    setLogs(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function addExercise() {
    setExercises([...exercises, { name: "", sets: "", reps: "", weightKg: "", notes: "" }])
  }

  function updateExercise(i: number, field: keyof Exercise, value: string) {
    const updated = [...exercises]
    updated[i] = { ...updated[i], [field]: value }
    setExercises(updated)
  }

  function removeExercise(i: number) {
    setExercises(exercises.filter((_, idx) => idx !== i))
  }

  async function saveWorkout() {
    if (!workoutName) return
    setSaving(true)

    await fetch("/api/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: workoutName,
        durationMin: duration ? parseInt(duration) : null,
        exercises: exercises.filter((e) => e.name).map((e) => ({
          name: e.name,
          sets: e.sets ? Number(e.sets) : null,
          reps: e.reps ? Number(e.reps) : null,
          weightKg: e.weightKg ? Number(e.weightKg) : null,
          notes: e.notes || null,
        })),
      }),
    })

    setWorkoutName("")
    setDuration("")
    setExercises([{ name: "", sets: "", reps: "", weightKg: "", notes: "" }])
    setShowForm(false)
    await load()
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Registro de entreno</h1>
          <p className="text-slate-500 text-sm mt-0.5">Hoy</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          + Nuevo entreno
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-slate-800">Nuevo entrenamiento</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del entreno</label>
              <input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Ej: Pecho y Triceps"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duracion (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="60"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Ejercicios</label>
              <button onClick={addExercise} className="text-emerald-600 text-sm font-medium hover:underline">+ Anadir</button>
            </div>
            {exercises.map((ex, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={ex.name}
                    onChange={(e) => updateExercise(i, "name", e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                    placeholder="Nombre del ejercicio"
                  />
                  {exercises.length > 1 && (
                    <button onClick={() => removeExercise(i)} className="text-red-300 hover:text-red-500 text-xl leading-none">×</button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "sets", label: "Series" },
                    { key: "reps", label: "Reps" },
                    { key: "weightKg", label: "Peso (kg)" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <input
                        type="number"
                        value={(ex as any)[key]}
                        onChange={(e) => updateExercise(i, key as keyof Exercise, e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 border border-slate-200 text-slate-600 font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={saveWorkout}
              disabled={saving || !workoutName}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {saving ? "Guardando..." : "Guardar entreno"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-12 text-center">
          <div className="text-4xl mb-3">💪</div>
          <p className="text-slate-500 text-sm">No has registrado ningun entreno hoy</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{log.name}</h3>
                  {log.durationMin && <p className="text-xs text-slate-400">{log.durationMin} minutos</p>}
                </div>
                <span className="text-xs text-slate-400">{log.exercises.length} ejercicios</span>
              </div>
              <div className="divide-y divide-slate-50">
                {log.exercises.map((ex) => (
                  <div key={ex.id} className="px-5 py-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">{ex.name}</p>
                    <p className="text-xs text-slate-400">
                      {ex.sets && `${ex.sets}x`}{ex.reps && `${ex.reps}`}{ex.weightKg ? ` · ${ex.weightKg}kg` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
