# P4 기술 스택과 구현 구조

## 1. 최종 기술 스택 조합
- 프론트엔드: Next.js App Router + TypeScript
- 백엔드: FastAPI
- 저장 방식: JSON mock data 기반 참조 데이터 사용, 분석 결과 영속 저장 없음

## 2. 프론트엔드 기술 선택 이유
- 3개 route 기반 프로토타입을 빠르게 구성하기 쉽다.
- 입력 화면, 업로드/샘플 화면, 결과 화면을 단순하게 나누기 좋다.

## 3. 백엔드 기술 선택 이유
- 적은 파일 수로 endpoint와 rule-based 분석을 빠르게 구현할 수 있다.
- multipart 업로드와 JSON 응답 구성이 간단하다.

## 4. 저장 방식 최종 선택
- JSON mock data
- 이유: 샘플 입력 데이터와 기준표를 로컬 파일/코드 안에서 안정적으로 고정할 수 있고, 분석 결과 영속 저장이 필수가 아니기 때문이다.

## 5. 업로드/mock/OCR 처리 방식 최종 선택
- 실제 OCR 연동 없이 업로드 파일명 또는 샘플 ID를 기반으로 stub/mock 파싱 결과를 반환한다.

## 6. 프로젝트 폴더 구조
- `backend/`
  - `app/main.py`
  - `app/catalog.py`
  - `app/schemas.py`
  - `app/services.py`
  - `requirements.txt`
- `frontend/`
  - `app/`
  - `components/`
  - `lib/`
  - `package.json`
- `docs/stages/`

## 7. 프론트엔드 구현 범위 요약
- 시작/입력 화면
- 업로드/샘플 화면
- 결과 화면
- 로딩/오류/빈 상태

## 8. 백엔드 구현 범위 요약
- `GET /health`
- `GET /api/v1/sample-inputs`
- `POST /api/v1/uploads/parse`
- `POST /api/v1/analyses`
- 샘플 데이터, 기준표, rule-based 분석

## 9. P5 / P6에서 바로 사용할 구현 순서
1. 백엔드 스키마와 샘플 데이터 정의
2. 업로드/mock 파싱 구현
3. 분석 로직 구현
4. FastAPI endpoint 연결
5. 프론트 라우트와 기본 레이아웃 구현
6. 직접 입력 화면 구현
7. 업로드/샘플 화면 구현
8. 결과 화면 구현

## 10. 다음 단계에서 바로 사용할 기술/구조 고정 요약
- 스택은 `Next.js App Router + FastAPI`로 고정한다.
- 저장은 샘플/기준표용 JSON mock data 성격으로만 사용하고, 분석 결과 영속 저장은 하지 않는다.
- 업로드는 실제 OCR 대신 stub/mock 파싱으로 처리한다.

## 이번 단계 확정 사항
- 기술 스택은 하나의 조합으로만 고정한다.
- 결과 영속 저장을 구현하지 않는다.
- 프론트/백엔드를 분리하되 파일 수는 최소화한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 백엔드는 `catalog`, `schemas`, `services`, `main` 중심의 단순 구조로 간다.
- 프론트는 3개 route와 소수의 핵심 컴포넌트만 구현한다.
- 로컬 실행이 가능한 환경변수 최소 구성을 유지한다.

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- SQLite나 ORM 기반 영속 저장을 추가하면 현재 저장 방식 고정안과 충돌한다.

## 바로 다음 단계 진행 가능 항목
- P5 백엔드 구현 지시문 작성

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.frontend.stack: Next.js App Router
    prototype.backend.stack: FastAPI
    prototype.storage.mode: json_mock_data
    prototype.ocr.execution_mode: stub_or_mock_parse
    prototype.project.structure: split_frontend_backend
  supersedes:
    - multiple_stack_candidates -> single_stack_choice
  deprecated:
    - sqlite_result_persistence
    - external_paid_api_dependency
  carry_forward_only:
    - prototype.frontend.stack
    - prototype.backend.stack
    - prototype.storage.mode
    - prototype.ocr.execution_mode
    - prototype.project.structure
  do_not_carry_forward:
    - sqlite_result_persistence
    - external_paid_api_dependency

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
