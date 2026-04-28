"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import type { Inquiry } from "@/lib/types";
import { inquirySchema } from "@/lib/validators";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AppApiError) {
    return error.message;
  }

  return fallback;
}

export function InquiriesList() {
  const inquiriesQuery = useQuery({
    queryKey: queryKeys.inquiries,
    queryFn: () => apiClient<Inquiry[]>("/api/v1/inquiries"),
  });

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            eyebrow="Support"
            title="문의 내역"
            description="현재 10b 백엔드의 사용자 문의 목록 API를 그대로 사용합니다."
          />
          <Link
            href="/support/inquiries/new"
            className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            문의 접수
          </Link>
        </div>
      </Card>

      {inquiriesQuery.isLoading ? (
        <Card>
          <p className="text-sm text-slate-300">문의 목록을 불러오는 중입니다...</p>
        </Card>
      ) : inquiriesQuery.data?.length ? (
        <div className="space-y-4">
          {inquiriesQuery.data.map((inquiry) => (
            <Card key={inquiry.id} className="bg-white/5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{inquiry.inquiry_type}</Badge>
                    <Badge tone={inquiry.status === "resolved" ? "success" : "warning"}>
                      {inquiry.status}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{inquiry.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{inquiry.content}</p>
                </div>
                <Link
                  href={`/support/inquiries/new?relatedInquiryId=${inquiry.id}`}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                >
                  추가 문의
                </Link>
              </div>
              {inquiry.admin_note ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Admin note</p>
                  <p className="mt-2 text-sm text-slate-200">{inquiry.admin_note}</p>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="문의 내역이 없습니다"
          description="분석 또는 OCR 진행 중 도움이 필요하면 문의를 남길 수 있습니다."
        />
      )}
    </div>
  );
}

export function InquiryCreateForm({
  analysisRunId,
  supplementId,
}: {
  analysisRunId?: string | null;
  supplementId?: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof inquirySchema>>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      inquiry_type: analysisRunId ? "analysis" : supplementId ? "supplement" : "general",
      related_analysis_run_id: analysisRunId ?? "",
      related_supplement_id: supplementId ?? "",
      title: "",
      content: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: z.infer<typeof inquirySchema>) =>
      apiClient("/api/v1/inquiries", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          related_analysis_run_id: payload.related_analysis_run_id || null,
          related_supplement_id: payload.related_supplement_id || null,
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inquiries });
      router.push("/support/inquiries");
    },
  });

  const errorMessage = mutation.error
    ? getErrorMessage(mutation.error, "문의 등록 중 오류가 발생했습니다.")
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          eyebrow="New Inquiry"
          title="문의 접수"
          description="5단계 문서 기준대로 파일 첨부 없이 제목과 내용만 접수합니다."
        />
      </Card>

      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <Card className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">문의 유형</label>
              <Select {...form.register("inquiry_type")}>
                <option value="general">general</option>
                <option value="error_report">error_report</option>
                <option value="analysis">analysis</option>
                <option value="supplement">supplement</option>
                <option value="account">account</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">관련 분석 Run ID</label>
              <Input {...form.register("related_analysis_run_id")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">관련 영양제 ID</label>
              <Input {...form.register("related_supplement_id")} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">제목</label>
            <Input {...form.register("title")} />
            <FieldError message={form.formState.errors.title?.message} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">내용</label>
            <Textarea {...form.register("content")} />
            <FieldError message={form.formState.errors.content?.message} />
          </div>
        </Card>

        {errorMessage ? (
          <Card className="border-rose-500/30 bg-rose-500/10">
            <p className="text-sm text-rose-200">{errorMessage}</p>
          </Card>
        ) : null}

        <div className="sticky bottom-4 z-10 flex justify-end gap-3">
          <Link
            href="/support/inquiries"
            className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
          >
            목록으로
          </Link>
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "접수 중..." : "문의 접수"}
          </Button>
        </div>
      </form>
    </div>
  );
}
