import React from "react";
import { Skeleton } from "@/client/components/ui/skeleton";

export function DocumentsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 w-full animate-in fade-in duration-300">
      {/* Search bar placeholder */}
      <div className="relative">
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      {/* Document cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-5 w-48 max-w-full rounded-md" />
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-7 w-20 rounded-full shrink-0" />
            </div>

            <div className="space-y-2 pt-1">
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-4/5 rounded-md" />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
