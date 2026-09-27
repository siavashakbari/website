import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/brand-discovery")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const {
            formData,
            selectedMoodboardIndices,
            moodboardImages,
            selections,
            chosenImages,
            adminPdfBase64,
            userPdfBase64,
            pdfBase64,
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

          // ==========================================
          // MESSAGE 1: Comprehensive Questionnaire
          // ==========================================
          const brandFa = formData?.brandNameFa?.trim() || "مشخص نشده";
          const brandEn = formData?.brandNameEn?.trim() || "مشخص نشده";
          const primaryLang = formData?.primaryLanguage?.trim() || "مشخص نشده";
          const slogan = formData?.slogan?.trim() || "ندارد";
          const activity = formData?.activity?.trim() || "مشخص نشده";
          const nameHistory = formData?.nameHistory?.trim() || "مشخص نشده";

          let mascotAnswer = "خیر";
          if (formData?.wantMascot) {
            mascotAnswer = formData?.mascotDescription?.trim()
              ? `بله — ${formData.mascotDescription.trim()}`
              : "بله";
          }

          const targetAudience = formData?.targetAudience?.trim() || "مشخص نشده";
          const competitors = formData?.competitors?.trim() || "مشخص نشده";
          const brandAttributes = formData?.brandAttributes?.trim() || "مشخص نشده";
          const favoriteForms = formData?.favoriteForms?.trim() || "مشخص نشده";
          const layoutPreference = formData?.layoutPreference?.trim() || "مشخص نشده";
          const mainApplications = formData?.mainApplications?.trim() || "مشخص نشده";
          const scalability = formData?.scalability?.trim() || "مشخص نشده";
          const forbiddenElements = formData?.forbiddenElements?.trim() || "موردی ذکر نشده است";
          const additionalNotes = formData?.additionalNotes?.trim() || "موردی ذکر نشده است";

          let message1 = `Section 1 : Comprehensive Questionnaire\n\n`;

          message1 += `Basic Information & Brand Identity\n`;
          message1 += `[ نام برند به زبان فارسی ] = [ ${brandFa} ]\n`;
          message1 += `[ نام برند به زبان انگلیسی ] = [ ${brandEn} ]\n`;
          message1 += `[ اولویت با کدام زبان است؟ ] = [ ${primaryLang} ]\n`;
          message1 += `[ شعار برند (Slogan / Tagline) ] = [ ${slogan} ]\n`;
          message1 += `[ حوزه فعالیت و معرفی کوتاه ] = [ ${activity} ]\n`;
          message1 += `[ تاریخچه‌ی نام ] = [ ${nameHistory} ]\n`;
          message1 += `[ طراحی مسکات (کاراکتر برند) ] = [ ${mascotAnswer} ]\n\n`;

          message1 += `Target Audience & Market\n`;
          message1 += `[ مخاطبان اصلی چه کسانی هستند؟ ] = [ ${targetAudience} ]\n`;
          message1 += `[ بررسی رقبا ] = [ ${competitors} ]\n\n`;

          message1 += `Visual Style & Brand Personality\n`;
          message1 += `[ صفات برند ] = [ ${brandAttributes} ]\n`;
          message1 += `[ فرم‌های مورد علاقه برای نشان ] = [ ${favoriteForms} ]\n\n`;

          message1 += `Technical Requirements & Applications\n`;
          message1 += `[ نحوه چیدمان دو‌زبان ] = [ ${layoutPreference} ]\n`;
          message1 += `[ کاربردهای اصلی لوگو ] = [ ${mainApplications} ]\n`;
          message1 += `[ مقیاس‌پذیری ] = [ ${scalability} ]\n\n`;

          message1 += `Forbidden Elements & Boundaries\n`;
          message1 += `[ المان‌های ممنوعه و خط قرمزها ] = [ ${forbiddenElements} ]\n\n`;

          message1 += `Anything I missed ?\n`;
          message1 += `[ نکته جامانده یا توضیحات تکمیلی ] = [ ${additionalNotes} ]`;

          // Send Message 1
          const textUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
          await fetch(textUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message1,
            }),
          });

          // Helper to send photos in batches of max 10 via sendMediaGroup
          const sendPhotoBatch = async (
            items: { base64: string; caption?: string }[],
            albumCaption: string
          ) => {
            if (!items.length) return;
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
                    caption: i === 0 ? albumCaption : undefined,
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

          // ==========================================
          // MESSAGE 2: Grouped Moodboard Selected Images
          // ==========================================
          if (Array.isArray(moodboardImages) && moodboardImages.length > 0) {
            await sendPhotoBatch(
              moodboardImages.map((img: any) => ({
                base64: img.base64,
              })),
              "Moodboard Sellected Images"
            );
          } else {
            // If user did not select any moodboard images
            await fetch(textUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: "Moodboard Sellected Images\n(هیچ تصویری انتخاب نشده است)",
              }),
            });
          }

          // ==========================================
          // MESSAGE 3: Coupled Logos Preferences
          // Output: "<محور فارسی> ← <حس انتخابی>  (رفرنس: <برند>)"
          // If empty/skipped, write "مشخص نشده"
          // ==========================================
          const PAIR_CATEGORIES: { id: number; faName: string }[] = [
            { id: 1, faName: "جسور و سنگین / سبک و آزاد (BoldHeavy vs LightFree)" },
            { id: 2, faName: "پرجزئیات / مینیمال و ساده (Detailed vs Minimal)" },
            { id: 3, faName: "تایپوگرافی پرکار / تایپوگرافی تمیز (DetailedType vs SimpleType)" },
            { id: 4, faName: "فونت دست‌نویس و نرم / فونت تیز و برنده (Handwritten vs Sharp)" },
            { id: 5, faName: "فونت مدرن و معاصر / فونت اصیل و سنتی (Modern vs Old)" },
            { id: 6, faName: "فونت لطیف و منحنی / فونت زاویه‌دار و نوک‌تیز (Softy vs Pointy)" },
            { id: 7, faName: "تخت دو‌بعدی / سه‌بعدی سایه‌دار (Flat vs Shaded3D)" },
            { id: 8, faName: "خطی و کانتور / سه‌بعدی و توپر (Line vs 3DFilled)" },
            { id: 9, faName: "سنس‌سریف مدرن / سریف کلاسیک (Sanserif vs Serif)" },
          ];

          let message3 = `Section 3 : Coupled Logos Preferences (Aesthetics & Feelings)\n\n`;

          PAIR_CATEGORIES.forEach((pairCat) => {
            const foundChoice = Array.isArray(selections)
              ? selections.find((s: any) => s.pairId === pairCat.id)
              : null;

            if (foundChoice && foundChoice.chosenFeeling) {
              const brand = foundChoice.chosenBrand || "مشخص نشده";
              const feeling = foundChoice.chosenFeeling || "مشخص نشده";
              message3 += `${pairCat.faName} ← ${feeling}  (رفرنس: ${brand})\n\n`;
            } else {
              message3 += `${pairCat.faName} ← مشخص نشده\n\n`;
            }
          });

          // Send Message 3
          await fetch(textUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message3.trim(),
            }),
          });

          // 4. Send Admin PDF Document to Telegram (Includes strategic feelings)
          const targetPdf = adminPdfBase64 || pdfBase64;
          if (targetPdf) {
            const docUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
            const binaryString = atob(targetPdf);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: "application/pdf" });
            const formDataDoc = new FormData();
            formDataDoc.append("chat_id", chatId);
            formDataDoc.append(
              "caption",
              `📄 گزارش تحلیل جامع هویت دیداری (مخصوص استودیو با احساسات و جزئیات) — ${brandFa || brandEn || "Brand"}`
            );

            const brandClean = (brandEn || brandFa || "Brand").trim().replace(/[^a-zA-Z0-9_\u0600-\u06FF]+/g, "-");
            const d = new Date();
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            const pdfFileName = `${brandClean}-${dateStr}-Visual Identity Brief (Studio).pdf`;

            formDataDoc.append("document", blob, pdfFileName);

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
