import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Logo } from "@/client/components/ui/logo";
import { supabase } from "@/client/supabase";
import { assignUserRole, checkEmailStatus } from "@/fns/auth-actions.server-fns";
import { CompleteProfileForm } from "@/client/components/auth/CompleteProfileForm";
import { WorkspaceLoader } from "@/client/components/auth/WorkspaceLoader";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Mail, Loader2, ArrowRight, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { friendlyError } from "@/shared/utils/async";
import { Capacitor } from "@capacitor/core";

type Step = "email" | "otp" | "profile";
type EmailStatus = "new" | "incomplete" | "registered";

export function AuthForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "email" | "otp" | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Cooldown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const otpString = otp.join("");

  const routeToDestination = useCallback(async () => {
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
  }, [navigate]);

  const sendOtp = async (targetEmail: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email: targetEmail });
    if (error) throw error;
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
          setOtp(["", "", "", "", "", ""]);
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
        }
      } catch (err) {
        setLoadingProvider(null);
        toast.error(
          friendlyError(err as { message?: string }, "Failed to verify code. Please try again."),
        );
      }
    },
    [email, routeToDestination],
  );

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const next = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) next[index + i] = d;
      });
      setOtp(next);
      const focusIdx = Math.min(index + digits.length, 5);
      otpRefs.current[focusIdx]?.focus();

      const fullCode = next.join("");
      if (fullCode.length === 6 && next.every((d) => d !== "")) {
        verifyOtpWithCode(fullCode);
      }
      return;
    }

    const digit = value.replace(/\D/g, "");
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const fullCode = next.join("");
    if (fullCode.length === 6 && next.every((d) => d !== "")) {
      verifyOtpWithCode(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const onGoogle = async () => {
    setLoadingProvider("google");
    try {
      const isNative = typeof window !== "undefined" && Capacitor.isNativePlatform();
      const nativeParam = isNative ? "&app=1" : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback?next=/tutor${nativeParam}`,
          queryParams: { access_type: "offline", prompt: "select_account" },
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

  const onEmailContinue = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return toast.error("Please enter your email address.");
    setLoadingProvider("email");

    try {
      const { status } = await checkEmailStatus({ data: { email: cleanEmail } });
      setEmailStatus(status);

      await sendOtp(cleanEmail);
      setStep("otp");
      setResendCooldown(60);
      setLoadingProvider(null);
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } catch (err) {
      setLoadingProvider(null);
      toast.error(
        friendlyError(err as { message?: string }, "Failed to process login. Please try again."),
      );
    }
  };

  const onVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    await verifyOtpWithCode(otpString);
  };

  const onResendOtp = async () => {
    if (resendCooldown > 0 || loadingProvider !== null) return;
    setLoadingProvider("email");
    try {
      await sendOtp(email.trim().toLowerCase());
      setResendCooldown(60);
      toast.success("A new 6-digit code has been sent to your email.");
    } catch (err) {
      toast.error(
        friendlyError(err as { message?: string }, "Failed to resend code. Please try again."),
      );
    } finally {
      setLoadingProvider(null);
    }
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
      setTimeout(async () => {
        if (role === "teacher") {
          navigate({ to: "/teacher/escalations" as any });
        } else {
          navigate({ to: "/tutor" as any, search: { new: "1" } as any });
        }
      }, 1600);
    } catch (err) {
      console.error("[AuthForm] Failed to save profile:", err);
      toast.error("Something went wrong. Please try again.");
      throw err;
    }
  };

  // ── render guards ─────────────────────────────────────────────────────────

  if (showLoader) return <WorkspaceLoader />;
  if (showProfileForm) {
    return (
      <CompleteProfileForm
        onSave={onSaveProfile}
        onCancel={() => {
          setShowProfileForm(false);
          setStep("email");
          setOtp(["", "", "", "", "", ""]);
          setEmailStatus(null);
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto animate-in-scale">
      <div className="relative rounded-3xl border border-white/[0.07] bg-[#10141f]/95 backdrop-blur-2xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden card-shine">
        {/* Top accent bar — gradient glow */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#d4754a]/70 to-transparent" />

        {/* Subtle inner glow at top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#d4754a]/[0.04] to-transparent pointer-events-none" />

        <div className="relative p-7 sm:p-9 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2.5 pt-1">
            <Logo to="/" size="md" className="mx-auto" />
            <div className="space-y-1 pt-1">
              {step === "email" && (
                <>
                  <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
                    Welcome back
                  </h1>
                  <p className="text-sm text-white/35">Sign in or create your account.</p>
                </>
              )}
              {step === "otp" && (
                <>
                  <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
                    Check your email
                  </h1>
                  <p className="text-sm text-white/35">
                    We sent a 6-digit code to{" "}
                    <span className="text-white/65 font-medium">{email}</span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ── Step: Email ── */}
          {step === "email" && (
            <>
              {/* Google OAuth */}
              <button
                onClick={onGoogle}
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] py-3.5 text-sm font-semibold text-white/90 hover:bg-white/[0.08] hover:border-white/[0.14] disabled:opacity-50 transition-all duration-200 cursor-pointer active:scale-[0.99]"
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

              {/* Email form */}
              <form onSubmit={onEmailContinue} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email address"
                    value={email}
                    maxLength={254}
                    disabled={loadingProvider !== null}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] pl-10 pr-4 py-3.5 text-base sm:text-sm text-white placeholder-white/20 focus:border-[#d4754a]/45 focus:outline-none focus:ring-1 focus:ring-[#d4754a]/25 focus:bg-white/[0.05] transition-all disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingProvider !== null}
                  className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-[#d4754a] py-3.5 text-sm font-bold text-white hover:bg-[#e8924a] active:scale-[0.98] disabled:opacity-50 transition-all duration-200 shadow-[0_4px_24px_rgba(212,117,74,0.3)] hover:shadow-[0_6px_32px_rgba(212,117,74,0.45)] cursor-pointer"
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
                  className="text-white/35 hover:text-[#e8924a] cursor-pointer transition-colors"
                >
                  Terms
                </Link>{" "}
                &{" "}
                <Link
                  to="/privacy"
                  className="text-white/35 hover:text-[#e8924a] cursor-pointer transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          )}

          {/* ── Step: OTP ── */}
          {step === "otp" && (
            <form onSubmit={onVerifyOtp} className="space-y-5">
              {/* Banner for incomplete registration */}
              {emailStatus === "incomplete" && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200/70 leading-relaxed">
                    Your previous sign-up wasn't completed. Verify your email to finish setting up
                    your account.
                  </p>
                </div>
              )}

              {/* 6-box OTP input */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 w-full max-w-[340px] mx-auto">
                {otp.map((digit, i) => (
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
                    className={`flex-1 min-w-0 max-w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border bg-white/[0.04] text-white transition-all focus:outline-none disabled:opacity-50
                      ${digit ? "border-[#d4754a]/55 bg-[#d4754a]/8 text-white" : "border-white/[0.09]"}
                      focus:border-[#d4754a] focus:ring-2 focus:ring-[#d4754a]/20 focus:bg-white/[0.07]`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loadingProvider !== null || otpString.length !== 6}
                className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-[#d4754a] py-3.5 text-sm font-bold text-white hover:bg-[#e8924a] active:scale-[0.98] disabled:opacity-50 transition-all duration-200 shadow-[0_4px_24px_rgba(212,117,74,0.3)] hover:shadow-[0_6px_32px_rgba(212,117,74,0.45)] cursor-pointer"
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

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                    setEmailStatus(null);
                  }}
                  className="inline-flex items-center gap-1.5 py-2.5 px-1 text-xs font-medium text-white/35 hover:text-white/65 active:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Change email
                </button>

                <button
                  type="button"
                  onClick={onResendOtp}
                  disabled={loadingProvider !== null || resendCooldown > 0}
                  className="inline-flex items-center gap-1.5 py-2.5 px-1 text-xs font-medium text-white/35 hover:text-[#e8924a] active:text-[#e8924a] transition-colors disabled:opacity-40 disabled:hover:text-white/35 cursor-pointer disabled:cursor-not-allowed"
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
  );
}
