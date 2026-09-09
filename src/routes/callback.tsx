import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/client/supabase";
import { GilaniLoader } from "@/client/components/GilaniLoader";
import { CompleteProfileForm } from "@/client/components/auth/CompleteProfileForm";
import { WorkspaceLoader } from "@/client/components/auth/WorkspaceLoader";
import { toast } from "sonner";

export const Route = createFileRoute("/callback")({
  component: AuthCallback,
  validateSearch: (search: Record<string, unknown>) => ({
    next: (search.next as string) || "/tutor",
    app: (search.app as string) || undefined,
    error: (search.error as string) || undefined,
    error_description: (search.error_description as string) || undefined,
    code: (search.code as string) || undefined,
    type: (search.type as string) || undefined,
  }),
});

function AuthCallback() {
  const navigate = useNavigate();
  const {
    next,
    app: appParam,
    error: urlError,
    error_description,
  } = useSearch({ from: "/callback" });
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const processedRef = useRef(false);

  // Sanitize next — prevent open redirect attacks (reject protocol-relative URLs like //evil.com)
  const safePath = next && next.startsWith("/") && !next.startsWith("//") ? next : "/tutor";

  // Fresh sign-ins should land on the true empty-state home, not wherever
  // tutor.tsx's own logic would otherwise auto-jump a returning visitor to
  // (their most recently active thread) — "new=1" is the existing escape
  // hatch tutor.tsx already checks for that.
  const navigateToDestination = (path: string) => {
    if (path === "/tutor") {
      navigate({ to: "/tutor", search: { new: "1" } } as any);
    } else {
      navigate({ to: path } as any);
    }
  };

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    // Check for error in URL hash (e.g. expired OTP)
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.replace("#", ""));
    const hashError = hashParams.get("error");
    const hashErrorDesc = hashParams.get("error_description");

    if (hashError || urlError) {
      const desc = hashErrorDesc || error_description || "The link is invalid or has expired.";
      setIsError(true);
      setErrorMessage(desc.replace(/\+/g, " "));
      return;
    }

    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const tokenHash = urlParams.get("token_hash");
      const type = urlParams.get("type");

      // PKCE code flow
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setIsError(true);
          setErrorMessage(exchangeError.message || "The link is invalid or has expired.");
          return;
        }
      }

      // token_hash flow
      if (tokenHash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as any,
        });
        if (verifyError) {
          setIsError(true);
          setErrorMessage(verifyError.message || "The link is invalid or has expired.");
          return;
        }
        if (type === "recovery") {
          navigate({ to: "/" });
          return;
        }
        // Email confirmed — fall through to get session below
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setIsError(true);
        setErrorMessage("Something went wrong. Please try again.");
        return;
      }

      if (session) {
        const isApp = appParam === "1" || urlParams.get("app") === "1";
        if (isApp) {
          const queryStr = `access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}&next=${encodeURIComponent(safePath)}`;
          const intentUri = `intent://callback?${queryStr}#Intent;scheme=com.gilaniai.app;package=com.gilaniai.app;end`;
          const schemeUri = `com.gilaniai.app://callback?${queryStr}`;

          const isAndroid =
            typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
          const targetUri = isAndroid ? intentUri : schemeUri;

          try {
            window.location.replace(targetUri);
          } catch (e) {
            console.error("Auto deep link failed:", e);
            try {
              window.location.href = schemeUri;
            } catch {}
          }

          // Automatically proceed to destination in web view / browser without showing any screen
          setTimeout(() => {
            navigateToDestination(safePath);
          }, 800);
          return;
        }

        if (safePath === "/reset-password" || type === "recovery") {
          navigate({ to: "/" });
          return;
        }

        // Check if this user already has a role (existing user)
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        // handle_new_user() DB trigger auto-creates both profiles and user_roles
        // rows synchronously at signup, so roleRow existing is not a valid
        // "already onboarded" signal. onboarding_completed is set explicitly
        // by assignUserRole once the user actually submits their display name.
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("display_name, onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle();

        const needsProfile = !profileRow?.display_name?.trim() || !profileRow?.onboarding_completed;

        if (needsProfile) {
          // New or incomplete user — show complete profile form before proceeding
          const googleName =
            profileRow?.display_name || session.user.user_metadata?.full_name || "";
          setProfileName(googleName);
          setShowProfileForm(true);
          return;
        }

        // Existing user — redirect based on role
        if (roleRow?.role === "admin") {
          navigate({ to: "/admin/users" });
        } else if (roleRow?.role === "teacher") {
          navigate({ to: "/teacher/escalations" });
        } else {
          navigateToDestination(safePath);
        }
        return;
      }
    };

    handleCallback();
  }, []);

  const onSaveProfile = async (
    displayName: string,
    role: "student" | "teacher",
    curriculum?: string,
  ) => {
    try {
      const { assignUserRole } = await import("@/fns/auth-actions.server-fns");
      await assignUserRole({
        data: {
          role,
          displayName: displayName.trim(),
          curriculum,
        },
      });
      setShowProfileForm(false);
      setShowLoader(true);
      // Brief loader then redirect based on role
      setTimeout(() => {
        if (role === "teacher") {
          navigate({ to: "/teacher/escalations" as any });
        } else {
          navigateToDestination(safePath);
        }
      }, 1600);
    } catch (err) {
      console.error("[Callback] Failed to save profile:", err);
      toast.error("Something went wrong. Please try again.");
      throw err;
    }
  };

  if (showLoader) {
    return <WorkspaceLoader />;
  }

  if (showProfileForm) {
    return (
      <CompleteProfileForm
        initialName={profileName}
        missingName={true}
        missingRole={true}
        onSave={onSaveProfile}
      />
    );
  }

  if (isError) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-[#0f1117] text-[#e2e4f0] text-center">
        <div className="max-w-sm w-full p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#131722] shadow-2xl space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center mx-auto text-xl">
            ⚠️
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">Link Expired or Invalid</h2>
            <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed">{errorMessage}</p>
          </div>
          <div className="pt-2">
            <a
              href="/"
              className="inline-flex items-center justify-center w-full rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-semibold py-3 transition-colors min-h-[44px]"
            >
              Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <GilaniLoader />;
}
