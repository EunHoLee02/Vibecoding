const { getNutrientGuides } = require("./data-store");

function normalizeIngredientName(name) {
  return String(name || "").trim().toLowerCase();
}

function roundAmount(value) {
  return Math.round(value * 100) / 100;
}

function buildTimingGuide(supplement) {
  const ingredientNames = supplement.ingredients.map((item) => normalizeIngredientName(item.name));

  if (ingredientNames.some((name) => name.includes("magnesium") || name.includes("calcium"))) {
    return {
      supplement_name: supplement.product_name,
      timing: "저녁 식사 후",
      reason: "마그네슘 또는 칼슘이 포함되어 있어 하루 마무리 시간대로 나눠 보는 일반 가이드입니다.",
    };
  }

  if (ingredientNames.some((name) => name.includes("vitamin b"))) {
    return {
      supplement_name: supplement.product_name,
      timing: "아침 식사 후",
      reason: "비타민 B 계열이 포함되어 있어 오전 루틴에 두는 일반 가이드입니다.",
    };
  }

  if (ingredientNames.some((name) => name.includes("omega-3") || name.includes("vitamin d"))) {
    return {
      supplement_name: supplement.product_name,
      timing: "식사 직후",
      reason: "지용성 성분 또는 오일 성분이 포함되어 있어 식사 후에 배치한 일반 가이드입니다.",
    };
  }

  if (ingredientNames.some((name) => name.includes("iron"))) {
    return {
      supplement_name: supplement.product_name,
      timing: "식사 사이 또는 가벼운 식사 후",
      reason: "철분 성분이 포함된 경우 시간을 나눠 확인해보라는 일반 가이드입니다.",
    };
  }

  return {
    supplement_name: supplement.product_name,
    timing: "매일 같은 시간대",
    reason: "특정 분리 기준이 뚜렷하지 않아 일정한 시간대를 유지하는 일반 가이드입니다.",
  };
}

function analyzeSupplements(supplements) {
  const nutrientGuides = getNutrientGuides();
  const totals = new Map();

  supplements.forEach((supplement) => {
    supplement.ingredients.forEach((ingredient) => {
      const key = normalizeIngredientName(ingredient.name);

      if (!key) {
        return;
      }

      const current = totals.get(key) || {
        ingredient_name: ingredient.name,
        unit: ingredient.unit,
        total_amount: 0,
        supplement_names: [],
      };

      current.total_amount += Number(ingredient.amount || 0);
      current.unit = ingredient.unit || current.unit;

      if (!current.supplement_names.includes(supplement.product_name)) {
        current.supplement_names.push(supplement.product_name);
      }

      totals.set(key, current);
    });
  });

  const duplicatedIngredients = Array.from(totals.values())
    .filter((item) => item.supplement_names.length > 1)
    .map((item) => ({
      ingredient_name: item.ingredient_name,
      supplement_names: item.supplement_names,
      total_amount: roundAmount(item.total_amount),
      unit: item.unit,
    }));

  const riskItems = nutrientGuides
    .map((guide) => {
      const matched = totals.get(guide.ingredient_name);

      if (!matched) {
        return null;
      }

      if (matched.unit !== guide.unit) {
        return null;
      }

      if (matched.total_amount < guide.guide_amount) {
        return null;
      }

      const ratio = matched.total_amount / guide.guide_amount;
      const riskLevel = ratio >= 1.3 ? "high" : "caution";

      return {
        ingredient_name: guide.display_name,
        total_amount: roundAmount(matched.total_amount),
        unit: guide.unit,
        guide_amount: guide.guide_amount,
        risk_level: riskLevel,
        note:
          riskLevel === "high"
            ? "입력한 조합 기준으로 일반 가이드 상한보다 높게 보입니다."
            : "입력한 조합 기준으로 일반 가이드 상한에 가까워 보입니다.",
      };
    })
    .filter(Boolean);

  const timingGuides = supplements.map(buildTimingGuide);

  let summaryText = "입력한 조합을 기준으로 일반적인 복용 가이드를 정리했습니다.";

  if (duplicatedIngredients.length > 0 || riskItems.length > 0) {
    summaryText = `중복 성분 ${duplicatedIngredients.length}건, 주의가 필요한 성분 ${riskItems.length}건이 보였습니다. 시간을 나눠서 다시 확인해보세요.`;
  } else if (timingGuides.length > 0) {
    summaryText = "큰 중복은 보이지 않았고, 복용 시간 가이드를 중심으로 확인해보면 좋겠습니다.";
  }

  return {
    analysis_status: "completed",
    supplements,
    duplicated_ingredients: duplicatedIngredients,
    risk_items: riskItems,
    timing_guides: timingGuides,
    summary_text: summaryText,
  };
}

module.exports = {
  analyzeSupplements,
};
