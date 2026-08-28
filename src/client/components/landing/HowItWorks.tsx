const STEPS = [
  {
    n: 1,
    title: "Tell it your curriculum",
    desc: "KCSE, CBC, or IGCSE — GilaniAI adapts its explanations, vocabulary, and exam style to match yours.",
  },
  {
    n: 2,
    title: "Ask, upload, or scan",
    desc: "Type a question, upload your notes as a PDF, or snap a photo of a tricky problem.",
  },
  {
    n: 3,
    title: "Get taught, not just told",
    desc: "GilaniAI walks you through the reasoning with Socratic questions — so it sticks, not just for one exam.",
  },
  {
    n: 4,
    title: "Stuck? Escalate to a real teacher",
    desc: "If the AI can't get you there, one tap hands your question to an actual human teacher.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full bg-[#0a0a0a] py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-16 lg:mb-24 text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block rounded-full bg-[#C96A3D]/10 border border-[#C96A3D]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#E28743] backdrop-blur-sm shadow-[0_0_15px_rgba(201,106,61,0.1)]">
            How It Works
          </span>
          <h2 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Four steps to master any topic
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-7 left-[8%] right-[8%] h-0.5 border-t border-dashed border-white/[0.08] z-0"></div>

          {STEPS.map((step) => (
            <div
              key={step.n}
              className="group relative flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="absolute -inset-4 bg-[#C96A3D]/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 font-serif text-xl font-bold text-white shadow-xl group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#C96A3D] group-hover:to-[#E28743] group-hover:border-transparent group-hover:shadow-[0_0_25px_rgba(201,106,61,0.4)] transition-all duration-500">
                {step.n}
              </div>
              <h3 className="relative z-10 text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="relative z-10 text-sm text-[#a1a1aa] leading-relaxed max-w-xs md:max-w-none">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
