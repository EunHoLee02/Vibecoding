import Link from "next/link";

import { ResultSummaryCard } from "@/components/result-summary-card";
import { getAnalysisResult } from "@/lib/api";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;

  try {
    const result = await getAnalysisResult(analysisId);

    return (
      <main className="stack">
        <ResultSummaryCard result={result} />
        <div className="nav">
          <Link className="button-link" href="/manual">
            직접 입력 다시 시작
          </Link>
          <Link className="button-link" href="/sample">
            샘플 업로드 다시 시작
          </Link>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="stack">
        <section className="panel stack">
          <div className="badge danger">error</div>
          <h1 className="section-title">결과를 불러오지 못했습니다.</h1>
          <p className="muted">
            {error instanceof Error ? error.message : "분석 결과 조회 중 오류가 발생했습니다."}
          </p>
          <div className="nav">
            <Link className="button-link" href="/manual">
              직접 입력으로 이동
            </Link>
            <Link className="button-link" href="/sample">
              샘플 업로드로 이동
            </Link>
          </div>
        </section>
      </main>
    );
  }
}
