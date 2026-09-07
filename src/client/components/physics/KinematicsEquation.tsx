import type { DocumentBlock } from "@/client/components/renderer/types/document";
import { EquationToolbar, MathBlock } from "@/client/components/maths";

interface Props {
  block: DocumentBlock;
}

export default function KinematicsEquation({ block }: Props) {
  const equation = block.content || "";

  const customBlock: DocumentBlock = {
    ...block,
    content: equation,
    data: { ...((block.data as any) || {}), latex: equation },
  };

  return (
    <section className="my-6 overflow-hidden rounded-xl border border-sky-600">
      <EquationToolbar title="Kinematics Equation" />
      <MathBlock block={customBlock} />
      {block.metadata?.subject && (
        <div className="border-t border-white/[0.08] bg-[#131722] p-4 text-xs text-[#9ca3af]">
          {block.metadata.subject}
        </div>
      )}
    </section>
  );
}
