import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateMealPlan } from "@/lib/ai"
import { calculateDailyCalories } from "@/lib/calories"
import { startOfWeek, differenceInYears } from "date-fns"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const plan = await prisma.mealPlan.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { days: { include: { meals: true }, orderBy: { dayOfWeek: "asc" } } },
  })

  return NextResponse.json(plan)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const { preferences } = await req.json().catch(() => ({}))

  const profile = await prisma.userProfile.findUnique({ where: { userId } })
  if (!profile) {
    return NextResponse.json({ error: "Completa tu perfil primero" }, { status: 400 })
  }

  // Si dailyCalories no esta guardado, lo calculamos al vuelo o usamos 2000 como base
  let dailyCalories = profile.dailyCalories
  if (!dailyCalories) {
    if (profile.weightKg && profile.heightCm && profile.birthDate && profile.gender && profile.activityLevel && profile.goal) {
      const age = differenceInYears(new Date(), profile.birthDate)
      dailyCalories = calculateDailyCalories({
        weightKg: profile.weightKg,
        heightCm: profile.heightCm,
        age,
        gender: profile.gender,
        activityLevel: profile.activityLevel,
        goal: profile.goal,
      })
    } else {
      // Fallback razonable segun objetivo
      dailyCalories = profile.goal === "lose_weight" ? 1600 : profile.goal === "gain_muscle" ? 2500 : 2000
    }
  }

  let aiPlan: any
  try {
    aiPlan = await generateMealPlan({
    dailyCalories,
    goal: profile.goal ?? "maintain",
    activityLevel: profile.activityLevel ?? "moderate",
      preferences,
    })
  } catch (e: any) {
    return NextResponse.json({ error: "Error de IA", details: e.message }, { status: 500 })
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  const plan = await prisma.mealPlan.create({
    data: {
      userId,
      weekStart,
      days: {
        create: aiPlan.days.map((d: any) => ({
          dayOfWeek: d.dayOfWeek,
          meals: {
            create: d.meals.map((m: any) => ({
              mealType: m.mealType,
              name: m.name,
              calories: m.calories,
              proteinG: m.proteinG,
              carbsG: m.carbsG,
              fatG: m.fatG,
              recipe: m.recipe ?? null,
            })),
          },
        })),
      },
    },
    include: { days: { include: { meals: true }, orderBy: { dayOfWeek: "asc" } } },
  })

  return NextResponse.json(plan)
}
