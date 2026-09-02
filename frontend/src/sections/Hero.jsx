import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { HERO_IMAGE } from "../lib/content";
import { useLanguage } from "../lib/i18n/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  const HEADLINE = [t("hero.word1"), t("hero.word2"), t("hero.word3")];
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative flex h-screen min-h-[720px] items-center overflow-hidden bg-ink">
      <motion.div style={{ y }} className="absolute inset-0 -z-10 scale-110">
        <img src={HERO_IMAGE} alt="Parsa Barber barbershop interior" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink" />
        <div className="absolute inset-0 bg-ink/30" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="eyebrow mb-6"
        >
          {t("hero.eyebrow")}
        </motion.p>

        <h1 className="font-display text-[15vw] leading-[0.85] text-cream sm:text-[10vw] md:text-[7.5vw]">
          {HEADLINE.map((word, i) => (
            <span key={word} className="block overflow-hidden">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
                className={`block ${i === 1 ? "text-outline" : ""}`}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-8 max-w-md text-base text-cream/80 md:text-lg"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center gap-5"
        >
          <Link to="/booking" className="btn-gold">
            {t("nav.bookNow")}
          </Link>
          <Link to="/contact" className="btn-outline">
            {t("nav.contactUs")}
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-cream/60"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={26} />
        </motion.div>
      </motion.div>
    </section>
  );
}
