import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  Download,
  Loader2,
  Sparkles,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { pageHead } from "@/lib/seo";

// Visual identity placeholders
import shekarchianLogo from "@/assets/graphic-design/shekarchian/graphic-design-shekarchian-01.jpg";
import dodarehLogo from "@/assets/graphic-design/dodareh/graphic-design-dodareh-02.jpg";
import polarityLogo from "@/assets/graphic-design/polarity/graphic-design-polarity-01.jpg";
import echoSupplementsLogo from "@/assets/graphic-design/echo-supplements/graphic-design-echo-supplements-01.jpg";
import femiqLogo from "@/assets/graphic-design/femiq/graphic-design-femiq-08.jpg";
import ahuraLogo from "@/assets/graphic-design/ahura-cctv/graphic-design-ahura-cctv-03.jpg";
import goatsLogo from "@/assets/graphic-design/goats/graphic-design-goats-01.jpg";
import nozadLogo from "@/assets/graphic-design/nozad-publication/graphic-design-nozad-publication-01.jpg";
import zenLogo from "@/assets/graphic-design/zen/graphic-design-zen-01.jpg";
import artemisLogo from "@/assets/graphic-design/artemis/graphic-design-artemis-01.jpg";

export const Route = createFileRoute("/brand-discovery")({
  head: () =>
    pageHead({
      title: "Visual Identity Form — Siavash Akbari",
      description:
        "Comprehensive visual identity questionnaire and bilingual logo discovery form by Siavash Akbari.",
      path: "/brand-discovery",
    }),
  component: BrandDiscoveryPage,
});

type Lang = "en" | "fa";

interface LogoOption {
  image: string;
}

interface QuestionPair {
  questionNumber: number;
  optionA: LogoOption;
  optionB: LogoOption;
}

const QUESTIONS: QuestionPair[] = [
  {
    questionNumber: 1,
    optionA: { image: polarityLogo },
    optionB: { image: shekarchianLogo },
  },
  {
    questionNumber: 2,
    optionA: { image: femiqLogo },
    optionB: { image: nozadLogo },
  },
  {
    questionNumber: 3,
    optionA: { image: dodarehLogo },
    optionB: { image: ahuraLogo },
  },
  {
    questionNumber: 4,
    optionA: { image: zenLogo },
    optionB: { image: echoSupplementsLogo },
  },
  {
    questionNumber: 5,
    optionA: { image: goatsLogo },
    optionB: { image: artemisLogo },
  },
];

// Helper to convert images to low-quality downscaled base64
async function getLowQualityBase64(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 320;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.65));
      } else {
        resolve("");
      }
    };
    img.onerror = () => resolve("");
    img.src = imageSrc;
  });
}

// Button styles matching the portfolio design system
const actionBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#EFEFEF] bg-transparent px-6 text-sm font-medium text-[#EFEFEF] shadow-none transition-[background-color,border-color,color,box-shadow] duration-300 ease-out hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer";

const activeActionBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-transparent bg-secondary px-6 text-sm font-medium text-secondary-foreground shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)] transition-all duration-300 cursor-pointer";

function LanguageSwitch({
  lang,
  onToggle,
  reduceMotion,
}: {
  lang: Lang;
  onToggle: () => void;
  reduceMotion: boolean;
}) {
  const isFa = lang === "fa";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isFa}
      aria-label="Switch Language / تغییر زبان"
      onClick={onToggle}
      dir="ltr"
      className="group relative inline-flex h-11 w-[7.25rem] shrink-0 items-center rounded-full border border-secondary bg-transparent p-1 shadow-none transition-[border-color,box-shadow] duration-300 ease-out hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_55%,transparent),0_0_18px_color-mix(in_oklab,var(--secondary)_30%,transparent),0_0_28px_color-mix(in_oklab,var(--secondary)_16%,transparent)] cursor-pointer"
    >
      <motion.span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#EFEFEF] transition-[box-shadow] duration-300 ease-out group-hover:shadow-[0_0_8px_color-mix(in_oklab,#EFEFEF_70%,transparent),0_0_18px_color-mix(in_oklab,#EFEFEF_35%,transparent)]"
        initial={false}
        animate={{ x: isFa ? "100%" : "0%" }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 380, damping: 28 }
        }
      />
      <span
        className={`relative z-[1] flex w-1/2 items-center justify-center text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${
          !isFa ? "text-[#0F0F0F]" : "text-secondary/80"
        }`}
      >
        EN
      </span>
      <span
        className={`relative z-[1] flex w-1/2 items-center justify-center font-farsi text-sm font-medium transition-colors duration-300 ${
          isFa ? "text-[#0F0F0F]" : "text-secondary/80"
        }`}
      >
        فا
      </span>
    </button>
  );
}

export function BrandDiscoveryPage() {
  const reduceMotion = useReducedMotion();
  const [lang, setLang] = useState<Lang>("fa");
  const isFa = lang === "fa";

  // Section 1 to 5 Form Data
  const [formData, setFormData] = useState({
    // Section 1
    brandNameFa: "",
    brandNameEn: "",
    primaryLanguage: "fa", // "fa" | "en" | "both"
    slogan: "",
    activity: "",
    nameHistory: "",
    // Section 2
    targetAudience: "",
    competitors: "",
    // Section 3
    brandAttributes: "",
    favoriteForms: "",
    // Section 4
    layoutPreference: "",
    mainApplications: "",
    scalability: "",
    // Section 5
    forbiddenElements: "",
  });

  // Flow steps: "form" -> "moodboard" -> "summary"
  const [step, setStep] = useState<"form" | "moodboard" | "summary">("form");
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [selections, setSelections] = useState<
    {
      questionNumber: number;
      choice: "A" | "B";
      imageSrc: string;
    }[]
  >([]);

  // Submission state
  const [isSubmittingToTelegram, setIsSubmittingToTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<"pending" | "sent" | "failed">("pending");
  const submittedRef = useRef(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandNameFa.trim() && !formData.brandNameEn.trim()) return;
    setStep("moodboard");
    setCurrentPairIndex(0);
    setSelections([]);
    submittedRef.current = false;
    setTelegramStatus("pending");
  };

  const handleSelectChoice = (choice: "A" | "B") => {
    const q = QUESTIONS[currentPairIndex];
    const chosenImage = choice === "A" ? q.optionA.image : q.optionB.image;

    const updated = [...selections];
    updated[currentPairIndex] = {
      questionNumber: q.questionNumber,
      choice,
      imageSrc: chosenImage,
    };
    setSelections(updated);

    if (currentPairIndex < QUESTIONS.length - 1) {
      setCurrentPairIndex((prev) => prev + 1);
    } else {
      setStep("summary");
    }
  };

  const handlePrevMoodboard = () => {
    if (currentPairIndex > 0) {
      setCurrentPairIndex((prev) => prev - 1);
    } else {
      setStep("form");
    }
  };

  const handleReset = () => {
    setStep("form");
    setCurrentPairIndex(0);
    setSelections([]);
    submittedRef.current = false;
    setTelegramStatus("pending");
  };

  // Generate pure Q&A PDF report with Preferred Aesthetics
  const generatePdf = async (): Promise<{ doc: jsPDF; base64: string }> => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor = [15, 15, 15]; // #0F0F0F
    const accentColor = [63, 235, 204]; // #3FEBCC

    // Header bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 36, "F");

    doc.setTextColor(239, 239, 239);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("VISUAL IDENTITY BRIEF & QUESTIONNAIRE", 20, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("STUDIO SIAVASH AKBARI — CREATIVE SHOWCASE", 20, 28);

    let currentY = 48;

    const addSectionTitle = (title: string) => {
      doc.setFillColor(242, 242, 242);
      doc.rect(20, currentY - 4, 170, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 15, 15);
      doc.text(title, 22, currentY + 1);
      currentY += 9;
    };

    const addField = (label: string, value: string) => {
      if (!value) return;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text(`${label}:`, 22, currentY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(value, 120);
      doc.text(lines, 70, currentY);
      currentY += Math.max(lines.length * 4.5, 6);
    };

    // Section 1
    addSectionTitle("SECTION 1: BRAND IDENTITY & BASIC INFORMATION");
    addField("Brand Name (Persian)", formData.brandNameFa);
    addField("Brand Name (English)", formData.brandNameEn);
    addField("Language Priority", formData.primaryLanguage);
    addField("Slogan / Tagline", formData.slogan);
    addField("Field of Activity", formData.activity);
    addField("Name History / Story", formData.nameHistory);
    currentY += 2;

    // Section 2
    addSectionTitle("SECTION 2: TARGET AUDIENCE & MARKET");
    addField("Target Audience", formData.targetAudience);
    addField("Main Competitors", formData.competitors);
    currentY += 2;

    // Section 3
    addSectionTitle("SECTION 3: VISUAL STYLE & BRAND PERSONALITY");
    addField("Brand Attributes", formData.brandAttributes);
    addField("Preferred Forms / Shapes", formData.favoriteForms);
    currentY += 2;

    // Section 4
    addSectionTitle("SECTION 4: TECHNICAL REQUIREMENTS & APPLICATIONS");
    addField("Bilingual Layout", formData.layoutPreference);
    addField("Main Applications", formData.mainApplications);
    addField("Scalability", formData.scalability);
    currentY += 2;

    // Section 5
    addSectionTitle("SECTION 5: SPECIAL PREFERENCES & FORBIDDEN ELEMENTS");
    addField("Forbidden Elements", formData.forbiddenElements);
    currentY += 4;

    // Preferred Aesthetics (Moodboard Choices)
    addSectionTitle("PREFERRED AESTHETICS (MOODBOARD CHOICES)");
    currentY += 2;

    const imgWidth = 28;
    const imgHeight = 28;
    const gap = 6;
    let xOffset = 22;

    for (let i = 0; i < selections.length; i++) {
      const s = selections[i];
      try {
        const base64Data = await getLowQualityBase64(s.imageSrc);
        if (base64Data) {
          doc.addImage(base64Data, "JPEG", xOffset, currentY, imgWidth, imgHeight);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(50, 50, 50);
          doc.text(`Pair ${s.questionNumber}: Option ${s.choice}`, xOffset + 1, currentY + imgHeight + 4);
        }
      } catch (e) {
        console.error(e);
      }
      xOffset += imgWidth + gap;
    }

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "Visual Identity Brief — Siavash Akbari Design Studio (https://www.siavashakbari.ir)",
      20,
      285
    );

    const pdfOutput = doc.output("arraybuffer");
    let binary = "";
    const bytes = new Uint8Array(pdfOutput);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return { doc, base64 };
  };

  // Automatic submission to Telegram on completing moodboard
  useEffect(() => {
    if (step !== "summary" || submittedRef.current) return;
    submittedRef.current = true;

    async function submitAutomatically() {
      setIsSubmittingToTelegram(true);
      try {
        // 1. Prepare low-quality base64 for each chosen logo
        const chosenImages: { questionNumber: number; choice: string; base64: string }[] = [];
        for (const s of selections) {
          const b64 = await getLowQualityBase64(s.imageSrc);
          chosenImages.push({
            questionNumber: s.questionNumber,
            choice: s.choice,
            base64: b64,
          });
        }

        // 2. Generate PDF with pure Q&A and Preferred Aesthetics
        const { base64: pdfBase64 } = await generatePdf();

        // 3. Dispatch to API route
        const res = await fetch("/api/brand-discovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formData,
            selections,
            pdfBase64,
            chosenImages,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setTelegramStatus("sent");
        } else {
          setTelegramStatus("failed");
        }
      } catch (err) {
        console.error("Auto submit failed:", err);
        setTelegramStatus("failed");
      } finally {
        setIsSubmittingToTelegram(false);
      }
    }

    submitAutomatically();
  }, [step]);

  const handleDownloadPdf = async () => {
    const { doc } = await generatePdf();
    const cleanName = (formData.brandNameEn || formData.brandNameFa || "brand")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    doc.save(`${cleanName}-visual-identity-brief.pdf`);
  };

  return (
    <div
      className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-4xl flex-col justify-center px-4 py-12 md:px-8"
      lang={lang}
      dir={isFa ? "rtl" : "ltr"}
    >
      {/* Top Header with Language Switch */}
      <div className="mb-8 flex items-center justify-between border-b border-foreground/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10 text-secondary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
              {isFa ? "فرم جامع هویت بصری و طراحی لوگو" : "Visual Identity & Logo Brief"}
            </h1>
            <p className="text-xs text-secondary">
              {isFa ? "استودیو طراحی سیاوش اکبری" : "Siavash Akbari Design Studio"}
            </p>
          </div>
        </div>

        <LanguageSwitch
          lang={lang}
          onToggle={() => setLang(isFa ? "en" : "fa")}
          reduceMotion={!!reduceMotion}
        />
      </div>

      {/* STEP 1: DETAILED 5-SECTION QUESTIONNAIRE */}
      {step === "form" && (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="flex w-full flex-col"
        >
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
            {isFa
              ? "لطفاً این پرسشنامه را با دقت تکمیل کنید. پاسخ‌های شما جهت‌گیری دقیق استراتژیک، سبک بصری و ساختار طراحی نشان برند شما را مشخص می‌کند."
              : "Please fill out this questionnaire carefully. Your answers establish the strategic direction, visual language, and structural identity of your brand."}
          </p>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-10">
            {/* SECTION 1 */}
            <div className="rounded-2xl border border-foreground/15 bg-background p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-secondary">
                <span>{isFa ? "بخش اول: اطلاعات پایه و هویت برند" : "Section 1: Basic Information & Brand Identity"}</span>
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "نام برند به زبان فارسی (املای دقیق و رسمی) *" : "Brand Name in Persian (Exact spelling) *"}
                  </label>
                  <input
                    type="text"
                    name="brandNameFa"
                    required={!formData.brandNameEn}
                    value={formData.brandNameFa}
                    onChange={handleInputChange}
                    placeholder={isFa ? "مثال: شکاریان، پژواک..." : "e.g. Shekarchian"}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "نام برند به زبان انگلیسی (املای رسمی برای بخش دوزبانه) *" : "Brand Name in English (Exact official spelling) *"}
                  </label>
                  <input
                    type="text"
                    name="brandNameEn"
                    required={!formData.brandNameFa}
                    value={formData.brandNameEn}
                    onChange={handleInputChange}
                    placeholder="e.g. Shekarchian, Echo..."
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "اولویت با کدام زبان است؟" : "Primary Language Priority"}
                  </label>
                  <select
                    name="primaryLanguage"
                    value={formData.primaryLanguage}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  >
                    <option value="فارسی (Persian)">{isFa ? "فارسی (Persian)" : "Persian"}</option>
                    <option value="انگلیسی (English)">{isFa ? "انگلیسی (English)" : "English"}</option>
                    <option value="ارزش برابر هر دو زبان (Equal)">{isFa ? "ارزش برابر هر دو زبان (Equal Weight)" : "Equal Priority"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "شعار برند (Slogan / Tagline)" : "Brand Slogan / Tagline"}
                  </label>
                  <input
                    type="text"
                    name="slogan"
                    value={formData.slogan}
                    onChange={handleInputChange}
                    placeholder={isFa ? "آیا شعاری برای قرارگیری کنار لوگو دارید؟" : "Tagline to accompany the logo (both languages)"}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "حوزه فعالیت و معرفی کوتاه" : "Field of Activity & Brief Description"}
                  </label>
                  <textarea
                    rows={2}
                    name="activity"
                    value={formData.activity}
                    onChange={handleInputChange}
                    placeholder={isFa ? "کسب‌وکار شما دقیقاً چه کالا یا خدماتی ارائه می‌دهد؟" : "What exact products or services does your business offer?"}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "تاریخچه‌ی نام برند" : "Name History & Story"}
                  </label>
                  <textarea
                    rows={2}
                    name="nameHistory"
                    value={formData.nameHistory}
                    onChange={handleInputChange}
                    placeholder={isFa ? "چه داستانی یا مفهومی پشت این نام نهفته است؟" : "What is the story or concept behind the brand name?"}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2 */}
            <div className="rounded-2xl border border-foreground/15 bg-background p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-secondary">
                <span>{isFa ? "بخش دوم: مخاطبان هدف و بازار" : "Section 2: Target Audience & Market"}</span>
              </h2>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "مخاطبان اصلی چه کسانی هستند؟" : "Who are your primary target audiences?"}
                  </label>
                  <textarea
                    rows={2}
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder={isFa ? "سن، جنسیت، سطح درآمد، موقعیت جغرافیایی و سبک زندگی آنها" : "Age, gender, income level, geographic location, lifestyle..."}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "بررسی رقبا" : "Competitor Analysis"}
                  </label>
                  <textarea
                    rows={2}
                    name="competitors"
                    value={formData.competitors}
                    onChange={handleInputChange}
                    placeholder={isFa ? "۳ رقیب اصلی شما چه کسانی هستند و به نظر شما نقطه قوت و ضعف لوگوی آنها چیست؟" : "Name 3 main competitors and what you consider strengths/weaknesses of their logos"}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3 */}
            <div className="rounded-2xl border border-foreground/15 bg-background p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-secondary">
                <span>{isFa ? "بخش سوم: سبک بصری و شخصیت برند" : "Section 3: Visual Style & Brand Personality"}</span>
              </h2>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "صفات برند" : "Brand Attributes"}
                  </label>
                  <input
                    type="text"
                    name="brandAttributes"
                    value={formData.brandAttributes}
                    onChange={handleInputChange}
                    placeholder={isFa ? "مثلاً: جدی، صمیمی، لوکس، پرانرژی، قابل اعتماد، مینیمال، مدرن یا سنتی" : "e.g. Serious, warm, luxury, energetic, trustworthy, minimal, modern, heritage"}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "فرم‌های مورد علاقه برای نشان" : "Preferred Shapes & Forms for the Mark"}
                  </label>
                  <textarea
                    rows={2}
                    name="favoriteForms"
                    value={formData.favoriteForms}
                    onChange={handleInputChange}
                    placeholder={isFa ? "لطفاً با دقت مثال بزنید (چه دقیق مثل درخت، پرنده، انسان، ساختمان یا کلی مثل دایره، پنج‌ضلعی، لوزی...)" : "Specific motifs (tree, bird, building, human figure...) or abstract geometry (circle, pentagon, diamond...)"}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4 */}
            <div className="rounded-2xl border border-foreground/15 bg-background p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-secondary">
                <span>{isFa ? "بخش چهارم: کاربردها و الزامات فنی (مخصوص لوگوی دوزبانه)" : "Section 4: Technical Requirements & Applications (Bilingual)"}</span>
              </h2>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "نحوه چیدمان دوزبان" : "Bilingual Layout Preference"}
                  </label>
                  <input
                    type="text"
                    name="layoutPreference"
                    value={formData.layoutPreference}
                    onChange={handleInputChange}
                    placeholder={isFa ? "مثلاً: متن فارسی در بالا/راست و انگلیسی در پایین/چپ، یا استفاده از نسخه‌های مجزا" : "e.g. Persian on top/right, English below/left, or dedicated standalone versions"}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "کاربردهای اصلی لوگو" : "Primary Applications"}
                  </label>
                  <input
                    type="text"
                    name="mainApplications"
                    value={formData.mainApplications}
                    onChange={handleInputChange}
                    placeholder={isFa ? "شبکه‌های اجتماعی، وبسایت، تابلو سردر، بسته‌بندی محصول، کارت ویزیت و اوراق اداری..." : "Social media, website, physical signage, packaging, stationery, apparel..."}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                    {isFa ? "مقیاس‌پذیری" : "Scalability & Micro-sizes"}
                  </label>
                  <input
                    type="text"
                    name="scalability"
                    value={formData.scalability}
                    onChange={handleInputChange}
                    placeholder={isFa ? "آیا لوگو قرار است روی المان‌های بسیار کوچک (آیکون اپ یا خودکار) یا ابعاد بزرگ چاپ شود؟" : "Will it be used in micro sizes (app icon, pen engraving) or huge formats (facades, billboards)?"}
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5 */}
            <div className="rounded-2xl border border-foreground/15 bg-background p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-secondary">
                <span>{isFa ? "بخش پنجم: خط قرمزها و سلایق خاص" : "Section 5: Forbidden Elements & Boundaries"}</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2">
                  {isFa ? "المان‌های ممنوعه" : "Forbidden Elements"}
                </label>
                <textarea
                  rows={2}
                  name="forbiddenElements"
                  value={formData.forbiddenElements}
                  onChange={handleInputChange}
                  placeholder={isFa ? "چه طرح، نماد، رنگ یا ایده‌ای است که به هیچ عنوان نباید در لوگوی شما استفاده شود؟" : "What symbols, ideas, concepts or colors must NOT appear in your logo under any circumstances?"}
                  className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            {/* Next Step Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!formData.brandNameFa.trim() && !formData.brandNameEn.trim()}
                className={activeActionBtnClass}
              >
                <span>{isFa ? "ادامه به بخش نمونه‌های الهام‌بخش (Moodboard)" : "Continue to Moodboard Selection"}</span>
                {isFa ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* STEP 2: MOODBOARD 2-LOGO SELECTIONS */}
      {step === "moodboard" && (
        <motion.div
          key="moodboard"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="flex w-full flex-col"
        >
          {/* Section banner */}
          <div className="mb-6 rounded-2xl border border-secondary/30 bg-secondary/5 p-4 text-center">
            <h3 className="font-display text-base font-semibold text-secondary">
              {isFa ? "نمونه‌های الهام‌بخش (Moodboard)" : "Inspirational Pairs (Moodboard)"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {isFa
                ? "در ادامه چند جفت لوگو قرار داده شده است. لطفاً در هر جفت، گزینه‌ای را که احساس می‌کنید به هویت مد نظرتان نزدیک‌تر است انتخاب کنید."
                : "Between each pair, choose the option that feels closer to your envisioned brand character."}
            </p>
          </div>

          {/* Progress Header */}
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold">
              <span className="text-secondary">
                {isFa ? `جفت ${currentPairIndex + 1} از ${QUESTIONS.length}` : `Pair ${currentPairIndex + 1} of ${QUESTIONS.length}`}
              </span>
              <span className="text-foreground/60">
                {isFa ? "گزینه الف یا گزینه ب را انتخاب کنید" : "Select Option A or Option B"}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full bg-secondary transition-all duration-300"
                style={{
                  width: `${((currentPairIndex + 1) / QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Options Grid: Option A vs Option B */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Option A */}
            <div
              onClick={() => handleSelectChoice("A")}
              className="group relative flex cursor-pointer flex-col items-center rounded-2xl border border-foreground/15 bg-background p-6 text-center transition-all duration-300 hover:border-secondary hover:shadow-[0_0_20px_color-mix(in_oklab,var(--secondary)_18%,transparent)]"
            >
              <div className="mb-4 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                {isFa ? "گزینه الف (Option A)" : "Option A"}
              </div>

              <div className="my-2 flex h-60 w-full items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                <img
                  src={QUESTIONS[currentPairIndex].optionA.image}
                  alt="Option A"
                  className="max-h-full max-w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-5 w-full">
                <button
                  type="button"
                  className="w-full h-11 rounded-full border border-[#EFEFEF] bg-transparent text-sm font-medium text-[#EFEFEF] transition-all duration-300 group-hover:border-transparent group-hover:bg-secondary group-hover:text-secondary-foreground"
                >
                  {isFa ? "انتخاب گزینه الف" : "Choose Option A"}
                </button>
              </div>
            </div>

            {/* Option B */}
            <div
              onClick={() => handleSelectChoice("B")}
              className="group relative flex cursor-pointer flex-col items-center rounded-2xl border border-foreground/15 bg-background p-6 text-center transition-all duration-300 hover:border-secondary hover:shadow-[0_0_20px_color-mix(in_oklab,var(--secondary)_18%,transparent)]"
            >
              <div className="mb-4 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                {isFa ? "گزینه ب (Option B)" : "Option B"}
              </div>

              <div className="my-2 flex h-60 w-full items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                <img
                  src={QUESTIONS[currentPairIndex].optionB.image}
                  alt="Option B"
                  className="max-h-full max-w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-5 w-full">
                <button
                  type="button"
                  className="w-full h-11 rounded-full border border-[#EFEFEF] bg-transparent text-sm font-medium text-[#EFEFEF] transition-all duration-300 group-hover:border-transparent group-hover:bg-secondary group-hover:text-secondary-foreground"
                >
                  {isFa ? "انتخاب گزینه ب" : "Choose Option B"}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={handlePrevMoodboard} className={actionBtnClass}>
              {isFa ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              <span>{isFa ? "مرحله قبل" : "Back"}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: SUMMARY & AUTOMATED SUBMISSION */}
      {step === "summary" && (
        <motion.div
          key="summary"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="flex w-full flex-col"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10 text-secondary">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
              {isFa ? "تکمیل پرسشنامه" : "Submission Complete"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              {formData.brandNameFa || formData.brandNameEn}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isFa
                ? "پاسخ‌ها و گزینه‌های انتخابی شما با موفقیت ثبت شدند."
                : "Your brief and visual preferences have been recorded."}
            </p>

            {/* Telegram delivery status */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs">
              {isSubmittingToTelegram ? (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary" />
                  {isFa ? "در حال ارسال خودکار اطلاعات به تلگرام سیاوش..." : "Automatically sending data to Siavash via Telegram..."}
                </span>
              ) : telegramStatus === "sent" ? (
                <span className="flex items-center gap-1.5 text-secondary">
                  <Check className="h-3.5 w-3.5" />
                  {isFa ? "اطلاعات، پاسخ‌ها و تصاویر به تلگرام استودیو ارسال شدند" : "Information, answers & aesthetic photos delivered to studio"}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {isFa ? "می‌توانید نسخه PDF را در زیر دانلود کنید." : "You can download your PDF copy below."}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-foreground/15 bg-background p-6 md:p-8">
            <h3 className="mb-4 font-display text-lg font-medium text-foreground">
              {isFa ? "نمونه‌های انتخابی شما (Preferred Aesthetics)" : "Your Selected Aesthetics (Preferred Aesthetics)"}
            </h3>

            {/* Preferred Aesthetics Thumbnails */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {selections.map((s) => (
                <div
                  key={s.questionNumber}
                  className="flex flex-col items-center rounded-xl border border-foreground/10 bg-foreground/[0.02] p-2"
                >
                  <div className="flex h-20 w-full items-center justify-center overflow-hidden">
                    <img
                      src={s.imageSrc}
                      alt={`Option ${s.choice}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="mt-1 text-[11px] font-medium text-foreground/70">
                    {isFa ? `جفت ${s.questionNumber}: گزینه ${s.choice}` : `Pair ${s.questionNumber}: Option ${s.choice}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/10 pt-6">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className={activeActionBtnClass}
              >
                <Download className="h-4 w-4" />
                <span>{isFa ? "دانلود نسخه PDF خلاصه فرم" : "Download PDF Report"}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isFa ? "تکمیل مجدد فرم" : "Start New Form"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
