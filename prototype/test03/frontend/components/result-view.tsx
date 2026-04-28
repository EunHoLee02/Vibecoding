"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { clearLatestAnalysis, loadLatestAnalysis } from "@/lib/result-storage";
import { AnalysisResult } from "@/lib/types";

function riskClass(level: "caution" | "high") {
  return level === "high" ? "eyebrow danger" : "eyebrow warn";
}

export function ResultView() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    setResult(loadLatestAnalysis());
  }, []);

  if (!result) {
    return (
      <section className="panel stack">
        <div className="eyebrow warn">result_screen</div>
        <h1 className="section-title">표시할 분석 결과가 아직 없습니다.</h1>
        <p className="muted">
          먼저 직접 입력 또는 샘플 업로드 체험에서 분석을 실행해 주세요.
        </p>
        <div className="section-actions">
          <Link className="button-link" href="/">
            다시 입력하기
          </Link>
          <Link className="button-link" href="/input-source">
            샘플 업로드 체험으로 이동
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="page-grid">
      <section className="hero stack">
        <div className="eyebrow">result_screen</div>
        <h1>분석 결과</h1>
        <div className="summary-banner">
          <strong>{result.summary_text}</strong>
          <div className="pill-row">
            <span className="pill">analysis_status: {result.analysis_status}</span>
            <span className="pill">supplements: {result.supplements.length}</span>
            <span className="pill">duplicated: {result.duplicated_ingredients.length}</span>
            <span className="pill">risk: {result.risk_items.length}</span>
          </div>
        </div>
      </section>

      <div className="result-grid two">
        <section className="result-card stack">
          <h2 className="section-title">입력한 영양제 목록</h2>
          {result.supplements.map((supplement) => (
            <article className="supplement-card" key={supplement.product_name}>
              <strong>{supplement.product_name}</strong>
              <div className="muted">{supplement.manufacturer ?? "manufacturer 없음"}</div>
              <ul className="sample-list">
                {supplement.ingredients.map((ingredient) => (
                  <li key={`${supplement.product_name}-${ingredient.ingredient_name}`}>
                    {ingredient.ingredient_name} / {ingredient.amount_value} {ingredient.amount_unit}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="result-card stack">
          <h2 className="section-title">중복 성분</h2>
          {result.duplicated_ingredients.length === 0 ? (
            <div className="status-box info">현재 입력 기준으로 중복 성분 항목이 없습니다.</div>
          ) : (
            result.duplicated_ingredients.map((item) => (
              <article className="card stack" key={`duplicate-${item.ingredient_name}`}>
                <div className="eyebrow warn">{item.product_count}개 제품</div>
                <strong>{item.ingredient_name}</strong>
                <div className="muted">
                  합산 {item.total_amount} {item.amount_unit}
                </div>
                <div className="pill-row">
                  {item.product_names.map((name) => (
                    <span className="pill" key={`${item.ingredient_name}-${name}`}>
                      {name}
                    </span>
                  ))}
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      <div className="result-grid two">
        <section className="result-card stack">
          <h2 className="section-title">과다 가능성</h2>
          {result.risk_items.length === 0 ? (
            <div className="status-box info">현재 입력 기준으로 주의가 필요한 성분은 보이지 않습니다.</div>
          ) : (
            result.risk_items.map((item) => (
              <article className="card stack" key={`risk-${item.ingredient_name}`}>
                <div className={riskClass(item.risk_level)}>{item.risk_level}</div>
                <strong>{item.ingredient_name}</strong>
                <div className="muted">
                  합산 {item.total_amount} {item.amount_unit} / 기준 {item.reference_amount} {item.amount_unit}
                </div>
                <p>{item.message}</p>
              </article>
            ))
          )}
        </section>

        <section className="result-card stack">
          <h2 className="section-title">복용 시간 가이드</h2>
          {result.timing_guides.length === 0 ? (
            <div className="status-box info">표시할 복용 시간 가이드가 없습니다.</div>
          ) : (
            result.timing_guides.map((item) => (
              <article className="card stack" key={`timing-${item.ingredient_name}`}>
                <div className="eyebrow">{item.recommended_time}</div>
                <strong>{item.ingredient_name}</strong>
                <p>{item.message}</p>
              </article>
            ))
          )}
        </section>
      </div>

      <section className="panel stack">
        <div className="section-actions">
          <Link
            className="button-link"
            href="/"
            onClick={() => {
              clearLatestAnalysis();
            }}
          >
            다시 입력하기
          </Link>
          <Link className="button-link" href="/input-source">
            샘플 업로드 체험으로 이동
          </Link>
        </div>
      </section>
    </div>
  );
}
