"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  FieldError,
  Input,
  SectionTitle,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import { apiClient } from "@/lib/api/client";
import { AppApiError } from "@/lib/api/shared";
import { queryKeys } from "@/lib/query";
import type { OcrJobStatus, Supplement, SupplementListItem } from "@/lib/types";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { supplementSchema } from "@/lib/validators";

const terminalStatuses = new Set(["failed", "succeeded", "confirmed"]);
const commonAmountUnitOptions = [
  { value: "mg", label: "mg" },
  { value: "mcg", label: "mcg" },
  { value: "g", label: "g" },
  { value: "ml", label: "ml" },
  { value: "IU", label: "IU" },
  { value: "CFU", label: "CFU" },
] as const;

type SupplementFormValues = z.infer<typeof supplementSchema>;

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AppApiError) {
    return error.message;
  }

  return fallback;
}

function createEmptyIngredient() {
  return {
    ingredient_name_raw: "",
    amount_value: "",
    amount_unit: "",
    is_primary_display_value: false,
  };
}

function createDefaultValues(): SupplementFormValues {
  return {
    product_name: "",
    manufacturer: "",
    serving_basis_type: "per_serving",
    daily_serving_count: "",
    memo: "",
    ingredient_list: [createEmptyIngredient()],
  };
}

function getAmountUnitOptions(currentUnit?: string) {
  const normalizedUnit = currentUnit?.trim();

  if (!normalizedUnit) {
    return commonAmountUnitOptions;
  }

  const hasKnownOption = commonAmountUnitOptions.some(
    (option) => option.value.toLowerCase() === normalizedUnit.toLowerCase(),
  );

  if (hasKnownOption) {
    return commonAmountUnitOptions;
  }

  return [
    ...commonAmountUnitOptions,
    {
      value: normalizedUnit,
      label: `${normalizedUnit} (existing)`,
    },
  ];
}

function mapSupplementToFormValues(supplement: Supplement): SupplementFormValues {
  return {
    product_name: supplement.product_name,
    manufacturer: supplement.manufacturer ?? "",
    serving_basis_type: supplement.serving_basis_type,
    daily_serving_count: supplement.daily_serving_count ?? "",
    memo: supplement.memo ?? "",
    ingredient_list:
      supplement.ingredients.length > 0
        ? supplement.ingredients.map((ingredient) => ({
            ingredient_name_raw: ingredient.ingredient_name_raw,
            amount_value: ingredient.amount_value,
            amount_unit: ingredient.amount_unit,
            is_primary_display_value: ingredient.is_primary_display_value,
          }))
        : [createEmptyIngredient()],
  };
}

function mapOcrPayloadToFormValues(payload?: OcrJobStatus["extracted_payload"] | null) {
  return {
    product_name: payload?.product_name ?? "",
    manufacturer: payload?.manufacturer ?? "",
    serving_basis_type: "per_serving" as const,
    daily_serving_count: "",
    memo: "",
    ingredient_list:
      payload?.ingredient_list && payload.ingredient_list.length > 0
        ? payload.ingredient_list.map((ingredient) => ({
            ingredient_name_raw: ingredient.ingredient_name_raw ?? "",
            amount_value: ingredient.amount_value ?? "",
            amount_unit: ingredient.amount_unit ?? "",
            is_primary_display_value: ingredient.is_primary_display_value ?? false,
          }))
        : [createEmptyIngredient()],
  };
}

function toPayload(values: SupplementFormValues) {
  return {
    ...values,
    manufacturer: values.manufacturer || null,
    daily_serving_count: values.daily_serving_count || null,
    memo: values.memo || null,
  };
}

function SupplementFormFields({
  form,
  disabled,
}: {
  form: ReturnType<typeof useForm<SupplementFormValues>>;
  disabled?: boolean;
}) {
  const ingredientArray = useFieldArray({
    control: form.control,
    name: "ingredient_list",
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">제품명</label>
          <Input disabled={disabled} {...form.register("product_name")} />
          <FieldError message={form.formState.errors.product_name?.message} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">제조사</label>
          <Input disabled={disabled} {...form.register("manufacturer")} />
          <FieldError message={form.formState.errors.manufacturer?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">복용 기준</label>
          <Select disabled={disabled} {...form.register("serving_basis_type")}>
            <option value="per_serving">1회 기준</option>
            <option value="per_day">1일 기준</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">1일 복용 횟수</label>
          <Input
            disabled={disabled}
            inputMode="decimal"
            placeholder="예: 2"
            {...form.register("daily_serving_count")}
          />
          <FieldError message={form.formState.errors.daily_serving_count?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">메모</label>
        <Textarea disabled={disabled} {...form.register("memo")} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">성분 목록</h3>
            <p className="text-sm text-slate-300">
              `supplement_ingredients` canonical 구조에 맞춰 성분명, 용량, 단위를 개별 입력합니다.
            </p>
          </div>
          <Button
            disabled={disabled}
            onClick={() => ingredientArray.append(createEmptyIngredient())}
            type="button"
            variant="secondary"
          >
            성분 추가
          </Button>
        </div>

        <div className="space-y-3">
          {ingredientArray.fields.map((field, index) => (
            <Card key={field.id} className="space-y-4 bg-white/5">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">성분명</label>
                  <Input
                    disabled={disabled}
                    {...form.register(`ingredient_list.${index}.ingredient_name_raw` as const)}
                  />
                  <FieldError
                    message={
                      form.formState.errors.ingredient_list?.[index]?.ingredient_name_raw?.message
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">용량</label>
                  <Input
                    disabled={disabled}
                    inputMode="decimal"
                    {...form.register(`ingredient_list.${index}.amount_value` as const)}
                  />
                  <FieldError
                    message={form.formState.errors.ingredient_list?.[index]?.amount_value?.message}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">단위</label>
                  <Select
                    disabled={disabled}
                    {...form.register(`ingredient_list.${index}.amount_unit` as const)}
                  >
                    <option value="">Select unit</option>
                    {getAmountUnitOptions(
                      form.watch(`ingredient_list.${index}.amount_unit` as const),
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <FieldError
                    message={form.formState.errors.ingredient_list?.[index]?.amount_unit?.message}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      disabled={disabled}
                      type="checkbox"
                      {...form.register(
                        `ingredient_list.${index}.is_primary_display_value` as const,
                      )}
                    />
                    주요값
                  </label>
                  <Button
                    disabled={disabled || ingredientArray.fields.length === 1}
                    onClick={() => ingredientArray.remove(index)}
                    type="button"
                    variant="ghost"
                  >
                    제거
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SupplementsOverview() {
  const supplementsQuery = useQuery({
    queryKey: queryKeys.supplements,
    queryFn: () => apiClient<SupplementListItem[]>("/api/v1/supplements"),
  });

  const items = supplementsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            eyebrow="Supplements"
            title="내 영양제 목록"
            description="현재 백엔드 `GET /api/v1/supplements` 응답 기준으로 목록을 표시합니다."
          />
          <div className="flex flex-wrap gap-3">
            <Link
              href="/supplements/new/image"
              className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
            >
              이미지 등록
            </Link>
            <Link
              href="/supplements/new/manual"
              className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              직접 입력
            </Link>
          </div>
        </div>
      </Card>

      {supplementsQuery.isLoading ? (
        <Card>
          <p className="text-sm text-slate-300">영양제 목록을 불러오는 중입니다...</p>
        </Card>
      ) : items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((supplement) => (
            <Link
              key={supplement.id}
              href={`/supplements/${supplement.id}`}
              className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 transition hover:-translate-y-1 hover:bg-slate-900/90"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{supplement.product_name}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {supplement.manufacturer || "제조사 미입력"}
                  </p>
                </div>
                <Badge tone={supplement.status === "deleted" ? "danger" : "default"}>
                  {supplement.status}
                </Badge>
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.24em] text-slate-500">
                {supplement.source_type}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="등록된 영양제가 없습니다"
          description="이미지 업로드 또는 직접 입력으로 첫 영양제를 추가해 보세요."
        />
      )}
    </div>
  );
}

export function SupplementEditor({
  mode,
  supplementId,
}: {
  mode: "create" | "edit";
  supplementId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<SupplementFormValues>({
    resolver: zodResolver(supplementSchema),
    defaultValues: createDefaultValues(),
  });

  const detailQuery = useQuery({
    queryKey: supplementId ? queryKeys.supplement(supplementId) : ["supplements", "new"],
    queryFn: () => apiClient<Supplement>(`/api/v1/supplements/${supplementId}`),
    enabled: mode === "edit" && Boolean(supplementId),
  });

  useEffect(() => {
    if (detailQuery.data) {
      form.reset(mapSupplementToFormValues(detailQuery.data));
    }
  }, [detailQuery.data, form]);

  const mutation = useMutation({
    mutationFn: (payload: SupplementFormValues) =>
      apiClient<Supplement>(
        mode === "create"
          ? "/api/v1/supplements"
          : `/api/v1/supplements/${supplementId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          body: JSON.stringify(toPayload(payload)),
        },
      ),
    onSuccess: async (supplement) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.supplements });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.supplement(supplement.id),
      });
      router.push(`/supplements/${supplement.id}`);
    },
  });

  const errorMessage = mutation.error
    ? getErrorMessage(mutation.error, "영양제 저장 중 오류가 발생했습니다.")
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          eyebrow={mode === "create" ? "Manual Register" : "Edit"}
          title={mode === "create" ? "직접 입력 등록" : "영양제 수정"}
          description="문서 기준 필드인 제품명, 제조사, 복용 정보, 메모, 성분 리스트를 RHF + Zod 폼으로 구성했습니다."
        />
      </Card>

      {detailQuery.isLoading ? (
        <Card>
          <p className="text-sm text-slate-300">기존 영양제 정보를 불러오는 중입니다...</p>
        </Card>
      ) : (
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <Card>
            <SupplementFormFields form={form} disabled={mutation.isPending} />
          </Card>

          {errorMessage ? (
            <Card className="border-rose-500/30 bg-rose-500/10">
              <p className="text-sm text-rose-200">{errorMessage}</p>
            </Card>
          ) : null}

          <div className="sticky bottom-4 z-10 flex justify-end gap-3">
            <Link
              href={mode === "edit" && supplementId ? `/supplements/${supplementId}` : "/supplements"}
              className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
            >
              취소
            </Link>
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? "저장 중..." : mode === "create" ? "등록하기" : "수정 저장"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function SupplementDetailView({ supplementId }: { supplementId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const supplementQuery = useQuery({
    queryKey: queryKeys.supplement(supplementId),
    queryFn: () => apiClient<Supplement>(`/api/v1/supplements/${supplementId}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiClient(`/api/v1/supplements/${supplementId}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.supplements });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.supplement(supplementId),
      });
      router.refresh();
    },
  });

  const restoreMutation = useMutation({
    mutationFn: () =>
      apiClient(`/api/v1/supplements/${supplementId}/restore`, {
        method: "POST",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.supplements });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.supplement(supplementId),
      });
      router.refresh();
    },
  });

  if (supplementQuery.isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-300">영양제 상세를 불러오는 중입니다...</p>
      </Card>
    );
  }

  if (!supplementQuery.data) {
    return (
      <EmptyState
        title="영양제 정보를 찾을 수 없습니다"
        description="삭제되었거나 접근 권한이 없는 영양제일 수 있습니다."
      />
    );
  }

  const supplement = supplementQuery.data;
  const isDeleted = Boolean(supplement.deleted_at);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone={isDeleted ? "danger" : "default"}>{supplement.status}</Badge>
              <Badge>{supplement.source_type}</Badge>
            </div>
            <SectionTitle
              eyebrow="Supplement Detail"
              title={supplement.product_name}
              description={supplement.manufacturer || "제조사 정보 없음"}
            />
            {isDeleted ? (
              <p className="text-sm text-amber-200">
                5단계 기준대로 삭제된 영양제 상세는 읽기 전용으로 보여줍니다.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            {!isDeleted ? (
              <Link
                href={`/supplements/${supplement.id}/edit`}
                className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                수정
              </Link>
            ) : null}
            <Link
              href="/analyses/new/preview"
              className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
            >
              분석으로 이동
            </Link>
            {isDeleted ? (
              <Button disabled={restoreMutation.isPending} onClick={() => restoreMutation.mutate()}>
                복구
              </Button>
            ) : (
              <Button
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
                variant="secondary"
              >
                삭제
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <SectionTitle
            eyebrow="Info"
            title="기본 정보"
            description="현재 백엔드 상세 응답 필드를 그대로 노출합니다."
          />
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">복용 기준</dt>
              <dd className="text-white">{supplement.serving_basis_type}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">1일 복용 횟수</dt>
              <dd className="text-white">{supplement.daily_serving_count || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">삭제 시각</dt>
              <dd className="text-white">{formatDateTime(supplement.deleted_at)}</dd>
            </div>
          </dl>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Memo</p>
            <p className="mt-2 text-sm text-slate-200">{supplement.memo || "메모 없음"}</p>
          </div>
        </Card>

        <Card>
          <SectionTitle
            eyebrow="Ingredients"
            title="성분 상세"
            description="`supplement_ingredients` 기준 성분 행을 그대로 보여줍니다."
          />
          <div className="mt-5 space-y-3">
            {supplement.ingredients.map((ingredient) => (
              <div
                key={`${ingredient.ingredient_name_raw}-${ingredient.amount_value}-${ingredient.amount_unit}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">
                      {ingredient.ingredient_name_standard || ingredient.ingredient_name_raw}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{ingredient.ingredient_name_raw}</p>
                  </div>
                  <Badge>
                    {formatNumber(ingredient.amount_value)} {ingredient.amount_unit}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ingredient.match_status ? <Badge>{ingredient.match_status}</Badge> : null}
                  {ingredient.is_primary_display_value ? <Badge tone="success">주요값</Badge> : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function ImageUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("파일을 먼저 선택해 주세요.");
      }

      const uploadInfo = await apiClient<{
        ocr_job_id: string;
        upload_url: string;
        object_key: string;
      }>("/api/v1/ocr/upload-url", {
        method: "POST",
        body: JSON.stringify({
          file_name: file.name,
          mime_type: file.type,
          file_size_bytes: file.size,
        }),
      });

      const uploadResponse = await fetch(uploadInfo.upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("R2 업로드에 실패했습니다.");
      }

      await apiClient(`/api/v1/ocr/jobs/${uploadInfo.ocr_job_id}/complete`, {
        method: "POST",
        body: JSON.stringify({ uploaded: true }),
      });

      return uploadInfo.ocr_job_id;
    },
    onSuccess: (ocrJobId) => {
      router.push(`/supplements/ocr-jobs/${ocrJobId}/status`);
    },
  });

  const errorMessage = localError
    ? localError
    : mutation.error
      ? getErrorMessage(mutation.error, "OCR 업로드 중 오류가 발생했습니다.")
      : null;

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          eyebrow="OCR Upload"
          title="이미지 업로드 등록"
          description="7단계/10b 기준대로 presigned upload -> complete -> job status 흐름을 사용합니다."
        />
      </Card>

      <Card className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">이미지 파일</label>
          <Input
            accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null;
              setFile(nextFile);
              setLocalError(null);
            }}
            type="file"
          />
          <p className="text-sm text-slate-400">
            현재 10b 백엔드는 `image/jpeg`, `image/png`, `image/webp`, `image/heic`만 허용합니다.
          </p>
        </div>

        {file ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
            {file.name} / {formatNumber(file.size)} bytes / {file.type || "unknown"}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={mutation.isPending}
            onClick={() => {
              if (!file) {
                setLocalError("업로드할 파일을 먼저 선택해 주세요.");
                return;
              }

              mutation.mutate();
            }}
            type="button"
          >
            {mutation.isPending ? "업로드 중..." : "OCR 시작"}
          </Button>
          <Link
            href="/supplements/new/manual"
            className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
          >
            직접 입력으로 전환
          </Link>
        </div>
      </Card>
    </div>
  );
}

export function OcrJobStatusView({ jobId }: { jobId: string }) {
  const [polling, setPolling] = useState(true);
  const jobQuery = useQuery({
    queryKey: queryKeys.ocrJob(jobId),
    queryFn: () => apiClient<OcrJobStatus>(`/api/v1/ocr/jobs/${jobId}`),
    refetchInterval: polling ? 2500 : false,
  });

  useEffect(() => {
    if (jobQuery.data && terminalStatuses.has(jobQuery.data.status)) {
      setPolling(false);
    }
  }, [jobQuery.data]);

  const job = jobQuery.data;

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          eyebrow="OCR Status"
          title="OCR 처리 상태"
          description="3단계/5단계 기준대로 완료 또는 실패까지 2.5초 간격 polling을 적용했습니다."
        />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-400">작업 ID</span>
            <Badge>{jobId}</Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-400">현재 상태</span>
            <Badge
              tone={
                job?.status === "failed"
                  ? "danger"
                  : job?.status === "succeeded" || job?.status === "confirmed"
                    ? "success"
                    : "warning"
              }
            >
              {job?.status ?? "loading"}
            </Badge>
          </div>
          <p className="text-sm text-slate-300">
            {job?.status === "succeeded"
              ? "검수 화면으로 이동해 최종 저장을 진행할 수 있습니다."
              : job?.status === "failed"
                ? job.error_message || "OCR 처리에 실패했습니다."
                : "OCR 작업을 계속 확인하고 있습니다."}
          </p>

          <div className="flex flex-wrap gap-3">
            {job?.status === "succeeded" ? (
              <Link
                href={`/supplements/${jobId}/review?ocrJobId=${jobId}`}
                className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
              >
                OCR 검수로 이동
              </Link>
            ) : null}
            <Link
              href="/supplements/new/image"
              className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
            >
              새 이미지 업로드
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
            현재 10b API의 상태 응답은 `ocr_job_id`, `status`, `extracted_payload`, `error_*`,
            `retry_count`까지만 제공합니다. 문서상 `/supplements/:id/review` 경로와 달리, 실제 검수
            식별자는 `ocr_job_id`를 기준으로 연결했습니다. 이 부분은 현재 코드 기준으로 맞춘 구현입니다.
          </div>
        </Card>

        <Card>
          <SectionTitle
            eyebrow="Preview"
            title="추출 결과 미리보기"
            description="현재 OCR 엔진은 PaddleOCR 기반이며, 이 화면은 최신 백엔드 추출 결과를 그대로 노출합니다."
          />
          <div className="mt-5 space-y-4">
            {jobQuery.isLoading ? (
              <p className="text-sm text-slate-300">OCR 상태를 불러오는 중입니다...</p>
            ) : (
              <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs text-slate-200">
                {JSON.stringify(job?.extracted_payload ?? {}, null, 2)}
              </pre>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function OcrReviewForm({ ocrJobId }: { ocrJobId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<SupplementFormValues>({
    resolver: zodResolver(supplementSchema),
    defaultValues: createDefaultValues(),
  });

  const jobQuery = useQuery({
    queryKey: queryKeys.ocrJob(ocrJobId),
    queryFn: () => apiClient<OcrJobStatus>(`/api/v1/ocr/jobs/${ocrJobId}`),
  });

  useEffect(() => {
    if (jobQuery.data) {
      form.reset(mapOcrPayloadToFormValues(jobQuery.data.extracted_payload));
    }
  }, [jobQuery.data, form]);

  const mutation = useMutation({
    mutationFn: (payload: SupplementFormValues) =>
      apiClient<{ ocr_job_id: string; supplement: Supplement }>(
        `/api/v1/ocr/jobs/${ocrJobId}/confirm`,
        {
          method: "POST",
          body: JSON.stringify(toPayload(payload)),
        },
      ),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.supplements });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.ocrJob(ocrJobId),
      });
      router.push(`/supplements/${result.supplement.id}`);
    },
  });

  const canConfirm = jobQuery.data?.status === "succeeded";
  const errorMessage = mutation.error
    ? getErrorMessage(mutation.error, "OCR 검수 저장 중 오류가 발생했습니다.")
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          eyebrow="OCR Review"
          title="OCR 검수"
          description="현재 10b 백엔드는 draft supplement id를 노출하지 않으므로, 이 화면은 `ocr_job_id`를 기준으로 검수/확정합니다."
        />
      </Card>

      {!canConfirm ? (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <p className="text-sm text-amber-100">
            이 작업은 아직 검수 가능한 상태가 아닙니다. 현재 상태: {jobQuery.data?.status ?? "loading"}
          </p>
        </Card>
      ) : null}

      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <Card>
          <SupplementFormFields form={form} disabled={!canConfirm || mutation.isPending} />
        </Card>

        {errorMessage ? (
          <Card className="border-rose-500/30 bg-rose-500/10">
            <p className="text-sm text-rose-200">{errorMessage}</p>
          </Card>
        ) : null}

        <div className="sticky bottom-4 z-10 flex justify-end gap-3">
          <Link
            href={`/supplements/ocr-jobs/${ocrJobId}/status`}
            className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
          >
            상태 화면으로
          </Link>
          <Button disabled={!canConfirm || mutation.isPending} type="submit">
            {mutation.isPending ? "저장 중..." : "검수 확정"}
          </Button>
        </div>
      </form>
    </div>
  );
}
