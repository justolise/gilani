import React, { useState, useEffect } from "react";
import {
  User,
  Sun,
  Shield,
  CreditCard,
  Brain,
  ChevronLeft,
  Bell,
  Globe,
  Monitor,
  Keyboard,
  ChevronRight,
  Menu,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/client/hooks/use-auth";
import { useSettings } from "@/client/components/settings/hooks/useSettings";
import { useI18n } from "@/client/i18n/I18nContext";
import { useLayout } from "@/client/contexts/layout-context";
import { PresetAvatarSVG } from "@/client/components/settings/PresetAvatarSVG";
import { ProfileDetailsTab } from "@/client/components/settings/tabs/ProfileDetailsTab";
import { TutorPreferencesTab } from "@/client/components/settings/tabs/TutorPreferencesTab";
import { DisplayThemeTab } from "@/client/components/settings/tabs/DisplayThemeTab";
import { PlanUsageTab } from "@/client/components/settings/tabs/PlanUsageTab";
import { ConsentSecurityTab } from "@/client/components/settings/tabs/ConsentSecurityTab";
import { AccountCredentialsTab } from "@/client/components/settings/tabs/AccountCredentialsTab";
import { NotificationsTab } from "@/client/components/settings/tabs/NotificationsTab";
import { LanguageRegionTab } from "@/client/components/settings/tabs/LanguageRegionTab";
import { AccessibilityTab } from "@/client/components/settings/tabs/AccessibilityTab";
import { ShortcutsTab } from "@/client/components/settings/tabs/ShortcutsTab";
import { PlansModal } from "@/client/components/PlansModal";
import { deleteAccount } from "@/routes/_authenticated/settings";

type TabId =
  | "profile"
  | "notifications"
  | "language"
  | "tutor"
  | "theme"
  | "accessibility"
  | "shortcuts"
  | "plan"
  | "consent";

type TabGroup = {
  label: string;
  tabs: {
    id: TabId;
    label: string;
    icon: React.ElementType;
    description: string;
  }[];
};

export default function SettingsPage() {
  const { user } = useAuth();
  const settings = useSettings(user, { deleteAccount });
  const { t } = useI18n();
  const { setSidebarOpen } = useLayout();

  const [mobileView, setMobileView] = useState<"list" | "content">("list");

  const TAB_GROUPS: TabGroup[] = [
    {
      label: "Account",
      tabs: [
        {
          id: "profile",
          label: t("tab_profile"),
          icon: User,
          description: "Name, avatar, credentials",
        },
        { id: "plan", label: t("tab_plan"), icon: CreditCard, description: "Subscription & usage" },
        { id: "consent", label: t("tab_consent"), icon: Shield, description: "Privacy & security" },
      ],
    },
    {
      label: "Preferences",
      tabs: [
        { id: "tutor", label: t("tab_tutor"), icon: Brain, description: "AI tutor behaviour" },
        {
          id: "notifications",
          label: t("tab_notifications"),
          icon: Bell,
          description: "Alerts & reminders",
        },
        { id: "language", label: t("tab_language"), icon: Globe, description: "Region & locale" },
        { id: "theme", label: t("tab_theme"), icon: Sun, description: "Appearance & colours" },
      ],
    },
    {
      label: "Workspace",
      tabs: [
        {
          id: "accessibility",
          label: t("tab_accessibility"),
          icon: Monitor,
          description: "Motion & contrast",
        },
        {
          id: "shortcuts",
          label: t("tab_shortcuts"),
          icon: Keyboard,
          description: "Keyboard bindings",
        },
      ],
    },
  ];

  const allTabs = TAB_GROUPS.flatMap((g) => g.tabs);

  // Default to "profile" on desktop
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768 && !settings.activeTab) {
      settings.setActiveTab("profile");
    }
  }, []);

  const activeTabMeta = allTabs.find((t) => t.id === settings.activeTab);
  const activeTabLabel = activeTabMeta?.label ?? t("tab_settings");

  const handleTabClick = (tabId: TabId) => {
    settings.setActiveTab(tabId);
    setMobileView("content");
  };

  const handleBackToList = () => {
    setMobileView("list");
  };

  return (
    <div className="flex flex-col h-full bg-background w-full">
      {/* ── Mobile Top Bar ─────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between border-b border-border/60 px-4 h-14 flex-shrink-0 bg-sidebar/95 dark:bg-[#191715]/95 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          {mobileView === "content" ? (
            <button
              onClick={handleBackToList}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{t("tab_settings")}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-primary tracking-tight">GilaniAI</span>
              <span className="text-muted-foreground/30 text-xs font-mono">/</span>
              <span className="text-xs font-mono font-medium text-muted-foreground">Settings</span>
            </div>
          )}
        </div>
        {settings.busy && (
          <span className="text-[10px] text-muted-foreground animate-pulse pr-2">saving…</span>
        )}
      </div>

      {/* ── Main Layout Area ─────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── MOBILE LIST VIEW ─────────────────────────────────── */}
        {mobileView === "list" && (
          <nav className="flex-1 md:hidden overflow-y-auto bg-sidebar/95 dark:bg-[#191715]/95">
            <div className="px-3 py-3 space-y-4">
              {TAB_GROUPS.map((group) => (
                <div key={group.label} className="space-y-0.5">
                  <p className="px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {group.label}
                  </p>
                  {group.tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = settings.activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer min-h-[46px] ${
                          isActive
                            ? "bg-muted/70 text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon
                            className={`h-4.5 w-4.5 flex-shrink-0 transition-colors ${
                              isActive ? "text-primary" : "text-muted-foreground/70"
                            }`}
                          />
                          <span>{tab.label}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </nav>
        )}

        {/* ── MOBILE CONTENT VIEW ─────────────────────────────── */}
        {mobileView === "content" && (
          <div className="flex-1 md:hidden overflow-y-auto p-5">
            <h2 className="text-base font-semibold text-foreground mb-5">{activeTabLabel}</h2>
            {renderContent(settings, user)}
          </div>
        )}

        {/* ── DESKTOP LAYOUT ─────────────────────────────────── */}
        <div className="hidden md:flex w-full h-full">
          {/* ── Left Nav (Sidebar Clone) ── */}
          <div
            className="
              w-[270px] flex-shrink-0 flex flex-col
              bg-sidebar dark:bg-[#191715]
              border-r border-sidebar-border/80
              overflow-hidden
            "
          >
            {/* Scope-switcher header — matches sidebar exactly */}
            <div className="flex items-center justify-between px-3 pt-3.5 pb-2 flex-shrink-0 border-b border-sidebar-border/40">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/40 transition-colors group cursor-default max-w-full min-w-0">
                {/* Breadcrumb — no G icon, GilaniAI in primary */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-xs text-primary tracking-tight">GilaniAI</span>
                  <span className="text-muted-foreground/30 text-xs font-mono">/</span>
                  <span className="text-[11px] font-mono font-medium text-muted-foreground truncate">
                    Settings
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground/30 ml-0.5 flex-shrink-0" />
              </div>

              {/* Saving indicator */}
              {settings.busy && (
                <span className="text-[10px] font-mono text-muted-foreground/60 animate-pulse flex-shrink-0 pr-1">
                  saving…
                </span>
              )}
            </div>

            {/* Tab navigation — section groups */}
            <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {TAB_GROUPS.map((group) => (
                <div key={group.label} className="space-y-0.5">
                  {/* Section mono label */}
                  <p className="px-2.5 py-1 text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/50">
                    {group.label}
                  </p>

                  {group.tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = settings.activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => settings.setActiveTab(tab.id)}
                        className={`
                          group w-full flex items-center justify-between
                          px-2.5 py-2 rounded-xl text-xs font-medium
                          transition-all duration-150 cursor-pointer select-none
                          ${
                            isActive
                              ? "bg-muted/70 text-foreground font-semibold shadow-xs"
                              : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                          }
                        `}
                      >
                        <span className="flex items-center gap-2.5 min-w-0 truncate">
                          <Icon
                            className={`h-4 w-4 flex-shrink-0 transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground/70 group-hover:text-foreground"
                            }`}
                          />
                          <span className="truncate">{tab.label}</span>
                        </span>
                        {/* Active dot — mirrors sidebar's dot indicator */}
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Footer divider — mirrors sidebar footer */}
            <div className="flex-shrink-0 border-t border-sidebar-border/50 px-3 py-3">
              <div className="flex items-center gap-2 px-2 py-1">
                <Settings className="h-3.5 w-3.5 text-muted-foreground/30" />
                <span className="text-[10px] font-mono text-muted-foreground/30 tracking-wide">
                  Workspace Settings
                </span>
              </div>
            </div>
          </div>

          {/* ── Right Content Area ── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Content header bar */}
            <div className="flex items-center justify-between px-10 pt-8 pb-4 border-b border-border/30 flex-shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-xl font-semibold text-foreground">
                  {settings.activeTab ? activeTabLabel : ""}
                </h2>
                {activeTabMeta?.description && (
                  <p className="text-xs text-muted-foreground">{activeTabMeta.description}</p>
                )}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-10 py-8">
              {!settings.activeTab ? (
                <div className="flex-col items-center justify-center h-full min-h-[300px] text-center gap-4 flex">
                  <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Choose a setting</p>
                    <p className="text-xs text-muted-foreground">
                      Select a section from the left panel
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl space-y-8 animate-in fade-in duration-200 pb-12">
                  {renderContent(settings, user)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {settings.showPlans && (
        <PlansModal
          onClose={() => settings.setShowPlans(false)}
          currentPlan={settings.currentPlan}
        />
      )}
    </div>
  );
}

function renderContent(
  settings: ReturnType<typeof useSettings>,
  user: ReturnType<typeof useAuth>["user"],
) {
  switch (settings.activeTab) {
    case "profile":
      return (
        <>
          <ProfileDetailsTab
            settings={settings}
            userEmail={user?.email}
            PresetAvatarSVG={PresetAvatarSVG}
          />
          <AccountCredentialsTab settings={settings} userEmail={user?.email} />
        </>
      );
    case "notifications":
      return <NotificationsTab settings={settings} />;
    case "language":
      return <LanguageRegionTab settings={settings} />;
    case "tutor":
      return <TutorPreferencesTab settings={settings} />;
    case "theme":
      return <DisplayThemeTab settings={settings} />;
    case "accessibility":
      return <AccessibilityTab settings={settings} />;
    case "shortcuts":
      return <ShortcutsTab settings={settings} />;
    case "plan":
      return <PlanUsageTab settings={settings} />;
    case "consent":
      return <ConsentSecurityTab settings={settings} userEmail={user?.email} />;
    default:
      return null;
  }
}
