export const MEAL_TYPES = [
  { value: "breakfast", label: "Desayuno", icon: "🌅" },
  { value: "midmorning", label: "Media mañana", icon: "🍎" },
  { value: "lunch", label: "Comida", icon: "☀️" },
  { value: "snack", label: "Merienda", icon: "🧃" },
  { value: "dinner", label: "Cena", icon: "🌙" },
  { value: "other", label: "Otro", icon: "🍴" },
] as const

export type MealType = typeof MEAL_TYPES[number]["value"]

export function getMealLabel(type: string) {
  return MEAL_TYPES.find((m) => m.value === type)?.label ?? type
}

export function getMealIcon(type: string) {
  return MEAL_TYPES.find((m) => m.value === type)?.icon ?? "🍴"
}
