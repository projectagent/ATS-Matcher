import React from 'react'
import { Sparkles, ShieldAlert } from 'lucide-react'

export const Header: React.FC = () => {
  return (
    <header className="no-print w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">ATS Matcher</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                MVP
              </span>
            </div>
            <p className="text-xs text-slate-500 m-0">Otimizador de Currículos para Sistemas ATS</p>
          </div>
        </div>

        {/* Golden Rule Visual Alert */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs shadow-xs max-w-xl">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="leading-relaxed m-0">
            <span className="font-semibold px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-950 text-[10px] uppercase tracking-wide mr-1.5">
              REGRA DE OURO
            </span>
            <strong className="font-semibold text-amber-950">Atenção:</strong> A aplicação otimiza a estrutura para ATS, mas{' '}
            <span className="underline decoration-amber-500 underline-offset-2 font-bold">NUNCA</span> inventa experiências ou competências que não possui.
          </p>
        </div>
      </div>
    </header>
  )
}
