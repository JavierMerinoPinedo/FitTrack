import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import Link from "next/link"
import MacroRing from "@/components/ui/MacroRing"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user!.id as string

  const today = new Date()
  const [profile, foodToday, workoutToday, latestWeight] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.foodLog.findMany({
      where: { userId, date: { gte: startOfDay(today), lte: endOfDay(today) } },
    }),
    prisma.workoutLog.findFirst({
      where: { userId, date: { gte: startOfDay(today), lte: endOfDay(today) } },
    }),
    prisma.weightLog.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
  ])

  const totalCalories = foodToday.reduce((s, f) => s + f.calories, 0)
  const totalProtein = foodToday.reduce((s, f) => s + f.proteinG, 0)
  const totalCarbs = foodToday.reduce((s, f) => s + f.carbsG, 0)
  const totalFat = foodToday.reduce((s, f) => s + f.fatG, 0)
  const goalCal = profile?.dailyCalories ?? 2000
  const pct = Math.min(Math.round((totalCalories / goalCal) * 100), 100)

  const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
  const dayName = days[today.getDay()]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Hola, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">{dayName}, {today.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</p>
      </div>

      {!profile && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-800 text-sm">Completa tu perfil</p>
            <p className="text-amber-600 text-xs mt-0.5">Necesitamos tus datos para calcular tus calorias y generar tu planning</p>
          </div>
          <Link href="/profile" className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">
            Completar
          </Link>
        </div>
      )}

      {/* Calorias del dia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Calorias hoy</h2>
            <Link href="/food" className="text-emerald-600 text-sm font-medium hover:underline">+ Anadir</Link>
          </div>
          <div className="flex items-center gap-6">
            <MacroRing pct={pct} calories={Math.round(totalCalories)} goal={goalCal} />
            <div className="flex-1 space-y-3">
              {[
                { label: "Proteinas", value: Math.round(totalProtein), unit: "g", color: "bg-blue-400" },
                { label: "Carbohidratos", value: Math.round(totalCarbs), unit: "g", color: "bg-yellow-400" },
                { label: "Grasas", value: Math.round(totalFat), unit: "g", color: "bg-orange-400" },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${m.color} shrink-0`} />
                  <span className="text-sm text-slate-600 flex-1">{m.label}</span>
                  <span className="text-sm font-semibold text-slate-800">{m.value}{m.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Peso actual</p>
            <p className="text-2xl font-bold text-slate-800">
              {latestWeight ? `${latestWeight.weightKg} kg` : "—"}
            </p>
            {profile?.goalWeightKg && latestWeight && (
              <p className="text-xs text-slate-400 mt-1">
                Objetivo: {profile.goalWeightKg} kg
                ({latestWeight.weightKg > profile.goalWeightKg
                  ? `faltan ${(latestWeight.weightKg - profile.goalWeightKg).toFixed(1)} kg`
                  : "¡objetivo alcanzado!"})
              </p>
            )}
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Entreno hoy</p>
            {workoutToday ? (
              <p className="text-sm font-semibold text-emerald-600">{workoutToday.name} ✓</p>
            ) : (
              <Link href="/training" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                Sin registrar — Anadir
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Comidas de hoy */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-800">Comidas de hoy</h2>
          <Link href="/food" className="text-emerald-600 text-sm font-medium hover:underline">Ver todo</Link>
        </div>
        {foodToday.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-slate-400 text-sm">No has registrado nada hoy</p>
            <Link href="/food" className="inline-block mt-3 bg-emerald-500 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
              Registrar comida
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {foodToday.slice(0, 5).map((f) => (
              <div key={f.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{f.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{f.mealType} · {f.quantity} {f.unit}</p>
                </div>
                <span className="text-sm font-semibold text-slate-600">{Math.round(f.calories)} kcal</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accesos rapidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/food", icon: "📸", label: "Foto de comida" },
          { href: "/training", icon: "🏋️", label: "Registrar entreno" },
          { href: "/meal-plan", icon: "🤖", label: "Generar planning" },
          { href: "/progress", icon: "⚖️", label: "Anotar peso" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-emerald-50 transition-all text-center"
          >
            <div className="text-2xl mb-1">{a.icon}</div>
            <p className="text-xs font-medium text-slate-600">{a.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
