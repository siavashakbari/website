import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/brand-discovery")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const {
            formData,
            selections,
            pdfBase64,
            chosenImages,
          } = body;

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

          // 1. Format clean detailed summary for Telegram
          const brandFa = formData?.brandNameFa || "-";
          const brandEn = formData?.brandNameEn || "-";
          const primaryLang = formData?.primaryLanguage || "-";

          let message = `📋 *فرم هویت بصری و طراحی لوگو*\n`;
          message += `*Visual Identity Form Submission*\n\n`;

          message += `*بخش ۱: اطلاعات پایه و هویت برند*\n`;
          message += `• نام فارسی: ${brandFa}\n`;
          message += `• English Name: ${brandEn}\n`;
          message += `• زبان اولویت: ${primaryLang}\n`;
          if (formData?.slogan) message += `• شعار برند: ${formData.slogan}\n`;
          if (formData?.activity) message += `• حوزه فعالیت: ${formData.activity}\n`;
          if (formData?.nameHistory) message += `• تاریخچه نام: ${formData.nameHistory}\n`;

          message += `\n*بخش ۲: مخاطبان هدف و بازار*\n`;
          if (formData?.targetAudience) message += `• مخاطبان اصلی: ${formData.targetAudience}\n`;
          if (formData?.competitors) message += `• رقبا: ${formData.competitors}\n`;

          message += `\n*بخش ۳: سبک بصری و شخصیت برند*\n`;
          if (formData?.brandAttributes) message += `• صفات برند: ${formData.brandAttributes}\n`;
          if (formData?.favoriteForms) message += `• فرم‌های مورد علاقه نشان: ${formData.favoriteForms}\n`;

          message += `\n*بخش ۴: کاربردها و الزامات فنی*\n`;
          if (formData?.layoutPreference) message += `• چیدمان دوزبانه: ${formData.layoutPreference}\n`;
          if (formData?.mainApplications) message += `• کاربردهای اصلی: ${formData.mainApplications}\n`;
          if (formData?.scalability) message += `• مقیاس‌پذیری: ${formData.scalability}\n`;

          message += `\n*بخش ۵: خط قرمزها و سلایق خاص*\n`;
          if (formData?.forbiddenElements) message += `• المان‌های ممنوعه: ${formData.forbiddenElements}\n`;

          message += `\n*نمونه‌های الهام‌بخش (Moodboard):*\n`;
          if (Array.isArray(selections)) {
            selections.forEach((s: any, idx: number) => {
              message += `• جفت ${idx + 1}: گزینه ${s.choice} (Option ${s.choice})\n`;
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

          // 2. Send low-quality chosen logo photos to Telegram
          if (Array.isArray(chosenImages) && chosenImages.length > 0) {
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
                  `جفت ${i + 1} / Pair ${i + 1} — انتخابی: Option ${imgItem.choice}`
                );
                photoData.append("photo", photoBlob, `pair-${i + 1}-option-${imgItem.choice}.jpg`);

                await fetch(photoDocUrl, {
                  method: "POST",
                  body: photoData,
                });
              } catch (photoErr) {
                console.error(`Failed to send photo for pair ${i + 1}:`, photoErr);
              }
            }
          }

          // 3. Send PDF Document to Telegram
          if (pdfBase64) {
            const docUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
            const binaryString = atob(pdfBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: "application/pdf" });
            const formDataDoc = new FormData();
            formDataDoc.append("chat_id", chatId);
            formDataDoc.append(
              "caption",
              `📄 گزارش فرم هویت بصری — ${brandFa || brandEn || "Brand"}`
            );
            const safeName = (brandEn || brandFa || "visual-identity")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-");
            formDataDoc.append("document", blob, `${safeName || "visual-identity"}-brief.pdf`);

            await fetch(docUrl, {
              method: "POST",
              body: formDataDoc,
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
