import React from 'react'
import { containsKeyword } from './matchingEngine'

/**
 * Highlights keywords found in the job description within text paragraphs or bullets.
 * Guarantees candidate's original text is preserved verbatim without alteration.
 */
export function highlightKeywordsInText(text: string, foundKeywords: string[]): React.ReactNode {
  if (!text || !foundKeywords || foundKeywords.length === 0) {
    return text
  }

  // Filter keywords actually present in this piece of text
  const activeKeywords = foundKeywords
    .filter((kw) => containsKeyword(text, kw))
    .sort((a, b) => b.length - a.length)

  if (activeKeywords.length === 0) {
    return text
  }

  // Build a combined regex matching any of the active keywords
  const escapedTerms = activeKeywords.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(\\b(?:${escapedTerms.join('|')})\\b)`, 'gi')

  const parts = text.split(regex)

  return parts.map((part, index) => {
    const isMatch = activeKeywords.some(
      (kw) => kw.toLowerCase() === part.toLowerCase()
    )

    if (isMatch) {
      return (
        <span
          key={index}
          className="font-semibold text-emerald-900 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200/70 print:bg-transparent print:border-none print:text-slate-900 print:underline print:decoration-emerald-600"
          title="Palavra-chave alinhada com a vaga"
        >
          {part}
        </span>
      )
    }

    return <React.Fragment key={index}>{part}</React.Fragment>
  })
}
