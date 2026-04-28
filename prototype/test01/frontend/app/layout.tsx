import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Well Track Prototype",
  description: "입력 → 분석 → 결과 확인 흐름만 남긴 Well Track 프로토타입",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="page-shell">
          <div className="container">
            <header className="topbar">
              <div>
                <div className="brand">Well Track Prototype</div>
                <div className="muted">로그인 없는 영양제 조합 분석 데모</div>
              </div>
              <nav className="nav">
                <Link href="/">홈</Link>
                <Link href="/manual">직접 입력</Link>
                <Link href="/sample">샘플 업로드</Link>
              </nav>
            </header>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
