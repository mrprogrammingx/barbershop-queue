import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from "./icons";
import { SHOP } from "../lib/content";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/contact", label: "Contact" },
];

const ADMIN_LOGIN_URL = "/admin/login";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          paddingTop: scrolled ? "0.75rem" : "1.5rem",
          paddingBottom: scrolled ? "0.75rem" : "1.5rem",
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`fixed inset-x-0 top-0 z-50 px-6 transition-colors duration-300 md:px-10 ${
          scrolled ? "bg-ink/90 backdrop-blur-md shadow-[0_4px_30px_-10px_rgba(0,0,0,0.8)]" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="font-display text-2xl tracking-wide text-cream" onClick={() => setOpen(false)}>
            Parsa <span className="text-gold">Barber</span>
          </Link>

          <ul className="hidden items-center gap-9 md:flex">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `relative font-body text-sm font-medium uppercase tracking-wider transition-colors ${
                      isActive ? "text-gold" : "text-cream/80 hover:text-gold"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-5 md:flex">
            <a
              href={SHOP.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Parsa Barber on Instagram"
              className="text-cream/80 transition-colors hover:text-gold"
            >
              <InstagramIcon size={20} />
            </a>
            <a
              href={SHOP.telegram}
              target="_blank"
              rel="noreferrer"
              aria-label="Parsa Barber on Telegram"
              className="text-cream/80 transition-colors hover:text-gold"
            >
              <TelegramIcon size={20} />
            </a>
            <a
              href={SHOP.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="Parsa Barber on WhatsApp"
              className="text-cream/80 transition-colors hover:text-gold"
            >
              <WhatsAppIcon size={20} />
            </a>
            <a
              href={ADMIN_LOGIN_URL}
              className="font-body text-sm font-medium uppercase tracking-wider text-cream/60 transition-colors hover:text-gold"
            >
              Staff Login
            </a>
            <Link to="/booking" className="btn-gold !py-2.5 !px-6 text-xs">
              Book Now
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="text-cream md:hidden"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-8 pb-10 pt-28 md:hidden"
          >
            <ul className="flex flex-col gap-6">
              {LINKS.map((link, i) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i + 0.1 }}
                >
                  <NavLink
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `font-display text-4xl ${isActive ? "text-gold" : "text-cream"}`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col gap-6">
              {SHOP.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-3 text-cream/80"
                >
                  <Phone size={18} className="text-gold" /> {phone}
                </a>
              ))}
              <a
                href={SHOP.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-cream/80"
              >
                <InstagramIcon size={18} className="text-gold" /> {SHOP.instagramHandle}
              </a>
              <a
                href={SHOP.telegram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-cream/80"
              >
                <TelegramIcon size={18} className="text-gold" /> {SHOP.telegramHandle}
              </a>
              <a
                href={SHOP.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-cream/80"
              >
                <WhatsAppIcon size={18} className="text-gold" /> {SHOP.whatsappHandle}
              </a>
              <Link to="/booking" onClick={() => setOpen(false)} className="btn-gold w-full">
                Book Now
              </Link>
              <a href={ADMIN_LOGIN_URL} className="text-sm uppercase tracking-wider text-cream/50">
                Staff Login
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
