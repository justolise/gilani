import React from "react";
import { Skeleton } from "@/client/components/ui/skeleton";

export function PlannerSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 w-full animate-in fade-in duration-300">
      {[1, 2].map((i) => (
        <div key={i} className="border border-border/60 bg-card/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-52 max-w-full rounded-md" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-2 w-36 rounded-full" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>

          <div className="space-y-2.5 pt-3 border-t border-border/40">
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/20"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-4 w-4 rounded-md" />
                  <Skeleton className="h-4 w-44 max-w-full rounded-md" />
                </div>
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
