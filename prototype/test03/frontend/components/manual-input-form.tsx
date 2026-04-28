"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createAnalysis } from "@/lib/api";
import { saveLatestAnalysis } from "@/lib/result-storage";
import { AmountUnit, SupplementInput } from "@/lib/types";

type IngredientDraft = {
  ingredient_name: string;
  amount_value: string;
  amount_unit: AmountUnit;
};

type SupplementDraft = {
  product_name: string;
  manufacturer: string;
  ingredients: IngredientDraft[];
};

const emptyIngredient = (): IngredientDraft => ({
  ingredient_name: "",
  amount_value: "",
  amount_unit: "mg",
});

const emptySupplement = (): SupplementDraft => ({
  product_name: "",
  manufacturer: "",
  ingredients: [emptyIngredient()],
});

export function ManualInputForm() {
  const router = useRouter();
  const [supplements, setSupplements] = useState<SupplementDraft[]>([emptySupplement()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateSupplement(index: number, key: keyof SupplementDraft, value: string) {
    setSupplements((current) =>
      current.map((supplement, currentIndex) =>
        currentIndex === index ? { ...supplement, [key]: value } : supplement,
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

  function removeSupplement(index: number) {
    setSupplements((current) => {
      if (current.length === 1) {
        return current;
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
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

  function removeIngredient(supplementIndex: number, ingredientIndex: number) {
    setSupplements((current) =>
      current.map((supplement, currentIndex) => {
        if (currentIndex !== supplementIndex) {
          return supplement;
        }
        if (supplement.ingredients.length === 1) {
          return supplement;
        }
        return {
          ...supplement,
          ingredients: supplement.ingredients.filter((_, rowIndex) => rowIndex !== ingredientIndex),
        };
      }),
    );
  }

  function buildPayload(): SupplementInput[] | null {
    const normalized = supplements.map((supplement) => ({
      product_name: supplement.product_name.trim(),
      manufacturer: supplement.manufacturer.trim() || null,
      source_type: "manual" as const,
      ingredients: supplement.ingredients.map((ingredient) => ({
        ingredient_name: ingredient.ingredient_name.trim(),
        amount_value: Number(ingredient.amount_value),
        amount_unit: ingredient.amount_unit,
      })),
    }));

    const isInvalid = normalized.some(
      (supplement) =>
        !supplement.product_name ||
        supplement.ingredients.some(
          (ingredient) =>
            !ingredient.ingredient_name ||
            Number.isNaN(ingredient.amount_value) ||
            ingredient.amount_value <= 0,
        ),
    );

    if (isInvalid) {
      return null;
    }

    return normalized;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const payload = buildPayload();
    if (!payload) {
      setError("제품명과 성분명, 함량을 모두 확인해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const result = await createAnalysis(payload);
      saveLatestAnalysis(result);
      router.push("/result");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석 실행에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel stack">
      <div className="eyebrow">직접 입력 분석</div>
      <h2 className="section-title">시작/입력 화면</h2>
      <p className="muted">
        제품명과 성분을 최소 단위로 입력하면 같은 결과 구조로 바로 분석할 수 있습니다.
      </p>

      {error ? <div className="status-box error">{error}</div> : null}

      <form className="stack" onSubmit={handleSubmit}>
        {supplements.map((supplement, supplementIndex) => (
          <article className="supplement-card" key={`supplement-${supplementIndex}`}>
            <div className="row-actions">
              <strong>영양제 {supplementIndex + 1}</strong>
              <button
                className="button-danger"
                onClick={() => removeSupplement(supplementIndex)}
                type="button"
              >
                영양제 제거
              </button>
            </div>

            <div className="input-grid two">
              <div className="field">
                <label>product_name</label>
                <input
                  placeholder="예: Morning C Plus"
                  value={supplement.product_name}
                  onChange={(event) =>
                    updateSupplement(supplementIndex, "product_name", event.target.value)
                  }
                />
              </div>
              <div className="field">
                <label>manufacturer</label>
                <input
                  placeholder="예: Well Labs"
                  value={supplement.manufacturer}
                  onChange={(event) =>
                    updateSupplement(supplementIndex, "manufacturer", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="ingredient-grid">
              {supplement.ingredients.map((ingredient, ingredientIndex) => (
                <div className="ingredient-row" key={`ingredient-${ingredientIndex}`}>
                  <div className="input-grid two">
                    <div className="field">
                      <label>ingredient_name</label>
                      <input
                        placeholder="예: Vitamin C"
                        value={ingredient.ingredient_name}
                        onChange={(event) =>
                          updateIngredient(
                            supplementIndex,
                            ingredientIndex,
                            "ingredient_name",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="field">
                      <label>amount_value</label>
                      <input
                        inputMode="decimal"
                        placeholder="예: 500"
                        value={ingredient.amount_value}
                        onChange={(event) =>
                          updateIngredient(
                            supplementIndex,
                            ingredientIndex,
                            "amount_value",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="input-grid two">
                    <div className="field">
                      <label>amount_unit</label>
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
                        <option value="IU">IU</option>
                        <option value="CFU">CFU</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>행 관리</label>
                      <button
                        className="button-muted"
                        onClick={() => removeIngredient(supplementIndex, ingredientIndex)}
                        type="button"
                      >
                        성분 삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row-actions">
              <button onClick={() => addIngredient(supplementIndex)} type="button">
                성분 추가
              </button>
            </div>
          </article>
        ))}

        <div className="section-actions">
          <button onClick={addSupplement} type="button">
            영양제 추가
          </button>
          <Link className="button-link" href="/input-source">
            샘플 업로드 체험
          </Link>
          <button className="button-primary" disabled={loading} type="submit">
            {loading ? "분석 실행 중..." : "분석 실행"}
          </button>
        </div>
      </form>
    </section>
  );
}
