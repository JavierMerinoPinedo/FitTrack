import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const [weights, foodLast30] = await Promise.all([
    prisma.weightLog.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      take: 60,
    }),
    prisma.foodLog.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { date: "asc" },
    }),
  ])

  return NextResponse.json({ weights, foodLast30 })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const { weightKg, notes } = await req.json()

  const log = await prisma.weightLog.create({
    data: { userId, weightKg: parseFloat(weightKg), notes: notes ?? null },
  })

  // Actualizar peso en perfil
  await prisma.userProfile.upsert({
    where: { userId },
    update: { weightKg: parseFloat(weightKg) },
    create: { userId, weightKg: parseFloat(weightKg) },
  })

  return NextResponse.json(log)
}
