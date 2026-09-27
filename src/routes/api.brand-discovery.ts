import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/brand-discovery")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { brandName, contactInfo, archetypeTitle, archetypeDesc, selections, pdfBase64 } = body;

          // Check for Telegram environment variables
          const botToken =
            (typeof process !== "undefined" ? process.env.TELEGRAM_BOT_TOKEN : undefined) ||
            (typeof import.meta !== "undefined" && (import.meta as any).env?.TELEGRAM_BOT_TOKEN);

          const chatId =
            (typeof process !== "undefined" ? process.env.TELEGRAM_CHAT_ID : undefined) ||
            (typeof import.meta !== "undefined" && (import.meta as any).env?.TELEGRAM_CHAT_ID);

          if (!botToken || !chatId) {
            console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured.");
            return new Response(
              JSON.stringify({
                success: true,
                warning: "Telegram bot credentials not configured in environment.",
              }),
              {
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          // Format Telegram message
          let message = `🎯 *New Brand Discovery Submission*\n\n`;
          message += `🏷️ *Brand Name:* ${brandName || "Not provided"}\n`;
          if (contactInfo) {
            message += `👤 *Contact / Notes:* ${contactInfo}\n`;
          }
          message += `✨ *Vibe Archetype:* ${archetypeTitle}\n`;
          message += `📝 *Summary:* ${archetypeDesc}\n\n`;
          message += `📊 *Stylistic Choices:*\n`;

          if (Array.isArray(selections)) {
            selections.forEach((s: any, idx: number) => {
              message += `${idx + 1}. *${s.dimension}:* Option ${s.choice} (${s.selectedOption})\n`;
            });
          }

          // 1. Send Text message to Telegram
          const textUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
          await fetch(textUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "Markdown",
            }),
          });

          // 2. If PDF base64 is provided, send as document
          if (pdfBase64) {
            const docUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
            
            // Convert base64 to binary byte array for FormData
            const binaryString = atob(pdfBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: "application/pdf" });
            const formData = new FormData();
            formData.append("chat_id", chatId);
            formData.append(
              "caption",
              `📄 Brand Vibe Discovery Report — ${brandName || "Brand"}`
            );
            formData.append(
              "document",
              blob,
              `${(brandName || "brand-vibe").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-discovery-report.pdf`
            );

            await fetch(docUrl, {
              method: "POST",
              body: formData,
            });
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error("Error sending to Telegram:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
