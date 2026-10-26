import type { AnalysisResult, StructuredResume } from '../types/ats'
import { containsKeyword } from './matchingEngine'

const BULLET_REGEX = /^(?:[-–—•·*▪▫►✓✔]|\d+[.)])\s*/

/**
 * Detects whether a string is a pagination indicator (e.g. "Page 1 of 2", "Página 2 de 3", "Pág. X / Y", "Page X", "- X -", "1 of 2").
 */
export function isPaginationArtifact(line: string): boolean {
  const s = line.trim()
  if (!s) return false

  // 1. Explicit page indicator words (Page, Página, Pág, Pag, Pg, P., Folha, Sheet) with numbers or placeholder X/Y
  if (
    /^[-–—~|•*#_=[(]*\s*(?:page|p[aá]g(?:ina)?|pg|p|folha|sheet)[.:]?\s*[:#]?\s*#?\s*(?:\d{1,3}|[xXyY])(?:\s*(?:de|of|\/|-|\|)\s*(?:\d{1,3}|[xXyY]))?\s*[-–—~|•*#_=\])]*$/i.test(
      s
    )
  ) {
    return true
  }

  // 2. Standalone page ratio or range without keyword (e.g. "1 of 2", "2 de 3", "1 / 2", "1/2", "1 | 2", "- 1 / 2 -")
  if (
    /^[-–—~|•*#_=[(]*\s*(?:\d{1,3}|[xXyY])\s*(?:\/|de|of|\|)\s*(?:\d{1,3}|[xXyY])\s*[-–—~|•*#_=\])]*$/i.test(
      s
    )
  ) {
    return true
  }

  // 3. Dashed, enclosed or isolated single number or placeholder (e.g. "- 1 -", "-- 1 --", "• 1 •", "- X -", "[ 1 ]", "( 1 )", "=== 1 ===")
  if (
    /^[-–—~|•·*#_=+]+\s*(?:\d{1,3}|[xXyY])\s*[-–—~|•·*#_=+]+$/i.test(s) ||
    /^[(<[{]\s*(?:\d{1,3}|[xXyY])\s*[)>\]}]$/i.test(s)
  ) {
    return true
  }

  // 4. Standalone single number alone on a line (1 to 3 digits)
  if (/^\d{1,3}$/.test(s)) {
    return true
  }

  return false
}

/**
 * Sanitizes resume text by detecting and removing pagination artifacts and header/footer residues
 * copied from PDF readers, without modifying real numerical data (e.g. "3 anos de experiência", "equipe de 5 desenvolvedores").
 */
export function sanitizeResumeText(rawResume: string): string {
  if (!rawResume || typeof rawResume !== 'string') return ''

  const lines = rawResume.split('\n')
  const cleanedLines: string[] = []

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()

    // Preserve blank line spacing
    if (!trimmed) {
      if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== '') {
        cleanedLines.push('')
      }
      continue
    }

    // 1. If entire line is a pagination artifact, discard completely
    if (isPaginationArtifact(trimmed)) {
      continue
    }

    // 2. Clean inline pagination fragments from mixed header/footer lines (e.g. "Lucas Silveira | Página 2 de 3", "2 of 3 | Lucas Silveira", "1/2 | Lucas Silveira")
    let cleaned = trimmed
      // 1. Enclosed page ratio first so (Page 1 of 2) or [1 of 2] is removed with its brackets
      .replace(
        /\s*[([](?:(?:page|p[aá]g(?:ina)?|pg|p|folha|sheet)[.:]?\s*[:#]?\s*#?\s*(?:\d{1,3}|[xXyY])(?:\s*(?:de|of|\/|-|\|)\s*(?:\d{1,3}|[xXyY]))?|(?:\d{1,3}|[xXyY])\s*(?:de|of|\/)\s*(?:\d{1,3}|[xXyY]))\s*[\])]\s*/gi,
        ' '
      )
      // 2. Explicit page word with numbers (e.g. "Lucas Silveira | Página 2 de 3", "Page: 1 of 2 | Lucas Silveira")
      .replace(
        /(?:\s*[-|•·–—:]\s*)?\b(?:page|p[aá]g(?:ina)?|pg|p|folha|sheet)[.:]?\s*[:#]?\s*#?\s*(?:\d{1,3}|[xXyY])(?:\s*(?:de|of|\/|-|\|)\s*(?:\d{1,3}|[xXyY]))?\b(?:\s*[-|•·–—:]\s*)?/gi,
        ' '
      )
      // 3. Page ratio preceded by delimiter (e.g. "Lucas Silveira | 2 of 3", "Lucas Silveira - 1/2", "Lucas Silveira | 2 of 3 | SP")
      .replace(
        /(?:\s+[-|•·–—:]\s+)(?:\d{1,3}|[xXyY])\s*(?:de|of|\/)\s*(?:\d{1,3}|[xXyY])(?:\s+[-|•·–—:]\s*|\s*$)/gi,
        ' '
      )
      // 4. Page ratio followed by delimiter (e.g. "2 of 3 | Lucas Silveira", "1/2 | Lucas Silveira")
      .replace(
        /(?:^|(?:\s*[-|•·–—:]\s*))(?:\d{1,3}|[xXyY])\s*(?:de|of|\/)\s*(?:\d{1,3}|[xXyY])(?:\s+[-|•·–—:]\s*)/gi,
        ' '
      )
      .replace(/\s+/g, ' ')
      .trim()

    // Strip any dangling leading or trailing delimiters remaining
    cleaned = cleaned.replace(/^[-|•·–—:()[\]]+\s*|\s*[-|•·–—:()[\]]+$/g, '').trim()

    // If line became empty or only punctuation/pagination artifact, discard
    if (!cleaned || isPaginationArtifact(cleaned) || /^[-|•·–—:.()[\]]+$/.test(cleaned)) {
      continue
    }

    cleanedLines.push(cleaned)
  }

  return cleanedLines.join('\n').trim()
}

/**
 * Optimizes the resume content into standard ATS-friendly structure.
 * CRITICAL RULE: Never injects fictitious skills or experience.
 * Only reorganizes and formats real candidate data, highlighting true matches.
 */
export function optimizeResumeForATS(
  rawResume: string,
  analysis: AnalysisResult
): StructuredResume {
  const sanitizedResume = sanitizeResumeText(rawResume)
  const lines = sanitizedResume.split('\n').map((l) => l.trim())
  
  let fullName = ''
  let contactInfo = ''
  let summary = ''
  const skills: string[] = []
  const experiences: { role: string; company: string; period: string; bullets: string[] }[] = []
  const education: string[] = []

  let currentSection = 'header'
  let currentExperience: { role: string; company: string; period: string; bullets: string[] } | null = null

  // Normalize line removing accents and symbols to reliably detect headers without false positives
  const isSectionHeader = (line: string): string | null => {
    const trimmed = line.trim()
    if (trimmed.length > 50) return null
    // If line is a bullet item or numbered item, it cannot be a section header
    if (BULLET_REGEX.test(trimmed)) return null

    // If it ends with sentence punctuation in original line (e.g. "Tenho 5 anos de experiência."), it's a sentence, not a header
    if (/[.!?]$/.test(trimmed)) return null

    const l = trimmed
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^#+\s*/, '') // markdown headers #, ##
      .replace(/[:;*_\-–—]+$/g, '') // trailing colons or dashes
      .replace(/[&/]/g, ' e ')
      .replace(/[:#*_\-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const words = l.split(/\s+/).filter(Boolean)
    if (words.length === 0 || words.length > 5) return null

    if (/^(?:resumo|resumo profissional|perfil|perfil profissional|sobre mim|sobre|apresentacao|summary|professional summary|about me)$/.test(l)) {
      return 'summary'
    }
    if (/^(?:experiencia|experiencias|experiencia profissional|experiencias profissionais|experiencia de trabalho|historico|historico profissional|historico de trabalho|atuacao profissional|trajetoria profissional|experience|work experience|professional experience|employment history)$/.test(l)) {
      return 'experience'
    }
    if (/^(?:competencias?|competencias? tecnicas?|habilidades?|habilidades? tecnicas?|skills?|technical skills?|tecnologias?|tecnologias? e ferramentas|ferramentas|ferramentas e tecnologias|competencias? e habilidades?|habilidades? e competencias?|conhecimentos? tecnicos?)$/.test(l)) {
      return 'skills'
    }
    if (/^(?:formacao|formacao academica|formacao educacional|formacao e certificacoes|educacao|education|academic background|graduacao|pos graduacao|pos-graduacao|cursos|cursos e certificacoes|cursos e certificados|certificacoes|certificacoes e cursos|certificados)$/.test(l)) {
      return 'education'
    }
    return null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    const detected = isSectionHeader(line)
    if (detected) {
      if (currentExperience && currentSection === 'experience') {
        experiences.push(currentExperience)
        currentExperience = null
      }
      currentSection = detected
      continue
    }

    if (currentSection === 'header') {
      if (!fullName) {
        fullName = line
      } else {
        const isContactLike =
          (/@|\d{4,}|linkedin|github|http|www|\/in\//i.test(line) || line.includes('|') || line.split(/\s+/).length <= 6) &&
          line.length < 85
        if (isContactLike && !summary) {
          contactInfo = contactInfo ? `${contactInfo} • ${line}` : line
        } else {
          // Transition naturally into summary
          summary += (summary ? ' ' : '') + line
          currentSection = 'summary'
        }
      }
    } else if (currentSection === 'summary') {
      summary += (summary ? ' ' : '') + line
    } else if (currentSection === 'skills') {
      // Strip bullet characters and category prefixes like "Linguagens: " or "- Ferramentas & Práticas: "
      let cleanedLine = line.replace(BULLET_REGEX, '').trim()
      const colonIndex = cleanedLine.indexOf(':')
      if (colonIndex !== -1 && colonIndex < 35) {
        cleanedLine = cleanedLine.slice(colonIndex + 1).trim()
      }

      // Split by commas, pipes, semicolons, bullets or middle dots
      const items = cleanedLine
        .split(/[,|;•·\n]/)
        .map((s) => s.trim().replace(BULLET_REGEX, ''))
        .filter((s) => s.length > 0)
      
      if (items.length > 0) {
        skills.push(...items)
      } else if (cleanedLine.length > 0) {
        skills.push(cleanedLine)
      }
    } else if (currentSection === 'experience') {
      const isBullet = BULLET_REGEX.test(line)
      if (isBullet) {
        const bulletText = line.replace(BULLET_REGEX, '').trim()
        if (currentExperience) {
          currentExperience.bullets.push(bulletText)
        } else {
          currentExperience = {
            role: 'Experiência Profissional',
            company: '',
            period: '',
            bullets: [bulletText],
          }
        }
      } else {
        const isPeriodLike = /\b(\d{4}|atual|presente|present)\b/i.test(line)
        if (currentExperience && !currentExperience.period && isPeriodLike && currentExperience.bullets.length === 0) {
          currentExperience.period = line
        } else if (line.includes('|') || line.includes(' - ') || /\s+[–—]\s+/.test(line)) {
          if (currentExperience) {
            experiences.push(currentExperience)
          }
          const parts = line.split(/\s*[|]\s*|\s+[-–—]\s+/).map((p) => p.trim())
          currentExperience = {
            role: parts[0] || 'Função',
            company: parts[1] || '',
            period: parts[2] || '',
            bullets: [],
          }
        } else {
          if (currentExperience) {
            if (!currentExperience.company) {
              currentExperience.company = line
            } else if (!currentExperience.period) {
              currentExperience.period = line
            } else {
              currentExperience.bullets.push(line)
            }
          } else {
            currentExperience = {
              role: line,
              company: '',
              period: '',
              bullets: [],
            }
          }
        }
      }
    } else if (currentSection === 'education') {
      education.push(line.replace(BULLET_REGEX, '').trim())
    }
  }

  if (currentExperience) {
    experiences.push(currentExperience)
  }

  // Deduplicate and clean skills
  const cleanSkills = Array.from(new Set(skills.map((s) => s.trim()))).filter(Boolean)

  // Identify which skills in the resume match the job's keywords
  const matchedSkills = cleanSkills.filter((skill) =>
    analysis.foundKeywords.some((kw) => containsKeyword(skill, kw) || containsKeyword(kw, skill))
  )

  const rawRestructuredText = buildATSTextFormat({
    fullName: fullName || 'Nome do Candidato',
    contactInfo: contactInfo || 'Contato não informado',
    summary: summary || 'Resumo profissional não fornecido.',
    skills: cleanSkills,
    matchedSkills,
    foundKeywords: analysis.foundKeywords,
    missingJobKeywordsNotice: analysis.missingKeywords,
    experiences,
    education,
  })

  return {
    fullName: fullName || 'Nome do Candidato',
    contactInfo: contactInfo || 'Contato não informado',
    summary: summary || 'Resumo profissional não fornecido.',
    skills: cleanSkills,
    matchedSkills,
    foundKeywords: analysis.foundKeywords,
    missingJobKeywordsNotice: analysis.missingKeywords,
    experiences,
    education,
    rawRestructuredText,
  }
}

function buildATSTextFormat(data: Omit<StructuredResume, 'rawRestructuredText'>): string {
  let doc = `${data.fullName.toUpperCase()}\n${data.contactInfo}\n\n`
  
  doc += `RESUMO PROFISSIONAL\n-------------------\n${data.summary}\n\n`
  
  if (data.skills.length > 0) {
    doc += `COMPETÊNCIAS TÉCNICAS E PALAVRAS-CHAVE ATS\n-----------------------------------------\n`
    doc += data.skills.join(' • ') + '\n\n'
  }

  if (data.experiences.length > 0) {
    doc += `EXPERIÊNCIA PROFISSIONAL\n------------------------\n`
    for (const exp of data.experiences) {
      doc += `${exp.role}${exp.company ? ` | ${exp.company}` : ''}${exp.period ? ` (${exp.period})` : ''}\n`
      for (const bullet of exp.bullets) {
        doc += `  • ${bullet}\n`
      }
      doc += '\n'
    }
  }

  if (data.education.length > 0) {
    doc += `FORMAÇÃO ACADÊMICA\n------------------\n`
    for (const edu of data.education) {
      doc += `• ${edu}\n`
    }
  }

  return doc.trim()
}
