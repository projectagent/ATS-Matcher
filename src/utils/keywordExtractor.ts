import { STOPWORDS_EN, STOPWORDS_PT, TECH_MULTIWORD_KEYWORDS } from './constants'

const VALID_SHORT_KEYWORDS = new Set([
  'c', 'r', 'go', 'ai', 'ui', 'ux', 'qa', 'ci', 'cd', 'sql', 'git', 'aws',
  'c#', 'c++', '.net', 'net', 'js', 'ts', 'ml', 'ip', 'os', 'db', 'vm',
  'poo', 'oop', 'tdd', 'ddd', 'spa', 'k8s', 'gcp', 'bi'
])

// Recognized slash patterns to protect before separating general slashes
const PROTECTED_SLASH_PATTERNS = [
  'ci/cd', 'ui/ux', 'tcp/ip', 'pl/sql', 'i/o', 'os/2'
]

function normalizeAccent(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function makeAccentInsensitiveRegex(phrase: string): RegExp {
  let pattern = ''
  for (const ch of phrase) {
    const lower = ch.toLowerCase()
    switch (lower) {
      case 'a':
      case 'á':
      case 'à':
      case 'ã':
      case 'â':
        pattern += '[aáàãâä]'
        break
      case 'e':
      case 'é':
      case 'ê':
      case 'è':
        pattern += '[eéèêë]'
        break
      case 'i':
      case 'í':
      case 'ì':
      case 'î':
        pattern += '[iíìîï]'
        break
      case 'o':
      case 'ó':
      case 'õ':
      case 'ô':
      case 'ò':
        pattern += '[oóòõôö]'
        break
      case 'u':
      case 'ú':
      case 'ù':
      case 'û':
      case 'ü':
        pattern += '[uúùûü]'
        break
      case 'c':
      case 'ç':
        pattern += '[cç]'
        break
      case ' ':
        pattern += '\\s+'
        break
      case '.':
        pattern += '\\.'
        break
      case '/':
        pattern += '\\/'
        break
      case '-':
        pattern += '[-–—\\s]+'
        break
      default:
        pattern += escapeRegExp(ch)
    }
  }
  return new RegExp(`\\b${pattern}\\b`, 'gi')
}

/**
 * Extracts relevant keywords from job description or text.
 * Filters out common stopwords, punctuation, and non-meaningful terms,
 * while preserving multi-word technical concepts and tech symbols (C++, C#, .NET).
 */
export function extractKeywords(text: string): string[] {
  if (!text || typeof text !== 'string') return []

  const foundKeywordsMap = new Map<string, string>() // key: normalized lower, value: display version

  // 1. Extract predefined multi-word technical phrases (sorted longest first)
  const sortedPhrases = [...TECH_MULTIWORD_KEYWORDS].sort((a, b) => b.length - a.length)
  for (const phrase of sortedPhrases) {
    const regex = makeAccentInsensitiveRegex(phrase)
    const match = text.match(regex)
    if (match) {
      const canonical = match[0].trim()
      const display =
        normalizeAccent(canonical) === canonical && normalizeAccent(phrase) !== phrase
          ? phrase
          : canonical
      foundKeywordsMap.set(phrase.toLowerCase(), display)
    }
  }

  // 2. Protect specific slash keywords before tokenization
  let sanitized = text
  const protectedPlaceholders: { placeholder: string; original: string }[] = []
  PROTECTED_SLASH_PATTERNS.forEach((pattern, index) => {
    const placeholder = `__SLASH_KW_${index}__`
    const regex = new RegExp(`\\b${escapeRegExp(pattern)}\\b`, 'gi')
    if (regex.test(sanitized)) {
      sanitized = sanitized.replace(regex, (m) => {
        protectedPlaceholders.push({ placeholder, original: m })
        return placeholder
      })
    }
  })

  // 3. Clean punctuation: split on unprotect slash, brackets, quotes, etc.
  sanitized = sanitized
    .replace(/[()[\]{}<>"'`’“”—–;:\n\r\t/\\|,]/g, ' ')
    .replace(/\s+/g, ' ')

  // Restore protected slash keywords
  for (const { placeholder, original } of protectedPlaceholders) {
    sanitized = sanitized.replace(new RegExp(placeholder, 'g'), original)
  }

  const rawTokens = sanitized.split(' ')

  for (const rawToken of rawTokens) {
    let token = rawToken.trim()
    if (!token) continue

    // Handle .NET or .net without stripping leading dot
    if (token.toLowerCase() === '.net' || token.toLowerCase().startsWith('.net')) {
      token = token.replace(/[,\-?!]+$/g, '').trim()
    } else {
      token = token.replace(/^[.,\-?!]+|[.,\-?!]+$/g, '').trim()
    }

    if (!token) continue
    const lowerToken = token.toLowerCase()
    const unaccented = normalizeAccent(lowerToken)

    // Skip if it's already captured as part of a multiword keyword (e.g. "Tailwind" when "Tailwind CSS" exists)
    let isPartOfMultiword = false
    for (const phrase of foundKeywordsMap.keys()) {
      const phraseTokens = phrase.split(/\s+/)
      const unaccentedPhraseTokens = normalizeAccent(phrase).split(/\s+/)
      if (phraseTokens.includes(lowerToken) || unaccentedPhraseTokens.includes(unaccented)) {
        isPartOfMultiword = true
        break
      }
    }
    if (isPartOfMultiword) continue

    // Skip numbers, pure digits, percentages, fractions, numeric multipliers, and range suffixes (e.g. 100%, 30%, 10x, 24/7, 10+, 5k)
    if (
      /^\d+$/.test(lowerToken) ||
      /^r?\$?\d+(?:[.,]\d+)?(?:[%xXkK+]|st|nd|rd|th)?$/i.test(token) ||
      /^\d+\/\d+$/.test(token) ||
      /^(?:iii|iv|vii|viii|xii)$/i.test(lowerToken)
    ) {
      continue
    }

    // Lexical Heuristics: Skip Portuguese verbs with enclitic pronouns (e.g. aplicá-los, desenvolvê-lo, realizá-la)
    if (/^[a-zà-ú]+-(?:los|las|lo|la|nos|vos|se|me|te|lhe|lhes)$/i.test(token)) {
      continue
    }

    // Lexical Heuristics: Skip common Portuguese and Spanish adverbs ending in -mente (e.g. altamente, diretamente)
    if (lowerToken.endsWith('mente') && lowerToken.length > 5) {
      continue
    }

    // Lexical Heuristics: Skip Portuguese abstract and action nouns / adjectives ending in common non-technical suffixes
    if (
      /(?:ção|ções|cao|coes|são|sões|sao|soes|dade|dades|mento|mentos|ência|ências|encia|encias|ança|ancas|dão|dões|dao|does|ável|áveis|avel|aveis|ível|íveis|ivel|iveis|ismo|ismos|tude|tudes|agem|agens)$/i.test(
        lowerToken
      )
    ) {
      continue
    }

    // Skip stopwords (both accented and unaccented)
    if (
      STOPWORDS_PT.has(lowerToken) ||
      STOPWORDS_PT.has(unaccented) ||
      STOPWORDS_EN.has(lowerToken) ||
      STOPWORDS_EN.has(unaccented)
    ) {
      continue
    }

    // Filter by length: discard if length <= 2 unless recognized short tech keyword
    if (token.length <= 2 && !VALID_SHORT_KEYWORDS.has(lowerToken)) continue

    // Ignore purely non-alphanumeric (unless known tech like C++)
    if (!/[a-z0-9]/i.test(token)) continue

    // Avoid duplicating e.g. "React" and "React.js"
    const baseName = lowerToken.replace(/\.js$/i, '').replace(/js$/i, '')
    if (foundKeywordsMap.has(baseName) || foundKeywordsMap.has(`${baseName}.js`)) {
      continue
    }

    // Record unique keyword
    if (!foundKeywordsMap.has(lowerToken)) {
      foundKeywordsMap.set(lowerToken, token)
    }
  }

  return Array.from(foundKeywordsMap.values())
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
