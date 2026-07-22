import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

const portfolioBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#EFEFEF] bg-transparent px-5 text-sm font-medium text-[#EFEFEF] shadow-none transition-[background-color,border-color,color,box-shadow] duration-300 ease-out hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)]";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Siavash Akbari" },
      {
        name: "description",
        content:
          "Learn about Siavash Akbari, a multidisciplinary studio for photography, graphic design, and product design.",
      },
      { property: "og:title", content: "About — Siavash Akbari" },
      {
        property: "og:description",
        content:
          "Learn about Siavash Akbari, a multidisciplinary studio for photography, graphic design, and product design.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] w-full items-center justify-center px-6 py-12 md:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-[96rem] flex-col">
        <p className="flex items-center justify-center gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.25em] text-secondary md:text-[0.975rem]">
          <span>About</span>
          <span aria-hidden className="text-[1.1rem] leading-none">
            ·
          </span>
          <span
            lang="fa"
            dir="rtl"
            className="font-farsi text-[1.015625rem] font-semibold normal-case tracking-normal md:text-[1.21875rem]"
          >
            درباره‌ی من
          </span>
        </p>

        <div className="mt-10 flex flex-col gap-12 md:mt-12 md:flex-row md:items-start md:justify-between md:gap-16 lg:gap-24">
          <div className="w-full md:w-[min(100%,42%)]" lang="en" dir="ltr">
            <h1 className="max-w-xl text-left font-display text-[1.68rem] font-medium leading-[1.25] text-foreground md:text-[2.1rem] lg:text-[2.52rem]">
              I am Siavash Akbari;
              <br />
              Designer, photographer, and art director
            </h1>
            <div className="mt-8 max-w-xl space-y-6 text-left text-[1.15rem] leading-relaxed text-muted-foreground">
              <p>
                My path began at thirteen, when I first discovered Photoshop. From the start, I
                refused to limit myself to a single discipline — alongside graphic design, I
                explored photography, cinematography, editing, 3D design, architecture, and product
                design. That journey taught me that design is, above all, a way to solve problems
                and tell a story.
              </p>
              <p>
                In recent years, I&apos;ve collaborated with brands and individuals across fashion,
                furniture, carpets, skincare, food, and publishing. I believe combining experience
                across different design disciplines leads to more creative solutions and brands that
                last.
              </p>
            </div>
          </div>

          <div className="w-full md:w-[min(100%,42%)]" lang="fa" dir="rtl">
            <p className="ml-auto max-w-xl text-right font-farsi text-[1.68rem] font-medium leading-[1.25] text-foreground md:text-[2.1rem] lg:text-[2.52rem]">
              من سیاوش اکبری هستم؛
              <br />
              طراح، عکاس و کارگردان هنری
            </p>
            <div className="mt-8 ml-auto max-w-xl space-y-6 text-right font-farsi text-[1.15rem] leading-relaxed text-muted-foreground">
              <p>
                مسیر من از ۱۳ سالگی و آشنایی با فتوشاپ آغاز شد. از همان اول تلاش کردم خودم رو به یک
                شاخه محدود نکنم و در کنار طراحی گرافیک، عکاسی، فیلم‌برداری، تدوین، طراحی سه‌بعدی،
                معماری و طراحی محصول رو هم تجربه کردم. این مسیر به من یاد داد که طراحی، پیش از هر
                چیز، راهی برای حل مسئله و روایت یک داستان است.
              </p>
              <p>
                در سال‌های اخیر با برندها و افراد مختلفی در حوزه‌هایی مانند مد، مبلمان، فرش، محصولات
                مراقبت از پوست، صنایع غذایی و نشر همکاری کرده‌ام. باور دارم ترکیب تجربه در شاخه‌های
                مختلف طراحی، به خلق راه‌حل‌های خلاقانه‌تر و ساخت برندهایی ماندگار کمک می‌کند.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-3xl grid-cols-3 gap-8 border-t border-border pt-8 text-center">
          <div>
            <p className="font-display text-3xl font-medium text-foreground">10+</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Years</p>
          </div>
          <div>
            <p className="font-display text-3xl font-medium text-foreground">6</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              Disciplines
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-medium text-foreground">30+</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Projects</p>
          </div>
        </div>

        <div className="mt-12 flex justify-center md:mt-14">
          <a
            href="/Siavash-Akbari-Summer-2025.pdf"
            download="Siavash Akbari - Summer 2025.pdf"
            className={portfolioBtnClass}
          >
            <Download className="h-4 w-4" />
            Download My Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
