import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { streamText, isStepCount } from "ai";
import { z } from "zod";
import { supabaseAdmin } from "@/server/supabase";
import { authenticateRequest } from "@/server/api-auth.server";
import { STATIC_SYSTEM_PROMPT, sanitizeCurriculum } from "@/shared/utils/tutor-prompt";
import { checkPlanRateLimit } from "@/server/rate-limit.server";
import { createGoogleAiProvider } from "@/server/ai-gateway.server";
import {
  getCachedProfile,
  setCachedProfile,
  isRateLimitError,
} from "@/server/chat/profile-cache.server";
import { performRagRetrieval } from "@/server/chat/rag.server";
import { createChatTools } from "@/server/chat/tools.server";
import { extractText, buildChatMessages } from "@/server/chat/prompt-builder.server";
import {
  persistUserMessage,
  buildThinkingSteps,
  persistAssistantResponse,
} from "@/server/chat/persistence.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async () => {
        let authResult: { userId: string } | undefined;
        try {
          const request = getRequest();
          try {
            authResult = await authenticateRequest(request);
          } catch (err) {
            console.error("[API Chat] Auth failed:", JSON.stringify({ error: String(err) }));
            if (err instanceof Response) return err;
            return new Response(JSON.stringify({ error: "Unauthorized access" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const { userId } = authResult;

          const chatSchema = z.object({
            threadId: z.string().max(200).optional(),
            messages: z.array(z.any()).max(200).optional(),
            isRetry: z.boolean().optional(),
            attachmentMeta: z
              .object({
                storageUrl: z.string().max(1000).optional(),
                mimeType: z.string().max(100).optional(),
                fileName: z.string().max(255).optional(),
              })
              .optional(),
          });

          const rawBody = await request.json().catch(() => ({}));
          const parseResult = chatSchema.safeParse(rawBody);
          if (!parseResult.success) {
            return new Response(JSON.stringify({ error: "Invalid request payload" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          const { threadId, messages, isRetry, attachmentMeta } = parseResult.data;

          const rlResult = await checkPlanRateLimit(userId, "chat", !!isRetry);
          if (!rlResult.allowed) {
            const seconds = Math.ceil(rlResult.retryAfterMs / 1000);
            const msg = rlResult.isDaily
              ? `Daily message limit reached. Resets in ${seconds}s.`
              : `Rate limit exceeded. Try again in ${seconds}s.`;
            return new Response(
              JSON.stringify({
                error: msg,
                retryAfterMs: rlResult.retryAfterMs,
                isDaily: rlResult.isDaily,
              }),
              {
                status: 429,
                headers: {
                  "Content-Type": "application/json",
                  "Retry-After": String(Math.ceil(rlResult.retryAfterMs / 1000)),
                },
              },
            );
          }

          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!threadId || !uuidRegex.test(threadId)) {
            return new Response(JSON.stringify({ error: "threadId required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // ─── Use ai-gateway, with automatic multi-provider fallback ──────
          const gateway = createGoogleAiProvider();
          const requestedModel = request.headers.get("x-model-id") || "gemini-2.5-flash";
          const chatModel = gateway.chatModel(requestedModel);

          if (!chatModel) {
            return new Response(JSON.stringify({ error: "No AI provider configured." }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          console.log(`[API Chat] Using provider: google (gemini), with fallback`);

          // ─── Database Checks ─────────────────────────────────────────────
          const lastMessage = messages?.[messages.length - 1];
          const latestMessageContent = extractText(lastMessage);
          const initialTitle =
            latestMessageContent
              .replace(/<[^>]+>/g, "")
              .replace(/\[[^\]]+\]/g, "")
              .trim()
              .slice(0, 50) || "Study Session";

          let { data: thread } = await supabaseAdmin
            .from("conversations")
            .select("*")
            .eq("id", threadId)
            .eq("user_id", userId)
            .maybeSingle();

          if (!thread) {
            // Auto-create thread with initial title
            const { data: newThread, error: createError } = await supabaseAdmin
              .from("conversations")
              .insert({
                id: threadId,
                user_id: userId,
                title: initialTitle,
                updated_at: new Date().toISOString(),
              })
              .select("*")
              .single();

            if (createError) {
              return new Response(JSON.stringify({ error: "Failed to create thread" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
              });
            }
            thread = newThread;
          } else if (!thread.title || thread.title === "New Chat" || thread.title === "Untitled") {
            // If thread existed without a title, backfill it
            await supabaseAdmin
              .from("conversations")
              .update({ title: initialTitle, updated_at: new Date().toISOString() })
              .eq("id", threadId);
          }

          // ─── Parallelize independent pre-stream work ────────────────────
          const messageTask = persistUserMessage({
            userId,
            threadId,
            lastMessage,
            isRetry,
            attachmentMeta,
          });

          const profileTask = (async () => {
            let profile = getCachedProfile(userId);
            if (!profile) {
              const { data: profileRow } = await supabaseAdmin
                .from("profiles")
                .select("display_name, curriculum, tutor_tone, tutor_style, tutor_depth")
                .eq("id", userId)
                .maybeSingle();
              profile = {
                studentName: profileRow?.display_name || null,
                curriculum: sanitizeCurriculum(profileRow?.curriculum),
                tutorTone: profileRow?.tutor_tone || "encouraging",
                tutorStyle: profileRow?.tutor_style || "socratic",
                tutorDepth: profileRow?.tutor_depth || "standard",
              };
              setCachedProfile(userId, profile);
            }
            return profile;
          })();

          const ragTask = performRagRetrieval({
            userId,
            latestMessageContent,
            threadTitle: thread?.title,
          });

          const [, cachedProfile, notesContext] = await Promise.all([
            messageTask,
            profileTask,
            ragTask,
          ]);

          const finalMessages = buildChatMessages({
            messages,
            cachedProfile,
            notesContext,
          });

          // ─── Stream with Gemini (auto-fallback to Groq/OpenAI/Mistral) ───
          console.log(`[API Chat] Streaming with provider: google (gemini)`);

          const streamAbortController = new AbortController();
          const streamTimeoutId = setTimeout(() => {
            console.error("[API Chat] Stream timed out waiting for first token — aborting.");
            streamAbortController.abort();
          }, 25000);

          const providerOptions = requestedModel.includes("gemini-2.5-flash")
            ? {
                providerOptions: {
                  google: {
                    thinkingConfig: { thinkingBudget: -1, includeThoughts: true },
                  },
                },
              }
            : {};

          const result = streamText({
            model: chatModel,
            instructions: STATIC_SYSTEM_PROMPT,
            messages: finalMessages,
            maxRetries: 2,
            temperature: 0.2,
            abortSignal: streamAbortController.signal,
            ...providerOptions,
            tools: createChatTools({ userId, cachedProfile }) as any,
            stopWhen: isStepCount(5),
            onError: (errorObj) => {
              const error = (errorObj as any)?.error || errorObj;
              clearTimeout(streamTimeoutId);
              console.error(
                `[API Chat] google onError:`,
                typeof error === "object" ? JSON.stringify(error).slice(0, 300) : String(error),
              );
            },
            onEnd: async ({ text: assistantText, providerMetadata, finishReason, steps }) => {
              clearTimeout(streamTimeoutId);
              const usage = (providerMetadata as any)?.google?.usageMetadata;
              const cachedTokens = usage?.cachedContentTokenCount ?? 0;
              const totalTokens = usage?.totalTokenCount ?? 0;
              const cacheHit = cachedTokens > 0;
              console.log(
                `[API Chat] google finished. Length: ${assistantText.length}. FinishReason: ${finishReason}. Tokens: ${totalTokens} (cached: ${cachedTokens}) Cache: ${cacheHit ? "✅ HIT" : "❌ MISS"}`,
              );

              const fullAssistantText =
                steps
                  ?.map((s) => s.text || "")
                  .filter(Boolean)
                  .join("\n\n") || assistantText;
              const safeText =
                fullAssistantText.trim() ||
                "Sorry, I could not generate a response right now. Please try again.";

              const thinkingSteps = buildThinkingSteps(steps);

              await persistAssistantResponse({
                threadId,
                userId,
                safeText,
                thinkingSteps,
                providerMetadata,
                result,
              });
            },
          });

          return result.toUIMessageStreamResponse({
            headers: {
              "Cache-Control": "no-cache, no-transform",
              "Content-Type": "text/event-stream",
              Connection: "keep-alive",
              "X-Accel-Buffering": "no",
            },
            onError: (error) => {
              const err = error as any;
              if (err?.name === "AbortError" || /aborted/i.test(String(err?.message || ""))) {
                return "GilaniAI is taking too long to respond. Please try again.";
              }
              if (isRateLimitError(error)) {
                return "The AI service is temporarily over capacity. Please try again in a moment.";
              }
              return "GilaniAI couldn't generate a response right now. Please try again — if this keeps happening, contact support.";
            },
          });
        } catch (error: unknown) {
          console.error(
            "[API Chat] Error:",
            JSON.stringify({
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              userId: authResult?.userId,
            }),
          );

          const isRateLimit = isRateLimitError(error);
          const errorMessage =
            isRateLimit || String(error).includes("503")
              ? "The AI tutor is temporarily busy. Please try again in a moment."
              : "GilaniAI couldn't generate a response right now. Please try again — if this keeps happening, contact support.";

          return new Response(`0:${JSON.stringify(errorMessage)}\n`, {
            status: 200,
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
              "X-Accel-Buffering": "no",
            },
          });
        }
      },
    },
  },
});
