import { Link } from "@tanstack/react-router";
import { Settings, Mail, LogOut } from "lucide-react";
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-3 transition-all cursor-pointer outline-none text-left ${
            isCompact
              ? "justify-center w-9 h-9 rounded-full overflow-hidden border border-transparent hover:border-border lg:border-border bg-transparent lg:bg-background/50 hover:bg-muted/40"
              : "w-full rounded-xl overflow-hidden border border-transparent hover:border-border bg-transparent lg:bg-background/50 hover:bg-muted/40 p-2"
          }`}
        >
          <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full overflow-hidden border border-border bg-background/50 shadow-inner">
            {avatarUrl ? (
              avatarUrl.startsWith("preset:") ? (
                <PresetAvatarSVG preset={avatarUrl.substring(7)} />
              ) : (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              )
            ) : (
              <span className="font-serif text-[11px] font-bold text-foreground">
                {(profileName || userEmail || "U").substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          {!isCompact && (
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold truncate text-foreground leading-tight">
                {profileName || userEmail?.split("@")[0]}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                  {currentPlan} PLAN
                </span>
                {curriculum && (
                  <>
                    <span className="text-[10px] text-muted-foreground/40">•</span>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      {curriculum}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isCompact ? "right" : "top"}
        align={isCompact ? "end" : "start"}
        className="w-64 p-2 shadow-lg rounded-xl"
      >
        <DropdownMenuLabel className="px-4 py-2">
          <p className="text-sm font-semibold truncate">
            {profileName || userEmail?.split("@")[0]}
          </p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary">
              {currentPlan}
            </span>
            {curriculum && (
              <span className="inline-flex items-center rounded-full bg-secondary/80 px-2 py-0.5 font-mono text-[9px] font-semibold text-secondary-foreground">
                {curriculum}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem asChild>
          <Link
            to="/settings"
            onClick={onCloseSidebar}
            className="flex w-full items-center gap-3 cursor-pointer px-4 py-3 text-sm font-medium rounded-lg"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span>{t("nav_settings")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/contact"
            onClick={onCloseSidebar}
            className="flex w-full items-center gap-3 cursor-pointer px-4 py-3 text-sm font-medium rounded-lg"
          >
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span>Contact</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          onClick={onSignOut}
          className="text-destructive focus:text-destructive flex items-center gap-3 cursor-pointer px-4 py-3 text-sm font-medium rounded-lg"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
