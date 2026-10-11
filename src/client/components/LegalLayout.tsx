import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Logo } from "@/client/components/ui/logo";
import { useAuth } from "@/client/hooks/use-auth";
import { PublicHeader, type PublicHeaderProps } from "@/client/components/PublicHeader";

export function LegalHeader(props: PublicHeaderProps) {
  return <PublicHeader {...props} />;
}

export function LegalFooter() {
  const { user, roles } = useAuth();
  const dashboardPath = roles?.includes("admin")
    ? "/admin/users"
    : roles?.includes("teacher")
      ? "/teacher/escalations"
      : "/tutor";

  return (
    <footer className="border-t border-border/60 bg-card/60 backdrop-blur-md px-4 sm:px-8 pt-8 pb-[calc(2rem+var(--safe-bottom,0px))] pl-(--safe-left,0px) pr-(--safe-right,0px) transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <Logo to={user ? dashboardPath : "/"} size="sm" />
        <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
          {[
            { label: "About", to: "/about" },
            { label: "Privacy", to: "/privacy" },
            { label: "Terms", to: "/terms" },
            { label: "Cookies", to: "/cookies" },
            { label: "FAQ", to: "/faq" },
            { label: "Contact", to: "/contact" },
          ].map(({ label, to }) => (
            <Link key={label} to={to as any} className="hover:text-primary transition-colors">
              {label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/80">
          © {new Date().getFullYear()} GilaniAI · Nairobi, Kenya
        </p>
      </div>
    </footer>
  );
}

export function LegalHero({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-border/60 py-14 sm:py-20 text-center bg-card/20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(201,106,61,0.12),transparent_70%)]" />
      </div>
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary mb-1 shadow-sm">
          <Sparkles className="h-3 w-3" />
          {label}
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground font-display">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2.5 font-display">
        {title}
      </h2>
      <div className="space-y-3.5 text-sm sm:text-[15px] text-muted-foreground [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:list-disc [&_li]:leading-relaxed [&_p]:leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold [&_a]:text-primary [&_a]:font-semibold [&_a]:hover:underline [&_a]:transition-colors">
        {children}
      </div>
    </div>
  );
}
