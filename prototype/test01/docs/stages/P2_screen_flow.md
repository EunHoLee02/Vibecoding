# P2 화면/흐름 설계

## 화면 목록

### SCR-001 홈
- 목적: 프로토타입 소개와 두 진입 흐름 선택
- 진입 조건: `/`
- 주요 UI 요소:
  - 핵심 가치 설명
  - 직접 입력 시작 CTA
  - 샘플 업로드 CTA
- 주요 CTA:
  - `/manual`
  - `/sample`
- 상태:
  - 성공: 기본 랜딩 렌더링
  - 오류/빈 상태: 없음
- 다음 화면 이동 조건:
  - 직접 입력 선택 시 SCR-002
  - 샘플 업로드 선택 시 SCR-003

### SCR-002 직접 입력
- 목적: 영양제와 성분을 수동으로 입력하고 분석 실행
- 진입 조건: `/manual`
- 주요 UI 요소:
  - 영양제 카드 목록
  - 성분 행 추가/삭제
  - 분석 실행 버튼
- 주요 CTA:
  - 분석 실행
  - 샘플 흐름으로 이동
- 상태:
  - 성공: 분석 결과 생성 후 SCR-004로 이동
  - 오류: 입력 검증 오류 표시
  - 빈 상태: 초기 빈 폼

### SCR-003 샘플 업로드
- 목적: 샘플 카드 또는 파일명 stub로 파싱 결과를 불러와 분석 실행
- 진입 조건: `/sample`
- 주요 UI 요소:
  - 샘플 카드 목록
  - 파일명 입력 필드
  - 파싱 결과 미리보기
  - 분석 실행 버튼
- 주요 CTA:
  - 샘플 불러오기
  - 파일명으로 stub 파싱
  - 분석 실행
- 상태:
  - 성공: 파싱 결과 확인 후 SCR-004 이동
  - 오류: 샘플 없음 또는 파싱 실패 메시지
  - 빈 상태: 아직 샘플 미선택

### SCR-004 결과 확인
- 목적: 분석 결과 확인
- 진입 조건: `/result/[analysisId]`
- 주요 UI 요소:
  - 입력된 영양제 목록
  - 중복 성분 카드
  - 과다 가능성 카드
  - 복용 시간 가이드 카드
  - 한 줄 요약
- 주요 CTA:
  - 직접 입력 다시 시작
  - 샘플 업로드 다시 시작
- 상태:
  - 성공: 결과 렌더링
  - 오류: 결과 조회 실패 메시지
  - 빈 상태: 결과 없음

## 화면 이동 흐름
- `/` -> `/manual` -> `/result/[analysisId]`
- `/` -> `/sample` -> `/result/[analysisId]`

## 이번 단계 확정 사항
- 화면 수는 4개로 고정한다.
- route는 `/`, `/manual`, `/sample`, `/result/[analysisId]`로 고정한다.
- 홈 화면에서 두 개의 진입 흐름만 제공한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 화면 ID는 `SCR-001`~`SCR-004`로 고정
- 결과 화면은 단건 결과 조회만 담당
- 직접 입력과 샘플 업로드는 별도 route로 분리

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- 단일 페이지 탭 구조로 바꾸면 확정 route 체계가 흔들린다.

## 바로 다음 단계 진행 가능 항목
- P3 데이터 모델/API 계약

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.routes.home: /
    prototype.routes.manual: /manual
    prototype.routes.result: /result/[analysisId]
    prototype.routes.sample: /sample
    prototype.screen_ids:
      - SCR-001
      - SCR-002
      - SCR-003
      - SCR-004
  supersedes:
    - generic_route_plan -> fixed_four_routes
  deprecated:
    - single_page_tabs
  carry_forward_only:
    - prototype.routes.home
    - prototype.routes.manual
    - prototype.routes.result
    - prototype.routes.sample
    - prototype.screen_ids
  do_not_carry_forward:
    - single_page_tabs

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
