export function renderResultView(state) {
  if (!state.lastAnalysis) {
    return `
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>분석 결과 화면</h2>
            <p>아직 분석 결과가 없습니다. 입력 화면으로 돌아가 분석을 실행해 주세요.</p>
          </div>
        </div>
        <div class="button-row">
          <button class="button-primary" data-action="go-input">입력하러 가기</button>
        </div>
      </section>
    `;
  }

  const { supplements, duplicated_ingredients, risk_items, timing_guides, summary_text } =
    state.lastAnalysis;

  return `
    <section class="workspace">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2>분석 결과 화면</h2>
            <p>중복 성분, 프로토타입 기준 주의 항목, 복용 시간 가이드를 한 번에 확인합니다.</p>
          </div>
        </div>
        <div class="button-row">
          <button class="button-primary" data-action="go-input">다시 입력하기</button>
          <button class="button-secondary" data-action="go-sample">다른 샘플 보기</button>
          <button class="button-ghost" data-action="reset">초기화</button>
        </div>
      </div>
      <div class="result-grid">
        <article class="result-card">
          <h3>입력된 영양제 목록</h3>
          <div class="result-list">
            ${supplements
              .map(
                (supplement) => `
                  <div class="result-item">
                    <strong>${supplement.product_name}</strong>
                    <div class="meta">${supplement.manufacturer || "제조사 미입력"}</div>
                    <div class="meta">
                      ${supplement.ingredients
                        .map((ingredient) => `${ingredient.name} ${ingredient.amount}${ingredient.unit}`)
                        .join(", ")}
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
        <article class="result-card">
          <h3>중복 성분</h3>
          <div class="result-list">
            ${
              duplicated_ingredients.length > 0
                ? duplicated_ingredients
                    .map(
                      (item) => `
                        <div class="result-item">
                          <strong>${item.ingredient_name}</strong>
                          <div class="meta">합계 ${item.total_amount}${item.unit}</div>
                          <div class="meta">중복 제품: ${item.products.join(", ")}</div>
                        </div>
                      `
                    )
                    .join("")
                : `<div class="result-item">중복 성분이 없습니다.</div>`
            }
          </div>
        </article>
        <article class="result-card">
          <h3>과다 가능성</h3>
          <div class="result-list">
            ${
              risk_items.length > 0
                ? risk_items
                    .map(
                      (item) => `
                        <div class="result-item">
                          <strong>${item.ingredient_name}</strong>
                          <div class="meta">합계 ${item.total_amount}${item.unit} / 기준 ${item.guide_amount}${item.guide_unit}</div>
                          <div class="meta">${item.reason}</div>
                        </div>
                      `
                    )
                    .join("")
                : `<div class="result-item">프로토타입 기준 주의 항목이 없습니다.</div>`
            }
          </div>
        </article>
        <article class="result-card">
          <h3>복용 시간 가이드</h3>
          <div class="result-list">
            ${timing_guides
              .map(
                (item) => `
                  <div class="result-item">
                    <strong>${item.product_name}</strong>
                    <div class="meta">${item.suggested_time}</div>
                    <div class="meta">${item.reason}</div>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
      </div>
      <article class="panel">
        <h3>요약 한 줄</h3>
        <div class="summary-list">
          <div class="result-item">${summary_text}</div>
        </div>
      </article>
    </section>
  `;
}
