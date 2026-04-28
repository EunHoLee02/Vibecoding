import React from "react";

export function SupplementEditor({
  supplements,
  onSupplementChange,
  onIngredientChange,
  onAddSupplement,
  onRemoveSupplement,
  onAddIngredient,
  onRemoveIngredient,
}) {
  return (
    <div className="stack-lg">
      {supplements.map((supplement, supplementIndex) => (
        <section className="editor-card" key={`supplement-${supplementIndex}`}>
          <div className="editor-card__header">
            <div>
              <h3>영양제 {supplementIndex + 1}</h3>
              <p>제품명과 성분을 입력하면 같은 구조로 바로 분석합니다.</p>
            </div>
            {supplements.length > 1 ? (
              <button
                className="ghost-button"
                type="button"
                onClick={() => onRemoveSupplement(supplementIndex)}
              >
                영양제 삭제
              </button>
            ) : null}
          </div>

          <div className="grid-two">
            <label>
              <span>제품명</span>
              <input
                type="text"
                value={supplement.product_name}
                onChange={(event) =>
                  onSupplementChange(supplementIndex, "product_name", event.target.value)
                }
                placeholder="예: Morning Multi"
              />
            </label>

            <label>
              <span>제조사</span>
              <input
                type="text"
                value={supplement.manufacturer}
                onChange={(event) =>
                  onSupplementChange(supplementIndex, "manufacturer", event.target.value)
                }
                placeholder="선택 입력"
              />
            </label>
          </div>

          <div className="stack-md">
            <div className="section-row">
              <h4>성분 목록</h4>
              <button
                className="ghost-button"
                type="button"
                onClick={() => onAddIngredient(supplementIndex)}
              >
                성분 추가
              </button>
            </div>

            {supplement.ingredients.map((ingredient, ingredientIndex) => (
              <div className="ingredient-grid" key={`ingredient-${ingredientIndex}`}>
                <label>
                  <span>성분명</span>
                  <input
                    type="text"
                    value={ingredient.ingredient_name}
                    onChange={(event) =>
                      onIngredientChange(
                        supplementIndex,
                        ingredientIndex,
                        "ingredient_name",
                        event.target.value,
                      )
                    }
                    placeholder="예: Vitamin C"
                  />
                </label>

                <label>
                  <span>함량</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ingredient.amount}
                    onChange={(event) =>
                      onIngredientChange(supplementIndex, ingredientIndex, "amount", event.target.value)
                    }
                    placeholder="예: 500"
                  />
                </label>

                <label>
                  <span>단위</span>
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(event) =>
                      onIngredientChange(supplementIndex, ingredientIndex, "unit", event.target.value)
                    }
                    placeholder="mg"
                  />
                </label>

                <button
                  className="ghost-button ghost-button--danger"
                  type="button"
                  onClick={() => onRemoveIngredient(supplementIndex, ingredientIndex)}
                  disabled={supplement.ingredients.length === 1}
                >
                  성분 삭제
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      <button className="ghost-button" type="button" onClick={onAddSupplement}>
        영양제 추가
      </button>
    </div>
  );
}
