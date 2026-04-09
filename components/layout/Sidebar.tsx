"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const links = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/food", label: "Comida", icon: "🍽️" },
  { href: "/training", label: "Entreno", icon: "💪" },
  { href: "/meal-plan", label: "Planning", icon: "🤖" },
  { href: "/progress", label: "Progreso", icon: "📈" },
  { href: "/profile", label: "Perfil", icon: "👤" },
]

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar escritorio */}
      <aside className="hidden md:flex w-60 bg-white border-r border-slate-100 flex-col h-full shrink-0">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
            <span className="font-bold text-slate-800">FitTrack AI</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {links.map((link) => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left text-sm text-slate-500 hover:text-red-500 px-2 py-1 rounded transition-colors"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Navegacion inferior movil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 flex">
        {links.map((link) => {
          const active = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <span className="text-xl leading-none">{link.icon}</span>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
