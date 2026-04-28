const sampleSupplementSets = {
  daily_stack: {
    label: "데일리 밸런스",
    supplements: [
      {
        product_name: "멀티비타민 데일리",
        manufacturer: "Well Track Sample",
        ingredients: [
          { name: "비타민 C", amount: 500, unit: "mg" },
          { name: "아연", amount: 12, unit: "mg" },
          { name: "비타민 B6", amount: 2, unit: "mg" },
        ],
      },
      {
        product_name: "비타민C 1000",
        manufacturer: "Well Track Sample",
        ingredients: [
          { name: "비타민 C", amount: 1000, unit: "mg" },
        ],
      },
      {
        product_name: "칼슘 마그네슘",
        manufacturer: "Well Track Sample",
        ingredients: [
          { name: "칼슘", amount: 600, unit: "mg" },
          { name: "마그네슘", amount: 350, unit: "mg" },
        ],
      },
    ],
  },
  immune_focus: {
    label: "이뮨 포커스",
    supplements: [
      {
        product_name: "아연 플러스",
        manufacturer: "Well Track Sample",
        ingredients: [
          { name: "아연", amount: 25, unit: "mg" },
          { name: "비타민 C", amount: 700, unit: "mg" },
        ],
      },
      {
        product_name: "면역 비타민",
        manufacturer: "Well Track Sample",
        ingredients: [
          { name: "비타민 C", amount: 800, unit: "mg" },
          { name: "비타민 D", amount: 20, unit: "mcg" },
          { name: "아연", amount: 20, unit: "mg" },
        ],
      },
    ],
  },
};

module.exports = {
  sampleSupplementSets,
};
