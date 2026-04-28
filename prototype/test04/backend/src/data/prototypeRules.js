const prototypeRiskRules = {
  "비타민c": {
    prototype_limit: 1200,
    unit: "mg",
    reason: "프로토타입 기준표에서 비타민 C 합계가 주의 범위를 넘었습니다.",
  },
  vitaminc: {
    prototype_limit: 1200,
    unit: "mg",
    reason: "프로토타입 기준표에서 Vitamin C 합계가 주의 범위를 넘었습니다.",
  },
  "아연": {
    prototype_limit: 30,
    unit: "mg",
    reason: "프로토타입 기준표에서 아연 합계가 주의 범위를 넘었습니다.",
  },
  zinc: {
    prototype_limit: 30,
    unit: "mg",
    reason: "프로토타입 기준표에서 Zinc 합계가 주의 범위를 넘었습니다.",
  },
  "마그네슘": {
    prototype_limit: 300,
    unit: "mg",
    reason: "프로토타입 기준표에서 마그네슘 합계가 주의 범위를 넘었습니다.",
  },
  magnesium: {
    prototype_limit: 300,
    unit: "mg",
    reason: "프로토타입 기준표에서 Magnesium 합계가 주의 범위를 넘었습니다.",
  },
};

const timingRules = {
  "비타민c": {
    suggested_time: "아침 또는 점심 식후",
    reason: "프로토타입 가이드에서는 비타민 C 계열을 낮 시간 식후에 배치합니다.",
  },
  vitaminc: {
    suggested_time: "아침 또는 점심 식후",
    reason: "프로토타입 가이드에서는 Vitamin C 계열을 낮 시간 식후에 배치합니다.",
  },
  "아연": {
    suggested_time: "식후",
    reason: "속 불편을 줄이기 위한 프로토타입 기본 가이드입니다.",
  },
  zinc: {
    suggested_time: "식후",
    reason: "속 불편을 줄이기 위한 프로토타입 기본 가이드입니다.",
  },
  "칼슘": {
    suggested_time: "저녁 식후",
    reason: "프로토타입 가이드에서는 칼슘 계열을 저녁 식후에 배치합니다.",
  },
  calcium: {
    suggested_time: "저녁 식후",
    reason: "프로토타입 가이드에서는 Calcium 계열을 저녁 식후에 배치합니다.",
  },
  "마그네슘": {
    suggested_time: "저녁",
    reason: "프로토타입 가이드에서는 마그네슘 계열을 저녁 시간대로 안내합니다.",
  },
  magnesium: {
    suggested_time: "저녁",
    reason: "프로토타입 가이드에서는 Magnesium 계열을 저녁 시간대로 안내합니다.",
  },
  "비타민d": {
    suggested_time: "아침 식후",
    reason: "프로토타입 가이드에서는 비타민 D 계열을 아침 식후에 배치합니다.",
  },
  vitamind: {
    suggested_time: "아침 식후",
    reason: "프로토타입 가이드에서는 Vitamin D 계열을 아침 식후에 배치합니다.",
  },
};

module.exports = {
  prototypeRiskRules,
  timingRules,
};
