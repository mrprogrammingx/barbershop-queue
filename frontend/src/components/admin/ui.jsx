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
