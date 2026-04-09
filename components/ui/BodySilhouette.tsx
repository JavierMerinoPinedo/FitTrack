"use client"

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function getBMIInfo(bmi: number) {
  if (bmi < 18.5) return { label: "Bajo peso", color: "#60a5fa" }
  if (bmi < 25)   return { label: "Peso normal", color: "#34d399" }
  if (bmi < 30)   return { label: "Sobrepeso", color: "#fbbf24" }
  if (bmi < 35)   return { label: "Obesidad I", color: "#fb923c" }
  return            { label: "Obesidad II", color: "#f87171" }
}

interface Props {
  weightKg: number
  heightCm: number
  label: string
  sublabel?: string
  faded?: boolean
}

export default function BodySilhouette({ weightKg, heightCm, label, sublabel, faded = false }: Props) {
  const bmi = weightKg / Math.pow(heightCm / 100, 2)
  // factor 0 = IMC 18 (muy delgado), 1 = IMC 38+ (obeso)
  const f = Math.max(0, Math.min(1, (bmi - 18) / 20))
  const { label: bmiLabel, color } = getBMIInfo(bmi)
  const cx = 50
  const op = faded ? 0.35 : 1

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 100 215" className="w-24 md:w-28 h-auto drop-shadow-sm" style={{ transition: "all 0.6s ease" }}>
        {/* Cabeza */}
        <ellipse cx={cx} cy={18} rx={lerp(11, 13, f)} ry={lerp(12, 14, f)} fill={color} opacity={op} />

        {/* Cuello */}
        <rect x={cx - 5} y={29} width={10} height={8} rx={2} fill={color} opacity={op} />

        {/* Hombros / torso superior */}
        <ellipse cx={cx} cy={56} rx={lerp(22, 31, f)} ry={lerp(17, 20, f)} fill={color} opacity={op} />

        {/* Vientre */}
        <ellipse cx={cx} cy={82} rx={lerp(16, 30, f)} ry={lerp(13, 21, f)} fill={color} opacity={op} />

        {/* Caderas */}
        <ellipse cx={cx} cy={105} rx={lerp(20, 29, f)} ry={lerp(10, 13, f)} fill={color} opacity={op} />

        {/* Brazo izquierdo */}
        <ellipse cx={lerp(26, 18, f)} cy={72} rx={lerp(5, 8, f)} ry={19} fill={color} opacity={op} />

        {/* Brazo derecho */}
        <ellipse cx={lerp(74, 82, f)} cy={72} rx={lerp(5, 8, f)} ry={19} fill={color} opacity={op} />

        {/* Muslo izquierdo */}
        <ellipse cx={lerp(38, 33, f)} cy={138} rx={lerp(9, 14, f)} ry={21} fill={color} opacity={op} />

        {/* Muslo derecho */}
        <ellipse cx={lerp(62, 67, f)} cy={138} rx={lerp(9, 14, f)} ry={21} fill={color} opacity={op} />

        {/* Pierna izquierda */}
        <ellipse cx={lerp(37, 31, f)} cy={177} rx={lerp(6, 9, f)} ry={16} fill={color} opacity={op} />

        {/* Pierna derecha */}
        <ellipse cx={lerp(63, 69, f)} cy={177} rx={lerp(6, 9, f)} ry={16} fill={color} opacity={op} />

        {/* Pie izquierdo */}
        <ellipse cx={lerp(34, 28, f)} cy={196} rx={lerp(7, 10, f)} ry={3.5} fill={color} opacity={op} />

        {/* Pie derecho */}
        <ellipse cx={lerp(66, 72, f)} cy={196} rx={lerp(7, 10, f)} ry={3.5} fill={color} opacity={op} />
      </svg>

      <div className="text-center">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{weightKg} kg</p>
        {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
        <p className="text-xs font-semibold mt-1" style={{ color }}>{bmiLabel}</p>
        <p className="text-xs text-slate-400">IMC {bmi.toFixed(1)}</p>
      </div>
    </div>
  )
}
