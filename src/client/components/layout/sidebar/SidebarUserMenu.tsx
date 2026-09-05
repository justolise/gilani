import { Link } from "@tanstack/react-router";
import { Settings, Mail, LogOut, Sparkles, ChevronRight, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/client/components/ui/dropdown-menu";
import { PresetAvatarSVG } from "@/client/components/settings/PresetAvatarSVG";
import { useI18n } from "@/client/i18n/I18nContext";

export function SidebarUserMenu({
  isCompact = false,
  avatarUrl,
  profileName,
  userEmail,
  currentPlan,
  curriculum,
  onCloseSidebar,
  onSignOut,
}: {
  isCompact?: boolean;
  avatarUrl?: string | null;
  profileName?: string | null;
  userEmail?: string | null;
  currentPlan: string;
  curriculum?: string | null;
  onCloseSidebar: () => void;
  onSignOut: () => void;
}) {
  const { t } = useI18n();
  const displayName = profileName || userEmail?.split("@")[0] || "Student";
  const isPro = currentPlan.toLowerCase() === "pro";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2.5 transition-all cursor-pointer outline-none text-left select-none group ${
            isCompact
              ? "justify-center w-9 h-9 rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.07]"
              : "w-full rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.05] p-2"
          }`}
        >
          {/* Avatar with subtle ring */}
          <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg overflow-hidden border border-white/[0.12] bg-[#1a1c29] shadow-xs">
            {avatarUrl ? (
              avatarUrl.startsWith("preset:") ? (
                <PresetAvatarSVG preset={avatarUrl.substring(7)} />
              ) : (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              )
            ) : (
              <span className="font-serif text-xs font-bold text-foreground">
                {displayName.substring(0, 2).toUpperCase()}
              </span>
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>

          {!isCompact && (
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div className="flex flex-col min-w-0 pr-1">
                <p className="text-xs font-semibold truncate text-foreground leading-tight group-hover:text-primary transition-colors">
                  {displayName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      isPro
                        ? "bg-[#C96A3D]/20 text-[#E28743] border border-[#C96A3D]/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPro ? "PRO" : "FREE"}
                  </span>
                  {curriculum && (
                    <span className="text-[10px] text-muted-foreground/60 truncate font-mono">
                      {curriculum}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={isCompact ? "right" : "top"}
        align={isCompact ? "end" : "start"}
        className="w-64 p-1.5 shadow-2xl rounded-2xl border border-white/[0.12] bg-[#13151f]/98 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <DropdownMenuLabel className="px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg overflow-hidden border border-white/[0.12] bg-[#1a1c29] flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                avatarUrl.startsWith("preset:") ? (
                  <PresetAvatarSVG preset={avatarUrl.substring(7)} />
                ) : (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                )
              ) : (
                <span className="font-serif text-xs font-bold text-foreground">
                  {displayName.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-semibold truncate text-white">{displayName}</p>
              <p className="text-[11px] text-white/40 truncate">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/[0.06]">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                isPro
                  ? "bg-[#C96A3D]/20 text-[#E28743] border border-[#C96A3D]/30"
                  : "bg-white/[0.06] text-white/60"
              }`}
            >
              <Sparkles className="h-2.5 w-2.5" />
              {currentPlan.toUpperCase()}
            </span>
            {curriculum && (
              <span className="inline-flex items-center rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[9px] font-semibold text-white/60">
                {curriculum}
              </span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1 bg-white/[0.06]" />

        <DropdownMenuItem asChild>
          <Link
            to="/settings"
            onClick={onCloseSidebar}
            className="flex w-full items-center gap-2.5 cursor-pointer px-3 py-2 text-xs font-medium rounded-xl text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <Settings className="h-4 w-4 text-white/50" />
            <span>{t("nav_settings")}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to="/contact"
            onClick={onCloseSidebar}
            className="flex w-full items-center gap-2.5 cursor-pointer px-3 py-2 text-xs font-medium rounded-xl text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <Mail className="h-4 w-4 text-white/50" />
            <span>Contact & Support</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-white/[0.06]" />

        <DropdownMenuItem
          onClick={onSignOut}
          className="flex w-full items-center gap-2.5 cursor-pointer px-3 py-2 text-xs font-medium rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4 text-red-400" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
