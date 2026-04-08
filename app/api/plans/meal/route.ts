import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateMealPlan } from "@/lib/ai"
import { startOfWeek } from "date-fns"

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
  if (!profile?.dailyCalories) {
    return NextResponse.json({ error: "Completa tu perfil primero" }, { status: 400 })
  }

  const aiPlan = await generateMealPlan({
    dailyCalories: profile.dailyCalories,
    goal: profile.goal ?? "maintain",
    activityLevel: profile.activityLevel ?? "moderate",
    preferences,
  })

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
