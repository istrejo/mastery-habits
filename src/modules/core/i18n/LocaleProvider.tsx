import React, { useEffect } from 'react';
import i18n from 'i18next';
import { useLocaleStore } from './locale.store';
import { resolveLocale } from './i18n';

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const locale = useLocaleStore((s) => s.locale);
  const resolved = resolveLocale(locale);

  useEffect(() => {
    if (i18n.language !== resolved) {
      i18n.changeLanguage(resolved);
    }
  }, [resolved]);

  return <>{children}</>;
};
