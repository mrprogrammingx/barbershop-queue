import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";
import Reveal from "../components/Reveal";
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from "../components/icons";
import { SHOP } from "../lib/content";
import { useLanguage } from "../lib/i18n/LanguageContext";

const DAY_KEYS = { Monday: "day.mon", Tuesday: "day.tue", Wednesday: "day.wed", Thursday: "day.thu", Friday: "day.fri", Saturday: "day.sat", Sunday: "day.sun" };

export default function Contact() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader eyebrow={t("contact.eyebrow")} title={t("contact.title")} subtitle={t("contact.subtitle")} />

      <Section>
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-charcoal-lighter bg-charcoal p-8 md:p-10">
              <div className="space-y-7">
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="mt-1 shrink-0 text-gold" />
                  <div>
                    <p className="eyebrow mb-1">{t("contact.address")}</p>
                    <p className="text-cream">{SHOP.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} className="mt-1 shrink-0 text-gold" />
                  <div>
                    <p className="eyebrow mb-1">{t("contact.phone")}</p>
                    <div className="flex flex-col gap-1">
                      {SHOP.phones.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                          className="text-cream hover:text-gold"
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail size={20} className="mt-1 shrink-0 text-gold" />
                  <div>
                    <p className="eyebrow mb-1">{t("contact.email")}</p>
                    <a href={`mailto:${SHOP.email}`} className="text-cream hover:text-gold">
                      {SHOP.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <InstagramIcon size={20} className="mt-1 shrink-0 text-gold" />
                  <div>
                    <p className="eyebrow mb-1">{t("contact.instagram")}</p>
                    <a href={SHOP.instagram} target="_blank" rel="noreferrer" className="text-cream hover:text-gold">
                      {SHOP.instagramHandle}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <TelegramIcon size={20} className="mt-1 shrink-0 text-gold" />
                  <div>
                    <p className="eyebrow mb-1">{t("contact.telegram")}</p>
                    <a href={SHOP.telegram} target="_blank" rel="noreferrer" className="text-cream hover:text-gold">
                      {SHOP.telegramHandle}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <WhatsAppIcon size={20} className="mt-1 shrink-0 text-gold" />
                  <div>
                    <p className="eyebrow mb-1">{t("contact.whatsapp")}</p>
                    <a href={SHOP.whatsapp} target="_blank" rel="noreferrer" className="text-cream hover:text-gold">
                      {SHOP.whatsappHandle}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-charcoal-lighter pt-8">
                <p className="eyebrow mb-4">{t("footer.hours")}</p>
                <ul className="space-y-2 text-sm">
                  {SHOP.hours.map((h) => (
                    <li key={h.day} className="flex justify-between text-cream-dim">
                      <span>{t(DAY_KEYS[h.day])}</span>
                      <span className={h.time === "Closed" ? "" : "text-cream/90"}>
                        {h.time === "Closed" ? t("day.closed") : h.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/booking" className="btn-gold mt-10 w-full">
                {t("services.bookYourChair")}
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
