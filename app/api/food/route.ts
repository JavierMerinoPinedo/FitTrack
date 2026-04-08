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

  const logs = await prisma.foodLog.findMany({
    where: { userId, date: { gte: startOfDay(date), lte: endOfDay(date) } },
    orderBy: { date: "asc" },
  })

  return NextResponse.json(logs)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const body = await req.json()

  const log = await prisma.foodLog.create({
    data: {
      userId,
      mealType: body.mealType,
      name: body.name,
      calories: body.calories,
      proteinG: body.proteinG ?? 0,
      carbsG: body.carbsG ?? 0,
      fatG: body.fatG ?? 0,
      quantity: body.quantity ?? 1,
      unit: body.unit ?? "porcion",
      imageUrl: body.imageUrl ?? null,
      aiDetected: body.aiDetected ?? false,
      notes: body.notes ?? null,
    },
  })

  return NextResponse.json(log)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user!.id as string
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 })

  await prisma.foodLog.deleteMany({ where: { id, userId } })
  return NextResponse.json({ ok: true })
}
