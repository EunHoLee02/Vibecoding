# P5 Backend Build Plan

## 구현 범위

- `GET /api/health`
- `POST /api/input-bundles`
- `POST /api/upload-bundles`
- `POST /api/analyses`
- `GET /api/analyses/:analysis_id`

## 파일 구조

- `src/app.js`
- `src/server.js`
- `src/routes/prototypeRoutes.js`
- `src/services/prototypeStore.js`
- `src/services/analysisService.js`
- `src/data/sampleBundles.js`
- `src/data/ingredientRules.js`
- `src/utils/validation.js`

## 핵심 지시

- 모든 응답은 공통 success/data/error 구조 유지
- 직접 입력과 업로드를 `InputBundle`로 통일
- 분석은 결정적 rule-based 계산만 사용
- 업로드는 실제 OCR 대신 sample parse 결과 반환

## 테스트 포인트

- health 응답
- manual bundle 저장
- upload bundle 저장
- analysis 생성
- analysis 조회
- 필수 입력 누락 에러

## authoritative_updates YAML

```yaml
authoritative_updates:
  frozen_values:
    backend_files:
      - src/app.js
      - src/server.js
      - src/routes/prototypeRoutes.js
      - src/services/prototypeStore.js
      - src/services/analysisService.js
      - src/data/sampleBundles.js
      - src/data/ingredientRules.js
      - src/utils/validation.js
  supersedes:
    - broad_backend_scope -> fixed_demo_backend
  deprecated:
    - user_session_handling
  carry_forward_only:
    - backend_files
  do_not_carry_forward:
    - auth_and_admin_code

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
