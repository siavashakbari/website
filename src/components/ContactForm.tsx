import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  Loader2,
  Send,
  Sparkles,
  AlertCircle,
  User,
  AtSign,
  FileText,
} from "lucide-react";

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
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F0F]/90 p-6 shadow-2xl backdrop-blur-2xl sm:p-8 md:p-10 lg:p-12">
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
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
              <Sparkles className="h-3 w-3" />
              <span>Consultation Booking · رزرو مشاوره</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#EFEFEF] sm:text-3xl">
              Initiate a Project
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-[#EFEFEF]/60 md:text-right">
            Direct dispatch to studio channel. We respond within 24–48 hours.
            <br />
            <span className="font-farsi text-[#EFEFEF]/50">
              ارسال مستقیم به کانال خصوصی استودیو؛ پاسخ حداکثر ظرف ۴۸ ساعت.
            </span>
          </p>
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
                className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-medium text-[#EFEFEF] transition-all hover:border-secondary hover:bg-secondary/10 hover:text-secondary"
              >
                Send Another Request · ارسال پیام دیگر
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7" noValidate>
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
                    className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-[#EFEFEF] placeholder:text-[#EFEFEF]/25 outline-none transition-all ${
                      touched.name && !isNameValid
                        ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-white/15 focus:border-secondary focus:ring-1 focus:ring-secondary"
                    }`}
                  />
                  {touched.name && !isNameValid && (
                    <p className="text-xs text-red-400">Please provide your full name.</p>
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
                    className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-[#EFEFEF] placeholder:text-[#EFEFEF]/25 outline-none transition-all ${
                      touched.contact && !isContactValid
                        ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-white/15 focus:border-secondary focus:ring-1 focus:ring-secondary"
                    }`}
                  />
                  {touched.contact && !isContactValid && (
                    <p className="text-xs text-red-400">
                      Please provide an email, phone number, or Telegram handle.
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Topic Selection Chips */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#EFEFEF]/80">
                  <span>Topic / Service of Discussion *</span>
                  <span className="font-farsi text-[0.8rem] font-normal normal-case text-[#EFEFEF]/60">
                    زمینه پروژه یا مشاوره
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                  {TOPICS.map((topic) => {
                    const isSelected = formData.topic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, topic: topic.id })}
                        className={`group relative flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                          isSelected
                            ? "border border-secondary bg-secondary text-background shadow-[0_0_15px_rgba(63,235,204,0.35)]"
                            : "border border-white/15 bg-white/[0.02] text-[#EFEFEF]/80 hover:border-white/30 hover:bg-white/[0.05]"
                        }`}
                      >
                        <span
                          className={`text-xs font-medium tracking-tight ${
                            isSelected ? "font-bold text-background" : "text-[#EFEFEF]"
                          }`}
                        >
                          {topic.labelEn}
                        </span>
                        <span
                          dir="rtl"
                          className={`mt-0.5 font-farsi text-[0.72rem] ${
                            isSelected ? "font-semibold text-background/90" : "text-[#EFEFEF]/50"
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
                  <input
                    id="contact-date"
                    type="date"
                    min={todayISO}
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3.5 text-sm text-[#EFEFEF] outline-none transition-all [color-scheme:dark] focus:border-secondary focus:ring-1 focus:ring-secondary"
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

                  <div className="grid grid-cols-2 gap-3 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: "morning" })}
                      className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                        formData.timeSlot === "morning"
                          ? "border border-secondary bg-secondary/15 text-secondary shadow-[0_0_12px_rgba(63,235,204,0.2)]"
                          : "border border-white/15 bg-white/[0.02] text-[#EFEFEF]/70 hover:border-white/30"
                      }`}
                    >
                      <span className="text-xs font-medium">Morning (10:00 – 14:00)</span>
                      <span dir="rtl" className="font-farsi text-[0.7rem] text-[#EFEFEF]/50">
                        صبح: ۱۰:۰۰ تا ۱۴:۰۰
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: "afternoon" })}
                      className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                        formData.timeSlot === "afternoon"
                          ? "border border-secondary bg-secondary/15 text-secondary shadow-[0_0_12px_rgba(63,235,204,0.2)]"
                          : "border border-white/15 bg-white/[0.02] text-[#EFEFEF]/70 hover:border-white/30"
                      }`}
                    >
                      <span className="text-xs font-medium">Afternoon (15:00 – 19:00)</span>
                      <span dir="rtl" className="font-farsi text-[0.7rem] text-[#EFEFEF]/50">
                        عصر: ۱۵:۰۰ تا ۱۹:۰۰
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
                  <span className="font-farsi text-[0.8rem] font-normal normal-case text-[#EFEFEF]/60">
                    شرح پروژه و نیازمندی‌ها
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onBlur={() => handleBlur("description")}
                  placeholder="Tell us about your brand, scope of work, timeline, and goals... / اهداف، دامنه کار و چشم‌انداز مدنظر خود را توضیح دهید..."
                  className={`w-full resize-none rounded-xl border bg-white/[0.03] p-4 text-sm leading-relaxed text-[#EFEFEF] placeholder:text-[#EFEFEF]/25 outline-none transition-all ${
                    touched.description && !isDescriptionValid
                      ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-white/15 focus:border-secondary focus:ring-1 focus:ring-secondary"
                  }`}
                />
                <div className="flex items-center justify-between text-[0.75rem] text-[#EFEFEF]/40">
                  <span>Minimum 10 characters</span>
                  <span>{formData.description.trim().length} chars</span>
                </div>
                {touched.description && !isDescriptionValid && (
                  <p className="text-xs text-red-400">
                    Please provide at least 10 characters explaining your project.
                  </p>
                )}
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary px-8 font-display text-sm font-bold uppercase tracking-wider text-background shadow-[0_0_20px_rgba(63,235,204,0.3)] transition-all hover:shadow-[0_0_30px_rgba(63,235,204,0.5)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Transmitting to Studio Channel...</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Consultation Request</span>
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
