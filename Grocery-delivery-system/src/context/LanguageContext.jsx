import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import enTranslations from '../locales/en.json'
import amTranslations from '../locales/am.json'
import tiTranslations from '../locales/ti.json'
import omTranslations from '../locales/om.json'

// eslint-disable-next-line react-refresh/only-export-components
export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'am', label: 'አማርኛ', short: 'አማ' },
  { code: 'ti', label: 'ትግርኛ', short: 'ትግ' },
  { code: 'om', label: 'Afaan Oromoo', short: 'OM' },
]

const LANGUAGE_STORAGE_KEY = 'grocery_language'
const languageCodes = new Set(LANGUAGES.map(({ code }) => code))
const LanguageContext = createContext(null)

const translations = {
  en: enTranslations,
  am: amTranslations,
  ti: tiTranslations,
  om: omTranslations,
}

function getTranslation(dictionary, key) {
  if (typeof key !== 'string') {
    return undefined
  }

  const value = key.split('.').reduce(
    (current, part) => current?.[part],
    dictionary,
  )
  if (typeof value === 'string') {
    return value
  }

  if (!key.includes('.')) {
    for (const section of Object.values(dictionary)) {
      if (
        section &&
        Object.prototype.hasOwnProperty.call(section, key) &&
        typeof section[key] === 'string'
      ) {
        return section[key]
      }
    }
  }

  return undefined
}

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'en'
  }

  try {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return languageCodes.has(savedLanguage) ? savedLanguage : 'en'
  } catch (error) {
    console.error('Unable to load language preference from localStorage:', error)
    return 'en'
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage)

  const setLanguage = useCallback((nextLanguage) => {
    if (!languageCodes.has(nextLanguage)) {
      throw new TypeError(`Unsupported language: ${nextLanguage}`)
    }
    setLanguageState(nextLanguage)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch (error) {
      console.error('Unable to save language preference to localStorage:', error)
    }
  }, [language])

  const t = useCallback(
    (key) =>
      getTranslation(translations[language], key) ??
      getTranslation(translations.en, key) ??
      key,
    [language],
  )

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// The hook is exported with the provider for the same fast-refresh convention as AuthContext.
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext)

  if (context === null) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}
