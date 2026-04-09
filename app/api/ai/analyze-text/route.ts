import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { analyzeFoodText } from "@/lib/ai"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const { text } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: "Falta el texto" }, { status: 400 })

    const analysis = await analyzeFoodText(text)
    return NextResponse.json(analysis)
  } catch (e: any) {
    return NextResponse.json({ error: "Error al analizar: " + e.message }, { status: 500 })
  }
}
