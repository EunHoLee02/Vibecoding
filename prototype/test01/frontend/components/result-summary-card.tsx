import { AnalysisResult } from "@/lib/types";

type Props = {
  result: AnalysisResult;
};

export function ResultSummaryCard({ result }: Props) {
  return (
    <div className="stack">
      <section className="hero">
        <div className="badge info">{result.status}</div>
        <h1>분석 결과</h1>
        <p>{result.summary_line}</p>
      </section>

      <section className="card-grid two">
        <article className="result-card stack">
          <h2 className="section-title">입력된 영양제 목록</h2>
          {result.supplements.map((supplement) => (
            <div key={supplement.supplement_name}>
              <strong>{supplement.supplement_name}</strong>
              <ul className="list">
                {supplement.ingredients.map((ingredient) => (
                  <li key={`${supplement.supplement_name}-${ingredient.ingredient_name_raw}`}>
                    {ingredient.ingredient_name_raw} / {ingredient.amount_value} {ingredient.amount_unit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </article>

        <article className="result-card stack">
          <h2 className="section-title">중복 성분</h2>
          {result.duplicate_ingredients.length === 0 ? (
            <div className="alert info">중복 성분 없음</div>
          ) : (
            result.duplicate_ingredients.map((item) => (
              <div className="panel stack" key={item.ingredient_code}>
                <div className={`badge ${item.severity === "high" ? "danger" : "warn"}`}>{item.severity}</div>
                <strong>{item.ingredient_name}</strong>
                <div className="muted">
                  {item.total_amount} {item.amount_unit} / {item.supplement_count}개 제품
                </div>
                <div>{item.message}</div>
              </div>
            ))
          )}
        </article>
      </section>

      <section className="card-grid two">
        <article className="result-card stack">
          <h2 className="section-title">과다 가능성</h2>
          {result.over_limit_ingredients.length === 0 ? (
            <div className="alert info">현재 입력 기준으로는 고함량 검토 항목이 없습니다.</div>
          ) : (
            result.over_limit_ingredients.map((item) => (
              <div className="panel stack" key={`limit-${item.ingredient_code}`}>
                <div className={`badge ${item.severity === "high" ? "danger" : "warn"}`}>{item.severity}</div>
                <strong>{item.ingredient_name}</strong>
                <div className="muted">
                  합산 {item.total_amount} {item.amount_unit} / 주의 {item.caution_amount} / 상한 {item.upper_amount}
                </div>
                <div>{item.message}</div>
              </div>
            ))
          )}
        </article>

        <article className="result-card stack">
          <h2 className="section-title">복용 시간 가이드</h2>
          {result.timing_guides.length === 0 ? (
            <div className="alert info">표시할 복용 시간 가이드 없음</div>
          ) : (
            result.timing_guides.map((item) => (
              <div className="panel stack" key={`guide-${item.title}`}>
                <div className={`badge ${item.severity === "medium" ? "warn" : "info"}`}>{item.severity}</div>
                <strong>{item.title}</strong>
                <div>{item.guidance}</div>
              </div>
            ))
          )}
        </article>
      </section>
    </div>
  );
}
