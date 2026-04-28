# P3 데이터 모델과 API 계약

## 1. 프로토타입 핵심 데이터 모델 목록
- `IngredientItem`
- `SupplementInput`
- `SampleInputOption`
- `UploadParseResult`
- `AnalysisRequest`
- `DuplicateIngredientItem`
- `RiskItem`
- `TimingGuide`
- `AnalysisResult`

## 2. 각 데이터 모델의 필드 정의
### IngredientItem
- `ingredient_name`: string
- `amount_value`: number
- `amount_unit`: `mg` | `mcg` | `IU` | `CFU`

### SupplementInput
- `product_name`: string
- `manufacturer`: string | null
- `source_type`: `manual` | `upload` | `sample`
- `ingredients`: `IngredientItem[]`

### SampleInputOption
- `sample_id`: string
- `title`: string
- `description`: string
- `supplements`: `SupplementInput[]`

### UploadParseResult
- `parse_status`: `parsed` | `failed`
- `source_type`: `upload` | `sample`
- `supplements`: `SupplementInput[]`
- `message`: string | null

### AnalysisRequest
- `supplements`: `SupplementInput[]`

### DuplicateIngredientItem
- `ingredient_name`: string
- `product_count`: number
- `product_names`: `string[]`
- `total_amount`: number
- `amount_unit`: string

### RiskItem
- `ingredient_name`: string
- `total_amount`: number
- `reference_amount`: number
- `amount_unit`: string
- `risk_level`: `caution` | `high`
- `message`: string

### TimingGuide
- `ingredient_name`: string
- `recommended_time`: `morning` | `afternoon` | `evening` | `with_meal` | `empty_stomach` | `anytime`
- `message`: string

### AnalysisResult
- `analysis_status`: `completed` | `failed`
- `supplements`: `SupplementInput[]`
- `duplicated_ingredients`: `DuplicateIngredientItem[]`
- `risk_items`: `RiskItem[]`
- `timing_guides`: `TimingGuide[]`
- `summary_text`: string

## 3. 필수 상태값(enum) 정의
- `source_type`
  - `manual`
  - `upload`
  - `sample`
- `parse_status`
  - `parsed`
  - `failed`
- `analysis_status`
  - `completed`
  - `failed`
- `risk_level`
  - `caution`
  - `high`
- `recommended_time`
  - `morning`
  - `afternoon`
  - `evening`
  - `with_meal`
  - `empty_stomach`
  - `anytime`

## 4. 프로토타입 핵심 API 목록
- `GET /health`
- `GET /api/v1/sample-inputs`
- `POST /api/v1/uploads/parse`
- `POST /api/v1/analyses`

## 5. 각 API의 method / endpoint / 목적
- `GET /health`
  - 목적: 서버 상태 확인
- `GET /api/v1/sample-inputs`
  - 목적: 샘플 카드와 샘플 입력 payload 조회
- `POST /api/v1/uploads/parse`
  - 목적: 업로드 파일 또는 샘플 선택을 파싱 결과로 변환
- `POST /api/v1/analyses`
  - 목적: 입력된 영양제 조합을 분석해 결과를 즉시 반환

## 6. 각 API의 요청 body 또는 파라미터
- `GET /health`
  - 없음
- `GET /api/v1/sample-inputs`
  - 없음
- `POST /api/v1/uploads/parse`
  - `multipart/form-data`
  - `sample_id`: string | optional
  - `file`: binary | optional
- `POST /api/v1/analyses`
  - JSON body
  - `supplements`: `SupplementInput[]`

## 7. 각 API의 응답 형식
### `GET /health`
```json
{
  "success": true,
  "data": {
    "status": "ok"
  },
  "error": null
}
```

### `GET /api/v1/sample-inputs`
```json
{
  "success": true,
  "data": {
    "sample_inputs": []
  },
  "error": null
}
```

### `POST /api/v1/uploads/parse`
```json
{
  "success": true,
  "data": {
    "parse_status": "parsed",
    "source_type": "upload",
    "supplements": [],
    "message": "string or null"
  },
  "error": null
}
```

### `POST /api/v1/analyses`
```json
{
  "success": true,
  "data": {
    "analysis_status": "completed",
    "supplements": [],
    "duplicated_ingredients": [],
    "risk_items": [],
    "timing_guides": [],
    "summary_text": "string"
  },
  "error": null
}
```

## 8. 공통 성공/실패 응답 포맷
- 성공
  - `success`: true
  - `data`: object
  - `error`: null
- 실패
  - `success`: false
  - `data`: null
  - `error.code`: string
  - `error.message`: string

## 9. 다음 단계에서 바로 사용할 데이터/API 고정 요약
- 핵심 endpoint는 4개로 고정한다.
- 분석 결과는 `POST /api/v1/analyses` 응답에 즉시 포함한다.
- 결과 화면은 `supplements`, `duplicated_ingredients`, `risk_items`, `timing_guides`, `summary_text`를 바로 렌더링한다.

## 이번 단계 확정 사항
- 데이터 모델 이름, 필드명, enum, endpoint 이름을 현재 정의로 고정한다.
- 업로드 파싱은 `multipart/form-data` 기반으로 고정한다.
- 결과 조회 전용 추가 endpoint 없이 분석 응답에서 결과를 즉시 반환한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 프론트엔드와 백엔드는 `POST /api/v1/analyses`의 결과 응답 구조를 그대로 공유해야 한다.
- `source_type`, `parse_status`, `analysis_status`, `risk_level`, `recommended_time` enum은 이후 단계에서 바꾸지 않는다.
- 샘플 목록 조회와 업로드 파싱, 분석 실행만 구현하면 시연 흐름이 완성된다.

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- 결과를 별도 조회 endpoint로 분리하거나 필드명을 바꾸면 현재 계약과 충돌한다.

## 바로 다음 단계 진행 가능 항목
- P4 기술 스택과 구현 구조 정의

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.api.health: GET /health
    prototype.api.sample_inputs: GET /api/v1/sample-inputs
    prototype.api.upload_parse: POST /api/v1/uploads/parse
    prototype.api.analysis_create: POST /api/v1/analyses
    prototype.enums.source_type:
      - manual
      - upload
      - sample
    prototype.enums.parse_status:
      - parsed
      - failed
    prototype.enums.analysis_status:
      - completed
      - failed
    prototype.enums.risk_level:
      - caution
      - high
    prototype.response_shape.success:
      - success
      - data
      - error
    prototype.result_fields:
      - supplements
      - duplicated_ingredients
      - risk_items
      - timing_guides
      - summary_text
  supersedes:
    - flexible_contract -> fixed_demo_contract
  deprecated:
    - result_lookup_endpoint
    - account_models
  carry_forward_only:
    - prototype.api.health
    - prototype.api.sample_inputs
    - prototype.api.upload_parse
    - prototype.api.analysis_create
    - prototype.enums.source_type
    - prototype.enums.parse_status
    - prototype.enums.analysis_status
    - prototype.enums.risk_level
    - prototype.response_shape.success
    - prototype.result_fields
  do_not_carry_forward:
    - result_lookup_endpoint
    - account_models

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
