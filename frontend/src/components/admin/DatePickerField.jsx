import { useState } from "react";
import { Calendar, X } from "lucide-react";
import DateCalendar from "../DateCalendar";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { formatFullDate } from "../../lib/i18n/dateFormat";

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DatePickerField({ value, onChange, minDate, label }) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);

  function formatDisplay(iso) {
    if (!iso) return t("picker.selectDate");
    const [y, m, d] = iso.split("-").map(Number);
    return formatFullDate(new Date(y, m - 1, d), lang);
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label || t("picker.chooseDate")}
        className="touch-manipulation flex items-center gap-2 rounded-lg border border-charcoal-lighter bg-ink px-3 py-2 text-sm text-cream transition-colors hover:border-gold/50 focus:border-gold focus:outline-none"
      >
        <Calendar size={16} className="text-gold" />
        {formatDisplay(value)}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 px-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-xs shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("picker.close")}
              className="touch-manipulation absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-charcoal-lighter bg-charcoal text-cream/70 shadow-lg transition-colors hover:border-gold/50 hover:text-gold"
            >
              <X size={16} />
            </button>
            <DateCalendar
              value={value || todayIso()}
              minDate={minDate}
              onChange={(iso) => {
                onChange(iso);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
