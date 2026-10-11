import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Home, LayoutDashboard, Sparkles } from "lucide-react";
import { Logo } from "@/client/components/ui/logo";
import { Button } from "@/client/components/ui/button";
import { useAuth } from "@/client/hooks/use-auth";

export interface PublicHeaderProps {
  backTo?: any;
  backLabel?: string;
  showBack?: boolean;
}

export function PublicHeader({ backTo, backLabel, showBack }: PublicHeaderProps) {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const shouldShowBack = showBack ?? (!isHome || !!user);

  const isAdmin = roles?.includes("admin");
  const isTeacher = roles?.includes("teacher");

  const dashboardPath = isAdmin ? "/admin/users" : isTeacher ? "/teacher/escalations" : "/tutor";

  const defaultBackLabel = user
    ? isAdmin
      ? "Admin Panel"
      : isTeacher
        ? "Workspace"
        : "Tutor"
    : "Back";

  const resolvedBackLabel = backLabel || (user ? `Back to ${defaultBackLabel}` : "Back");

  const handleBack = () => {
    if (backTo) {
      navigate({ to: backTo as any });
    } else if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host)
    ) {
      window.history.back();
    } else {
      navigate({ to: (user ? dashboardPath : "/") as any });
    }
  };

  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "";

  return (
    <header className="sticky top-0 z-40 w-full flex-none border-b border-white/6 bg-[#0a0d14]/90 backdrop-blur-2xl transition-all pt-(--safe-top,0px) pl-(--safe-left,0px) pr-(--safe-right,0px)">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Left: Optional Back + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          {shouldShowBack && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 -ml-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/6 active:scale-95 transition-all cursor-pointer text-xs font-semibold border border-transparent hover:border-white/8"
              title={resolvedBackLabel}
              aria-label={resolvedBackLabel}
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{resolvedBackLabel}</span>
            </button>
          )}
          <Logo to={user ? dashboardPath : "/"} size="md" />
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {[
            { to: "/", label: "Home" },
            { to: "/about", label: "About" },
            { to: "/faq", label: "FAQ" },
            { to: "/contact", label: "Contact" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="nav-link px-3 py-1.5 rounded-lg text-white/50 hover:text-white transition-colors [&.active]:text-white/90 [&.active]:font-semibold text-[13px] tracking-wide"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: Context-Aware Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Authenticated user indicator on desktop */}
          {user && displayName && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/6 text-xs text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-white/80 truncate max-w-30">{displayName}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#d4754a]/15 text-[#e8924a]">
                {isAdmin ? "Admin" : isTeacher ? "Teacher" : "Student"}
              </span>
            </div>
          )}

          {/* Subpage home link for non-logged-in users on mobile */}
          {!user && !isHome && (
            <Link
              to="/"
              className="inline-flex md:hidden items-center gap-1 text-xs font-semibold text-white/40 hover:text-white transition-colors px-2.5 py-1.5 rounded-full hover:bg-white/5"
              title="Home"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}

          {/* Context-Aware Primary Action Button */}
          {user ? (
            <Button
              asChild
              className="rounded-full bg-[#d4754a] px-3.5 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#e8924a] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_20px_rgba(212,117,74,0.35)] hover:shadow-[0_6px_28px_rgba(212,117,74,0.5)] flex items-center gap-1.5 cursor-pointer"
            >
              <Link to={dashboardPath as any}>
                {isAdmin || isTeacher ? (
                  <LayoutDashboard className="h-3.5 w-3.5" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>{isAdmin ? "Admin Panel" : isTeacher ? "Workspace" : "Go to Tutor"}</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="rounded-full bg-[#d4754a] px-3.5 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#e8924a] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_20px_rgba(212,117,74,0.35)] hover:shadow-[0_6px_28px_rgba(212,117,74,0.5)] flex items-center gap-1.5 cursor-pointer"
            >
              <Link to="/login" search={{ redirect: undefined, signout: undefined }}>
                <span>{isHome ? "Get Started" : "Sign In"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
