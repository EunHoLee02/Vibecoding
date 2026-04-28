const { sampleSupplementSets } = require("../data/sampleSupplements");

function normalizeSupplementsPayload(supplements) {
  if (!Array.isArray(supplements) || supplements.length === 0) {
    throw new Error("최소 1개 이상의 영양제를 입력해 주세요.");
  }

  return supplements.map((supplement, index) => normalizeSupplement(supplement, index));
}

function normalizeSupplement(supplement, index) {
  const productName = asTrimmedString(supplement.product_name);

  if (!productName) {
    throw new Error(`${index + 1}번째 영양제의 제품명을 입력해 주세요.`);
  }

  if (!Array.isArray(supplement.ingredients) || supplement.ingredients.length === 0) {
    throw new Error(`${productName}의 성분을 최소 1개 이상 입력해 주세요.`);
  }

  const ingredients = supplement.ingredients.map((ingredient, ingredientIndex) =>
    normalizeIngredient(ingredient, productName, ingredientIndex)
  );

  return {
    product_name: productName,
    manufacturer: asTrimmedString(supplement.manufacturer) || "",
    ingredients,
  };
}

function normalizeIngredient(ingredient, productName, ingredientIndex) {
  const name = asTrimmedString(ingredient.name);
  const unit = asTrimmedString(ingredient.unit);
  const amount = Number(ingredient.amount);

  if (!name) {
    throw new Error(`${productName}의 ${ingredientIndex + 1}번째 성분명을 입력해 주세요.`);
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${productName}의 ${name} 함량은 0보다 큰 숫자여야 합니다.`);
  }

  if (!unit) {
    throw new Error(`${productName}의 ${name} 단위를 입력해 주세요.`);
  }

  return {
    name,
    amount,
    unit,
  };
}

function resolveSampleSupplements(payload) {
  const sampleKey = asTrimmedString(payload.sample_key);
  const fileName = asTrimmedString(payload.file_name);
  const fallbackKey = sampleKey || "daily_stack";
  const sample = sampleSupplementSets[fallbackKey];

  if (!sample) {
    throw new Error("지원하지 않는 샘플입니다.");
  }

  return {
    input_source: fileName ? "sample_upload" : "sample_select",
    sample_key: fallbackKey,
    file_name: fileName || "",
    upload_status: "sample_loaded",
    supplements: normalizeSupplementsPayload(sample.supplements),
    upload_message: fileName
      ? `${fileName} 업로드를 샘플 파싱으로 처리했습니다.`
      : `${sample.label} 샘플을 불러왔습니다.`,
  };
}

function asTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

module.exports = {
  normalizeSupplementsPayload,
  resolveSampleSupplements,
};
