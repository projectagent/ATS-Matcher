import { describe, expect, it } from 'vitest'
import { analyzeMatch, containsKeyword } from '../utils/matchingEngine'

describe('matchingEngine', () => {
  it('identifies case-insensitive keyword occurrences', () => {
    const resume = 'Trabalho com react, TYPESCRIPT e tailwind css.'
    expect(containsKeyword(resume, 'React')).toBe(true)
    expect(containsKeyword(resume, 'TypeScript')).toBe(true)
    expect(containsKeyword(resume, 'Tailwind CSS')).toBe(true)
    expect(containsKeyword(resume, 'Python')).toBe(false)
    expect(containsKeyword('Trabalho com pipelines de CI/CD.', 'CI/CD')).toBe(true)
    expect(containsKeyword('Desenvolvimento em C++.', 'C++')).toBe(true)
    expect(containsKeyword('Programação em C#.', 'C#')).toBe(true)
    expect(containsKeyword('Aplicações em Node.js.', 'Node.js')).toBe(true)
  })

  it('correctly calculates 100% match when all job keywords exist in resume', () => {
    const job = 'Requisitos: React, TypeScript, Docker'
    const resume = 'Lucas Silveira. Experiência: React, TypeScript, Docker.'
    const result = analyzeMatch(job, resume)

    expect(result.score).toBe(100)
    expect(result.foundKeywords.length).toBe(result.totalJobKeywords)
    expect(result.missingKeywords.length).toBe(0)
  })

  it('correctly calculates partial match and missing keywords', () => {
    const job = 'Requisitos: React, TypeScript, Docker, Kubernetes'
    const resume = 'Lucas Silveira. Habilidades em React e TypeScript.'
    const result = analyzeMatch(job, resume)

    expect(result.score).toBe(50)
    expect(result.foundKeywords).toContain('React')
    expect(result.foundKeywords).toContain('TypeScript')
    expect(result.missingKeywords).toContain('Docker')
    expect(result.missingKeywords).toContain('Kubernetes')
  })

  it('returns 0% when there is zero overlap', () => {
    const job = 'Requisitos: Ruby, Elixir, Phoenix'
    const resume = 'Lucas Silveira. Especialista em Java e Spring Boot.'
    const result = analyzeMatch(job, resume)

    expect(result.score).toBe(0)
    expect(result.foundKeywords.length).toBe(0)
    expect(result.missingKeywords.length).toBeGreaterThan(0)
  })

  it('handles empty job description gracefully', () => {
    const result = analyzeMatch('', 'Algum currículo')
    expect(result.score).toBe(0)
    expect(result.totalJobKeywords).toBe(0)
  })

  it('matches keywords ignoring accents in Portuguese', () => {
    const resume = 'Experiencia pratica com metodologias ageis e gestao de projetos.'
    expect(containsKeyword(resume, 'metodologias ágeis')).toBe(true)
    expect(containsKeyword(resume, 'experiência')).toBe(true)
    expect(containsKeyword(resume, 'gestão')).toBe(true)
  })

  it('matches tech framework synonyms (e.g. React.js matches React, Tailwind matches Tailwind CSS)', () => {
    const resume = 'Desenvolvedor com React e Tailwind.'
    expect(containsKeyword(resume, 'React.js')).toBe(true)
    expect(containsKeyword(resume, 'Tailwind CSS')).toBe(true)
  })

  it('strictly respects word boundaries preventing false substring matches', () => {
    const resume = 'Especialista em JavaScript e algoritmos.'
    expect(containsKeyword(resume, 'Java')).toBe(false)
    expect(containsKeyword(resume, 'Go')).toBe(false)
  })

  it('R3: calculates score based purely on technical competencies without distortion from corporate jargon', () => {
    // Job description packed with corporate jargon and filler words alongside 2 real tech requirements
    const verboseJob = `
      Vaga: Desenvolvedor Front-end
      Buscamos profissional com Vontade e capacidade de trabalhar em equipe.
      O candidato responsável terá atividades diárias com foco em regras de funcionamento e boas práticas.
      Desejável busca por conhecimento contínuo e aplicá-los de forma eficaz em projetos pessoais.
      Requisitos Técnicos: React e TypeScript.
    `
    // Candidate has React and TypeScript, but did NOT write any of the corporate filler words
    const technicalResume = `
      Lucas Silveira
      lucas@email.com
      Experiência com React e TypeScript em projetos web.
    `

    const result = analyzeMatch(verboseJob, technicalResume)

    // The extracted job keywords should only be React and TypeScript
    const lowerJobKeywords = result.jobKeywords.map((k) => k.toLowerCase())
    expect(lowerJobKeywords).toContain('react')
    expect(lowerJobKeywords).toContain('typescript')
    expect(lowerJobKeywords).not.toContain('vontade')
    expect(lowerJobKeywords).not.toContain('regras')
    expect(lowerJobKeywords).not.toContain('funcionamento')
    expect(lowerJobKeywords).not.toContain('pessoais')
    expect(lowerJobKeywords).not.toContain('responsável')

    // Score must be 100% because candidate meets all true technical requirements
    expect(result.score).toBe(100)
    expect(result.missingKeywords.length).toBe(0)
  })

  it('R3: performs bidirectional synonym resolution (e.g. K8s matches Kubernetes, GCP matches Google Cloud, OOP matches Orientação a Objetos)', () => {
    expect(containsKeyword('Experiência prática com Kubernetes em produção.', 'k8s')).toBe(true)
    expect(containsKeyword('Implementação de clusters K8s.', 'Kubernetes')).toBe(true)
    expect(containsKeyword('Desenvolvimento em Google Cloud Platform.', 'GCP')).toBe(true)
    expect(containsKeyword('Experiência sólida com GCP.', 'Google Cloud')).toBe(true)
    expect(containsKeyword('Programação com TypeScript avançado.', 'TS')).toBe(true)
    expect(containsKeyword('Conhecimento em TS e JS.', 'TypeScript')).toBe(true)
    expect(containsKeyword('Domínio em Orientação a Objetos.', 'OOP')).toBe(true)
    expect(containsKeyword('Domínio em OOP e POO.', 'Orientação a Objetos')).toBe(true)
    expect(containsKeyword('Projetos com Arquitetura Limpa e Clean Code.', 'Clean Architecture')).toBe(true)
    expect(containsKeyword('Conhecimento em Clean Architecture.', 'Arquitetura Limpa')).toBe(true)
    expect(containsKeyword('Arquitetura de microsserviços distribuídos.', 'Microservices')).toBe(true)
    expect(containsKeyword('Design de microservices em nuvem.', 'Microsserviços')).toBe(true)
    expect(containsKeyword('Desenvolvimento orientado a testes com TDD.', 'Test Driven Development')).toBe(true)
    expect(containsKeyword('Prática de Domain Driven Design.', 'DDD')).toBe(true)
    expect(containsKeyword('Criação de Single Page Application moderna.', 'SPA')).toBe(true)
    expect(containsKeyword('Desenvolvimento em HTML5 e CSS3.', 'HTML')).toBe(true)
    expect(containsKeyword('Desenvolvimento em HTML5 e CSS3.', 'CSS')).toBe(true)
  })
})
