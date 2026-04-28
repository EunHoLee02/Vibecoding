const sampleBundles = {
  daily_balance_pack: [
    {
      product_name: "Morning Multi",
      manufacturer: "Well Track Sample Lab",
      ingredients: [
        { ingredient_name: "Vitamin C", amount: 500, unit: "mg" },
        { ingredient_name: "Zinc", amount: 8, unit: "mg" },
        { ingredient_name: "Vitamin D", amount: 25, unit: "mcg" },
      ],
    },
    {
      product_name: "Immune C Plus",
      manufacturer: "Well Track Sample Lab",
      ingredients: [
        { ingredient_name: "Vitamin C", amount: 1000, unit: "mg" },
        { ingredient_name: "Zinc", amount: 10, unit: "mg" },
      ],
    },
    {
      product_name: "Calm Magnesium",
      manufacturer: "Well Track Sample Lab",
      ingredients: [
        { ingredient_name: "Magnesium", amount: 350, unit: "mg" },
      ],
    },
  ],
  bone_focus_pack: [
    {
      product_name: "Calcium D Balance",
      manufacturer: "Well Track Sample Lab",
      ingredients: [
        { ingredient_name: "Calcium", amount: 600, unit: "mg" },
        { ingredient_name: "Vitamin D", amount: 50, unit: "mcg" },
      ],
    },
    {
      product_name: "Sun D Drop",
      manufacturer: "Well Track Sample Lab",
      ingredients: [
        { ingredient_name: "Vitamin D", amount: 75, unit: "mcg" },
      ],
    },
    {
      product_name: "Iron Support",
      manufacturer: "Well Track Sample Lab",
      ingredients: [
        { ingredient_name: "Iron", amount: 18, unit: "mg" },
        { ingredient_name: "Vitamin C", amount: 250, unit: "mg" },
      ],
    },
  ],
  evening_recovery_pack: [
    {
      product_name: "Recovery Magnesium",
      manufacturer: "Well Track Sample Lab",
      ingredients: [
        { ingredient_name: "Magnesium", amount: 200, unit: "mg" },
      ],
    },
    {
      product_name: "Sleep Balance Zinc",
      manufacturer: "Well Track Sample Lab",
      ingredients: [
        { ingredient_name: "Magnesium", amount: 200, unit: "mg" },
        { ingredient_name: "Zinc", amount: 10, unit: "mg" },
      ],
    },
    {
      product_name: "Omega-3 Softgel",
      manufacturer: "Well Track Sample Lab",
      ingredients: [
        { ingredient_name: "Omega-3", amount: 1000, unit: "mg" },
      ],
    },
  ],
};

export function getSampleBundle(sampleKey = "daily_balance_pack") {
  return structuredClone(sampleBundles[sampleKey] || sampleBundles.daily_balance_pack);
}

export function getSampleOptions() {
  return Object.keys(sampleBundles);
}
