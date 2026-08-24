import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

function toISODate(d) {
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function DateCalendar({ value, onChange, minDate }) {
  const selected = parseISO(value);
  const min = minDate ? parseISO(minDate) : startOfDay(new Date());
  const [viewDate, setViewDate] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));

  const today = startOfDay(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const canGoPrev = new Date(year, month, 0) >= startOfDay(min);

  return (
    <div className="rounded-lg border border-charcoal-lighter bg-ink p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canGoPrev && setViewDate(new Date(year, month - 1, 1))}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="rounded-md p-1 text-cream/70 transition-colors hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold uppercase tracking-wider text-cream">
          {MONTH_FORMATTER.format(viewDate)}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="rounded-md p-1 text-cream/70 transition-colors hover:text-gold"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i} className="text-[10px] font-semibold uppercase tracking-wider text-cream-dim">
            {label}
          </span>
        ))}

        {cells.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} />;

          const isPast = day < startOfDay(min);
          const isSelected = sameDay(day, selected);
          const isToday = sameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => onChange(toISODate(day))}
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                isSelected
                  ? "bg-gold font-semibold text-ink"
                  : isPast
                  ? "cursor-not-allowed text-cream-dim/30"
                  : isToday
                  ? "border border-gold/50 text-gold hover:bg-gold/10"
                  : "text-cream/90 hover:bg-charcoal-lighter"
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
