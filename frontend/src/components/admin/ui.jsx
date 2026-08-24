export function Card({ title, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-charcoal-lighter bg-charcoal p-6 ${className}`}>
      {title && <h2 className="mb-4 font-display text-lg tracking-wide text-gold">{title}</h2>}
      {children}
    </section>
  );
}

export const inputClass =
  "rounded-lg border border-charcoal-lighter bg-ink px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-2 text-xs font-semibold uppercase tracking-widest text-ink transition-all hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-40";

export const buttonOutlineClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-gold/50 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-cream transition-all hover:border-gold hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40";

export function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? "bg-gold shadow-[0_0_16px_-2px_rgba(201,151,74,0.7)]" : "bg-charcoal-lighter"
      }`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-cream shadow-md transition-transform duration-300 ease-out ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const STATUS_STYLES = {
  waiting: "text-gold",
  called: "text-blue-400",
  in_progress: "text-blue-400",
  done: "text-emerald-400",
  no_show: "text-red-400",
};

export function StatusPill({ status }) {
  return (
    <span className={`text-sm font-medium capitalize ${STATUS_STYLES[status] || "text-cream"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export function EntryCard({ title, subtitle, headerActions, children, footer }) {
  return (
    <div className="overflow-hidden rounded-xl border border-charcoal-lighter bg-charcoal">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <div className="font-semibold text-cream">{title}</div>
          {subtitle && <div className="text-xs text-cream/50">{subtitle}</div>}
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </div>
      <div className="border-t border-charcoal-lighter">{children}</div>
      {footer}
    </div>
  );
}

export function EntryRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-charcoal-lighter px-4 py-2.5 last:border-b-0">
      <span className="text-sm text-cream/50">{label}</span>
      <span className="min-w-0 flex-1 text-right text-sm text-cream">{children}</span>
    </div>
  );
}

export function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} className="border-b border-charcoal-lighter px-3 py-2 text-left text-cream/60">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
