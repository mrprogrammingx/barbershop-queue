import { useState } from "react";
import { Calendar } from "lucide-react";
import DateCalendar from "../DateCalendar";

const DISPLAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDisplay(iso) {
  if (!iso) return "Select a date";
  const [y, m, d] = iso.split("-").map(Number);
  return DISPLAY_FORMATTER.format(new Date(y, m - 1, d));
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DatePickerField({ value, onChange, minDate, label }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label || "Choose date"}
        className="flex items-center gap-2 rounded-lg border border-charcoal-lighter bg-ink px-3 py-2 text-sm text-cream transition-colors hover:border-gold/50 focus:border-gold focus:outline-none"
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
