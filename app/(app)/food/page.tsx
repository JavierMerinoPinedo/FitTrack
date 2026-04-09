"use client"
import { useState, useEffect, useRef } from "react"
import { MEAL_TYPES, getMealLabel, getMealIcon } from "@/lib/meals"

type MealTypeVal = typeof MEAL_TYPES[number]["value"]

interface FoodEntry {
  id: string
  name: string
  mealType: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  quantity: number
  unit: string
  aiDetected: boolean
}

interface AiFood {
  name: string
  quantity: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

interface AiResult {
  foods: AiFood[]
  totalCalories: number
  confidence: string
  notes: string
}

export default function FoodPage() {
  const [logs, setLogs] = useState<FoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"log" | "chat" | "camera" | "manual">("log")
  const [mealType, setMealType] = useState<MealTypeVal>("lunch")
  const [analyzing, setAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [chatText, setChatText] = useState("")
  const [manual, setManual] = useState({ name: "", calories: "", proteinG: "", carbsG: "", fatG: "", quantity: "1", unit: "porcion" })
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadLogs() {
    setLoading(true)
    const res = await fetch("/api/food")
    setLogs(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadLogs() }, [])

  async function handleChatSubmit() {
    if (!chatText.trim()) return
    setAnalyzing(true)
    setAiResult(null)
    try {
      const res = await fetch("/api/ai/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chatText }),
      })
      const data = await res.json()
      if (res.ok) setAiResult(data)
      else alert("Error: " + (data.error ?? "desconocido"))
    } catch {
      alert("Error al conectar con la IA")
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setImagePreview(dataUrl)
      setAnalyzing(true)
      setAiResult(null)
      try {
        const res = await fetch("/api/ai/analyze-food", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: dataUrl.split(",")[1], mimeType: file.type }),
        })
        const data = await res.json()
        if (res.ok) setAiResult(data)
        else alert("Error: " + (data.error ?? "desconocido"))
      } catch {
        alert("Error al analizar la imagen")
      } finally {
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  async function saveAiFood(food: AiFood) {
    setSaving(true)
    await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealType, name: food.name, calories: food.calories,
        proteinG: food.proteinG, carbsG: food.carbsG, fatG: food.fatG,
        quantity: 1, unit: food.quantity, aiDetected: true,
      }),
    })
    await loadLogs()
    setTab("log")
    setAiResult(null)
    setChatText("")
    setSaving(false)
  }

  async function saveAllAiFoods() {
    if (!aiResult) return
    setSaving(true)
    for (const food of aiResult.foods) {
      await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType, name: food.name, calories: food.calories,
          proteinG: food.proteinG, carbsG: food.carbsG, fatG: food.fatG,
          quantity: 1, unit: food.quantity, aiDetected: true,
        }),
      })
    }
    await loadLogs()
    setTab("log")
    setAiResult(null)
    setChatText("")
    setSaving(false)
  }

  async function saveManual() {
    if (!manual.name || !manual.calories) return
    setSaving(true)
    await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealType, name: manual.name, calories: parseFloat(manual.calories),
        proteinG: parseFloat(manual.proteinG) || 0, carbsG: parseFloat(manual.carbsG) || 0,
        fatG: parseFloat(manual.fatG) || 0, quantity: parseFloat(manual.quantity) || 1,
        unit: manual.unit, aiDetected: false,
      }),
    })
    setManual({ name: "", calories: "", proteinG: "", carbsG: "", fatG: "", quantity: "1", unit: "porcion" })
    await loadLogs()
    setTab("log")
    setSaving(false)
  }

  async function deleteFood(id: string) {
    await fetch(`/api/food?id=${id}`, { method: "DELETE" })
    setLogs(logs.filter((l) => l.id !== id))
  }

  const totalCal = logs.reduce((s: number, l) => s + l.calories, 0)
  const grouped = MEAL_TYPES.map((m) => ({
    ...m,
    items: logs.filter((l) => l.mealType === m.value),
  }))

  const tabs = [
    { key: "log", label: "Hoy", icon: "📋" },
    { key: "chat", label: "Chat IA", icon: "💬" },
    { key: "camera", label: "Foto", icon: "📸" },
    { key: "manual", label: "Manual", icon: "✏️" },
  ] as const

  const needsMealType = tab === "chat" || tab === "camera" || tab === "manual"

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Registro de comida</h1>
        <p className="text-slate-500 text-sm mt-0.5">Total hoy: <span className="font-semibold text-emerald-600">{Math.round(totalCal)} kcal</span></p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setAiResult(null) }}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${tab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Selector tipo de comida */}
      {needsMealType && (
        <div className="flex gap-1.5 flex-wrap">
          {MEAL_TYPES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMealType(m.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${mealType === m.value ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:border-emerald-300"}`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      )}

      {/* TAB: LOG */}
      {tab === "log" && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Cargando...</div>
          ) : (
            grouped.map((g) => {
              if (g.items.length === 0) return null
              return (
                <div key={g.value} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm">{g.icon} {g.label}</span>
                    <span className="text-xs text-slate-400">{Math.round(g.items.reduce((s: number, i) => s + i.calories, 0))} kcal</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {g.items.map((item) => (
                      <div key={item.id} className="px-4 py-3 flex items-center justify-between group">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {item.name}
                            {item.aiDetected && <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">IA</span>}
                          </p>
                          <p className="text-xs text-slate-400">{item.quantity} {item.unit} · P:{Math.round(item.proteinG)}g C:{Math.round(item.carbsG)}g G:{Math.round(item.fatG)}g</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-700">{Math.round(item.calories)} kcal</span>
                          <button onClick={() => deleteFood(item.id)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xl leading-none">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
          {!loading && logs.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-10 text-center">
              <p className="text-slate-400 text-sm">No has registrado nada hoy</p>
              <button onClick={() => setTab("chat")} className="mt-3 bg-emerald-500 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                Registrar con IA
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB: CHAT IA */}
      {tab === "chat" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <p className="text-sm text-slate-500">Describe lo que has comido con tus palabras y la IA estimara las calorias.</p>
            <textarea
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSubmit() } }}
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
              placeholder="Ej: Me he comido un bocadillo de jamon serrano con tomate y un cafe con leche entera"
            />
            <button
              onClick={handleChatSubmit}
              disabled={analyzing || !chatText.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analizando...</>
              ) : "💬 Analizar con IA"}
            </button>
          </div>

          {aiResult && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">Resultado del analisis</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  aiResult.confidence === "alta" ? "bg-green-100 text-green-700" :
                  aiResult.confidence === "media" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>Confianza: {aiResult.confidence}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {aiResult.foods.map((food, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{food.name}</p>
                      <p className="text-xs text-slate-400">{food.quantity} · P:{food.proteinG}g C:{food.carbsG}g G:{food.fatG}g</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{food.calories} kcal</span>
                      <button onClick={() => saveAiFood(food)} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
                {aiResult.notes && <p className="text-xs text-slate-400 flex-1">{aiResult.notes}</p>}
                <button onClick={saveAllAiFoods} disabled={saving} className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                  {saving ? "Guardando..." : "Guardar todo"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: FOTO */}
      {tab === "camera" && (
        <div className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded-xl object-cover" />
            ) : (
              <>
                <div className="text-4xl mb-3">📸</div>
                <p className="text-slate-600 font-medium text-sm">Haz clic para seleccionar una foto</p>
                <p className="text-slate-400 text-xs mt-1">La IA detectara los alimentos y sus calorias</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />

          {analyzing && (
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="inline-block w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-emerald-700 text-sm font-medium">Analizando imagen...</p>
            </div>
          )}

          {aiResult && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">Alimentos detectados</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  aiResult.confidence === "alta" ? "bg-green-100 text-green-700" :
                  aiResult.confidence === "media" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>Confianza: {aiResult.confidence}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {aiResult.foods.map((food, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{food.name}</p>
                      <p className="text-xs text-slate-400">{food.quantity} · P:{food.proteinG}g C:{food.carbsG}g G:{food.fatG}g</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{food.calories} kcal</span>
                      <button onClick={() => saveAiFood(food)} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-slate-50 flex justify-end">
                <button onClick={saveAllAiFoods} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-60">
                  {saving ? "Guardando..." : "Guardar todo"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: MANUAL */}
      {tab === "manual" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Pechuga de pollo a la plancha" />
            </div>
            {[
              { key: "calories", label: "Calorias (kcal)", placeholder: "250" },
              { key: "proteinG", label: "Proteinas (g)", placeholder: "30" },
              { key: "carbsG", label: "Carbohidratos (g)", placeholder: "0" },
              { key: "fatG", label: "Grasas (g)", placeholder: "5" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input type="number" value={(manual as any)[key]} onChange={(e) => setManual({ ...manual, [key]: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder={placeholder} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad</label>
              <input type="number" value={manual.quantity} onChange={(e) => setManual({ ...manual, quantity: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
              <select value={manual.unit} onChange={(e) => setManual({ ...manual, unit: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                {["porcion", "g", "ml", "unidad", "taza", "cucharada"].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <button onClick={saveManual} disabled={saving || !manual.name || !manual.calories}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">
            {saving ? "Guardando..." : "Guardar alimento"}
          </button>
        </div>
      )}
    </div>
  )
}
