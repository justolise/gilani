import { useState, useEffect } from "react";
import { Copy, Check, Terminal, Loader2 } from "lucide-react";
import { supabase } from "@/client/supabase";

interface Props {
  checkoutRequestId: string;
}

/**
 * Shown inside PlansModal after a successful STK push when MPESA_ENV=sandbox.
 * Fetches the curl command from the secure /api/mpesa/sandbox-curl endpoint
 * (which reads MPESA_CALLBACK_SECRET server-side — never bundled in client JS).
 *
 * Only renders when VITE_MPESA_ENV=sandbox — never in production.
 */
export function SandboxHelper({ checkoutRequestId }: Props) {
  const [copied, setCopied] = useState(false);
  const [curlCmd, setCurlCmd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkoutRequestId) return;

    const fetchCurl = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const res = await fetch(
          `/api/mpesa/sandbox-curl?checkoutRequestId=${encodeURIComponent(checkoutRequestId)}`,
          {
            headers: session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {},
          },
        );

        if (!res.ok) throw new Error("Failed to fetch sandbox curl command");
        const data = await res.json();
        setCurlCmd(data.curlCommand);
      } catch (err: any) {
        setError(err?.message || "Failed to load sandbox helper");
      } finally {
        setLoading(false);
      }
    };

    fetchCurl();
  }, [checkoutRequestId]);

  const handleCopy = () => {
    if (!curlCmd) return;
    navigator.clipboard.writeText(curlCmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 text-left p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Terminal className="h-3 w-3 text-amber-700 dark:text-amber-400 flex-shrink-0" />
        <p className="font-mono text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
          Sandbox mode — simulate callback
        </p>
      </div>
      <p className="text-[10px] text-amber-600 dark:text-amber-500 leading-relaxed">
        Safaricom sandbox won&apos;t call back automatically. Run this in your terminal to complete
        the payment:
      </p>

      {loading && (
        <div className="flex items-center gap-2 py-2 text-amber-600 dark:text-amber-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-[10px] font-mono">Loading curl command…</span>
        </div>
      )}

      {error && <p className="text-[10px] text-red-500 font-mono">{error}</p>}

      {curlCmd && !loading && (
        <>
          <div className="relative">
            <pre className="rounded bg-amber-100 dark:bg-amber-900/40 p-2 text-[9px] font-mono text-amber-900 dark:text-amber-200 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {curlCmd}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-1.5 right-1.5 rounded p-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors"
              title="Copy curl command"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3 text-amber-700 dark:text-amber-300" />
              )}
            </button>
          </div>
          <p className="text-[9px] text-amber-500 dark:text-amber-600 font-mono">
            CheckoutID: {checkoutRequestId.slice(0, 24)}…
          </p>
        </>
      )}
    </div>
  );
}
