import { canonicalizeIngredientName, ingredientRules } from "../data/ingredientRules.js";

const timingText = {
  morning: "아침 식사 이후에 확인하며 시작 루틴에 묶어보기 좋습니다.",
  lunch: "점심이나 식사 직후 흐름으로 모아두면 잊기 쉬운 항목을 줄이기 좋습니다.",
  evening: "저녁 루틴에 모으면 하루 복용 타이밍을 정리하기 쉽습니다.",
  flexible: "식사 여부와 일정에 맞춰 유연하게 배치해도 되는 편입니다.",
};

function normalizeSupplements(supplements) {
  return supplements.map((supplement) => ({
    product_name: supplement.product_name.trim(),
    manufacturer: String(supplement.manufacturer || "").trim(),
    ingredients: supplement.ingredients.map((ingredient) => ({
      ingredient_name: ingredient.ingredient_name.trim(),
      amount: Number(ingredient.amount),
      unit: ingredient.unit.trim(),
    })),
  }));
}

function aggregateIngredients(supplements) {
  const aggregated = new Map();

  for (const supplement of supplements) {
    for (const ingredient of supplement.ingredients) {
      const canonicalName = canonicalizeIngredientName(ingredient.ingredient_name);
      const rule = ingredientRules[canonicalName];
      const key = canonicalName;

      if (!aggregated.has(key)) {
        aggregated.set(key, {
          canonical_name: canonicalName,
          ingredient_name: rule?.display_name || ingredient.ingredient_name,
          total_amount: 0,
          unit: ingredient.unit,
          supplement_names: [],
          threshold_amount: rule?.threshold_amount ?? null,
          preferred_timing: rule?.preferred_timing ?? "flexible",
        });
      }

      const current = aggregated.get(key);
      current.total_amount += Number(ingredient.amount);

      if (!current.supplement_names.includes(supplement.product_name)) {
        current.supplement_names.push(supplement.product_name);
      }
    }
  }

  return [...aggregated.values()];
}

function buildDuplicatedIngredients(aggregatedIngredients) {
  return aggregatedIngredients
    .filter((item) => item.supplement_names.length > 1)
    .map((item) => ({
      ingredient_name: item.ingredient_name,
      total_amount: item.total_amount,
      unit: item.unit,
      supplement_names: item.supplement_names,
      duplicated_count: item.supplement_names.length,
      note: "여러 제품에 겹쳐 보여 총량을 한 번 더 확인해보는 편이 좋습니다.",
    }));
}

function buildRiskItems(aggregatedIngredients) {
  return aggregatedIngredients
    .filter((item) => item.threshold_amount && item.unit === ingredientRules[item.canonical_name]?.unit)
    .filter((item) => item.total_amount >= item.threshold_amount * 0.8)
    .map((item) => {
      const level = item.total_amount >= item.threshold_amount ? "caution" : "watch";
      return {
        ingredient_name: item.ingredient_name,
        total_amount: item.total_amount,
        threshold_amount: item.threshold_amount,
        unit: item.unit,
        level,
        message:
          level === "caution"
            ? "현재 조합에서는 총량이 기준선에 닿았거나 넘었는지 다시 확인해볼 필요가 있습니다."
            : "현재 조합에서는 기준선에 가까워 보여 함께 복용하는 양을 확인해보는 편이 좋습니다.",
      };
    });
}

function buildTimingGuides(supplements) {
  const grouped = {
    morning: [],
    lunch: [],
    evening: [],
    flexible: [],
  };

  for (const supplement of supplements) {
    const score = {
      morning: 0,
      lunch: 0,
      evening: 0,
      flexible: 0,
    };

    for (const ingredient of supplement.ingredients) {
      const canonicalName = canonicalizeIngredientName(ingredient.ingredient_name);
      const timing = ingredientRules[canonicalName]?.preferred_timing || "flexible";
      score[timing] += 1;
    }

    const selectedTiming = Object.entries(score).sort((left, right) => right[1] - left[1])[0][0];
    grouped[selectedTiming].push(supplement.product_name);
  }

  return Object.entries(grouped)
    .filter(([, supplementNames]) => supplementNames.length > 0)
    .map(([timing_slot, supplement_names]) => ({
      timing_slot,
      supplement_names,
      guide_text: timingText[timing_slot],
    }));
}

function buildSummary(duplicates, riskItems, timingGuides) {
  const duplicateText =
    duplicates.length > 0
      ? `중복 성분 ${duplicates.length}건이 보여 총량 확인이 필요합니다.`
      : "뚜렷한 중복 성분은 적게 보입니다.";
  const riskText =
    riskItems.length > 0
      ? `주의해서 볼 항목 ${riskItems.length}건이 함께 보입니다.`
      : "현재 조합에서 기준선에 가까운 항목은 많지 않습니다.";
  const timingTextSummary =
    timingGuides.length > 0
      ? "복용 시간을 아침, 점심, 저녁 루틴으로 나눠 확인해보세요."
      : "복용 시간은 생활 패턴에 맞춰 유연하게 정리해보세요.";

  return `${duplicateText} ${riskText} ${timingTextSummary}`;
}

export function analyzeSupplements(supplements) {
  const normalizedSupplements = normalizeSupplements(supplements);
  const aggregatedIngredients = aggregateIngredients(normalizedSupplements);
  const duplicated_ingredients = buildDuplicatedIngredients(aggregatedIngredients);
  const risk_items = buildRiskItems(aggregatedIngredients);
  const timing_guides = buildTimingGuides(normalizedSupplements);
  const summary_text = buildSummary(duplicated_ingredients, risk_items, timing_guides);

  return {
    supplements: normalizedSupplements,
    duplicated_ingredients,
    risk_items,
    timing_guides,
    summary_text,
  };
}
