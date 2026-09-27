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
            moodboardImages,
            selectedMoodboardIndices,
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

          message += `\n*بخش ۲: گالری مودبورد (Moodboard Gallery - انتخاب چندتایی)*\n`;
          if (Array.isArray(selectedMoodboardIndices) && selectedMoodboardIndices.length > 0) {
            message += `• تعداد تصاویر انتخابی مودبورد: ${selectedMoodboardIndices.length} مورد\n`;
            message += `• شماره تصاویر انتخابی: ${selectedMoodboardIndices.map((n: number) => `#${n + 1}`).join(", ")}\n`;
          } else {
            message += `• موردی انتخاب نشده است.\n`;
          }

          message += `\n*بخش ۳: انتخاب جفتی (Pick One / Preferred Aesthetics):*\n`;
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

          // Helper to send a batch of photos as sendMediaGroup (max 10 per call)
          const sendPhotoBatch = async (
            items: { base64: string; label: string }[],
            albumTitle: string
          ) => {
            if (!items.length) return;
            // Split into chunks of max 10
            for (let chunkIdx = 0; chunkIdx < items.length; chunkIdx += 10) {
              const chunk = items.slice(chunkIdx, chunkIdx + 10);
              try {
                const mediaGroupUrl = `https://api.telegram.org/bot${botToken}/sendMediaGroup`;
                const formMedia = new FormData();
                formMedia.append("chat_id", chatId);
                const mediaArray: any[] = [];

                for (let i = 0; i < chunk.length; i++) {
                  const item = chunk[i];
                  if (!item || !item.base64) continue;

                  const attachKey = `photo_${chunkIdx + i}`;
                  const binaryString = atob(item.base64.split(",")[1] || item.base64);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let j = 0; j < binaryString.length; j++) {
                    bytes[j] = binaryString.charCodeAt(j);
                  }
                  const photoBlob = new Blob([bytes], { type: "image/jpeg" });

                  formMedia.append(attachKey, photoBlob, `${attachKey}.jpg`);

                  mediaArray.push({
                    type: "photo",
                    media: `attach://${attachKey}`,
                    caption:
                      i === 0
                        ? `${albumTitle} (${chunkIdx + 1} - ${chunkIdx + chunk.length})`
                        : item.label,
                  });
                }

                if (mediaArray.length > 0) {
                  formMedia.append("media", JSON.stringify(mediaArray));
                  await fetch(mediaGroupUrl, {
                    method: "POST",
                    body: formMedia,
                  });
                }
              } catch (mediaErr) {
                console.error("Failed to send photo batch to Telegram:", mediaErr);
              }
            }
          };

          // 2. Send Moodboard Selected Photos
          if (Array.isArray(moodboardImages) && moodboardImages.length > 0) {
            await sendPhotoBatch(
              moodboardImages.map((img: any, idx: number) => ({
                base64: img.base64,
                label: `مودبورد تصویر شماره ${img.index !== undefined ? img.index + 1 : idx + 1}`,
              })),
              `🎨 تصاویر انتخابی مودبورد — ${brandFa || brandEn}`
            );
          }

          // 3. Send Pick-One Comparison Photos
          if (Array.isArray(chosenImages) && chosenImages.length > 0) {
            await sendPhotoBatch(
              chosenImages.map((img: any) => ({
                base64: img.base64,
                label: `جفت ${img.questionNumber}: گزینه ${img.choice}`,
              })),
              `⚖️ گزینه‌های انتخابی مقایسه‌ای — ${brandFa || brandEn}`
            );
          }

          // 4. Send PDF Document to Telegram
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
