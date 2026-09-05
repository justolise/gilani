import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/client/supabase";
import { toast } from "sonner";
import { friendlyError } from "@/shared/utils/async";
import { persistLang } from "@/client/i18n/I18nContext";
import type { LangCode } from "@/client/i18n/translations";
import { saveUserSettingsFn } from "@/fns/settings.server-fns";

export type TabType =
  | "profile"
  | "tutor"
  | "theme"
  | "plan"
  | "consent"
  | "notifications"
  | "language"
  | "accessibility"
  | "shortcuts"
  | "sessions";

type SettingsServerFns = {
  deleteAccount: (args: { data: { otp: string } }) => Promise<void>;
};

export function applyAccessibilityPrefs(prefs: {
  highContrast?: boolean;
  reduceMotion?: boolean;
  fontSize?: string;
}) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("high-contrast", !!prefs.highContrast);
  document.documentElement.classList.toggle("reduce-motion", !!prefs.reduceMotion);
  document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
  if (prefs.fontSize === "compact") {
    document.documentElement.classList.add("text-sm");
  } else if (prefs.fontSize === "large") {
    document.documentElement.classList.add("text-lg");
  } else {
    document.documentElement.classList.add("text-base");
  }
}

export function useSettings(user: any, serverFns: SettingsServerFns) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Profile Details
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Tutor Preferences
  const [tutorTone, setTutorTone] = useState("encouraging");
  const [tutorStyle, setTutorStyle] = useState("socratic");
  const [tutorDepth, setTutorDepth] = useState("standard");

  // Advanced Preferences (JSONB)
  const [preferences, setPreferences] = useState<Record<string, any>>({
    notificationsEmail: true,
    notificationsPush: false,
    notificationsDigest: true,
    uiLanguage: "en",
    curriculum: "KCSE",
    timezone: "EAT",
    grade: "",
    subjectsEnrolled: [],
    targetGrade: "",
    responseLanguage: "english",
    stepByStepDefault: true,
    mathRendering: "latex",
    autoSaveResponses: false,
    fontSize: "standard",
    reduceMotion: false,
    highContrast: false,
  });

  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    // Immediately persist language changes so the I18n context updates
    if (key === "uiLanguage" && (value === "en" || value === "sw")) {
      persistLang(value as LangCode);
    }
  }, []);

  // Loading States
  const [busy, setBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reauthSending, setReauthSending] = useState(false);

  // Plan & Usage
  const [showPlans, setShowPlans] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [dailyMessageCount, setDailyMessageCount] = useState(0);

  // Account Deletion Flow
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reauthError, setReauthError] = useState("");
  const [reauthOtp, setReauthOtp] = useState("");
  const [reauthSent, setReauthSent] = useState(false);

  // Credentials Update Flow
  const [newEmail, setNewEmail] = useState("");

  // Consent & Theme
  const [isDark, setIsDark] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  // ─── Data Fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setDisplayName(data.display_name || "");
          setAvatarUrl(data.avatar_url || null);
          setDisclaimerAccepted(!!(data as any).disclaimer_accepted);
          setCookieConsent((data as any).cookie_consent !== false);
          setAnalyticsConsent((data as any).analytics_consent !== false);

          if ((data as any).plan) setCurrentPlan((data as any).plan);
          if ((data as any).tutor_tone) setTutorTone((data as any).tutor_tone);
          if ((data as any).tutor_style) setTutorStyle((data as any).tutor_style);
          if ((data as any).tutor_depth) setTutorDepth((data as any).tutor_depth);

          const dbCurriculum =
            (data as any).curriculum || (data as any).preferences?.curriculum || "KCSE";

          if ((data as any).preferences) {
            setPreferences((prev) => ({
              ...prev,
              ...(data as any).preferences,
              curriculum: dbCurriculum,
            }));
          } else {
            setPreferences((prev) => ({
              ...prev,
              curriculum: dbCurriculum,
            }));
            // Fallback: load from localStorage if DB preferences not populated yet
            const local = localStorage.getItem(`gilani_prefs_${user.id}`);
            if (local) {
              try {
                const parsed = JSON.parse(local);
                if (parsed.tutorTone) setTutorTone(parsed.tutorTone);
                if (parsed.tutorStyle) setTutorStyle(parsed.tutorStyle);
                if (parsed.tutorDepth) setTutorDepth(parsed.tutorDepth);
                if (parsed.preferences) {
                  setPreferences((prev) => ({
                    ...prev,
                    ...parsed.preferences,
                    curriculum: dbCurriculum || parsed.preferences?.curriculum || prev.curriculum,
                  }));
                }
              } catch {
                /* ignore */
              }
            }
          }
          setInitialLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    })();

    (async () => {
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("role", "user")
          .gte("created_at", startOfDay.toISOString());

        if (!error && count !== null) {
          setDailyMessageCount(count);
        }
      } catch (err) {
        console.error("Failed to fetch message usage stats:", err);
      }
    })();

    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, [user?.id]);

  // ─── Accessibility CSS Hookup ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const accPrefs = {
      highContrast: !!preferences.highContrast,
      reduceMotion: !!preferences.reduceMotion,
      fontSize: preferences.fontSize || "standard",
    };
    applyAccessibilityPrefs(accPrefs);
    try {
      localStorage.setItem("gilani_accessibility_prefs", JSON.stringify(accPrefs));
    } catch {
      /* ignore */
    }
  }, [preferences.highContrast, preferences.reduceMotion, preferences.fontSize]);

  // ─── Analytics ────────────────────────────────────────────────────────────────
  const fireSettingsEvent = useCallback(
    (action: string, payload?: Record<string, any>) => {
      if (!user?.id) return;
      // Fire-and-forget: no await, never blocks UI
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.access_token) return;
        fetch("/api/settings/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action, payload }),
        }).catch(() => {}); // silently ignore failures
      });
    },
    [user?.id],
  );

  const setActiveTabTracked = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
      fireSettingsEvent("settings.tab_viewed", { tab });
    },
    [fireSettingsEvent],
  );

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const handleProfileSave = async (e?: React.FormEvent, quiet = false) => {
    if (e) e.preventDefault();
    if (!user?.id) return;

    setBusy(true);
    try {
      const activeCurriculum = preferences.curriculum || "KCSE";

      await saveUserSettingsFn({
        data: {
          displayName,
          avatarUrl,
          curriculum: activeCurriculum,
          tutorTone,
          tutorStyle,
          tutorDepth,
          disclaimerAccepted,
          cookieConsent,
          analyticsConsent,
          preferences: {
            ...preferences,
            curriculum: activeCurriculum,
          },
        },
      });

      // Also persist to localStorage for offline resilience
      try {
        localStorage.setItem(
          `gilani_prefs_${user.id}`,
          JSON.stringify({
            displayName,
            avatarUrl,
            tutorTone,
            tutorStyle,
            tutorDepth,
            disclaimerAccepted,
            cookieConsent,
            analyticsConsent,
            preferences: {
              ...preferences,
              curriculum: activeCurriculum,
            },
          }),
        );
      } catch {
        /* ignore */
      }

      // Analytics: log which tab/preferences were saved
      fireSettingsEvent("settings.preferences_saved", {
        tab: activeTab,
        curriculum: activeCurriculum,
        tutorTone,
        tutorStyle,
        tutorDepth,
        preferencesKeys: Object.keys(preferences),
      });

      if (!quiet) toast.success("Settings saved successfully! ✨");
      window.dispatchEvent(new CustomEvent("custom:profile-updated"));
    } catch (err: any) {
      if (!quiet) toast.error(friendlyError(err, "Failed to update profile settings."));
    } finally {
      setBusy(false);
    }
  };

  // ─── Auto-Save Effect ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialLoaded) return;
    const timer = setTimeout(() => {
      handleProfileSave(undefined, true);
    }, 750);
    return () => clearTimeout(timer);
  }, [
    initialLoaded,
    displayName,
    avatarUrl,
    tutorTone,
    tutorStyle,
    tutorDepth,
    preferences,
    disclaimerAccepted,
    cookieConsent,
    analyticsConsent,
  ]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Original photo must be under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 128;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL("image/jpeg", 0.75);
            if (base64.length > 50 * 1024) {
              toast.error("Compressed avatar is too large. Choose a simpler photo.");
              return;
            }
            setAvatarUrl(base64);
            toast.success("Photo updated! ✨");
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTheme = (theme: "light" | "dark") => {
    const nextDark = theme === "dark";
    setIsDark(nextDark);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.toggle("dark", nextDark);
      toast.success(nextDark ? "Dark theme active 🌙" : "Light theme active ☀️", {
        duration: 1500,
      });
    }
  };

  const handleRequestReauth = async () => {
    setReauthSending(true);
    setReauthError("");
    const { error } = await supabase.auth.reauthenticate();
    setReauthSending(false);
    if (error) setReauthError("Failed to send verification code. Please try again.");
    else setReauthSent(true);
  };

  const handleDeleteAccount = async () => {
    if (!reauthOtp) return;
    setReauthError("");
    setDeleting(true);
    try {
      const { error: otpError } = await supabase.auth.updateUser({}, { nonce: reauthOtp } as any);
      if (otpError) {
        setReauthError("Invalid or expired verification code. Please try again.");
        setDeleting(false);
        return;
      }
      await serverFns.deleteAccount({ data: { otp: reauthOtp } });
      await supabase.auth.signOut();
      toast.success("Account deleted successfully.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch (err: any) {
      setReauthError(friendlyError(err, "Failed to delete account."));
      setDeleting(false);
    }
  };

  const handleDisclaimerRevoke = async () => {
    localStorage.removeItem("gilani_disclaimer_accepted");
    setDisclaimerAccepted(false);
    if (user?.id) {
      await saveUserSettingsFn({
        data: { disclaimerAccepted: false },
      }).catch(console.error);
    }
    toast.info(
      "AI Disclaimer consent revoked. You will be prompted to read it again on your next dashboard visit.",
    );
  };

  const toggleConsent = async (type: "cookie" | "analytics", value: boolean) => {
    if (type === "cookie") {
      setCookieConsent(value);
      localStorage.setItem("gilani_cookie_consent", String(value));
      toast.success(value ? "Essential cookies enabled." : "Essential cookies disabled.");
    } else {
      setAnalyticsConsent(value);
      localStorage.setItem("gilani_analytics_consent", String(value));
      toast.success(
        value ? "Anonymous usage tracking enabled." : "Anonymous usage tracking disabled.",
      );
    }
    if (user?.id) {
      await saveUserSettingsFn({
        data: type === "cookie" ? { cookieConsent: value } : { analyticsConsent: value },
      }).catch(console.error);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setEmailBusy(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setEmailBusy(false);
    if (error) toast.error(error.message || "Failed to update email.");
    else {
      toast.success("Confirmation sent to your new email. Please verify it.");
      setNewEmail("");
    }
  };

  return {
    activeTab,
    setActiveTab: setActiveTabTracked,
    displayName,
    setDisplayName,
    avatarUrl,
    setAvatarUrl,
    tutorTone,
    setTutorTone,
    tutorStyle,
    setTutorStyle,
    tutorDepth,
    setTutorDepth,
    preferences,
    updatePreference,
    busy,
    emailBusy,
    deleting,
    reauthSending,
    showPlans,
    setShowPlans,
    currentPlan,
    setCurrentPlan,
    dailyMessageCount,
    showDeleteConfirm,
    setShowDeleteConfirm,
    reauthError,
    setReauthError,
    reauthOtp,
    setReauthOtp,
    reauthSent,
    setReauthSent,
    newEmail,
    setNewEmail,
    isDark,
    setIsDark,
    disclaimerAccepted,
    setDisclaimerAccepted,
    cookieConsent,
    setCookieConsent,
    analyticsConsent,
    setAnalyticsConsent,
    handleProfileSave,
    handlePhotoUpload,
    toggleTheme,
    handleRequestReauth,
    handleDeleteAccount,
    handleDisclaimerRevoke,
    toggleConsent,
    handleEmailChange,
  };
}
