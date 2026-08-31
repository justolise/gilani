import { useMemo } from "react";
import { UsageBanners } from "./UsageBanner";

const SUBJECTS = [
  { label: "Homework", prompt: "Check my homework answers before I submit" },
  { label: "Code", prompt: "Teach me the basics of programming with examples" },
  { label: "Maths", prompt: "Help me solve a maths problem step by step" },
  { label: "Essays", prompt: "Help me structure and write an essay" },
];

const MORNING_TEMPLATES = ["Good Morning{name}!", "Morning{name}!", "Rise and shine{name}!"];
const AFTERNOON_TEMPLATES = [
  "Good Afternoon{name}!",
  "Afternoon{name}!",
  "Hope you're having a good day{name}!",
];
const EVENING_TEMPLATES = [
  "Good Evening{name}!",
  "Evening{name}!",
  "Time to wind down or level up{name}?",
];
const MONDAY_TEMPLATES = [
  "Happy Monday{name}!",
  "Happy New Week{name}!",
  "Let's crush this week{name}!",
];
const FRIDAY_TEMPLATES = ["Happy Friday{name}!", "Finish strong{name}!"];

const MOTIVATIONAL_TEMPLATES = [
  "You got this{name}!",
  "Ready to shine{name}?",
  "Let's learn something new{name}!",
  "Keep up the great work{name}!",
  "Time to level up{name}!",
  "Stay curious{name}!",
  "You're doing amazing{name}!",
  "Let's crush it{name}!",
];

function getGreetingTemplate(): string {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday ... 1 = Monday ... 5 = Friday

  const timeTemplates =
    hour < 12 ? MORNING_TEMPLATES : hour < 17 ? AFTERNOON_TEMPLATES : EVENING_TEMPLATES;

  const pool = [
    ...timeTemplates,
    ...MOTIVATIONAL_TEMPLATES,
    ...(day === 1 ? MONDAY_TEMPLATES : []),
    ...(day === 5 ? FRIDAY_TEMPLATES : []),
  ];

  return pool[Math.floor(Math.random() * pool.length)];
}

type Props = {
  onPromptClick: (prompt: string) => void;
  onUploadClick?: () => void;
  onScanClick?: () => void;
  onVoiceClick?: () => void;
  isListening?: boolean;
  recentThreads?: { id: string; title?: string | null }[];
  allThreadsPath?: string;
  chatError?: string | null;
  isRateLimited?: boolean;
  messagesUsed?: number;
  messagesMax?: number;
  onUpgrade?: () => void;
  onRateLimitExpired?: () => void;
  /** First name of the signed-in user for the personalised greeting */
  userName?: string | null;
};

export function EmptyState({
  onPromptClick,
  chatError,
  isRateLimited,
  messagesUsed = 0,
  messagesMax,
  onUpgrade,
  onRateLimitExpired,
  userName,
}: Props) {
  // Recomputed on every mount, so it changes each time the user visits the empty state
  const greetingTemplate = useMemo(() => getGreetingTemplate(), []);
  const firstName = userName ? userName.split(" ")[0] : "";
  const nameToken = firstName ? `, ${firstName}` : "";
  const greeting = greetingTemplate.replace("{name}", nameToken);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-full px-4 sm:px-6 pb-24 md:pb-0 gap-6 md:gap-8 w-full max-w-3xl mx-auto flex-1 animate-in fade-in duration-500">
      {/* Shared Usage & Error Banners */}
      <UsageBanners
        chatError={chatError}
        onUpgrade={onUpgrade}
        onRateLimitExpired={onRateLimitExpired}
        messagesUsed={messagesUsed}
        messagesMax={messagesMax}
        isRateLimited={isRateLimited}
        className="w-full max-w-xl"
      />

      {/* Welcome Section */}
      <div className="flex flex-col items-center text-center space-y-1">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          {greeting}
        </h1>
      </div>

      {/* Prompt Pills */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-2 w-full">
        {SUBJECTS.map((subject) => (
          <button
            key={subject.label}
            onClick={() => onPromptClick(subject.prompt)}
            className="rounded-full border border-border/60 bg-transparent px-4 py-2 text-sm font-medium text-foreground/80 hover:border-primary/40 hover:text-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition-all"
          >
            {subject.label}
          </button>
        ))}
      </div>

      {/* Recent Chats intentionally removed for a cleaner empty state */}
    </div>
  );
}
