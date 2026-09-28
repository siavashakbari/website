import { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface CustomDatePickerProps {
  value: string; // ISO date string e.g. "2026-09-28"
  onChange: (value: string) => void;
  minDate?: string; // ISO date string e.g. "2026-09-28"
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = [
  { en: "Su", fa: "ی" },
  { en: "Mo", fa: "د" },
  { en: "Tu", fa: "س" },
  { en: "We", fa: "چ" },
  { en: "Th", fa: "پ" },
  { en: "Fr", fa: "ج" },
  { en: "Sa", fa: "ش" },
];

export function CustomDatePicker({
  value,
  onChange,
  minDate,
  placeholder = "Select date... / انتخاب تاریخ",
  className = "",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId();

  // Parse current selected date or fallback to today
  const initialDate = value ? new Date(value + "T00:00:00") : new Date();
  const [viewDate, setViewDate] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate,
  );

  // Sync viewDate when value changes externally
  useEffect(() => {
    if (value) {
      const parsed = new Date(value + "T00:00:00");
      if (!isNaN(parsed.getTime())) {
        setViewDate(parsed);
      }
    }
  }, [value]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  // Determine days in month and starting day offset (0 = Sunday)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Today normalized
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Min date normalized
  const minDateTime = minDate ? new Date(minDate + "T00:00:00").getTime() : today.getTime();

  // Format selected date for display
  const formatDisplay = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSelectDay = (day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const isoString = `${year}-${mm}-${dd}`;
    onChange(isoString);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setViewDate(now);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Pill-shaped Trigger matching Visual Identity Form buttons */}
      <button
        type="button"
        id={uniqueId}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`group flex h-12 w-full items-center justify-between rounded-full border bg-background/60 px-5 text-sm font-normal text-foreground transition-all duration-300 cursor-pointer ${
          isOpen
            ? "border-secondary shadow-[0_0_10px_color-mix(in_oklab,var(--secondary)_30%,transparent)]"
            : "border-foreground/15 hover:border-foreground/30 focus:border-secondary focus:outline-none"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon
            className={`h-4 w-4 shrink-0 transition-colors ${
              value ? "text-secondary" : "text-foreground/40 group-hover:text-secondary"
            }`}
          />
          {value ? (
            <span className="font-medium text-foreground tracking-wide">
              {formatDisplay(value)}
            </span>
          ) : (
            <span className="text-foreground/35 font-thin tracking-wide">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onChange("");
                }
              }}
              title="Clear date"
              className="flex h-5 w-5 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-white/10 hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <span
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              isOpen
                ? "bg-secondary shadow-[0_0_8px_#3febcc]"
                : "bg-foreground/20 group-hover:bg-secondary/60"
            }`}
          />
        </div>
      </button>

      {/* Floating Dark-Glass Calendar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-2 w-full sm:w-[330px] rounded-2xl border border-white/15 bg-[#0F0F0F]/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(63,235,204,0.08)] backdrop-blur-2xl"
          >
            {/* Calendar Header with Navigation */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[#EFEFEF]/70 transition-all hover:border-secondary hover:bg-secondary/15 hover:text-secondary cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="text-center">
                <span className="font-display text-sm font-semibold tracking-wider text-[#EFEFEF]">
                  {MONTH_NAMES[month]} {year}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[#EFEFEF]/70 transition-all hover:border-secondary hover:bg-secondary/15 hover:text-secondary cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center">
              {WEEK_DAYS.map((day) => (
                <div key={day.en} className="flex flex-col items-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                    {day.en}
                  </span>
                  <span className="font-farsi text-[9px] text-[#EFEFEF]/30 leading-none">
                    {day.fa}
                  </span>
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {/* Empty leading padding slots */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-9 w-9" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const thisDate = new Date(year, month, dayNum);
                thisDate.setHours(0, 0, 0, 0);

                const isPast = thisDate.getTime() < minDateTime;
                const isCurrentDay = thisDate.getTime() === today.getTime();

                const mm = String(month + 1).padStart(2, "0");
                const dd = String(dayNum).padStart(2, "0");
                const thisIso = `${year}-${mm}-${dd}`;
                const isSelected = value === thisIso;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs transition-all duration-200 ${
                      isSelected
                        ? "bg-secondary text-secondary-foreground font-bold shadow-[0_0_12px_rgba(63,235,204,0.45)] cursor-pointer"
                        : isPast
                          ? "text-[#EFEFEF]/20 cursor-not-allowed pointer-events-none"
                          : "text-[#EFEFEF] hover:bg-secondary/15 hover:text-secondary cursor-pointer"
                    }`}
                  >
                    <span>{dayNum}</span>

                    {/* Today indicator dot if not selected */}
                    {isCurrentDay && !isSelected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-secondary shadow-[0_0_4px_#3febcc]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer with Today & Clear shortcuts */}
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 px-1 text-xs">
              <button
                type="button"
                onClick={handleSetToday}
                className="font-medium text-secondary hover:underline cursor-pointer transition-colors"
              >
                Today · امروز
              </button>

              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[#EFEFEF]/50 hover:text-red-400 cursor-pointer transition-colors"
                >
                  Clear · پاک‌کردن
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
