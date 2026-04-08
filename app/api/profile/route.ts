import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateDailyCalories } from "@/lib/calories"
import { differenceInYears } from "date-fns"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const profile = await prisma.userProfile.findUnique({ where: { userId } })
  return NextResponse.json(profile)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const body = await req.json()

  // Calcular calorias objetivo automaticamente
  let dailyCalories: number | undefined
  if (body.weightKg && body.heightCm && body.birthDate && body.gender && body.activityLevel && body.goal) {
    const age = differenceInYears(new Date(), new Date(body.birthDate))
    dailyCalories = calculateDailyCalories({
      weightKg: parseFloat(body.weightKg),
      heightCm: parseFloat(body.heightCm),
      age,
      gender: body.gender,
      activityLevel: body.activityLevel,
      goal: body.goal,
    })
  }

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
      gender: body.gender,
      heightCm: body.heightCm ? parseFloat(body.heightCm) : undefined,
      weightKg: body.weightKg ? parseFloat(body.weightKg) : undefined,
      goalWeightKg: body.goalWeightKg ? parseFloat(body.goalWeightKg) : undefined,
      activityLevel: body.activityLevel,
      goal: body.goal,
      dailyCalories,
    },
    create: {
      userId,
      birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
      gender: body.gender,
      heightCm: body.heightCm ? parseFloat(body.heightCm) : undefined,
      weightKg: body.weightKg ? parseFloat(body.weightKg) : undefined,
      goalWeightKg: body.goalWeightKg ? parseFloat(body.goalWeightKg) : undefined,
      activityLevel: body.activityLevel,
      goal: body.goal,
      dailyCalories,
    },
  })

  return NextResponse.json(profile)
}
