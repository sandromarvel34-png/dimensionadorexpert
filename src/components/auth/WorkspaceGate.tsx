import { useEffect, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthGate";

export function WorkspaceGate({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  const { ownerId, ready, loading, loadError, syncError, syncing, pending, initialize, retrySync } =
    useAppStore();
  const userId = session.user.id;
  useEffect(() => {
    void initialize(userId);
    const online = () => {
      void useAppStore.getState().retrySync();
    };
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("online", online);
      useAppStore.getState().detach();
    };
  }, [userId, initialize]);

  if (ownerId !== userId || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md">
          {loading || ownerId !== userId ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary" />
              <p className="mt-3">Carregando seus dados...</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold">Não foi possível carregar sua conta</h1>
              <p className="mt-3 text-sm text-slate-600">{loadError}</p>
              <button className="btn-primary mt-5" onClick={() => void initialize(userId)}>
                Tentar novamente
              </button>
              <button className="btn-secondary mt-3" onClick={() => void signOut()}>
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
  const unsaved = Object.keys(pending.proposals).length > 0 || !!pending.company;
  return (
    <>
      {(syncError || unsaved || syncing > 0) && (
        <div
          role="status"
          className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 flex flex-wrap items-center justify-center gap-3"
        >
          <span>
            {syncError ? `Salvamento pendente: ${syncError}` : "Salvando seus dados na conta..."}
          </span>
          {syncError && (
            <button
              className="font-bold underline"
              disabled={syncing > 0}
              onClick={() => void retrySync()}
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}
      {children}
    </>
  );
}
