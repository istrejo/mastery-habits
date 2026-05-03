import { useTranslation } from 'react-i18next';
import { es } from 'date-fns/locale/es';
import { enUS } from 'date-fns/locale/en-US';
import type { Locale } from 'date-fns';

export function useDateLocale(): Locale {
  const { i18n } = useTranslation();
  return i18n.language === 'en' ? enUS : es;
}
