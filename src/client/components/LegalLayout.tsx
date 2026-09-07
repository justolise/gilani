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
    <footer className="border-t border-white/[0.08] bg-[#0f1117] px-4 sm:px-8 pt-8 pb-[calc(2rem+var(--safe-bottom,0px))] pl-[var(--safe-left,0px)] pr-[var(--safe-right,0px)] transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <Logo to={user ? dashboardPath : "/"} size="sm" />
        <div className="flex flex-wrap justify-center gap-6 text-xs text-[#9ca3af]">
          {[
            { label: "About", to: "/about" },
            { label: "Privacy", to: "/privacy" },
            { label: "Terms", to: "/terms" },
            { label: "Cookies", to: "/cookies" },
            { label: "FAQ", to: "/faq" },
            { label: "Contact", to: "/contact" },
          ].map(({ label, to }) => (
            <Link key={label} to={to as any} className="hover:text-[#E28743] transition-colors">
              {label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-[#6b7280]">
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
    <div className="relative overflow-hidden border-b border-white/[0.08] py-12 sm:py-16 text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_-10%,rgba(201,106,61,0.08),transparent_60%)]" />
      </div>
      <div className="relative max-w-xl mx-auto px-4 sm:px-6 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#C96A3D]/25 bg-[#C96A3D]/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#E28743] mb-1">
          <Sparkles className="h-3 w-3" />
          {label}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-white">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
        {title}
      </h2>
      <div className="space-y-3.5 text-sm text-[#9ca3af] [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:list-disc [&_li]:leading-relaxed [&_p]:leading-relaxed [&_strong]:text-white [&_a]:text-[#E28743] [&_a]:font-semibold [&_a]:hover:underline [&_a]:transition-colors">
        {children}
      </div>
    </div>
  );
}
