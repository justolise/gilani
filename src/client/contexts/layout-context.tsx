import { createContext, useContext } from "react";

export type LayoutContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: { id: string; [key: string]: any } | null;
  createNewThread: () => void | Promise<void>;
  requestRenameThread: (id: string, title: string) => void;
  requestDeleteThread: (id: string) => void;
};

const defaultLayoutValue: LayoutContextValue = {
  sidebarOpen: false,
  setSidebarOpen: () => {},
  user: null,
  createNewThread: () => {},
  requestRenameThread: () => {},
  requestDeleteThread: () => {},
};

export const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useOptionalLayout(): LayoutContextValue | null {
  return useContext(LayoutContext);
}

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    return defaultLayoutValue;
  }
  return ctx;
}
