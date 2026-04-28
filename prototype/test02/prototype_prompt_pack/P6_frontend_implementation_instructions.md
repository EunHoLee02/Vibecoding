# P6 단계 프로토타입 프론트엔드 구현 지시문

## 1. 이번 단계에서 구현할 프론트엔드 기능 범위
### 포함 범위
- 시작/입력 화면
- 업로드 또는 샘플 선택 화면
- 분석 진행 상태
- 결과 화면
- 다시 입력하기 / 초기화

### 제외 범위
- 로그인 / 회원가입
- 관리자
- 결제
- 문의 / 운영
- 사용자 설정
- 사용자 이력 / 저장

### 사용자 동작 필수 포함
- 영양제 직접 입력
- 성분 행 추가/삭제
- 샘플 업로드 또는 샘플 선택
- 분석 실행 버튼 클릭
- 결과 확인
- 다시 입력하기 또는 초기화

## 2. 프론트엔드 파일 구조
```txt
frontend/
  src_or_app/
    main_app
    pages/
      start_input_page
      upload_sample_page
      result_page
    components/
      supplement_form
      supplement_card
      ingredient_row
      sample_selector
      upload_panel
      analysis_action_bar
      loading_state
      error_state
      result_summary
      duplicated_ingredients_section
      risk_items_section
      timing_guides_section
      supplement_list_section
      reset_action_bar
    services/
      api_client
      sample_api
      upload_api
      analysis_api
    hooks/
      use_manual_input
      use_sample_inputs
      use_upload_parse
      use_analysis
    utils/
      validators
      request_builders
      response_guards
      initial_state
      formatters
    types/
      common
      supplement
      analysis
```

## 3. 구현 순서
1. 기본 앱 뼈대 + 화면 전환 상태
2. 직접 입력 폼
3. 샘플 선택 / 업로드 UI
4. 분석 실행 및 결과 화면
5. 에러/초기화/시연 안정화

## 4. 페이지별 구현 지시
### 시작/입력 화면
- 초기 진입 화면
- 최소 1개의 supplement 블록 기본 제공
- `product_name`, `manufacturer`, `ingredients` 입력
- supplement / ingredient 추가/삭제
- 분석 실행 CTA
- 업로드/샘플 화면 이동 CTA
- 입력 검증 오류 즉시 표시

### 업로드 또는 샘플 선택 화면
- 샘플 목록 조회
- 샘플 선택 시 `supplements` 반영
- 파일 업로드 시 `POST /api/v1/uploads/parse`
- 업로드 성공 시 parse 결과를 현재 입력 상태에 반영
- 업로드 처리 중 로딩
- 파싱 실패 시 에러 상태

### 결과 화면
아래 순서로 표시:
1. `summary_text`
2. `supplements`
3. `duplicated_ingredients`
4. `risk_items`
5. `timing_guides`
6. 다시 입력하기 / 초기화

## 5. 입력/검증/상태 처리 지시
- 최소 검증: supplements 1개 이상, product_name, ingredients 1개 이상, ingredient_name/amount/unit 존재
- 프론트 로컬 상태:
  - `idle`
  - `validating`
  - `uploading`
  - `analyzing`
  - `success`
  - `error`

## 6. API 연동 지시
- `GET /health` (선택적)
- `GET /api/v1/sample-inputs`
- `POST /api/v1/uploads/parse`
- `POST /api/v1/analyses`
- request/response shape 변경 금지
- 결과 필드는 최소 가공으로 렌더링

## 7. 화면별 테스트 포인트 목록
- 시작/입력 화면: 추가/삭제, 검증 오류, 분석 실행 가능
- 업로드/샘플 선택: 샘플 로드, 업로드 상태, 성공/실패
- 결과 화면: `summary_text`, `supplements`, `duplicated_ingredients`, `risk_items`, `timing_guides`, 초기화/다시 입력
