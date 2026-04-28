# P4 기술 스택/구현 구조

## 최종 기술 스택 조합
- 프론트엔드: Next.js App Router + TypeScript
- 백엔드: FastAPI
- 저장 방식: sqlite3 표준 라이브러리 기반 SQLite

## 프론트엔드 기술 선택 이유
- 라우팅과 결과 페이지 구성이 단순하다.
- 기존 WellTrack 프론트와 같은 계열이라 시연 흐름을 옮기기 쉽다.

## 백엔드 기술 선택 이유
- 간단한 API와 rule-based 분석을 빠르게 구현하기 좋다.
- Python 표준 라이브러리와 함께 쓰기 쉽다.

## 저장 방식 최종 선택
- SQLite
- 이유: 여러 AI가 구현해도 가장 흔들림이 적고 로컬 실행이 단순하다.

## 업로드/mock/OCR 처리 방식 최종 선택
- 실제 OCR 없음
- `parse-stub` API에서 샘플 키 또는 파일명 기반 stub payload를 반환

## 프로젝트 폴더 구조
- `backend/`
  - `app/main.py`
  - `app/catalog.py`
  - `app/schemas.py`
  - `app/services.py`
  - `app/storage.py`
  - `requirements.txt`
- `frontend/`
  - `app/`
  - `components/`
  - `lib/`
  - `package.json`

## 프론트엔드 구현 범위 요약
- 홈 랜딩
- 직접 입력 화면
- 샘플 업로드 stub 화면
- 결과 확인 화면

## 백엔드 구현 범위 요약
- health API
- sample payloads API
- upload parse stub API
- analyses create/get API
- sqlite 결과 저장

## P5 / P6에서 바로 사용할 구현 순서
1. 백엔드 최소 실행 구조
2. 샘플/분석 서비스
3. 분석 저장/조회
4. 프론트 최소 라우팅
5. 직접 입력 화면
6. 샘플 화면
7. 결과 화면

## 다음 단계에서 바로 사용할 기술/구조 고정 요약
- 스택은 `Next.js + FastAPI + SQLite`로 고정
- OCR은 stub/mock
- 외부 AI 필수 의존 없음
- 라우트와 endpoint는 P2/P3 확정본 유지

## 이번 단계 확정 사항
- 최종 기술안은 하나로만 확정한다.
- Redis, 메시지 큐, 인증 저장소, 유료 API는 제외한다.
- 파일 수는 최소화하고 `catalog/services/storage/schemas` 정도의 단순한 백엔드 구조를 쓴다.

## 다음 단계 입력으로 넘길 핵심 요약
- 백엔드는 작은 모듈 수로 유지
- 프론트는 App Router 기반 4개 route
- SQLite는 분석 결과 단건 저장/조회에만 사용

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- React + mock only 구조로 축소하면 백엔드 필수 조건과 충돌한다.

## 바로 다음 단계 진행 가능 항목
- P5 백엔드 구현 프롬프트

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.backend.stack: FastAPI
    prototype.frontend.stack: Next.js App Router
    prototype.ocr.execution_mode: parse_stub_only
    prototype.project.structure: split_frontend_backend
    prototype.storage.mode: sqlite
  supersedes:
    - in_memory_candidate -> sqlite
    - mock_only_candidate -> FastAPI+Next.js
  deprecated:
    - react_only_alternative
  carry_forward_only:
    - prototype.backend.stack
    - prototype.frontend.stack
    - prototype.ocr.execution_mode
    - prototype.project.structure
    - prototype.storage.mode
  do_not_carry_forward:
    - react_only_alternative

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
