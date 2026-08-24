import { useEffect, useRef, useState } from "react";
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
  return new Date().toISOString().slice(0, 10);
}

export default function DatePickerField({ value, onChange, minDate, label }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label || "Choose date"}
        className="flex items-center gap-2 rounded-lg border border-charcoal-lighter bg-ink px-3 py-2 text-sm text-cream transition-colors hover:border-gold/50 focus:border-gold focus:outline-none"
      >
        <Calendar size={16} className="text-gold" />
        {formatDisplay(value)}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 shadow-2xl">
          <DateCalendar
            value={value || todayIso()}
            minDate={minDate}
            onChange={(iso) => {
              onChange(iso);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
