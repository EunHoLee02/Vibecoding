import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createAnalysis, createInputBundle } from "../api.js";
import { createEmptyIngredient, createEmptySupplement } from "../constants.js";
import { StatusMessage } from "../components/StatusMessage.jsx";
import { SupplementEditor } from "../components/SupplementEditor.jsx";

function validateSupplements(supplements) {
  if (supplements.length === 0) {
    return "최소 한 개 이상의 영양제를 입력해주세요.";
  }

  for (const supplement of supplements) {
    if (!supplement.product_name.trim()) {
      return "제품명은 비워둘 수 없습니다.";
    }

    if (supplement.ingredients.length === 0) {
      return "성분은 최소 한 개 이상 필요합니다.";
    }

    for (const ingredient of supplement.ingredients) {
      if (!ingredient.ingredient_name.trim()) {
        return "성분명은 비워둘 수 없습니다.";
      }

      if (!ingredient.amount || Number(ingredient.amount) <= 0) {
        return "성분 함량은 0보다 커야 합니다.";
      }

      if (!ingredient.unit.trim()) {
        return "성분 단위는 비워둘 수 없습니다.";
      }
    }
  }

  return null;
}

export function InputScreen() {
  const [supplements, setSupplements] = useState([createEmptySupplement()]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function updateSupplement(nextSupplements) {
    setSupplements(nextSupplements);
  }

  function handleSupplementChange(index, field, value) {
    const nextSupplements = structuredClone(supplements);
    nextSupplements[index][field] = value;
    updateSupplement(nextSupplements);
  }

  function handleIngredientChange(supplementIndex, ingredientIndex, field, value) {
    const nextSupplements = structuredClone(supplements);
    nextSupplements[supplementIndex].ingredients[ingredientIndex][field] = value;
    updateSupplement(nextSupplements);
  }

  function handleAddSupplement() {
    updateSupplement([...supplements, createEmptySupplement()]);
  }

  function handleRemoveSupplement(index) {
    updateSupplement(supplements.filter((_, supplementIndex) => supplementIndex !== index));
  }

  function handleAddIngredient(supplementIndex) {
    const nextSupplements = structuredClone(supplements);
    nextSupplements[supplementIndex].ingredients.push(createEmptyIngredient());
    updateSupplement(nextSupplements);
  }

  function handleRemoveIngredient(supplementIndex, ingredientIndex) {
    const nextSupplements = structuredClone(supplements);
    nextSupplements[supplementIndex].ingredients = nextSupplements[supplementIndex].ingredients.filter(
      (_, currentIndex) => currentIndex !== ingredientIndex,
    );
    updateSupplement(nextSupplements);
  }

  async function handleAnalyze() {
    const validationMessage = validateSupplements(supplements);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const bundle = await createInputBundle({
        source_type: "manual",
        supplements,
      });
      const analysis = await createAnalysis({
        input_bundle_id: bundle.input_bundle_id,
      });
      navigate(`/result/${analysis.analysis_id}`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setSupplements([createEmptySupplement()]);
    setErrorMessage("");
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">Well Track Prototype</div>
        <h1>여러 영양제를 한 번에 넣고 조합 가이드를 빠르게 확인해보세요.</h1>
        <p>
          이 프로토타입은 중복 성분, 과다 가능성, 복용 시간 가이드를 일반 안내 수준으로
          정리해 보여줍니다.
        </p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={handleAnalyze} disabled={isSubmitting}>
            {isSubmitting ? "분석 준비 중..." : "직접 입력 분석하기"}
          </button>
          <Link className="secondary-link" to="/upload">
            샘플 업로드 체험하기
          </Link>
        </div>
      </section>

      <section className="content-card">
        <div className="section-row">
          <div>
            <h2>직접 입력</h2>
            <p>프로토타입 계약에 맞춘 `product_name`, `manufacturer`, `ingredients` 구조를 그대로 사용합니다.</p>
          </div>
          <button className="ghost-button" type="button" onClick={handleReset}>
            초기화
          </button>
        </div>

        <StatusMessage tone="danger" title="입력 확인" message={errorMessage} />

        <SupplementEditor
          supplements={supplements}
          onSupplementChange={handleSupplementChange}
          onIngredientChange={handleIngredientChange}
          onAddSupplement={handleAddSupplement}
          onRemoveSupplement={handleRemoveSupplement}
          onAddIngredient={handleAddIngredient}
          onRemoveIngredient={handleRemoveIngredient}
        />
      </section>
    </main>
  );
}
