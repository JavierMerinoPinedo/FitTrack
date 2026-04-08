import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get("date")
  const date = dateStr ? new Date(dateStr) : new Date()

  const logs = await prisma.workoutLog.findMany({
    where: { userId, date: { gte: startOfDay(date), lte: endOfDay(date) } },
    include: { exercises: true },
    orderBy: { date: "asc" },
  })

  return NextResponse.json(logs)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const body = await req.json()

  const log = await prisma.workoutLog.create({
    data: {
      userId,
      name: body.name,
      durationMin: body.durationMin ?? null,
      notes: body.notes ?? null,
      exercises: {
        create: (body.exercises ?? []).map((ex: any) => ({
          name: ex.name,
          sets: ex.sets ?? null,
          reps: ex.reps ?? null,
          weightKg: ex.weightKg ?? null,
          durationMin: ex.durationMin ?? null,
          notes: ex.notes ?? null,
        })),
      },
    },
    include: { exercises: true },
  })

  return NextResponse.json(log)
}
