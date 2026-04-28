export const sampleOptions = [
  {
    key: "daily_balance_pack",
    title: "Daily Balance Pack",
    description: "비타민 C와 아연 중복이 보이는 기본 샘플",
  },
  {
    key: "bone_focus_pack",
    title: "Bone Focus Pack",
    description: "칼슘과 비타민 D 조합을 확인하는 샘플",
  },
  {
    key: "evening_recovery_pack",
    title: "Evening Recovery Pack",
    description: "마그네슘 총량과 저녁 루틴을 보는 샘플",
  },
];

export function createEmptyIngredient() {
  return {
    ingredient_name: "",
    amount: "",
    unit: "mg",
  };
}

export function createEmptySupplement() {
  return {
    product_name: "",
    manufacturer: "",
    ingredients: [createEmptyIngredient()],
  };
}
