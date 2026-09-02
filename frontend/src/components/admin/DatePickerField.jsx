import { useState } from "react";
import { Calendar } from "lucide-react";
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-xs shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
