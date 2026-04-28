export type ApiMeta = Record<string, unknown>;

export type ApiEnvelope<T> = {
  success: true;
  data: T;
  meta: ApiMeta;
};

export type ApiFailure = {
  success: false;
  code: string;
  message: string;
  detail?: Record<string, unknown>;
  request_id?: string | null;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
};

export type SupplementSourceType = "manual" | "ocr" | "hybrid";
export type SupplementStatus =
  | "active"
  | "analyzable"
  | "analysis_locked"
  | "archived"
  | "deleted";
export type ServingBasisType = "per_serving" | "per_day";

export type SupplementIngredient = {
  id?: string;
  ingredient_name_raw: string;
  ingredient_name_standard?: string | null;
  ingredient_code?: string | null;
  amount_value: string;
  amount_unit: string;
  is_primary_display_value: boolean;
  match_status?: "matched" | "partial_matched" | "unmatched";
};

export type SupplementListItem = {
  id: string;
  product_name: string;
  manufacturer?: string | null;
  source_type: SupplementSourceType;
  status: SupplementStatus;
};

export type Supplement = {
  id: string;
  source_type: SupplementSourceType;
  product_name: string;
  manufacturer?: string | null;
  serving_basis_type: ServingBasisType;
  daily_serving_count?: string | null;
  memo?: string | null;
  status: SupplementStatus;
  deleted_at?: string | null;
  ingredients: SupplementIngredient[];
};

export type OcrUploadUrlResponse = {
  ocr_job_id: string;
  upload_url: string;
  object_key: string;
};

export type OcrJobStatus = {
  ocr_job_id: string;
  status: string;
  extracted_payload?: {
    product_name?: string | null;
    manufacturer?: string | null;
    ingredient_list?: Array<{
      ingredient_name_raw?: string;
      amount_value?: string;
      amount_unit?: string;
      is_primary_display_value?: boolean;
    }>;
    raw_text?: string;
  } | null;
  error_code?: string | null;
  error_message?: string | null;
  retry_count: number;
};

export type AnalysisPreview = {
  id: string;
  supplement_preview_list: Array<Record<string, unknown>>;
  validation_summary: Record<string, unknown>;
  ready_for_analysis: boolean;
  preview_status: string;
};

export type AnalysisCreateResponse = {
  analysis_run_id: string;
  analysis_status: string;
  is_reused_result: boolean;
  reuse_reason?: string | null;
};

export type AnalysisStatus = {
  analysis_run_id: string;
  analysis_status: string;
  is_reused_result: boolean;
  reuse_reason?: string | null;
  completed_at?: string | null;
};

export type AnalysisResultItem = {
  ingredient_name_standard: string;
  total_amount: string;
  amount_unit: string;
  duplication_count: number;
  risk_level: string;
  recommendation_level: string;
};

export type AnalysisGuide = {
  guide_type: string;
  title: string;
  content: string;
  risk_level?: string | null;
  display_order: number;
};

export type AnalysisPurposeRecommendation = {
  purpose_code: string;
  purpose_title: string;
  fit_summary: string;
  recommendation_level: string;
  display_order: number;
};

export type AnalysisHistoryItem = {
  analysis_run_id: string;
  analysis_status: string;
  summary_level?: string | null;
  summary_title?: string | null;
  is_reused_result: boolean;
  created_at: string;
  completed_at?: string | null;
};

export type AnalysisResult = {
  analysis_run_id: string;
  analysis_status: string;
  summary_level?: string | null;
  summary_title?: string | null;
  summary_message?: string | null;
  result_items: AnalysisResultItem[];
  guides: AnalysisGuide[];
  purpose_recommendations: AnalysisPurposeRecommendation[];
};

export type Inquiry = {
  id: string;
  inquiry_type: string;
  related_analysis_run_id?: string | null;
  related_supplement_id?: string | null;
  title: string;
  content: string;
  status: string;
  admin_note?: string | null;
};
