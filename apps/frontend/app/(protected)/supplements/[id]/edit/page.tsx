import { SupplementEditor } from "@/features/supplements/components";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSupplementPage({ params }: PageProps) {
  const { id } = await params;

  return <SupplementEditor mode="edit" supplementId={id} />;
}
