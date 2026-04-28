"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, Card, FieldError, Input, SectionTitle } from "@/components/ui/primitives";
import { apiClient } from "@/lib/api/client";
import { AppApiError } from "@/lib/api/shared";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validators";

function ErrorMessage({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      {message}
    </div>
  );
}

function SuccessMessage({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
      {message}
    </div>
  );
}

function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="w-full max-w-lg">
      <SectionTitle eyebrow="Account" title={title} description={description} />
      <div className="mt-6">{children}</div>
    </Card>
  );
}

export function LoginForm({ returnTo }: { returnTo?: string | null }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: z.infer<typeof loginSchema>) =>
      apiClient("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      router.push(returnTo || "/app");
      router.refresh();
    },
  });

  const errorMessage =
    mutation.error instanceof AppApiError
      ? mutation.error.message
      : mutation.error
        ? "로그인 처리 중 오류가 발생했습니다."
        : null;

  return (
    <AuthCard
      title="로그인"
      description="`/api/v1/auth/me` 기반 보호 라우트를 쓰므로, 로그인 성공 후에는 바로 앱 셸로 이어집니다."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">이메일</label>
          <Input type="email" {...form.register("email")} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">비밀번호</label>
          <Input type="password" {...form.register("password")} />
          <FieldError message={form.formState.errors.password?.message} />
        </div>

        <ErrorMessage message={errorMessage} />

        <Button className="w-full" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "로그인 중..." : "로그인"}
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <Link href="/forgot-password" className="underline underline-offset-4">
            비밀번호 찾기
          </Link>
          <Link href="/signup" className="underline underline-offset-4">
            회원가입
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

export function SignupForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: z.infer<typeof signupSchema>) =>
      apiClient("/api/v1/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      router.push("/login?signup=success");
    },
  });

  const errorMessage =
    mutation.error instanceof AppApiError
      ? mutation.error.message
      : mutation.error
        ? "회원가입 처리 중 오류가 발생했습니다."
        : null;

  return (
    <AuthCard
      title="회원가입"
      description="3단계 확정 기준대로 가입 완료 후 자동 로그인하지 않고, 로그인 화면으로 이동시킵니다."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">이름</label>
          <Input {...form.register("name")} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">이메일</label>
          <Input type="email" {...form.register("email")} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">비밀번호</label>
          <Input type="password" {...form.register("password")} />
          <FieldError message={form.formState.errors.password?.message} />
        </div>

        <ErrorMessage message={errorMessage} />

        <Button className="w-full" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "가입 중..." : "회원가입"}
        </Button>

        <div className="text-sm text-slate-300">
          이미 계정이 있다면{" "}
          <Link href="/login" className="underline underline-offset-4">
            로그인
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

export function ForgotPasswordForm() {
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: z.infer<typeof forgotPasswordSchema>) =>
      apiClient<{ message?: string }>("/api/v1/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

  const errorMessage =
    mutation.error instanceof AppApiError
      ? mutation.error.message
      : mutation.error
        ? "요청 처리 중 오류가 발생했습니다."
        : null;

  return (
    <AuthCard
      title="비밀번호 찾기"
      description="5단계 와이어프레임 기준으로 이메일 링크 방식 재설정을 사용합니다."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">이메일</label>
          <Input type="email" {...form.register("email")} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>

        <ErrorMessage message={errorMessage} />
        <SuccessMessage
          message={
            mutation.isSuccess
              ? "메일 전송 요청을 접수했습니다. 개발 환경에서는 백엔드 로그를 함께 확인해 주세요."
              : null
          }
        />

        <Button className="w-full" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "요청 중..." : "재설정 메일 요청"}
        </Button>
      </form>
    </AuthCard>
  );
}

export function ResetPasswordForm({
  token,
  isTokenValid,
}: {
  token: string;
  isTokenValid: boolean;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      new_password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: z.infer<typeof resetPasswordSchema>) =>
      apiClient("/api/v1/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      router.push("/login?reset=success");
    },
  });

  const errorMessage =
    mutation.error instanceof AppApiError
      ? mutation.error.message
      : mutation.error
        ? "비밀번호 재설정 중 오류가 발생했습니다."
        : null;

  if (!isTokenValid) {
    return (
      <AuthCard
        title="링크가 유효하지 않습니다"
        description="10a API의 `/password-reset/validate` 결과를 기준으로 만료 여부를 확인했습니다."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            링크가 만료되었거나 사용할 수 없습니다. 비밀번호 찾기 화면에서 새 링크를 다시 요청해 주세요.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            비밀번호 찾기로 이동
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="비밀번호 재설정"
      description="토큰 검증이 완료된 경우에만 새 비밀번호를 제출할 수 있습니다."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <input type="hidden" {...form.register("token")} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">새 비밀번호</label>
          <Input type="password" {...form.register("new_password")} />
          <FieldError message={form.formState.errors.new_password?.message} />
        </div>

        <ErrorMessage message={errorMessage} />

        <Button className="w-full" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "변경 중..." : "비밀번호 변경"}
        </Button>
      </form>
    </AuthCard>
  );
}
