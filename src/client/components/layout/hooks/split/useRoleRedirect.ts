import { useEffect } from "react";
import type { useNavigate, useRouter } from "@tanstack/react-router";

export function useRoleRedirect(params: {
  loading: boolean;
  user: unknown;
  roles: string[];
  path: string;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  signingOutRef: React.MutableRefObject<boolean>;
  navigate: ReturnType<typeof useNavigate>;
  router: ReturnType<typeof useRouter>;
}) {
  const {
    loading,
    user,
    roles,
    path,
    isAdmin,
    isTeacher,
    isStudent,
    signingOutRef,
    navigate,
    router,
  } = params;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      router.preloadRoute({ to: "/tutor" }).catch(() => {});
      router.preloadRoute({ to: "/settings" }).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (loading || signingOutRef.current || !user || roles.length === 0) return;
    if (isStudent && (path.startsWith("/admin") || path.startsWith("/teacher"))) {
      navigate({ to: "/tutor" as any });
    } else if (isTeacher && path.startsWith("/admin")) {
      navigate({ to: "/teacher/escalations" as any });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, roles, path]);
}
