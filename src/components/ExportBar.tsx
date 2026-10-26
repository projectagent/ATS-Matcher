import React, { useState } from 'react'
import { Download, Copy, Check } from 'lucide-react'

interface ExportBarProps {
  plainText: string
}

export const ExportBar: React.FC<ExportBarProps> = ({ plainText }) => {
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback if clipboard API is blocked in iframe/sandbox
      const textarea = document.createElement('textarea')
      textarea.value = plainText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="no-print w-full max-w-[820px] mx-auto mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">Exportar Currículo Otimizado</h4>
        <p className="text-xs text-slate-500">
          Capture exclusivamente a folha A4 em PDF ou copie o texto puro pronto para formulários ATS.
        </p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Texto ATS</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-200 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Baixar como PDF</span>
        </button>
      </div>
    </div>
  )
}
