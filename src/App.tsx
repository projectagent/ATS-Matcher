import React, { useState } from 'react'
import { Header } from './components/Header'
import { InputSection } from './components/InputSection'
import { ResultsDashboard } from './components/ResultsDashboard'
import { ATSResumeViewer } from './components/ATSResumeViewer'
import { ExportBar } from './components/ExportBar'
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME } from './utils/constants'
import { analyzeMatch } from './utils/matchingEngine'
import { optimizeResumeForATS, sanitizeResumeText } from './utils/atsOptimizer'
import type { AnalysisResult, StructuredResume } from './types/ats'
import { AlertCircle, FileCheck, Layers } from 'lucide-react'

export const App: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [optimizedResume, setOptimizedResume] = useState<StructuredResume | null>(null)

  const handleAnalyze = () => {
    setIsLoading(true)
    setTimeout(() => {
      const sanitizedResume = sanitizeResumeText(resumeText)
      const analysis = analyzeMatch(jobDescription, sanitizedResume)
      const optimized = optimizeResumeForATS(sanitizedResume, analysis)
      setAnalysisResult(analysis)
      setOptimizedResume(optimized)
      setIsLoading(false)
    }, 400)
  }

  const handleLoadSample = () => {
    setJobDescription(SAMPLE_JOB_DESCRIPTION)
    setResumeText(SAMPLE_RESUME)
  }

  const handleClear = () => {
    setJobDescription('')
    setResumeText('')
    setAnalysisResult(null)
    setOptimizedResume(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Header with Golden Rule */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Input Textarea Split-Screen Area */}
        <InputSection
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          resumeText={resumeText}
          setResumeText={setResumeText}
          isLoading={isLoading}
          onAnalyze={handleAnalyze}
          onLoadSample={handleLoadSample}
          onClear={handleClear}
        />

        {/* Results and ATS Document Section */}
        {analysisResult && optimizedResume && (
          <div className="space-y-10 animate-fade-in">
            {/* Matching Engine Results & Badges */}
            <ResultsDashboard analysis={analysisResult} />

            {/* ATS Optimization & Visualization Section */}
            <section className="space-y-4 pt-6 border-t border-slate-200">
              <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xl font-bold text-slate-900 m-0">
                    Currículo Otimizado para ATS (Folha A4)
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sem elementos visuais que confundem parsers</span>
                </div>
              </div>

              {/* Ethical Warning Banner */}
              {analysisResult.missingKeywords.length > 0 && (
                <div className="no-print max-w-[820px] mx-auto p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-950 mb-0.5">
                      Dica de Ouro para Aprovação no ATS:
                    </p>
                    <p className="leading-relaxed text-amber-900/90">
                      Você possui {analysisResult.missingKeywords.length} palavras-chave da vaga ausentes no currículo. Se você tem experiência real com alguma delas (ex:{' '}
                      <span className="font-medium">
                        {analysisResult.missingKeywords.slice(0, 3).join(', ')}
                      </span>
                      ), adicione-as manualmente na descrição de seus projetos ou competências antes de submeter a vaga. Lembre-se: jamais adicione ferramentas que você não conhece.
                    </p>
                  </div>
                </div>
              )}

              {/* A4 Resume Simulated Paper */}
              <ATSResumeViewer resume={optimizedResume} />

              {/* Export Actions Bar */}
              <ExportBar plainText={optimizedResume.rawRestructuredText} />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-16 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>ATS Matcher • Otimizador Ético de Currículos para Sistemas de Rastreamento de Candidatos</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Formatação padrão ATS compatível com Workday, Greenhouse, Lever, Gupy e Taleo.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
