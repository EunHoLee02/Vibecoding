# P5 백엔드 구현 기준

## 구현할 파일 목록
- `backend/requirements.txt`
- `backend/app/main.py`
- `backend/app/catalog.py`
- `backend/app/schemas.py`
- `backend/app/services.py`
- `backend/app/storage.py`

## 각 파일 역할
- `main.py`: FastAPI 라우트와 공통 응답
- `catalog.py`: 샘플 payload와 영양 성분 기준값
- `schemas.py`: 요청/응답 모델
- `services.py`: stub 파싱과 rule-based 분석
- `storage.py`: SQLite 초기화와 결과 저장/조회

## endpoint 별 처리 흐름
- `GET /api/v1/health`: 헬스 체크
- `GET /api/v1/sample-payloads`: 샘플 목록 반환
- `POST /api/v1/uploads/parse-stub`: 샘플 키 또는 파일명으로 supplements 배열 반환
- `POST /api/v1/analyses`: 입력 검증 -> 분석 -> SQLite 저장 -> summary 반환
- `GET /api/v1/analyses/{analysis_id}`: SQLite 조회 -> 결과 반환

## 저장 방식
- SQLite 파일 하나 사용
- 결과만 저장
- 사용자 계정/세션 저장 없음

## 테스트용 seed 데이터
- `daily_core`
- `immune_focus`

## 이번 단계 확정 사항
- 백엔드 1차 구현은 6개 파일 안에서 끝낸다.
- 분석은 동기 처리로 바로 완료한다.
- 오류 응답은 `success: false` 구조만 사용한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 백엔드 최소 구현 단위는 `catalog/services/storage/main`
- `parse-stub`과 `analyses`가 핵심 API

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- auth, rate limit, worker 추가는 현재 백엔드 범위를 넘는다.

## 바로 다음 단계 진행 가능 항목
- P6 프론트엔드 구현 프롬프트

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.backend.files:
      - backend/app/catalog.py
      - backend/app/main.py
      - backend/app/schemas.py
      - backend/app/services.py
      - backend/app/storage.py
      - backend/requirements.txt
  supersedes:
    - complex_backend_modules -> compact_backend_modules
  deprecated:
    - worker_queue
    - auth_layer
  carry_forward_only:
    - prototype.backend.files
  do_not_carry_forward:
    - worker_queue
    - auth_layer

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
