import { embed } from "ai";
import { supabaseAdmin } from "@/server/supabase";
import { withTimeout } from "@/shared/utils/async";
import { sanitizeUntrustedInput } from "@/shared/utils/tutor-prompt";
import { createGoogleAiProvider } from "@/server/ai-gateway.server";
import { isRateLimitError } from "./profile-cache.server";

export async function queryCurriculumAndNotes({
  userId,
  query,
  count = 5,
  matchThreshold = 0.65,
}: {
  userId: string;
  query: string;
  count?: number;
  matchThreshold?: number;
}): Promise<string> {
  if (!query?.trim()) return "";

  try {
    const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (geminiKey) {
      const embModel = createGoogleAiProvider().textEmbeddingModel();
      const { embedding } = await withTimeout(
        embed({
          model: embModel,
          value: query.trim(),
          maxRetries: 0,
          providerOptions: { google: { outputDimensionality: 768 } },
        }),
        30000,
        "Embedding generation timed out",
      );

      const embeddingStr = `[${(embedding as number[]).join(",")}]`;

      // ── Run both pools in parallel ────────────────────────────────
      const [personalResult, globalResult] = await Promise.allSettled([
        supabaseAdmin.rpc("match_note_chunks", {
          query_embedding: embeddingStr,
          match_user_id: userId,
          match_count: count,
          match_threshold: matchThreshold,
        }),
        supabaseAdmin.rpc("match_global_note_chunks", {
          query_embedding: embeddingStr,
          match_count: count,
          match_threshold: matchThreshold,
        }),
      ]);

      const personalChunks: string[] =
        personalResult.status === "fulfilled" && personalResult.value.data?.length
          ? personalResult.value.data.map((c: any) => c.content)
          : [];

      const globalChunks: string[] =
        globalResult.status === "fulfilled" && globalResult.value.data?.length
          ? globalResult.value.data.map((c: any) => c.content)
          : [];

      const allChunks: string[] = [];
      if (personalChunks.length) {
        allChunks.push("--- Student Personal Notes ---");
        allChunks.push(...personalChunks);
      }
      if (globalChunks.length) {
        allChunks.push("--- Curriculum & Syllabus Library ---");
        allChunks.push(...globalChunks);
      }

      if (allChunks.length) {
        return sanitizeUntrustedInput(allChunks.join("\n---\n"));
      }
    }
  } catch (err: unknown) {
    if (isRateLimitError(err)) {
      console.log(`[RAG] Embeddings rate limited, skipping retrieval`);
    } else {
      console.error("[RAG] Retrieval failed:", err instanceof Error ? err.message : String(err));
    }
  }

  return "";
}

export async function performRagRetrieval({
  userId,
  latestMessageContent,
  threadTitle,
}: {
  userId: string;
  latestMessageContent: string;
  threadTitle?: string | null;
}): Promise<string> {
  const result = await queryCurriculumAndNotes({
    userId,
    query: latestMessageContent,
    count: 5,
    matchThreshold: 0.65,
  });

  if (result) {
    console.log(`[RAG Hit] Pre-stream context retrieved for thread: ${threadTitle || "general"}`);
  }

  return result;
}
