import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/brand-discovery")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { brandName, contactInfo, selections, pdfBase64, chosenImages } = body;

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

          // 1. Format clean Q&A Telegram summary message
          let message = `📋 *Visual Identity Form Submission*\n\n`;
          message += `🏷️ *Brand Name:* ${brandName || "Not provided"}\n`;
          if (contactInfo) {
            message += `👤 *Contact / Notes:* ${contactInfo}\n`;
          }
          message += `\n*Question & Answer Choices:*\n`;

          if (Array.isArray(selections)) {
            selections.forEach((s: any, idx: number) => {
              message += `*Q${idx + 1}:* Option ${s.choice}\n`;
            });
          }

          // Send Text message to Telegram
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

          // 2. Send low-quality chosen logo photos to Telegram as a media group / photos
          if (Array.isArray(chosenImages) && chosenImages.length > 0) {
            // We can send each chosen photo or as a media group
            // Send photos with captions
            for (let i = 0; i < chosenImages.length; i++) {
              const imgItem = chosenImages[i];
              if (!imgItem || !imgItem.base64) continue;

              try {
                const photoDocUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
                const binaryString = atob(imgItem.base64.split(",")[1] || imgItem.base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let j = 0; j < binaryString.length; j++) {
                  bytes[j] = binaryString.charCodeAt(j);
                }
                const photoBlob = new Blob([bytes], { type: "image/jpeg" });
                const photoData = new FormData();
                photoData.append("chat_id", chatId);
                photoData.append(
                  "caption",
                  `Q${i + 1} Selected Aesthetic: Option ${imgItem.choice}`
                );
                photoData.append("photo", photoBlob, `q${i + 1}-option-${imgItem.choice}.jpg`);

                await fetch(photoDocUrl, {
                  method: "POST",
                  body: photoData,
                });
              } catch (photoErr) {
                console.error(`Failed to send photo for Q${i + 1}:`, photoErr);
              }
            }
          }

          // 3. Send PDF Document
          if (pdfBase64) {
            const docUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
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
              `📄 Visual Identity Form — ${brandName || "Brand"}`
            );
            formData.append(
              "document",
              blob,
              `${(brandName || "visual-identity").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-form.pdf`
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
