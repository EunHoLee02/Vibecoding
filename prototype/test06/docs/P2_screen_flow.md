# P2 Screen Flow

## 전체 화면 목록

- `input-screen` / route `/`
- `upload-screen` / route `/upload`
- `result-screen` / route `/result/:analysisId`

## 화면별 목적

### input-screen

- 영양제 직접 입력
- 성분 행 추가/삭제
- 직접 입력 분석 시작

### upload-screen

- 샘플 선택 또는 파일명 기반 업로드 stub
- 샘플 파싱 결과 미리보기
- 파싱된 조합 분석 시작

### result-screen

- 입력된 영양제 목록
- `duplicated_ingredients`
- `risk_items`
- `timing_guides`
- `summary_text`

## 이동 흐름

- `/` -> `/result/:analysisId`
- `/` -> `/upload`
- `/upload` -> `/result/:analysisId`
- `/result/:analysisId` -> `/`
- `/result/:analysisId` -> `/upload`

## 필수 CTA

- `직접 입력 분석하기`
- `샘플 업로드 체험하기`
- `샘플 불러오기`
- `이 조합 분석하기`
- `다시 입력하기`

## 상태

- 빈 입력 상태
- 입력 검증 오류 상태
- 업로드 처리 중 상태
- 분석 요청 중 상태
- 분석 실패 상태
- 결과 성공 상태

## authoritative_updates YAML

```yaml
authoritative_updates:
  frozen_values:
    routes:
      input: /
      upload: /upload
      result: /result/:analysisId
    screen_ids:
      - input-screen
      - upload-screen
      - result-screen
    cta_labels:
      - 직접 입력 분석하기
      - 샘플 업로드 체험하기
      - 샘플 불러오기
      - 이 조합 분석하기
      - 다시 입력하기
  supersedes:
    - extra_demo_screens -> three_screen_flow
  deprecated:
    - loading_route
  carry_forward_only:
    - routes
    - screen_ids
    - cta_labels
  do_not_carry_forward:
    - account_or_admin_routes

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
