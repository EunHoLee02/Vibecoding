import { LoginForm } from "@/features/auth/forms";
import { redirectIfAuthenticated } from "@/lib/auth";
import { normalizeReturnTo } from "@/lib/utils";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawReturnTo = resolvedSearchParams.returnTo;
  const returnTo = Array.isArray(rawReturnTo) ? rawReturnTo[0] : rawReturnTo;

  await redirectIfAuthenticated(returnTo);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <LoginForm returnTo={normalizeReturnTo(returnTo)} />
    </main>
  );
}
