import { SampleInputPanel } from "@/components/sample-input-panel";

export default function InputSourcePage() {
  return (
    <main className="page-grid">
      <section className="hero stack">
        <div className="eyebrow">upload_or_sample_screen</div>
        <h1>샘플 선택이나 업로드 흐름으로도 같은 분석 결과를 확인할 수 있습니다.</h1>
        <p>
          실제 OCR 대신 샘플 데이터와 업로드 파일명 기반 mock parse를 사용합니다. 시연 목적상
          업로드 경험과 분석 연결만 빠르게 체험하도록 설계했습니다.
        </p>
      </section>
      <SampleInputPanel />
    </main>
  );
}
