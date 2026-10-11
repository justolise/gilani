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

  const navItems = [
    { icon: Sparkles, label: "Features", color: "text-[#e8924a]", onClick: onOpenFeatures },
    { icon: Play, label: "Demo", color: "text-[#e8924a]", onClick: onOpenDemo },
    { icon: HelpCircle, label: "FAQ", color: "text-blue-400", onClick: onOpenFAQ },
    { icon: GraduationCap, label: "About Us", color: "text-purple-400", onClick: onOpenAbout },
    { icon: MessageCircle, label: "Contact", color: "text-emerald-400", onClick: onOpenContact },
    { icon: ShieldCheck, label: "Privacy", color: "text-cyan-400", onClick: onOpenPrivacy },
    { icon: FileText, label: "Terms", color: "text-amber-400", onClick: onOpenTerms },
  ];

  return (
    <footer className="relative z-40 w-full flex-none border-t border-white/[0.06] bg-[#0a0d14]/95 backdrop-blur-2xl pt-2.5 sm:pt-3.5 pb-[calc(0.625rem+var(--safe-bottom,0px))] sm:pb-3.5 pl-[var(--safe-left,0px)] pr-[var(--safe-right,0px)] transition-all">
      {/* Top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#d4754a]/40 to-transparent" />

      <div className="mx-auto flex flex-col items-center justify-center max-w-7xl px-4 sm:px-8 gap-2">
        {/* Top Row: Navigation Links & Social Icons */}
        <div className="flex w-full items-center justify-between gap-4">
          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ icon: Icon, label, color, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Socials & Action Icons */}
          <div className="flex items-center justify-center lg:justify-end w-full lg:w-auto gap-2.5 sm:gap-3">
            {/* Updates Popover Button */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Subscribe to updates"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.06] px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.1] hover:border-white/[0.18] hover:text-white transition-all cursor-pointer shadow-sm"
                >
                  <Mail className="h-3.5 w-3.5 text-[#e8924a]" />
                  <span>Updates</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                side="top"
                className="w-80 border border-white/[0.08] bg-[#10141f]/98 backdrop-blur-2xl p-4 text-white rounded-2xl shadow-2xl z-50"
              >
                <div className="space-y-3">
                  <div className="font-semibold text-sm text-white">Stay in the Loop</div>
                  <p className="text-xs text-white/50">
                    Get exam tips, new curriculum additions, and study updates.
                  </p>
                  {subscribed ? (
                    <div className="text-xs text-emerald-400 font-medium py-1 flex items-center gap-1.5">
                      <span className="text-base">✓</span> You're subscribed to GilaniAI updates!
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="Your email address..."
                        value={subEmail}
                        onChange={(e) => setSubEmail(e.target.value)}
                        className="flex-1 min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#d4754a]/50 focus:bg-white/[0.06] transition-all"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-[#d4754a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#e8924a] transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Social Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <a
                href="https://wa.me/254102880577"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-[#25D366] hover:scale-110 hover:brightness-110 transition-all p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/gilani_ai?igsh=MXIwYjBoYmhiYWlybg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#E4405F] hover:scale-110 hover:brightness-110 transition-all p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>

              <a
                href="https://www.facebook.com/Gilaniai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#1877F2] hover:scale-110 hover:brightness-110 transition-all p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                </svg>
              </a>
            </div>

            {/* Menu Button */}
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Open resources menu"
                  className="inline-flex items-center justify-center rounded-full border border-[#d4754a]/35 bg-[#d4754a]/12 h-8 w-8 sm:h-9 sm:w-9 text-[#e8924a] hover:bg-[#d4754a]/22 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="top"
                className="w-64 border border-white/[0.08] bg-[#10141f]/98 backdrop-blur-2xl p-2 text-white rounded-2xl shadow-2xl flex flex-col gap-0.5 z-50 animate-in fade-in zoom-in-95"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/[0.07] mb-1">
                  Explore & Resources
                </div>

                {navItems.slice(0, 5).map(({ icon: Icon, label, color, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onClick?.();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-white/[0.07] text-white/75 hover:text-white transition-colors text-left cursor-pointer"
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span>{label}</span>
                  </button>
                ))}

                <div className="my-1 border-t border-white/[0.07]" />

                {navItems.slice(5).map(({ icon: Icon, label, color, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onClick?.();
                    }}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-white/[0.07] text-white/50 hover:text-white/80 transition-colors text-left cursor-pointer"
                  >
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Bottom Row: Version and Copyright */}
        <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs text-white/30">
          <span>© {new Date().getFullYear()} GilaniAI</span>
          <span className="text-white/15">·</span>
          <span className="text-[#e8924a]/70 font-mono font-bold bg-[#d4754a]/8 border border-[#d4754a]/20 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px]">
            v{pkg.version}
          </span>
        </div>
      </div>
    </footer>
  );
}
