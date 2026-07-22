import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Siavash Akbari" },
      {
        name: "description",
        content:
          "Get in touch with Siavash Akbari for photography, graphic design, and product design commissions.",
      },
      { property: "og:title", content: "Contact — Siavash Akbari" },
      {
        property: "og:description",
        content:
          "Get in touch with Siavash Akbari for photography, graphic design, and product design commissions.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-20">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">Contact</p>
          <h1 className="mt-4 font-display text-5xl font-medium leading-[1.1] text-foreground md:text-6xl lg:text-7xl">
            Let’s create something lasting.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Available for commissions, collaborations, and creative partnerships. Tell me about your
            project and I’ll respond within two business days.
          </p>
          <div className="mt-10 space-y-6">
            <a
              href="mailto:Siavakbari@gmail.com"
              className="flex items-center gap-4 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-sm">Siavakbari@gmail.com</span>
            </a>
            <a
              href="tel:+989386087846"
              className="flex items-center gap-4 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Phone className="h-5 w-5 text-primary" />
              <span className="text-sm">+989386087846</span>
            </a>
            <div className="flex items-center gap-4 text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm">Esfahan, Iran</span>
            </div>
          </div>
        </div>

        <form className="space-y-6 bg-card p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-medium uppercase tracking-widest text-foreground">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                className="w-full border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-widest text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="w-full border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-xs font-medium uppercase tracking-widest text-foreground">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              placeholder="Project inquiry"
              className="w-full border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-xs font-medium uppercase tracking-widest text-foreground">
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              placeholder="Tell me about your project..."
              className="w-full resize-none border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <InteractiveHoverButton type="submit" text="Hire Me!" className="w-full" />
        </form>
      </div>
    </div>
  );
}
