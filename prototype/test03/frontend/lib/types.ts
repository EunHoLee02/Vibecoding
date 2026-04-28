export type AmountUnit = "mg" | "mcg" | "IU" | "CFU";
export type SourceType = "manual" | "upload" | "sample";
export type ParseStatus = "parsed" | "failed";
export type AnalysisStatus = "completed" | "failed";
export type RiskLevel = "caution" | "high";
export type RecommendedTime =
  | "morning"
  | "afternoon"
  | "evening"
  | "with_meal"
  | "empty_stomach"
  | "anytime";

export interface IngredientItem {
  ingredient_name: string;
  amount_value: number;
  amount_unit: AmountUnit;
}

export interface SupplementInput {
  product_name: string;
  manufacturer: string | null;
  source_type: SourceType;
  ingredients: IngredientItem[];
}

export interface SampleInputOption {
  sample_id: string;
  title: string;
  description: string;
  supplements: SupplementInput[];
}

export interface UploadParseResult {
  parse_status: ParseStatus;
  source_type: "upload" | "sample";
  supplements: SupplementInput[];
  message: string | null;
}

export interface DuplicateIngredientItem {
  ingredient_name: string;
  product_count: number;
  product_names: string[];
  total_amount: number;
  amount_unit: string;
}

export interface RiskItem {
  ingredient_name: string;
  total_amount: number;
  reference_amount: number;
  amount_unit: string;
  risk_level: RiskLevel;
  message: string;
}

export interface TimingGuide {
  ingredient_name: string;
  recommended_time: RecommendedTime;
  message: string;
}

export interface AnalysisResult {
  analysis_status: AnalysisStatus;
  supplements: SupplementInput[];
  duplicated_ingredients: DuplicateIngredientItem[];
  risk_items: RiskItem[];
  timing_guides: TimingGuide[];
  summary_text: string;
}
