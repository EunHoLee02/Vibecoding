export const ingredientRules = {
  "vitamin c": {
    display_name: "Vitamin C",
    threshold_amount: 2000,
    unit: "mg",
    preferred_timing: "morning",
  },
  zinc: {
    display_name: "Zinc",
    threshold_amount: 40,
    unit: "mg",
    preferred_timing: "lunch",
  },
  magnesium: {
    display_name: "Magnesium",
    threshold_amount: 350,
    unit: "mg",
    preferred_timing: "evening",
  },
  "vitamin d": {
    display_name: "Vitamin D",
    threshold_amount: 100,
    unit: "mcg",
    preferred_timing: "morning",
  },
  iron: {
    display_name: "Iron",
    threshold_amount: 45,
    unit: "mg",
    preferred_timing: "morning",
  },
  calcium: {
    display_name: "Calcium",
    threshold_amount: 2500,
    unit: "mg",
    preferred_timing: "evening",
  },
  "omega-3": {
    display_name: "Omega-3",
    threshold_amount: 3000,
    unit: "mg",
    preferred_timing: "lunch",
  },
};

const aliases = {
  "vit c": "vitamin c",
  "ascorbic acid": "vitamin c",
  "vitamin c": "vitamin c",
  zn: "zinc",
  zinc: "zinc",
  mg: "magnesium",
  magnesium: "magnesium",
  "vit d": "vitamin d",
  "vitamin d": "vitamin d",
  fe: "iron",
  iron: "iron",
  ca: "calcium",
  calcium: "calcium",
  omega3: "omega-3",
  "omega 3": "omega-3",
  "omega-3": "omega-3",
};

export function canonicalizeIngredientName(name) {
  const normalized = String(name || "").trim().toLowerCase();
  return aliases[normalized] || normalized;
}
