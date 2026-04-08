import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/layout/Sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
