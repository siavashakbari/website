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
import { useLocale } from "@/lib/use-locale";
import { readSiteContent, siteField, SITE_SEED } from "@/lib/site-content";

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
  const locale = useLocale();
  const isFa = locale === "fa";
  const tr = (en: string, fa: string) => (isFa ? fa : en);
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
    if (status === "submitting") return;

    setTouched({
      name: true,
      contact: true,
      topic: true,
      description: true,
    });

    if (!isNameValid || !isContactValid || !isTopicValid || !isDescriptionValid) {
      setErrorMessage(
        tr(
          "Please complete all required fields (description min 10 characters).",
          "لطفاً همه فیلدهای ضروری را تکمیل کنید (توضیحات حداقل ۱۰ نویسه).",
        ),
      );
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
        throw new Error(
          data.error ||
            tr(
              "Failed to send consultation request. Please try again.",
              "ارسال درخواست ناموفق بود. لطفاً دوباره تلاش کنید.",
            ),
        );
      }

      setStatus("success");
    } catch (err: unknown) {
      console.error("Consultation delivery failed:", err instanceof Error ? err.name : "unknown");
      setStatus("error");
      const message = isFa
        ? "ارسال درخواست ناموفق بود. لطفاً دوباره تلاش کنید."
        : err instanceof Error
          ? err.message
          : tr(
              "An unexpected error occurred. Please try again.",
              "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
            );
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

  const fallbackEmail =
    readSiteContent()?.contact.links.find((link) => link.id === "email")?.href ||
    SITE_SEED.contact.links.find((link) => link.id === "email")?.href;
  const fallbackMailto = fallbackEmail?.startsWith("mailto:")
    ? `${fallbackEmail.split("?")[0]}?subject=${encodeURIComponent(`Consultation request: ${formData.topic}`)}&body=${encodeURIComponent(`Name: ${formData.name}\nContact: ${formData.contact}\nTopic: ${formData.topic}\nPreferred date: ${formData.preferredDate || "Not specified"}\nTime: ${formData.timeSlot || "Not specified"}\n\n${formData.description}`)}`
    : undefined;

  return (
    <div
      lang={locale}
      dir={isFa ? "rtl" : "ltr"}
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F0F]/90 p-7 shadow-2xl backdrop-blur-2xl sm:p-10 md:p-12 lg:p-14 ${isFa ? "font-farsi" : ""}`}
    >
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
          <h2
            className={`text-2xl font-bold text-[#EFEFEF] sm:text-3xl ${isFa ? "font-farsi" : "font-display tracking-tight"}`}
          >
            {siteField("contact", "formHeading", locale).text}
          </h2>
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
                {tr("Consultation Request Received", "درخواست مشاوره دریافت شد")}
              </h3>
              <p className="mt-3 max-w-md text-sm text-[#EFEFEF]/70">
                {tr("Thank you,", "سپاسگزاریم،")}{" "}
                <span className="font-semibold text-secondary">{formData.name}</span>.
                {tr(
                  "Your project details have been delivered. We will contact you via",
                  "جزئیات پروژه شما دریافت شد. از طریق",
                )}{" "}
                <span className="font-semibold text-[#EFEFEF]">{formData.contact}</span>
                {tr(" shortly.", " با شما تماس می‌گیریم.")}
              </p>

              <button
                type="button"
                onClick={resetForm}
                className="mt-8 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#EFEFEF] bg-transparent px-6 text-sm font-medium text-[#EFEFEF] shadow-none transition-[background-color,border-color,color,box-shadow] duration-300 ease-out hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)] cursor-pointer"
              >
                {tr("Send Another Request", "ارسال درخواست دیگر")}
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
                      {tr("Full Name *", "نام و نام خانوادگی *")}
                    </span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={() => handleBlur("name")}
                    placeholder={tr("e.g. Elena Rostami", "مثلاً النا رستمی")}
                    className={`h-14 w-full rounded-full border bg-background/60 px-6 text-sm font-normal text-foreground placeholder:text-foreground/35 placeholder:font-thin focus:border-secondary focus:outline-none transition-all ${
                      touched.name && !isNameValid
                        ? "border-red-500/60 focus:border-red-500"
                        : "border-foreground/15 hover:border-foreground/30 focus:border-secondary"
                    }`}
                  />
                  {touched.name && !isNameValid && (
                    <p className="px-2 text-xs text-red-400">
                      {tr(
                        "Please provide your full name.",
                        "لطفاً نام و نام خانوادگی خود را وارد کنید.",
                      )}
                    </p>
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
                      {tr("Contact Coordinates *", "راه ارتباطی *")}
                    </span>
                  </label>
                  <input
                    id="contact-channel"
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    onBlur={() => handleBlur("contact")}
                    placeholder={tr(
                      "user@domain.com or @telegram or +98 9...",
                      "ایمیل، آیدی تلگرام یا شماره تلفن",
                    )}
                    className={`h-14 w-full rounded-full border bg-background/60 px-6 text-sm font-normal text-foreground placeholder:text-foreground/35 placeholder:font-thin focus:border-secondary focus:outline-none transition-all ${
                      touched.contact && !isContactValid
                        ? "border-red-500/60 focus:border-red-500"
                        : "border-foreground/15 hover:border-foreground/30 focus:border-secondary"
                    }`}
                  />
                  {touched.contact && !isContactValid && (
                    <p className="px-2 text-xs text-red-400">
                      {tr(
                        "Please provide an email, phone number, or Telegram handle.",
                        "لطفاً ایمیل، شماره تلفن یا آیدی تلگرام را وارد کنید.",
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Topic Selection Chips (2 rows of 3 buttons) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#EFEFEF]/80">
                  <span>{tr("Topic / Service of Discussion *", "موضوع پروژه یا مشاوره *")}</span>
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
                        <span className={isFa ? "font-farsi leading-none" : "leading-none"}>
                          {siteField("contact", `topic.${topic.id}`, locale).text}
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
                      {tr("Preferred Date (Optional)", "تاریخ پیشنهادی (اختیاری)")}
                    </span>
                  </label>
                  <CustomDatePicker
                    value={formData.preferredDate}
                    locale={locale}
                    onChange={(val) => setFormData({ ...formData, preferredDate: val })}
                    minDate={todayISO}
                    placeholder={tr("Select preferred date...", "تاریخ را انتخاب کنید...")}
                  />
                </div>

                {/* Time Slot Window */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#EFEFEF]/80">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-secondary" />
                      {tr("Time Window (Optional)", "بازه زمانی (اختیاری)")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-0.5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: "morning" })}
                      className={`group relative flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-full px-3 transition-all duration-300 cursor-pointer ${
                        formData.timeSlot === "morning"
                          ? "border border-transparent bg-secondary text-secondary-foreground shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)]"
                          : "border border-[#EFEFEF]/20 bg-transparent text-[#EFEFEF]/80 hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent)]"
                      }`}
                    >
                      <span className="text-xs sm:text-[0.8125rem] font-medium leading-tight whitespace-nowrap">
                        {tr("Morning (9:00 – 12:00)", "صبح (۹ تا ۱۲)")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: "afternoon" })}
                      className={`group relative flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-full px-3 transition-all duration-300 cursor-pointer ${
                        formData.timeSlot === "afternoon"
                          ? "border border-transparent bg-secondary text-secondary-foreground shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)]"
                          : "border border-[#EFEFEF]/20 bg-transparent text-[#EFEFEF]/80 hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent)]"
                      }`}
                    >
                      <span className="text-xs sm:text-[0.8125rem] font-medium leading-tight whitespace-nowrap">
                        {tr("Afternoon (17:00 – 19:00)", "عصر (۱۷ تا ۱۹)")}
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
                    {tr("Project Description / Inquiries *", "شرح پروژه و نیازمندی‌ها *")}
                  </span>
                </div>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onBlur={() => handleBlur("description")}
                  placeholder={tr(
                    "Tell us about your brand, scope of work, timeline, and goals...",
                    "اهداف، دامنه کار و چشم‌انداز خود را توضیح دهید...",
                  )}
                  className={`min-h-[160px] w-full resize-none rounded-3xl border bg-background/60 p-5 sm:p-6 text-sm font-normal leading-relaxed text-foreground placeholder:text-foreground/35 placeholder:font-thin focus:border-secondary focus:outline-none transition-all ${
                    touched.description && !isDescriptionValid
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-foreground/15 hover:border-foreground/30 focus:border-secondary"
                  }`}
                />
                <div className="flex items-center justify-between px-2 text-[0.75rem] text-[#EFEFEF]/40">
                  <span>{tr("Minimum 10 characters", "حداقل ۱۰ نویسه")}</span>
                  <span>
                    {formData.description.trim().length} {tr("chars", "نویسه")}
                  </span>
                </div>
                {touched.description && !isDescriptionValid && (
                  <p className="px-2 text-xs text-red-400">
                    {tr(
                      "Please provide at least 10 characters explaining your project.",
                      "لطفاً دست‌کم ۱۰ نویسه درباره پروژه خود بنویسید.",
                    )}
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
              {status === "error" && fallbackMailto && (
                <a
                  href={fallbackMailto}
                  className="inline-flex text-sm font-semibold text-secondary underline underline-offset-4"
                >
                  {tr("Send the request by email instead", "ارسال درخواست از طریق ایمیل")}
                </a>
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
                      <span>{tr("Submitting...", "در حال ارسال...")}</span>
                    </>
                  ) : (
                    <>
                      <span>{tr("Submit", "ارسال")}</span>
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
