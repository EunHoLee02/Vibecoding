import { InquiryCreateForm } from "@/features/inquiries/components";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewInquiryPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawAnalysisRunId = resolvedSearchParams.analysisRunId;
  const rawSupplementId = resolvedSearchParams.supplementId;

  const analysisRunId = Array.isArray(rawAnalysisRunId)
    ? rawAnalysisRunId[0]
    : rawAnalysisRunId;
  const supplementId = Array.isArray(rawSupplementId)
    ? rawSupplementId[0]
    : rawSupplementId;

  return <InquiryCreateForm analysisRunId={analysisRunId} supplementId={supplementId} />;
}
