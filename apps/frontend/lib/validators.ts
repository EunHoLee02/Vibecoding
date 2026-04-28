import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요."),
  email: z.string().email("올바른 이메일을 입력해 주세요."),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .max(128, "비밀번호는 128자 이하여야 합니다.")
    .regex(/[A-Za-z]/, "영문자를 1개 이상 포함해 주세요.")
    .regex(/[0-9]/, "숫자를 1개 이상 포함해 주세요.")
    .regex(/[^A-Za-z0-9]/, "특수문자를 1개 이상 포함해 주세요."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해 주세요."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  new_password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .max(128, "비밀번호는 128자 이하여야 합니다.")
    .regex(/[A-Za-z]/, "영문자를 1개 이상 포함해 주세요.")
    .regex(/[0-9]/, "숫자를 1개 이상 포함해 주세요.")
    .regex(/[^A-Za-z0-9]/, "특수문자를 1개 이상 포함해 주세요."),
});

export const ingredientSchema = z.object({
  ingredient_name_raw: z
    .string()
    .trim()
    .min(1, "성분명을 입력해 주세요."),
  amount_value: z.string().min(1, "용량을 입력해 주세요."),
  amount_unit: z.string().trim().min(1, "단위를 입력해 주세요."),
  is_primary_display_value: z.boolean(),
});

export const supplementSchema = z.object({
  product_name: z.string().trim().min(1, "제품명을 입력해 주세요."),
  manufacturer: z.string().trim().optional().or(z.literal("")),
  serving_basis_type: z.enum(["per_serving", "per_day"]),
  daily_serving_count: z.string().optional().or(z.literal("")),
  memo: z.string().optional().or(z.literal("")),
  ingredient_list: z
    .array(ingredientSchema)
    .min(1, "성분은 최소 1개 이상 필요합니다."),
});

export const inquirySchema = z.object({
  inquiry_type: z.enum([
    "general",
    "error_report",
    "analysis",
    "supplement",
    "account",
  ]),
  related_analysis_run_id: z.string().optional().or(z.literal("")),
  related_supplement_id: z.string().optional().or(z.literal("")),
  title: z.string().trim().min(1, "제목을 입력해 주세요."),
  content: z.string().trim().min(1, "내용을 입력해 주세요."),
});
