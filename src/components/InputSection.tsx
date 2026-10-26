import React from 'react'
import { FileText, Briefcase, Sparkles, RotateCcw, FileCheck2, Loader2 } from 'lucide-react'

interface InputSectionProps {
  jobDescription: string
  setJobDescription: (val: string) => void
  resumeText: string
  setResumeText: (val: string) => void
  isLoading: boolean
  onAnalyze: () => void
  onLoadSample: () => void
  onClear: () => void
}

export const InputSection: React.FC<InputSectionProps> = ({
  jobDescription,
  setJobDescription,
  resumeText,
  setResumeText,
  isLoading,
  onAnalyze,
  onLoadSample,
  onClear,
}) => {
  const jobWords = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0
  const resumeWords = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0

  const canAnalyze = jobDescription.trim().length > 10 && resumeText.trim().length > 10

  return (
    <section className="no-print space-y-6">
      {/* Action shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Entrada de Dados</h2>
          <p className="text-xs text-slate-500">
            Cole a descrição da vaga e o seu currículo em texto puro para análise imediata.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-xs cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Carregar Exemplo
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
        </div>
      </div>

      {/* Split Screen Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Description Textarea */}
        <div className="flex flex-col rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2 text-slate-800 font-medium text-sm">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Descrição da Vaga</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {jobWords} palavras • {jobDescription.length} caracteres
            </span>
          </div>
          <div className="p-3">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Cole aqui a descrição da vaga, requisitos técnicos, qualificações desejadas..."
              rows={12}
              className="w-full resize-y rounded-lg border-0 p-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Current Resume Textarea */}
        <div className="flex flex-col rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2 text-slate-800 font-medium text-sm">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Currículo Atual</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {resumeWords} palavras • {resumeText.length} caracteres
            </span>
          </div>
          <div className="p-3">
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Cole aqui o texto do seu currículo atual (Resumo, Experiência, Competências, Formação)..."
              rows={12}
              className="w-full resize-y rounded-lg border-0 p-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-sans"
            />
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col items-center justify-center pt-2">
        <button
          type="button"
          disabled={!canAnalyze || isLoading}
          onClick={onAnalyze}
          className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analisando palavras-chave...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Analisar e Otimizar para ATS</span>
            </>
          )}
        </button>
        {!canAnalyze && (
          <p className="text-xs text-slate-400 mt-2">
            Insira a descrição da vaga e o currículo (ou clique em &quot;Carregar Exemplo&quot;) para analisar.
          </p>
        )}
      </div>
    </section>
  )
}
