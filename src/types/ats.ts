export interface KeywordMatch {
  keyword: string
  countInJob: number
  foundInResume: boolean
}

export interface AnalysisResult {
  jobKeywords: string[]
  foundKeywords: string[]
  missingKeywords: string[]
  score: number // 0 to 100
  totalJobKeywords: number
  totalMatched: number
}

export interface ResumeSection {
  title: string
  content: string[]
}

export interface StructuredResume {
  fullName: string
  contactInfo: string
  summary: string
  skills: string[]
  matchedSkills: string[]
  foundKeywords: string[]
  missingJobKeywordsNotice: string[]
  experiences: {
    role: string
    company: string
    period: string
    bullets: string[]
  }[]
  education: string[]
  rawRestructuredText: string
}

