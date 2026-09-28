# Feature Specification & Implementation Guide: Contact Form & Telegram Integration

## 1. Overview & Objective

Transform the existing contact page (`/contact`) into a high-converting, luxury-editorial consultation booking interface. The user will be able to:

1. Provide their identity & contact details (Name, Email/Phone/Telegram ID).
2. Choose a project category / subject of discussion.
3. Provide a project description / inquiry notes.
4. Select a preferred meeting date and time slot (Morning / Afternoon).
5. Submit the form, sending an instant structured, rich Markdown message to your Telegram Bot (leveraging existing `TELEGRAM_BOT_TOKEN` & `TELEGRAM_CHAT_ID` credentials).

---

## 2. Tech Stack & Existing Context

- **Framework**: TanStack Start (React 19 + Vite + Nitro server) with `@tanstack/react-router`.
- **Existing Telegram API pattern**: See `src/routes/api.brand-discovery.ts` for how credentials and `fetch('https://api.telegram.org/bot<TOKEN>/sendMessage')` are handled.
- **Styling**: Tailwind CSS v4, dark luxury theme (`#0F0F0F` background, `#EFEFEF` text, `#3febcc` brand secondary accent), fonts: Satoshi & Peyda.

---

## 3. Form Architecture & Fields

### A. Fields Specification

1. **Full Name** (`name`): Text input, required.
2. **Contact Info** (`contact`): Text input (Email, Phone, or Telegram ID), required.
3. **Topic / Service** (`topic`): Radio buttons or interactive pill chips:
   - Photography (عکاسی)
   - Graphic Design (طراحی گرافیک)
   - Video Creation (تولید ویدیو)
   - Social Media Management (مدیریت شبکه‌های اجتماعی)
   - Art Direction (مدیریت هنری)
   - General Consulting (مشاوره عمومی)
4. **Project Description** (`description`): Textarea, min 10 characters, required.
5. **Preferred Date** (`preferredDate`): Date picker (HTML5 date input or clean custom selector).
6. **Time Window** (`timeSlot`): Single selection:
   - Morning (صبح: ۱۰:۰۰ تا ۱۴:۰۰)
   - Afternoon / Evening (عصر: ۱۵:۰۰ تا ۱۹:۰۰)

---

## 4. Step-by-Step Implementation Steps

### Step 1: Create the Server API Route

Create file: `src/routes/api.contact.ts`

```typescript
import { createFileRoute } from "@tanstack/react-router";

export interface ContactPayload {
  name: string;
  contact: string;
  topic: string;
  description: string;
  preferredDate?: string;
  timeSlot?: "morning" | "afternoon" | string;
}

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as ContactPayload;
          const { name, contact, topic, description, preferredDate, timeSlot } = body;

          if (!name || !contact || !topic || !description) {
            return new Response(
              JSON.stringify({ success: false, error: "Missing required fields" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const botToken =
            (typeof process !== "undefined" ? process.env.TELEGRAM_BOT_TOKEN : undefined) ||
            (typeof import.meta !== "undefined" && (import.meta as any).env?.TELEGRAM_BOT_TOKEN);

          const chatId =
            (typeof process !== "undefined" ? process.env.TELEGRAM_CHAT_ID : undefined) ||
            (typeof import.meta !== "undefined" && (import.meta as any).env?.TELEGRAM_CHAT_ID);

          if (!botToken || !chatId) {
            console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.");
            return new Response(
              JSON.stringify({ success: false, error: "Server credentials missing" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          // Format Telegram message
          const timeSlotLabel =
            timeSlot === "morning"
              ? "Morning (صبح - ۱۰ تا ۱۴)"
              : timeSlot === "afternoon"
                ? "Afternoon (عصر - ۱۵ تا ۱۹)"
                : timeSlot || "Not specified";

          const telegramMessage = `
📬 *New Consultation Request / پیام جدید دریافت شد*
━━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${name}
📞 *Contact:* \`${contact}\`
🎯 *Topic:* ${topic}
📅 *Preferred Date:* ${preferredDate || "Not specified"}
⏰ *Time Window:* ${timeSlotLabel}

📝 *Description:*
${description}
━━━━━━━━━━━━━━━━━━━━━
⏰ *Submitted At:* ${new Date().toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })}
`.trim();

          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: telegramMessage,
              parse_mode: "Markdown",
            }),
          });

          const resData = await response.json();
          if (!resData.ok) {
            throw new Error(resData.description || "Failed to deliver Telegram message");
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("Contact Form API Error:", err);
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
```

---

### Step 2: Build the UI Component

Update `src/routes/contact.tsx` or create a subcomponent `src/components/ContactForm.tsx`.

Key design tokens to respect:

- Dark glass aesthetic: `bg-[#0F0F0F] border border-white/10 focus-within:border-secondary transition-all`.
- Inputs: `bg-white/[0.03] border border-white/15 focus:border-secondary focus:ring-1 focus:ring-secondary rounded-xl px-4 py-3.5 text-foreground placeholder:text-foreground/30 text-sm outline-none`.
- Topic selection pills: Multi-pill toggle buttons with active state `bg-secondary text-background font-semibold shadow-[0_0_15px_rgba(63,235,204,0.3)]` and inactive state `border border-white/15 text-foreground/80 hover:border-white/30`.
- Submit button: Glowing animated button with loading spinner state and success acknowledgement message.

---

## 5. Testing & Validation Checklist

- [ ] Submit valid payload -> Verify message arrives in Telegram with formatted Markdown.
- [ ] Verify validation triggers on missing name, contact, or description.
- [ ] Test mobile responsiveness (320px to 1440px).
- [ ] Verify keyboard tab order and screen reader labels.
