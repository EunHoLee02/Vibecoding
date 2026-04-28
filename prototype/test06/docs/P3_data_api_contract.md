# P3 Data and API Contract

## 핵심 데이터 모델

- `SupplementIngredient`
- `Supplement`
- `InputBundle`
- `Analysis`
- `AnalysisResult`

## 필드 정의

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
- `result: AnalysisResult`

### AnalysisResult

- `supplements: Supplement[]`
- `duplicated_ingredients: object[]`
- `risk_items: object[]`
- `timing_guides: object[]`
- `summary_text: string`

## 상태값(enum)

- `source_type`: `manual`, `sample_upload`
- `input_status`: `ready`
- `analysis_status`: `completed`, `failed`
- `ocr_status`: `stubbed`
- `risk_level`: `watch`, `caution`
- `timing_slot`: `morning`, `lunch`, `evening`, `flexible`

## API 목록

- `GET /api/health`
- `POST /api/input-bundles`
- `POST /api/upload-bundles`
- `POST /api/analyses`
- `GET /api/analyses/:analysis_id`

## 공통 응답 구조

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

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

## API 고정 요약

- 직접 입력은 `POST /api/input-bundles`
- 업로드 stub는 `POST /api/upload-bundles`
- 분석 실행은 `POST /api/analyses`
- 결과 조회는 `GET /api/analyses/:analysis_id`

## authoritative_updates YAML

```yaml
authoritative_updates:
  frozen_values:
    endpoints:
      health: GET /api/health
      create_input_bundle: POST /api/input-bundles
      create_upload_bundle: POST /api/upload-bundles
      create_analysis: POST /api/analyses
      get_analysis: GET /api/analyses/:analysis_id
    enums:
      source_type:
        - manual
        - sample_upload
      input_status:
        - ready
      analysis_status:
        - completed
        - failed
      ocr_status:
        - stubbed
      risk_level:
        - watch
        - caution
      timing_slot:
        - morning
        - lunch
        - evening
        - flexible
  supersedes:
    - ad_hoc_endpoints -> fixed_core_endpoints
  deprecated:
    - auth_headers
  carry_forward_only:
    - endpoints
    - enums
  do_not_carry_forward:
    - extra_crud_models

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
