import React from 'react'
import type { StructuredResume } from '../types/ats'

interface ATSResumeViewerProps {
  resume: StructuredResume
}

export const ATSResumeViewer: React.FC<ATSResumeViewerProps> = ({ resume }) => {
  return (
    <div className="print-area-wrapper flex justify-center w-full py-4">
      {/* Simulated A4 Paper */}
      <article
        id="ats-resume-document"
        className="a4-document bg-white w-full max-w-[820px] min-h-[1050px] p-8 sm:p-14 rounded-2xl shadow-xl border border-slate-200/80 text-slate-800 transition-all font-sans leading-relaxed text-sm selection:bg-indigo-100"
      >
        {/* Document Header (using div to prevent any browser print style conflicts) */}
        <div className="document-header border-b-2 border-slate-800 pb-5 mb-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            {resume.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium tracking-wide">
            {resume.contactInfo}
          </p>
        </div>

        {/* Professional Summary */}
        {resume.summary && (
          <section className="mb-6">
            <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2.5">
              Resumo Profissional
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
              {resume.summary}
            </p>
          </section>
        )}

        {/* Skills & Technical Competencies */}
        {resume.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2.5">
              Competências Técnicas & Tecnologias
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {resume.skills.join(' • ')}
            </p>
          </section>
        )}

        {/* Experience Section */}
        {resume.experiences.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1 mb-3">
              Experiência Profissional
            </h2>
            <div className="space-y-4">
              {resume.experiences.map((exp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">{exp.role}</span>
                    <span className="text-slate-500 font-mono text-xs">{exp.period}</span>
                  </div>
                  {exp.company && (
                    <div className="text-xs font-medium text-slate-700 italic">
                      {exp.company}
                    </div>
                  )}
                  {exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 pt-1">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {resume.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2.5">
              Formação Acadêmica
            </h2>
            <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700">
              {resume.education.map((edu, idx) => (
                <li key={idx} className="leading-relaxed font-medium">
                  {edu}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  )
}


