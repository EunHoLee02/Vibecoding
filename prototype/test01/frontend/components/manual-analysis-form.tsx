"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createAnalysis } from "@/lib/api";
import { AmountUnit, SupplementInput } from "@/lib/types";

type IngredientDraft = {
  ingredient_name_raw: string;
  amount_value: string;
  amount_unit: AmountUnit;
};

type SupplementDraft = {
  supplement_name: string;
  daily_servings: string;
  ingredients: IngredientDraft[];
};

const emptyIngredient = (): IngredientDraft => ({
  ingredient_name_raw: "",
  amount_value: "",
  amount_unit: "mg",
});

const emptySupplement = (): SupplementDraft => ({
  supplement_name: "",
  daily_servings: "1",
  ingredients: [emptyIngredient()],
});

export function ManualAnalysisForm() {
  const router = useRouter();
  const [supplements, setSupplements] = useState<SupplementDraft[]>([emptySupplement()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateSupplement(index: number, key: keyof SupplementDraft, value: string) {
    setSupplements((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  function updateIngredient(
    supplementIndex: number,
    ingredientIndex: number,
    key: keyof IngredientDraft,
    value: string,
  ) {
    setSupplements((current) =>
      current.map((supplement, currentIndex) => {
        if (currentIndex !== supplementIndex) {
          return supplement;
        }

        return {
          ...supplement,
          ingredients: supplement.ingredients.map((ingredient, currentIngredientIndex) =>
            currentIngredientIndex === ingredientIndex
              ? { ...ingredient, [key]: value }
              : ingredient,
          ),
        };
      }),
    );
  }

  function addSupplement() {
    setSupplements((current) => [...current, emptySupplement()]);
  }

  function addIngredient(supplementIndex: number) {
    setSupplements((current) =>
      current.map((supplement, currentIndex) =>
        currentIndex === supplementIndex
          ? { ...supplement, ingredients: [...supplement.ingredients, emptyIngredient()] }
          : supplement,
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: SupplementInput[] = supplements.map((supplement) => ({
        supplement_name: supplement.supplement_name.trim(),
        daily_servings: Number(supplement.daily_servings),
        source_type: "manual",
        ingredients: supplement.ingredients.map((ingredient) => ({
          ingredient_name_raw: ingredient.ingredient_name_raw.trim(),
          amount_value: Number(ingredient.amount_value),
          amount_unit: ingredient.amount_unit,
        })),
      }));

      const result = await createAnalysis(payload);
      router.push(`/result/${result.analysis_id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석 실행에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      {error ? <div className="alert error">{error}</div> : null}

      {supplements.map((supplement, supplementIndex) => (
        <section className="form-card stack" key={`supplement-${supplementIndex}`}>
          <h2 className="section-title">영양제 {supplementIndex + 1}</h2>
          <div className="input-grid two">
            <div className="field">
              <label>제품명</label>
              <input
                value={supplement.supplement_name}
                onChange={(event) =>
                  updateSupplement(supplementIndex, "supplement_name", event.target.value)
                }
                placeholder="예: Daily Vitamin C"
                required
              />
            </div>
            <div className="field">
              <label>1일 섭취 횟수</label>
              <input
                value={supplement.daily_servings}
                onChange={(event) =>
                  updateSupplement(supplementIndex, "daily_servings", event.target.value)
                }
                inputMode="numeric"
                required
              />
            </div>
          </div>

          <div className="ingredient-table">
            {supplement.ingredients.map((ingredient, ingredientIndex) => (
              <div className="panel input-grid two" key={`ingredient-${ingredientIndex}`}>
                <div className="field">
                  <label>성분명</label>
                  <input
                    value={ingredient.ingredient_name_raw}
                    onChange={(event) =>
                      updateIngredient(
                        supplementIndex,
                        ingredientIndex,
                        "ingredient_name_raw",
                        event.target.value,
                      )
                    }
                    placeholder="예: Vitamin C"
                    required
                  />
                </div>
                <div className="field">
                  <label>함량</label>
                  <input
                    value={ingredient.amount_value}
                    onChange={(event) =>
                      updateIngredient(
                        supplementIndex,
                        ingredientIndex,
                        "amount_value",
                        event.target.value,
                      )
                    }
                    inputMode="decimal"
                    placeholder="예: 500"
                    required
                  />
                </div>
                <div className="field">
                  <label>단위</label>
                  <select
                    value={ingredient.amount_unit}
                    onChange={(event) =>
                      updateIngredient(
                        supplementIndex,
                        ingredientIndex,
                        "amount_unit",
                        event.target.value,
                      )
                    }
                  >
                    <option value="mg">mg</option>
                    <option value="mcg">mcg</option>
                    <option value="CFU">CFU</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="nav">
            <button onClick={() => addIngredient(supplementIndex)} type="button">
              성분 추가
            </button>
          </div>
        </section>
      ))}

      <div className="nav">
        <button onClick={addSupplement} type="button">
          영양제 추가
        </button>
        <button className="button-primary" disabled={loading} type="submit">
          {loading ? "분석 중..." : "분석 실행"}
        </button>
      </div>
    </form>
  );
}
