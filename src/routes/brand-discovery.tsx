import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  Download,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { pageHead } from "@/lib/seo";

// Visual identity curated assets: 9 coupled pairs & 35 moodboard items
import { COUPLED_LOGO_PAIRS, MOODBOARD_GRID_IMAGES } from "@/data/visual-identity-assets";
import { PEYDA_BASE64 } from "@/assets/fonts/peyda/peyda-base64";

// Helper to detect RTL characters (Farsi / Arabic)
function hasRTL(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

export const Route = createFileRoute("/brand-discovery")({
  head: () =>
    pageHead({
      title: "فرم طراحی هویت دیداری — Siavash Akbari",
      description: "فرم جامع طراحی هویت دیداری و لوگو دیزاین توسط سیاوش اکبری استودیو.",
      path: "/brand-discovery",
    }),
  component: BrandDiscoveryPage,
});

type Lang = "en" | "fa";

// Helper to convert images to low-quality downscaled base64 for PDF and Telegram
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

// Render Siavash Akbari SVG logo in pure white to Base64 PNG for jsPDF header
function renderWhiteLogoDataUrl(): Promise<string> {
  return new Promise((resolve) => {
    const svgString = `<svg viewBox="0 0 890.99 90.48" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path d="M14.09,84.68c-6.07-3.09-10.77-7.19-14.09-12.3l9.63-9.63c1.78,4.25,4.93,7.64,9.45,10.15,4.52,2.51,9.57,3.77,15.14,3.77,5.03,0,9.03-.97,12.01-2.9,2.98-1.93,4.5-4.87,4.58-8.82,0-2.47-.5-4.68-1.51-6.61-1.01-1.93-2.63-3.65-4.87-5.16s-4.31-2.69-6.21-3.54c-1.9-.85-4.54-1.93-7.95-3.25-2.47-.93-4.23-1.6-5.28-2.03-1.04-.43-2.67-1.14-4.87-2.15s-3.83-1.88-4.87-2.61c-1.04-.73-2.34-1.74-3.89-3.02-1.55-1.28-2.67-2.53-3.36-3.77-.7-1.24-1.33-2.73-1.91-4.47-.58-1.74-.87-3.58-.87-5.51,0-7.04,2.61-12.6,7.83-16.7C18.27,2.05,24.9,0,32.94,0c13.84,0,24.4,4.21,31.67,12.64l-8.93,8.93c-4.49-6.81-11.95-10.21-22.39-10.21-4.33,0-7.83.91-10.5,2.73-2.67,1.82-4,4.39-4,7.71,0,1.39.35,2.73,1.04,4s1.51,2.34,2.44,3.19c.93.85,2.3,1.78,4.12,2.78s3.38,1.78,4.7,2.32c1.31.54,3.17,1.31,5.57,2.32,3.48,1.39,6.13,2.49,7.95,3.31,1.82.81,4.19,2.09,7.13,3.83,2.94,1.74,5.16,3.46,6.67,5.16,1.51,1.7,2.86,3.91,4.06,6.61s1.8,5.68,1.8,8.93c0,8.35-2.8,14.62-8.41,18.79-5.61,4.18-12.97,6.26-22.1,6.26-7.04,0-13.59-1.55-19.66-4.64Z" />
        <path d="M78.3,1.16h13.34v87h-13.34V1.16Z" />
        <path d="M165.76,70.64h-42.46l-6.73,17.52h-14.5L136.99,1.16h14.96l34.92,87h-14.5l-6.61-17.52ZM161.47,59.51l-16.94-44.66-17.05,44.66h33.99Z" />
        <path d="M260.76,1.16l-34.92,87h-14.96L175.97,1.16h14.96l27.49,71.57L245.8,1.16h14.96Z" />
        <path d="M313.55,70.64h-42.46l-6.73,17.52h-14.5L284.78,1.16h14.96l34.92,87h-14.5l-6.61-17.52ZM309.25,59.51l-16.94-44.66-17.05,44.66h33.99Z" />
        <path d="M354.32,84.68c-6.07-3.09-10.77-7.19-14.09-12.3l9.63-9.63c1.78,4.25,4.93,7.64,9.45,10.15,4.52,2.51,9.57,3.77,15.14,3.77,5.03,0,9.03-.97,12.01-2.9,2.98-1.93,4.5-4.87,4.58-8.82,0-2.47-.5-4.68-1.51-6.61-1-1.93-2.63-3.65-4.87-5.16-2.24-1.51-4.31-2.69-6.21-3.54s-4.54-1.93-7.95-3.25c-2.47-.93-4.23-1.6-5.28-2.03s-2.67-1.14-4.87-2.15c-2.2-1.01-3.83-1.88-4.87-2.61-1.04-.73-2.34-1.74-3.89-3.02-1.55-1.28-2.67-2.53-3.36-3.77s-1.33-2.73-1.91-4.47c-.58-1.74-.87-3.58-.87-5.51,0-7.04,2.61-12.6,7.83-16.7s11.85-6.15,19.89-6.15c13.84,0,24.4,4.21,31.67,12.64l-8.93,8.93c-4.49-6.81-11.95-10.21-22.39-10.21-4.33,0-7.83.91-10.5,2.73-2.67,1.82-4,4.39-4,7.71,0,1.39.35,2.73,1.04,4,.7,1.28,1.51,2.34,2.44,3.19s2.3,1.78,4.12,2.78,3.38,1.78,4.7,2.32c1.31.54,3.17,1.31,5.57,2.32,3.48,1.39,6.13,2.49,7.95,3.31s4.2,2.09,7.13,3.83c2.94,1.74,5.16,3.46,6.67,5.16,1.51,1.7,2.86,3.91,4.06,6.61,1.2,2.71,1.8,5.68,1.8,8.93,0,8.35-2.8,14.62-8.41,18.79-5.61,4.18-12.97,6.26-22.1,6.26-7.04,0-13.59-1.55-19.66-4.64Z" />
        <path d="M487.89,1.16v87h-13.34v-37.58h-42.69v37.58h-13.34V1.16h13.34v37.58h42.69V1.16h13.34Z" />
        <path d="M561.9,69.25h-46.75l-7.31,18.91h-8.58L534.18,1.16h8.7l34.92,87h-8.58l-7.31-18.91ZM559.23,62.52l-20.76-53.13-20.65,53.13h41.41Z" />
        <path d="M646.23,90.48l-48.02-47.56v45.24h-7.89V1.16h7.89v37.47L635.44,1.16h10.21l-39.44,39.32,40.02,39.56v10.44Z" />
        <path d="M713.62,51.04c3.48,3.94,5.22,8.7,5.22,14.27,0,6.57-2.26,12.03-6.79,16.36-4.52,4.33-10.07,6.5-16.65,6.5h-36.19V1.16h29.12c6.65,0,12.26,2.17,16.82,6.5s6.84,9.78,6.84,16.36c0,4.33-1.04,8.18-3.13,11.54-2.09,3.36-4.95,6.01-8.58,7.95,5.41,1.08,9.86,3.6,13.34,7.54ZM699.3,12.99c-3.21-3.25-7.09-4.87-11.66-4.87h-20.65v33.18h20.65c4.56,0,8.45-1.62,11.66-4.87,3.21-3.25,4.81-7.15,4.81-11.72s-1.6-8.47-4.81-11.72ZM706.14,76.21c3.21-3.25,4.81-7.15,4.81-11.72s-1.6-8.47-4.81-11.72c-3.21-3.25-7.1-4.87-11.66-4.87h-27.49v33.18h27.49c4.56,0,8.45-1.62,11.66-4.87Z" />
        <path d="M786.94,69.25h-46.75l-7.31,18.91h-8.58L759.21,1.16h8.7l34.92,87h-8.58l-7.31-18.91ZM784.27,62.52l-20.76-53.13-20.65,53.13h41.41Z" />
        <path d="M871.5,88.16h-8.82l-21.46-39.67h-17.98v39.67h-7.89V1.16h30.28c6.65,0,12.3,2.34,16.94,7.02,4.64,4.68,6.96,10.34,6.96,16.99,0,5.88-1.93,10.98-5.8,15.31-3.87,4.33-8.7,6.88-14.5,7.66l22.27,40.02ZM845.4,41.88c4.72,0,8.72-1.64,12.01-4.93,3.29-3.29,4.93-7.29,4.93-12.01s-1.66-8.6-4.99-11.89-7.31-4.93-11.95-4.93h-22.16v33.76h22.16Z" />
        <path d="M883.1,1.16h7.89v87h-7.89V1.16Z" />
      </g>
    </svg>`;
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 891;
      canvas.height = 91;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 891, 91);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      } else {
        URL.revokeObjectURL(url);
        resolve("");
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("");
    };
    img.src = url;
  });
}

// Button styles matching the portfolio design system
const actionBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#EFEFEF] bg-transparent px-6 text-sm font-medium text-[#EFEFEF] shadow-none transition-[background-color,border-color,color,box-shadow] duration-300 ease-out hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer";

const activeActionBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-transparent bg-secondary px-6 text-sm font-medium text-secondary-foreground shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)] transition-all duration-300 cursor-pointer";

// Input, Select & Textarea Pill and Fillet styles
const inputPillClass =
  "w-full h-12 rounded-full border border-foreground/15 bg-background/60 px-5 text-sm font-normal text-foreground placeholder:text-foreground/35 placeholder:font-thin focus:border-secondary focus:outline-none transition-all";

const selectPillClass =
  "w-full h-12 rounded-full border border-foreground/15 bg-background/60 px-5 text-sm font-normal text-foreground focus:border-secondary focus:outline-none transition-all appearance-none cursor-pointer";

const textareaPillClass =
  "w-full rounded-3xl border border-foreground/15 bg-background/60 p-4 text-sm font-normal text-foreground placeholder:text-foreground/35 placeholder:font-thin focus:border-secondary focus:outline-none transition-all";

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
          reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 28 }
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

  // Section 1: Questionnaire Form Data
  const [formData, setFormData] = useState({
    // Section 1
    brandNameFa: "",
    brandNameEn: "",
    primaryLanguage: "fa", // "fa" | "en" | "both"
    slogan: "",
    activity: "",
    nameHistory: "",
    // Mascot option
    wantMascot: false,
    mascotDescription: "",
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
    // Section 6: Additional notes
    additionalNotes: "",
  });

  // Section 2: Moodboard Multiple Selection (40 images, max 15)
  const [selectedMoodboardIndices, setSelectedMoodboardIndices] = useState<number[]>([]);

  // Section 3: Pick One Pairs (9 coupled pairs)
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [selections, setSelections] = useState<
    {
      pairId: number;
      folderCategory: string;
      choice: "A" | "B";
      imageSrc: string;
      chosenBrand: string;
      chosenFeeling: string;
    }[]
  >([]);

  // Flow steps: "form" -> "moodboard" -> "pickone" -> "summary"
  const [step, setStep] = useState<"form" | "moodboard" | "pickone" | "summary">("form");
  const [formError, setFormError] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const submittedRef = useRef(false);

  // Close custom language dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (name === "brandNameFa" || name === "brandNameEn") {
      setFormError(false);
    }
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Section 1 submit -> go to Section 2 (Moodboard)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandNameFa.trim() && !formData.brandNameEn.trim()) {
      setFormError(true);
      return;
    }
    setFormError(false);
    setStep("moodboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle moodboard item (up to 15)
  const handleToggleMoodboardItem = (index: number) => {
    setSelectedMoodboardIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      if (prev.length >= 15) {
        return prev;
      }
      return [...prev, index];
    });
  };

  // Section 2 continue -> go to Section 3 (Pick One)
  const handleContinueToPickOne = () => {
    setStep("pickone");
    setCurrentPairIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Section 3 choice selection
  const handleSelectChoice = (choice: "A" | "B") => {
    const pair = COUPLED_LOGO_PAIRS[currentPairIndex];
    const chosenOption = choice === "A" ? pair.optionA : pair.optionB;

    const updated = [...selections];
    updated[currentPairIndex] = {
      pairId: pair.id,
      folderCategory: pair.folderCategory,
      choice,
      imageSrc: chosenOption.image,
      chosenBrand: chosenOption.brand,
      chosenFeeling: chosenOption.feeling,
    };
    setSelections(updated);

    if (currentPairIndex < COUPLED_LOGO_PAIRS.length - 1) {
      setCurrentPairIndex((prev) => prev + 1);
    } else {
      setStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPickOne = () => {
    if (currentPairIndex > 0) {
      setCurrentPairIndex((prev) => prev - 1);
    } else {
      setStep("moodboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setStep("form");
    setSelectedMoodboardIndices([]);
    setCurrentPairIndex(0);
    setSelections([]);
    submittedRef.current = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate PDF:
  // isAdmin = false -> User PDF (Hides feelings/vibes, only mentions brand names)
  // isAdmin = true -> Admin PDF (Sent to Telegram, reveals feelings and strategic rationale)
  const generatePdf = async (isAdmin: boolean): Promise<{ doc: jsPDF; base64: string }> => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Register Peyda font into jsPDF VFS for genuine Farsi/Persian support
    try {
      doc.addFileToVFS("Peyda-Regular.ttf", PEYDA_BASE64);
      doc.addFont("Peyda-Regular.ttf", "Peyda", "normal");
      doc.setLanguage("fa");
    } catch (fontErr) {
      console.error("Could not register Peyda font in jsPDF", fontErr);
    }

    const primaryColor = [15, 15, 15]; // #0F0F0F

    // Header bar (Height 42mm)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 42, "F");

    // White Logo spanning full width (180mm width with 15mm margins, strictly proportional ~9.85:1 -> height 18.28mm)
    try {
      const whiteLogo = await renderWhiteLogoDataUrl();
      if (whiteLogo) {
        doc.addImage(whiteLogo, "PNG", 15, 7, 180, 18.28);
      }
    } catch (logoErr) {
      console.error("Could not render logo for PDF", logoErr);
    }

    // Under it: VISUAL IDENTITY FORM (all caps)
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("VISUAL IDENTITY FORM", 15, 30);

    // Under it: Siavash Akbari
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(isAdmin ? "Siavash Akbari — Studio Internal Brief" : "Siavash Akbari", 15, 36);

    let currentY = 52;

    const addSectionTitle = (title: string) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFillColor(242, 242, 242);
      doc.rect(15, currentY - 4, 180, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 15, 15);
      doc.text(title, 18, currentY + 1);
      currentY += 9;
    };

    const addField = (label: string, value: string) => {
      if (!value) return;
      if (currentY > 265) {
        doc.addPage();
        currentY = 20;
      }

      // Print English Label on the left
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text(`${label}:`, 18, currentY);

      // Print Value: use Peyda font and processArabic if Farsi/Arabic characters are detected
      const isPersian = hasRTL(value);
      if (isPersian) {
        doc.setFont("Peyda", "normal");
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);

        try {
          const shaped = doc.processArabic(value);
          const lines = doc.splitTextToSize(shaped, 125);
          for (let i = 0; i < lines.length; i++) {
            doc.text(lines[i], 195, currentY + i * 4.8, { align: "right" });
          }
          currentY += Math.max(lines.length * 4.8, 6);
        } catch {
          doc.text(value, 195, currentY, { align: "right" });
          currentY += 6;
        }
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const lines = doc.splitTextToSize(value, 125);
        doc.text(lines, 68, currentY);
        currentY += Math.max(lines.length * 4.5, 6);
      }
    };

    // SECTION 1: QUESTIONNAIRE
    addSectionTitle("SECTION 1: BRAND IDENTITY & BASIC INFORMATION");
    addField("Brand Name (Persian)", formData.brandNameFa);
    addField("Brand Name (English)", formData.brandNameEn);
    addField("Language Priority", formData.primaryLanguage);
    addField("Slogan / Tagline", formData.slogan);
    addField("Field of Activity", formData.activity);
    addField("Name History / Story", formData.nameHistory);
    if (formData.wantMascot) {
      addField("Mascot Requested", "Yes");
      if (formData.mascotDescription) {
        addField("Mascot Description", formData.mascotDescription);
      }
    }
    currentY += 2;

    addSectionTitle("TARGET AUDIENCE & MARKET");
    addField("Target Audience", formData.targetAudience);
    addField("Main Competitors", formData.competitors);
    currentY += 2;

    addSectionTitle("VISUAL STYLE & BRAND PERSONALITY");
    addField("Brand Attributes", formData.brandAttributes);
    addField("Preferred Forms / Shapes", formData.favoriteForms);
    currentY += 2;

    addSectionTitle("TECHNICAL REQUIREMENTS & APPLICATIONS");
    addField("Bilingual Layout", formData.layoutPreference);
    addField("Main Applications", formData.mainApplications);
    addField("Scalability", formData.scalability);
    currentY += 2;

    addSectionTitle("SPECIAL PREFERENCES & FORBIDDEN ELEMENTS");
    addField("Forbidden Elements", formData.forbiddenElements);
    if (formData.additionalNotes) {
      addField("Additional Notes", formData.additionalNotes);
    }
    currentY += 4;

    // SECTION 2: MOODBOARD SELECTIONS
    if (selectedMoodboardIndices.length > 0) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }
      addSectionTitle(
        `SECTION 2: MOODBOARD SELECTIONS (${selectedMoodboardIndices.length} SELECTED)`,
      );
      currentY += 2;

      const mbWidth = 25;
      const mbHeight = 25;
      const mbGap = 5;
      let mbX = 18;

      for (let i = 0; i < selectedMoodboardIndices.length; i++) {
        const itemIdx = selectedMoodboardIndices[i];
        const item = MOODBOARD_GRID_IMAGES[itemIdx];
        if (!item) continue;

        if (mbX + mbWidth > 195) {
          mbX = 18;
          currentY += mbHeight + 4;
          if (currentY > 260) {
            doc.addPage();
            currentY = 20;
          }
        }

        try {
          const b64 = await getLowQualityBase64(item.image);
          if (b64) {
            doc.addImage(b64, "JPEG", mbX, currentY, mbWidth, mbHeight);
          }
        } catch (e) {
          console.error(e);
        }
        mbX += mbWidth + mbGap;
      }
      currentY += mbHeight + 6;
    }

    // SECTION 3: PICK ONE / PREFERRED AESTHETICS (Exactly 3 Columns)
    if (selections.length > 0) {
      if (currentY > 200) {
        doc.addPage();
        currentY = 20;
      }
      addSectionTitle("SECTION 3: PREFERRED AESTHETICS (COUPLED LOGO SELECTIONS)");
      currentY += 2;

      // 3 columns layout: 180mm content width / 3 cols = 54mm width each + 9mm gap
      const colWidth = 54;
      const colGap = 9;
      const imgHeight = 44;
      const cardHeight = imgHeight + 10;
      const startX = 15;

      for (let i = 0; i < selections.length; i++) {
        const colIndex = i % 3;
        if (colIndex === 0 && i > 0) {
          currentY += cardHeight + 4;
          if (currentY > 240) {
            doc.addPage();
            currentY = 20;
          }
        }

        const s = selections[i];
        const xOffset = startX + colIndex * (colWidth + colGap);

        try {
          const base64Data = await getLowQualityBase64(s.imageSrc);
          if (base64Data) {
            // Draw neat border frame for each aesthetic card
            doc.setDrawColor(230, 230, 230);
            doc.setFillColor(252, 252, 252);
            doc.roundedRect(xOffset, currentY, colWidth, cardHeight, 2, 2, "FD");

            // Embed image within card
            doc.addImage(
              base64Data,
              "JPEG",
              xOffset + 3,
              currentY + 3,
              colWidth - 6,
              imgHeight - 6,
            );

            // Label text below image
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(40, 40, 40);

            const labelText = isAdmin
              ? `Pair ${s.pairId}: ${s.chosenBrand} (${s.chosenFeeling})`
              : `Pair ${s.pairId}: ${s.chosenBrand}`;

            doc.text(labelText, xOffset + colWidth / 2, currentY + imgHeight + 5, {
              align: "center",
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
      currentY += cardHeight + 8;
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text("siavashakbari.ir", 15, 288);
    }

    const pdfOutput = doc.output("arraybuffer");
    let binary = "";
    const bytes = new Uint8Array(pdfOutput);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return { doc, base64 };
  };

  // Helper to format date string YYYY-MM-DD
  const getDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Automatic submission to Telegram silently upon reaching summary
  useEffect(() => {
    if (step !== "summary" || submittedRef.current) return;
    submittedRef.current = true;

    async function submitAutomatically() {
      try {
        // 1. Prepare low-quality base64 for chosen Pick One logos (with brand & feeling)
        const chosenImages: {
          pairId: number;
          choice: string;
          brand: string;
          feeling: string;
          base64: string;
        }[] = [];
        for (const s of selections) {
          const b64 = await getLowQualityBase64(s.imageSrc);
          chosenImages.push({
            pairId: s.pairId,
            choice: s.choice,
            brand: s.chosenBrand,
            feeling: s.chosenFeeling,
            base64: b64,
          });
        }

        // 2. Prepare low-quality base64 for selected Moodboard images
        const moodboardImages: { index: number; base64: string }[] = [];
        for (const idx of selectedMoodboardIndices) {
          const item = MOODBOARD_GRID_IMAGES[idx];
          if (item) {
            const b64 = await getLowQualityBase64(item.image);
            moodboardImages.push({ index: idx, base64: b64 });
          }
        }

        // 3. Generate both User and Admin PDFs
        const { base64: adminPdfBase64 } = await generatePdf(true);
        const { base64: userPdfBase64 } = await generatePdf(false);

        // 4. Dispatch to API route silently
        await fetch("/api/brand-discovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formData,
            selectedMoodboardIndices,
            moodboardImages,
            selections,
            chosenImages,
            adminPdfBase64,
            userPdfBase64,
          }),
        });
      } catch (err) {
        console.error("Auto submit to Telegram failed:", err);
      }
    }

    submitAutomatically();
  }, [step]);

  // Download User PDF with naming format: Name of brand-Date-Visual Identity Brief.pdf
  const handleDownloadPdf = async () => {
    const { doc } = await generatePdf(false);
    const brandName = (formData.brandNameEn || formData.brandNameFa || "Brand").trim();
    const dateStr = getDateString();
    doc.save(`${brandName}-${dateStr}-Visual Identity Brief.pdf`);
  };

  return (
    <div
      className={`mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-4xl flex-col justify-center px-4 py-12 md:px-8 ${
        isFa ? "font-farsi" : ""
      }`}
      lang={lang}
      dir={isFa ? "rtl" : "ltr"}
    >
      {/* Top Header with Language Switch (No icon next to title) */}
      <div className="mb-8 flex items-center justify-between border-b border-foreground/10 pb-6">
        <div>
          <h1
            className={`text-xl font-bold tracking-tight text-foreground md:text-2xl ${
              isFa ? "font-farsi font-bold" : "font-display"
            }`}
          >
            {isFa ? "فرم طراحی هویت دیداری" : "Visual Identity Brief"}
          </h1>
          <p className={`text-xs text-secondary mt-0.5 ${isFa ? "font-farsi font-normal" : ""}`}>
            {isFa ? "استودیو طراحی سیاوش اکبری" : "Siavash Akbari Design Studio"}
          </p>
        </div>

        <LanguageSwitch
          lang={lang}
          onToggle={() => setLang(isFa ? "en" : "fa")}
          reduceMotion={!!reduceMotion}
        />
      </div>

      {/* SECTION 1: DETAILED QUESTIONNAIRE */}
      {step === "form" && (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="flex w-full flex-col"
        >
          <div className="mb-8 rounded-3xl border border-secondary/20 bg-secondary/5 p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
              <span>
                {isFa
                  ? "بخش اول از سه بخش: پرسشنامه تحلیلی"
                  : "Section 1 of 3: Comprehensive Questionnaire"}
              </span>
              <span>1 / 3</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {isFa
                ? "لطفاً این پرسشنامه را با دقت تکمیل کنید. پاسخ‌های شما جهت‌گیری استراتژیک، سبک و ساختار طراحی هویت دیداری برند شما را پایه‌ریزی می‌کند."
                : "Please complete this brief with care. Your inputs form the strategic foundation and visual direction for your visual identity."}
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-10">
            {/* PART 1 */}
            <div className="rounded-3xl border border-foreground/15 bg-background p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-secondary">
                <span>
                  {isFa ? "اطلاعات پایه و هویت برند" : "Basic Information & Brand Identity"}
                </span>
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa
                      ? "نام برند به زبان فارسی (املای دقیق و رسمی) *"
                      : "Brand Name in Persian (Exact spelling) *"}
                  </label>
                  <input
                    type="text"
                    name="brandNameFa"
                    required={!formData.brandNameEn}
                    value={formData.brandNameFa}
                    onChange={handleInputChange}
                    placeholder={isFa ? "مثال: شکرچیان، پژواک..." : "e.g. Shekarchian"}
                    className={inputPillClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa
                      ? "نام برند به زبان انگلیسی (املای رسمی برای بخش دوزبانه) *"
                      : "Brand Name in English (Exact official spelling) *"}
                  </label>
                  <input
                    type="text"
                    name="brandNameEn"
                    required={!formData.brandNameFa}
                    value={formData.brandNameEn}
                    onChange={handleInputChange}
                    placeholder="e.g. Shekarchian, Echo..."
                    className={inputPillClass}
                  />
                </div>

                <div ref={langDropdownRef} className="relative">
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa ? "اولویت با کدام زبان است؟" : "Primary Language Priority"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                    className="flex h-12 w-full items-center justify-between rounded-full border border-foreground/15 bg-background/60 px-5 text-sm font-normal text-foreground transition-all duration-300 hover:border-secondary focus:border-secondary focus:outline-none cursor-pointer"
                  >
                    <span>
                      {formData.primaryLanguage === "فارسی (Persian)"
                        ? isFa
                          ? "فارسی (Persian)"
                          : "Persian"
                        : formData.primaryLanguage === "انگلیسی (English)"
                          ? isFa
                            ? "انگلیسی (English)"
                            : "English"
                          : isFa
                            ? "ارزش برابر هر دو زبان (Equal Weight)"
                            : "Equal Priority"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-foreground/60 transition-transform duration-200 ${
                        isLangDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Options matching site design system */}
                  {isLangDropdownOpen && (
                    <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 z-50 overflow-hidden rounded-3xl border border-secondary/30 bg-background/95 p-2 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-md">
                      {[
                        {
                          value: "فارسی (Persian)",
                          label: isFa ? "فارسی (Persian)" : "Persian",
                        },
                        {
                          value: "انگلیسی (English)",
                          label: isFa ? "انگلیسی (English)" : "English",
                        },
                        {
                          value: "ارزش برابر هر دو زبان (Equal)",
                          label: isFa ? "ارزش برابر هر دو زبان (Equal Weight)" : "Equal Priority",
                        },
                      ].map((opt) => {
                        const isSelected = formData.primaryLanguage === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                primaryLanguage: opt.value,
                              }));
                              setIsLangDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "bg-secondary text-secondary-foreground shadow-sm"
                                : "text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check className="h-4 w-4" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa ? "شعار برند (Slogan / Tagline)" : "Brand Slogan / Tagline"}
                  </label>
                  <input
                    type="text"
                    name="slogan"
                    value={formData.slogan}
                    onChange={handleInputChange}
                    placeholder={
                      isFa
                        ? "آیا شعاری برای قرارگیری کنار لوگو دارید؟"
                        : "Tagline to accompany the logo"
                    }
                    className={inputPillClass}
                  />
                </div>

                {/* Mascot Option Toggle: Matching the rounded-3xl fillet of other fillout forms */}
                <div className="md:col-span-2 rounded-3xl border border-foreground/15 bg-foreground/[0.02] p-6 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {isFa ? "آیا مایل به طراحی مسکات (کاراکتر برند) هستید؟" : "Want a Mascot?"}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isFa
                          ? "طراحی کاراکتر یا شخصیت اختصاصی برای هویت دیداری"
                          : "Design a dedicated mascot character for your brand"}
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.wantMascot}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          wantMascot: !prev.wantMascot,
                        }))
                      }
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.wantMascot ? "bg-secondary" : "bg-foreground/20"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                          formData.wantMascot
                            ? isFa
                              ? "-translate-x-5"
                              : "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {formData.wantMascot && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-3 border-t border-foreground/10"
                    >
                      <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                        {isFa ? "توضیحات مسکات" : "Describe your mascot"}
                      </label>
                      <textarea
                        rows={2}
                        name="mascotDescription"
                        value={formData.mascotDescription}
                        onChange={handleInputChange}
                        placeholder={
                          isFa
                            ? "کاراکتر مد نظرتان را شرح دهید (مثلاً خرس مهربان، ربات آینده‌نگر، پرنده بازیگوش...)"
                            : "Describe your mascot"
                        }
                        className={textareaPillClass}
                      />
                    </motion.div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa ? "حوزه فعالیت و معرفی کوتاه" : "Field of Activity & Brief Description"}
                  </label>
                  <textarea
                    rows={2}
                    name="activity"
                    value={formData.activity}
                    onChange={handleInputChange}
                    placeholder={
                      isFa
                        ? "کسب‌وکار شما دقیقاً چه کالا یا خدماتی ارائه می‌دهد؟"
                        : "What exact products or services does your business offer?"
                    }
                    className={textareaPillClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa ? "تاریخچه‌ی نام برند" : "Name History & Story"}
                  </label>
                  <textarea
                    rows={2}
                    name="nameHistory"
                    value={formData.nameHistory}
                    onChange={handleInputChange}
                    placeholder={
                      isFa
                        ? "چه داستانی یا مفهومی پشت این نام نهفته است؟"
                        : "What is the story or concept behind the brand name?"
                    }
                    className={textareaPillClass}
                  />
                </div>
              </div>
            </div>

            {/* PART 2 */}
            <div className="rounded-3xl border border-foreground/15 bg-background p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-secondary">
                <span>{isFa ? "مخاطبان هدف و بازار" : "Target Audience & Market"}</span>
              </h2>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa
                      ? "مخاطبان اصلی چه کسانی هستند؟"
                      : "Who are your primary target audiences?"}
                  </label>
                  <textarea
                    rows={2}
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder={
                      isFa
                        ? "سن، جنسیت، سطح درآمد، موقعیت جغرافیایی و سبک زندگی آنها"
                        : "Age, gender, income level, geographic location, lifestyle..."
                    }
                    className={textareaPillClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa ? "بررسی رقبا" : "Competitor Analysis"}
                  </label>
                  <textarea
                    rows={2}
                    name="competitors"
                    value={formData.competitors}
                    onChange={handleInputChange}
                    placeholder={
                      isFa
                        ? "۳ رقیب اصلی شما چه کسانی هستند و به نظر شما نقطه قوت و ضعف لوگوی آنها چیست؟"
                        : "Name 3 main competitors and what you consider strengths/weaknesses of their logos"
                    }
                    className={textareaPillClass}
                  />
                </div>
              </div>
            </div>

            {/* PART 3 */}
            <div className="rounded-3xl border border-foreground/15 bg-background p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-secondary">
                <span>{isFa ? "سبک بصری و شخصیت برند" : "Visual Style & Brand Personality"}</span>
              </h2>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa ? "صفات برند" : "Brand Attributes"}
                  </label>
                  <input
                    type="text"
                    name="brandAttributes"
                    value={formData.brandAttributes}
                    onChange={handleInputChange}
                    placeholder={
                      isFa
                        ? "مثلاً: جدی، صمیمی، لوکس، پرانرژی، قابل اعتماد، مینیمال، مدرن یا سنتی"
                        : "e.g. Serious, warm, luxury, energetic, trustworthy, minimal, modern, heritage"
                    }
                    className={inputPillClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa
                      ? "فرم‌های مورد علاقه برای نشان"
                      : "Preferred Shapes & Forms for the Mark"}
                  </label>
                  <textarea
                    rows={2}
                    name="favoriteForms"
                    value={formData.favoriteForms}
                    onChange={handleInputChange}
                    placeholder={
                      isFa
                        ? "لطفاً با دقت مثال بزنید (چه دقیق مثل درخت، پرنده، انسان، ساختمان یا کلی مثل دایره، پنج‌ضلعی، لوزی...)"
                        : "Specific motifs (tree, bird, building, human figure...) or abstract geometry (circle, pentagon, diamond...)"
                    }
                    className={textareaPillClass}
                  />
                </div>
              </div>
            </div>

            {/* PART 4 */}
            <div className="rounded-3xl border border-foreground/15 bg-background p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-secondary">
                <span>
                  {isFa
                    ? "کاربردها و الزامات فنی (مخصوص لوگوی دوزبانه)"
                    : "Technical Requirements & Applications (Bilingual)"}
                </span>
              </h2>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa ? "نحوه چیدمان دوزبان" : "Bilingual Layout Preference"}
                  </label>
                  <input
                    type="text"
                    name="layoutPreference"
                    value={formData.layoutPreference}
                    onChange={handleInputChange}
                    placeholder={
                      isFa
                        ? "مثلاً: متن فارسی در بالا/راست و انگلیسی در پایین/چپ، یا استفاده از نسخه‌های مجزا"
                        : "e.g. Persian on top/right, English below/left, or dedicated standalone versions"
                    }
                    className={inputPillClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa ? "کاربردهای اصلی لوگو" : "Primary Applications"}
                  </label>
                  <input
                    type="text"
                    name="mainApplications"
                    value={formData.mainApplications}
                    onChange={handleInputChange}
                    placeholder={
                      isFa
                        ? "شبکه‌های اجتماعی، وبسایت، تابلو سردر، بسته‌بندی محصول، کارت ویزیت و اوراق اداری..."
                        : "Social media, website, physical signage, packaging, stationery, apparel..."
                    }
                    className={inputPillClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                    {isFa ? "مقیاس‌پذیری" : "Scalability & Micro-sizes"}
                  </label>
                  <input
                    type="text"
                    name="scalability"
                    value={formData.scalability}
                    onChange={handleInputChange}
                    placeholder={
                      isFa
                        ? "آیا لوگو قرار است روی المان‌های بسیار کوچک (آیکون اپ یا خودکار) یا ابعاد بزرگ چاپ شود؟"
                        : "Will it be used in micro sizes (app icon, pen engraving) or huge formats (facades, billboards)?"
                    }
                    className={inputPillClass}
                  />
                </div>
              </div>
            </div>

            {/* PART 5 */}
            <div className="rounded-3xl border border-foreground/15 bg-background p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-secondary">
                <span>{isFa ? "خط قرمزها و سلایق خاص" : "Forbidden Elements & Boundaries"}</span>
              </h2>

              <div>
                <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                  {isFa ? "المان‌های ممنوعه" : "Forbidden Elements"}
                </label>
                <textarea
                  rows={2}
                  name="forbiddenElements"
                  value={formData.forbiddenElements}
                  onChange={handleInputChange}
                  placeholder={
                    isFa
                      ? "چه طرح، نماد، رنگ یا ایده‌ای است که به هیچ عنوان نباید در لوگوی شما استفاده شود؟"
                      : "What symbols, ideas, concepts or colors must NOT appear in your logo under any circumstances?"
                  }
                  className={textareaPillClass}
                />
              </div>
            </div>

            {/* PART 6: Anything I missed? */}
            <div className="rounded-3xl border border-foreground/15 bg-background p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-secondary">
                <span>{isFa ? "موردی هست که از قلم افتاده باشد؟" : "anything I missed ?"}</span>
              </h2>

              <div>
                <label className="block text-xs font-normal tracking-wide text-foreground/80 mb-2">
                  {isFa ? "نکات تکمیلی و توضیحات بیشتر" : "Additional thoughts or requirements"}
                </label>
                <textarea
                  rows={3}
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  placeholder={
                    isFa
                      ? "اگر نکته دیگری لازم می‌دانید اضافه کنید..."
                      : "add more if you think is neccecary"
                  }
                  className={textareaPillClass}
                />
              </div>
            </div>

            {/* Next Step Button & Feedback */}
            <div className="flex flex-col items-center sm:items-end gap-3 w-full">
              <button type="submit" className={`${activeActionBtnClass} w-full sm:w-auto`}>
                <span>{isFa ? "ادامه به بخش مودبورد (Moodboard)" : "Continue to Moodboard"}</span>
                {isFa ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>

              {formError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-medium text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-full px-4 py-2 text-center"
                >
                  {isFa
                    ? "لطفاً برای ادامه، حداقل نام برند (فارسی یا انگلیسی) را در فرم وارد نمایید."
                    : "You have to fill at least the name field to proceed."}
                </motion.p>
              )}
            </div>
          </form>
        </motion.div>
      )}

      {/* SECTION 2: MOODBOARD MULTI-SELECT (40 images - 5 columns x 8 rows) */}
      {step === "moodboard" && (
        <motion.div
          key="moodboard"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="flex w-full flex-col"
        >
          {/* Section banner */}
          <div className="mb-6 rounded-3xl border border-secondary/30 bg-secondary/5 p-6 text-center">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
              <span>
                {isFa ? "بخش دوم از سه بخش: مودبورد دیداری" : "Section 2 of 3: Visual Moodboard"}
              </span>
              <span>2 / 3</span>
            </div>
            <h3
              className={`text-xl font-bold text-foreground ${isFa ? "font-farsi" : "font-display"}`}
            >
              {isFa ? "انتخاب نمونه‌های مودبورد" : "Select Your Moodboard Aesthetics"}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-xl mx-auto">
              {isFa
                ? "از میان تصاویر زیر، نمونه‌هایی که حس، لحن و فرم آن‌ها را به برند خود نزدیک‌تر می‌بینید لمس کنید. حداکثر می‌توانید ۱۵ مورد را انتخاب نمایید."
                : "Select the visual directions that align with your brand's essence and personality. You can select up to 15 images."}
            </p>

            {/* Counter pill */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-xs font-semibold text-secondary">
              <span>
                {isFa
                  ? `${selectedMoodboardIndices.length} از ۱۵ تصویر انتخاب شده`
                  : `${selectedMoodboardIndices.length} of 15 selected`}
              </span>
            </div>
          </div>

          {/* 4 columns Grid (35 images) */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
            {MOODBOARD_GRID_IMAGES.map((item, idx) => {
              const isSelected = selectedMoodboardIndices.includes(idx);
              const isLimitReached = selectedMoodboardIndices.length >= 15 && !isSelected;

              return (
                <div
                  key={item.id}
                  onClick={() => !isLimitReached && handleToggleMoodboardItem(idx)}
                  className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border transition-all duration-300 ${
                    isSelected
                      ? "border-secondary ring-2 ring-secondary/50 shadow-[0_0_20px_color-mix(in_oklab,var(--secondary)_25%,transparent)] bg-secondary/5 scale-[0.98]"
                      : isLimitReached
                        ? "border-foreground/10 opacity-40 cursor-not-allowed"
                        : "border-foreground/15 bg-background hover:border-secondary/60 hover:shadow-lg"
                  }`}
                >
                  <div className="flex h-full w-full items-center justify-center p-3.5">
                    <img
                      src={item.image}
                      alt={item.originalName}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Corner Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-md">
                      <CheckCircle2 className="h-5 w-5 fill-secondary text-secondary-foreground" />
                    </div>
                  )}

                  {/* Number indicator */}
                  <div className="absolute bottom-2 left-2 z-10 rounded-full bg-background/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-foreground/70">
                    #{idx + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-foreground/10 pt-6 w-full">
            <button
              type="button"
              onClick={handleContinueToPickOne}
              className={`${activeActionBtnClass} w-full sm:w-auto sm:order-2`}
            >
              <span>{isFa ? "ادامه به انتخاب جفتی (Pick One)" : "Continue to Pick One"}</span>
              {isFa ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("form");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`${actionBtnClass} w-full sm:w-auto sm:order-1`}
            >
              {isFa ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              <span>{isFa ? "مرحله قبل: پرسشنامه" : "Back: Questionnaire"}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* SECTION 3: PICK ONE (Between 2 Options) */}
      {step === "pickone" && (
        <motion.div
          key="pickone"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="flex w-full flex-col"
        >
          {/* Prominent Guidance Banner: Explains it's about the feeling & style, not the logo/color itself */}
          <div className="mb-6 rounded-3xl border border-secondary/40 bg-secondary/10 p-5 text-center shadow-[0_0_20px_color-mix(in_oklab,var(--secondary)_12%,transparent)]">
            <h3
              className={`text-lg font-bold text-foreground md:text-xl ${
                isFa ? "font-farsi font-bold" : "font-display"
              }`}
            >
              {isFa
                ? "توجه: انتخاب شما بر اساس حس، انرژی و سبک کلی است؛ نه لزوماً خود شکل یا رنگ لوگو!"
                : "Important: Choose based on the overall feeling, mood, and style—not the exact logo symbol or color!"}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              {isFa
                ? "در هر مرحله دو اثر با حس‌های متفاوت به شما نمایش داده می‌شود. لطفاً گزینه‌ای را انتخاب کنید که حال‌وهوا و کاراکتر آن به روح برند مورد نظرتان نزدیک‌تر است."
                : "Between each pair, select the option whose atmosphere, personality, and tone best align with the spirit of your brand."}
            </p>
          </div>

          {/* Progress Header */}
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold">
              <span className="text-secondary">
                {isFa
                  ? `جفت ${currentPairIndex + 1} از ${COUPLED_LOGO_PAIRS.length}`
                  : `Pair ${currentPairIndex + 1} of ${COUPLED_LOGO_PAIRS.length}`}
              </span>
              <span className="text-foreground/60">
                {isFa ? "گزینه الف یا گزینه ب را انتخاب کنید" : "Select Option A or Option B"}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full bg-secondary transition-all duration-300"
                style={{
                  width: `${((currentPairIndex + 1) / COUPLED_LOGO_PAIRS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Options Grid: Option A vs Option B (Side-by-side on phones so both fit on screen simultaneously, spacious on desktop) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-6">
            {/* Option A */}
            <div
              onClick={() => handleSelectChoice("A")}
              className="group relative flex cursor-pointer flex-col items-center rounded-2xl md:rounded-3xl border border-foreground/15 bg-background p-3 sm:p-5 md:p-8 text-center transition-all duration-300 hover:border-secondary hover:shadow-[0_0_25px_color-mix(in_oklab,var(--secondary)_20%,transparent)]"
            >
              <div
                className={`mb-2 sm:mb-4 rounded-full border border-foreground/10 bg-foreground/5 px-2.5 sm:px-5 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/80 ${isFa ? "font-farsi" : ""}`}
              >
                {isFa ? "گزینه الف (A)" : "Option A"}
              </div>

              <div className="my-1 sm:my-2 flex h-28 sm:h-48 md:h-80 w-full items-center justify-center overflow-hidden rounded-xl md:rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
                <img
                  src={COUPLED_LOGO_PAIRS[currentPairIndex].optionA.image}
                  alt={COUPLED_LOGO_PAIRS[currentPairIndex].optionA.brand}
                  className="max-h-full max-w-full object-contain p-2 sm:p-4 md:p-6 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-2 sm:mt-4 md:mt-6 w-full">
                <button
                  type="button"
                  className={`w-full h-9 sm:h-11 md:h-12 px-2 sm:px-4 rounded-full border border-[#EFEFEF] bg-transparent text-xs sm:text-sm font-medium text-[#EFEFEF] transition-all duration-300 group-hover:border-transparent group-hover:bg-secondary group-hover:text-secondary-foreground cursor-pointer ${
                    isFa ? "font-farsi" : ""
                  }`}
                >
                  {isFa ? "انتخاب این سبک" : "Select Style"}
                </button>
              </div>
            </div>

            {/* Option B */}
            <div
              onClick={() => handleSelectChoice("B")}
              className="group relative flex cursor-pointer flex-col items-center rounded-2xl md:rounded-3xl border border-foreground/15 bg-background p-3 sm:p-5 md:p-8 text-center transition-all duration-300 hover:border-secondary hover:shadow-[0_0_25px_color-mix(in_oklab,var(--secondary)_20%,transparent)]"
            >
              <div
                className={`mb-2 sm:mb-4 rounded-full border border-foreground/10 bg-foreground/5 px-2.5 sm:px-5 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/80 ${isFa ? "font-farsi" : ""}`}
              >
                {isFa ? "گزینه ب (B)" : "Option B"}
              </div>

              <div className="my-1 sm:my-2 flex h-28 sm:h-48 md:h-80 w-full items-center justify-center overflow-hidden rounded-xl md:rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
                <img
                  src={COUPLED_LOGO_PAIRS[currentPairIndex].optionB.image}
                  alt={COUPLED_LOGO_PAIRS[currentPairIndex].optionB.brand}
                  className="max-h-full max-w-full object-contain p-2 sm:p-4 md:p-6 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-2 sm:mt-4 md:mt-6 w-full">
                <button
                  type="button"
                  className={`w-full h-9 sm:h-11 md:h-12 px-2 sm:px-4 rounded-full border border-[#EFEFEF] bg-transparent text-xs sm:text-sm font-medium text-[#EFEFEF] transition-all duration-300 group-hover:border-transparent group-hover:bg-secondary group-hover:text-secondary-foreground cursor-pointer ${
                    isFa ? "font-farsi" : ""
                  }`}
                >
                  {isFa ? "انتخاب این سبک" : "Select Style"}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Controls: Centered on mobile */}
          <div className="mt-8 flex w-full items-center justify-center sm:justify-start">
            <button
              type="button"
              onClick={handlePrevPickOne}
              className={`${actionBtnClass} w-full sm:w-auto`}
            >
              {isFa ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              <span>{isFa ? "مرحله قبل: مودبورد" : "Back: Moodboard"}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* SUMMARY */}
      {step === "summary" && (
        <motion.div
          key="summary"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="flex w-full flex-col"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10 text-secondary">
              <Check className="h-7 w-7" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
              {isFa ? "فرم با موفقیت ثبت شد" : "Form Completed"}
            </p>
            <h2
              className={`mt-2 text-3xl font-medium tracking-tight text-foreground md:text-4xl ${
                isFa ? "font-farsi font-bold" : "font-display"
              }`}
            >
              {formData.brandNameFa || formData.brandNameEn}
            </h2>

            {/* Prompt for next steps via WhatsApp / Telegram */}
            <div className="mt-4 rounded-3xl border border-secondary/30 bg-secondary/5 p-6 max-w-xl mx-auto text-center">
              <p
                className={`text-sm leading-relaxed text-foreground ${
                  isFa ? "font-farsi font-medium" : ""
                }`}
              >
                {isFa
                  ? "با تشکر از تکمیل این فرم، اکنون فایل PDF خلاصه را دانلود کرده و آن را در تلگرام یا واتس‌اپ برای من ارسال کنید تا پروژه شما را دقیق‌تر بررسی و گفتگو نماییم."
                  : "Thank you for filling the form, now you should download the PDF and send it via Telegram or WhatsApp to me so we can further discuss your project."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-3xl border border-foreground/15 bg-background p-6 md:p-8">
            {/* Moodboard Selections */}
            {selectedMoodboardIndices.length > 0 && (
              <div>
                <h3
                  className={`mb-3 text-base font-bold text-foreground ${isFa ? "font-farsi" : "font-display"}`}
                >
                  {isFa
                    ? `تصاویر انتخابی شما در مودبورد (${selectedMoodboardIndices.length} مورد)`
                    : `Your Selected Moodboard Images (${selectedMoodboardIndices.length})`}
                </h3>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6">
                  {selectedMoodboardIndices.map((idx) => {
                    const item = MOODBOARD_GRID_IMAGES[idx];
                    if (!item) return null;
                    return (
                      <div
                        key={item.id}
                        className="relative aspect-square overflow-hidden rounded-2xl border border-secondary/30 bg-foreground/[0.02]"
                      >
                        <img
                          src={item.image}
                          alt={(item as any).title || (item as any).label || "Moodboard"}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-[8px] font-bold">
                          ✓
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pick One Choices (User views only brand names) */}
            {selections.length > 0 && (
              <div className="border-t border-foreground/10 pt-6">
                <h3
                  className={`mb-3 text-base font-bold text-foreground ${isFa ? "font-farsi" : "font-display"}`}
                >
                  {isFa
                    ? "گزینه‌های انتخابی شما (Preferred Aesthetics)"
                    : "Your Selected Aesthetics (Pick One)"}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {selections.map((s) => (
                    <div
                      key={s.pairId}
                      className="flex flex-col items-center rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4"
                    >
                      <div className="flex h-28 w-full items-center justify-center overflow-hidden">
                        <img
                          src={s.imageSrc}
                          alt={s.chosenBrand}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="mt-2 text-xs font-semibold text-foreground/80">
                        {isFa
                          ? `جفت ${s.pairId}: ${s.chosenBrand}`
                          : `Pair ${s.pairId}: ${s.chosenBrand}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-foreground/10 pt-6 w-full">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className={`${activeActionBtnClass} w-full sm:w-auto`}
              >
                <Download className="h-4 w-4" />
                <span>{isFa ? "دانلود نسخه PDF خلاصه فرم" : "Download PDF Report"}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors cursor-pointer py-2 sm:py-0 w-full sm:w-auto"
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
