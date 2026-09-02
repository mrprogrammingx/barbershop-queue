import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANGUAGE, LANGUAGES, TRANSLATIONS } from "./translations";

const STORAGE_KEY = "parsa_barber_lang";
const LanguageContext = createContext(null);

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && TRANSLATIONS[stored]) return stored;
  } catch {
    // localStorage unavailable — fall through to default
  }
  return DEFAULT_LANGUAGE;
}

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLanguage);

  useEffect(() => {
    const dir = LANGUAGES[lang]?.dir || "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore — per-viewer convenience only
    }
  }, [lang]);

  const value = useMemo(() => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANGUAGE];
    const fallback = TRANSLATIONS[DEFAULT_LANGUAGE];
    function t(key, vars) {
      const template = dict[key] ?? fallback[key] ?? key;
      return interpolate(template, vars);
    }
    return {
      lang,
      setLang: setLangState,
      t,
      dir: LANGUAGES[lang]?.dir || "ltr",
      languages: LANGUAGES,
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
