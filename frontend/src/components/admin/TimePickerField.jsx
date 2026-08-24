import { Clock } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const selectClass =
  "appearance-none rounded-md border border-charcoal-lighter bg-ink px-2 py-1.5 text-sm text-cream transition-colors hover:border-gold/50 focus:border-gold focus:outline-none";

export default function TimePickerField({ value, onChange, required }) {
  const [hh = "09", mm = "00"] = (value || "").split(":");

  function update(nextHh, nextMm) {
    onChange(`${nextHh}:${nextMm}`);
  }

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-charcoal-lighter bg-charcoal px-2.5 py-1">
      <Clock size={14} className="text-gold" />
      <select
        required={required}
        aria-label="Hour"
        value={hh}
        onChange={(e) => update(e.target.value, mm)}
        className={selectClass}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-cream/40">:</span>
      <select
        required={required}
        aria-label="Minute"
        value={mm}
        onChange={(e) => update(hh, e.target.value)}
        className={selectClass}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
