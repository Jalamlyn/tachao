import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import HttpApi from "i18next-http-backend"
import translationEn from "../public/locales/en/translation"
import translationZh from "../public/locales/zh/translation"

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "zh",
    resources: {
      zh: {
        translation: translationZh,
      },
      en: {
        translation: translationEn,
      },
    },
    supportedLngs: ["zh", "en"],
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      console.log(`Missing translation - Lang: ${lng}, NS: ${ns}, Key: ${key}, Fallback: ${fallbackValue}`)
    },
    detection: {
      order: ['htmlTag', 'localStorage', 'navigator', 'querystring', 'cookie', 'sessionStorage'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
      fallbackLng: 'zh',
    },
  })

// Function to change language and save to local storage
export const changeLanguage = (lng) => {
  i18n.changeLanguage(lng)
  localStorage.setItem("i18nextLng", lng)
}

// Function to get current language
export const getCurrentLanguage = () => {
  return i18n.language || window.localStorage.i18nextLng || 'zh'
}

export default i18n