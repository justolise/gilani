import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { z } from "zod";

import { getPlanLimits } from "@/shared/plans";
import { authenticateRequest, getPlanRateLimitStatus } from "@/server/index";
import type { RateLimitAction } from "@/server/rate-limit.server";

export const getRateLimitStatus = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data }) => {
    const action = data as RateLimitAction;
    const request = getRequest();
    let authResult;
    try {
      authResult = await authenticateRequest(request);
    } catch {
      const freeLimits = getPlanLimits("free");
      return {
        isRateLimited: false as const,
        retryAfterMs: 0 as const,
        isDaily: false as const,
        messagesUsed: 0,
        messagesMax: freeLimits.dailyMessages,
        plan: "free",
      };
    }
    return getPlanRateLimitStatus(authResult.userId, action);
  });
