import { useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  Send,
  Sparkles,
  HelpCircle,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  FileText,
  Play,
  Menu,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/client/components/ui/popover";
import pkg from "../../../../package.json";

interface FooterProps {
  onOpenFeatures?: () => void;
  onOpenDemo?: () => void;
  onOpenFAQ?: () => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export default function Footer({
  onOpenFeatures,
  onOpenDemo,
  onOpenFAQ,
  onOpenAbout,
  onOpenContact,
  onOpenPrivacy,
  onOpenTerms,
}: FooterProps) {
  const [subEmail, setSubEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubscribed(true);
      toast.success(data.message || "Subscribed to GilaniAI updates!");
      setSubEmail("");
    } catch (err: any) {
      toast.error(err?.message ?? "Subscription failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative z-40 h-14 sm:h-16 w-full flex-none border-t border-white/10 bg-[#101010]/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-8 text-xs sm:text-sm text-white/70">
        {/* Left: Copyright & Nairobi attribution (GilaniAI text removed as requested) */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          <span className="text-white/60 font-medium">&copy; {new Date().getFullYear()}</span>
          <span className="text-white/30">·</span>
          <span className="text-white/75 font-medium">Made in Nairobi 🇰🇪</span>
          <span className="text-white/30 hidden md:inline">·</span>
          <span className="text-white/40 hidden md:inline font-mono text-xs">v{pkg.version}</span>
        </div>

        {/* Center / Desktop Links: All open in interactive modals */}
        <div className="hidden lg:flex items-center gap-6 font-medium text-sm">
          <button
            type="button"
            onClick={onOpenFeatures}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#E28743]" />
            <span>Features</span>
          </button>

          <button
            type="button"
            onClick={onOpenDemo}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5 text-[#E28743]" />
            <span>Demo</span>
          </button>

          <button
            type="button"
            onClick={onOpenFAQ}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
            <span>FAQ</span>
          </button>

          <button
            type="button"
            onClick={onOpenAbout}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <GraduationCap className="h-3.5 w-3.5 text-purple-400" />
            <span>About Us</span>
          </button>

          <button
            type="button"
            onClick={onOpenContact}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Contact</span>
          </button>

          <button
            type="button"
            onClick={onOpenPrivacy}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Privacy</span>
          </button>

          <button
            type="button"
            onClick={onOpenTerms}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span>Terms</span>
          </button>
        </div>

        {/* Right side: Large Visible Buttons + Socials + Complete Menu Popover */}
        <div className="flex items-center gap-3">
          {/* Large Visible Updates Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Subscribe to updates"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/15 hover:border-white/25 transition-all cursor-pointer shadow-sm"
              >
                <Mail className="h-4 w-4 text-[#E28743]" />
                <span className="hidden sm:inline">Updates</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="top"
              className="w-80 border-white/15 bg-[#161413]/98 backdrop-blur-xl p-4 text-white rounded-2xl shadow-2xl"
            >
              <div className="space-y-2">
                <div className="font-semibold text-sm text-white">Stay in the Loop</div>
                <p className="text-xs text-white/60">
                  Get exam tips, new curriculum additions, and study updates.
                </p>
                {subscribed ? (
                  <div className="text-xs text-emerald-400 font-medium py-1">
                    ✓ You're subscribed to GilaniAI updates!
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="mt-2 flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Your email address..."
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      className="flex-1 min-w-0 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C96A3D]/50"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-[#C96A3D] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#E28743] transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Social Icons */}
          <div className="flex items-center gap-2 text-white/70">
            <a
              href="https://wa.me/254102880577"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hover:text-[#25D366] transition-colors p-1.5"
            >
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/gilani_ai?igsh=MXIwYjBoYmhiYWlybg=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-[#E4405F] transition-colors p-1.5"
            >
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>

          {/* All Links Menu Popover (Prominent Button housing all links opening in modals) */}
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Open menu with all links"
                className="inline-flex items-center gap-2 rounded-full border border-[#C96A3D]/40 bg-[#C96A3D]/15 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#E28743] hover:bg-[#C96A3D]/25 transition-all shadow-md cursor-pointer"
              >
                <Menu className="h-4 w-4" />
                <span>Menu</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="top"
              className="w-64 border-white/15 bg-[#161413]/98 backdrop-blur-2xl p-2.5 text-white rounded-2xl shadow-2xl flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1">
                Explore & Resources
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenFeatures?.();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-white/10 text-white/90 hover:text-white transition-colors text-left cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-[#E28743]" />
                <span>Features Overview</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenDemo?.();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-white/10 text-white/90 hover:text-white transition-colors text-left cursor-pointer"
              >
                <Play className="h-4 w-4 text-[#E28743]" />
                <span>Interactive Demo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenFAQ?.();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-white/10 text-white/90 hover:text-white transition-colors text-left cursor-pointer"
              >
                <HelpCircle className="h-4 w-4 text-blue-400" />
                <span>FAQ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenAbout?.();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-white/10 text-white/90 hover:text-white transition-colors text-left cursor-pointer"
              >
                <GraduationCap className="h-4 w-4 text-purple-400" />
                <span>About Us</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenContact?.();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-white/10 text-white/90 hover:text-white transition-colors text-left cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>Contact Support</span>
              </button>

              <div className="my-1 border-t border-white/10"></div>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenPrivacy?.();
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-white/10 text-white/75 hover:text-white transition-colors text-left cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Privacy Policy</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenTerms?.();
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-white/10 text-white/75 hover:text-white transition-colors text-left cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-amber-400" />
                <span>Terms of Service</span>
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </footer>
  );
}
