# P3 데이터 모델/API 계약

## 엔터티 목록

### SupplementInput
- `supplement_name`: string
- `daily_servings`: number
- `source_type`: `manual` | `sample_upload`
- `ingredients`: IngredientInput[]

### IngredientInput
- `ingredient_name_raw`: string
- `amount_value`: number
- `amount_unit`: `mg` | `mcg` | `CFU`

### AnalysisResult
- `analysis_id`: string
- `status`: `completed`
- `summary_line`: string
- `supplements`: SupplementInput[]
- `duplicate_ingredients`: DuplicateIngredient[]
- `over_limit_ingredients`: OverLimitIngredient[]
- `timing_guides`: TimingGuide[]

### DuplicateIngredient
- `ingredient_code`: string
- `ingredient_name`: string
- `supplement_count`: number
- `total_amount`: number
- `amount_unit`: string
- `severity`: `low` | `medium` | `high`
- `message`: string

### OverLimitIngredient
- `ingredient_code`: string
- `ingredient_name`: string
- `total_amount`: number
- `caution_amount`: number
- `upper_amount`: number
- `amount_unit`: string
- `severity`: `medium` | `high`
- `message`: string

### TimingGuide
- `title`: string
- `guidance`: string
- `severity`: `low` | `medium`

## API 목록

### GET /api/v1/health
- 목적: API 상태 확인

### GET /api/v1/sample-payloads
- 목적: 샘플 카드와 샘플 payload 목록 조회

### POST /api/v1/uploads/parse-stub
- 목적: 샘플 키 또는 파일명으로 파싱 결과 stub 생성
- 요청:
  - `sample_id`: string | null
  - `file_name`: string | null
- 응답:
  - `source_type`
  - `supplements`

### POST /api/v1/analyses
- 목적: 분석 실행
- 요청:
  - `supplements`: SupplementInput[]
- 응답:
  - `analysis_id`
  - `status`
  - `summary_line`

### GET /api/v1/analyses/{analysis_id}
- 목적: 분석 결과 조회
- 응답:
  - `analysis_id`
  - `status`
  - `summary_line`
  - `supplements`
  - `duplicate_ingredients`
  - `over_limit_ingredients`
  - `timing_guides`

## 공통 응답 구조
- 성공:
  - `success`: true
  - `data`: object
- 실패:
  - `success`: false
  - `error`:
    - `code`
    - `message`

## mock 데이터 구조
- 샘플 키:
  - `daily_core`
  - `immune_focus`
- 각 샘플은 파싱 완료된 `supplements` 배열을 반환

## 이번 단계 확정 사항
- endpoint는 `GET /api/v1/health`, `GET /api/v1/sample-payloads`, `POST /api/v1/uploads/parse-stub`, `POST /api/v1/analyses`, `GET /api/v1/analyses/{analysis_id}`로 고정한다.
- `status` enum은 `completed`만 사용한다.
- `source_type` enum은 `manual`, `sample_upload`로 고정한다.
- 응답 래퍼는 `success/data` 또는 `success/error` 구조로 고정한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 분석 API는 비동기 상태머신 없이 즉시 `completed` 결과를 반환/조회한다.
- 실제 OCR 헤더나 인증 헤더는 포함하지 않는다.
- 결과 모델은 duplicate, over_limit, timing 세 그룹으로 단순화한다.

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- 결과 모델에 목적 추천이나 기록 이력을 추가하면 현재 계약과 충돌한다.

## 바로 다음 단계 진행 가능 항목
- P4 기술 스택/구현 구조

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.api.analysis_create: POST /api/v1/analyses
    prototype.api.analysis_get: GET /api/v1/analyses/{analysis_id}
    prototype.api.health: GET /api/v1/health
    prototype.api.sample_payloads: GET /api/v1/sample-payloads
    prototype.api.upload_parse_stub: POST /api/v1/uploads/parse-stub
    prototype.enums.analysis_status:
      - completed
    prototype.enums.source_type:
      - manual
      - sample_upload
    prototype.response_shape.error:
      - success
      - error.code
      - error.message
    prototype.response_shape.success:
      - success
      - data
  supersedes:
    - generic_api_plan -> fixed_demo_endpoints
  deprecated:
    - auth_headers
    - async_status_machine
  carry_forward_only:
    - prototype.api.analysis_create
    - prototype.api.analysis_get
    - prototype.api.health
    - prototype.api.sample_payloads
    - prototype.api.upload_parse_stub
    - prototype.enums.analysis_status
    - prototype.enums.source_type
    - prototype.response_shape.error
    - prototype.response_shape.success
  do_not_carry_forward:
    - auth_headers
    - async_status_machine

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
