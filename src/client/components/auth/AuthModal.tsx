import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Logo } from "@/client/components/ui/logo";
import { supabase } from "@/client/supabase";
import { instantLogin, assignUserRole, checkEmailStatus } from "@/fns/auth-actions.server-fns";
import { CompleteProfileForm } from "@/client/components/auth/CompleteProfileForm";
import { WorkspaceLoader } from "@/client/components/auth/WorkspaceLoader";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Mail, X, Loader2, ArrowRight, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { friendlyError } from "@/shared/utils/async";
import { Capacitor } from "@capacitor/core";

type EmailStatus = "new" | "incomplete" | "registered";

interface AuthModalProps {
  onClose: () => void;
  onAuthStart?: () => void;
  onAuthComplete?: () => void;
}

export function AuthModal({ onClose, onAuthStart, onAuthComplete }: AuthModalProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "email" | "otp" | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpString = otpDigits.join("");

  // ── Cooldown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onGoogle = async () => {
    setLoadingProvider("google");
    try {
      const isNative = typeof window !== "undefined" && Capacitor.isNativePlatform();
      const nativeParam = isNative ? "&app=1" : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback?next=/tutor${nativeParam}`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
      if (error) {
        setLoadingProvider(null);
        toast.error(friendlyError(error, "Google sign-in failed. Please try again."));
      }
    } catch (err) {
      setLoadingProvider(null);
      toast.error("An unexpected error occurred during Google sign-in.");
      console.error(err);
    }
  };

  const routeToDestination = async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) return navigate({ to: "/tutor" as any, search: { new: "1" } as any });

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleRow?.role === "admin") {
      navigate({ to: "/admin/users" as any });
    } else if (roleRow?.role === "teacher") {
      navigate({ to: "/teacher/escalations" as any });
    } else {
      navigate({ to: "/tutor" as any, search: { new: "1" } as any });
    }
  };

  const verifyOtpWithCode = useCallback(
    async (codeToVerify: string) => {
      if (codeToVerify.length !== 6) return toast.error("Please enter the 6-digit code.");
      setLoadingProvider("otp");

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: codeToVerify,
          type: "email",
        });

        if (error || !data.session) {
          setLoadingProvider(null);
          setOtpDigits(["", "", "", "", "", ""]);
          setTimeout(() => otpRefs.current[0]?.focus(), 80);
          return toast.error(
            friendlyError(
              error as { message?: string },
              "The 6-digit code is incorrect or has expired. Please try again.",
            ),
          );
        }

        const userId = data.session.user.id;
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("display_name, onboarding_completed")
          .eq("id", userId)
          .maybeSingle();

        setLoadingProvider(null);
        if (!profileRow?.display_name?.trim() || !profileRow?.onboarding_completed) {
          setShowProfileForm(true);
        } else {
          setShowLoader(true);
          await routeToDestination();
          onAuthComplete?.();
          onClose();
        }
      } catch (err) {
        setLoadingProvider(null);
        toast.error(
          friendlyError(err as { message?: string }, "Failed to verify code. Please try again."),
        );
      }
    },
    [email, onAuthComplete, onClose],
  );

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const next = [...otpDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) next[index + i] = d;
      });
      setOtpDigits(next);
      otpRefs.current[Math.min(index + digits.length, 5)]?.focus();

      const fullCode = next.join("");
      if (fullCode.length === 6 && next.every((d) => d !== "")) {
        verifyOtpWithCode(fullCode);
      }
      return;
    }
    const digit = value.replace(/\D/g, "");
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const fullCode = next.join("");
    if (fullCode.length === 6 && next.every((d) => d !== "")) {
      verifyOtpWithCode(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const next = [...otpDigits];
      next[index - 1] = "";
      setOtpDigits(next);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const onEmailContinue = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return toast.error("Please enter your email address.");
    setLoadingProvider("email");
    onAuthStart?.();

    try {
      const { status } = await checkEmailStatus({ data: { email: cleanEmail } });
      setEmailStatus(status);

      if (status === "registered") {
        // Fully onboarded returning user — instant session, no OTP
        const result = await instantLogin({ data: { email: cleanEmail } });
        const { error } = await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
        if (error) throw error;

        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        if (userId) {
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("display_name, onboarding_completed")
            .eq("id", userId)
            .maybeSingle();
          if (!profileRow?.display_name?.trim() || !profileRow?.onboarding_completed) {
            setLoadingProvider(null);
            setShowProfileForm(true);
            return;
          }
        }

        setShowLoader(true);
        await routeToDestination();
        onAuthComplete?.();
        onClose();
      } else {
        // 'new' or 'incomplete' — always require OTP
        const { error } = await supabase.auth.signInWithOtp({ email: cleanEmail });
        if (error) throw error;
        setOtpSent(true);
        setResendCooldown(60);
        setLoadingProvider(null);
        setTimeout(() => otpRefs.current[0]?.focus(), 80);
      }
    } catch (err) {
      onAuthComplete?.();
      setLoadingProvider(null);
      toast.error(
        friendlyError(err as { message?: string }, "Failed to process login. Please try again."),
      );
    }
  };

  const onResendOtp = async () => {
    if (resendCooldown > 0 || loadingProvider !== null) return;
    setLoadingProvider("email");
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase() });
      if (error) throw error;
      setResendCooldown(60);
      toast.success("A new 6-digit code has been sent.");
    } catch (err) {
      toast.error(
        friendlyError(err as { message?: string }, "Failed to resend code. Please try again."),
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  const onVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    await verifyOtpWithCode(otpString);
  };

  const onSaveProfile = async (
    displayName: string,
    role: "student" | "teacher",
    curriculum?: string,
  ) => {
    try {
      await assignUserRole({ data: { role, displayName: displayName.trim(), curriculum } });
      setShowProfileForm(false);
      setShowLoader(true);
      onAuthComplete?.();
      setTimeout(async () => {
        if (role === "teacher") {
          navigate({ to: "/teacher/escalations" as any });
        } else {
          navigate({ to: "/tutor" as any, search: { new: "1" } as any });
        }
        onClose();
      }, 1600);
    } catch (err) {
      console.error("[AuthModal] Failed to save profile:", err);
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
        onSave={onSaveProfile}
        onCancel={() => {
          setShowProfileForm(false);
          setOtpSent(false);
          setOtpDigits(["", "", "", "", "", ""]);
          setEmailStatus(null);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-[420px] z-10 my-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Outer glow */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#C96A3D]/20 via-transparent to-transparent blur-sm pointer-events-none" />

        <div className="relative rounded-3xl border border-white/[0.08] bg-[#13151f]/95 backdrop-blur-xl shadow-2xl overflow-hidden max-h-[calc(100dvh-2rem)] flex flex-col">
          {/* Top accent bar */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#C96A3D] to-transparent opacity-70 flex-shrink-0" />

          <div className="overflow-y-auto p-6 sm:p-8 space-y-5">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 pt-1">
              <Logo to="/" size="md" className="mx-auto" />
              <div className="space-y-1 pt-1">
                {!otpSent ? (
                  <>
                    <h1 className="font-serif text-2xl font-black text-white tracking-tight">
                      Sign in to GilaniAI
                    </h1>
                    <p className="text-xs sm:text-sm text-white/40">
                      Access your AI tutor, notes, and study tools
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="font-serif text-2xl font-black text-white tracking-tight">
                      Check your email
                    </h1>
                    <p className="text-xs sm:text-sm text-white/40">
                      We sent a 6-digit code to{" "}
                      <span className="text-white/70 font-medium">{email}</span>
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            {!otpSent ? (
              <>
                <button
                  onClick={onGoogle}
                  disabled={loadingProvider !== null}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] py-3.5 text-sm font-semibold text-white hover:bg-white/[0.08] hover:border-white/15 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  {loadingProvider === "google" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                  ) : (
                    <FcGoogle className="h-5 w-5" />
                  )}
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/20">
                    or
                  </span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>

                {/* Email Form */}
                <form onSubmit={onEmailContinue} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="Email address"
                      value={email}
                      maxLength={254}
                      disabled={loadingProvider !== null}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 py-3.5 text-base sm:text-sm text-white placeholder-white/25 focus:border-[#C96A3D]/50 focus:outline-none focus:ring-1 focus:ring-[#C96A3D]/30 focus:bg-white/[0.06] transition-all disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingProvider !== null}
                    className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C96A3D] py-3.5 text-sm font-bold text-white hover:bg-[#D9784A] active:scale-[0.98] disabled:opacity-50 transition-all duration-200 shadow-lg shadow-[#C96A3D]/20 cursor-pointer"
                  >
                    {loadingProvider === "email" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer */}
                <p className="text-center text-[10px] text-white/20 leading-relaxed">
                  By continuing you agree to our{" "}
                  <Link
                    to="/terms"
                    onClick={onClose}
                    className="text-white/35 hover:text-[#E28743] cursor-pointer transition-colors"
                  >
                    Terms
                  </Link>{" "}
                  &{" "}
                  <Link
                    to="/privacy"
                    onClick={onClose}
                    className="text-white/35 hover:text-[#E28743] cursor-pointer transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </>
            ) : (
              <form onSubmit={onVerifyOtp} className="space-y-5">
                {emailStatus === "incomplete" && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      Your previous sign-up wasn't completed. Verify your email to finish setting up
                      your account.
                    </p>
                  </div>
                )}

                {/* 6-box OTP */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 w-full max-w-[340px] mx-auto">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      aria-label={`Digit ${i + 1} of 6`}
                      disabled={loadingProvider !== null}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`flex-1 min-w-0 max-w-[46px] h-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border bg-white/[0.04] text-white transition-all focus:outline-none disabled:opacity-50
                        ${digit ? "border-[#C96A3D]/60 bg-[#C96A3D]/10" : "border-white/[0.10]"}
                        focus:border-[#C96A3D] focus:ring-2 focus:ring-[#C96A3D]/25 focus:bg-white/[0.07]`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loadingProvider !== null || otpString.length !== 6}
                  className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C96A3D] py-3.5 text-sm font-bold text-white hover:bg-[#D9784A] active:scale-[0.98] disabled:opacity-50 transition-all duration-200 shadow-lg shadow-[#C96A3D]/20 cursor-pointer"
                >
                  {loadingProvider === "otp" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpDigits(["", "", "", "", "", ""]);
                      setEmailStatus(null);
                    }}
                    className="inline-flex items-center gap-1.5 py-2.5 px-1 text-xs font-medium text-white/40 hover:text-white/70 active:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={onResendOtp}
                    disabled={loadingProvider !== null || resendCooldown > 0}
                    className="inline-flex items-center gap-1.5 py-2.5 px-1 text-xs font-medium text-white/40 hover:text-[#E28743] active:text-[#E28743] transition-colors disabled:opacity-40 disabled:hover:text-white/40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loadingProvider === "email" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
