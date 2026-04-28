# P7 최종 handoff

## 최종 화면/route 고정 목록
- `/`
- `/manual`
- `/sample`
- `/result/[analysisId]`

## 최종 API/endpoint 고정 목록
- `GET /api/v1/health`
- `GET /api/v1/sample-payloads`
- `POST /api/v1/uploads/parse-stub`
- `POST /api/v1/analyses`
- `GET /api/v1/analyses/{analysis_id}`

## 최종 데이터 모델/상태값 고정 목록
- `source_type`: `manual`, `sample_upload`
- `analysis_status`: `completed`
- `amount_unit`: `mg`, `mcg`, `CFU`
- 결과 그룹:
  - `duplicate_ingredients`
  - `over_limit_ingredients`
  - `timing_guides`

## 백엔드 handoff 요약
- FastAPI + sqlite
- stub parsing + rule-based analysis
- 결과 단건 저장/조회

## 프론트엔드 handoff 요약
- Next.js App Router
- 홈/직접 입력/샘플/결과 4개 route
- 로컬 state와 fetch만 사용

## 코드 생성 직전에 반드시 유지할 고정 규칙
- 로그인/회원가입/권한/관리자/결제/문의/운영 기능 금지
- endpoint 이름 변경 금지
- 필드명 변경 금지
- 상태값 변경 금지
- response shape 변경 금지
- 실제 OCR 필수화 금지
- 외부 유료 API 필수화 금지

## 이번 단계 확정 사항
- 현재 단계 기준으로 코드 생성을 시작할 수 있다.
- 구현은 작은 기능 묶음 단위로 순차 진행한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 코드 생성 1차 범위는 프로젝트 구조 + 백엔드 최소 실행 구조 + 프론트 최소 실행 구조

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- 정식 서비스용 인증/운영 기능을 끼워 넣으려는 시도

## 바로 다음 단계 진행 가능 항목
- 실제 코드 생성

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.codegen.ready: true
    prototype.locked_api_list:
      - GET /api/v1/health
      - GET /api/v1/sample-payloads
      - POST /api/v1/uploads/parse-stub
      - POST /api/v1/analyses
      - GET /api/v1/analyses/{analysis_id}
    prototype.locked_routes:
      - /
      - /manual
      - /sample
      - /result/[analysisId]
  supersedes:
    - draft_codegen_plan -> fixed_codegen_plan
  deprecated:
    - full_service_expansion
  carry_forward_only:
    - prototype.codegen.ready
    - prototype.locked_api_list
    - prototype.locked_routes
  do_not_carry_forward:
    - full_service_expansion

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
