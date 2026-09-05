import { Sun, Moon, Palette, Type, Check, Sparkles, BookOpen } from "lucide-react";
import type { useSettings } from "@/client/components/settings/hooks/useSettings";

type Props = {
  settings: ReturnType<typeof useSettings>;
};

const ACCENTS = [
  {
    id: "terracotta",
    name: "Terracotta Hearth",
    desc: "Kenyan red earth & warm clay",
    color: "#c96a3d",
    bgClass: "bg-[#c96a3d]",
  },
  {
    id: "emerald",
    name: "Sage Emerald",
    desc: "Calm focus & forest vitality",
    color: "#2ea071",
    bgClass: "bg-[#2ea071]",
  },
  {
    id: "sapphire",
    name: "Royal Sapphire",
    desc: "Deep academic blue clarity",
    color: "#3b82f6",
    bgClass: "bg-[#3b82f6]",
  },
  {
    id: "amber",
    name: "Warm Amber",
    desc: "Late-night lantern warmth",
    color: "#f59e0b",
    bgClass: "bg-[#f59e0b]",
  },
  {
    id: "amethyst",
    name: "Amethyst Violet",
    desc: "Scholarly insight & poise",
    color: "#a855f7",
    bgClass: "bg-[#a855f7]",
  },
];

const FONTS = [
  {
    id: "sans",
    name: "Modern Sans (Inter)",
    desc: "Crisp, hyper-legible font designed for rapid scanning and screen clarity.",
    sample: "The quick brown fox jumps over the lazy dog.",
    fontClass: "font-sans",
  },
  {
    id: "serif",
    name: "Academic Serif (Playfair)",
    desc: "Scholarly, book-like typography reminiscent of university lecture printouts.",
    sample: "The quick brown fox jumps over the lazy dog.",
    fontClass: "font-serif",
  },
];

export function DisplayThemeTab({ settings }: Props) {
  const currentAccent = settings.preferences.themeAccent || "terracotta";
  const currentFont = settings.preferences.fontFamily || "sans";

  return (
    <div className="space-y-6 animate-in-slide">
      {/* Light / Dark Mode Section */}
      <section className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          {settings.isDark ? (
            <Moon className="h-5 w-5 text-primary" />
          ) : (
            <Sun className="h-5 w-5 text-primary" />
          )}
          <h3 className="font-serif text-xl font-bold text-foreground">Color Mode</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Choose between Light mode (scholarly warm parchment layout) and Dark mode (charcoal deep
          theme).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => settings.toggleTheme("light")}
            className={`group rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${
              !settings.isDark
                ? "border-primary bg-primary/5 shadow-sm scale-[1.01]"
                : "border-border bg-background hover:border-primary/40 hover:bg-accent/40"
            }`}
          >
            <div className="aspect-video w-full rounded-lg bg-orange-50 border border-amber-900/10 p-3 flex flex-col justify-between mb-3 shadow-inner">
              <div className="h-2.5 w-1/3 rounded-full bg-amber-900/20" />
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-amber-900/15" />
                <div className="h-1.5 w-5/6 rounded-full bg-amber-900/15" />
              </div>
            </div>
            <p className="text-sm font-bold flex items-center justify-between text-amber-950 dark:text-amber-200">
              <span className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-primary" /> Scholarly Parchment
              </span>
              {!settings.isDark && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Check className="h-3.5 w-3.5" /> Active
                </span>
              )}
            </p>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => settings.toggleTheme("dark")}
            className={`group rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${
              settings.isDark
                ? "border-primary bg-primary/5 shadow-sm scale-[1.01]"
                : "border-border bg-background hover:border-primary/40 hover:bg-accent/40"
            }`}
          >
            <div className="aspect-video w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 flex flex-col justify-between mb-3 shadow-inner">
              <div className="h-2.5 w-1/3 rounded-full bg-zinc-800" />
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-zinc-800" />
                <div className="h-1.5 w-5/6 rounded-full bg-zinc-800" />
              </div>
            </div>
            <p className="text-sm font-bold flex items-center justify-between text-zinc-100">
              <span className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" /> Charcoal Dark
              </span>
              {settings.isDark && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Check className="h-3.5 w-3.5" /> Active
                </span>
              )}
            </p>
          </button>
        </div>
      </section>

      {/* Study Accent Palettes */}
      <section className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <Palette className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">Study Accent Palette</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personalize highlight rings, buttons, and badges to match your visual focus.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACCENTS.map((accent) => {
            const isSelected = currentAccent === accent.id;
            return (
              <button
                key={accent.id}
                type="button"
                onClick={() => settings.updatePreference("themeAccent", accent.id)}
                className={`group flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                    : "border-border bg-background/50 hover:bg-accent/40 hover:border-border/80"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full mt-0.5 flex-shrink-0 shadow-xs flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: accent.color }}
                >
                  {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{accent.name}</span>
                  </div>
                  <p className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">
                    {accent.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Reading Typography Option */}
      <section className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <Type className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">Reading Typography</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose the reading font style for study notes and tutor explanations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FONTS.map((font) => {
            const isSelected = currentFont === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => settings.updatePreference("fontFamily", font.id)}
                className={`rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                    : "border-border bg-background/50 hover:bg-accent/40 hover:border-border/80"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{font.name}</span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                        <Check className="h-3.5 w-3.5" /> Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{font.desc}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-border/40">
                  <p className={`text-xs text-foreground/80 italic ${font.fontClass}`}>
                    &ldquo;{font.sample}&rdquo;
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Live Interactive Preview Card */}
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-primary">
              Live Preview
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            {currentFont === "serif" ? "Academic Serif" : "Modern Sans"} • {currentAccent}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-serif text-sm font-bold shadow-xs">
                G
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Gilani Tutor • Physics & Math</p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  Socratic Guidance Mode
                </p>
              </div>
            </div>
            <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-semibold">
              Step 1 of 3
            </span>
          </div>

          <div
            className={`space-y-2 text-xs sm:text-sm text-foreground/90 leading-relaxed ${
              currentFont === "serif" ? "font-serif" : "font-sans"
            }`}
          >
            <p>
              Let&apos;s derive Newton&apos;s Second Law from first principles. Recall that force is
              defined as the rate of change of momentum:
            </p>
            <div className="my-2 rounded-lg bg-muted/40 border border-border/40 p-2.5 font-mono text-xs text-foreground text-center">
              F = m · a &nbsp; ⟺ &nbsp; F = dp / dt
            </div>
            <p className="text-xs text-muted-foreground">
              💡 <strong>Check Question:</strong> If a cart of mass 15 kg accelerates at 2.4 m/s²,
              what is the required net force applied?
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/30">
            <span className="text-[11px] text-muted-foreground italic">
              Changes reflect immediately across the entire workspace.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
