import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const contactBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#EFEFEF] bg-transparent px-5 text-sm font-medium text-[#EFEFEF] shadow-none transition-[background-color,border-color,color,box-shadow] duration-300 ease-out hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)]";

const HEADLINES = [
  {
    text: "بیایید چیزی ماندگار خلق کنیم.",
    lang: "fa",
    dir: "rtl",
    className:
      "font-farsi text-[clamp(1.85rem,3.4vw,3.75rem)] font-medium leading-[1.25]",
  },
  {
    text: "Let's build something meaningful.",
    lang: "en",
    dir: "ltr",
    className:
      "font-display text-[clamp(1.6rem,2.9vw,3.15rem)] font-medium leading-[1.15]",
  },
] as const;

const TYPE_DURATION_MS = 1600;
const DELETE_DURATION_MS = 1100;
const HOLD_MS = 2000;

/** Smooth ease-in-out — slow start, faster middle, soft finish */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function TypewriterHeadline() {
  const [index, setIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");
  const [reduceMotion, setReduceMotion] = useState(false);
  const phaseRef = useRef(phase);
  const indexRef = useRef(index);

  const current = HEADLINES[index];
  const chars = Array.from(current.text);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    let raf = 0;
    let holdTimer = 0;
    let start = performance.now();
    let startCount = 0;

    const tick = (now: number) => {
      const p = phaseRef.current;
      const line = HEADLINES[indexRef.current];
      const total = Array.from(line.text).length;

      if (p === "holding") return;

      if (p === "typing") {
        const t = Math.min(1, (now - start) / TYPE_DURATION_MS);
        const next = Math.round(easeInOutCubic(t) * total);
        setCharCount(next);
        if (t >= 1) {
          setPhase("holding");
          return;
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      // deleting
      const t = Math.min(1, (now - start) / DELETE_DURATION_MS);
      const next = Math.round(startCount * (1 - easeInOutCubic(t)));
      setCharCount(next);
      if (t >= 1) {
        setCharCount(0);
        setIndex((i) => (i + 1) % HEADLINES.length);
        setPhase("typing");
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    if (phase === "holding") {
      holdTimer = window.setTimeout(() => setPhase("deleting"), HOLD_MS);
      return () => window.clearTimeout(holdTimer);
    }

    start = performance.now();
    startCount = Array.from(HEADLINES[indexRef.current].text).length;
    if (phase === "typing") setCharCount(0);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(holdTimer);
    };
  }, [phase, index, reduceMotion]);

  if (reduceMotion) {
    return (
      <h1 className="relative mx-auto flex min-h-[clamp(2.4rem,5vw,4.5rem)] w-full items-center justify-center text-center text-foreground">
        <span
          lang={HEADLINES[0].lang}
          dir={HEADLINES[0].dir}
          className={HEADLINES[0].className}
        >
          {HEADLINES[0].text}
        </span>
        <span className="mx-3 text-secondary" aria-hidden>
          /
        </span>
        <span
          lang={HEADLINES[1].lang}
          dir={HEADLINES[1].dir}
          className={HEADLINES[1].className}
        >
          {HEADLINES[1].text}
        </span>
      </h1>
    );
  }

  const visible = chars.slice(0, charCount).join("");

  return (
    <h1 className="relative mx-auto flex min-h-[clamp(2.4rem,5vw,4.5rem)] w-full items-center justify-center text-foreground">
      <span
        aria-hidden
        className={`invisible whitespace-nowrap ${HEADLINES[0].className}`}
      >
        {HEADLINES[0].text}
      </span>
      <span
        lang={current.lang}
        dir={current.dir}
        className={`absolute inset-0 flex items-center justify-center whitespace-nowrap ${current.className}`}
        aria-live="polite"
      >
        {visible}
        <span
          aria-hidden
          className="contact-caret ms-0.5 inline-block h-[0.85em] w-[0.08em] animate-[contact-caret_1.1s_ease-in-out_infinite] bg-secondary align-[-0.08em]"
        />
      </span>
    </h1>
  );
}

function BehanceIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M16.969 16.927a2.561 2.561 0 0 0 1.901.677 2.501 2.501 0 0 0 1.531-.475c.362-.235.636-.584.779-.99h2.585a5.091 5.091 0 0 1-1.9 2.896 5.292 5.292 0 0 1-3.091.88 5.839 5.839 0 0 1-2.284-.433 4.871 4.871 0 0 1-1.723-1.211 5.657 5.657 0 0 1-1.08-1.874 7.057 7.057 0 0 1-.383-2.393c-.005-.8.129-1.595.396-2.349a5.313 5.313 0 0 1 5.088-3.604 4.87 4.87 0 0 1 2.376.563c.661.362 1.231.87 1.668 1.485a6.2 6.2 0 0 1 .943 2.133c.194.821.263 1.666.205 2.508h-7.699c-.063.79.184 1.574.688 2.187ZM6.947 4.084a8.065 8.065 0 0 1 1.928.198 4.29 4.29 0 0 1 1.49.638c.418.303.748.711.958 1.182.241.579.357 1.203.341 1.83a3.506 3.506 0 0 1-.506 1.961 3.726 3.726 0 0 1-1.503 1.287 3.588 3.588 0 0 1 2.027 1.437c.464.747.697 1.615.67 2.494a4.593 4.593 0 0 1-.423 2.032 3.945 3.945 0 0 1-1.163 1.413 5.114 5.114 0 0 1-1.683.807 7.135 7.135 0 0 1-1.928.259H0V4.084h6.947Zm-.235 12.9c.308.004.616-.029.916-.099a2.18 2.18 0 0 0 .766-.332c.228-.158.411-.371.534-.619.142-.317.208-.663.191-1.009a2.08 2.08 0 0 0-.642-1.715 2.618 2.618 0 0 0-1.696-.505h-3.54v4.279h3.471Zm13.635-5.967a2.13 2.13 0 0 0-1.654-.619 2.336 2.336 0 0 0-1.163.259 2.474 2.474 0 0 0-.738.62 2.359 2.359 0 0 0-.396.792c-.074.239-.12.485-.137.734h4.769a3.239 3.239 0 0 0-.679-1.785l-.002-.001Zm-13.813-.648a2.254 2.254 0 0 0 1.423-.433c.399-.355.607-.88.56-1.413a1.916 1.916 0 0 0-.178-.891 1.298 1.298 0 0 0-.495-.533 1.851 1.851 0 0 0-.711-.274 3.966 3.966 0 0 0-.835-.073H3.241v3.631h3.293v-.014ZM21.62 5.122h-5.976v1.527h5.976V5.122Z" />
    </svg>
  );
}

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Siavash Akbari" },
      {
        name: "description",
        content:
          "Get in touch with Siavash Akbari for photography, graphic design, and product design commissions.",
      },
      { property: "og:title", content: "Contact — Siavash Akbari" },
      {
        property: "og:description",
        content:
          "Get in touch with Siavash Akbari for photography, graphic design, and product design commissions.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] w-full items-center justify-center px-6 py-12 md:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-[96rem] flex-col">
        {/* Eyebrow — centered */}
        <p className="flex items-center justify-center gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.25em] text-secondary md:text-[0.975rem]">
          <span>Contact</span>
          <span aria-hidden className="text-[1.1rem] leading-none">
            ·
          </span>
          <span
            lang="fa"
            dir="rtl"
            className="font-farsi text-[1.015625rem] font-semibold normal-case tracking-normal md:text-[1.21875rem]"
          >
            ارتباط با من
          </span>
        </p>

        {/* Typewriter headline loop */}
        <div className="mt-10 md:mt-14">
          <TypewriterHeadline />
        </div>

        {/* Body copy — bilingual columns */}
        <div className="mt-10 flex flex-col gap-12 md:mt-12 md:flex-row md:items-start md:justify-between md:gap-16 lg:gap-24">
          <div className="w-full md:w-[min(100%,42%)]" lang="en" dir="ltr">
            <p className="max-w-xl text-left text-base leading-relaxed text-secondary md:text-[1.15rem]">
              Whether you&apos;re looking to create a brand, craft a digital experience, or
              collaborate on something ambitious, I&apos;d love to hear about your project. Send me
              the details, and I&apos;ll get back to you within two business days.
            </p>
          </div>

          <div className="w-full md:w-[min(100%,42%)]" lang="fa" dir="rtl">
            <p className="ml-auto max-w-xl text-right font-farsi text-base leading-relaxed text-secondary md:text-[1.15rem]">
              اگر برای ساخت یک برند، طراحی یک تجربه‌ی دیجیتال یا همکاری روی یک ایده‌ی ارزشمند به دنبال
              همراه هستید، خوشحال می‌شوم درباره‌ی پروژه‌تان بشنوم. جزئیات را برایم ارسال کنید؛ حداکثر تا
              دو روز کاری پاسخ خواهم داد.
            </p>
          </div>
        </div>

        {/* Buttons — centered row */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3 md:mt-16 md:gap-4">
          <a href="mailto:Siavakbari@gmail.com" className={contactBtnClass}>
            <Mail className="h-4 w-4" />
            Siavakbari@gmail.com
          </a>

          <a href="tel:+989386087846" className={contactBtnClass}>
            <Phone className="h-4 w-4" />
            +989386087846
          </a>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Esfahan%2C%20Iran"
            target="_blank"
            rel="noreferrer"
            className={contactBtnClass}
          >
            <MapPin className="h-4 w-4" />
            Esfahan, Iran
          </a>

          <a
            href="https://www.behance.net/siavashakbari"
            target="_blank"
            rel="noreferrer"
            className={contactBtnClass}
          >
            <BehanceIcon className="h-4 w-4" />
            Behance
          </a>

          <a
            href="https://www.instagram.com/siavashakbari"
            target="_blank"
            rel="noreferrer"
            className={contactBtnClass}
          >
            <Instagram className="h-4 w-4" />
            Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
