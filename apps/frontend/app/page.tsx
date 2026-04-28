import Link from "next/link";

import { redirectIfAuthenticated } from "@/lib/auth";

export default async function LandingPage() {
  await redirectIfAuthenticated();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between">
        <header className="flex items-center justify-between py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300">
              WellTrack
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">영양제 관리의 흐름을 한 화면에</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-white"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Sign up
            </Link>
          </div>
        </header>

        <section className="grid gap-8 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-300">
              P0 Frontend Workspace
            </p>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-5xl font-semibold leading-tight text-white">
                등록, OCR 검수, 중복 분석, 문의까지 한 흐름으로 이어집니다.
              </h2>
              <p className="max-w-2xl text-lg text-slate-300">
                5단계 와이어프레임의 카드형 대시보드와 10a 세션 기준을 반영해, 지금 단계에서는
                `/auth/me` 기반 인증과 P0 사용자 플로우가 바로 이어지도록 구성했습니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950"
              >
                회원가입 시작
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/12 px-6 py-3 text-sm font-semibold text-white"
              >
                로그인
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Quick Register", "직접 입력과 OCR 업로드를 모두 지원합니다."],
                ["Live Status", "OCR/분석 상태 화면은 2.5초 간격 폴링으로 이어집니다."],
                ["Review Before Save", "OCR 추출 결과를 검수한 뒤 저장합니다."],
                ["Session Based Auth", "토큰 저장 없이 HttpOnly cookie + /auth/me를 사용합니다."],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
