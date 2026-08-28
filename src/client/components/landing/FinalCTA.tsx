import { Link } from "@tanstack/react-router";

export default function FinalCTA() {
  return (
    <section className="w-full bg-[#0a0a0a] py-28 relative overflow-hidden border-t border-white/5">
      {/* Dual glowing spots */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#C96A3D]/5 blur-[130px] rounded-full mix-blend-screen opacity-60"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#E28743]/5 blur-[130px] rounded-full mix-blend-screen opacity-40"></div>

      {/* Graph Paper Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-45"></div>

      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-6 text-center relative z-10">
        <span className="inline-block rounded-full bg-[#C96A3D]/10 border border-[#C96A3D]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#E28743] mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(201,106,61,0.1)] animate-pulse">
          Get Started Today
        </span>
        <h2 className="mb-6 font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl max-w-3xl leading-[1.15]">
          Your next question deserves a Socratic guide.
        </h2>
        <p className="mb-10 text-base font-light text-[#a1a1aa] sm:text-lg max-w-xl leading-relaxed">
          Free to start. No credit card required. Grounded in your curriculum from day one.
        </p>
        <Link
          to="/login"
          search={{ redirect: undefined, signout: undefined }}
          className="group relative rounded-full bg-[#C96A3D] px-10 py-5 text-lg font-bold text-white shadow-[0_0_30px_rgba(201,106,61,0.3)] transition-all hover:scale-105 hover:bg-[#E28743] active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <span className="relative">Join GilaniAI Free</span>
        </Link>
      </div>
    </section>
  );
}
