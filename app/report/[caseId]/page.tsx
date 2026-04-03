import { redirect } from "next/navigation";

export default async function ReportCaseIndexPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  redirect(`/report/${caseId}/analysis`);
}
