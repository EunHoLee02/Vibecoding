"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge, Button, Card, EmptyState, SectionTitle } from "@/components/ui/primitives";
import { apiClient } from "@/lib/api/client";
import { AppApiError } from "@/lib/api/shared";
import { queryKeys } from "@/lib/query";
import type {
  AnalysisCreateResponse,
  AnalysisHistoryItem,
  AnalysisPreview,
  AnalysisResult,
  AnalysisStatus,
  SupplementListItem,
} from "@/lib/types";
import { formatNumber } from "@/lib/utils";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AppApiError) {
    return error.message;
  }

  return fallback;
}

export function AnalysisPreviewBuilder() {
  const router = useRouter();
  const [selectedSupplementIds, setSelectedSupplementIds] = useState<string[]>([]);
  const [purposeCodesInput, setPurposeCodesInput] = useState("");

  const supplementsQuery = useQuery({
    queryKey: queryKeys.supplements,
    queryFn: () => apiClient<SupplementListItem[]>("/api/v1/supplements"),
  });

  const previewMutation = useMutation({
    mutationFn: () =>
      apiClient<AnalysisPreview>("/api/v1/analyses/preview", {
        method: "POST",
        body: JSON.stringify({
          supplement_ids: selectedSupplementIds,
          purpose_codes: purposeCodesInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      }),
  });

  const createMutation = useMutation({
    mutationFn: (preview: AnalysisPreview) =>
      apiClient<AnalysisCreateResponse>("/api/v1/analyses", {
        method: "POST",
        body: JSON.stringify({
          confirmed_preview_id: preview.id,
          supplement_ids: selectedSupplementIds,
          purpose_codes: purposeCodesInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      }),
    onSuccess: (result) => {
      router.push(`/analyses/runs/${result.analysis_run_id}/status`);
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          eyebrow="Analysis Preview"
          title="분석 전 확인"
          description="현재 10b API는 `preview -> create -> status -> result` 경로를 제공합니다."
        />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <SectionTitle
            eyebrow="Targets"
            title="분석 대상 선택"
            description="등록된 영양제 중 분석할 대상을 고르세요."
          />
          <div className="mt-5 space-y-3">
            {supplementsQuery.isLoading ? (
              <p className="text-sm text-slate-300">영양제 목록을 불러오는 중입니다...</p>
            ) : supplementsQuery.data?.length ? (
              supplementsQuery.data.map((supplement) => {
                const selected = selectedSupplementIds.includes(supplement.id);

                return (
                  <label
                    key={supplement.id}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <input
                      checked={selected}
                      onChange={(event) => {
                        setSelectedSupplementIds((previous) =>
                          event.target.checked
                            ? [...previous, supplement.id]
                            : previous.filter((item) => item !== supplement.id),
                        );
                      }}
                      type="checkbox"
                    />
                    <div>
                      <p className="font-medium text-white">{supplement.product_name}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {supplement.manufacturer || "제조사 미입력"}
                      </p>
                    </div>
                  </label>
                );
              })
            ) : (
              <EmptyState
                title="분석할 영양제가 없습니다"
                description="먼저 영양제를 등록한 뒤 분석을 시작해 주세요."
              />
            )}
          </div>

          <div className="mt-5 space-y-2">
            <label className="text-sm font-medium text-slate-200">목적 코드(쉼표 구분)</label>
            <input
              className="h-11 w-full rounded-2xl border border-white/12 bg-slate-900/70 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
              onChange={(event) => setPurposeCodesInput(event.target.value)}
              placeholder="예: immunity, fatigue"
              value={purposeCodesInput}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              disabled={selectedSupplementIds.length === 0 || previewMutation.isPending}
              onClick={() => previewMutation.mutate()}
              type="button"
            >
              {previewMutation.isPending ? "미리보기 생성 중..." : "분석 전 확인"}
            </Button>
            <p className="self-center text-sm text-slate-400">
              현재 선택된 영양제 {formatNumber(selectedSupplementIds.length)}개
            </p>
          </div>
        </Card>

        <Card>
          <SectionTitle
            eyebrow="Preview Result"
            title="서버 검증 결과"
            description="`POST /api/v1/analyses/preview` 응답을 그대로 요약합니다."
          />
          <div className="mt-5 space-y-4">
            {previewMutation.data ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge>{previewMutation.data.preview_status}</Badge>
                  <Badge tone={previewMutation.data.ready_for_analysis ? "success" : "warning"}>
                    {previewMutation.data.ready_for_analysis ? "ready" : "needs_review"}
                  </Badge>
                </div>
                <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs text-slate-200">
                  {JSON.stringify(previewMutation.data.validation_summary, null, 2)}
                </pre>
                <Button
                  disabled={!previewMutation.data.ready_for_analysis || createMutation.isPending}
                  onClick={() => createMutation.mutate(previewMutation.data)}
                  type="button"
                >
                  {createMutation.isPending ? "분석 시작 중..." : "분석 실행"}
                </Button>
              </>
            ) : (
              <EmptyState
                title="아직 미리보기가 없습니다"
                description="좌측에서 대상 영양제를 선택하고 분석 전 확인을 실행해 주세요."
              />
            )}

            {previewMutation.error ? (
              <p className="text-sm text-rose-300">
                {getErrorMessage(previewMutation.error, "분석 미리보기 생성 중 오류가 발생했습니다.")}
              </p>
            ) : null}
            {createMutation.error ? (
              <p className="text-sm text-rose-300">
                {getErrorMessage(createMutation.error, "분석 생성 중 오류가 발생했습니다.")}
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function AnalysisStatusView({ runId }: { runId: string }) {
  const [polling, setPolling] = useState(true);
  const statusQuery = useQuery({
    queryKey: queryKeys.analysisStatus(runId),
    queryFn: () => apiClient<AnalysisStatus>(`/api/v1/analyses/${runId}/status`),
    refetchInterval: polling ? 2500 : false,
  });

  useEffect(() => {
    if (statusQuery.data?.analysis_status === "completed" || statusQuery.data?.analysis_status === "failed") {
      setPolling(false);
    }
  }, [statusQuery.data]);

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          eyebrow="Analysis Status"
          title="분석 진행 상태"
          description="문서 기준대로 완료 또는 실패까지 2.5초 간격 polling을 사용합니다."
        />
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-400">Run ID</span>
          <Badge>{runId}</Badge>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-400">상태</span>
          <Badge
            tone={
              statusQuery.data?.analysis_status === "completed"
                ? "success"
                : statusQuery.data?.analysis_status === "failed"
                  ? "danger"
                  : "warning"
            }
          >
            {statusQuery.data?.analysis_status ?? "loading"}
          </Badge>
        </div>
        <p className="text-sm text-slate-300">
          {statusQuery.data?.reuse_reason || "분석 상태 API 응답을 그대로 반영합니다."}
        </p>
        <div className="flex flex-wrap gap-3">
          {statusQuery.data?.analysis_status === "completed" ? (
            <Link
              href={`/analyses/${runId}`}
              className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              결과 보기
            </Link>
          ) : null}
          <Link
            href={`/support/inquiries/new?analysisRunId=${runId}`}
            className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
          >
            문의 남기기
          </Link>
        </div>
      </Card>
    </div>
  );
}

export function AnalysisResultView({ analysisId }: { analysisId: string }) {
  const resultQuery = useQuery({
    queryKey: queryKeys.analysisResult(analysisId),
    queryFn: () => apiClient<AnalysisResult>(`/api/v1/analyses/${analysisId}`),
  });

  if (resultQuery.isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-300">분석 결과를 불러오는 중입니다...</p>
      </Card>
    );
  }

  if (!resultQuery.data) {
    return (
      <EmptyState
        title="분석 결과를 찾을 수 없습니다"
        description="아직 완료되지 않았거나 접근 가능한 결과가 아닐 수 있습니다."
      />
    );
  }

  const result = resultQuery.data;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle
            eyebrow="Analysis Result"
            title={result.summary_title || "분석 결과"}
            description={result.summary_message || "규칙 기반 1차 분석 결과를 보여줍니다."}
          />
          <div className="flex flex-wrap gap-3">
            <Badge tone={result.summary_level === "warning" ? "danger" : "success"}>
              {result.summary_level || "info"}
            </Badge>
            <Link
              href={`/support/inquiries/new?analysisRunId=${analysisId}`}
              className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
            >
              결과 문의
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {result.result_items.map((item) => (
          <Card key={`${item.ingredient_name_standard}-${item.amount_unit}`} className="bg-white/5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{item.ingredient_name_standard}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  총 {formatNumber(item.total_amount)} {item.amount_unit} / 중복 {item.duplication_count}회
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={item.risk_level === "high" ? "danger" : item.risk_level === "medium" ? "warning" : "success"}>
                  risk: {item.risk_level}
                </Badge>
                <Badge>{item.recommendation_level}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle
            eyebrow="Guides"
            title="복용/조합 가이드"
            description="백엔드 분석 가이드 테이블에서 내려온 설명입니다."
          />
          <div className="mt-5 space-y-3">
            {result.guides.length ? (
              result.guides.map((guide) => (
                <div
                  key={`${guide.guide_type}-${guide.display_order}-${guide.title}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge>{guide.guide_type}</Badge>
                    {guide.risk_level ? (
                      <Badge
                        tone={
                          guide.risk_level === "high"
                            ? "danger"
                            : guide.risk_level === "medium"
                              ? "warning"
                              : "success"
                        }
                      >
                        {guide.risk_level}
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{guide.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{guide.content}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="가이드 항목이 없습니다"
                description="현재 분석 결과에서 별도 복용/조합 가이드가 생성되지 않았습니다."
              />
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle
            eyebrow="Purpose Fit"
            title="목적별 적합도"
            description="선택한 목적 코드와 현재 성분 조합의 적합도를 요약합니다."
          />
          <div className="mt-5 space-y-3">
            {result.purpose_recommendations.length ? (
              result.purpose_recommendations.map((item) => (
                <div
                  key={`${item.purpose_code}-${item.display_order}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge>{item.purpose_code}</Badge>
                    <Badge
                      tone={
                        item.recommendation_level === "reduce"
                          ? "danger"
                          : item.recommendation_level === "review"
                            ? "warning"
                            : "success"
                      }
                    >
                      {item.recommendation_level}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{item.purpose_title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.fit_summary}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="선택된 목적 코드가 없습니다"
                description="분석 전 확인 화면에서 목적 코드를 넣으면 적합도 요약이 함께 생성됩니다."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function AnalysisHistoryPlaceholder() {
  const historyQuery = useQuery({
    queryKey: ["analyses", "history"],
    queryFn: () => apiClient<AnalysisHistoryItem[]>("/api/v1/analyses/history"),
  });

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          eyebrow="History"
          title="분석 기록 목록"
          description="이제 백엔드 history API를 연결해 최근 분석 기록을 조회합니다."
        />
      </Card>
      {historyQuery.isLoading ? (
        <Card>
          <p className="text-sm text-slate-300">분석 기록을 불러오는 중입니다...</p>
        </Card>
      ) : historyQuery.data?.length ? (
        <div className="space-y-4">
          {historyQuery.data.map((item) => (
            <Link
              key={item.analysis_run_id}
              href={`/analyses/${item.analysis_run_id}`}
              className="block rounded-[28px] border border-white/10 bg-slate-950/70 p-6 transition hover:bg-slate-900/90"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {item.summary_title || "분석 결과"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    생성: {item.created_at}
                    {item.completed_at ? ` / 완료: ${item.completed_at}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{item.analysis_status}</Badge>
                  {item.summary_level ? <Badge>{item.summary_level}</Badge> : null}
                  {item.is_reused_result ? <Badge tone="success">reused</Badge> : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="분석 기록이 없습니다"
          description="분석 전 확인 화면에서 첫 분석을 실행해 보세요."
        />
      )}
    </div>
  );
}
