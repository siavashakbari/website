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
            // If in local development, simulate successful delivery so developer can test UI
            if (process.env.NODE_ENV === "development") {
              console.info("[Dev Simulation] Contact message received:", body);
              return new Response(
                JSON.stringify({
                  success: true,
                  simulated: true,
                  message: "Development mode: credentials not set, simulated delivery.",
                }),
                { headers: { "Content-Type": "application/json" } },
              );
            }

            return new Response(
              JSON.stringify({ success: false, error: "Server credentials missing" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          // Format time slot label
          const timeSlotLabel =
            timeSlot === "morning"
              ? "Morning (صبح — ۱۰:۰۰ تا ۱۴:۰۰)"
              : timeSlot === "afternoon"
                ? "Afternoon / Evening (عصر — ۱۵:۰۰ تا ۱۹:۰۰)"
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

          // Attempt delivery with Markdown
          let response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: telegramMessage,
              parse_mode: "Markdown",
            }),
          });

          let resData = await response.json();

          // Resilient fallback: If user text contained special Markdown characters that Telegram rejected, retry with plain text
          if (!resData.ok) {
            console.warn("Markdown delivery failed, retrying plain text:", resData.description);
            const plainMessage = telegramMessage.replace(/[*`]/g, "");
            response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: plainMessage,
              }),
            });
            resData = await response.json();
          }

          if (!resData.ok) {
            throw new Error(resData.description || "Failed to deliver Telegram message");
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: unknown) {
          console.error("Contact Form API Error:", err);
          const message = err instanceof Error ? err.message : String(err);
          return new Response(JSON.stringify({ success: false, error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
