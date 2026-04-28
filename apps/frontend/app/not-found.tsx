import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="max-w-lg rounded-[28px] border border-white/10 bg-slate-900/80 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">페이지를 찾을 수 없습니다.</h1>
        <p className="mt-3 text-sm text-slate-300">
          요청한 경로가 없거나 이동되었습니다. 대시보드로 돌아가서 다시 이어서 진행해 주세요.
        </p>
        <Link
          href="/app"
          className="mt-6 inline-flex rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          /app으로 이동
        </Link>
      </div>
    </div>
  );
}
