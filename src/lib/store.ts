import { createWorkspaceStore } from "./workspace/store";
import { workspaceRepository } from "./workspace/repository";
export const useAppStore = createWorkspaceStore(workspaceRepository, () =>
  typeof window === "undefined" ? null : window.localStorage,
);
