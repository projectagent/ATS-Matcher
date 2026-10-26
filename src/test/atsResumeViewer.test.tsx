import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ATSResumeViewer } from '../components/ATSResumeViewer'
import type { StructuredResume } from '../types/ats'

describe('ATSResumeViewer Component (A4 Clean Presentation)', () => {
  const mockResume: StructuredResume = {
    fullName: 'Lucas Silveira',
    contactInfo: 'São Paulo, SP | lucas@email.com | (11) 98765-4321',
    summary: 'Desenvolvedor Front-end com 4 anos de experiência em React e TypeScript.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Docker', 'Git'],
    matchedSkills: ['React', 'TypeScript', 'Tailwind CSS'],
    foundKeywords: ['React', 'TypeScript', 'Tailwind CSS'],
    missingJobKeywordsNotice: ['Next.js'],
    experiences: [
      {
        role: 'Desenvolvedor Front-end',
        company: 'TechCorp',
        period: '2022 - Atual',
        bullets: [
          'Desenvolvimento de aplicações em React e TypeScript.',
          'Criação de componentes com Tailwind CSS.'
        ]
      }
    ],
    education: ['Bacharelado em Ciência da Computação - USP'],
    rawRestructuredText: 'LUCAS SILVEIRA\n...'
  }

  it('R2: does not render badge counters or alignment tags inside the A4 document', () => {
    const html = renderToStaticMarkup(React.createElement(ATSResumeViewer, { resume: mockResume }))

    // Must NOT contain badge counter "termos alinhados"
    expect(html).not.toContain('termos alinhados com a vaga')
    expect(html).not.toContain('termos alinhados')

    // Must NOT contain <mark> tags
    expect(html).not.toContain('<mark')
  })

  it('R2: does not render colored highlight badges or green boxes around matched keywords', () => {
    const html = renderToStaticMarkup(React.createElement(ATSResumeViewer, { resume: mockResume }))

    // Must NOT contain emerald badge background classes or borders in A4 content
    expect(html).not.toContain('bg-emerald-50')
    expect(html).not.toContain('bg-emerald-100')
    expect(html).not.toContain('text-emerald-700')
    expect(html).not.toContain('text-emerald-900')
    expect(html).not.toContain('border-emerald-300')
    expect(html).not.toContain('rounded-full bg-emerald-600')
  })

  it('R2: renders skills section as clean structured typography without pill badges', () => {
    const html = renderToStaticMarkup(React.createElement(ATSResumeViewer, { resume: mockResume }))

    // Verify Skills section title
    expect(html).toContain('Competências Técnicas &amp; Tecnologias')

    // Skills should be rendered cleanly as text
    expect(html).toContain('React • TypeScript • Tailwind CSS • Docker • Git')

    // Verify pure text in summary and bullets without highlight wrappers
    expect(html).toContain('Desenvolvedor Front-end com 4 anos de experiência em React e TypeScript.')
    expect(html).toContain('Desenvolvimento de aplicações em React e TypeScript.')
  })

  it('R2: does not render extraneous UI footers, icons, or fake pagination inside the A4 document', () => {
    const html = renderToStaticMarkup(React.createElement(ATSResumeViewer, { resume: mockResume }))

    // Must NOT contain quality stamps, footer icons, or fake pagination artifacts
    expect(html).not.toContain('document-footer')
    expect(html).not.toContain('Estrutura 100% Otimizada')
    expect(html).not.toContain('Página 1 de 1')
    expect(html).not.toContain('lucide-shield-check')
  })
})

