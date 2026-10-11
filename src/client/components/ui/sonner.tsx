import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      gap={6}
      toastOptions={{
        classNames: {
          toast: [
            "group toast",
            "group-[.toaster]:!bg-[#10141f]",
            "group-[.toaster]:!border group-[.toaster]:!border-white/[0.08]",
            "group-[.toaster]:!shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
            "group-[.toaster]:text-[#f0ede8]",
            "group-[.toaster]:text-xs group-[.toaster]:font-medium",
            "group-[.toaster]:rounded-2xl",
            "group-[.toaster]:backdrop-blur-xl",
          ].join(" "),
          title: "group-[.toast]:text-[13px] group-[.toast]:font-semibold",
          description: ["group-[.toast]:text-white/45", "group-[.toast]:text-[11px]"].join(" "),
          // ── Success ─────────────────────────────
          success: [
            "group-[.toaster]:!bg-[#0d1a12]",
            "group-[.toaster]:!border-emerald-500/20",
            "group-[.toaster]:!text-emerald-300",
          ].join(" "),
          // ── Error ───────────────────────────────
          error: [
            "group-[.toaster]:!bg-[#1a0d0d]",
            "group-[.toaster]:!border-red-500/20",
            "group-[.toaster]:!text-red-300",
          ].join(" "),
          // ── Warning ─────────────────────────────
          warning: [
            "group-[.toaster]:!bg-[#1a160a]",
            "group-[.toaster]:!border-amber-500/20",
            "group-[.toaster]:!text-amber-300",
          ].join(" "),
          // ── Info ────────────────────────────────
          info: [
            "group-[.toaster]:!bg-[#0a1020]",
            "group-[.toaster]:!border-blue-500/20",
            "group-[.toaster]:!text-blue-300",
          ].join(" "),
          actionButton:
            "group-[.toast]:!bg-transparent group-[.toast]:text-white group-[.toast]:underline group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:!bg-transparent group-[.toast]:text-white/40 group-[.toast]:underline",
          closeButton:
            "group-[.toast]:!bg-white/[0.06] group-[.toast]:!border group-[.toast]:!border-white/[0.08] group-[.toast]:text-white/50 group-[.toast]:hover:text-white group-[.toast]:hover:!bg-white/[0.1] group-[.toast]:transition-all",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
