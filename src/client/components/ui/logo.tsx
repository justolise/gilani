import { Link } from "@tanstack/react-router";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  to?: string;
  onClick?: () => void;
}

export function Logo({
  className = "",
  iconOnly = false,
  size = "md",
  to = "/",
  onClick,
}: LogoProps) {
  const sizeClasses = {
    sm: { text: "text-lg md:text-xl", container: "gap-2" },
    md: { text: "text-2xl md:text-2xl lg:text-3xl", container: "gap-2" },
    lg: { text: "text-4xl md:text-5xl lg:text-6xl", container: "gap-3.5" },
  };

  const currentSize = sizeClasses[size];
  const isCentered = className.includes("mx-auto");
  const innerClass = className.replace("mx-auto", "").trim();

  const logoContent = (
    <div className={`flex items-center justify-center ${currentSize.container} ${innerClass}`}>
      <span
        className={`font-bold italic tracking-tight ${currentSize.text}`}
        style={{
          background: "linear-gradient(135deg, #d4754a 0%, #e8924a 55%, #f3a05a 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 12px rgba(212,117,74,0.35))",
        }}
      >
        {iconOnly ? "G" : "GilaniAI"}
      </span>
    </div>
  );

  return (
    <Link
      to={to as any}
      onClick={onClick}
      className={`hover:opacity-85 transition-opacity select-none ${
        isCentered ? "block w-fit mx-auto" : "block"
      }`}
    >
      {logoContent}
    </Link>
  );
}
