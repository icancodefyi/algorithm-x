import type { ReactNode } from "react";
import { ReportWorkflowProvider } from "@/components/report/ReportWorkflowContext";
import { ReportWorkflowShell } from "@/components/report/ReportWorkflowShell";

export default async function ReportCaseLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  return (
    <ReportWorkflowProvider caseId={caseId}>
      <ReportWorkflowShell>{children}</ReportWorkflowShell>
    </ReportWorkflowProvider>
  );
}
