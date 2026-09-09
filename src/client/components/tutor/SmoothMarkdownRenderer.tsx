import { useState, useEffect, useRef } from "react";
import { MarkdownRenderer } from "@/client/components/tutor/MarkdownRenderer";

interface SmoothMarkdownRendererProps {
  content: string;
  isStreaming: boolean;
  className?: string;
  onAnimationComplete?: () => void;
}

export function SmoothMarkdownRenderer({
  content,
  isStreaming,
  className,
  onAnimationComplete,
}: SmoothMarkdownRendererProps) {
  // If not streaming at mount time (i.e. this is a historical/saved message),
  // start fully revealed so we NEVER play the typewriter animation for old messages.
  const [displayedLength, setDisplayedLength] = useState(() =>
    isStreaming ? Math.min(content.length, 4) : content.length,
  );
  // Track whether we've finished the typewriter animation
  const [animationDone, setAnimationDone] = useState(() => !isStreaming);

  const targetRef = useRef(content);
  const isStreamingRef = useRef(isStreaming);
  const onAnimationCompleteRef = useRef(onAnimationComplete);

  // Keep refs current every render without triggering effects
  useEffect(() => {
    targetRef.current = content;
    isStreamingRef.current = isStreaming;
    onAnimationCompleteRef.current = onAnimationComplete;
  });

  // Single stable typewriter interval — created once, runs for the life of the component
  useEffect(() => {
    const interval = setInterval(() => {
      const target = targetRef.current;
      const streaming = isStreamingRef.current;

      setDisplayedLength((prev) => {
        if (prev >= target.length) {
          // Caught up — if streaming has also ended, mark animation as done
          if (!streaming) {
            setAnimationDone(true);
            onAnimationCompleteRef.current?.();
          }
          return prev;
        }

        // Typewriter pacing:
        // - Normal: 3–5 chars per tick (feels like natural typing)
        // - Catching up (stream ended, we're behind): fluid acceleration
        // - Very far behind: accelerate smoothly so we don't lag
        const diff = target.length - prev;
        let step: number;
        if (!streaming) {
          // Stream ended — catch up quickly and smoothly without an abrupt snap
          step = diff > 300 ? Math.ceil(diff / 6) : diff > 80 ? 14 : diff > 20 ? 8 : 4;
        } else {
          // Still streaming — gentle typewriter feel
          step = diff > 500 ? Math.ceil(diff / 30) : diff > 100 ? 6 : 3;
        }

        const next = Math.min(target.length, prev + step);
        if (next === target.length && !streaming) {
          setAnimationDone(true);
          onAnimationCompleteRef.current?.();
        }
        return next;
      });
    }, 20); // ~50 ticks/sec for ultra-smooth fluid typing

    return () => clearInterval(interval);
  }, []);

  // Reset when a new streaming session begins (content resets to empty)
  useEffect(() => {
    if (isStreaming && content.length === 0) {
      setDisplayedLength(0);
      setAnimationDone(false);
    } else if (isStreaming && content.length > 0 && displayedLength === 0) {
      // Paint first characters immediately to prevent 0-height empty layout flash
      setDisplayedLength(Math.min(content.length, 4));
    }
  }, [isStreaming, content.length, displayedLength]);

  // If not streaming and already marked as done, keep in sync with any static content updates
  useEffect(() => {
    if (!isStreaming && animationDone) {
      setDisplayedLength(content.length);
    }
  }, [isStreaming, content, animationDone]);

  // Safety fallback: if streaming ended, ensure animation finishes even on network drop
  useEffect(() => {
    if (!isStreaming && !animationDone) {
      const timer = setTimeout(() => {
        setDisplayedLength(content.length);
        setAnimationDone(true);
        onAnimationCompleteRef.current?.();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, animationDone, content.length]);

  // Once animation finishes and streaming is done, switch to static render
  if (animationDone && !isStreaming) {
    return <MarkdownRenderer content={content} isStreaming={false} className={className} />;
  }

  // During streaming or finishing animation — render the buffered slice
  return (
    <MarkdownRenderer
      content={content.slice(0, displayedLength)}
      isStreaming={!animationDone}
      className={className}
    />
  );
}
