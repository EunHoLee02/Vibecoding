import { ManualInputForm } from "@/components/manual-input-form";

export default function HomePage() {
  return (
    <main className="page-grid">
      <section className="hero stack">
        <div className="eyebrow">start_input_screen</div>
        <h1>입력한 영양제 조합을 바로 분석해보는 3분 데모</h1>
        <p>
          이 프로토타입은 로그인 없이 바로 시작합니다. 제품명과 성분을 입력하면 중복 성분,
          과다 가능성, 복용 시간 가이드를 일반적인 참고 수준에서 빠르게 정리해 보여줍니다.
        </p>
        <div className="pill-row">
          <span className="pill">로그인 없음</span>
          <span className="pill">rule-based 분석</span>
          <span className="pill">OCR stub/mock</span>
        </div>
      </section>

      <div className="split-layout">
        <ManualInputForm />

        <aside className="panel stack">
          <div className="eyebrow warn">시연 포인트</div>
          <h2 className="section-title">이 화면에서 바로 가능한 흐름</h2>
          <ul className="bullet-list muted">
            <li>영양제 제품명, 제조사, 성분 정보를 직접 입력</li>
            <li>성분 행 추가와 삭제</li>
            <li>분석 실행 후 결과 화면으로 이동</li>
          </ul>
          <div className="status-box info">
            파일 업로드나 샘플 기반 흐름을 보고 싶다면 상단의 `샘플 업로드 체험` 메뉴를 사용하면 됩니다.
          </div>
        </aside>
      </div>
    </main>
  );
}
