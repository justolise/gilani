import { TutorHomeCockpit } from "./home/TutorHomeCockpit";

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
  curriculum?: string | null;
  userId?: string | null;
  activeInput?: string;
  onInputChange?: (text: string) => void;
};

export function EmptyState({
  onPromptClick,
  isRateLimited,
  onUpgrade,
  userName,
  curriculum,
  userId,
  activeInput,
  onInputChange,
}: Props) {
  return (
    <TutorHomeCockpit
      onPromptClick={onPromptClick}
      isRateLimited={isRateLimited}
      onUpgrade={onUpgrade}
      userName={userName}
      curriculum={curriculum}
      userId={userId}
      activeInput={activeInput}
      onInputChange={onInputChange}
    />
  );
}
