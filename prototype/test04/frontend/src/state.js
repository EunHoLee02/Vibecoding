export const initialState = {
  supplements: [createEmptySupplement()],
  lastAnalysis: null,
  uploadMessage: "",
  loading: false,
  error: "",
};

export function createEmptySupplement() {
  return {
    product_name: "",
    manufacturer: "",
    ingredients: [createEmptyIngredient()],
  };
}

export function createEmptyIngredient() {
  return {
    name: "",
    amount: "",
    unit: "mg",
  };
}
