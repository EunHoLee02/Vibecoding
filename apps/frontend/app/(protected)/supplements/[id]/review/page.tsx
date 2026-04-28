import { OcrReviewForm } from "@/features/supplements/components";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OcrReviewPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawOcrJobId = resolvedSearchParams.ocrJobId;
  const ocrJobId = Array.isArray(rawOcrJobId) ? rawOcrJobId[0] : rawOcrJobId;

  return <OcrReviewForm ocrJobId={ocrJobId || id} />;
}
