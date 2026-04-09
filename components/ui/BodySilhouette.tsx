"use client"

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function getBMIInfo(bmi: number) {
  if (bmi < 18.5) return { label: "Bajo peso", color: "#60a5fa" }
  if (bmi < 25)   return { label: "Peso normal", color: "#22c55e" }
  if (bmi < 30)   return { label: "Sobrepeso", color: "#f59e0b" }
  if (bmi < 35)   return { label: "Obesidad I", color: "#f97316" }
  return            { label: "Obesidad II", color: "#ef4444" }
}

function BodyShape({ weightKg, heightCm, color, opacity = 1 }: {
  weightKg: number
  heightCm: number
  color: string
  opacity?: number
}) {
  const bmi = weightKg / Math.pow(heightCm / 100, 2)
  const f = Math.max(0, Math.min(1, (bmi - 18) / 20))
  const l = (a: number, b: number) => lerp(a, b, f)
  const cx = 50

  // Medidas clave (mitad del ancho)
  const nk = l(4.5, 6)     // cuello
  const sh = l(22, 30)     // hombros
  const ch = l(18, 27)     // pecho
  const wa = l(13, 26)     // cintura
  const hi = l(20, 29)     // caderas
  const th = l(11, 17)     // muslo
  const kn = l(8, 12.5)    // rodilla
  const ca = l(6.5, 10)    // gemelo
  const an = l(4, 6)       // tobillo
  const ft = l(7.5, 10.5)  // pie
  const ar = l(5, 8)       // brazo radio

  // Torso como path suave (cuello → hombros → pecho → cintura → caderas)
  const torso = [
    `M ${cx - nk} 33`,
    `C ${cx - nk - 2} 36 ${cx - sh - 6} 40 ${cx - sh} 48`,
    `C ${cx - sh + 1} 57 ${cx - ch - 4} 63 ${cx - ch} 73`,
    `C ${cx - ch + 2} 83 ${cx - wa - 2} 97 ${cx - wa} 112`,
    `C ${cx - wa} 120 ${cx - hi + 1} 123 ${cx - hi} 131`,
    `L ${cx - hi + 2} 138 L ${cx - th - 1} 138 L ${cx - th - 1} 133`,
    `L ${cx + th + 1} 133 L ${cx + th + 1} 138 L ${cx + hi - 2} 138`,
    `L ${cx + hi} 131`,
    `C ${cx + hi + 1} 123 ${cx + wa} 120 ${cx + wa} 112`,
    `C ${cx + wa + 2} 97 ${cx + ch - 2} 83 ${cx + ch} 73`,
    `C ${cx + ch + 4} 63 ${cx + sh - 1} 57 ${cx + sh} 48`,
    `C ${cx + sh + 6} 40 ${cx + nk + 2} 36 ${cx + nk} 33 Z`,
  ].join(" ")

  // Pierna derecha
  const rLeg = [
    `M ${cx + th + 1} 133`,
    `C ${cx + th + 4} 140 ${cx + th + 2} 150 ${cx + th - 1} 162`,
    `C ${cx + kn + 1} 172 ${cx + kn} 178 ${cx + kn - 1} 184`,
    `C ${cx + ca} 196 ${cx + ca - 1} 204 ${cx + an + 1} 214`,
    `L ${cx + ft} 218 L ${cx + 3} 218`,
    `C ${cx + 2} 213 ${cx + 2} 205 ${cx + 2} 195`,
    `C ${cx + 2} 182 ${cx + 2} 170 ${cx + 2} 158`,
    `C ${cx + 2} 148 ${cx + 2} 140 ${cx + 2} 133 Z`,
  ].join(" ")

  // Pierna izquierda
  const lLeg = [
    `M ${cx - th - 1} 133`,
    `C ${cx - th - 4} 140 ${cx - th - 2} 150 ${cx - th + 1} 162`,
    `C ${cx - kn - 1} 172 ${cx - kn} 178 ${cx - kn + 1} 184`,
    `C ${cx - ca} 196 ${cx - ca + 1} 204 ${cx - an - 1} 214`,
    `L ${cx - ft} 218 L ${cx - 3} 218`,
    `C ${cx - 2} 213 ${cx - 2} 205 ${cx - 2} 195`,
    `C ${cx - 2} 182 ${cx - 2} 170 ${cx - 2} 158`,
    `C ${cx - 2} 148 ${cx - 2} 140 ${cx - 2} 133 Z`,
  ].join(" ")

  return (
    <g opacity={opacity}>
      {/* Cabeza */}
      <circle cx={cx} cy={l(17, 19)} r={l(12.5, 14.5)} fill={color} />
      {/* Cuello */}
      <rect x={cx - nk} y={29} width={nk * 2} height={8} rx={2} fill={color} />
      {/* Torso */}
      <path d={torso} fill={color} />
      {/* Brazos */}
      <ellipse cx={l(24, 16)} cy={l(78, 82)} rx={ar} ry={l(21, 25)} fill={color} transform={`rotate(${l(6, 12)}, ${l(24, 16)}, ${l(78, 82)})`} />
      <ellipse cx={l(76, 84)} cy={l(78, 82)} rx={ar} ry={l(21, 25)} fill={color} transform={`rotate(${-l(6, 12)}, ${l(76, 84)}, ${l(78, 82)})`} />
      {/* Piernas */}
      <path d={rLeg} fill={color} />
      <path d={lLeg} fill={color} />
      {/* Pies */}
      <ellipse cx={cx + l(7, 10)} cy={220} rx={ft} ry={l(3.5, 4.5)} fill={color} />
      <ellipse cx={cx - l(7, 10)} cy={220} rx={ft} ry={l(3.5, 4.5)} fill={color} />
    </g>
  )
}

// Componente de comparacion superpuesta
export function BodyComparison({ initialWeight, currentWeight, heightCm }: {
  initialWeight: number
  currentWeight: number
  heightCm: number
}) {
  const initialBmi = initialWeight / Math.pow(heightCm / 100, 2)
  const currentBmi = currentWeight / Math.pow(heightCm / 100, 2)
  const { color: currentColor } = getBMIInfo(currentBmi)
  const change = currentWeight - initialWeight

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Siluetas superpuestas */}
      <div className="relative">
        <svg viewBox="0 0 100 230" className="w-36 md:w-44 h-auto">
          {/* Silueta inicial en azul semitransparente */}
          <BodyShape weightKg={initialWeight} heightCm={heightCm} color="#3b82f6" opacity={0.45} />
          {/* Silueta actual encima */}
          <BodyShape weightKg={currentWeight} heightCm={heightCm} color={currentColor} opacity={0.9} />
        </svg>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-5 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-400 opacity-60" />
          <span className="text-slate-500">Inicio <span className="font-semibold text-slate-700">{initialWeight} kg</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentColor }} />
          <span className="text-slate-500">Ahora <span className="font-semibold text-slate-700">{currentWeight} kg</span></span>
        </div>
      </div>

      {/* Cambio */}
      <div className={`text-sm font-bold px-4 py-1.5 rounded-full ${change < 0 ? "bg-green-100 text-green-700" : change > 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}`}>
        {change < 0 ? `↓ ${Math.abs(change).toFixed(1)} kg perdidos` : change > 0 ? `↑ ${change.toFixed(1)} kg ganados` : "Sin cambios"}
      </div>
    </div>
  )
}

// Silueta individual (para objetivo)
export default function BodySilhouette({ weightKg, heightCm, label, sublabel, faded = false }: {
  weightKg: number
  heightCm: number
  label: string
  sublabel?: string
  faded?: boolean
}) {
  const bmi = weightKg / Math.pow(heightCm / 100, 2)
  const { label: bmiLabel, color } = getBMIInfo(bmi)

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 230" className="w-24 md:w-28 h-auto">
        <BodyShape weightKg={weightKg} heightCm={heightCm} color={color} opacity={faded ? 0.4 : 1} />
      </svg>
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-slate-800">{weightKg} kg</p>
        {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
        <p className="text-xs font-semibold mt-0.5" style={{ color }}>{bmiLabel}</p>
        <p className="text-xs text-slate-400">IMC {bmi.toFixed(1)}</p>
      </div>
    </div>
  )
}
