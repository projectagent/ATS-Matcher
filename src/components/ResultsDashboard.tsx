import { CheckCircle2, XCircle, Target } from 'lucide-react'
import type { AnalysisResult } from '../types/ats'

interface ResultsDashboardProps {
  analysis: AnalysisResult
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ analysis }) => {
  const { score, foundKeywords, missingKeywords, totalJobKeywords, totalMatched } = analysis

  // Determine score color theme
  const getScoreColor = (value: number) => {
    if (value >= 75) return { stroke: '#10b981', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    if (value >= 50) return { stroke: '#f59e0b', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' }
    return { stroke: '#f43f5e', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' }
  }

  const colorTheme = getScoreColor(score)

  // Circle progress calculation
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <section className="no-print space-y-6 pt-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900 m-0">Resultado do Match ATS</h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {totalMatched} de {totalJobKeywords} requisitos identificados
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circular Progress Gauge */}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              {/* Background Circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Dynamic Progress Circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={colorTheme.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-extrabold tracking-tight ${colorTheme.text}`}>
                {score}%
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Score ATS
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-center font-medium text-slate-600">
            {score >= 75
              ? 'Excelente alinhamento com a vaga!'
              : score >= 50
              ? 'Bom alinhamento, mas pontos chave podem ser melhorados.'
              : 'Baixa aderência. Revise os requisitos prioritários da vaga.'}
          </p>
        </div>

        {/* Found vs Missing Highlights Summary */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Palavras-chave Encontradas</span>
              </div>
              <p className="text-3xl font-extrabold text-emerald-900 mt-2">
                {foundKeywords.length}
              </p>
              <p className="text-xs text-emerald-700/90 mt-1">
                Termos identificados com sucesso no seu currículo.
              </p>
            </div>
            <div className="text-[11px] font-medium text-emerald-800 bg-emerald-100/60 rounded-md px-2 py-1 mt-4 inline-block self-start">
              ✓ Corresponde a {totalJobKeywords > 0 ? Math.round((foundKeywords.length / totalJobKeywords) * 100) : 0}% dos requisitos
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Palavras-chave Faltantes</span>
              </div>
              <p className="text-3xl font-extrabold text-rose-900 mt-2">
                {missingKeywords.length}
              </p>
              <p className="text-xs text-rose-700/90 mt-1">
                Termos presentes na vaga que não foram localizados.
              </p>
            </div>
            <div className="text-[11px] font-medium text-rose-800 bg-rose-100/60 rounded-md px-2 py-1 mt-4 inline-block self-start">
              ⚠ Adicione apenas se possuir experiência real
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Badges Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Found Badges (Green) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-sm text-slate-800">
                Palavras-chave Encontradas ({foundKeywords.length})
              </h3>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Presentes
            </span>
          </div>

          {foundKeywords.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              Nenhuma palavra-chave correspondente foi encontrada.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
              {foundKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs hover:bg-emerald-100 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Missing Badges (Red) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <h3 className="font-semibold text-sm text-slate-800">
                Palavras-chave Faltantes ({missingKeywords.length})
              </h3>
            </div>
            <span className="text-[11px] text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Oportunidades
            </span>
          </div>

          {missingKeywords.length === 0 ? (
            <p className="text-xs text-emerald-600 font-medium py-4 text-center">
              Parabéns! Todas as palavras-chave da vaga estão no seu currículo!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
              {missingKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/80 shadow-2xs hover:bg-rose-100 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
