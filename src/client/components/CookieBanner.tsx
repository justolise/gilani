import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { getClientCookie, setClientCookie } from "@/shared/utils/cookies";

const CONSENT_KEY = "gilani_cookie_consent";
const ANALYTICS_KEY = "gilani_analytics_consent";
export const COOKIE_CONSENT_EVENT = "gilani:cookie-consent-changed";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existingCookie = getClientCookie(CONSENT_KEY);
    const existingLocal = localStorage.getItem(CONSENT_KEY);
    if (existingCookie === null && existingLocal === null) {
      // Small delay to avoid layout jank on first paint
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const setChoice = (accepted: boolean) => {
    localStorage.setItem(CONSENT_KEY, String(accepted));
    localStorage.setItem(ANALYTICS_KEY, String(accepted));
    setClientCookie(CONSENT_KEY, String(accepted), { days: 365 });
    setClientCookie(ANALYTICS_KEY, String(accepted), { days: 365 });
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: { accepted } }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-sm z-9998 animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-white/8 bg-[#10141f]/95 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-4 sm:p-5">
        {/* Top accent */}
        <div className="absolute top-0 left-8 right-8 h-px bg-linear-to-r from-transparent via-[#d4754a]/40 to-transparent rounded-full" />

        <div className="flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 rounded-xl bg-[#d4754a]/15 border border-[#d4754a]/20 flex items-center justify-center">
            <Cookie className="h-4 w-4 text-[#e8924a]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/90 mb-1">Cookie Preferences</p>
            <p className="text-xs text-white/40 leading-relaxed">
              We use cookies for essential functionality and anonymous analytics to improve
              GilaniAI.{" "}
              <a
                href="/privacy"
                className="text-[#e8924a] hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </p>
          </div>

          <button
            onClick={() => setChoice(false)}
            className="shrink-0 p-1 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/6 transition-all cursor-pointer"
            aria-label="Reject cookies and close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setChoice(false)}
            className="flex-1 rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-xs font-semibold text-white/50 hover:bg-white/[0.07] hover:text-white/70 transition-all cursor-pointer active:scale-[0.98]"
          >
            Necessary only
          </button>
          <button
            onClick={() => setChoice(true)}
            className="flex-1 rounded-xl bg-[#d4754a] px-4 py-2 text-xs font-bold text-white hover:bg-[#e8924a] transition-all shadow-[0_2px_12px_rgba(212,117,74,0.3)] hover:shadow-[0_4px_16px_rgba(212,117,74,0.45)] cursor-pointer active:scale-[0.98]"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
