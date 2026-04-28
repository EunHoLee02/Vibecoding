"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Card, EmptyState, SectionTitle } from "@/components/ui/primitives";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/query";
import type { Inquiry, SupplementListItem } from "@/lib/types";

export function DashboardHome() {
  const supplementsQuery = useQuery({
    queryKey: queryKeys.supplements,
    queryFn: () => apiClient<SupplementListItem[]>("/api/v1/supplements"),
  });

  const inquiriesQuery = useQuery({
    queryKey: queryKeys.inquiries,
    queryFn: () => apiClient<Inquiry[]>("/api/v1/inquiries"),
  });

  const supplements = supplementsQuery.data ?? [];
  const inquiries = inquiriesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <SectionTitle
              eyebrow="Dashboard"
              title="지금 필요한 다음 행동을 바로 시작하세요"
              description="5단계 `/app` 카드형 대시보드 기준으로 빠른 등록, 분석, 문의 흐름을 한 화면에 묶었습니다."
            />
            <div className="flex flex-wrap gap-3">
              <Link
                href="/supplements/new/image"
                className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
              >
                이미지로 등록
              </Link>
              <Link
                href="/supplements/new/manual"
                className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                직접 입력
              </Link>
              <Link
                href="/analyses/new/preview"
                className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                분석 시작
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-white/5">
              <p className="text-sm text-slate-400">등록된 영양제</p>
              <p className="mt-3 text-4xl font-semibold text-white">{supplements.length}</p>
            </Card>
            <Card className="bg-white/5">
              <p className="text-sm text-slate-400">내 문의</p>
              <p className="mt-3 text-4xl font-semibold text-white">{inquiries.length}</p>
            </Card>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <SectionTitle
            eyebrow="Recent Supplements"
            title="최근 등록된 영양제"
            description="`GET /api/v1/supplements` 결과를 요약해서 보여줍니다."
          />
          <div className="mt-5 space-y-3">
            {supplementsQuery.isLoading ? (
              <p className="text-sm text-slate-300">영양제 목록을 불러오는 중입니다...</p>
            ) : supplements.length ? (
              supplements.slice(0, 5).map((supplement) => (
                <Link
                  key={supplement.id}
                  href={`/supplements/${supplement.id}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10"
                >
                  <div>
                    <p className="font-medium text-white">{supplement.product_name}</p>
                    <p className="text-sm text-slate-400">
                      {supplement.manufacturer || "제조사 미입력"}
                    </p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    {supplement.source_type}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyState
                title="등록된 영양제가 없습니다"
                description="이미지 업로드 또는 직접 입력으로 첫 영양제를 추가해 보세요."
              />
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle
            eyebrow="Support"
            title="최근 문의 상태"
            description="문의 목록 API 기준으로 최근 3건만 빠르게 보여줍니다."
          />
          <div className="mt-5 space-y-3">
            {inquiriesQuery.isLoading ? (
              <p className="text-sm text-slate-300">문의 목록을 불러오는 중입니다...</p>
            ) : inquiries.length ? (
              inquiries.slice(0, 3).map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <p className="font-medium text-white">{inquiry.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{inquiry.content}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">
                    {inquiry.status}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="문의 내역이 없습니다"
                description="분석이나 OCR 도중 도움이 필요하면 문의를 남길 수 있습니다."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
