import { Link } from "@tanstack/react-router";
import { Mail, Instagram, Globe } from "lucide-react";
import { FooterBackgroundGradient } from "@/components/ui/hover-footer";
import { LogoHoverEffect } from "@/components/LogoHoverEffect";

export function HoverFooter() {
  return (
    <footer className="relative h-fit overflow-hidden bg-transparent">
      <div className="relative z-40 mx-auto max-w-7xl p-8 md:p-14">
        <div className="grid grid-cols-1 gap-12 pb-12 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-16">
          <div className="flex flex-col space-y-4">
            <span className="text-3xl font-bold text-white">Siavash Akbari</span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Photography, graphic design, and product design — a curated body of
              editorial work made with intention.
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">Navigate</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link to="/" className="transition-colors hover:text-[#3ca2fa]">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/work" className="transition-colors hover:text-[#3ca2fa]">
                  Work
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-[#3ca2fa]">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-[#3ca2fa]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">Disciplines</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link
                  to="/photography"
                  className="transition-colors hover:text-[#3ca2fa]"
                >
                  Photography
                </Link>
              </li>
              <li>
                <Link
                  to="/graphic-design"
                  className="transition-colors hover:text-[#3ca2fa]"
                >
                  Graphic Design
                </Link>
              </li>
              <li>
                <Link
                  to="/product-design"
                  className="transition-colors hover:text-[#3ca2fa]"
                >
                  Product Design
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">Contact</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-[#3ca2fa]" />
                <a
                  href="mailto:Siavakbari@gmail.com"
                  className="transition-colors hover:text-[#3ca2fa]"
                >
                  Siavakbari@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Instagram size={18} className="text-[#3ca2fa]" />
                <a
                  href="https://instagram.com/siavashakbari"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#3ca2fa]"
                >
                  @siavashakbari
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Globe size={18} className="text-[#3ca2fa]" />
                <a
                  href="https://www.behance.net/siavashakbari"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#3ca2fa]"
                >
                  Behance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-t border-gray-700" />

        <div className="flex flex-col items-center justify-between space-y-4 text-sm md:flex-row md:space-y-0">
          <div className="flex space-x-6 text-gray-400">
            <a
              href="https://instagram.com/siavashakbari"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-colors hover:text-[#3ca2fa]"
            >
              <Instagram size={20} />
            </a>
            <a
              href="mailto:Siavakbari@gmail.com"
              aria-label="Email"
              className="transition-colors hover:text-[#3ca2fa]"
            >
              <Mail size={20} />
            </a>
            <a
              href="https://www.behance.net/siavashakbari"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Behance"
              className="transition-colors hover:text-[#3ca2fa]"
            >
              <Globe size={20} />
            </a>
          </div>

          <div className="text-center text-muted-foreground md:text-left">
            <p>&copy; {new Date().getFullYear()} Siavash Akbari. All rights reserved.</p>
          </div>
        </div>
      </div>

      <div className="relative z-50 hidden px-20 pb-10 pt-4 lg:block">
        <LogoHoverEffect />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}