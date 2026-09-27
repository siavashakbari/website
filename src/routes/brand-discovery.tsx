import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  Download,
  Send,
  Loader2,
  Sparkles,
  Award,
  Layers,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { pageHead } from "@/lib/seo";

// Visual identity assets as authentic logo vibe placeholders
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
      title: "Brand Discovery — Siavash Akbari",
      description:
        "Define your brand visual identity preferences. Interactive logo comparison and aesthetic direction tool.",
      path: "/brand-discovery",
    }),
  component: BrandDiscoveryPage,
});

interface VibeOption {
  title: string;
  desc: string;
  image: string;
  tag: string;
}

interface VibePair {
  dimension: string;
  title: string;
  description: string;
  optionA: VibeOption;
  optionB: VibeOption;
}

const PAIRS: VibePair[] = [
  {
    dimension: "Minimalist vs Detailed",
    title: "Structural Density",
    description: "Do you prefer stark, stripped-down geometry or rich, elaborate visual form?",
    optionA: {
      title: "Pure Minimalist",
      desc: "Expansive breathing room, sharp essential lines, absolute clarity.",
      image: polarityLogo,
      tag: "Minimal",
    },
    optionB: {
      title: "Intricate & Detailed",
      desc: "Layered compositions, ornamental craftsmanship, cultural presence.",
      image: shekarchianLogo,
      tag: "Detailed",
    },
  },
  {
    dimension: "Modern vs Heritage",
    title: "Temporal Character",
    description: "Should your brand reflect futuristic precision or timeless traditional prestige?",
    optionA: {
      title: "Contemporary & Sharp",
      desc: "Clean geometric sans proportions, engineered digital modernity.",
      image: femiqLogo,
      tag: "Modern",
    },
    optionB: {
      title: "Cultural Heritage",
      desc: "Calligraphic gestures, historical resonance, artistic roots.",
      image: nozadLogo,
      tag: "Heritage",
    },
  },
  {
    dimension: "Playful vs Structured",
    title: "Tone & Demeanor",
    description: "Do you lean toward expressive, friendly charisma or disciplined, solid presence?",
    optionA: {
      title: "Expressive & Dynamic",
      desc: "Playful curves, kinetic spirit, approachable human touch.",
      image: dodarehLogo,
      tag: "Playful",
    },
    optionB: {
      title: "Architectural & Solid",
      desc: "Unwavering stability, high trust, grounded geometry.",
      image: ahuraLogo,
      tag: "Structured",
    },
  },
  {
    dimension: "Organic vs Industrial",
    title: "Form Language",
    description: "Natural rhythm and flowing curves or calculated modular construction?",
    optionA: {
      title: "Organic & Flowing",
      desc: "Harmonious balance, soothing curves, tranquil poise.",
      image: zenLogo,
      tag: "Organic",
    },
    optionB: {
      title: "Engineered & Modular",
      desc: "Repetitive modular strength, technological precision.",
      image: echoSupplementsLogo,
      tag: "Industrial",
    },
  },
  {
    dimension: "Bold vs Elegant",
    title: "Impact & Presence",
    description: "Heavy punch and striking weight or delicate, understated quiet luxury?",
    optionA: {
      title: "High-Contrast Bold",
      desc: "Unapologetic weight, high contrast, instant focal magnetism.",
      image: goatsLogo,
      tag: "Bold",
    },
    optionB: {
      title: "Quiet Elegance",
      desc: "Delicate proportions, refined luxury, subtle grace.",
      image: artemisLogo,
      tag: "Elegant",
    },
  },
];

// Consistent button style matching the portfolio visual identity buttons
const actionBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#EFEFEF] bg-transparent px-6 text-sm font-medium text-[#EFEFEF] shadow-none transition-[background-color,border-color,color,box-shadow] duration-300 ease-out hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer";

const activeActionBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-transparent bg-secondary px-6 text-sm font-medium text-secondary-foreground shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)] transition-all duration-300 cursor-pointer";

export function BrandDiscoveryPage() {
  const [step, setStep] = useState<"intro" | "questions" | "summary">("intro");
  const [brandName, setBrandName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [selections, setSelections] = useState<
    {
      choice: "A" | "B";
      dimension: string;
      selectedOption: string;
      tag: string;
    }[]
  >([]);

  // Submission / Export states
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setStep("questions");
    setCurrentPairIndex(0);
    setSelections([]);
  };

  const handleSelect = (choice: "A" | "B") => {
    const pair = PAIRS[currentPairIndex];
    const chosen = choice === "A" ? pair.optionA : pair.optionB;

    const newSelections = [...selections];
    newSelections[currentPairIndex] = {
      choice,
      dimension: pair.dimension,
      selectedOption: chosen.title,
      tag: chosen.tag,
    };
    setSelections(newSelections);

    if (currentPairIndex < PAIRS.length - 1) {
      setCurrentPairIndex((prev) => prev + 1);
    } else {
      setStep("summary");
    }
  };

  const handlePrev = () => {
    if (currentPairIndex > 0) {
      setCurrentPairIndex((prev) => prev - 1);
    } else {
      setStep("intro");
    }
  };

  const handleReset = () => {
    setStep("intro");
    setCurrentPairIndex(0);
    setSelections([]);
    setSendSuccess(false);
    setErrorMessage("");
  };

  // Determine Primary Archetype based on selections
  const computeArchetype = () => {
    const aCount = selections.filter((s) => s.choice === "A").length;
    const ratioA = aCount / (selections.length || 1);

    if (ratioA >= 0.8) {
      return {
        title: "Modern Minimalist",
        desc: "You strongly favor structural clarity, intentional breathing space, and high-impact digital typography.",
      };
    } else if (ratioA >= 0.6) {
      return {
        title: "Clean Contemporary",
        desc: "A balanced modern vision emphasizing clean geometry, functional refinement, and versatile multi-surface presence.",
      };
    } else if (ratioA >= 0.4) {
      return {
        title: "Harmonic Hybrid",
        desc: "A rich interplay between artistic identity and structured execution, offering memorable tactile warmth.",
      };
    } else {
      return {
        title: "Heritage & Craft",
        desc: "Deep visual storytelling, expressive character, and authoritative cultural resonance.",
      };
    }
  };

  const archetype = computeArchetype();

  // Generate PDF document
  const generatePdfBlob = (): { doc: jsPDF; base64: string } => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor = [15, 15, 15]; // #0F0F0F
    const accentColor = [63, 235, 204]; // #3FEBCC

    // Background header banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 48, "F");

    // Title
    doc.setTextColor(239, 239, 239);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("BRAND VIBE DISCOVERY REPORT", 20, 24);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("STUDIO SIAVASH AKBARI — CREATIVE SHOWCASE", 20, 34);

    // Brand Meta Info
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Brand Name: ${brandName || "Untitled"}`, 20, 62);

    if (contactInfo) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(`Contact / Notes: ${contactInfo}`, 20, 70);
    }

    // Archetype Box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(20, 78, 170, 30, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 15, 15);
    doc.text("RECOMMENDED AESTHETIC ARCHETYPE", 26, 88);

    doc.setFontSize(14);
    doc.setTextColor(0, 150, 120);
    doc.text(archetype.title, 26, 96);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const splitDesc = doc.splitTextToSize(archetype.desc, 158);
    doc.text(splitDesc, 26, 102);

    // Section: Answers Breakdown
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 15, 15);
    doc.text("STYLISTIC SELECTIONS & COMPARISONS", 20, 122);

    let currentY = 132;
    PAIRS.forEach((pair, idx) => {
      const userSel = selections[idx];
      const isChoiceA = userSel?.choice === "A";

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`${idx + 1}. ${pair.dimension} (${pair.title})`, 20, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Preference: ${userSel?.selectedOption || "None"}`, 26, currentY + 6);

      // Simple visual indicator bar
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(120, currentY - 3, 70, 6, 2, 2, "F");

      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      if (isChoiceA) {
        doc.roundedRect(120, currentY - 3, 35, 6, 2, 2, "F");
      } else {
        doc.roundedRect(155, currentY - 3, 35, 6, 2, 2, "F");
      }

      currentY += 16;
    });

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "Report generated via Siavash Akbari Design Studio — https://www.siavashakbari.ir",
      20,
      280
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

  const handleDownloadPdf = () => {
    const { doc } = generatePdfBlob();
    const filename = `${brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "brand"}-vibe-report.pdf`;
    doc.save(filename);
  };

  const handleSendToTelegram = async () => {
    setIsSending(true);
    setErrorMessage("");
    try {
      const { base64 } = generatePdfBlob();

      const response = await fetch("/api/brand-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          contactInfo,
          archetypeTitle: archetype.title,
          archetypeDesc: archetype.desc,
          selections,
          pdfBase64: base64,
        }),
      });

      const resData = await response.json();
      if (!response.ok || resData.success === false) {
        throw new Error(resData.error || "Failed to deliver submission");
      }

      setSendSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || "Could not complete submission. You can still download the PDF report."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-5xl flex-col justify-center px-4 py-12 md:px-8">
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
            Visual Identity Questionnaire
          </p>

          <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            Brand Vibe Discovery
          </h1>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            A guided visual preference system. In just five comparisons, explore aesthetic directions
            to articulate your brand&apos;s personality, form language, and tone.
          </p>

          <form onSubmit={handleStart} className="mt-10 flex w-full flex-col gap-5 text-left">
            <div>
              <label
                htmlFor="brand-name"
                className="block text-xs font-semibold uppercase tracking-wider text-secondary"
              >
                1. Brand Name <span className="text-secondary">*</span>
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
                Contact / Project Context (Optional)
              </label>
              <input
                id="contact-info"
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Email, Telegram ID, or short notes on your industry"
                className="mt-2 w-full rounded-2xl border border-foreground/15 bg-background/60 px-5 py-3.5 text-base text-foreground placeholder:text-foreground/30 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
              />
            </div>

            <div className="mt-4 flex justify-center">
              <button
                type="submit"
                disabled={!brandName.trim()}
                className={activeActionBtnClass}
              >
                <span>Start Vibe Test</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 2. LOGO VIBE PAIRS SELECTION */}
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
                Pair {currentPairIndex + 1} of {PAIRS.length}
              </span>
              <span className="text-foreground/60">{PAIRS[currentPairIndex].dimension}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full bg-secondary transition-all duration-300"
                style={{
                  width: `${((currentPairIndex + 1) / PAIRS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              {PAIRS[currentPairIndex].title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {PAIRS[currentPairIndex].description}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Option A */}
            <div
              onClick={() => handleSelect("A")}
              className="group relative flex cursor-pointer flex-col items-center rounded-2xl border border-foreground/15 bg-background p-6 text-center transition-all duration-300 hover:border-secondary hover:shadow-[0_0_20px_color-mix(in_oklab,var(--secondary)_18%,transparent)]"
            >
              <div className="absolute top-4 left-4 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/70">
                Option A
              </div>

              <div className="my-5 flex h-52 w-full items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                <img
                  src={PAIRS[currentPairIndex].optionA.image}
                  alt={PAIRS[currentPairIndex].optionA.title}
                  className="max-h-full max-w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <h3 className="font-display text-lg font-medium text-foreground">
                {PAIRS[currentPairIndex].optionA.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {PAIRS[currentPairIndex].optionA.desc}
              </p>

              <div className="mt-5 w-full">
                <button
                  type="button"
                  className="w-full h-10 rounded-full border border-[#EFEFEF] bg-transparent text-xs font-medium text-[#EFEFEF] transition-all duration-300 group-hover:border-transparent group-hover:bg-secondary group-hover:text-secondary-foreground"
                >
                  Choose This Aesthetic
                </button>
              </div>
            </div>

            {/* Option B */}
            <div
              onClick={() => handleSelect("B")}
              className="group relative flex cursor-pointer flex-col items-center rounded-2xl border border-foreground/15 bg-background p-6 text-center transition-all duration-300 hover:border-secondary hover:shadow-[0_0_20px_color-mix(in_oklab,var(--secondary)_18%,transparent)]"
            >
              <div className="absolute top-4 left-4 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/70">
                Option B
              </div>

              <div className="my-5 flex h-52 w-full items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                <img
                  src={PAIRS[currentPairIndex].optionB.image}
                  alt={PAIRS[currentPairIndex].optionB.title}
                  className="max-h-full max-w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <h3 className="font-display text-lg font-medium text-foreground">
                {PAIRS[currentPairIndex].optionB.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {PAIRS[currentPairIndex].optionB.desc}
              </p>

              <div className="mt-5 w-full">
                <button
                  type="button"
                  className="w-full h-10 rounded-full border border-[#EFEFEF] bg-transparent text-xs font-medium text-[#EFEFEF] transition-all duration-300 group-hover:border-transparent group-hover:bg-secondary group-hover:text-secondary-foreground"
                >
                  Choose This Aesthetic
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

      {/* 3. SUMMARY DASHBOARD & DUAL EXPORT SCREEN */}
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
              <Award className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
              Discovery Complete
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              Brand Vibe Profile: {brandName}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your aesthetic profile has been synthesized based on your choices.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Left: Dimension choices */}
            <div className="md:col-span-2 rounded-2xl border border-foreground/15 bg-background p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-medium text-foreground">
                <Layers className="h-4 w-4 text-secondary" />
                Dimension Breakdown
              </h3>
              <div className="flex flex-col gap-3">
                {PAIRS.map((pair, idx) => {
                  const sel = selections[idx];
                  return (
                    <div
                      key={pair.dimension}
                      className="flex items-center justify-between rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm"
                    >
                      <span className="text-foreground/80">{pair.dimension}</span>
                      <span className="font-semibold text-secondary">
                        {sel?.selectedOption || "Selected"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Archetype & Actions */}
            <div className="flex flex-col justify-between rounded-2xl border border-foreground/15 bg-background p-6">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">
                  Recommended Direction
                </div>
                <h4 className="font-display text-xl font-medium text-foreground">
                  {archetype.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {archetype.desc}
                </p>
              </div>

              {/* Export actions */}
              <div className="mt-8 flex flex-col gap-3 border-t border-foreground/10 pt-6">
                {/* 1. PDF Download */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className={actionBtnClass}
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF Report</span>
                </button>

                {/* 2. Send to Telegram */}
                <button
                  type="button"
                  onClick={handleSendToTelegram}
                  disabled={isSending || sendSuccess}
                  className={sendSuccess ? actionBtnClass : activeActionBtnClass}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending to Studio...</span>
                    </>
                  ) : sendSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-secondary" />
                      <span>Sent to Studio!</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit to Siavash</span>
                    </>
                  )}
                </button>

                {errorMessage && (
                  <p className="mt-1 text-center text-xs text-destructive">
                    {errorMessage}
                  </p>
                )}

                {/* Retake */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-2 flex items-center justify-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retake Questionnaire</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
