import { Link } from "@tanstack/react-router";
import { Logo } from "@/client/components/ui/logo";
import { Button } from "@/client/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <header className="relative z-40 h-14 sm:h-16 w-full flex-none border-b border-white/[0.08] bg-[#121212]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <Logo to="/" size="md" />

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="rounded-full bg-[#C96A3D] px-4 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-base font-bold text-white hover:bg-[#E28743] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(201,106,61,0.3)] hover:shadow-[0_0_28px_rgba(201,106,61,0.45)] flex items-center gap-1.5 cursor-pointer"
          >
            <Link to="/login" search={{ redirect: undefined, signout: undefined }}>
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
