import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/client/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { Button } from "@/client/components/ui/button";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  const [activeChat, setActiveChat] = useState<"math" | "essay">("math");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90dvh] overflow-hidden flex flex-col border-white/10 bg-[#0f0f10]/95 backdrop-blur-2xl p-4 sm:p-6 text-white rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)]">
        <DialogHeader className="text-left space-y-1 shrink-0 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C96A3D]/30 bg-[#C96A3D]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#E28743]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E28743] animate-pulse"></span>
              Live Interactive Preview
            </span>
          </div>
          <DialogTitle className="font-serif text-xl sm:text-2xl font-bold text-white">
            See Socratic Tutoring in Action
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-white/60">
            GilaniAI guides you step-by-step rather than just spitting out solutions.
          </DialogDescription>
        </DialogHeader>

        {/* Browser window mockup container */}
        <div className="flex-1 min-h-0 mt-3 rounded-xl border border-white/10 bg-[#0a0a0a] flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="flex flex-row md:flex-col shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-[#121212]/80 p-2 md:p-3 gap-2 md:w-56 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveChat("math")}
              className={`flex-1 md:flex-none flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all text-left ${
                activeChat === "math"
                  ? "bg-[#C96A3D]/15 text-[#E28743] border border-[#C96A3D]/30 shadow-sm"
                  : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <span className="text-base">🧪</span>
              <div className="truncate">
                <div className="font-semibold truncate">Chemistry (Combustion)</div>
                <div className="text-[10px] text-white/40 hidden md:block">Balancing Equations</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveChat("essay")}
              className={`flex-1 md:flex-none flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all text-left ${
                activeChat === "essay"
                  ? "bg-[#C96A3D]/15 text-[#E28743] border border-[#C96A3D]/30 shadow-sm"
                  : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <span className="text-base">📜</span>
              <div className="truncate">
                <div className="font-semibold truncate">History Essay</div>
                <div className="text-[10px] text-white/40 hidden md:block">M.A.I.N. Framework</div>
              </div>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 min-h-0 flex flex-col bg-[#080808]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
              {activeChat === "math" ? (
                <>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#C96A3D] px-4 py-2.5 text-white shadow-md">
                      How do I balance the combustion of methane?
                    </div>
                  </div>

                  <div className="flex justify-start gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#C96A3D]/20 border border-[#C96A3D]/40 text-xs font-bold text-[#E28743]">
                      G
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#141414] border border-white/10 px-4 py-3 text-white/90 space-y-2">
                      <p>
                        Let's work through this together from first principles! Methane reacts with
                        oxygen:
                      </p>
                      <div className="font-mono text-xs bg-black/50 p-2.5 rounded-lg border border-white/5 text-[#E28743]">
                        CH₄ + O₂ → CO₂ + H₂O
                      </div>
                      <p>
                        1 Carbon is already balanced. Look at Hydrogen: we have 4 on the left (CH₄),
                        but only 2 on the right (H₂O).
                      </p>
                      <p className="text-[#E28743] font-medium">
                        What coefficient should we put before H₂O to match 4 hydrogens?
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#C96A3D] px-4 py-2.5 text-white shadow-md">
                      Multiply H₂O by 2!
                    </div>
                  </div>

                  <div className="flex justify-start gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#C96A3D]/20 border border-[#C96A3D]/40 text-xs font-bold text-[#E28743]">
                      G
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#141414] border border-white/10 px-4 py-3 text-white/90 space-y-2">
                      <p>Spot on! Now we have 4 hydrogens on both sides:</p>
                      <div className="font-mono text-xs bg-black/50 p-2.5 rounded-lg border border-white/5 text-[#E28743]">
                        CH₄ + O₂ → CO₂ + 2H₂O
                      </div>
                      <p className="text-[#E28743] font-medium">
                        Now, how many total oxygen atoms are on the right side?
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#C96A3D] px-4 py-2.5 text-white shadow-md">
                      Can you help me structure my essay on the causes of World War I?
                    </div>
                  </div>

                  <div className="flex justify-start gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#C96A3D]/20 border border-[#C96A3D]/40 text-xs font-bold text-[#E28743]">
                      G
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#141414] border border-white/10 px-4 py-3 text-white/90 space-y-2">
                      <p>
                        Let's build a rock-solid academic outline using the standard analytical
                        framework:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-white/80">
                        <li>
                          <strong>M</strong>ilitarism (Anglo-German naval arms race)
                        </li>
                        <li>
                          <strong>A</strong>lliances (Triple Entente vs Triple Alliance)
                        </li>
                        <li>
                          <strong>I</strong>mperialism (Scramble for Africa & Balkan crises)
                        </li>
                        <li>
                          <strong>N</strong>ationalism (Pan-Slavism in Serbia)
                        </li>
                      </ul>
                      <p className="text-[#E28743] font-medium">
                        Which of these do you think was the most fundamental root cause before the
                        assassination in Sarajevo?
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Simulated Input Bar */}
            <div className="p-3 border-t border-white/10 bg-[#121212]/90 flex items-center gap-2">
              <input
                type="text"
                disabled
                placeholder="Ask GilaniAI anything..."
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/50 cursor-not-allowed"
              />
              <Button
                asChild
                size="sm"
                className="rounded-xl bg-[#C96A3D] hover:bg-[#E28743] text-white text-xs font-bold px-4"
              >
                <Link
                  to="/login"
                  search={{ redirect: undefined, signout: undefined }}
                  onClick={() => onOpenChange(false)}
                >
                  Try Real Chat
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
