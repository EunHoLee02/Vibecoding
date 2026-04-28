import { AnalysisResultView } from "@/features/analyses/components";

type PageProps = {
  params: Promise<{ analysisId: string }>;
};

export default async function AnalysisResultPage({ params }: PageProps) {
  const { analysisId } = await params;

  return <AnalysisResultView analysisId={analysisId} />;
}
