import { describe, expect, it } from 'vitest'
import { analyzeMatch } from '../utils/matchingEngine'
import { extractKeywords } from '../utils/keywordExtractor'
import { optimizeResumeForATS } from '../utils/atsOptimizer'

describe('Edge Cases & Stress Handling', () => {
  it('handles massive blocks of text (100k+ chars) without crashing or timing out', () => {
    const repeatedJob = 'React TypeScript Tailwind CSS Docker REST API '.repeat(2000)
    const repeatedResume = 'Desenvolvedor com experiência em React e Tailwind CSS. '.repeat(2000)

    const startTime = performance.now()
    const result = analyzeMatch(repeatedJob, repeatedResume)
    const duration = performance.now() - startTime

    expect(duration).toBeLessThan(1000) // Fast execution under 1s
    expect(result.score).toBeGreaterThan(0)
    expect(result.foundKeywords).toContain('React')
  })

  it('handles empty inputs and whitespace gracefully', () => {
    const result = analyzeMatch('   \n\t  ', '   ')
    expect(result.score).toBe(0)
    expect(result.jobKeywords).toEqual([])
    expect(result.foundKeywords).toEqual([])
    expect(result.missingKeywords).toEqual([])

    const optimized = optimizeResumeForATS('', result)
    expect(optimized.fullName).toBe('Nome do Candidato')
    expect(optimized.skills).toEqual([])
  })

  it('handles special characters and punctuation clusters safely', () => {
    const messyText = '!!! @@@ $$$ %%% ^^^ &&& *** ((( ))) ___ +++ === ~~~ ```'
    const keywords = extractKeywords(messyText)
    expect(Array.isArray(keywords)).toBe(true)
  })
})
