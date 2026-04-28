function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

export function validateSupplements(supplements) {
  if (!Array.isArray(supplements) || supplements.length === 0) {
    return "최소 한 개 이상의 영양제 정보를 입력해주세요.";
  }

  for (const supplement of supplements) {
    if (!isNonEmptyString(supplement.product_name)) {
      return "각 영양제에는 제품명이 필요합니다.";
    }

    if (!Array.isArray(supplement.ingredients) || supplement.ingredients.length === 0) {
      return "각 영양제에는 최소 한 개의 성분이 필요합니다.";
    }

    for (const ingredient of supplement.ingredients) {
      if (!isNonEmptyString(ingredient.ingredient_name)) {
        return "성분명은 비워둘 수 없습니다.";
      }

      if (!isPositiveNumber(ingredient.amount)) {
        return "성분 함량은 0보다 큰 숫자여야 합니다.";
      }

      if (!isNonEmptyString(ingredient.unit)) {
        return "성분 단위는 비워둘 수 없습니다.";
      }
    }
  }

  return null;
}

export function validateManualBundle(body) {
  if (body?.source_type !== "manual") {
    return "source_type은 manual이어야 합니다.";
  }

  return validateSupplements(body?.supplements);
}

export function validateUploadBundle(body) {
  if (body?.upload_mode !== "sample_upload") {
    return "upload_mode는 sample_upload만 지원합니다.";
  }

  if (!isNonEmptyString(body?.sample_key) && !isNonEmptyString(body?.file_name)) {
    return "sample_key 또는 file_name 중 하나는 필요합니다.";
  }

  return null;
}

export function validateAnalysisRequest(body) {
  if (!isNonEmptyString(body?.input_bundle_id)) {
    return "input_bundle_id는 비워둘 수 없습니다.";
  }

  return null;
}
