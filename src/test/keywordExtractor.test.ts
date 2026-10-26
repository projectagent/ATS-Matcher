import { describe, expect, it } from 'vitest'
import { extractKeywords } from '../utils/keywordExtractor'
import { SAMPLE_JOB_DESCRIPTION } from '../utils/constants'

describe('keywordExtractor', () => {
  it('extracts single technical keywords correctly', () => {
    const text = 'Requisitos: Conhecimento sólido em React, TypeScript e Docker.'
    const keywords = extractKeywords(text)

    expect(keywords).toContain('React')
    expect(keywords).toContain('TypeScript')
    expect(keywords).toContain('Docker')
  })

  it('filters out common Portuguese and English stopwords', () => {
    const text = 'Procuramos um desenvolvedor para trabalhar com a equipe e sobre o projeto in the team'
    const keywords = extractKeywords(text)

    expect(keywords).not.toContain('para')
    expect(keywords).not.toContain('com')
    expect(keywords).not.toContain('the')
    expect(keywords).not.toContain('in')
    expect(keywords).not.toContain('equipe')
  })

  it('preserves multi-word technical concepts', () => {
    const text = 'Experiência com Tailwind CSS, CI/CD pipelines e Clean Architecture.'
    const keywords = extractKeywords(text)

    const lowerKeywords = keywords.map((k) => k.toLowerCase())
    expect(lowerKeywords).toContain('tailwind css')
    expect(lowerKeywords).toContain('ci/cd')
    expect(lowerKeywords).toContain('clean architecture')
  })

  it('preserves technical symbols like C++, C#, .NET', () => {
    const text = 'Desejável experiência em C++, C# e .NET Core.'
    const keywords = extractKeywords(text)

    const lowerKeywords = keywords.map((k) => k.toLowerCase())
    expect(lowerKeywords.some((k) => k.includes('c++'))).toBe(true)
    expect(lowerKeywords.some((k) => k.includes('c#'))).toBe(true)
  })

  it('handles empty or non-string inputs safely', () => {
    expect(extractKeywords('')).toEqual([])
    expect(extractKeywords(null as unknown as string)).toEqual([])
  })

  it('correctly splits arbitrary slashes while protecting tech slashes like CI/CD and UI/UX', () => {
    const text = 'Vaga para Desenvolvedor React/TypeScript Pleno/Sênior com CI/CD e UI/UX.'
    const keywords = extractKeywords(text)

    expect(keywords).toContain('React')
    expect(keywords).toContain('TypeScript')
    expect(keywords.some((k) => k.toLowerCase() === 'ci/cd')).toBe(true)
    expect(keywords.some((k) => k.toLowerCase() === 'ui/ux')).toBe(true)
    // Pleno and Sênior are stopwords so they should not appear as keywords
    expect(keywords).not.toContain('Pleno/Sênior')
    expect(keywords).not.toContain('React/TypeScript')
  })

  it('filters out common job posting boilerplate and verbs like são, boas, práticas, pessoa', () => {
    const text = 'Buscamos uma pessoa para construir soluções de alta performance com boas práticas.'
    const keywords = extractKeywords(text)

    expect(keywords).not.toContain('pessoa')
    expect(keywords).not.toContain('construir')
    expect(keywords).not.toContain('alta')
    expect(keywords).not.toContain('boas')
    expect(keywords).not.toContain('práticas')
  })

  it('avoids redundant duplicates like React and React.js or Tailwind and Tailwind CSS', () => {
    const text = 'Experiência com React, React.js e Tailwind CSS.'
    const keywords = extractKeywords(text)
    const lowerKeywords = keywords.map((k) => k.toLowerCase())

    expect(lowerKeywords).toContain('tailwind css')
    expect(lowerKeywords).not.toContain('tailwind')
    // React and React.js shouldn't both be extracted as separate entries
    const reactCount = lowerKeywords.filter((k) => k === 'react' || k === 'react.js').length
    expect(reactCount).toBe(1)
  })

  it('R3: strictly ignores generic verbs, corporate jargon, and vocabulary from R3 specifications', () => {
    const text =
      'Buscamos profissional com Vontade e capacidade de trabalho, responsável por atividades diárias. ' +
      'Deve seguir regras de funcionamento, com busca de conhecimento para aplicá-los de forma eficaz em projetos pessoais.'
    const keywords = extractKeywords(text)
    const lowerKeywords = keywords.map((k) => k.toLowerCase())

    // All these words from requirement R3 MUST NOT appear as keywords
    const forbidden = [
      'pessoais',
      'aplicá-los',
      'regras',
      'vontade',
      'funcionamento',
      'forma',
      'com',
      'trabalho',
      'atividades',
      'responsável',
      'conhecimento',
      'capacidade',
      'busca'
    ]

    for (const term of forbidden) {
      expect(lowerKeywords).not.toContain(term)
    }
  })

  it('R3: extracts strictly genuine technical nouns, frameworks, languages, and methodologies', () => {
    const jobText =
      'Requisitos: Python, SQL, Docker, Inteligência Artificial, React, TypeScript, CI/CD. ' +
      'O profissional terá a responsabilidade e o compromisso de aplicar boas práticas em equipe.'
    const keywords = extractKeywords(jobText)
    const lowerKeywords = keywords.map((k) => k.toLowerCase())

    // Must contain genuine technical terms
    expect(lowerKeywords).toContain('python')
    expect(lowerKeywords).toContain('sql')
    expect(lowerKeywords).toContain('docker')
    expect(lowerKeywords).toContain('inteligência artificial')
    expect(lowerKeywords).toContain('react')
    expect(lowerKeywords).toContain('typescript')
    expect(lowerKeywords).toContain('ci/cd')

    // Must NOT contain generic corporate nouns or verbs
    expect(lowerKeywords).not.toContain('profissional')
    expect(lowerKeywords).not.toContain('responsabilidade')
    expect(lowerKeywords).not.toContain('compromisso')
    expect(lowerKeywords).not.toContain('aplicar')
    expect(lowerKeywords).not.toContain('boas')
    expect(lowerKeywords).not.toContain('práticas')
    expect(lowerKeywords).not.toContain('equipe')
  })

  it('R3: filters out adverbs ending in -mente and verbs with enclitic pronouns', () => {
    const text = 'Atuar diretamente e altamente focado, desenvolvê-lo com precisão e aplicá-los constantemente.'
    const keywords = extractKeywords(text)
    const lowerKeywords = keywords.map((k) => k.toLowerCase())

    expect(lowerKeywords).not.toContain('diretamente')
    expect(lowerKeywords).not.toContain('altamente')
    expect(lowerKeywords).not.toContain('constantemente')
    expect(lowerKeywords).not.toContain('desenvolvê-lo')
    expect(lowerKeywords).not.toContain('aplicá-los')
  })

  it('R3: extracts only authentic technical concepts from SAMPLE_JOB_DESCRIPTION without generic web/responsive words', () => {
    const kw = extractKeywords(SAMPLE_JOB_DESCRIPTION)
    const lowerKw = kw.map((k) => k.toLowerCase())

    // Must NOT contain generic web or responsive words
    expect(lowerKw).not.toContain('web')
    expect(lowerKw).not.toContain('responsivas')
    expect(lowerKw).not.toContain('responsivo')

    // Must contain authentic technical requirements
    expect(lowerKw).toContain('react')
    expect(lowerKw).toContain('typescript')
    expect(lowerKw).toContain('tailwind css')
    expect(lowerKw).toContain('css-in-js')
    expect(lowerKw).toContain('rest api')
    expect(lowerKw).toContain('testes automatizados')
    expect(lowerKw).toContain('testes unitários')
    expect(lowerKw).toContain('jest')
    expect(lowerKw).toContain('vitest')
    expect(lowerKw).toContain('git')
    expect(lowerKw).toContain('github')
    expect(lowerKw).toContain('ci/cd')
    expect(lowerKw).toContain('next.js')
    expect(lowerKw).toContain('docker')
    expect(lowerKw).toContain('wcag')
  })

  it('R3: ignores job benefits, HR clauses, and salary negotiations, extracting solely real tech skills', () => {
    const job = `
      Requisitos Técnicos: React, TypeScript, Docker.
      Benefícios: Plano de saúde e odontológico, seguro de vida, vale transporte. Salário a combinar.
      Contratação para início imediato no modelo presencial.
    `
    const kw = extractKeywords(job)
    expect(kw).toEqual(['React', 'TypeScript', 'Docker'])
  })

  it('R3: yields zero false positive keywords from typical HR and company culture boilerplate', () => {
    const boilerplate = `
      Requisitos: Experiência sólida, perfil proativo e dinâmico, ensino superior completo em ciências ou afins.
      Oferecemos: Vale refeição, vale alimentação, assistência médica, assistência odontológica, seguro de vida, gympass, auxílio creche, participação nos lucros e resultados (PLR), previdência privada, horário flexível.
      Sobre nós: Empresa líder em constante crescimento e expansão, cultura colaborativa e inovadora.
      Atividades: Participar de reuniões diárias, propor melhorias contínuas, colaborar com o time na resolução de problemas, criar código de qualidade.
      Regime: CLT ou PJ, trabalho 100% remoto ou modelo híbrido em São Paulo.
      Disponibilidade para início imediato ou a combinar.
      Interessados devem enviar currículo atualizado com pretensão salarial.
    `
    const kw = extractKeywords(boilerplate)
    expect(kw).toEqual([])
  })

  it('R3: skips percentage numbers, currency, and multipliers (100%, 30%, 10x, 24/7, 10+, 5k)', () => {
    const text = 'Atuação 100% remota com redução de 30% nos custos, produtividade 10x, suporte 24/7, 10+ anos e 15k de salário em Python.'
    const kw = extractKeywords(text)
    const lowerKw = kw.map((k) => k.toLowerCase())

    expect(lowerKw).toContain('python')
    expect(lowerKw).not.toContain('100%')
    expect(lowerKw).not.toContain('30%')
    expect(lowerKw).not.toContain('10x')
    expect(lowerKw).not.toContain('24/7')
    expect(lowerKw).not.toContain('10+')
    expect(lowerKw).not.toContain('15k')
  })

  it('R3: ignores behavioral participles, soft skills, company size, and talent bank boilerplate', () => {
    const text = `
      Buscamos pessoas talentosas e apaixonadas por tecnologia, com perfil focado, motivado e engajado.
      Desejável capacidade analítica e raciocínio lógico, espírito de equipe e senso de urgência.
      Empresa de grande porte com modelo home office, oferecendo vale-transporte e ticket alimentação.
      Venha fazer parte do nosso banco de talentos!
      Requisitos Técnicos: Python, Docker e PostgreSQL.
    `
    const kw = extractKeywords(text)
    expect(kw).toEqual(['Python', 'Docker', 'PostgreSQL'])
  })

  it('R3: extracts multiword Portuguese phrases even when unaccented in job description', () => {
    const text = 'Requisitos: Inteligencia Artificial, orientacao a objetos, testes unitarios e metodologias ageis.'
    const kw = extractKeywords(text)
    const lowerKw = kw.map((k) => k.toLowerCase())

    expect(lowerKw).toContain('inteligência artificial')
    expect(lowerKw).toContain('orientação a objetos')
    expect(lowerKw).toContain('testes unitários')
    expect(lowerKw).toContain('metodologias ágeis')
    expect(lowerKw).not.toContain('artificial')
    expect(lowerKw).not.toContain('objetos')
    expect(lowerKw).not.toContain('testes')
    expect(lowerKw).not.toContain('unitarios')
  })

  it('R3: extracts multiword Portuguese OOP phrases and recognizes POO/OOP acronyms', () => {
    const text = 'Requisitos: Orientação a Objetos, POO, Clean Architecture e Testes Unitários.'
    const kw = extractKeywords(text)
    const lowerKw = kw.map((k) => k.toLowerCase())

    expect(lowerKw).toContain('orientação a objetos')
    expect(lowerKw).toContain('clean architecture')
    expect(lowerKw).toContain('testes unitários')
    expect(lowerKw).toContain('poo')
  })

  it('R3: filters spoken languages, degree titles, and project management jargon', () => {
    const text = `
      Requisitos: Bacharelado completo em Engenharia de Software ou afins.
      Inglês fluente e Espanhol intermediário para comunicação com stakeholders.
      Definição de escopo, critérios de aceitação, backlog do produto e planejamento de sprints em roadmap ágil.
      Tecnologias: React, Docker, Kubernetes.
    `
    const kw = extractKeywords(text)
    const lowerKw = kw.map((k) => k.toLowerCase())

    expect(lowerKw).toContain('react')
    expect(lowerKw).toContain('docker')
    expect(lowerKw).toContain('kubernetes')

    // Spoken languages must NOT be extracted
    expect(lowerKw).not.toContain('inglês')
    expect(lowerKw).not.toContain('ingles')
    expect(lowerKw).not.toContain('espanhol')

    // Degrees must NOT be extracted
    expect(lowerKw).not.toContain('bacharelado')

    // Management/routine words must NOT be extracted
    expect(lowerKw).not.toContain('escopo')
    expect(lowerKw).not.toContain('critérios')
    expect(lowerKw).not.toContain('backlog')
    expect(lowerKw).not.toContain('sprints')
    expect(lowerKw).not.toContain('roadmap')
  })
})

