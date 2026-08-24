// lucide-react dropped brand icons; these small stroke-style replacements
// match the rest of the icon set (24x24, currentColor, rounded strokes).

export function InstagramIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function TelegramIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m22 3-9.5 17-2-7-7-2Z" />
      <path d="M22 3 10.5 13" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 21l1.4-4.2A8.5 8.5 0 1 1 8 19.5Z" />
      <path d="M8.5 9.5c0 3.5 2.5 6 6 6 .8 0 1-.5 1-1v-1.2c0-.3-.2-.5-.5-.6l-1.7-.5c-.2-.1-.5 0-.6.2l-.4.6c-1-.5-1.9-1.4-2.4-2.4l.6-.4c.2-.1.3-.4.2-.6l-.5-1.7c-.1-.3-.3-.5-.6-.5H8.5c-.5 0-1 .2-1 1Z" />
    </svg>
  );
}
