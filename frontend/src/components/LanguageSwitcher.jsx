import { useLanguage } from "../lib/i18n/LanguageContext";

const CODES = { en: "EN", fa: "FA", hy: "HY" };

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, languages, t } = useLanguage();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label={t("common.language")}
      className={`cursor-pointer appearance-none rounded-full border border-charcoal-lighter bg-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-cream/70 transition-colors hover:border-gold/50 hover:text-gold focus:border-gold focus:outline-none ${className}`}
    >
      {Object.keys(languages).map((code) => (
        <option key={code} value={code} className="bg-charcoal text-cream">
          {CODES[code] || code.toUpperCase()} · {languages[code].nativeLabel}
        </option>
      ))}
    </select>
  );
}
