import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { AuthGate } from "@/components/auth/AuthGate";

function ProtectedApp() {
  return (
    <AuthGate>
      <AppLayout />
    </AuthGate>
  );
}

export const Route = createFileRoute("/")({
  component: ProtectedApp,
});
