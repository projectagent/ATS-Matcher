import type { AnalysisResult } from '../types/ats'
import { extractKeywords } from './keywordExtractor'
import { TECH_SYNONYMS } from './constants'

function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function checkSingleTerm(normalizedText: string, term: string): boolean {
  const normTerm = normalizeStr(term)
  if (!normTerm) return false

  const escaped = normTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Boundary conditions for leading character
  const leadingChar = normTerm[0]
  let beforePattern = '[^a-z0-9]'
  if (leadingChar === '+' || leadingChar === '#') {
    beforePattern = `[^a-z0-9\\${leadingChar}]`
  } else if (normTerm.includes('/')) {
    beforePattern = '[^a-z0-9/]'
  }

  // Boundary conditions for trailing character
  const trailingChar = normTerm[normTerm.length - 1]
  let afterPattern = '[^a-z0-9]'
  if (trailingChar === '+' || trailingChar === '#') {
    afterPattern = `[^a-z0-9\\${trailingChar}]`
  } else if (normTerm.includes('/')) {
    afterPattern = '[^a-z0-9/]'
  }

  const regex = new RegExp(`(^|${beforePattern})${escaped}(${afterPattern}|$)`, 'i')
  return regex.test(normalizedText)
}

/**
 * Checks if a specific keyword exists in a text body (case- and accent-insensitive).
 * Handles tech aliases, boundary-sensitive word matching, and symbols like C++, C#, CI/CD.
 */
export function containsKeyword(text: string, keyword: string): boolean {
  if (!text || !keyword) return false
  const normText = normalizeStr(text)
  const normKeyword = normalizeStr(keyword)

  // 1. Direct check
  if (checkSingleTerm(normText, normKeyword)) {
    return true
  }

  // 2. Check synonyms/aliases
  const synonyms = TECH_SYNONYMS[normKeyword] || []
  for (const syn of synonyms) {
    if (checkSingleTerm(normText, syn)) {
      return true
    }
  }

  // 3. Fallback for .js frameworks (e.g. React.js matches React)
  if (normKeyword.endsWith('.js')) {
    const base = normKeyword.replace(/\.js$/, '')
    if (checkSingleTerm(normText, base)) {
      return true
    }
  }

  return false
}

/**
 * Analyzes the match between a Job Description and a Resume.
 * Returns intersection, missing keywords, and match score percentage.
 */
export function analyzeMatch(jobDescription: string, resumeText: string): AnalysisResult {
  const jobKeywords = extractKeywords(jobDescription)
  
  if (jobKeywords.length === 0) {
    return {
      jobKeywords: [],
      foundKeywords: [],
      missingKeywords: [],
      score: 0,
      totalJobKeywords: 0,
      totalMatched: 0,
    }
  }

  const foundKeywords: string[] = []
  const missingKeywords: string[] = []

  for (const keyword of jobKeywords) {
    if (containsKeyword(resumeText, keyword)) {
      foundKeywords.push(keyword)
    } else {
      missingKeywords.push(keyword)
    }
  }

  const score = Math.round((foundKeywords.length / jobKeywords.length) * 100)

  return {
    jobKeywords,
    foundKeywords,
    missingKeywords,
    score,
    totalJobKeywords: jobKeywords.length,
    totalMatched: foundKeywords.length,
  }
}

