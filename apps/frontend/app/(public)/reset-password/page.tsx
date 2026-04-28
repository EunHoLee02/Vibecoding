import { Card, SectionTitle } from "@/components/ui/primitives";
import { ResetPasswordForm } from "@/features/auth/forms";
import { redirectIfAuthenticated } from "@/lib/auth";
import { AppApiError } from "@/lib/api/shared";
import { serverApi } from "@/lib/api/server";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawToken = resolvedSearchParams.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  await redirectIfAuthenticated();

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
        <Card className="w-full max-w-lg">
          <SectionTitle
            eyebrow="Account"
            title="재설정 토큰이 없습니다"
            description="`/reset-password?token=...` 형태의 링크로 진입해야 합니다."
          />
        </Card>
      </main>
    );
  }

  let isTokenValid = false;

  try {
    const validation = await serverApi<{ valid: boolean }>(
      `/api/v1/auth/password-reset/validate?token=${encodeURIComponent(token)}`,
    );
    isTokenValid = validation.valid;
  } catch (error) {
    if (error instanceof AppApiError && error.status === 400) {
      isTokenValid = false;
    } else {
      throw error;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <ResetPasswordForm isTokenValid={isTokenValid} token={token} />
    </main>
  );
}
