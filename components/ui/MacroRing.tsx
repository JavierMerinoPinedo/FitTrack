"use client"

export default function MacroRing({ pct, calories, goal }: { pct: number; calories: number; goal: number }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-800">{calories}</span>
        <span className="text-xs text-slate-400">/ {goal}</span>
        <span className="text-xs text-emerald-500 font-medium">{pct}%</span>
      </div>
    </div>
  )
}
