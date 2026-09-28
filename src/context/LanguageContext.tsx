"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, TRANSLATIONS, TranslationKey } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  lang: "en",
  setLang: () => {},
  t: (key) => TRANSLATIONS.en[key] || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aapka_astro_lang");
      if (saved === "en" || saved === "hi") {
        setLanguageState(saved);
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("aapka_astro_lang", lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore
    }
  };

  const t = (key: TranslationKey): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, lang: language, setLang: setLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
