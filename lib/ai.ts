import { GoogleGenAI } from "@google/genai"
import Groq from "groq-sdk"

// Gemini solo para vision (fotos de comida)
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

// Groq para generacion de texto (plannings)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })
const GROQ_MODEL = "llama-3.3-70b-versatile"

function parseJSON(text: string, source: string): any {
  const clean = text.replace(/```json|```/g, "").trim()
  // Extraer JSON si viene envuelto en texto
  const match = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  try {
    return JSON.parse(match ? match[0] : clean)
  } catch {
    throw new Error(`${source} no devolvio JSON valido: ` + clean.slice(0, 300))
  }
}

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
  const response = await genai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          {
            text: `Analiza esta imagen de comida y devuelve un JSON con este formato exacto:
{"foods":[{"name":"nombre","quantity":"150g","calories":250,"proteinG":20,"carbsG":30,"fatG":8}],"totalCalories":250,"confidence":"alta","notes":""}
Solo el JSON, sin texto adicional.`,
          },
        ],
      },
    ],
  })
  return parseJSON(response.text ?? "", "Gemini")
}

export async function analyzeFoodText(text: string): Promise<FoodAnalysis> {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: "Eres un nutricionista experto. Analiza descripciones de comida y devuelve SOLO JSON valido sin markdown.",
      },
      {
        role: "user",
        content: `Estima las calorias y macros de lo siguiente: "${text}"

Devuelve este JSON exacto:
{"foods":[{"name":"nombre alimento","quantity":"cantidad estimada","calories":250,"proteinG":20,"carbsG":30,"fatG":8}],"totalCalories":250,"confidence":"alta","notes":"observacion si hay incertidumbre"}

Si hay varios alimentos, pon uno por elemento en foods. Se realista con las cantidades tipicas españolas.`,
      },
    ],
    max_tokens: 1024,
    temperature: 0.3,
  })

  const raw = completion.choices[0]?.message?.content ?? ""
  return parseJSON(raw, "Groq")
}

export interface MealPlanInput {
  dailyCalories: number
  goal: string
  activityLevel: string
  preferences?: string
}

export async function generateMealPlan(input: MealPlanInput): Promise<any> {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: "Eres un nutricionista experto. Responde SOLO con JSON valido, sin texto adicional ni bloques de codigo markdown.",
      },
      {
        role: "user",
        content: `Crea un planning semanal de comidas (7 dias) para:
- Calorias diarias: ${input.dailyCalories} kcal
- Objetivo: ${input.goal}
- Actividad: ${input.activityLevel}
${input.preferences ? `- Preferencias: ${input.preferences}` : ""}

Devuelve este JSON exacto:
{"days":[{"dayOfWeek":0,"dayName":"Lunes","meals":[{"mealType":"breakfast","name":"nombre plato","calories":400,"proteinG":30,"carbsG":45,"fatG":12,"recipe":"preparacion breve"}]}]}

dayOfWeek: 0=Lunes, 1=Martes, 2=Miercoles, 3=Jueves, 4=Viernes, 5=Sabado, 6=Domingo
mealType: breakfast, lunch, dinner o snack`,
      },
    ],
    max_tokens: 4096,
    temperature: 0.7,
  })

  const text = completion.choices[0]?.message?.content ?? ""
  return parseJSON(text, "Groq")
}

export interface WorkoutPlanInput {
  goal: string
  activityLevel: string
  daysPerWeek: number
  equipment?: string
}

export async function generateWorkoutPlan(input: WorkoutPlanInput): Promise<any> {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: "Eres un entrenador personal experto. Responde SOLO con JSON valido, sin texto adicional ni bloques de codigo markdown.",
      },
      {
        role: "user",
        content: `Crea un planning semanal de ejercicios para:
- Objetivo: ${input.goal}
- Actividad: ${input.activityLevel}
- Dias de entreno: ${input.daysPerWeek}
${input.equipment ? `- Equipamiento: ${input.equipment}` : "- Sin equipamiento especifico"}

Devuelve este JSON exacto:
{"days":[{"dayOfWeek":0,"dayName":"Lunes","restDay":false,"name":"Pecho y Triceps","exercises":[{"name":"Press banca","sets":3,"reps":"8-12","restSeconds":60,"notes":"forma correcta"}]}]}

dayOfWeek: 0=Lunes hasta 6=Domingo. Los dias de descanso: restDay=true y exercises=[]`,
      },
    ],
    max_tokens: 4096,
    temperature: 0.7,
  })

  const text = completion.choices[0]?.message?.content ?? ""
  return parseJSON(text, "Groq")
}
