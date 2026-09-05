import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Cookie,
  BarChart,
  ChevronRight,
  Trash2,
  Loader2,
  Download,
  FileText,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import type { useSettings } from "@/client/components/settings/hooks/useSettings";

type Props = {
  settings: ReturnType<typeof useSettings>;
  userEmail?: string;
};

export function ConsentSecurityTab({ settings, userEmail }: Props) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const openDisclaimerModal = () => {
    window.dispatchEvent(new CustomEvent("custom:open-disclaimer"));
  };

  return (
    <section className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 shadow-xs space-y-6 animate-in-slide">
      <div className="flex items-center gap-2.5">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-xl font-bold text-foreground">Consent & Security</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed -mt-2">
        Manage legal agreements, privacy permissions, and data retention. Any adjustments made here
        take effect immediately across the entire application and sync with the cloud.
      </p>

      <div className="space-y-5">
        {/* AI Disclaimer Consent */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50 border border-border/20 p-4 rounded-xl">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm font-bold flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> AI Disclaimer Agreement
            </p>
            <p className="text-xs text-muted-foreground leading-normal max-w-md">
              Acknowledgment of AI safety boundaries, potential inaccuracies, and ethical learning
              guidelines.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {settings.disclaimerAccepted ? (
              <>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/40 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="h-3 w-3" /> Accepted
                </span>
                <button
                  onClick={openDisclaimerModal}
                  type="button"
                  className="rounded-lg border border-border px-2.5 py-1 text-[10.5px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  Review
                </button>
                <button
                  onClick={settings.handleDisclaimerRevoke}
                  type="button"
                  className="rounded-lg border border-destructive/30 px-2.5 py-1 text-[10.5px] font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                >
                  Revoke
                </button>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/40 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Pending Read
                </span>
                <button
                  onClick={openDisclaimerModal}
                  type="button"
                  className="rounded-lg bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                >
                  Read & Accept
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cookie Consent */}
        <div className="flex items-center justify-between gap-4 bg-background/50 border border-border/20 p-4 rounded-xl">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Cookie className="h-4 w-4 text-primary" /> Cookie Storage Consent
            </p>
            <p className="text-xs text-muted-foreground leading-normal max-w-md">
              Saves session authentication, visual accent themes, and offline study preferences.
            </p>
          </div>
          <button
            onClick={() => settings.toggleConsent("cookie", !settings.cookieConsent)}
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
              settings.cookieConsent ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.cookieConsent ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Analytics Consent */}
        <div className="flex items-center justify-between gap-4 bg-background/50 border border-border/20 p-4 rounded-xl">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm font-bold flex items-center gap-2 text-foreground">
              <BarChart className="h-4 w-4 text-primary" /> Usage Analytics Telemetry
            </p>
            <p className="text-xs text-muted-foreground leading-normal max-w-md">
              Anonymously logs curriculum response latencies and token budgets to help improve tutor
              speed.
            </p>
          </div>
          <button
            onClick={() => settings.toggleConsent("analytics", !settings.analyticsConsent)}
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
              settings.analyticsConsent ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.analyticsConsent ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Data Management Section */}
        <div className="space-y-2.5 pt-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            Data Management (GDPR & Data Protection)
          </p>
          <div className="flex flex-col gap-2.5">
            {/* Export Data Button */}
            <button
              type="button"
              disabled={settings.exportingData}
              onClick={settings.handleExportUserData}
              className="w-full text-left rounded-xl border border-border bg-background hover:bg-accent px-4 py-3.5 text-xs font-semibold text-foreground transition-all flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5">
                {settings.exportingData ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Download className="h-4 w-4 text-primary" />
                )}
                <div>
                  <p className="font-bold">
                    {settings.exportingData ? "Generating export..." : "Export all my data (JSON)"}
                  </p>
                  <p className="text-[10.5px] text-muted-foreground font-normal">
                    Download a full backup of your profile, study notes, conversations, and study
                    goals.
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Clear All Chat History */}
            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="w-full text-left rounded-xl border border-border bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 px-4 py-3.5 text-xs font-semibold text-foreground transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="h-4 w-4 text-destructive/70" />
                  <div>
                    <p className="font-bold">Clear all chat history</p>
                    <p className="text-[10.5px] text-muted-foreground font-normal">
                      Permanently delete all previous conversation threads and message archives.
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ) : (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-destructive">
                      Permanently clear all chat history?
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      This will delete all past conversations and messages across all your devices.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={settings.clearingHistory}
                    onClick={async () => {
                      await settings.handleClearAllChatHistory();
                      setShowClearConfirm(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3.5 py-1.5 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {settings.clearingHistory ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {settings.clearingHistory ? "Clearing..." : "Yes, Clear Everything"}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={settings.clearingHistory}
                    onClick={() => setShowClearConfirm(false)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Policies Section */}
        <div className="space-y-2.5 pt-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            Review Policies & Terms
          </p>
          <div className="flex flex-col gap-2">
            {[
              { path: "/terms", label: "Terms of Service Agreement" },
              { path: "/privacy", label: "Privacy Policy Commitments" },
              { path: "/cookies", label: "Full Cookie Policy Details" },
            ].map((p) => (
              <Link
                key={p.path}
                to={p.path}
                className="w-full text-left rounded-xl border border-border hover:bg-accent px-4 py-3 text-xs font-semibold text-primary transition-all flex items-center justify-between"
              >
                <span>{p.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-destructive/40 bg-destructive/5 rounded-xl p-5 space-y-3">
          <p className="text-sm font-bold text-destructive flex items-center gap-1.5">
            <Trash2 className="h-4 w-4" /> Danger Zone
          </p>
          <p className="text-xs text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!settings.showDeleteConfirm ? (
            <button
              onClick={() => {
                settings.setShowDeleteConfirm(true);
                settings.handleRequestReauth();
              }}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete My Account
            </button>
          ) : (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 space-y-3">
              {!settings.reauthSent ? (
                <p className="text-xs font-semibold text-destructive">
                  {settings.reauthSending
                    ? "Sending verification code to your email…"
                    : "A verification code is being sent to your email."}
                </p>
              ) : (
                <>
                  <p className="text-xs font-semibold text-destructive">
                    A verification code was sent to <span className="font-mono">{userEmail}</span>.
                    Enter it below to permanently delete your account.
                  </p>
                  <div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 6-digit code"
                      value={settings.reauthOtp}
                      onChange={(e) => {
                        settings.setReauthOtp(e.target.value);
                        settings.setReauthError("");
                      }}
                      className="w-full rounded-lg border border-destructive/30 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/40 tracking-widest font-mono"
                      maxLength={6}
                    />
                    {settings.reauthError && (
                      <p className="text-xs text-destructive mt-1">{settings.reauthError}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={settings.handleDeleteAccount}
                      disabled={settings.deleting || settings.reauthOtp.length < 6}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-xs font-bold uppercase tracking-wider text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {settings.deleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      {settings.deleting ? "Deleting…" : "Yes, Delete Everything"}
                    </button>
                    <button
                      onClick={settings.handleRequestReauth}
                      disabled={settings.reauthSending}
                      type="button"
                      className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors cursor-pointer"
                    >
                      {settings.reauthSending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      {settings.reauthSending ? "Sending…" : "Resend Code"}
                    </button>
                  </div>
                </>
              )}
              <button
                onClick={() => {
                  settings.setShowDeleteConfirm(false);
                  settings.setReauthOtp("");
                  settings.setReauthSent(false);
                  settings.setReauthError("");
                }}
                disabled={settings.deleting}
                type="button"
                className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
