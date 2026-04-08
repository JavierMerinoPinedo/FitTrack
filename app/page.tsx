import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          <span className="font-bold text-slate-800 text-lg">FitTrack AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
            Iniciar sesion
          </Link>
          <Link href="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
            Empezar gratis
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Impulsado por Claude AI
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Tu asistente inteligente de<br />
          <span className="text-emerald-500">nutricion y fitness</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          Fotografía tu comida y la IA detecta las calorías automáticamente. Recibe plannings semanales personalizados y sigue tu progreso hacia tu objetivo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-emerald-200">
            Crear cuenta gratis
          </Link>
          <Link href="/login" className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-xl text-lg border border-slate-200 transition-colors">
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "📸",
              title: "Deteccion de comida con IA",
              desc: "Saca una foto a tu plato y la IA identifica cada alimento, las calorias y los macronutrientes al instante.",
            },
            {
              icon: "📅",
              title: "Planning semanal personalizado",
              desc: "Recibe un plan de comidas y rutina de ejercicios adaptado a tu cuerpo, objetivo y estilo de vida.",
            },
            {
              icon: "📈",
              title: "Seguimiento de progreso",
              desc: "Visualiza la evolucion de tu peso, calorias y entrenos con graficas claras. Celebra cada logro.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
