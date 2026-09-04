import { Link } from "@tanstack/react-router";
import { Logo } from "@/client/components/ui/logo";
import { Button } from "@/client/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <header className="relative z-40 h-14 sm:h-16 w-full flex-none border-b border-white/10 bg-[#121212]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <Logo to="/" size="md" />

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="rounded-full bg-[#C96A3D] px-4 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-base font-bold text-white hover:bg-[#E28743] hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(201,106,61,0.35)] flex items-center gap-1.5"
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
