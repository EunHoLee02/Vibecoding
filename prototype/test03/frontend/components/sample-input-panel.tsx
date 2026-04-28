"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createAnalysis, getSampleInputs, parseUploadInput } from "@/lib/api";
import { saveLatestAnalysis } from "@/lib/result-storage";
import { SampleInputOption, UploadParseResult } from "@/lib/types";

export function SampleInputPanel() {
  const router = useRouter();
  const [samples, setSamples] = useState<SampleInputOption[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<UploadParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSamples() {
      try {
        setSamples(await getSampleInputs());
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "샘플 목록을 불러오지 못했습니다.");
      }
    }

    void loadSamples();
  }, []);

  async function handleSampleLoad(sampleId: string) {
    setLoading(true);
    setError("");

    try {
      const result = await parseUploadInput({ sampleId });
      setParsed(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "샘플 파싱에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileLoad() {
    if (!selectedFile) {
      setError("업로드할 파일을 먼저 선택해 주세요.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await parseUploadInput({ file: selectedFile });
      setParsed(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "업로드 파싱에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    if (!parsed) {
      setError("먼저 샘플이나 업로드 파싱 결과를 불러와 주세요.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await createAnalysis(parsed.supplements);
      saveLatestAnalysis(result);
      router.push("/result");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석 실행에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-grid">
      {error ? <div className="status-box error">{error}</div> : null}

      <section className="panel stack">
        <div className="eyebrow">샘플 선택</div>
        <h2 className="section-title">샘플 카드에서 바로 불러오기</h2>
        <div className="sample-grid">
          {samples.map((sample) => (
            <article className="sample-card" key={sample.sample_id}>
              <div className="eyebrow">{sample.sample_id}</div>
              <strong>{sample.title}</strong>
              <p className="muted">{sample.description}</p>
              <ul className="sample-list muted">
                {sample.supplements.map((supplement) => (
                  <li key={`${sample.sample_id}-${supplement.product_name}`}>{supplement.product_name}</li>
                ))}
              </ul>
              <button disabled={loading} onClick={() => handleSampleLoad(sample.sample_id)} type="button">
                샘플 불러오기
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="panel stack">
        <div className="eyebrow warn">업로드 흐름</div>
        <h2 className="section-title">업로드 파일로 불러오기</h2>
        <p className="muted">
          실제 OCR 대신 업로드 파일명 기준으로 mock parse를 수행합니다.
        </p>
        <div className="field">
          <label>업로드 파일</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <div className="section-actions">
          <button disabled={loading || !selectedFile} onClick={handleFileLoad} type="button">
            업로드 파일로 불러오기
          </button>
        </div>
      </section>

      <section className="panel stack">
        <div className="eyebrow">파싱 결과</div>
        <h2 className="section-title">미리보기 후 바로 분석 실행</h2>
        {!parsed ? (
          <div className="status-box info">
            아직 파싱 결과가 없습니다. 샘플을 고르거나 파일 업로드 흐름을 먼저 실행해 주세요.
          </div>
        ) : (
          <div className="stack">
            {parsed.message ? <div className="status-box info">{parsed.message}</div> : null}
            {parsed.supplements.map((supplement) => (
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
            <div className="section-actions">
              <button className="button-primary" disabled={loading} onClick={runAnalysis} type="button">
                {loading ? "분석 연결 중..." : "이 조합으로 분석 실행"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
