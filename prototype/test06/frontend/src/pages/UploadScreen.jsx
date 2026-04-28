import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createAnalysis, createUploadBundle } from "../api.js";
import { sampleOptions } from "../constants.js";
import { StatusMessage } from "../components/StatusMessage.jsx";

export function UploadScreen() {
  const [selectedSample, setSelectedSample] = useState(sampleOptions[0].key);
  const [fileName, setFileName] = useState("");
  const [parsedBundle, setParsedBundle] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  async function handleLoadSample() {
    setErrorMessage("");
    setIsUploading(true);

    try {
      const bundle = await createUploadBundle({
        upload_mode: "sample_upload",
        sample_key: selectedSample,
        file_name: fileName,
      });
      setParsedBundle(bundle);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAnalyzeBundle() {
    if (!parsedBundle) {
      setErrorMessage("먼저 샘플을 불러와주세요.");
      return;
    }

    setErrorMessage("");
    setIsAnalyzing(true);

    try {
      const analysis = await createAnalysis({
        input_bundle_id: parsedBundle.input_bundle_id,
      });
      navigate(`/result/${analysis.analysis_id}`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card hero-card--compact">
        <div className="eyebrow">Upload Stub Flow</div>
        <h1>샘플 업로드 체험으로 분석 흐름을 빠르게 시연합니다.</h1>
        <p>실제 OCR 대신, 선택한 샘플과 파일 이름을 기반으로 파싱 결과를 보여주는 stub 흐름입니다.</p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={handleLoadSample} disabled={isUploading}>
            {isUploading ? "샘플 불러오는 중..." : "샘플 불러오기"}
          </button>
          <Link className="secondary-link" to="/">
            직접 입력으로 돌아가기
          </Link>
        </div>
      </section>

      <section className="content-card stack-lg">
        <div className="grid-two">
          <label>
            <span>샘플 선택</span>
            <select value={selectedSample} onChange={(event) => setSelectedSample(event.target.value)}>
              {sampleOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>파일명 업로드 stub</span>
            <input
              type="file"
              onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
            />
          </label>
        </div>

        <div className="sample-grid">
          {sampleOptions.map((option) => (
            <article className={`sample-card ${option.key === selectedSample ? "sample-card--active" : ""}`} key={option.key}>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
            </article>
          ))}
        </div>

        <StatusMessage tone="danger" title="업로드 확인" message={errorMessage} />

        {parsedBundle ? (
          <section className="result-section">
            <div className="section-row">
              <div>
                <h2>파싱 미리보기</h2>
                <p>
                  `ocr_status: {parsedBundle.upload_stub?.ocr_status}` 상태로 샘플 결과를 반환했습니다.
                </p>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={handleAnalyzeBundle}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "분석 중..." : "이 조합 분석하기"}
              </button>
            </div>

            <div className="stack-md">
              {parsedBundle.supplements.map((supplement) => (
                <article className="list-card" key={supplement.product_name}>
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
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
