import { ThreadActionSheet } from "@/client/components/layout/ThreadActionSheet";
import { EscalateModal } from "@/client/components/tutor/EscalateModal";
import type { useAuthedShell } from "@/client/components/layout/hooks/useAuthedShell";
import { SidebarUserMenu } from "./sidebar/SidebarUserMenu";
import { SidebarRail } from "./sidebar/SidebarRail";
import { SidebarThreadList } from "./sidebar/SidebarThreadList";

type Props = {
  shell: ReturnType<typeof useAuthedShell>;
};

export function Sidebar({ shell }: Props) {
  const {
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    toggleCollapsed,
    isTeacher,
    isAdmin,
    path,
    threads,
    threadsLoading,
    groupedThreads,
    createNewThread,
    renamingId,
    setRenamingId,
    renameValue,
    setRenameValue,
    renameInputRef,
    startRename,
    commitRename,
    revealedThreadId,
    setRevealedThreadId,
    handleThreadTouchStart,
    handleThreadTouchEnd,
    longPressTriggeredRef,
    deleteConfirmId,
    setDeleteConfirmId,
    handleDeleteThread,
    profileName,
    avatarUrl,
    currentPlan,
    curriculum,
    user,
    signOut,
    escalationStatuses,
    escalateSheetThreadId,
    setEscalateSheetThreadId,
    escalateEmail,
    setEscalateEmail,
    escalating,
    escalateError,
    setEscalateError,
    handleEscalateThread,
    exportingThreadId,
    handleExportThreadPDF,
    setShowPlans,
  } = shell;

  // Right panel is shown for students only when sidebar is not collapsed
  const hasPanel = !isTeacher && !isAdmin && !collapsed;

  const renderUserMenu = (isCompact = false) => (
    <SidebarUserMenu
      isCompact={isCompact}
      avatarUrl={avatarUrl}
      profileName={profileName}
      userEmail={user?.email}
      currentPlan={currentPlan}
      curriculum={curriculum}
      onCloseSidebar={() => setSidebarOpen(false)}
      onSignOut={signOut}
    />
  );

  return (
    <>
      {/* ── Sidebar Shell ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col lg:flex-row
          border-r border-border/50
          bg-sidebar/95 backdrop-blur-xl
          shadow-xl lg:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)]
          overflow-hidden
          transition-[transform,width] duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-screen
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "w-14" : "w-[340px]"}
        `}
      >
        <SidebarRail
          path={path}
          isTeacher={isTeacher}
          isAdmin={isAdmin}
          collapsed={collapsed}
          hasPanel={hasPanel}
          toggleCollapsed={toggleCollapsed}
          setSidebarOpen={setSidebarOpen}
          userMenu={renderUserMenu(true)}
        />

        {hasPanel && (
          <SidebarThreadList
            path={path}
            threads={threads}
            threadsLoading={threadsLoading}
            groupedThreads={groupedThreads}
            createNewThread={createNewThread}
            renamingId={renamingId}
            setRenamingId={setRenamingId}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            renameInputRef={renameInputRef}
            startRename={startRename}
            commitRename={commitRename}
            handleThreadTouchStart={handleThreadTouchStart}
            handleThreadTouchEnd={handleThreadTouchEnd}
            longPressTriggeredRef={longPressTriggeredRef}
            setDeleteConfirmId={setDeleteConfirmId}
            setSidebarOpen={setSidebarOpen}
            userMenu={renderUserMenu(false)}
            currentPlan={currentPlan}
            setShowPlans={setShowPlans}
          />
        )}

        {/* Mobile-only user menu for teacher/admin (no right panel exists to hold it) */}
        {(isTeacher || isAdmin) && (
          <div className="lg:hidden mt-auto flex-shrink-0 border-t border-border/30 p-3 bg-sidebar flex flex-row items-center justify-between gap-2">
            <div className="flex-1 min-w-0">{renderUserMenu(false)}</div>
          </div>
        )}
      </aside>

      {/* ── Modals ── */}
      {revealedThreadId &&
        (() => {
          const activeThread = threads.find((th) => th.id === revealedThreadId);
          if (!activeThread) return null;
          return (
            <ThreadActionSheet
              thread={activeThread}
              escalationStatus={escalationStatuses[activeThread.id] ?? null}
              isExporting={exportingThreadId === activeThread.id}
              onClose={() => setRevealedThreadId(null)}
              onRename={() => {
                startRename(activeThread.id, activeThread.title || "Untitled Chat");
                setRevealedThreadId(null);
              }}
              onExport={() => {
                handleExportThreadPDF(activeThread.id);
                setRevealedThreadId(null);
              }}
              onEscalate={() => {
                setEscalateSheetThreadId(activeThread.id);
                setRevealedThreadId(null);
              }}
              onDelete={() => {
                setDeleteConfirmId(activeThread.id);
                setRevealedThreadId(null);
              }}
            />
          );
        })()}

      {escalateSheetThreadId && (
        <EscalateModal
          teacherEmail={escalateEmail}
          onEmailChange={(val) => {
            setEscalateEmail(val);
            setEscalateError("");
          }}
          onConfirm={() => handleEscalateThread(escalateSheetThreadId, escalateEmail)}
          onCancel={() => {
            setEscalateSheetThreadId(null);
            setEscalateEmail("");
            setEscalateError("");
          }}
          isEscalating={escalating}
          error={escalateError}
        />
      )}
    </>
  );
}
