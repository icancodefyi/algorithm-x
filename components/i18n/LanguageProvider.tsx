"use client";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  ReactNode,
} from "react";
import { translations, type Translations } from "@/lib/translations";

export const LANGUAGES = [
  { code: "en", native: "English", name: "English" },
  { code: "hi", native: "हिन्दी", name: "Hindi" },
  { code: "bn", native: "বাংলা", name: "Bengali" },
  { code: "ta", native: "தமிழ்", name: "Tamil" },
  { code: "te", native: "తెలుగు", name: "Telugu" },
  { code: "mr", native: "मराठी", name: "Marathi" },
  { code: "kn", native: "ಕನ್ನಡ", name: "Kannada" },
  { code: "gu", native: "ગુજરાતી", name: "Gujarati" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: Translations;
  languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
  languages: LANGUAGES,
});

const STORAGE_KEY = "sniffer_lang";

/** BCP 47 tags for <html lang="…"> — matches browser / screen reader expectations. */
const HTML_LANG: Record<LangCode, string> = {
  en: "en",
  hi: "hi",
  bn: "bn",
  ta: "ta",
  te: "te",
  mr: "mr",
  kn: "kn",
  gu: "gu",
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (stored && translations[stored]) {
      setLangState(stored);
    }
  }, []);

  // Keep global document language in sync (accessibility, hyphenation, font fallback).
  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = HTML_LANG[lang] ?? lang;
  }, [lang]);

  const setLang = (code: LangCode) => {
    setLangState(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t: translations[lang], languages: LANGUAGES }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
