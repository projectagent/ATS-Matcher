import { describe, expect, it } from 'vitest'
import { optimizeResumeForATS, sanitizeResumeText, isPaginationArtifact } from '../utils/atsOptimizer'
import { analyzeMatch } from '../utils/matchingEngine'
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME } from '../utils/constants'

describe('atsOptimizer', () => {
  it('strictly adheres to Golden Rule: never injects missing keywords into resume skills', () => {
    const job = 'Requisitos: React, TypeScript, Rust, COBOL'
    const resume = `João Silva\njoao@email.com\n\nRESUMO\nDev front-end.\n\nCOMPETÊNCIAS\nReact, TypeScript`
    
    const analysis = analyzeMatch(job, resume)
    const structured = optimizeResumeForATS(resume, analysis)

    // The skills array MUST only contain skills that João actually has
    expect(structured.skills).toContain('React')
    expect(structured.skills).toContain('TypeScript')
    expect(structured.skills).not.toContain('Rust')
    expect(structured.skills).not.toContain('COBOL')

    // Missing keywords are segregated into missingJobKeywordsNotice
    expect(structured.missingJobKeywordsNotice).toContain('Rust')
    expect(structured.missingJobKeywordsNotice).toContain('COBOL')
  })

  it('correctly processes realistic resume sample into structured sections', () => {
    const analysis = analyzeMatch(SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME)
    const structured = optimizeResumeForATS(SAMPLE_RESUME, analysis)

    expect(structured.fullName).toBe('Lucas Silveira')
    expect(structured.experiences.length).toBe(2)


    expect(structured.experiences[0].role).toContain('TechSolutions')
    expect(structured.experiences[0].period).toContain('2022')
    expect(structured.experiences[1].role).toContain('InovaCode')
    expect(structured.experiences[1].period).toContain('2020')
    expect(structured.matchedSkills.length).toBeGreaterThan(0)
    expect(structured.education.length).toBeGreaterThan(0)
    expect(structured.foundKeywords.length).toBeGreaterThan(0)

  })

  it('correctly splits skills formatted with bullet dots or slashes', () => {
    const resume = `Lucas Silveira\ncontato@email.com\n\nCOMPETÊNCIAS\nReact • TypeScript • Tailwind CSS • Docker`
    const analysis = analyzeMatch('React, TypeScript, Docker', resume)
    const structured = optimizeResumeForATS(resume, analysis)

    expect(structured.skills).toContain('React')
    expect(structured.skills).toContain('TypeScript')
    expect(structured.skills).toContain('Tailwind CSS')
    expect(structured.skills).toContain('Docker')
  })

  it('gracefully handles resumes without explicit RESUMO heading', () => {
    const resume = `Mariana Costa\nmariana@email.com | (21) 99999-8888\nEngenheira de software apaixonada por front-end moderno e interfaces limpas.\n\nEXPERIÊNCIA\nDesenvolvedora Web | Tech Inc\n- Criação de telas em React.`
    const analysis = analyzeMatch('React', resume)
    const structured = optimizeResumeForATS(resume, analysis)

    expect(structured.fullName).toBe('Mariana Costa')
    expect(structured.contactInfo).toContain('mariana@email.com')
    expect(structured.summary).toContain('Engenheira de software apaixonada por front-end moderno')
    expect(structured.experiences.length).toBe(1)
  })

  it('R1: detects and sanitizes diverse pagination patterns without affecting surrounding context', () => {
    const paginationSamples = [
      'Page 1 of 2',
      'Page: 1 of 2',
      'Página: 2 de 3',
      'Pág: 1/2',
      'Pág.: 1 of 2',
      'Page: 1',
      'Página: 2',
      'Página 2 de 3',
      'Pág. 1 / 2',
      'Pág 1 / 2',
      'Pág 1 de 2',
      'Page 1',
      'Página 2',
      'Pág. 1',
      'p. 1',
      'p. 1 of 2',
      'p. 1 de 2',
      'p. 1/2',
      '- 1 -',
      '-- 1 --',
      '--- 2 ---',
      '=== 1 ===',
      '— 2 —',
      '– 3 –',
      '- X -',
      '• 1 •',
      '* 2 *',
      '| 3 |',
      'Page X of Y',
      'Página X de Y',
      'Pág. X / Y',
      'Pg. 1',
      'Pg 2',
      'Pg. 1 de 2',
      'Pg 1/2',
      '[ 1 ]',
      '( 1 )',
      '[1]',
      '(1)',
      '[Page 1 of 2]',
      '(Página 2 de 3)',
      '(1/2)',
      '[1 of 2]',
      '1 of 2',
      '1 / 2',
      '2 de 3',
      '1',
      '2'
    ]

    for (const sample of paginationSamples) {
      expect(isPaginationArtifact(sample)).toBe(true)
    }
  })

  it('R1: strips inline pagination while keeping candidate name and content intact', () => {
    expect(sanitizeResumeText('Lucas Silveira | Página 2 de 3')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('Lucas Silveira | Página: 2 de 3')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('Lucas Silveira - Page 2 of 2')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('Lucas Silveira | Pg. 2 de 3')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('Lucas Silveira | 2 of 3')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('Lucas Silveira | 2 / 3')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('Lucas Silveira | 1/2')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('Page 1 of 2 | Lucas Silveira')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('Page: 1 of 2 | Lucas Silveira')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('2 of 3 | Lucas Silveira')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('1 / 2 | Lucas Silveira')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('1/2 | Lucas Silveira')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('(Page 2 of 3) Lucas Silveira')).toBe('Lucas Silveira')
    expect(sanitizeResumeText('Lucas Silveira (2 of 3)')).toBe('Lucas Silveira')
  })

  it('R1: preserves bullets formatted with en-dashes, em-dashes, middle dots, and numbers, preventing phantom jobs', () => {
    const resume = `
Lucas Silveira
lucas@email.com

EXPERIÊNCIA PROFISSIONAL
TechSolutions – Desenvolvedor Front-end Pleno
Março 2022 – Atual | São Paulo, SP
– Desenvolvimento de Single Page Applications utilizando React e TypeScript.
— Implementação de layouts responsivos com Tailwind CSS.
· Integração com REST APIs de pagamentos.
* Automação de pipelines CI/CD.
1. Ministrou cursos técnicos para a equipe.
2. Sólida experiência em arquitetura de frontend.

FORMAÇÃO ACADÊMICA
- Bacharelado em Ciência da Computação (2018 - 2022)
`
    const analysis = analyzeMatch('React, TypeScript, Tailwind CSS, CI/CD', resume)
    const structured = optimizeResumeForATS(resume, analysis)

    // Must be parsed as exactly 1 experience with 6 bullets
    expect(structured.experiences.length).toBe(1)
    expect(structured.experiences[0].role).toBe('TechSolutions')
    expect(structured.experiences[0].company).toBe('Desenvolvedor Front-end Pleno')
    expect(structured.experiences[0].period).toBe('Março 2022 – Atual | São Paulo, SP')
    expect(structured.experiences[0].bullets.length).toBe(6)
    expect(structured.experiences[0].bullets[0]).toBe('Desenvolvimento de Single Page Applications utilizando React e TypeScript.')
    expect(structured.experiences[0].bullets[1]).toBe('Implementação de layouts responsivos com Tailwind CSS.')
    expect(structured.experiences[0].bullets[2]).toBe('Integração com REST APIs de pagamentos.')
    expect(structured.experiences[0].bullets[3]).toBe('Automação de pipelines CI/CD.')
    expect(structured.experiences[0].bullets[4]).toBe('Ministrou cursos técnicos para a equipe.')
    expect(structured.experiences[0].bullets[5]).toBe('Sólida experiência em arquitetura de frontend.')

    // Education must have the degree, not any stolen bullets
    expect(structured.education.length).toBe(1)
    expect(structured.education[0]).toContain('Ciência da Computação')
  })

  it('R1: preserves summary sentences containing words like experiência without triggering false section headers', () => {
    const resume = `
Lucas Silveira
lucas@email.com

RESUMO PROFISSIONAL
Profissional com sólida experiência em front-end moderno. Tenho mais de 5 anos de experiência com React.

EXPERIÊNCIA
TechSolutions - Desenvolvedor
2022 - Atual
- Desenvolvimento web em React.
`
    const analysis = analyzeMatch('React', resume)
    const structured = optimizeResumeForATS(resume, analysis)

    expect(structured.summary).toContain('Profissional com sólida experiência em front-end moderno.')
    expect(structured.summary).toContain('Tenho mais de 5 anos de experiência com React.')
    expect(structured.experiences.length).toBe(1)
  })

  it('R1: preserves bullets that happen to contain section-like keywords (e.g. cursos, experiência)', () => {
    const resume = `
Lucas Silveira
lucas@email.com

EXPERIÊNCIA
TechCorp - Desenvolvedor Pleno
2022 - Atual
- Ministrou cursos de React e TypeScript para a equipe.
- Grande vivência em projetos de alta escala.
- Elaboração de documentação para cursos técnicos internos.

FORMAÇÃO ACADÊMICA
- Ciência da Computação (2018 - 2022)
`
    const analysis = analyzeMatch('React, TypeScript', resume)
    const structured = optimizeResumeForATS(resume, analysis)

    // The bullets must remain under experience, NOT trigger a premature switch to education!
    expect(structured.experiences.length).toBe(1)
    expect(structured.experiences[0].bullets).toContain('Ministrou cursos de React e TypeScript para a equipe.')
    expect(structured.experiences[0].bullets).toContain('Elaboração de documentação para cursos técnicos internos.')
    expect(structured.education.length).toBe(1)
    expect(structured.education[0]).toContain('Ciência da Computação')
  })

  it('R1: recognizes Brazilian section headers with ampersands, slashes, and phrasing variants', () => {
    const resume = `
Lucas Silveira
lucas@email.com

SOBRE MIM
Engenheiro front-end apaixonado por desenvolvimento web limpo.

ATUAÇÃO PROFISSIONAL
TechCorp | Desenvolvedor Frontend Pleno | 2022 - Atual
- Construção de interfaces com React e TypeScript.

TECNOLOGIAS & FERRAMENTAS
React, TypeScript, Docker, Git

FORMAÇÃO & CERTIFICAÇÕES
- Bacharelado em Sistemas de Informação
`
    const analysis = analyzeMatch('React, TypeScript, Docker, Git', resume)
    const structured = optimizeResumeForATS(resume, analysis)

    expect(structured.summary).toContain('Engenheiro front-end apaixonado por desenvolvimento web limpo.')
    expect(structured.experiences.length).toBe(1)
    expect(structured.experiences[0].role).toBe('TechCorp')
    expect(structured.skills).toContain('React')
    expect(structured.skills).toContain('TypeScript')
    expect(structured.skills).toContain('Docker')
    expect(structured.skills).toContain('Git')
    expect(structured.education.length).toBe(1)
    expect(structured.education[0]).toContain('Sistemas de Informação')
  })

  it('R1: preserves real numeric data, dates, phone numbers, and metrics during sanitization', () => {
    const realText = [
      'Desenvolvedor com 3 anos de experiência.',
      'Liderança técnica em equipe de 5 desenvolvedores.',
      '- 1 de 2 sistemas migrados com sucesso para nuvem.',
      'Redução de 30% no tempo de carregamento de páginas.',
      'São Paulo, SP | (11) 98765-4321 | lucas@email.com',
      'Bacharelado em Ciência da Computação (2017 - 2021)'
    ].join('\n')

    const sanitized = sanitizeResumeText(realText)

    expect(sanitized).toContain('3 anos de experiência')
    expect(sanitized).toContain('equipe de 5 desenvolvedores')
    expect(sanitized).toContain('1 de 2 sistemas migrados')
    expect(sanitized).toContain('30%')
    expect(sanitized).toContain('(11) 98765-4321')
    expect(sanitized).toContain('2017 - 2021')
  })

  it('R1: removes pagination lines from pasted resumes without creating phantom bullets, skills or sections', () => {
    const messyResume = `Lucas Silveira
lucas.silveira@email.com | (11) 98765-4321
Page 1 of 2

RESUMO PROFISSIONAL
Engenheiro front-end com 4 anos de experiência construindo soluções web.
- 1 -

COMPETÊNCIAS
React, TypeScript, Tailwind CSS
Pág. 1 / 2

EXPERIÊNCIA PROFISSIONAL
TechSolutions - Desenvolvedor Pleno
Março 2022 - Atual | São Paulo, SP
- Desenvolvimento de interfaces em React com equipe de 5 desenvolvedores.
Página 2 de 3
- Otimização de performance web reduzindo em 30% o consumo de banda.
- 2 -
- Implementação de pipelines CI/CD com GitHub Actions.
Page 2 of 2

FORMAÇÃO ACADÊMICA
- Graduação em Sistemas de Informação (2018 - 2022)
Página 2 de 2`

    const analysis = analyzeMatch('React, TypeScript, CI/CD', messyResume)
    const structured = optimizeResumeForATS(messyResume, analysis)

    // Summary must not contain pagination artifacts
    expect(structured.summary).not.toContain('Page 1 of 2')
    expect(structured.summary).not.toContain('- 1 -')
    expect(structured.summary).toContain('4 anos de experiência')

    // Skills must not contain pagination artifacts
    expect(structured.skills).toContain('React')
    expect(structured.skills).toContain('TypeScript')
    expect(structured.skills).toContain('Tailwind CSS')
    expect(structured.skills).not.toContain('Pág. 1 / 2')
    expect(structured.skills.some((s) => /p[aá]g|page/i.test(s))).toBe(false)

    // Experiences bullets must NOT contain pagination artifacts
    const allBullets = structured.experiences.flatMap((e) => e.bullets)
    expect(allBullets).toContain('Desenvolvimento de interfaces em React com equipe de 5 desenvolvedores.')
    expect(allBullets).toContain('Otimização de performance web reduzindo em 30% o consumo de banda.')
    expect(allBullets).toContain('Implementação de pipelines CI/CD com GitHub Actions.')

    for (const bullet of allBullets) {
      expect(isPaginationArtifact(bullet)).toBe(false)
      expect(bullet).not.toMatch(/Página 2 de 3/i)
      expect(bullet).not.toMatch(/^- 2 -$/)
      expect(bullet).not.toMatch(/Page 2 of 2/i)
    }

    // Education must not contain pagination
    for (const edu of structured.education) {
      expect(isPaginationArtifact(edu)).toBe(false)
      expect(edu).not.toMatch(/Página 2 de 2/i)
    }
  })
})
