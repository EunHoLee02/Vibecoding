import { AnalysisStatusView } from "@/features/analyses/components";

type PageProps = {
  params: Promise<{ runId: string }>;
};

export default async function AnalysisStatusPage({ params }: PageProps) {
  const { runId } = await params;

  return <AnalysisStatusView runId={runId} />;
}
