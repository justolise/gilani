import { useState } from "react";
import {
  User,
  Upload,
  X,
  Mail,
  Check,
  CheckCircle2,
  School,
  Sparkles,
  Save,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { useSettings } from "@/client/components/settings/hooks/useSettings";

type Props = {
  settings: ReturnType<typeof useSettings>;
  userEmail?: string;
  PresetAvatarSVG: React.FC<{ preset: string }>;
};

const SCHOLAR_PRESETS = [
  { id: "socrates", name: "Socrates", discipline: "Philosophy & Socratic Inquiry" },
  { id: "curie", name: "Marie Curie", discipline: "Physics & Chemistry" },
  { id: "galileo", name: "Galileo Galilei", discipline: "Astronomy & Mathematics" },
  { id: "lovelace", name: "Ada Lovelace", discipline: "Computing & Algorithmic Logic" },
  { id: "hypatia", name: "Hypatia", discipline: "Geometry & Astronomy" },
  { id: "einstein", name: "Albert Einstein", discipline: "Theoretical Physics" },
];

export function ProfileDetailsTab({ settings, userEmail, PresetAvatarSVG }: Props) {
  const [showEmailChange, setShowEmailChange] = useState(false);

  const isPreset = settings.avatarUrl?.startsWith("preset:");
  const currentPresetId = isPreset ? settings.avatarUrl?.substring(7) : null;

  return (
    <div className="space-y-6 animate-in-slide">
      {/* Profile & Avatar Management */}
      <section className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <User className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">Profile & Persona</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize how you appear across the workspace, sidebar, and tutor interactions.
            </p>
          </div>
        </div>

        {/* Avatar Showcase & Controls */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-background/50 border border-border/30 p-5 rounded-2xl">
          <div className="relative group flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full overflow-hidden border-2 border-primary/30 bg-background shadow-md">
            {settings.avatarUrl ? (
              isPreset && currentPresetId ? (
                <PresetAvatarSVG preset={currentPresetId} />
              ) : (
                <img
                  src={settings.avatarUrl}
                  alt="Profile Avatar"
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <span className="font-serif text-2xl font-bold text-primary">
                {(settings.displayName || userEmail || "U").substring(0, 2).toUpperCase()}
              </span>
            )}

            {/* Hover overlay for quick upload */}
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200 text-white">
              <Upload className="h-5 w-5 mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
              <input
                type="file"
                onChange={settings.handlePhotoUpload}
                accept="image/*"
                className="sr-only"
              />
            </label>
          </div>

          <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
            <div>
              <p className="text-base font-bold text-foreground truncate">
                {settings.displayName || "Scholar"}
              </p>
              <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-primary" /> {userEmail}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <label className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all cursor-pointer shadow-2xs">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Custom Photo</span>
                <input
                  type="file"
                  onChange={settings.handlePhotoUpload}
                  accept="image/*"
                  className="sr-only"
                />
              </label>

              {settings.avatarUrl && (
                <button
                  type="button"
                  onClick={settings.handleRemovePhoto}
                  className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reset to Initials</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              JPG, PNG, or WebP under 8MB. Images are automatically optimized and centered.
            </p>
          </div>
        </div>

        {/* Scholarly Persona Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Or Choose a Scholarly Persona Avatar
            </label>
            {isPreset && (
              <span className="text-[11px] font-mono text-primary font-semibold">
                Scholar active
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {SCHOLAR_PRESETS.map((preset) => {
              const isSelected = isPreset && currentPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => settings.handleSelectPresetAvatar(preset.id)}
                  className={`group rounded-xl border p-2.5 text-center transition-all cursor-pointer flex flex-col items-center ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40 scale-[1.02]"
                      : "border-border/60 bg-background/50 hover:bg-accent/40 hover:border-border"
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mb-2 border border-border/40 shadow-xs">
                    <PresetAvatarSVG preset={preset.id} />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                        <Check className="w-5 h-5 text-white stroke-[3] drop-shadow-md" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-foreground truncate w-full">{preset.name}</p>
                  <p className="text-[9.5px] text-muted-foreground truncate w-full mt-0.5">
                    {preset.discipline.split("&")[0]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-border/40" />

        {/* Identity Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Display Name</label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {settings.displayName.length} / 50
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={50}
                placeholder="e.g. Kipchoge Maina"
                value={settings.displayName}
                onChange={(e) => settings.setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all font-medium text-foreground"
              />
            </div>

            {/* School / Institution */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <School className="h-3.5 w-3.5 text-muted-foreground" /> School / Institution
              </label>
              <input
                type="text"
                placeholder="e.g. Alliance High School, Strathmore"
                value={settings.preferences.school || ""}
                onChange={(e) => settings.updatePreference("school", e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all text-foreground"
              />
            </div>
          </div>

          {/* Student Bio / Study Mission */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Learning Headline / Study Goal
            </label>
            <input
              type="text"
              placeholder="e.g. KCSE 2026 Candidate • Targeting Straight As in STEM"
              value={settings.preferences.bio || ""}
              onChange={(e) => settings.updatePreference("bio", e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all text-foreground"
            />
            <p className="text-[11px] text-muted-foreground">
              This summary gives context to your AI tutor so its guidance aligns with your academic
              ambitions.
            </p>
          </div>
        </div>
      </section>

      {/* Account Email Management */}
      <section className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">Email Account</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your primary login identifier and notification recipient.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/40 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background/50 border border-border/30 p-4 rounded-xl">
          <div>
            <p className="text-xs font-mono font-semibold text-foreground">{userEmail}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Secure authentication managed by Supabase Auth.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowEmailChange(!showEmailChange)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>{showEmailChange ? "Hide Form" : "Change Email Address"}</span>
            {showEmailChange ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Expandable Email Change Form */}
        {showEmailChange && (
          <form
            onSubmit={settings.handleEmailChange}
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-3 animate-in fade-in duration-200"
          >
            <label className="text-xs font-bold text-foreground block">
              Enter New Email Address
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="new.email@domain.com"
                value={settings.newEmail}
                onChange={(e) => settings.setNewEmail(e.target.value)}
                className="flex-1 rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all font-mono"
              />
              <button
                type="submit"
                disabled={settings.emailBusy || !settings.newEmail}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                {settings.emailBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Mail className="h-3.5 w-3.5" />
                )}
                <span>{settings.emailBusy ? "Sending..." : "Send Verification Link"}</span>
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              We will dispatch an automated confirmation email with a verification link to your new
              address. Click the link to complete the transition.
            </p>
          </form>
        )}
      </section>

      {/* Live Student Card Preview */}
      <section className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10.5px] uppercase tracking-widest text-muted-foreground font-bold">
            Live Student Profile Preview
          </p>
          <span className="text-[10px] font-mono text-primary font-semibold">
            {settings.preferences.curriculum || "KCSE"}
          </span>
        </div>

        <div className="rounded-xl border border-border/60 bg-background p-4 flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-border/80 bg-background/50 flex items-center justify-center">
            {settings.avatarUrl ? (
              isPreset && currentPresetId ? (
                <PresetAvatarSVG preset={currentPresetId} />
              ) : (
                <img src={settings.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              )
            ) : (
              <span className="font-serif text-sm font-bold text-primary">
                {(settings.displayName || userEmail || "U").substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground truncate">
                {settings.displayName || "Scholar"}
              </p>
              <span className="rounded-full bg-primary/10 text-primary px-2 py-0.2 text-[9.5px] font-bold uppercase tracking-wider font-mono">
                {settings.currentPlan}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {settings.preferences.bio || "Active Learner"}
            </p>
            {settings.preferences.school && (
              <p className="text-[10.5px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                <School className="w-3 h-3" /> {settings.preferences.school}
              </p>
            )}
          </div>
        </div>

        {/* Save Footer */}
        <div className="pt-3 flex items-center justify-between border-t border-border/40">
          <p className="text-[11px] text-muted-foreground">
            Changes auto-save within 750ms or click save directly.
          </p>
          <button
            type="button"
            disabled={settings.busy}
            onClick={() => settings.handleProfileSave(undefined, false)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {settings.busy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{settings.busy ? "Saving..." : "Save Profile"}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
