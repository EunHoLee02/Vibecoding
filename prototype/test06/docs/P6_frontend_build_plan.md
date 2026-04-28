# P6 Frontend Build Plan

## 구현 범위

- 시작 / 직접 입력 화면
- 업로드 / 샘플 선택 화면
- 결과 화면
- 입력 오류 / 로딩 / 실패 상태

## 파일 구조

- `src/main.jsx`
- `src/App.jsx`
- `src/api.js`
- `src/constants.js`
- `src/styles.css`
- `src/components/StatusMessage.jsx`
- `src/components/SupplementEditor.jsx`
- `src/pages/InputScreen.jsx`
- `src/pages/UploadScreen.jsx`
- `src/pages/ResultScreen.jsx`

## 핵심 지시

- P2의 route와 CTA 이름 유지
- P3의 response shape를 그대로 렌더링
- manual input과 upload flow 모두 결과 화면으로 연결
- 전역 상태관리 없이 페이지 단위 상태로 구현

## 테스트 포인트

- 입력 행 추가/삭제
- manual 분석 버튼
- upload stub 버튼
- 결과 화면 렌더링
- 실패 메시지 표시

## authoritative_updates YAML

```yaml
authoritative_updates:
  frozen_values:
    frontend_files:
      - src/main.jsx
      - src/App.jsx
      - src/api.js
      - src/constants.js
      - src/styles.css
      - src/components/StatusMessage.jsx
      - src/components/SupplementEditor.jsx
      - src/pages/InputScreen.jsx
      - src/pages/UploadScreen.jsx
      - src/pages/ResultScreen.jsx
  supersedes:
    - extra_frontend_layers -> page_level_state_only
  deprecated:
    - auth_routes
  carry_forward_only:
    - frontend_files
  do_not_carry_forward:
    - admin_and_payment_ui

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
