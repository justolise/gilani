import { useEffect, useMemo } from "react";
import { GilaniLoader } from "@/client/components/GilaniLoader";
import {
  Settings,
  Shield,
  User,
  MessageSquare,
  Mail,
  ThumbsUp,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  BookOpen,
  Activity,
  Menu,
} from "lucide-react";
import { useLayout } from "@/client/contexts/layout-context";
import { NotificationBell } from "@/client/components/notifications";
import { AdminGlobalNotes } from "@/client/components/admin/AdminGlobalNotes";
import { useAdminDashboard } from "@/client/components/admin/hooks/useAdminDashboard";
import { AdminUsersTab } from "@/client/components/admin/tabs/AdminUsersTab";
import { AdminFeedbackTab } from "@/client/components/admin/tabs/AdminFeedbackTab";
import { AdminMessagesTab } from "@/client/components/admin/tabs/AdminMessagesTab";
import { AdminRateLimitsTab } from "@/client/components/admin/tabs/AdminRateLimitsTab";
import { AdminEscalationsTab } from "@/client/components/admin/tabs/AdminEscalationsTab";
import { AdminSubscriptionsTab } from "@/client/components/admin/tabs/AdminSubscriptionsTab";
import { AdminNewsletterTab } from "@/client/components/admin/tabs/AdminNewsletterTab";
import { AdminSettingsAnalyticsTab } from "@/client/components/admin/tabs/AdminSettingsAnalyticsTab";
import * as adminServerFns from "@/fns/admin.server-fns";

export function AdminUsersPage() {
  const { setSidebarOpen, user } = useLayout();

  const serverFns = useMemo(
    () => ({
      listProfiles: adminServerFns.listProfiles,
      listEscalations: adminServerFns.listEscalations,
      listPlatformStats: adminServerFns.listPlatformStats,
      listContactMessages: adminServerFns.listContactMessages,
      listFeedback: adminServerFns.listFeedback,
      listNewsletterSubscribers: adminServerFns.listNewsletterSubscribers,
      listRateLimits: adminServerFns.listRateLimits,
      listPayments: adminServerFns.listPayments,
      updateRole: adminServerFns.updateRole,
      updateMessageStatus: adminServerFns.updateMessageStatus,
      updateUserPlan: adminServerFns.updateUserPlan,
      resetUserRateLimit: adminServerFns.resetUserRateLimit,
    }),
    [],
  );
  const dashboard = useAdminDashboard(serverFns);

  useEffect(() => {
    dashboard.loadDashboardData();
  }, [dashboard.loadDashboardData]);

  if (dashboard.loadingData) return <GilaniLoader />;

  const TABS = [
    { id: "users", label: "Users", icon: User },
    {
      id: "escalations",
      label: "Escalations",
      icon: AlertTriangle,
      badge: dashboard.platformStats.openEscalations,
    },
    { id: "feedback", label: "Feedback", icon: ThumbsUp },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: dashboard.unreadCount },
    { id: "ratelimits", label: "Limits", icon: BarChart3 },
    { id: "subscriptions", label: "Subs", icon: CreditCard },
    { id: "newsletter", label: "Newsletter", icon: Mail },
    { id: "globalnotes", label: "Notes", icon: BookOpen },
    { id: "settings_analytics", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 p-3 sm:p-6 lg:p-10">
      {/* Mobile Header */}
      <div className="flex lg:hidden items-center justify-between h-14 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-2 border-b border-border/60">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors active:scale-95"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {user?.id ? <NotificationBell userId={user?.id} /> : null}
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-border/60 gap-4 text-center sm:text-left">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
            Admin Panel
          </p>
          <h1 className="mt-1 font-serif text-2xl sm:text-4xl text-foreground">Dashboard</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {dashboard.profileState.length} users ·{" "}
            {dashboard.platformStats.totalConversations.toLocaleString()} convos ·{" "}
            {dashboard.platformStats.openEscalations} escalations
          </p>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-2.5 mt-1 sm:mt-0">
          <button
            onClick={() => dashboard.loadDashboardData(false)}
            disabled={dashboard.refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${dashboard.refreshing ? "animate-spin" : ""}`} />{" "}
            Refresh
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-red-700">
            <Shield className="h-3 w-3" /> Admin
          </span>
        </div>
      </header>

      {/* Summary Stats Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          {
            label: "Total Users",
            value: dashboard.profileState.length,
            Icon: User,
            color: "text-primary",
          },
          {
            label: "Total Convos",
            value: dashboard.platformStats.totalConversations.toLocaleString(),
            Icon: MessageSquare,
            color: "text-emerald-500",
          },
          {
            label: "Total Messages",
            value: dashboard.platformStats.totalMessages.toLocaleString(),
            Icon: Activity,
            color: "text-indigo-500",
          },
          {
            label: "Open Escalations",
            value: dashboard.platformStats.openEscalations,
            Icon: AlertTriangle,
            color:
              dashboard.platformStats.openEscalations > 0 ? "text-amber-500" : "text-emerald-500",
          },
        ].map(({ label, value, Icon, color }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-2.5 sm:p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground leading-tight">
                {label}
              </p>
              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${color} flex-shrink-0`} />
            </div>
            <p className={`font-serif text-xl sm:text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Summary Stats Row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          {
            label: "Satisfaction",
            value: `${dashboard.satisfactionPct}%`,
            Icon: ThumbsUp,
            color: "text-green-600",
          },
          { label: "Unread", value: dashboard.unreadCount, Icon: Mail, color: "text-amber-600" },
          {
            label: "Rate Limits",
            value: dashboard.rateLimits.reduce((a, r) => a + r.count, 0),
            Icon: RefreshCw,
            color: "text-orange-500",
          },
          {
            label: "Messages",
            value: dashboard.platformStats.totalMessages.toLocaleString(),
            Icon: MessageSquare,
            color: "text-teal-600",
          },
        ].map(({ label, value, Icon, color }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-2.5 sm:p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground leading-tight">
                {label}
              </p>
              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${color} flex-shrink-0`} />
            </div>
            <p className={`font-serif text-xl sm:text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 sm:gap-2 pb-2 overflow-x-auto scrollbar-none snap-x snap-mandatory">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => dashboard.setTab(t.id as any)}
              className={`snap-start flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider rounded-xl border transition-all whitespace-nowrap flex-shrink-0 min-h-[36px] sm:min-h-[40px] cursor-pointer ${
                dashboard.tab === t.id
                  ? "border-primary text-primary bg-primary/5 font-extrabold shadow-sm"
                  : "border-border/60 text-muted-foreground bg-transparent hover:text-foreground hover:border-border hover:bg-accent/30"
              }`}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{t.label}</span>
              {"badge" in t && (t as any).badge > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground leading-none">
                  {(t as any).badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {dashboard.tab === "users" && (
        <AdminUsersTab
          filtered={dashboard.filtered}
          profileState={dashboard.profileState}
          search={dashboard.search}
          setSearch={dashboard.setSearch}
          updating={dashboard.updating}
          counts={dashboard.counts}
          handleRoleChange={dashboard.handleRoleChange}
        />
      )}
      {dashboard.tab === "escalations" && (
        <AdminEscalationsTab
          escalations={dashboard.escalations}
          filteredEscalations={dashboard.filteredEscalations}
          escalationFilter={dashboard.escalationFilter}
          setEscalationFilter={dashboard.setEscalationFilter}
        />
      )}
      {dashboard.tab === "feedback" && <AdminFeedbackTab feedback={dashboard.feedback} />}
      {dashboard.tab === "messages" && (
        <AdminMessagesTab
          messages={dashboard.messages}
          expandedMsg={dashboard.expandedMsg}
          setExpandedMsg={dashboard.setExpandedMsg}
          updatingMsg={dashboard.updatingMsg}
          handleStatusChange={dashboard.handleStatusChange}
        />
      )}
      {dashboard.tab === "ratelimits" && (
        <AdminRateLimitsTab
          rateLimits={dashboard.rateLimits}
          filteredRateLimits={dashboard.filteredRateLimits}
          rlSearch={dashboard.rlSearch}
          setRlSearch={dashboard.setRlSearch}
        />
      )}
      {dashboard.tab === "subscriptions" && (
        <AdminSubscriptionsTab
          filteredForPlans={dashboard.filteredForPlans}
          profileState={dashboard.profileState}
          payments={dashboard.payments}
          planSearch={dashboard.planSearch}
          setPlanSearch={dashboard.setPlanSearch}
          planCounts={dashboard.planCounts}
          mrr={dashboard.mrr}
          totalRevenue={dashboard.totalRevenue}
          activeSubs={dashboard.activeSubs}
          expiringSoon={dashboard.expiringSoon}
          updatingPlan={dashboard.updatingPlan}
          resettingLimit={dashboard.resettingLimit}
          handlePlanChange={dashboard.handlePlanChange}
          handleResetLimit={dashboard.handleResetLimit}
        />
      )}
      {dashboard.tab === "newsletter" && <AdminNewsletterTab newsletter={dashboard.newsletter} />}
      {dashboard.tab === "globalnotes" && <AdminGlobalNotes />}
      {dashboard.tab === "settings_analytics" && <AdminSettingsAnalyticsTab />}
    </div>
  );
}
