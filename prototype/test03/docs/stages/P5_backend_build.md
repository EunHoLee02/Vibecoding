# P5 백엔드 구현 지시문

## 1. 이번 단계에서 구현할 백엔드 기능 범위
- 서버 상태 확인 endpoint
- 샘플 입력 목록 조회 endpoint
- 업로드/샘플 parse endpoint
- 분석 실행 endpoint
- rule-based 분석 로직

## 2. 백엔드 파일 구조
- `backend/app/main.py`
- `backend/app/catalog.py`
- `backend/app/schemas.py`
- `backend/app/services.py`
- `backend/requirements.txt`

## 3. 파일별 역할 설명
- `main.py`: FastAPI app, endpoint, 공통 응답, 예외 처리
- `catalog.py`: 샘플 입력 데이터, 성분 alias, 기준표, 복용 시간 가이드
- `schemas.py`: 요청/응답 데이터 모델
- `services.py`: 업로드/mock 파싱, 분석 로직

## 4. 구현 순서
1. `schemas.py`에 데이터 계약을 먼저 고정한다.
2. `catalog.py`에 샘플 입력과 rule 기준 데이터를 정의한다.
3. `services.py`에 parse와 analysis 로직을 구현한다.
4. `main.py`에서 endpoint를 연결한다.
5. 공통 에러 응답 구조를 붙인다.

## 5. 핵심 endpoint별 구현 지시
- `GET /health`
  - 단순 상태 응답만 반환한다.
- `GET /api/v1/sample-inputs`
  - 샘플 카드 렌더링에 필요한 전체 샘플 목록을 반환한다.
- `POST /api/v1/uploads/parse`
  - `sample_id` 또는 `file` 중 하나를 입력받는다.
  - 실제 OCR 없이 샘플 ID 또는 파일명 규칙으로 파싱 결과를 반환한다.
- `POST /api/v1/analyses`
  - 최소 1개 이상 영양제 입력 검증
  - 중복 성분 계산
  - 과다 가능성 계산
  - 복용 시간 가이드 계산
  - 결과 응답 즉시 반환

## 6. 분석 로직 구현 지시
- 같은 의미의 성분명은 alias 정규화로 묶는다.
- 같은 성분이 여러 제품에 있으면 `duplicated_ingredients`에 추가한다.
- 기준표의 caution/high 임계값으로 `risk_items`를 계산한다.
- 성분별 권장 시점은 고정 매핑으로 `timing_guides`를 생성한다.
- summary는 결과 배열 길이를 기반으로 결정적으로 생성한다.

## 7. 업로드/mock 처리 구현 지시
- 실제 OCR 호출 금지
- 샘플 ID가 오면 해당 샘플 payload를 반환
- 업로드 파일이 오면 파일명 키워드로 샘플 payload를 선택
- 파일명 규칙에 맞지 않으면 기본 샘플을 반환

## 8. 공통 응답/에러 처리 지시
- 성공 응답은 항상 `{ success: true, data, error: null }`
- 실패 응답은 항상 `{ success: false, data: null, error }`
- 입력 부족, 파싱 실패, 분석 실패 정도만 최소로 처리한다.

## 9. endpoint별 테스트 케이스 목록
- `GET /health`
  - 200 응답
  - `data.status == "ok"`
- `GET /api/v1/sample-inputs`
  - 샘플 배열 반환
  - 최소 1개 샘플 포함
- `POST /api/v1/uploads/parse`
  - `sample_id`로 요청 시 parsed 반환
  - 파일명 업로드 시 parsed 반환
  - 입력 없이 요청 시 실패 응답
- `POST /api/v1/analyses`
  - 직접 입력 1개 이상일 때 completed 반환
  - 중복 성분이 있으면 duplicated_ingredients 반환
  - 기준 초과 성분이 있으면 risk_items 반환
  - 빈 supplements 요청 시 실패 응답

## 10. 다음 단계에서 바로 사용할 백엔드 구현 고정 요약
- endpoint 4개만 구현한다.
- 분석 결과는 생성 직후 응답에 포함한다.
- OCR은 stub/mock, 분석은 rule-based, 저장은 영속 저장 없음으로 고정한다.

## 이번 단계 확정 사항
- 백엔드는 4개 endpoint와 4개 핵심 파일로 구현한다.
- 업로드 파싱과 분석 로직은 결정적으로 동작해야 한다.
- 응답 구조는 P3 계약을 그대로 유지한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 프론트는 `GET /api/v1/sample-inputs`, `POST /api/v1/uploads/parse`, `POST /api/v1/analyses`만 호출하면 된다.
- 결과 화면은 분석 응답을 그대로 사용하면 된다.
- 별도 결과 조회 흐름은 구현하지 않는다.

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- worker queue, 인증, ORM 영속 저장을 추가하면 현재 구현 지시와 충돌한다.

## 바로 다음 단계 진행 가능 항목
- P6 프론트엔드 구현 지시문 작성

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.backend.files:
      - backend/app/main.py
      - backend/app/catalog.py
      - backend/app/schemas.py
      - backend/app/services.py
      - backend/requirements.txt
    prototype.backend.endpoints:
      - GET /health
      - GET /api/v1/sample-inputs
      - POST /api/v1/uploads/parse
      - POST /api/v1/analyses
  supersedes:
    - broad_backend_scope -> compact_backend_scope
  deprecated:
    - worker_queue
    - auth_layer
    - result_lookup_route
  carry_forward_only:
    - prototype.backend.files
    - prototype.backend.endpoints
  do_not_carry_forward:
    - worker_queue
    - auth_layer
    - result_lookup_route

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
