import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FitTrack AI — Tu asistente de nutricion y entrenamiento",
  description: "Registra tu alimentacion con IA, planifica tu semana y sigue tu progreso",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
