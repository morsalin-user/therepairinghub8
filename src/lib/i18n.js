"use client"

import { useState, useEffect } from "react"

// Available languages
export const LANGUAGES = {
  de: "Deutsch",
  en: "English",
  it: "Italiano",
  fr: "Français",
  cs: "Čeština",
  sk: "Slovenčina",
}

// Supported languages (only these have translation files)
export const SUPPORTED_LANGUAGES = ["de", "en"]

// Default language
export const DEFAULT_LANGUAGE = "de"

// Language storage key
const LANGUAGE_STORAGE_KEY = "repairinghub_language"

// Translation cache
const translationsCache = {}

// Load translations for a specific language
async function loadTranslations(language) {
  if (translationsCache[language]) {
    return translationsCache[language]
  }

  try {
    const translations = await import(`./translations/${language}.json`)
    translationsCache[language] = translations.default
    return translations.default
  } catch (error) {
    console.warn(`Failed to load translations for ${language}:`, error)
    // Fallback to English if German fails, or empty object if English fails
    if (language !== "en") {
      return loadTranslations("en")
    }
    return {}
  }
}

// Get stored language or default
export function getStoredLanguage() {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return SUPPORTED_LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE
}

// Store language preference
export function storeLanguage(language) {
  if (typeof window === "undefined") return
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}

// Custom hook for internationalization
export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE)
  const [translations, setTranslations] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  // Load translations when language changes
  useEffect(() => {
    async function loadCurrentTranslations() {
      setIsLoading(true)
      const stored = getStoredLanguage()
      setCurrentLanguage(stored)

      const newTranslations = await loadTranslations(stored)
      setTranslations(newTranslations)
      setIsLoading(false)
    }

    loadCurrentTranslations()
  }, [])

  // Translation function
  const t = (key, params = {}) => {
    if (isLoading) return key

    const keys = key.split(".")
    let value = translations

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    if (typeof value !== "string") {
      console.warn(`Translation value is not a string: ${key}`)
      return key
    }

    // Replace parameters in the translation
    let result = value
    Object.keys(params).forEach((param) => {
      result = result.replace(new RegExp(`{{${param}}}`, "g"), params[param])
    })

    return result
  }

  // Change language function
  const changeLanguage = async (newLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(newLanguage)) {
      // Show alert for unsupported languages
      const message =
        currentLanguage === "de"
          ? "Diese Sprache ist derzeit nicht verfügbar. Bitte wählen Sie Deutsch oder English."
          : "This language is currently not available. Please choose German or English."

      alert(message)
      return false
    }

    if (newLanguage === currentLanguage) return true

    setIsLoading(true)
    const newTranslations = await loadTranslations(newLanguage)

    setCurrentLanguage(newLanguage)
    setTranslations(newTranslations)
    storeLanguage(newLanguage)
    setIsLoading(false)

    // Dispatch custom event for components that need to react to language changes
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("languageChanged", {
          detail: { language: newLanguage },
        }),
      )
    }

    return true
  }

  return {
    t,
    currentLanguage,
    changeLanguage,
    isLoading,
    supportedLanguages: SUPPORTED_LANGUAGES,
    allLanguages: LANGUAGES,
  }
}

// Helper function to get nested translation value
export function getTranslation(translations, key, params = {}) {
  const keys = key.split(".")
  let value = translations

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k]
    } else {
      return key
    }
  }

  if (typeof value !== "string") {
    return key
  }

  // Replace parameters
  let result = value
  Object.keys(params).forEach((param) => {
    result = result.replace(new RegExp(`{{${param}}}`, "g"), params[param])
  })

  return result
}

// Export for server-side usage
export { loadTranslations }
