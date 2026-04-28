import { ManualAnalysisForm } from "@/components/manual-analysis-form";

export default function ManualPage() {
  return (
    <main className="stack">
      <section className="panel stack">
        <div className="badge info">SCR-002</div>
        <h1 className="section-title">직접 입력으로 분석 실행</h1>
        <p className="muted">
          제품명, 성분명, 함량을 입력한 뒤 바로 분석 결과를 확인할 수 있습니다.
        </p>
      </section>
      <ManualAnalysisForm />
    </main>
  );
}
