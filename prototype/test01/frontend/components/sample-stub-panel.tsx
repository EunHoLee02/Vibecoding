"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createAnalysis, getSamplePayloads, parseStubPayload } from "@/lib/api";
import { ParseStubResponse, SamplePayload } from "@/lib/types";

export function SampleStubPanel() {
  const router = useRouter();
  const [samples, setSamples] = useState<SamplePayload[]>([]);
  const [parsed, setParsed] = useState<ParseStubResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setSamples(await getSamplePayloads());
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "샘플 목록을 불러오지 못했습니다.");
      }
    }
    void load();
  }, []);

  async function loadFromSample(sampleId: string) {
    setLoading(true);
    setError("");
    try {
      setParsed(await parseStubPayload({ sample_id: sampleId }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "샘플 파싱에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function loadFromFileName() {
    setLoading(true);
    setError("");
    try {
      setParsed(await parseStubPayload({ file_name: fileName }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "파일명 기반 파싱에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    if (!parsed) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await createAnalysis(parsed.supplements);
      router.push(`/result/${result.analysis_id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석 실행에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      {error ? <div className="alert error">{error}</div> : null}

      <section className="panel stack">
        <h2 className="section-title">샘플 카드</h2>
        {samples.length === 0 ? (
          <div className="alert info">아직 샘플 목록을 불러오지 못했습니다.</div>
        ) : (
          <div className="card-grid two">
            {samples.map((sample) => (
              <article className="panel stack" key={sample.sample_id}>
                <div className="badge info">{sample.sample_id}</div>
                <strong>{sample.title}</strong>
                <p className="muted">{sample.description}</p>
                <button disabled={loading} onClick={() => loadFromSample(sample.sample_id)} type="button">
                  이 샘플 불러오기
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel stack">
        <h2 className="section-title">파일명 기반 stub</h2>
        <div className="input-grid two">
          <div className="field">
            <label>파일명</label>
            <input
              placeholder="예: immune_label.jpg"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
            />
          </div>
        </div>
        <div className="nav">
          <button disabled={loading || !fileName.trim()} onClick={loadFromFileName} type="button">
            파일명으로 stub 파싱
          </button>
        </div>
      </section>

      <section className="panel stack">
        <h2 className="section-title">파싱 결과 미리보기</h2>
        {!parsed ? (
          <div className="alert info">아직 파싱 결과가 없습니다. 샘플 카드 또는 파일명 stub를 먼저 선택해 주세요.</div>
        ) : (
          <div className="stack">
            {parsed.supplements.map((supplement) => (
              <article className="result-card stack" key={supplement.supplement_name}>
                <strong>{supplement.supplement_name}</strong>
                <div className="muted">1일 섭취 횟수: {supplement.daily_servings}</div>
                <ul className="list">
                  {supplement.ingredients.map((ingredient) => (
                    <li key={`${supplement.supplement_name}-${ingredient.ingredient_name_raw}`}>
                      {ingredient.ingredient_name_raw} / {ingredient.amount_value} {ingredient.amount_unit}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
            <div className="nav">
              <button className="button-primary" disabled={loading} onClick={runAnalysis} type="button">
                이 조합으로 분석 실행
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
