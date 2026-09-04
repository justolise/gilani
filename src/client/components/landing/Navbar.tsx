import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "@/client/components/ui/logo";
import { Button } from "@/client/components/ui/button";

interface NavbarProps {
  onOpenFeatures?: () => void;
  onOpenDemo?: () => void;
}

export default function Navbar({ onOpenFeatures, onOpenDemo }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  return (
    <header className="relative z-40 h-14 sm:h-16 w-full flex-none border-b border-white/10 bg-[#121212]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo to="/" size="md" />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-white/70">
          <button
            type="button"
            onClick={onOpenFeatures}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            type="button"
            onClick={onOpenDemo}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Demo
          </button>
          <Link to="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
          <Link to="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link to="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            size="sm"
            className="rounded-full bg-[#C96A3D] px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#E28743] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(201,106,61,0.3)]"
          >
            <Link to="/login" search={{ redirect: undefined, signout: undefined }}>
              Get Started
            </Link>
          </Button>

          {/* Mobile menu trigger */}
          <div ref={menuRef} className="relative md:hidden">
            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileOpen((o) => !o)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {mobileOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 flex flex-col min-w-[200px] bg-[#161413]/98 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-2xl gap-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenFeatures?.();
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 text-xs font-semibold text-white hover:bg-white/10 transition-colors text-left flex items-center justify-between"
                >
                  <span>Features</span>
                  <span className="text-[10px] text-[#E28743] font-mono">Overview</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenDemo?.();
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 text-xs font-semibold text-white hover:bg-white/10 transition-colors text-left flex items-center justify-between"
                >
                  <span>Interactive Demo</span>
                  <span className="text-[10px] text-[#E28743] font-mono">Live</span>
                </button>

                <Link
                  to="/faq"
                  onClick={() => setMobileOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  FAQ
                </Link>

                <Link
                  to="/about"
                  onClick={() => setMobileOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  About Us
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  Contact Support
                </Link>

                <div className="mt-1 border-t border-white/10 pt-2">
                  <Link
                    to="/login"
                    search={{ redirect: undefined, signout: undefined }}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl bg-[#C96A3D]/20 text-xs font-bold text-[#E28743] hover:bg-[#C96A3D]/30 transition-colors text-center"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
