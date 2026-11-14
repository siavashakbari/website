import { useNavigate } from "@tanstack/react-router";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useLocale } from "@/lib/use-locale";
import { readSiteContent, SITE_SEED, siteField } from "@/lib/site-content";

export function NotFoundPage() {
  const navigate = useNavigate();
  const locale = useLocale();
  const message = siteField("notFound", "message", locale);
  const imageUrl =
    readSiteContent()?.notFound?.imageUrl || SITE_SEED.notFound?.imageUrl || "/404.gif";

  return (
    <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <img
        src={imageUrl}
        alt="404"
        className="mx-auto max-h-[min(62vh,520px)] w-full max-w-[620px] object-contain"
      />
      <h1
        lang={message.lang}
        dir={message.lang === "fa" ? "rtl" : "ltr"}
        className="mt-7 max-w-2xl text-balance text-xl font-semibold leading-relaxed text-foreground md:text-2xl"
      >
        {message.text}
      </h1>
      <div className="mt-7">
        <InteractiveHoverButton
          text={locale === "fa" ? "بازگشت به خانه" : "Go Home"}
          onClick={() => navigate({ to: "/" })}
        />
      </div>
    </main>
  );
}
