import { ForgotPasswordForm } from "@/features/auth/forms";
import { redirectIfAuthenticated } from "@/lib/auth";

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <ForgotPasswordForm />
    </main>
  );
}
