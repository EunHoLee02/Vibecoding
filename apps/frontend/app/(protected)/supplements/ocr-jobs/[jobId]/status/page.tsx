import { OcrJobStatusView } from "@/features/supplements/components";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function OcrJobStatusPage({ params }: PageProps) {
  const { jobId } = await params;

  return <OcrJobStatusView jobId={jobId} />;
}
