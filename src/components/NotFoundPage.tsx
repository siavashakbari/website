import { useNavigate } from "@tanstack/react-router";
import { NotFoundIllustration } from "@/components/NotFoundIllustration";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <NotFoundIllustration className="w-full max-w-xl text-secondary" />
      <h1
        className="mt-4 text-center text-2xl font-medium uppercase tracking-[0.35em] text-foreground md:text-3xl"
        style={{ fontFamily: "Satoshi, system-ui, sans-serif" }}
      >
        NOT FOUND !
      </h1>
      <div className="mt-8">
        <InteractiveHoverButton text="Go Home" onClick={() => navigate({ to: "/" })} />
      </div>
    </div>
  );
}
