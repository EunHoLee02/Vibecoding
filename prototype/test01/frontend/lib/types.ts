export type SourceType = "manual" | "sample_upload";
export type AmountUnit = "mg" | "mcg" | "CFU";

export interface IngredientInput {
  ingredient_name_raw: string;
  amount_value: number;
  amount_unit: AmountUnit;
}

export interface SupplementInput {
  supplement_name: string;
  daily_servings: number;
  source_type: SourceType;
  ingredients: IngredientInput[];
}

export interface SamplePayload {
  sample_id: string;
  title: string;
  description: string;
  supplements: SupplementInput[];
}

export interface ParseStubResponse {
  source_type: SourceType;
  sample_id: string;
  supplements: SupplementInput[];
}

export interface DuplicateIngredient {
  ingredient_code: string;
  ingredient_name: string;
  supplement_count: number;
  total_amount: number;
  amount_unit: string;
  severity: "low" | "medium" | "high";
  message: string;
}

export interface OverLimitIngredient {
  ingredient_code: string;
  ingredient_name: string;
  total_amount: number;
  caution_amount: number;
  upper_amount: number;
  amount_unit: string;
  severity: "medium" | "high";
  message: string;
}

export interface TimingGuide {
  title: string;
  guidance: string;
  severity: "low" | "medium";
}

export interface AnalysisResult {
  analysis_id: string;
  status: "completed";
  summary_line: string;
  supplements: SupplementInput[];
  duplicate_ingredients: DuplicateIngredient[];
  over_limit_ingredients: OverLimitIngredient[];
  timing_guides: TimingGuide[];
}
