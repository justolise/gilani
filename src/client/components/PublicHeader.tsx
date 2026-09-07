import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  LayoutDashboard,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
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
  // On subpages or when user is authenticated, back button is especially helpful
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
    <header className="sticky top-0 z-40 w-full flex-none border-b border-white/[0.08] bg-[#0f1117]/85 backdrop-blur-xl transition-all pt-[var(--safe-top,0px)] pl-[var(--safe-left,0px)] pr-[var(--safe-right,0px)]">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Left: Optional Back + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          {shouldShowBack && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2 sm:px-3 -ml-1.5 rounded-full text-[#9ca3af] hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer text-xs font-semibold"
              title={resolvedBackLabel}
              aria-label={resolvedBackLabel}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{resolvedBackLabel}</span>
            </button>
          )}
          <Logo to={user ? dashboardPath : "/"} size="md" />
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
          <Link
            to="/"
            className="text-[#9ca3af] hover:text-white transition-colors [&.active]:text-[#E28743] [&.active]:font-semibold"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-[#9ca3af] hover:text-white transition-colors [&.active]:text-[#E28743] [&.active]:font-semibold"
          >
            About
          </Link>
          <Link
            to="/faq"
            className="text-[#9ca3af] hover:text-white transition-colors [&.active]:text-[#E28743] [&.active]:font-semibold"
          >
            FAQ
          </Link>
          <Link
            to="/contact"
            className="text-[#9ca3af] hover:text-white transition-colors [&.active]:text-[#E28743] [&.active]:font-semibold"
          >
            Contact
          </Link>
        </nav>

        {/* Right: Context-Aware Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Authenticated user indicator on desktop */}
          {user && displayName && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-[#9ca3af]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-white/90 truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C96A3D]/20 text-[#E28743]">
                {isAdmin ? "Admin" : isTeacher ? "Teacher" : "Student"}
              </span>
            </div>
          )}

          {/* Subpage home link for non-logged-in users on mobile */}
          {!user && !isHome && (
            <Link
              to="/"
              className="inline-flex md:hidden items-center gap-1 text-xs font-semibold text-[#9ca3af] hover:text-white transition-colors px-2.5 py-1.5 rounded-full hover:bg-white/5"
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
              className="rounded-full bg-[#C96A3D] px-3.5 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#E28743] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(201,106,61,0.3)] hover:shadow-[0_0_28px_rgba(201,106,61,0.45)] flex items-center gap-1.5 cursor-pointer"
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
              className="rounded-full bg-[#C96A3D] px-3.5 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#E28743] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(201,106,61,0.3)] hover:shadow-[0_0_28px_rgba(201,106,61,0.45)] flex items-center gap-1.5 cursor-pointer"
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
