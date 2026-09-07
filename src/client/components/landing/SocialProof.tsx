export default function SocialProof() {
  return (
    <section className="w-full border-y border-white/[0.08] bg-[#0f1117]/60 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[rgba(255,255,255,0.35)]">
          For every student, every level, every curriculum
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            "KCSE",
            "CBC",
            "Cambridge IGCSE",
            "A-Level",
            "IB",
            "University",
            "Edexcel IGCSE",
            "Canadian Curriculum",
          ].map((name) => (
            <span
              key={name}
              className="rounded-full border border-white/[0.08] bg-white/5 px-4 py-1.5 text-sm font-semibold text-white/75 backdrop-blur-md hover:border-[#C96A3D]/40 hover:text-white transition-all duration-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
