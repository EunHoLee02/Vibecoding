export function renderInputView(state) {
  const cards = state.supplements
    .map(
      (supplement, supplementIndex) => `
        <article class="supplement-card" data-supplement-index="${supplementIndex}">
          <div class="panel-header">
            <div>
              <h3>영양제 ${supplementIndex + 1}</h3>
              <p>제품명과 제조사를 입력하고, 성분을 최소 1개 이상 작성해 주세요.</p>
            </div>
            ${
              state.supplements.length > 1
                ? `<button class="button-ghost" data-action="remove-supplement" data-supplement-index="${supplementIndex}">영양제 삭제</button>`
                : ""
            }
          </div>
          <div class="field-grid">
            <div class="field">
              <label>product_name</label>
              <input
                type="text"
                value="${escapeHtml(supplement.product_name)}"
                data-field="product_name"
                data-supplement-index="${supplementIndex}"
                placeholder="예: 멀티비타민 데일리"
              />
            </div>
            <div class="field">
              <label>manufacturer optional</label>
              <input
                type="text"
                value="${escapeHtml(supplement.manufacturer)}"
                data-field="manufacturer"
                data-supplement-index="${supplementIndex}"
                placeholder="예: Well Track Sample"
              />
            </div>
          </div>
          <div class="ingredient-table">
            ${supplement.ingredients
              .map(
                (ingredient, ingredientIndex) => `
                  <div class="ingredient-row">
                    <div class="field">
                      <label>ingredient name</label>
                      <input
                        type="text"
                        value="${escapeHtml(ingredient.name)}"
                        data-field="ingredient-name"
                        data-supplement-index="${supplementIndex}"
                        data-ingredient-index="${ingredientIndex}"
                        placeholder="예: 비타민 C"
                      />
                    </div>
                    <div class="field">
                      <label>amount</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value="${escapeHtml(String(ingredient.amount || ""))}"
                        data-field="ingredient-amount"
                        data-supplement-index="${supplementIndex}"
                        data-ingredient-index="${ingredientIndex}"
                        placeholder="500"
                      />
                    </div>
                    <div class="field">
                      <label>unit</label>
                      <input
                        type="text"
                        value="${escapeHtml(ingredient.unit)}"
                        data-field="ingredient-unit"
                        data-supplement-index="${supplementIndex}"
                        data-ingredient-index="${ingredientIndex}"
                        placeholder="mg"
                      />
                    </div>
                    <div>
                      ${
                        supplement.ingredients.length > 1
                          ? `<button class="button-ghost" data-action="remove-ingredient" data-supplement-index="${supplementIndex}" data-ingredient-index="${ingredientIndex}">성분 삭제</button>`
                          : ""
                      }
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="button-row" style="margin-top: 16px;">
            <button class="button-secondary" data-action="add-ingredient" data-supplement-index="${supplementIndex}">성분 추가</button>
          </div>
        </article>
      `
    )
    .join("");

  return `
    <section class="workspace">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2>시작 / 입력 화면</h2>
            <p>직접 입력 흐름과 샘플 선택 흐름 중 원하는 방식으로 시작할 수 있습니다.</p>
          </div>
        </div>
        <div class="button-row">
          <button class="button-primary" data-action="analyze">분석 실행</button>
          <button class="button-secondary" data-action="go-sample">샘플 선택으로 이동</button>
          <button class="button-ghost" data-action="add-supplement">영양제 추가</button>
          <button class="button-ghost" data-action="reset">초기화</button>
        </div>
      </div>
      <div class="grid-two">
        ${cards}
      </div>
    </section>
  `;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
