const { prototypeRiskRules, timingRules } = require("../data/prototypeRules");

function analyzeSupplements(supplements) {
  const totalsMap = new Map();

  supplements.forEach((supplement) => {
    supplement.ingredients.forEach((ingredient) => {
      const key = normalizeName(ingredient.name);
      const existing = totalsMap.get(key) || {
        ingredient_name: ingredient.name,
        total_amount: 0,
        unit: ingredient.unit,
        products: [],
      };

      existing.total_amount += ingredient.amount;
      existing.products.push({
        product_name: supplement.product_name,
        amount: ingredient.amount,
        unit: ingredient.unit,
      });

      totalsMap.set(key, existing);
    });
  });

  const duplicatedIngredients = Array.from(totalsMap.values())
    .filter((item) => item.products.length > 1)
    .map((item) => ({
      ingredient_name: item.ingredient_name,
      total_amount: roundNumber(item.total_amount),
      unit: item.unit,
      products: item.products.map((product) => product.product_name),
    }));

  const riskItems = Array.from(totalsMap.entries())
    .flatMap(([key, item]) => {
      const rule = prototypeRiskRules[key];

      if (!rule) {
        return [];
      }

      if (item.total_amount <= rule.prototype_limit) {
        return [];
      }

      return [
        {
          ingredient_name: item.ingredient_name,
          total_amount: roundNumber(item.total_amount),
          unit: item.unit,
          guide_amount: rule.prototype_limit,
          guide_unit: rule.unit,
          level: "attention",
          reason: rule.reason,
        },
      ];
    });

  const timingGuides = supplements.map((supplement) => {
    const guide = resolveTimingGuide(supplement);

    return {
      product_name: supplement.product_name,
      suggested_time: guide.suggested_time,
      reason: guide.reason,
    };
  });

  const summaryText = buildSummaryText(
    supplements.length,
    duplicatedIngredients.length,
    riskItems.length
  );

  return {
    supplements,
    duplicated_ingredients: duplicatedIngredients,
    risk_items: riskItems,
    timing_guides: timingGuides,
    summary_text: summaryText,
  };
}

function resolveTimingGuide(supplement) {
  for (const ingredient of supplement.ingredients) {
    const key = normalizeName(ingredient.name);
    const rule = timingRules[key];

    if (rule) {
      return rule;
    }
  }

  return {
    suggested_time: "식후",
    reason: "프로토타입 기본 가이드로 식후 섭취를 제안합니다.",
  };
}

function buildSummaryText(supplementCount, duplicateCount, riskCount) {
  if (duplicateCount === 0 && riskCount === 0) {
    return `${supplementCount}개 영양제를 분석했고, 중복 성분과 프로토타입 기준 주의 항목은 발견되지 않았습니다.`;
  }

  return `${supplementCount}개 영양제 중 ${duplicateCount}개 중복 성분과 ${riskCount}개 주의 필요 항목을 확인했습니다.`;
}

function normalizeName(name) {
  return String(name).trim().toLowerCase().replace(/\s+/g, "");
}

function roundNumber(value) {
  return Math.round(value * 100) / 100;
}

module.exports = {
  analyzeSupplements,
};
