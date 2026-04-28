# P6 프론트엔드 구현 지시문

## 1. 이번 단계에서 구현할 프론트엔드 기능 범위
- 시작/입력 화면
- 업로드/샘플 화면
- 결과 화면
- 로딩/오류/빈 상태

## 2. 프론트엔드 파일 구조
- `frontend/app/layout.tsx`
- `frontend/app/globals.css`
- `frontend/app/page.tsx`
- `frontend/app/input-source/page.tsx`
- `frontend/app/result/page.tsx`
- `frontend/components/manual-input-form.tsx`
- `frontend/components/sample-input-panel.tsx`
- `frontend/components/result-view.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/types.ts`
- `frontend/lib/result-storage.ts`

## 3. 파일별 역할 설명
- `layout.tsx`: 공통 레이아웃과 상단 이동 링크
- `page.tsx`: 직접 입력 메인 화면
- `input-source/page.tsx`: 샘플 선택/업로드 화면
- `result/page.tsx`: 결과 표시 화면
- `manual-input-form.tsx`: 직접 입력 폼과 분석 실행
- `sample-input-panel.tsx`: 샘플 로드, 업로드 파싱, 분석 실행
- `result-view.tsx`: 결과 섹션 렌더링
- `api.ts`: 백엔드 API 호출
- `types.ts`: 프론트 타입 정의
- `result-storage.ts`: 결과 화면 이동용 sessionStorage 처리

## 4. 구현 순서
1. 타입과 API 클라이언트 작성
2. 공통 레이아웃과 스타일 작성
3. 직접 입력 화면 작성
4. 샘플 업로드 화면 작성
5. 결과 화면 작성
6. sessionStorage 기반 결과 전달 연결

## 5. 페이지별 구현 지시
- `/`
  - 서비스 소개
  - 직접 입력 폼
  - `샘플 업로드 체험` 이동 버튼
- `/input-source`
  - 샘플 카드 목록
  - 파일 업로드 입력
  - 파싱 결과 미리보기
  - `이 조합으로 분석 실행` 버튼
- `/result`
  - 입력 영양제 목록
  - `duplicated_ingredients`
  - `risk_items`
  - `timing_guides`
  - `summary_text`
  - 다시 입력 버튼

## 6. 주요 컴포넌트 구현 지시
- `ManualInputForm`
  - 영양제 추가
  - 성분 행 추가/삭제
  - 입력 검증
  - 분석 API 호출
- `SampleInputPanel`
  - 샘플 목록 로딩
  - 파일 업로드 선택
  - parse API 호출
  - 분석 API 호출
- `ResultView`
  - 결과 없는 상태
  - 결과 성공 상태
  - 위험 수준에 따라 배지 스타일 구분

## 7. 입력/검증/상태 처리 지시
- 최소 1개 영양제 필요
- 각 영양제는 최소 1개 성분 필요
- 로딩 시 버튼 비활성화
- API 실패 시 인라인 오류 메시지 표시
- 결과 없음 상태에서는 다시 입력 경로 안내

## 8. API 연동 지시
- `GET /api/v1/sample-inputs`로 샘플 카드 로딩
- `POST /api/v1/uploads/parse`로 업로드/샘플 parse 수행
- `POST /api/v1/analyses`로 분석 수행
- 분석 성공 시 결과 전체를 sessionStorage에 저장하고 `/result`로 이동

## 9. 화면별 테스트 포인트 목록
- `/`
  - 영양제 추가 동작
  - 성분 추가/삭제 동작
  - 빈 입력 분석 시 오류 표시
  - 유효 입력 분석 시 결과 화면 이동
- `/input-source`
  - 샘플 목록 표시
  - 샘플 선택 parse 성공
  - 파일 업로드 parse 성공
  - parse 이후 분석 실행 가능
- `/result`
  - 결과 섹션 모두 렌더링
  - 결과 없을 때 빈 상태 메시지 표시
  - 다시 입력 버튼 동작

## 10. 다음 단계에서 바로 사용할 프론트엔드 구현 고정 요약
- route는 `/`, `/input-source`, `/result`만 사용한다.
- 분석 결과는 sessionStorage에 저장한 뒤 `/result`에서 읽는다.
- 결과 화면은 API 응답 필드를 최소 가공으로 렌더링한다.

## 이번 단계 확정 사항
- 프론트 파일 구조와 route 구조를 현재 형태로 고정한다.
- 전역 상태관리 라이브러리는 도입하지 않는다.
- 결과 전달은 sessionStorage 기반으로 처리한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 백엔드 API 3개와 결과 응답 구조만 맞추면 프론트가 동작한다.
- 결과 화면은 API 응답과 동일한 필드 이름을 사용한다.
- CTA 이름과 route 이름은 변경하지 않는다.

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- 결과를 URL 파라미터나 별도 조회 API로 옮기면 현재 프론트 흐름과 충돌한다.

## 바로 다음 단계 진행 가능 항목
- P7 최종 점검과 handoff 문서 작성

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.frontend.files:
      - frontend/app/layout.tsx
      - frontend/app/globals.css
      - frontend/app/page.tsx
      - frontend/app/input-source/page.tsx
      - frontend/app/result/page.tsx
      - frontend/components/manual-input-form.tsx
      - frontend/components/sample-input-panel.tsx
      - frontend/components/result-view.tsx
      - frontend/lib/api.ts
      - frontend/lib/types.ts
      - frontend/lib/result-storage.ts
    prototype.frontend.routes:
      - /
      - /input-source
      - /result
  supersedes:
    - large_component_tree -> compact_component_tree
  deprecated:
    - global_store
    - auth_middleware
  carry_forward_only:
    - prototype.frontend.files
    - prototype.frontend.routes
  do_not_carry_forward:
    - global_store
    - auth_middleware

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
