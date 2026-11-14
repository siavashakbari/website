import { createFileRoute } from "@tanstack/react-router";
import {
  sendTelegram,
  telegramMessageIds,
  type TelegramMessageRef,
} from "@/lib/telegram-api.server";

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

          // Validation
          if (
            !name?.trim() ||
            !contact?.trim() ||
            !topic?.trim() ||
            !description?.trim() ||
            description.trim().length < 10
          ) {
            return new Response(
              JSON.stringify({
                success: false,
                error:
                  "Please fill in all required fields (description must be at least 10 characters).",
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const botToken =
            (typeof process !== "undefined" ? process.env.TELEGRAM_BOT_TOKEN : undefined) ||
            (typeof import.meta !== "undefined"
              ? (import.meta as unknown as { env?: Record<string, string> }).env?.TELEGRAM_BOT_TOKEN
              : undefined);

          const chatId =
            (typeof process !== "undefined" ? process.env.TELEGRAM_CHAT_ID : undefined) ||
            (typeof import.meta !== "undefined"
              ? (import.meta as unknown as { env?: Record<string, string> }).env?.TELEGRAM_CHAT_ID
              : undefined);

          if (!botToken || !chatId) {
            console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.");
            return new Response(
              JSON.stringify({ success: false, error: "Telegram delivery is not configured." }),
              { status: 503, headers: { "Content-Type": "application/json" } },
            );
          }

          // Format time slot label
          const timeSlotLabel =
            timeSlot === "morning"
              ? "Morning (صبح — ۹:۰۰ تا ۱۲:۰۰)"
              : timeSlot === "afternoon"
                ? "Afternoon / Evening (عصر — ۱۷:۰۰ تا ۱۹:۰۰)"
                : timeSlot || "Not specified / تعیین نشده";

          const submittedAt = new Date().toLocaleString("fa-IR", {
            timeZone: "Asia/Tehran",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });

          const telegramMessage = `
📬 *New Consultation Request / پیام جدید مشاوره*
━━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${name.trim()}
📞 *Contact:* \`${contact.trim()}\`
🎯 *Topic / Service:* ${topic.trim()}
📅 *Preferred Date:* ${preferredDate?.trim() || "Not specified / تعیین نشده"}
⏰ *Time Window:* ${timeSlotLabel}

📝 *Description:*
${description.trim()}
━━━━━━━━━━━━━━━━━━━━━
⏰ *Submitted At:* ${submittedAt}
`.trim();

          // Plain text prevents customer punctuation from invalidating Telegram Markdown.
          telegramMessageIds(
            await sendTelegram<TelegramMessageRef>(botToken, "sendMessage", {
              chat_id: chatId,
              text: telegramMessage.replace(/[*`]/g, ""),
            }),
          );

          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: unknown) {
          console.error(
            "Contact Telegram delivery failed:",
            err instanceof Error ? err.name : "unknown",
          );
          return new Response(
            JSON.stringify({
              success: false,
              error: "Could not confirm Telegram delivery. Please try again.",
            }),
            {
              status: 502,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
