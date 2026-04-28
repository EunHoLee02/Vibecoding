import React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAnalysis } from "../api.js";
import { StatusMessage } from "../components/StatusMessage.jsx";

export function ResultScreen() {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysis() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getAnalysis(analysisId);
        if (!cancelled) {
          setAnalysis(response);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  if (isLoading) {
    return (
      <main className="page-shell">
        <section className="content-card">
          <StatusMessage tone="neutral" title="분석 결과 불러오는 중" message="잠시만 기다려주세요." />
        </section>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="page-shell">
        <section className="content-card">
          <StatusMessage tone="danger" title="결과 확인" message={errorMessage} />
          <div className="hero-actions">
            <Link className="secondary-link" to="/">
              다시 입력하기
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const { result } = analysis;

  return (
    <main className="page-shell">
      <section className="hero-card hero-card--compact">
        <div className="eyebrow">Analysis Result</div>
        <h1>현재 조합의 핵심 포인트를 한 화면에서 정리했습니다.</h1>
        <p>{result.summary_text}</p>
        <div className="hero-actions">
          <Link className="primary-link-button" to="/">
            다시 입력하기
          </Link>
          <Link className="secondary-link" to="/upload">
            다른 샘플 보기
          </Link>
        </div>
      </section>

      <section className="result-grid">
        <article className="result-section">
          <h2>입력한 영양제 목록</h2>
          <div className="stack-md">
            {result.supplements.map((supplement) => (
              <div className="list-card" key={supplement.product_name}>
                <strong>{supplement.product_name}</strong>
                <p>{supplement.manufacturer || "제조사 미입력"}</p>
                <ul>
                  {supplement.ingredients.map((ingredient) => (
                    <li key={`${supplement.product_name}-${ingredient.ingredient_name}`}>
                      {ingredient.ingredient_name} {ingredient.amount}
                      {ingredient.unit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>

        <article className="result-section">
          <h2>중복 성분</h2>
          {result.duplicated_ingredients.length === 0 ? (
            <p className="empty-note">겹쳐 보이는 성분이 많지 않습니다.</p>
          ) : (
            <div className="stack-md">
              {result.duplicated_ingredients.map((item) => (
                <div className="list-card" key={item.ingredient_name}>
                  <strong>{item.ingredient_name}</strong>
                  <p>
                    총 {item.total_amount}
                    {item.unit} / {item.supplement_names.join(", ")}
                  </p>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="result-section">
          <h2>과다 가능성</h2>
          {result.risk_items.length === 0 ? (
            <p className="empty-note">기준선에 가까운 항목은 많지 않습니다.</p>
          ) : (
            <div className="stack-md">
              {result.risk_items.map((item) => (
                <div className="list-card" key={item.ingredient_name}>
                  <strong>
                    {item.ingredient_name} <span className={`risk-pill risk-pill--${item.level}`}>{item.level}</span>
                  </strong>
                  <p>
                    총 {item.total_amount}
                    {item.unit} / 기준 {item.threshold_amount}
                    {item.unit}
                  </p>
                  <p>{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="result-section">
          <h2>복용 시간 가이드</h2>
          <div className="stack-md">
            {result.timing_guides.map((item) => (
              <div className="list-card" key={item.timing_slot}>
                <strong>{item.timing_slot}</strong>
                <p>{item.supplement_names.join(", ")}</p>
                <p>{item.guide_text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
