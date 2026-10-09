import React from "react";
import { Skeleton } from "@/client/components/ui/skeleton";

export function QuizzesSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 w-full animate-in fade-in duration-300">
      {/* Search bar placeholder */}
      <Skeleton className="h-10 w-full rounded-xl" />

      {/* Grid of quiz cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-border/60 bg-card/60 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-3.5 w-12 rounded-md" />
              </div>
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
