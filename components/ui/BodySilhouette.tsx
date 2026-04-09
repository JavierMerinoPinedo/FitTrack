"use client"
import { motion } from "framer-motion"

function lerp(a: number, b: number, t: number) {
  return +(a + (b - a) * t).toFixed(2)
}

function getBMIInfo(bmi: number) {
  if (bmi < 18.5) return { label: "Bajo peso",   color: "#60a5fa" }
  if (bmi < 25)   return { label: "Peso normal",  color: "#22c55e" }
  if (bmi < 30)   return { label: "Sobrepeso",    color: "#f59e0b" }
  if (bmi < 35)   return { label: "Obesidad I",   color: "#f97316" }
  return            { label: "Obesidad II",  color: "#ef4444" }
}

// ─── COORDENADAS BASE ──────────────────────────────────────────────────────────
// ViewBox 0 0 100 246  |  Centro x=50
// SLIM  = IMC ~20   |   HEAVY = IMC ~38

// TORSO:  M(2) + C(6)×5 + L(2) + L(2) + C(6)×5 + Z  = 66 valores
const T_SLIM = [
  // M (cuello derecho)
  56, 32,
  // C hombro derecho
  66, 32,  76, 38,  76, 44,
  // C pecho derecho
  76, 54,  76, 62,  76, 68,
  // C cintura derecha — se ESTRECHA notablemente
  74, 84,  68, 96,  64, 108,
  // C cadera derecha — se ENSANCHA
  62, 118, 68, 126, 72, 134,
  // C esquina crotch derecho
  72, 142, 64, 148, 56, 152,
  // L — V del crotch
  50, 158,
  // L — esquina crotch izquierdo
  44, 152,
  // C cadera izquierda
  36, 148, 28, 142, 28, 134,
  // C cintura izquierda — ESTRECHA
  32, 126, 36, 118, 36, 108,
  // C pecho izquierdo
  26, 96,  24, 84,  24, 68,
  // C axila / hombro izquierdo
  24, 62,  24, 54,  24, 44,
  // C cuello izquierdo
  24, 38,  34, 32,  44, 32,
]

const T_HEAVY = [
  // M (cuello derecho)
  56, 32,
  // C hombro derecho
  66, 32,  80, 38,  80, 44,
  // C pecho derecho — más ancho
  80, 54,  84, 62,  84, 68,
  // C barriga derecha — SIN cintura, sale hacia afuera
  85, 84,  86, 100, 86, 108,
  // C cadera derecha — muy ancha
  86, 118, 84, 126, 80, 134,
  // C esquina crotch derecho
  78, 142, 70, 148, 62, 152,
  // L
  50, 158,
  // L
  38, 152,
  // C cadera izquierda
  30, 148, 22, 142, 20, 134,
  // C barriga izquierda — muy ancha
  16, 126, 14, 118, 14, 108,
  // C pecho izquierdo
  14, 100, 15, 84,  16, 68,
  // C axila / hombro
  16, 62,  20, 54,  20, 44,
  // C cuello
  20, 38,  34, 32,  44, 32,
]

// PIERNA DERECHA: M(2) + C(6)×2 + L(2)×4 + C(6)×2 + Z  = 34 valores
const RL_SLIM = [
  53, 153,
  53, 163, 54, 176, 54, 190,
  54, 204, 53, 216, 52, 228,
  47, 230,  47, 234,
  63, 234,  63, 230,
  62, 216, 62, 204, 62, 190,
  63, 176, 64, 163, 65, 153,
]
const RL_HEAVY = [
  54, 153,
  56, 163, 58, 178, 60, 192,
  61, 207, 59, 218, 57, 228,
  50, 230,  50, 234,
  70, 234,  70, 230,
  68, 218, 67, 207, 67, 192,
  68, 178, 70, 163, 68, 153,
]

// PIERNA IZQUIERDA
const LL_SLIM = [
  47, 153,
  47, 163, 46, 176, 46, 190,
  46, 204, 47, 216, 48, 228,
  53, 230,  53, 234,
  37, 234,  37, 230,
  38, 216, 38, 204, 38, 190,
  37, 176, 36, 163, 35, 153,
]
const LL_HEAVY = [
  46, 153,
  44, 163, 42, 178, 40, 192,
  39, 207, 41, 218, 43, 228,
  50, 230,  50, 234,
  30, 234,  30, 230,
  32, 218, 33, 207, 33, 192,
  32, 178, 30, 163, 32, 153,
]

// ─── CONSTRUCTORES DE PATH ─────────────────────────────────────────────────────
function buildTorso(p: number[]): string {
  return `M${p[0]} ${p[1]} C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]} C${p[8]} ${p[9]} ${p[10]} ${p[11]} ${p[12]} ${p[13]} C${p[14]} ${p[15]} ${p[16]} ${p[17]} ${p[18]} ${p[19]} C${p[20]} ${p[21]} ${p[22]} ${p[23]} ${p[24]} ${p[25]} C${p[26]} ${p[27]} ${p[28]} ${p[29]} ${p[30]} ${p[31]} L${p[32]} ${p[33]} L${p[34]} ${p[35]} C${p[36]} ${p[37]} ${p[38]} ${p[39]} ${p[40]} ${p[41]} C${p[42]} ${p[43]} ${p[44]} ${p[45]} ${p[46]} ${p[47]} C${p[48]} ${p[49]} ${p[50]} ${p[51]} ${p[52]} ${p[53]} C${p[54]} ${p[55]} ${p[56]} ${p[57]} ${p[58]} ${p[59]} C${p[60]} ${p[61]} ${p[62]} ${p[63]} ${p[64]} ${p[65]} Z`
}

function buildLeg(p: number[]): string {
  return `M${p[0]} ${p[1]} C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]} C${p[8]} ${p[9]} ${p[10]} ${p[11]} ${p[12]} ${p[13]} L${p[14]} ${p[15]} L${p[16]} ${p[17]} L${p[18]} ${p[19]} L${p[20]} ${p[21]} C${p[22]} ${p[23]} ${p[24]} ${p[25]} ${p[26]} ${p[27]} C${p[28]} ${p[29]} ${p[30]} ${p[31]} ${p[32]} ${p[33]} Z`
}

// ─── BODY SHAPE ────────────────────────────────────────────────────────────────
function BodyShape({ weightKg, heightCm, color, opacity = 1 }: {
  weightKg: number
  heightCm: number
  color: string
  opacity?: number
}) {
  const bmi = weightKg / Math.pow(heightCm / 100, 2)
  const f = Math.max(0, Math.min(1, (bmi - 18) / 20))
  const l = (a: number, b: number) => lerp(a, b, f)

  const tPts  = T_SLIM.map((v, i) => l(v, T_HEAVY[i]))
  const rlPts = RL_SLIM.map((v, i) => l(v, RL_HEAVY[i]))
  const llPts = LL_SLIM.map((v, i) => l(v, LL_HEAVY[i]))

  const torsoD = buildTorso(tPts)
  const rlD    = buildLeg(rlPts)
  const llD    = buildLeg(llPts)

  const headR   = l(14, 15.5)
  const neckX   = l(45, 43)
  const neckW   = l(10, 14)

  // Brazos (elipses rotadas)
  const aRcx = l(83, 93),  aRcy = l(80, 82), aRrx = l(6.5, 9.5), aRry = l(24, 27), aRrot = l(5, 9)
  const aLcx = l(17, 7),   aLcy = l(80, 82), aLrx = l(6.5, 9.5), aLry = l(24, 27), aLrot = l(-5, -9)

  // Pies
  const fRcx = l(55, 60), fLcx = l(45, 40), fRx = l(9, 11), fRy = l(3.5, 4.5)

  const T = { duration: 0.6, ease: "easeInOut" as const }

  return (
    <g opacity={opacity}>
      {/* Cabeza */}
      <motion.circle cx={50} cy={headR + 2} r={headR} fill={color} animate={{ r: headR }} transition={T} />
      {/* Cuello */}
      <motion.rect x={neckX} y={29} width={neckW} height={8} rx={3} fill={color} animate={{ x: neckX, width: neckW }} transition={T} />
      {/* Torso */}
      <motion.path d={torsoD} fill={color} animate={{ d: torsoD }} transition={T} />
      {/* Brazo derecho */}
      <motion.ellipse cx={aRcx} cy={aRcy} rx={aRrx} ry={aRry} fill={color}
        style={{ transformOrigin: `${aRcx}px ${aRcy}px`, rotate: `${aRrot}deg` }}
        animate={{ cx: aRcx, cy: aRcy, rx: aRrx, ry: aRry }} transition={T} />
      {/* Brazo izquierdo */}
      <motion.ellipse cx={aLcx} cy={aLcy} rx={aLrx} ry={aLry} fill={color}
        style={{ transformOrigin: `${aLcx}px ${aLcy}px`, rotate: `${aLrot}deg` }}
        animate={{ cx: aLcx, cy: aLcy, rx: aLrx, ry: aLry }} transition={T} />
      {/* Piernas */}
      <motion.path d={rlD} fill={color} animate={{ d: rlD }} transition={T} />
      <motion.path d={llD} fill={color} animate={{ d: llD }} transition={T} />
      {/* Pies */}
      <motion.ellipse cx={fRcx} cy={236} rx={fRx} ry={fRy} fill={color} animate={{ cx: fRcx, rx: fRx }} transition={T} />
      <motion.ellipse cx={fLcx} cy={236} rx={fRx} ry={fRy} fill={color} animate={{ cx: fLcx, rx: fRx }} transition={T} />
    </g>
  )
}

// ─── COMPARATIVA SUPERPUESTA ──────────────────────────────────────────────────
export function BodyComparison({ initialWeight, currentWeight, heightCm }: {
  initialWeight: number
  currentWeight: number
  heightCm: number
}) {
  const { color } = getBMIInfo(currentWeight / Math.pow(heightCm / 100, 2))
  const change = +(currentWeight - initialWeight).toFixed(1)

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 100 246" className="w-44 md:w-56 h-auto drop-shadow-sm">
        <BodyShape weightKg={initialWeight} heightCm={heightCm} color="#3b82f6" opacity={0.38} />
        <BodyShape weightKg={currentWeight} heightCm={heightCm} color={color}   opacity={0.90} />
      </svg>

      <div className="flex items-center gap-5 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-400 opacity-50" />
          <span className="text-slate-500">Inicio <b className="text-slate-700">{initialWeight} kg</b></span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-slate-500">Ahora <b className="text-slate-700">{currentWeight} kg</b></span>
        </div>
      </div>

      <div className={`text-sm font-bold px-4 py-1.5 rounded-full ${
        change < 0 ? "bg-green-100 text-green-700" :
        change > 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
      }`}>
        {change < 0 ? `↓ ${Math.abs(change)} kg perdidos` :
         change > 0 ? `↑ ${change} kg ganados` : "Sin cambios"}
      </div>
    </div>
  )
}

// ─── SILUETA INDIVIDUAL (objetivo) ───────────────────────────────────────────
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
      <svg viewBox="0 0 100 246" className="w-28 md:w-36 h-auto">
        <BodyShape weightKg={weightKg} heightCm={heightCm} color={color} opacity={faded ? 0.35 : 1} />
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
