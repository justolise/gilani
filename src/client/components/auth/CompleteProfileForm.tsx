import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Logo } from "@/client/components/ui/logo";
import {
  ArrowRight,
  Loader2,
  User,
  GraduationCap,
  BookOpen,
  Sparkles,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/client/supabase";
import { toast } from "sonner";
import { friendlyError } from "@/shared/utils/async";

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9\s\-'.]+$/, "Only letters, numbers, hyphens, and apostrophes allowed"),
  role: z.enum(["student", "teacher"]),
  curriculum: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface CompleteProfileFormProps {
  initialName?: string;
  missingName?: boolean;
  missingRole?: boolean;
  onSave: (displayName: string, role: "student" | "teacher", curriculum?: string) => Promise<void>;
  onCancel?: () => void;
}

export function CompleteProfileForm({
  initialName = "",
  missingName = true,
  missingRole = true,
  onSave,
  onCancel,
}: CompleteProfileFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: initialName || "",
      role: "student",
      curriculum: "KCSE",
    },
    mode: "onChange",
  });

  const selectedRole = watch("role");

  const onSubmitForm = async (data: ProfileFormValues) => {
    setErrorMessage(null);
    try {
      await onSave(data.displayName.trim(), data.role, data.curriculum);
    } catch (err) {
      const msg = friendlyError(
        err as { message?: string },
        "Failed to complete setup. Please try again.",
      );
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      if (onCancel) {
        onCancel();
        return;
      }
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-[460px] my-auto animate-in zoom-in-95 duration-300">
        {/* Outer glow */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-md pointer-events-none" />

        <div className="relative rounded-3xl border border-white/[0.12] bg-[#13151f]/98 dark:bg-[#13151f]/98 backdrop-blur-xl shadow-2xl overflow-hidden max-h-[calc(100dvh-2rem)] flex flex-col">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 flex-shrink-0" />

          <div className="overflow-y-auto p-5 sm:p-7 space-y-5">
            {/* Header */}
            <div className="text-center space-y-2 pt-1">
              <Logo to="/" size="md" className="mx-auto" />
              <div className="space-y-1.5 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Account Setup Required
                </div>
                <h1 className="font-serif text-2xl font-black text-white tracking-tight">
                  Welcome to GilaniAI
                </h1>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                  Please enter your username and details before accessing your learning workspace.
                </p>
              </div>
            </div>

            {/* Error banner if submission failed */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              {/* Display Name / Username */}
              {missingName && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                      <User className="h-3 w-3 text-primary" />
                      Your Name / Username <span className="text-primary">*</span>
                    </label>
                    {errors.displayName && (
                      <span className="text-[10px] text-red-400 font-medium">
                        {errors.displayName.message}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. Alex Onunga"
                      {...register("displayName")}
                      className={`w-full rounded-xl border bg-white/[0.05] px-4 py-3.5 text-base sm:text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
                        errors.displayName
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
                          : "border-white/[0.12] focus:border-primary focus:ring-primary/30 focus:bg-white/[0.08]"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Role Selector */}
              {missingRole && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <GraduationCap className="h-3 w-3 text-primary" />I am a{" "}
                    <span className="text-primary">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setValue("role", "student", { shouldValidate: true })}
                      className={`min-h-[48px] flex items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        selectedRole === "student"
                          ? "border-primary bg-primary/20 text-white font-semibold ring-2 ring-primary/30"
                          : "border-white/[0.1] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("role", "teacher", { shouldValidate: true })}
                      className={`min-h-[48px] flex items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        selectedRole === "teacher"
                          ? "border-primary bg-primary/20 text-white font-semibold ring-2 ring-primary/30"
                          : "border-white/[0.1] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <User className="h-4 w-4 text-primary" />
                      Teacher
                    </button>
                  </div>
                  <input type="hidden" {...register("role")} />
                </div>
              )}

              {/* Curriculum Selection (Optional/Relevant for students) */}
              {selectedRole === "student" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3 text-primary" />
                    Curriculum / Education System
                  </label>
                  <select
                    {...register("curriculum")}
                    className="w-full appearance-none rounded-xl border border-white/[0.12] bg-[#1a1c29] px-4 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                  >
                    <optgroup label="Secondary School (Kenya)">
                      <option value="KCSE">8-4-4 / KCSE (Kenya)</option>
                      <option value="CBC">CBC (Kenya)</option>
                    </optgroup>
                    <optgroup label="International Secondary">
                      <option value="IGCSE">Cambridge IGCSE</option>
                      <option value="A-Level">A-Level</option>
                      <option value="IB">International Baccalaureate (IB)</option>
                    </optgroup>
                    <optgroup label="Higher Education">
                      <option value="University">University (Degree / Postgraduate)</option>
                      <option value="College">College (Diploma / Certificate)</option>
                      <option value="TVET">TVET (Technical &amp; Vocational)</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="General">General / International</option>
                    </optgroup>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (missingName && !isValid)}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50 transition-all duration-200 shadow-lg shadow-primary/25 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Complete & Enter Workspace
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Escape hatch for signing in with another account */}
            <div className="pt-2 border-t border-white/[0.06] text-center">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 py-2.5 px-3 text-xs text-white/40 hover:text-white/80 active:text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                Sign in with another account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
