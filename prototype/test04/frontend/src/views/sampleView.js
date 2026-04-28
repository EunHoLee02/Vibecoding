export function renderSampleView() {
  return `
    <section class="workspace">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2>업로드 / 샘플 선택 화면</h2>
            <p>실제 OCR 대신 샘플 파싱 결과를 반환하는 mock 흐름입니다.</p>
          </div>
        </div>
        <div class="button-row">
          <button class="button-ghost" data-action="go-input">직접 입력으로 돌아가기</button>
        </div>
      </div>
      <div class="sample-grid">
        <article class="sample-card hero-card">
          <h3>샘플 선택</h3>
          <p>고정된 샘플 데이터를 불러와 바로 결과를 확인할 수 있습니다.</p>
          <div class="button-row" style="margin-top: 20px;">
            <button class="button-primary" data-action="load-sample" data-sample-key="daily_stack">데일리 밸런스 불러오기</button>
            <button class="button-secondary" data-action="load-sample" data-sample-key="immune_focus">이뮨 포커스 불러오기</button>
          </div>
        </article>
        <article class="sample-card hero-card">
          <h3>샘플 업로드</h3>
          <p>파일을 선택하면 파일명만 백엔드로 보내고, 내부에서는 샘플 파싱으로 처리합니다.</p>
          <div class="field" style="margin-top: 16px;">
            <label>mock file upload</label>
            <input type="file" id="mock-file-input" />
          </div>
          <div class="button-row" style="margin-top: 16px;">
            <button class="button-primary" data-action="mock-upload">업로드로 분석 준비</button>
          </div>
        </article>
      </div>
    </section>
  `;
}
