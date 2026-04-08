import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { analyzeFoodImage } from "@/lib/ai"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const { imageBase64, mimeType } = await req.json()
    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Falta la imagen" }, { status: 400 })
    }

    const analysis = await analyzeFoodImage(imageBase64, mimeType)
    return NextResponse.json(analysis)
  } catch (e: any) {
    return NextResponse.json({ error: "Error al analizar la imagen: " + e.message }, { status: 500 })
  }
}
