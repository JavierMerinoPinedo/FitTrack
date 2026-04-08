import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface FoodAnalysis {
  foods: {
    name: string
    quantity: string
    calories: number
    proteinG: number
    carbsG: number
    fatG: number
  }[]
  totalCalories: number
  confidence: "alta" | "media" | "baja"
  notes: string
}

export async function analyzeFoodImage(imageBase64: string, mimeType: string): Promise<FoodAnalysis> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as any,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Analiza esta imagen de comida y devuelve un JSON con este formato exacto:
{
  "foods": [
    {
      "name": "nombre del alimento",
      "quantity": "cantidad estimada (ej: 150g, 1 unidad)",
      "calories": 250,
      "proteinG": 20,
      "carbsG": 30,
      "fatG": 8
    }
  ],
  "totalCalories": 250,
  "confidence": "alta|media|baja",
  "notes": "observaciones adicionales"
}
Solo devuelve el JSON, sin texto adicional.`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === "text" ? response.content[0].text : ""
  return JSON.parse(text)
}

export interface MealPlanInput {
  dailyCalories: number
  goal: string
  activityLevel: string
  preferences?: string
}

export async function generateMealPlan(input: MealPlanInput): Promise<any> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Crea un planning semanal de comidas (7 dias) para una persona con:
- Objetivo calorico diario: ${input.dailyCalories} kcal
- Objetivo: ${input.goal}
- Nivel de actividad: ${input.activityLevel}
${input.preferences ? `- Preferencias/restricciones: ${input.preferences}` : ""}

Devuelve SOLO un JSON con este formato:
{
  "days": [
    {
      "dayOfWeek": 0,
      "dayName": "Lunes",
      "meals": [
        {
          "mealType": "breakfast|lunch|dinner|snack",
          "name": "nombre del plato",
          "calories": 400,
          "proteinG": 30,
          "carbsG": 45,
          "fatG": 12,
          "recipe": "instrucciones breves de preparacion"
        }
      ]
    }
  ]
}`,
      },
    ],
  })

  const text = response.content[0].type === "text" ? response.content[0].text : ""
  return JSON.parse(text)
}

export interface WorkoutPlanInput {
  goal: string
  activityLevel: string
  daysPerWeek: number
  equipment?: string
}

export async function generateWorkoutPlan(input: WorkoutPlanInput): Promise<any> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Crea un planning semanal de ejercicios para una persona con:
- Objetivo: ${input.goal}
- Nivel de actividad: ${input.activityLevel}
- Dias de entrenamiento por semana: ${input.daysPerWeek}
${input.equipment ? `- Equipamiento disponible: ${input.equipment}` : "- Sin equipamiento especifico"}

Devuelve SOLO un JSON con este formato:
{
  "days": [
    {
      "dayOfWeek": 0,
      "dayName": "Lunes",
      "restDay": false,
      "name": "nombre del entrenamiento (ej: Pecho y Triceps)",
      "exercises": [
        {
          "name": "nombre del ejercicio",
          "sets": 3,
          "reps": "8-12",
          "restSeconds": 60,
          "notes": "indicaciones de forma o progresion"
        }
      ]
    }
  ]
}`,
      },
    ],
  })

  const text = response.content[0].type === "text" ? response.content[0].text : ""
  return JSON.parse(text)
}
