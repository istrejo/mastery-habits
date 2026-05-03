import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { es } from './locales/es';
import { en } from './locales/en';
import type { LocaleId } from './types';

export function resolveLocale(stored: LocaleId | null): LocaleId {
  if (stored === 'es' || stored === 'en') return stored;
  const deviceLang = getLocales()[0]?.languageCode ?? 'es';
  return deviceLang === 'en' ? 'en' : 'es';
}

export function initI18n(initialLocale: LocaleId) {
  if (i18n.isInitialized) return;
  i18n.use(initReactI18next).init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: initialLocale,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
  });
}
