import { embed } from "ai";
import { supabaseAdmin } from "@/server/supabase";
import { withTimeout } from "@/shared/utils/async";
import { sanitizeUntrustedInput } from "@/shared/utils/tutor-prompt";
import { createGoogleAiProvider } from "@/server/ai-gateway.server";
import { isRateLimitError } from "./profile-cache.server";

export async function performRagRetrieval({
  userId,
  latestMessageContent,
  threadTitle,
}: {
  userId: string;
  latestMessageContent: string;
  threadTitle?: string | null;
}): Promise<string> {
  let notesContext = "";
  if (!latestMessageContent) return "";

  try {
    const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (geminiKey) {
      const embModel = createGoogleAiProvider().textEmbeddingModel();
      console.log(`[RAG] Using gemini for embeddings`);
      const { embedding } = await withTimeout(
        embed({
          model: embModel,
          value: latestMessageContent,
          maxRetries: 0,
          providerOptions: { google: { outputDimensionality: 768 } },
        }),
        60000,
        "Embedding generation timed out",
      );

      const embeddingStr = `[${(embedding as number[]).join(",")}]`;

      // ── Run both pools in parallel ────────────────────────────────
      const [personalResult, globalResult] = await Promise.allSettled([
        supabaseAdmin.rpc("match_note_chunks", {
          query_embedding: embeddingStr,
          match_user_id: userId,
          match_count: 5,
          match_threshold: 0.65,
        }),
        supabaseAdmin.rpc("match_global_note_chunks", {
          query_embedding: embeddingStr,
          match_count: 5,
          match_threshold: 0.65,
        }),
      ]);

      // ── Diagnostic logging ────────────────────────────────────────
      if (personalResult.status === "rejected") {
        console.error("[RAG] match_note_chunks RPC rejected:", personalResult.reason);
      } else if (personalResult.value.error) {
        console.error("[RAG] match_note_chunks RPC error:", personalResult.value.error);
      }
      if (globalResult.status === "rejected") {
        console.error("[RAG] match_global_note_chunks RPC rejected:", globalResult.reason);
      } else if (globalResult.value.error) {
        console.error("[RAG] match_global_note_chunks RPC error:", globalResult.value.error);
      }

      const personalChunks: string[] =
        personalResult.status === "fulfilled" && personalResult.value.data?.length
          ? personalResult.value.data.map((c: any) => c.content)
          : [];

      const globalChunks: string[] =
        globalResult.status === "fulfilled" && globalResult.value.data?.length
          ? globalResult.value.data.map((c: any) => c.content)
          : [];

      console.log(
        `[RAG Hit-Rate] Thread: ${threadTitle || "general"} | Personal: ${personalChunks.length}/5 | Global: ${globalChunks.length}/5`,
      );

      // ── Personal notes first, then global ─────────────────────────
      const allChunks: string[] = [];
      if (personalChunks.length) {
        allChunks.push("--- Your Notes ---");
        allChunks.push(...personalChunks);
      }
      if (globalChunks.length) {
        allChunks.push("--- Curriculum Library ---");
        allChunks.push(...globalChunks);
      }

      if (allChunks.length) {
        notesContext = sanitizeUntrustedInput(allChunks.join("\n---\n"));
      }
    } else {
      console.log("[RAG] No embedding provider available, skipping RAG");
    }
  } catch (err: unknown) {
    if (isRateLimitError(err)) {
      console.log(`[RAG] Embeddings rate limited, skipping RAG`);
    } else {
      console.error("[RAG] Failed:", err instanceof Error ? err.message : String(err));
    }
  }

  return notesContext;
}
