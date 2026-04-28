# Final Spec

## 근거

- `prototype_prompt_pack/00_prototype_master_prompt_v1.txt`
- `prototype_prompt_pack/welltrack_prototype_prompt_pack/01_P0_input_prompt.txt` ~ `09_final_code_generation_prompt.txt`

## 확정 범위

- 프로토타입 모드만 구현
- 로그인, 관리자, 결제, 문의, 운영 기능 제외
- 핵심 흐름은 `입력 -> 분석 실행 -> 결과 확인`
- 분석은 rule-based 우선
- 업로드/OCR은 stub/mock 우선
- 결과는 의료 진단처럼 보이지 않게 일반 가이드 수준 유지

## 최종 화면 / route

- `/` : 시작 및 직접 입력 화면
- `/upload` : 샘플 업로드 또는 샘플 선택 화면
- `/result/:analysisId` : 분석 결과 화면

## 최종 API / endpoint

- `GET /api/health`
- `POST /api/input-bundles`
- `POST /api/upload-bundles`
- `POST /api/analyses`
- `GET /api/analyses/:analysis_id`

## 최종 데이터 모델

### SupplementIngredient

- `ingredient_name: string`
- `amount: number`
- `unit: string`

### Supplement

- `product_name: string`
- `manufacturer: string`
- `ingredients: SupplementIngredient[]`

### InputBundle

- `input_bundle_id: string`
- `source_type: manual | sample_upload`
- `input_status: ready`
- `supplements: Supplement[]`
- `upload_stub?: { upload_mode, sample_key, file_name, ocr_status }`

### Analysis

- `analysis_id: string`
- `input_bundle_id: string`
- `analysis_status: completed | failed`
- `result`

### AnalysisResult

- `supplements: Supplement[]`
- `duplicated_ingredients: DuplicatedIngredient[]`
- `risk_items: RiskItem[]`
- `timing_guides: TimingGuide[]`
- `summary_text: string`

## 공통 응답 구조

성공:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

실패:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "message": "입력 형식을 다시 확인해주세요."
  }
}
```

## 기술 스택

- frontend: React + Vite
- backend: Node.js + Express
- storage: in-memory
- upload parsing: stub/mock

## 추측 여부

- `POST /api/input-bundles`를 별도 분리한 점은 프롬프트 팩의 "직접 입력 처리 API" 요구를 충족하기 위한 설계 선택입니다.
- 실제 prompt 파일에 이 endpoint 이름이 이미 박혀 있던 것은 아니고, 최소 API 개수를 유지하면서 요구사항을 맞추기 위해 제가 확정한 값입니다.
