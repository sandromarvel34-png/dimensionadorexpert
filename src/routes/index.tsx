import { useAppStore } from "@/lib/store";
import { Dashboard } from "@/components/Dashboard";
import { CalculatorWizard } from "@/components/CalculatorWizard";
import { ResultsView } from "@/components/ResultsView";
import { ProposalFlow } from "@/components/ProposalFlow";
import { Toaster } from "@/components/ui/sonner";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: CalculatorComponent,
});

import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/")({
  component: AppLayout,
});
