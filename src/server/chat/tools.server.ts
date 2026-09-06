import { tool } from "ai";
import { z } from "zod";
import { supabaseAdmin } from "@/server/supabase";
import { sanitizeCurriculum } from "@/shared/utils/tutor-prompt";
import { setCachedProfile, type CachedProfile } from "./profile-cache.server";
import { queryCurriculumAndNotes } from "./rag.server";

export function createChatTools({
  userId,
  cachedProfile,
}: {
  userId: string;
  cachedProfile?: CachedProfile | null;
}) {
  return {
    searchCurriculumNotes: tool({
      description:
        "Search the student's uploaded personal study notes and the official curriculum library for specific syllabus topics, formulas, definitions, or marking scheme guidelines. " +
        "Call this tool to ground your teaching in the student's curriculum and uploaded materials BEFORE formulating an answer.",
      inputSchema: z.object({
        query: z
          .string()
          .describe("Specific syllabus topic, formula, question, or concept to look up"),
      }) as any,
      execute: (async ({ query }: any) => {
        console.log(`[API Chat] searchCurriculumNotes invoked. Query: "${query}"`);
        const result = await queryCurriculumAndNotes({
          userId,
          query,
          count: 5,
        });

        if (!result) {
          return {
            result:
              "No specific matching notes or curriculum documents found for this query in the library. Proceed with authoritative teaching principles or web search.",
          };
        }

        console.log(
          `[API Chat] searchCurriculumNotes returned matching content for query: "${query}"`,
        );
        return { result };
      }) as any,
    }) as any,

    evaluateCode: tool({
      description:
        "Execute Python or JavaScript code in a secure sandbox. " +
        "You MUST call this tool PROACTIVELY whenever: " +
        "(1) a question involves non-trivial mathematical calculations, equation solving, or scientific computation — write a Python script to compute and verify the exact numerical result rather than guessing; " +
        "(2) verifying student programming solutions or debugging code; " +
        "(3) validating algorithmic logic or physics/chemistry formulas computationally.",
      inputSchema: z.object({
        code: z.string().describe("The code string to run and verify"),
        language: z.enum(["javascript", "python"]),
      }) as any,
      execute: (async ({ code, language }: any) => {
        console.log(`[API Chat] evaluateCode tool invoked. Language: ${language}`);

        const judge0Key = (process.env.JUDGE0_API_KEY || "").trim();
        if (!judge0Key) {
          console.error("[API Chat] evaluateCode: JUDGE0_API_KEY not configured");
          return {
            output:
              "Code execution is temporarily unavailable. Please verify your solution manually for now.",
          };
        }

        const LANGUAGE_IDS: Record<string, number> = {
          javascript: 63, // Node.js 12.14.0
          python: 71, // Python 3.8.1
        };
        const languageId = LANGUAGE_IDS[language];

        try {
          const response = await fetch(
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "X-RapidAPI-Key": judge0Key,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
              },
              body: JSON.stringify({
                source_code: code,
                language_id: languageId,
                stdin: "",
              }),
              signal: AbortSignal.timeout(15000),
            },
          );

          if (!response.ok) {
            console.error(`[API Chat] evaluateCode: Judge0 HTTP ${response.status}`);
            return {
              output: "Code execution service returned an error. Please try again.",
            };
          }

          const result: any = await response.json();
          const statusDescription = result?.status?.description || "Unknown";
          const stdout = (result?.stdout || "").trim();
          const stderr = (result?.stderr || "").trim();
          const compileOutput = (result?.compile_output || "").trim();

          let output = `Status: ${statusDescription}`;
          if (compileOutput) output += `\nCompile output:\n${compileOutput.slice(0, 1500)}`;
          if (stdout) output += `\nOutput:\n${stdout.slice(0, 1500)}`;
          if (stderr) output += `\nErrors:\n${stderr.slice(0, 1500)}`;
          if (!compileOutput && !stdout && !stderr) output += "\n(No output produced.)";

          console.log(`[API Chat] evaluateCode result: ${statusDescription}`);
          return { output };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[API Chat] evaluateCode failed:", message);
          return {
            output:
              "Code execution timed out or failed. Please verify your solution manually for now.",
          };
        }
      }) as any,
    }) as any,

    searchWeb: tool({
      description:
        "Search the live web for verified facts, official curriculum documents, past exam questions, mark schemes, real-world data, and citations. " +
        "You MUST call this tool PROACTIVELY whenever: " +
        "(1) the question involves past papers, exam resources, revision materials, or specific curriculum documents; " +
        "(2) the question involves current events, dates, live statistics, or any factual claim that requires 100% verification; " +
        "(3) the student asks for links, websites, or external resources; " +
        "(4) you are uncertain of any factual nuance, formula, or law. " +
        "Do NOT rush to answer without verification. Prefer calling searchWeb multiple times with different targeted queries to build a fully grounded answer.",
      inputSchema: z.object({
        query: z
          .string()
          .describe(
            "A specific, targeted search query — be detailed and precise for best results.",
          ),
      }) as any,
      execute: (async ({ query }: any) => {
        console.log(`[API Chat] searchWeb tool invoked. Query: ${query}`);

        const tavilyKey = (process.env.TAVILY_API_KEY || "").trim();
        if (!tavilyKey) {
          console.error("[API Chat] searchWeb: TAVILY_API_KEY not configured");
          return {
            result:
              "Web search is temporarily unavailable. Answer using your existing knowledge and flag if the information may be outdated.",
          };
        }

        try {
          const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              api_key: tavilyKey,
              query,
              search_depth: "advanced",
              include_answer: true,
              include_raw_content: false,
              max_results: 8,
            }),
            signal: AbortSignal.timeout(15000),
          });

          if (!response.ok) {
            console.error(`[API Chat] searchWeb: Tavily HTTP ${response.status}`);
            return {
              result:
                "Web search failed. Answer using your existing knowledge and flag if the information may be outdated.",
            };
          }

          const data: any = await response.json();
          const answer = (data?.answer || "").trim();
          const results: any[] = Array.isArray(data?.results) ? data.results : [];

          const formattedResults = results
            .slice(0, 8)
            .map(
              (r: any, i: number) =>
                `${i + 1}. **${r.title || "Untitled"}** — ${r.url || "no url"}\n${(r.content || "").slice(0, 500)}`,
            )
            .join("\n\n");

          let result = "";
          if (answer) result += `AI Summary: ${answer}\n\n`;
          result += formattedResults
            ? `Web Results:\n${formattedResults}`
            : "No relevant results found.";

          console.log(
            `[API Chat] searchWeb: ${results.length} results returned for query: "${query}"`,
          );
          return { result };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[API Chat] searchWeb failed:", message);
          return {
            result:
              "Web search timed out or failed. Answer using your existing knowledge and flag if the information may be outdated.",
          };
        }
      }) as any,
    }) as any,
    setCurriculum: tool({
      description:
        'Call this ONCE when the student explicitly states their OWN curriculum or exam board for the first time in conversation (e.g. "I\'m doing KCSE", "this is for CBC"). Do NOT call this for incidental mentions of someone else\'s curriculum. This persists their curriculum so future sessions are personalised — it does not need to be called again once set.',
      inputSchema: z.object({
        curriculum: z.enum(["KCSE", "CBC", "IGCSE", "A-Level", "IB", "8-4-4", "CBE"]),
      }) as any,
      execute: (async ({ curriculum: newCurriculum }: any) => {
        const validated = sanitizeCurriculum(newCurriculum);
        if (!validated) {
          return { result: "Invalid curriculum value, not saved." };
        }
        if (cachedProfile?.curriculum === validated) {
          return { result: `Curriculum already set to ${validated}.` };
        }
        try {
          await supabaseAdmin.from("profiles").update({ curriculum: validated }).eq("id", userId);

          setCachedProfile(userId, {
            curriculum: validated,
            tutorTone: cachedProfile?.tutorTone ?? "",
            tutorStyle: cachedProfile?.tutorStyle ?? "",
            tutorDepth: cachedProfile?.tutorDepth ?? "",
          });

          console.log(`[API Chat] setCurriculum: saved ${validated} for user ${userId}`);
          return { result: `Curriculum set to ${validated}.` };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[API Chat] setCurriculum failed:", message);
          return {
            result: "Failed to save curriculum, will retry next time it's mentioned.",
          };
        }
      }) as any,
    }) as any,
  };
}
