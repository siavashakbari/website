import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  Loader2,
  Send,
  AlertCircle,
  User,
  AtSign,
  FileText,
} from "lucide-react";
import { CustomDatePicker } from "@/components/CustomDatePicker";

export interface ContactFormValues {
  name: string;
  contact: string;
  topic: string;
  description: string;
  preferredDate: string;
  timeSlot: "morning" | "afternoon" | "";
}

const TOPICS = [
  { id: "Photography", labelEn: "Photography", labelFa: "عکاسی" },
  { id: "Graphic Design", labelEn: "Graphic Design", labelFa: "طراحی گرافیک" },
  { id: "Video Creation", labelEn: "Video Creation", labelFa: "تولید ویدیو" },
  {
    id: "Social Media Management",
    labelEn: "Social Media",
    labelFa: "شبکه‌های اجتماعی",
  },
  { id: "Art Direction", labelEn: "Art Direction", labelFa: "مدیریت هنری" },
  {
    id: "General Consulting",
    labelEn: "General Consulting",
    labelFa: "مشاوره عمومی",
  },
] as const;

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormValues>({
    name: "",
    contact: "",
    topic: "Graphic Design",
    description: "",
    preferredDate: "",
    timeSlot: "afternoon",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Minimum date for booking is today
  const todayISO = new Date().toISOString().split("T")[0];

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isNameValid = formData.name.trim().length > 0;
  const isContactValid = formData.contact.trim().length > 0;
  const isTopicValid = formData.topic.trim().length > 0;
  const isDescriptionValid = formData.description.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      name: true,
      contact: true,
      topic: true,
      description: true,
    });

    if (!isNameValid || !isContactValid || !isTopicValid || !isDescriptionValid) {
      setErrorMessage("Please complete all required fields (description min 10 characters).");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send consultation request. Please try again.");
      }

      setStatus("success");
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      setStatus("error");
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setErrorMessage(message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contact: "",
      topic: "Graphic Design",
      description: "",
      preferredDate: "",
      timeSlot: "afternoon",
    });
    setStatus("idle");
    setTouched({});
    setErrorMessage("");
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F0F]/90 p-7 shadow-2xl backdrop-blur-2xl sm:p-10 md:p-12 lg:p-14">
      {/* Decorative ambient gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/10 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/5 blur-[120px]"
      />

      <div className="relative z-10">
        {/* Form Header */}
        <div className="mb-8 flex flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#EFEFEF] sm:text-3xl">
            Consultation Booking
          </h2>
          <span
            lang="fa"
            dir="rtl"
            className="font-farsi text-xl font-bold text-secondary sm:text-2xl"
          >
            رزرو مشاوره
          </span>
        </div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-12 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20 text-secondary shadow-[0_0_30px_rgba(63,235,204,0.35)]">
                <Check className="h-8 w-8 stroke-[2.5]" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold text-[#EFEFEF]">
                Consultation Request Received
              </h3>
              <p lang="fa" dir="rtl" className="mt-2 font-farsi text-lg font-medium text-secondary">
                درخواست شما با موفقیت در استودیو ثبت شد
              </p>
              <p className="mt-3 max-w-md text-sm text-[#EFEFEF]/70">
                Thank you, <span className="font-semibold text-secondary">{formData.name}</span>.
                Your project details have been delivered to Siavash Akbari&apos;s desk. We will
                review your vision and reach out via{" "}
                <span className="font-semibold text-[#EFEFEF]">{formData.contact}</span> shortly.
              </p>

              <button
                type="button"
                onClick={resetForm}
                className="mt-8 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#EFEFEF] bg-transparent px-6 text-sm font-medium text-[#EFEFEF] shadow-none transition-[background-color,border-color,color,box-shadow] duration-300 ease-out hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)] cursor-pointer"
              >
                Send Another Request · ارسال پیام دیگر
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-9" noValidate>
              {/* Row 1: Name and Contact Info */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="contact-name"
                    className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#EFEFEF]/80"
                  >
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-secondary" />
                      Full Name *
                    </span>
                    <span className="font-farsi text-[0.8rem] font-normal normal-case text-[#EFEFEF]/60">
                      نام و نام خانوادگی
                    </span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={() => handleBlur("name")}
                    placeholder="e.g. Elena Rostami"
                    className={`h-14 w-full rounded-full border bg-background/60 px-6 text-sm font-normal text-foreground placeholder:text-foreground/35 placeholder:font-thin focus:border-secondary focus:outline-none transition-all ${
                      touched.name && !isNameValid
                        ? "border-red-500/60 focus:border-red-500"
                        : "border-foreground/15 hover:border-foreground/30 focus:border-secondary"
                    }`}
                  />
                  {touched.name && !isNameValid && (
                    <p className="px-2 text-xs text-red-400">Please provide your full name.</p>
                  )}
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-2">
                  <label
                    htmlFor="contact-channel"
                    className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#EFEFEF]/80"
                  >
                    <span className="flex items-center gap-1.5">
                      <AtSign className="h-3.5 w-3.5 text-secondary" />
                      Contact Coordinates *
                    </span>
                    <span className="font-farsi text-[0.8rem] font-normal normal-case text-[#EFEFEF]/60">
                      ایمیل، تلفن یا آیدی تلگرام
                    </span>
                  </label>
                  <input
                    id="contact-channel"
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    onBlur={() => handleBlur("contact")}
                    placeholder="user@domain.com or @telegram or +98 9..."
                    className={`h-14 w-full rounded-full border bg-background/60 px-6 text-sm font-normal text-foreground placeholder:text-foreground/35 placeholder:font-thin focus:border-secondary focus:outline-none transition-all ${
                      touched.contact && !isContactValid
                        ? "border-red-500/60 focus:border-red-500"
                        : "border-foreground/15 hover:border-foreground/30 focus:border-secondary"
                    }`}
                  />
                  {touched.contact && !isContactValid && (
                    <p className="px-2 text-xs text-red-400">
                      Please provide an email, phone number, or Telegram handle.
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Topic Selection Chips (2 rows of 3 buttons) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#EFEFEF]/80">
                  <span>Topic / Service of Discussion *</span>
                  <span className="font-farsi text-[0.85rem] font-normal normal-case text-[#EFEFEF]/60">
                    زمینه پروژه یا مشاوره
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3.5">
                  {TOPICS.map((topic) => {
                    const isSelected = formData.topic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, topic: topic.id })}
                        className={`group relative inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full px-4 text-sm font-medium transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "border border-transparent bg-secondary text-secondary-foreground shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)]"
                            : "border border-[#EFEFEF]/20 bg-transparent text-[#EFEFEF]/80 hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent)]"
                        }`}
                      >
                        <span className="leading-none">{topic.labelEn}</span>
                        <span
                          dir="rtl"
                          className={`font-farsi text-sm font-bold leading-none translate-y-[1.5px] transition-colors ${
                            isSelected
                              ? "text-secondary-foreground"
                              : "text-[#EFEFEF]/60 group-hover:text-secondary-foreground"
                          }`}
                        >
                          {topic.labelFa}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Preferred Date & Time Window */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Preferred Meeting Date */}
                <div className="space-y-2">
                  <label
                    htmlFor="contact-date"
                    className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#EFEFEF]/80"
                  >
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-secondary" />
                      Preferred Date (Optional)
                    </span>
                    <span className="font-farsi text-[0.8rem] font-normal normal-case text-[#EFEFEF]/60">
                      تاریخ پیشنهادی جلسه
                    </span>
                  </label>
                  <CustomDatePicker
                    value={formData.preferredDate}
                    onChange={(val) => setFormData({ ...formData, preferredDate: val })}
                    minDate={todayISO}
                    placeholder="Select preferred date... / انتخاب تاریخ جلسه"
                  />
                </div>

                {/* Time Slot Window */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#EFEFEF]/80">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-secondary" />
                      Time Window (Optional)
                    </span>
                    <span className="font-farsi text-[0.8rem] font-normal normal-case text-[#EFEFEF]/60">
                      بازه زمانی مطلوب
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: "morning" })}
                      className={`inline-flex h-14 flex-1 items-center justify-center gap-2.5 rounded-full px-4 text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                        formData.timeSlot === "morning"
                          ? "border border-transparent bg-secondary text-secondary-foreground shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)]"
                          : "border border-[#EFEFEF]/20 bg-transparent text-[#EFEFEF]/80 hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent)]"
                      }`}
                    >
                      <span className="leading-none">Morning (9:00 – 12:00)</span>
                      <span
                        dir="rtl"
                        className={`font-farsi text-sm font-bold leading-none translate-y-[1.5px] transition-colors ${
                          formData.timeSlot === "morning"
                            ? "text-secondary-foreground"
                            : "text-[#EFEFEF]/60 group-hover:text-secondary-foreground"
                        }`}
                      >
                        صبح: ۹ تا ۱۲
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: "afternoon" })}
                      className={`inline-flex h-14 flex-1 items-center justify-center gap-2.5 rounded-full px-4 text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                        formData.timeSlot === "afternoon"
                          ? "border border-transparent bg-secondary text-secondary-foreground shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)]"
                          : "border border-[#EFEFEF]/20 bg-transparent text-[#EFEFEF]/80 hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent)]"
                      }`}
                    >
                      <span className="leading-none">Afternoon (17:00 – 19:00)</span>
                      <span
                        dir="rtl"
                        className={`font-farsi text-sm font-bold leading-none translate-y-[1.5px] transition-colors ${
                          formData.timeSlot === "afternoon"
                            ? "text-secondary-foreground"
                            : "text-[#EFEFEF]/60 group-hover:text-secondary-foreground"
                        }`}
                      >
                        عصر: ۱۷ تا ۱۹
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: Project Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#EFEFEF]/80">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-secondary" />
                    Project Description / Inquiries *
                  </span>
                  <span className="font-farsi text-[0.85rem] font-normal normal-case text-[#EFEFEF]/60">
                    شرح پروژه و نیازمندی‌ها
                  </span>
                </div>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onBlur={() => handleBlur("description")}
                  placeholder="Tell us about your brand, scope of work, timeline, and goals... / اهداف، دامنه کار و چشم‌انداز مدنظر خود را توضیح دهید..."
                  className={`min-h-[160px] w-full resize-none rounded-3xl border bg-background/60 p-5 sm:p-6 text-sm font-normal leading-relaxed text-foreground placeholder:text-foreground/35 placeholder:font-thin focus:border-secondary focus:outline-none transition-all ${
                    touched.description && !isDescriptionValid
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-foreground/15 hover:border-foreground/30 focus:border-secondary"
                  }`}
                />
                <div className="flex items-center justify-between px-2 text-[0.75rem] text-[#EFEFEF]/40">
                  <span>Minimum 10 characters</span>
                  <span>{formData.description.trim().length} chars</span>
                </div>
                {touched.description && !isDescriptionValid && (
                  <p className="px-2 text-xs text-red-400">
                    Please provide at least 10 characters explaining your project.
                  </p>
                )}
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA — Pill Shaped with "Submit" label and Visual Identity Form glow */}
              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group relative inline-flex h-14 sm:h-16 w-full sm:w-auto min-w-[240px] items-center justify-center gap-3 rounded-full border border-transparent bg-secondary px-10 text-base font-semibold text-secondary-foreground shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)] transition-all duration-300 ease-out hover:shadow-[0_0_12px_color-mix(in_oklab,var(--secondary)_55%,transparent),0_0_24px_color-mix(in_oklab,var(--secondary)_30%,transparent),0_0_36px_color-mix(in_oklab,var(--secondary)_16%,transparent)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit</span>
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
