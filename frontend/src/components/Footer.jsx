import { Link } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from "./icons";
import { SHOP } from "../lib/content";

export default function Footer() {
  return (
    <footer className="border-t border-charcoal-lighter bg-charcoal">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <Link to="/" className="font-display text-3xl text-cream">
              Parsa <span className="text-gold">Barber</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-dim">
              Premium fades, beard sculpting, and hot towel shaves. Sharp cuts, no shortcuts.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href={SHOP.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal-lighter text-cream/80 transition-colors hover:border-gold hover:text-gold"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={SHOP.telegram}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal-lighter text-cream/80 transition-colors hover:border-gold hover:text-gold"
              >
                <TelegramIcon size={18} />
              </a>
              <a
                href={SHOP.whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal-lighter text-cream/80 transition-colors hover:border-gold hover:text-gold"
              >
                <WhatsAppIcon size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="eyebrow mb-5">Hours</h4>
            <ul className="space-y-2 text-sm text-cream-dim">
              {SHOP.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-6">
                  <span>{h.day}</span>
                  <span className={h.time === "Closed" ? "text-cream-dim" : "text-cream/90"}>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-5">Visit</h4>
            <ul className="space-y-4 text-sm text-cream-dim">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
                <span>{SHOP.address}</span>
              </li>
              {SHOP.phones.map((phone) => (
                <li key={phone} className="flex items-center gap-3">
                  <Phone size={16} className="shrink-0 text-gold" />
                  <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="hover:text-gold">
                    {phone}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-gold" />
                <a href={`mailto:${SHOP.email}`} className="hover:text-gold">
                  {SHOP.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border border-charcoal-lighter">
            <iframe
              title="Shop location map"
              src={SHOP.mapEmbedSrc}
              className="h-48 w-full grayscale invert-[0.92] contrast-125 md:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-charcoal-lighter pt-8 text-xs text-cream-dim/70 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Parsa Barber. All rights reserved.</p>
          <p>Crafted for guys who take their fade seriously.</p>
        </div>
      </div>
    </footer>
  );
}
