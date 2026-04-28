import { SupplementDetailView } from "@/features/supplements/components";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SupplementDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <SupplementDetailView supplementId={id} />;
}
