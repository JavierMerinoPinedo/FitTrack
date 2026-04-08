// Calculo de calorias diarias usando formula Mifflin-St Jeor
export function calculateDailyCalories(params: {
  weightKg: number
  heightCm: number
  age: number
  gender: string
  activityLevel: string
  goal: string
}): number {
  const { weightKg, heightCm, age, gender, activityLevel, goal } = params

  // TMB (Tasa Metabolica Basal)
  let tmb =
    gender === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161

  // Factor de actividad
  const activityFactors: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }
  const tdee = tmb * (activityFactors[activityLevel] ?? 1.2)

  // Ajuste segun objetivo
  if (goal === "lose_weight") return Math.round(tdee - 500)
  if (goal === "gain_muscle") return Math.round(tdee + 300)
  return Math.round(tdee)
}
