# P6 프론트엔드 구현 기준

## 페이지 목록
- `/`
- `/manual`
- `/sample`
- `/result/[analysisId]`

## 컴포넌트 구조
- `ManualAnalysisForm`
- `SampleStubPanel`
- `ResultSummaryCard`

## API 연동 방식
- `fetch` 기반 단순 호출
- `NEXT_PUBLIC_API_BASE_URL` 사용
- 실패 시 페이지 내 인라인 오류 메시지 표시

## mock fallback 처리
- 샘플 화면에서 샘플 payload 목록을 못 불러오면 하드코딩 메시지 표시
- 실제 OCR 대신 파일명 기반 stub 요청

## 로딩/오류/빈 상태
- 로딩: 버튼 disabled + 진행 메시지
- 오류: 붉은 배경 인라인 박스
- 빈 상태: 기본 안내 문구

## 시연용 더미 데이터 주입 방식
- 샘플 API로 고정 payload 불러오기

## 이번 단계 확정 사항
- 상태 관리는 컴포넌트 로컬 state로만 처리한다.
- 외부 상태 라이브러리는 추가하지 않는다.
- 디자인 시스템 확장은 하지 않는다.

## 다음 단계 입력으로 넘길 핵심 요약
- 라우트별 페이지 4개와 컴포넌트 3개 정도로 구성
- `api.ts`와 `types.ts`를 별도 파일로 둔다.

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- 전역 상태 저장소나 인증 미들웨어를 추가하면 프로토타입 범위를 넘는다.

## 바로 다음 단계 진행 가능 항목
- P7 최종 handoff

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.frontend.components:
      - ManualAnalysisForm
      - ResultSummaryCard
      - SampleStubPanel
    prototype.frontend.files:
      - frontend/app/globals.css
      - frontend/app/layout.tsx
      - frontend/app/manual/page.tsx
      - frontend/app/page.tsx
      - frontend/app/result/[analysisId]/page.tsx
      - frontend/app/sample/page.tsx
      - frontend/components/manual-analysis-form.tsx
      - frontend/components/result-summary-card.tsx
      - frontend/components/sample-stub-panel.tsx
      - frontend/lib/api.ts
      - frontend/lib/types.ts
  supersedes:
    - large_component_tree -> compact_component_tree
  deprecated:
    - auth_middleware
    - global_store
  carry_forward_only:
    - prototype.frontend.components
    - prototype.frontend.files
  do_not_carry_forward:
    - auth_middleware
    - global_store

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
