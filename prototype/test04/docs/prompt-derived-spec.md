# Prompt-Derived Spec

## 기준

아래 문서는 `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack`의 단계형 프롬프트만 읽고 정리했습니다.

## P0-P7 고정 사항

- prototype mode: `prototype_only`
- auth mode: `none`
- admin mode: `none`
- payment mode: `none`
- core flow: `input_to_analysis_to_result`
- backend mode: `required`
- analysis mode: `rule_based_first`
- ocr mode: `stub_or_mock_allowed`
- result persistence: `optional`

## 화면 / route

- `/` : 시작/입력 화면
- `/sample` : 업로드 또는 샘플 선택 화면
- `/result` : 분석 결과 화면

## API / endpoint

- `GET /api/health`
- `POST /api/supplements/manual`
- `POST /api/supplements/sample`
- `POST /api/analysis`

## 핵심 데이터 모델

- `Supplement`
  - `product_name`
  - `manufacturer`
  - `ingredients`
- `Ingredient`
  - `name`
  - `amount`
  - `unit`
- `AnalysisResult`
  - `supplements`
  - `duplicated_ingredients`
  - `risk_items`
  - `timing_guides`
  - `summary_text`

## 응답 규약

성공:

```json
{
  "success": true,
  "data": {}
}
```

실패:

```json
{
  "success": false,
  "error": {
    "code": "STRING_CODE",
    "message": "사용자 메시지"
  }
}
```

## 구현 가정

- `risk_items`의 기준값은 실제 진단 근거가 아니라 프로토타입 내부 샘플 기준값입니다.
- `sample upload`는 파일명을 받되 실제 OCR이나 multipart 파싱은 수행하지 않습니다.
- 결과 저장은 구현하지 않습니다.
