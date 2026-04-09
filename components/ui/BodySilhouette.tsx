"use client"
import { motion } from "framer-motion"

// Interpolacion entre dos numeros
function lerp(a: number, b: number, t: number) {
  return +(a + (b - a) * t).toFixed(2)
}

// Interpola un string de path SVG (ambos deben tener misma estructura)
function lerpPath(slim: number[], heavy: number[], t: number): string {
  return slim.map((v, i) => lerp(v, heavy[i], t)).join(" ")
}

function getBMIInfo(bmi: number) {
  if (bmi < 18.5) return { label: "Bajo peso", color: "#60a5fa" }
  if (bmi < 25)   return { label: "Peso normal", color: "#22c55e" }
  if (bmi < 30)   return { label: "Sobrepeso", color: "#f59e0b" }
  if (bmi < 35)   return { label: "Obesidad I", color: "#f97316" }
  return            { label: "Obesidad II", color: "#ef4444" }
}

// ─── PATHS BASE ────────────────────────────────────────────────────────────────
// ViewBox: 0 0 200 480   Centro: x=100
// Cada path es [x1,y1, x2,y2, ...] con la MISMA cantidad de numeros para poder interpolar

// TORSO: de cuello a crotch (sin brazos)
// Orden: M + lado derecho bajando + L crotch + lado izquierdo subiendo + Z
const TORSO_SLIM = [
  // M - inicio cuello derecha
  108, 90,
  // C hombro derecho
  110, 87,  145, 92,  148, 108,
  // C pecho derecho
  150, 120,  148, 135, 142, 148,
  // C cintura derecha (ESTRECHA)
  136, 162,  120, 170, 118, 182,
  // C cadera derecha
  120, 194,  138, 204, 140, 216,
  // L crotch derecha
  118, 232,
  // L crotch izquierda
  82,  232,
  // C cadera izquierda
  60,  216,  62,  204, 64,  194,
  // C cintura izquierda (ESTRECHA)
  62,  182,  64,  162, 58,  148,
  // C pecho izquierdo
  52,  135,  50,  120, 52,  108,
  // C hombro izquierdo
  55,  92,   90,  87,  92,  90,
]

const TORSO_HEAVY = [
  // M - inicio cuello derecha
  108, 90,
  // C hombro derecho
  110, 87,  152, 90,  154, 108,
  // C pecho derecho (mas ancho)
  158, 122,  162, 140, 162, 155,
  // C barriga derecha (GRANDE - sin cintura)
  164, 172,  162, 186, 160, 198,
  // C cadera derecha (ancha)
  158, 212,  156, 220, 154, 228,
  // L crotch derecha
  122, 238,
  // L crotch izquierda
  78,  238,
  // C cadera izquierda
  44,  228,  44,  220, 42,  212,
  // C barriga izquierda (GRANDE)
  40,  198,  38,  186, 36,  172,
  // C pecho izquierdo
  38,  155,  38,  140, 42,  122,
  // C hombro izquierdo
  46,  108,  48,  90,  92,  90,
]

// BRAZO DERECHO: desde hombro hasta muneca
const ARM_R_SLIM  = [148,108, 156,116, 162,128, 166,148, 162,168, 156,188, 152,198, 142,202, 138,196, 140,178, 142,158, 140,138, 140,118, 140,108]
const ARM_R_HEAVY = [154,108, 164,116, 172,130, 178,152, 174,172, 168,192, 162,202, 150,206, 144,198, 146,178, 148,158, 148,136, 148,116, 148,108]

// BRAZO IZQUIERDO
const ARM_L_SLIM  = [52,108, 44,116, 38,128, 34,148, 38,168, 44,188, 48,198, 58,202, 62,196, 60,178, 58,158, 60,138, 60,118, 60,108]
const ARM_L_HEAVY = [46,108, 36,116, 28,130, 22,152, 26,172, 32,192, 38,202, 50,206, 56,198, 54,178, 52,158, 52,136, 52,116, 52,108]

// PIERNA DERECHA
const LEG_R_SLIM  = [118,232, 126,244, 132,262, 134,284, 130,310, 124,338, 120,364, 118,390, 118,418, 116,440, 114,456, 128,460, 138,456, 134,440, 130,418, 128,390, 126,364, 124,338, 118,310, 112,284, 106,262, 102,244, 100,232]
const LEG_R_HEAVY = [122,238, 134,252, 142,272, 146,296, 140,322, 132,350, 126,376, 122,402, 120,428, 116,446, 114,460, 130,464, 140,460, 136,446, 132,428, 128,402, 124,376, 118,350, 108,322, 102,296, 94,272, 88,252, 84,238]

// PIERNA IZQUIERDA
const LEG_L_SLIM  = [82,232, 98,244, 94,262, 90,284, 86,310, 80,338, 76,364, 74,390, 72,418, 70,440, 68,456, 82,460, 86,456, 84,440, 82,418, 82,390, 80,364, 76,338, 70,310, 68,284, 68,262, 74,244, 82,232]
const LEG_L_HEAVY = [78,238, 92,252, 88,272, 80,296, 70,322, 62,350, 58,376, 56,402, 54,428, 52,446, 50,460, 66,464, 70,460, 68,446, 66,428, 66,402, 64,376, 68,350, 78,322, 88,296, 100,272, 106,252, 116,238]

// Convierte array de numeros en path string para torso (M + C x 4 + L + L + C x 4 + Z)
function buildTorsoPath(pts: number[]): string {
  const p = pts
  return [
    `M ${p[0]} ${p[1]}`,
    `C ${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}`,
    `C ${p[8]} ${p[9]} ${p[10]} ${p[11]} ${p[12]} ${p[13]}`,
    `C ${p[14]} ${p[15]} ${p[16]} ${p[17]} ${p[18]} ${p[19]}`,
    `C ${p[20]} ${p[21]} ${p[22]} ${p[23]} ${p[24]} ${p[25]}`,
    `L ${p[26]} ${p[27]}`,
    `L ${p[28]} ${p[29]}`,
    `C ${p[30]} ${p[31]} ${p[32]} ${p[33]} ${p[34]} ${p[35]}`,
    `C ${p[36]} ${p[37]} ${p[38]} ${p[39]} ${p[40]} ${p[41]}`,
    `C ${p[42]} ${p[43]} ${p[44]} ${p[45]} ${p[46]} ${p[47]}`,
    `C ${p[48]} ${p[49]} ${p[50]} ${p[51]} ${p[52]} ${p[53]}`,
    `Z`,
  ].join(" ")
}

// Convierte array de numeros en path string para brazo (M + serie de L)
function buildArmPath(pts: number[]): string {
  const parts = [`M ${pts[0]} ${pts[1]}`]
  for (let i = 2; i < pts.length; i += 2) {
    parts.push(`L ${pts[i]} ${pts[i + 1]}`)
  }
  parts.push("Z")
  return parts.join(" ")
}

// Convierte array de numeros en path string para pierna
function buildLegPath(pts: number[]): string {
  return buildArmPath(pts)
}

// ─── BODY SHAPE COMPONENT ─────────────────────────────────────────────────────
function BodyShape({ weightKg, heightCm, color, opacity = 1 }: {
  weightKg: number
  heightCm: number
  color: string
  opacity?: number
}) {
  const bmi = weightKg / Math.pow(heightCm / 100, 2)
  const f = Math.max(0, Math.min(1, (bmi - 18) / 20))

  const torsoPts  = TORSO_SLIM.map((v, i) => lerp(v, TORSO_HEAVY[i], f))
  const armRPts   = ARM_R_SLIM.map((v, i) => lerp(v, ARM_R_HEAVY[i], f))
  const armLPts   = ARM_L_SLIM.map((v, i) => lerp(v, ARM_L_HEAVY[i], f))
  const legRPts   = LEG_R_SLIM.map((v, i) => lerp(v, LEG_R_HEAVY[i], f))
  const legLPts   = LEG_L_SLIM.map((v, i) => lerp(v, LEG_L_HEAVY[i], f))

  const torsoD  = buildTorsoPath(torsoPts)
  const armRD   = buildArmPath(armRPts)
  const armLD   = buildArmPath(armLPts)
  const legRD   = buildLegPath(legRPts)
  const legLD   = buildLegPath(legLPts)

  // Radio cabeza y cuello
  const headR = lerp(28, 32, f)
  const neckX = lerp(85, 83, f)
  const neckW = lerp(30, 34, f)

  return (
    <g opacity={opacity}>
      {/* Cabeza */}
      <motion.circle cx={100} cy={headR + 4} r={headR} fill={color} animate={{ r: headR }} transition={{ duration: 0.6, ease: "easeInOut" }} />
      {/* Cuello */}
      <motion.rect x={neckX} y={62} width={neckW} height={32} rx={6} fill={color} animate={{ x: neckX, width: neckW }} transition={{ duration: 0.6 }} />
      {/* Torso */}
      <motion.path d={torsoD} fill={color} animate={{ d: torsoD }} transition={{ duration: 0.6, ease: "easeInOut" }} />
      {/* Brazos */}
      <motion.path d={armRD} fill={color} animate={{ d: armRD }} transition={{ duration: 0.6, ease: "easeInOut" }} />
      <motion.path d={armLD} fill={color} animate={{ d: armLD }} transition={{ duration: 0.6, ease: "easeInOut" }} />
      {/* Piernas */}
      <motion.path d={legRD} fill={color} animate={{ d: legRD }} transition={{ duration: 0.6, ease: "easeInOut" }} />
      <motion.path d={legLD} fill={color} animate={{ d: legLD }} transition={{ duration: 0.6, ease: "easeInOut" }} />
    </g>
  )
}

// ─── COMPARATIVA SUPERPUESTA ──────────────────────────────────────────────────
export function BodyComparison({ initialWeight, currentWeight, heightCm }: {
  initialWeight: number
  currentWeight: number
  heightCm: number
}) {
  const currentBmi = currentWeight / Math.pow(heightCm / 100, 2)
  const { color: currentColor } = getBMIInfo(currentBmi)
  const change = +(currentWeight - initialWeight).toFixed(1)

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 470" className="w-40 md:w-52 h-auto">
        {/* Silueta inicial: azul semitransparente */}
        <BodyShape weightKg={initialWeight} heightCm={heightCm} color="#3b82f6" opacity={0.4} />
        {/* Silueta actual: color IMC encima */}
        <BodyShape weightKg={currentWeight} heightCm={heightCm} color={currentColor} opacity={0.88} />
      </svg>

      {/* Leyenda */}
      <div className="flex items-center gap-5 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-400 opacity-60" />
          <span className="text-slate-500">Inicio <b className="text-slate-700">{initialWeight} kg</b></span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentColor }} />
          <span className="text-slate-500">Ahora <b className="text-slate-700">{currentWeight} kg</b></span>
        </div>
      </div>

      <div className={`text-sm font-bold px-4 py-1.5 rounded-full ${change < 0 ? "bg-green-100 text-green-700" : change > 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}`}>
        {change < 0 ? `↓ ${Math.abs(change)} kg perdidos` : change > 0 ? `↑ ${change} kg ganados` : "Sin cambios"}
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
      <svg viewBox="0 0 200 470" className="w-24 md:w-32 h-auto">
        <BodyShape weightKg={weightKg} heightCm={heightCm} color={color} opacity={faded ? 0.38 : 1} />
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
