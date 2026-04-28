export function renderLayout({ route, content, status }) {
  return `
    <main class="shell">
      <section class="hero">
        <div class="hero-card hero-grid">
          <div>
            <span class="eyebrow">Well Track Prototype</span>
            <h1>입력, 분석, 결과를 3분 안에.</h1>
            <p>
              영양제 정보를 직접 입력하거나 샘플 업로드 흐름으로 불러온 뒤,
              중복 성분과 프로토타입 기준 주의 항목, 복용 시간 가이드를 빠르게 확인합니다.
            </p>
            <div class="flow-list">
              <span class="flow-item">1. 입력</span>
              <span class="flow-item">2. 분석 실행</span>
              <span class="flow-item">3. 결과 확인</span>
            </div>
          </div>
          <div>
            <div class="pill-list">
              <span class="pill">로그인 없음</span>
              <span class="pill">Rule-based 분석</span>
              <span class="pill">Mock 업로드</span>
              <span class="pill">일반 가이드 표현</span>
            </div>
          </div>
        </div>
      </section>
      <nav class="route-nav">
        <span class="route-chip ${route === "/" ? "active" : ""}">/</span>
        <span class="route-chip ${route === "/sample" ? "active" : ""}">/sample</span>
        <span class="route-chip ${route === "/result" ? "active" : ""}">/result</span>
      </nav>
      ${status || ""}
      ${content}
      <p class="footer-note">
        기준: WellTrack 프롬프트 팩의 prototype 범위. 위험 기준값과 시간 가이드는 실제 의료 판단이 아니라 시연용 샘플 규칙입니다.
      </p>
    </main>
  `;
}

export function renderStatus(status) {
  if (!status) return "";
  return `<div class="status-banner ${status.type}">${status.message}</div>`;
}
