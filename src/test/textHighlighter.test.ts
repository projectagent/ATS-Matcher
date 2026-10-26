import { describe, expect, it } from 'vitest'
import { highlightKeywordsInText } from '../utils/textHighlighter'
import React from 'react'

describe('textHighlighter', () => {
  it('returns original string when foundKeywords is empty or text is empty', () => {
    expect(highlightKeywordsInText('', ['React'])).toBe('')
    expect(highlightKeywordsInText('Texto qualquer', [])).toBe('Texto qualquer')
  })

  it('highlights matching keywords within text without modifying the text content', () => {
    const text = 'Desenvolvimento com React e TypeScript em projetos web.'
    const result = highlightKeywordsInText(text, ['React', 'TypeScript'])

    expect(React.isValidElement(result) || Array.isArray(result)).toBe(true)
    if (Array.isArray(result)) {
      // Find element containing React
      const reactEl = result.find(
        (el) => React.isValidElement(el) && (el.props as { children?: React.ReactNode }).children === 'React'
      )
      expect(reactEl).toBeDefined()
    }
  })
})
