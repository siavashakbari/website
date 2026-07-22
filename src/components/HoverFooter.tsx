import { FooterBackgroundGradient } from "@/components/ui/hover-footer";
import { LogoHoverEffect } from "@/components/LogoHoverEffect";

export function HoverFooter() {
  return (
    <footer className="relative h-fit overflow-hidden bg-transparent">
      <div className="relative z-50 hidden px-2 pb-0 pt-4 lg:block">
        <LogoHoverEffect />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
