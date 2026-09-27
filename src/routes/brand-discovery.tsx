import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
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
        "Select your visual preferences for brand identity. Visual questionnaire and aesthetic evaluation.",
      path: "/brand-discovery",
    }),
  component: BrandDiscoveryPage,
});

interface LogoOption {
  image: string;
}

interface QuestionPair {
  questionNumber: number;
  question: string;
  optionA: LogoOption;
  optionB: LogoOption;
}

const QUESTIONS: QuestionPair[] = [
  {
    questionNumber: 1,
    question: "Which of these two directions feels right for your brand?",
    optionA: { image: polarityLogo },
    optionB: { image: shekarchianLogo },
  },
  {
    questionNumber: 2,
    question: "Which of these two directions feels right for your brand?",
    optionA: { image: femiqLogo },
    optionB: { image: nozadLogo },
  },
  {
    questionNumber: 3,
    question: "Which of these two directions feels right for your brand?",
    optionA: { image: dodarehLogo },
    optionB: { image: ahuraLogo },
  },
  {
    questionNumber: 4,
    question: "Which of these two directions feels right for your brand?",
    optionA: { image: zenLogo },
    optionB: { image: echoSupplementsLogo },
  },
  {
    questionNumber: 5,
    question: "Which of these two directions feels right for your brand?",
    optionA: { image: goatsLogo },
    optionB: { image: artemisLogo },
  },
];

// Reusable low-quality downscaled image base64 generator for PDF and Telegram
async function getLowQualityBase64(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Downscale to max 320px for fast transmission and lightweight PDF
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

// Visual Identity button styles
const actionBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#EFEFEF] bg-transparent px-6 text-sm font-medium text-[#EFEFEF] shadow-none transition-[background-color,border-color,color,box-shadow] duration-300 ease-out hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer";

const activeActionBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-transparent bg-secondary px-6 text-sm font-medium text-secondary-foreground shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)] transition-all duration-300 cursor-pointer";

export function BrandDiscoveryPage() {
  const [step, setStep] = useState<"intro" | "questions" | "summary">("intro");
  const [brandName, setBrandName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<
    {
      questionNumber: number;
      question: string;
      choice: "A" | "B";
      imageSrc: string;
    }[]
  >([]);

  // Automatic submission status on completion
  const [isSubmittingToTelegram, setIsSubmittingToTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<"pending" | "sent" | "failed">("pending");
  const submittedRef = useRef(false);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setStep("questions");
    setCurrentIndex(0);
    setSelections([]);
    submittedRef.current = false;
    setTelegramStatus("pending");
  };

  const handleSelect = (choice: "A" | "B") => {
    const q = QUESTIONS[currentIndex];
    const chosenImage = choice === "A" ? q.optionA.image : q.optionB.image;

    const updated = [...selections];
    updated[currentIndex] = {
      questionNumber: q.questionNumber,
      question: `Question ${q.questionNumber}`,
      choice,
      imageSrc: chosenImage,
    };
    setSelections(updated);

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all questions! Move to summary
      setStep("summary");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setStep("intro");
    }
  };

  const handleReset = () => {
    setStep("intro");
    setCurrentIndex(0);
    setSelections([]);
    submittedRef.current = false;
    setTelegramStatus("pending");
  };

  // Generate pure Questions & Answers PDF with low-res Preferred Aesthetics images
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
    doc.text("VISUAL IDENTITY FORM", 20, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("SIAVASH AKBARI — CREATIVE SHOWCASE", 20, 28);

    // Brand info
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Brand Name: ${brandName || "Not provided"}`, 20, 48);

    if (contactInfo) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(`Contact / Notes: ${contactInfo}`, 20, 55);
    }

    // Questions and Answers Section
    doc.setTextColor(15, 15, 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("QUESTIONS & ANSWERS", 20, contactInfo ? 68 : 62);

    let currentY = contactInfo ? 78 : 72;
    selections.forEach((s) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`Question ${s.questionNumber}:`, 20, currentY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 140, 110);
      doc.text(`Option ${s.choice}`, 52, currentY);

      currentY += 9;
    });

    // Divider
    currentY += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(20, currentY, 190, currentY);
    currentY += 10;

    // Preferred Aesthetics Section (Images)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 15, 15);
    doc.text("PREFERRED AESTHETICS", 20, currentY);
    currentY += 8;

    // Add low quality image thumbnails in a clean grid
    const imgWidth = 30;
    const imgHeight = 30;
    const gap = 5;
    let xOffset = 20;

    for (let i = 0; i < selections.length; i++) {
      const s = selections[i];
      try {
        const base64Data = await getLowQualityBase64(s.imageSrc);
        if (base64Data) {
          doc.addImage(base64Data, "JPEG", xOffset, currentY, imgWidth, imgHeight);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(70, 70, 70);
          doc.text(`Q${s.questionNumber} (Option ${s.choice})`, xOffset + 2, currentY + imgHeight + 5);
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
      "Visual Identity Form — Siavash Akbari Design Studio (https://www.siavashakbari.ir)",
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

  // Automatic submission to Telegram on reaching summary
  useEffect(() => {
    if (step !== "summary" || submittedRef.current) return;
    submittedRef.current = true;

    async function submitAutomatically() {
      setIsSubmittingToTelegram(true);
      try {
        // 1. Prepare low-quality base64 for each selected logo
        const chosenImages: { questionNumber: number; choice: string; base64: string }[] = [];
        for (const s of selections) {
          const b64 = await getLowQualityBase64(s.imageSrc);
          chosenImages.push({
            questionNumber: s.questionNumber,
            choice: s.choice,
            base64: b64,
          });
        }

        // 2. Generate PDF with Q&A and Preferred Aesthetics
        const { base64: pdfBase64 } = await generatePdf();

        // 3. Dispatch to API route
        const res = await fetch("/api/brand-discovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandName,
            contactInfo,
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
    const cleanName = (brandName || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    doc.save(`${cleanName}-visual-identity-form.pdf`);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-4xl flex-col justify-center px-4 py-12 md:px-8">
      {/* 1. INTRO / BRAND NAME INPUT SCREEN */}
      {step === "intro" && (
        <motion.div
          key="intro"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="mx-auto flex w-full max-w-xl flex-col items-center text-center"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10 text-secondary shadow-[0_0_15px_color-mix(in_oklab,var(--secondary)_30%,transparent)]">
            <Sparkles className="h-6 w-6" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">
            Logo &amp; Brand Preference
          </p>

          <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            Visual Identity Form
          </h1>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            A quick visual questionnaire to capture your preferred aesthetic for your brand identity.
            Simply pick between pairs of options.
          </p>

          <form onSubmit={handleStart} className="mt-10 flex w-full flex-col gap-5 text-left">
            <div>
              <label
                htmlFor="brand-name"
                className="block text-xs font-semibold uppercase tracking-wider text-secondary"
              >
                Brand Name <span className="text-secondary">*</span>
              </label>
              <input
                id="brand-name"
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Echo Studio, Shekarchian, Femiq..."
                className="mt-2 w-full rounded-2xl border border-foreground/15 bg-background/60 px-5 py-3.5 text-base text-foreground placeholder:text-foreground/30 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="contact-info"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/60"
              >
                Contact Info / Notes (Optional)
              </label>
              <input
                id="contact-info"
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Your email, Telegram username, or project note"
                className="mt-2 w-full rounded-2xl border border-foreground/15 bg-background/60 px-5 py-3.5 text-base text-foreground placeholder:text-foreground/30 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
              />
            </div>

            <div className="mt-4 flex justify-center">
              <button
                type="submit"
                disabled={!brandName.trim()}
                className={activeActionBtnClass}
              >
                <span>Start Questionnaire</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 2. LOGO SELECTION COMPARISON */}
      {step === "questions" && (
        <motion.div
          key="questions"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="flex w-full flex-col"
        >
          {/* Progress Header */}
          <div className="mb-8 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold">
              <span className="text-secondary">
                Question {currentIndex + 1} of {QUESTIONS.length}
              </span>
              <span className="text-foreground/60">Select Option A or Option B</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full bg-secondary transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              {QUESTIONS[currentIndex].question}
            </h2>
          </div>

          {/* Options Grid: Option A vs Option B */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Option A */}
            <div
              onClick={() => handleSelect("A")}
              className="group relative flex cursor-pointer flex-col items-center rounded-2xl border border-foreground/15 bg-background p-6 text-center transition-all duration-300 hover:border-secondary hover:shadow-[0_0_20px_color-mix(in_oklab,var(--secondary)_18%,transparent)]"
            >
              <div className="mb-4 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Option A
              </div>

              <div className="my-2 flex h-60 w-full items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                <img
                  src={QUESTIONS[currentIndex].optionA.image}
                  alt="Option A"
                  className="max-h-full max-w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-5 w-full">
                <button
                  type="button"
                  className="w-full h-11 rounded-full border border-[#EFEFEF] bg-transparent text-sm font-medium text-[#EFEFEF] transition-all duration-300 group-hover:border-transparent group-hover:bg-secondary group-hover:text-secondary-foreground"
                >
                  Choose Option A
                </button>
              </div>
            </div>

            {/* Option B */}
            <div
              onClick={() => handleSelect("B")}
              className="group relative flex cursor-pointer flex-col items-center rounded-2xl border border-foreground/15 bg-background p-6 text-center transition-all duration-300 hover:border-secondary hover:shadow-[0_0_20px_color-mix(in_oklab,var(--secondary)_18%,transparent)]"
            >
              <div className="mb-4 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Option B
              </div>

              <div className="my-2 flex h-60 w-full items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                <img
                  src={QUESTIONS[currentIndex].optionB.image}
                  alt="Option B"
                  className="max-h-full max-w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-5 w-full">
                <button
                  type="button"
                  className="w-full h-11 rounded-full border border-[#EFEFEF] bg-transparent text-sm font-medium text-[#EFEFEF] transition-all duration-300 group-hover:border-transparent group-hover:bg-secondary group-hover:text-secondary-foreground"
                >
                  Choose Option B
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={handlePrev} className={actionBtnClass}>
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <span className="text-xs text-muted-foreground">
              Select the option that speaks closest to {brandName || "your brand"}.
            </span>
          </div>
        </motion.div>
      )}

      {/* 3. SUMMARY SCREEN & PDF DOWNLOAD */}
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
              Thank You
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              Visual Identity Form: {brandName}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your responses have been recorded and sent to the studio.
            </p>

            {/* Telegram Dispatch Indicator */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs">
              {isSubmittingToTelegram ? (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary" />
                  Sending to studio via Telegram...
                </span>
              ) : telegramStatus === "sent" ? (
                <span className="flex items-center gap-1.5 text-secondary">
                  <Check className="h-3.5 w-3.5" />
                  Delivered to studio via Telegram
                </span>
              ) : (
                <span className="text-muted-foreground">
                  You can download your copy below.
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-foreground/15 bg-background p-6 md:p-8">
            <h3 className="mb-4 font-display text-lg font-medium text-foreground">
              Your Answers
            </h3>

            <div className="flex flex-col divide-y divide-foreground/10">
              {selections.map((s) => (
                <div
                  key={s.questionNumber}
                  className="flex items-center justify-between py-3.5 text-sm"
                >
                  <span className="text-foreground/80">Question {s.questionNumber}</span>
                  <span className="font-semibold text-secondary">Option {s.choice}</span>
                </div>
              ))}
            </div>

            {/* Preferred Aesthetics Preview */}
            <div className="mt-8 border-t border-foreground/10 pt-6">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Preferred Aesthetics
              </h4>
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
                      Q{s.questionNumber}: Option {s.choice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/10 pt-6">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className={activeActionBtnClass}
              >
                <Download className="h-4 w-4" />
                <span>Download PDF Report</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Start New Form</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
