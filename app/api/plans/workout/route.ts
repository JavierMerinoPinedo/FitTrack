import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateWorkoutPlan } from "@/lib/ai"
import { startOfWeek } from "date-fns"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const plan = await prisma.workoutPlan.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { days: { include: { exercises: true }, orderBy: { dayOfWeek: "asc" } } },
  })

  return NextResponse.json(plan)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const body = await req.json().catch(() => ({}))

  const profile = await prisma.userProfile.findUnique({ where: { userId } })
  if (!profile) {
    return NextResponse.json({ error: "Completa tu perfil primero" }, { status: 400 })
  }

  let aiPlan: any
  try {
    aiPlan = await generateWorkoutPlan({
      goal: profile.goal ?? "lose_weight",
      activityLevel: profile.activityLevel ?? "moderate",
      daysPerWeek: body.daysPerWeek ?? 4,
      equipment: body.equipment,
      fixedDays: body.fixedDays,
      homeDays: body.homeDays,
    })
  } catch (e: any) {
    return NextResponse.json({ error: "Error de IA", details: e.message }, { status: 500 })
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  const plan = await prisma.workoutPlan.create({
    data: {
      userId,
      weekStart,
      days: {
        create: aiPlan.days.map((d: any) => ({
          dayOfWeek: d.dayOfWeek,
          restDay: d.restDay ?? false,
          name: d.name ?? null,
          exercises: {
            create: (d.exercises ?? []).map((ex: any) => ({
              name: ex.name,
              sets: ex.sets ?? null,
              reps: ex.reps ?? null,
              restSeconds: ex.restSeconds ?? null,
              notes: ex.notes ?? null,
            })),
          },
        })),
      },
    },
    include: { days: { include: { exercises: true }, orderBy: { dayOfWeek: "asc" } } },
  })

  return NextResponse.json(plan)
}
