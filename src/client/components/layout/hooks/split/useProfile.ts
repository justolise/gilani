import { useEffect, useState } from "react";
import { supabase } from "@/client/supabase";

export function useProfile(userId: string | null | undefined) {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [profileName, setProfileName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [curriculum, setCurriculum] = useState<string | null>("KCSE");
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = async () => {
    if (!userId) {
      setProfileLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("plan, display_name, avatar_url, curriculum, onboarding_completed")
        .eq("id", userId)
        .maybeSingle();
      if (!error && data) {
        if (data.plan) setCurrentPlan(data.plan);
        setProfileName(data.display_name || "");
        setAvatarUrl(data.avatar_url || null);
        if (data.curriculum) setCurriculum(data.curriculum);
        setOnboardingCompleted(Boolean(data.onboarding_completed));
      } else {
        setOnboardingCompleted(false);
      }
    } catch (err) {
      console.error("Failed to load profile for sidebar:", err);
      setOnboardingCompleted(false);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener("custom:profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("custom:profile-updated", handleProfileUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { profileName, avatarUrl, currentPlan, curriculum, onboardingCompleted, profileLoading };
}
