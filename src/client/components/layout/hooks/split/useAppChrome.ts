import { useEffect, useState } from "react";

export function useAppChrome() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    return document.documentElement.classList.contains("dark");
  });
  const [pwaInstallable, setPwaInstallable] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      if (!storedTheme) {
        localStorage.setItem("theme", "dark");
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else {
        const hasDark = storedTheme === "dark";
        document.documentElement.classList.toggle("dark", hasDark);
        setIsDark(hasDark);
      }

      try {
        const raw = localStorage.getItem("gilani_accessibility_prefs");
        if (raw) {
          const parsed = JSON.parse(raw);
          document.documentElement.classList.toggle("high-contrast", !!parsed.highContrast);
          document.documentElement.classList.toggle("reduce-motion", !!parsed.reduceMotion);
          document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
          if (parsed.fontSize === "compact") {
            document.documentElement.classList.add("text-sm");
          } else if (parsed.fontSize === "large") {
            document.documentElement.classList.add("text-lg");
          } else {
            document.documentElement.classList.add("text-base");
          }
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOpenPlans = () => setShowPlans(true);
    window.addEventListener("custom:open-plans", handleOpenPlans);
    return () => window.removeEventListener("custom:open-plans", handleOpenPlans);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onInstallable = () => setPwaInstallable(true);
    const onInstalled = () => setPwaInstallable(false);
    if ((window as any).__pwaInstallPrompt) setPwaInstallable(true);
    window.addEventListener("custom:pwa-installable", onInstallable);
    window.addEventListener("custom:pwa-installed", onInstalled);
    return () => {
      window.removeEventListener("custom:pwa-installable", onInstallable);
      window.removeEventListener("custom:pwa-installed", onInstalled);
    };
  }, []);

  return { isDark, pwaInstallable, setPwaInstallable, showPlans, setShowPlans };
}
