import { SampleStubPanel } from "@/components/sample-stub-panel";

export default function SamplePage() {
  return (
    <main className="stack">
      <section className="panel stack">
        <div className="badge info">SCR-003</div>
        <h1 className="section-title">샘플 업로드 stub</h1>
        <p className="muted">
          실제 OCR 대신 샘플 카드 또는 파일명 기반 stub 파싱으로 업로드 흐름만 빠르게 시연합니다.
        </p>
      </section>
      <SampleStubPanel />
    </main>
  );
}
