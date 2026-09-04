import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/client/components/ui/dialog";
import { Mail, Phone, MapPin, Send, MessageCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/client/components/ui/button";
import { Link } from "@tanstack/react-router";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        throw new Error("Failed to send message.");
      }
      toast.success("Thank you! Your message has been received.");
      setName("");
      setEmail("");
      setMessage("");
      onOpenChange(false);
    } catch {
      // Fallback mailto
      window.location.href = `mailto:support@gilaniai.site?subject=Support Request from ${encodeURIComponent(
        name || "Student",
      )}&body=${encodeURIComponent(message)}`;
      toast.info("Opening email client to deliver your message.");
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85dvh] overflow-hidden flex flex-col border-white/10 bg-[#121214]/98 backdrop-blur-2xl p-5 sm:p-7 text-white rounded-2xl shadow-2xl">
        <DialogHeader className="text-left space-y-1.5 shrink-0 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C96A3D]/30 bg-[#C96A3D]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E28743] w-fit">
              <MessageCircle className="h-3.5 w-3.5" />
              Support & Inquiries
            </div>

            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#E28743] hover:underline font-semibold pr-6"
            >
              <span>View full contact page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Contact GilaniAI Support
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-white/60">
            Have questions, feedback, or need institutional partnerships? We're here to help.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
          {/* Quick contact buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <a
              href="https://wa.me/254102880577"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white hover:bg-white/[0.08] hover:border-emerald-500/40 transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="truncate">
                <div className="font-semibold text-white">WhatsApp</div>
                <div className="text-[10px] text-white/50">Instant chat</div>
              </div>
            </a>

            <a
              href="tel:+254710297603"
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white hover:bg-white/[0.08] hover:border-[#C96A3D]/40 transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C96A3D]/20 text-[#E28743] shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <div className="truncate">
                <div className="font-semibold text-white">Call Us</div>
                <div className="text-[10px] text-white/50">0710 297 603</div>
              </div>
            </a>

            <a
              href="mailto:support@gilaniai.site"
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white hover:bg-white/[0.08] hover:border-blue-500/40 transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div className="truncate">
                <div className="font-semibold text-white">Email</div>
                <div className="text-[10px] text-white/50">support@gilaniai.site</div>
              </div>
            </a>
          </div>

          {/* Direct message form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Achieng Omondi"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C96A3D]/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C96A3D]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Your Message</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help your studies or curriculum today?"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C96A3D]/50 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className="w-full rounded-full bg-[#C96A3D] py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#E28743] transition-all flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>{sending ? "Sending..." : "Send Message"}</span>
            </Button>
          </form>
        </div>

        {/* Modal Footer Link */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <span>Office location: Nairobi, Kenya 🇰🇪</span>
          <Link
            to="/contact"
            className="text-[#E28743] hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>Open full contact page</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
