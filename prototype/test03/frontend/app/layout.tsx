import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Well Track Prototype",
  description: "입력, 업로드, 분석 결과 확인 흐름만 담은 Well Track 프로토타입",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="page-shell">
          <div className="background-orb orb-a" />
          <div className="background-orb orb-b" />
          <div className="container">
            <header className="topbar">
              <div className="brand-block">
                <div className="brand">Well Track Prototype</div>
                <p className="brand-copy">영양제 조합을 빠르게 점검해보는 시연용 분석 흐름</p>
              </div>
              <nav className="topnav">
                <Link href="/">직접 입력</Link>
                <Link href="/input-source">샘플 업로드 체험</Link>
              </nav>
            </header>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
