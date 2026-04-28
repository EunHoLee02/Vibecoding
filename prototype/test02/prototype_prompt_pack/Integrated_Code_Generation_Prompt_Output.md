# 통합 코드 생성 프롬프트 산출물 (이번 턴 범위: 구조 설계)

## 1. 전체 프로젝트 폴더 구조 제안
```txt
well-track-prototype/
  README.md
  backend/
    app/
      main
      routes/
        health
        sample_inputs
        uploads
        analyses
      schemas/
        common
        supplement
        analysis
      services/
        sample_service
        upload_stub_service
        analysis_service
      rules/
        duplicate_rules
        risk_rules
        timing_rules
      data/
        sample_inputs
        risk_reference
        timing_reference
      utils/
        response_builder
        validators
        normalizers
        error_codes
    tests/
      test_health
      test_sample_inputs
      test_uploads_parse
      test_analyses
      test_analysis_service
    requirements_or_package_file
    env_example
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
    tests/
      start_input_page
      upload_sample_page
      result_page
      supplement_form
      sample_selector
      upload_panel
    env_example
    package_file
  docs/
    API_CONTRACT.md
    HANDOFF_SUMMARY.md
```

## 2. 백엔드 파일 구조
- `backend/app/main`
- `backend/app/routes/health`
- `backend/app/routes/sample_inputs`
- `backend/app/routes/uploads`
- `backend/app/routes/analyses`
- `backend/app/schemas/common`
- `backend/app/schemas/supplement`
- `backend/app/schemas/analysis`
- `backend/app/services/sample_service`
- `backend/app/services/upload_stub_service`
- `backend/app/services/analysis_service`
- `backend/app/rules/duplicate_rules`
- `backend/app/rules/risk_rules`
- `backend/app/rules/timing_rules`
- `backend/app/data/sample_inputs`
- `backend/app/data/risk_reference`
- `backend/app/data/timing_reference`
- `backend/app/utils/response_builder`
- `backend/app/utils/validators`
- `backend/app/utils/normalizers`
- `backend/app/utils/error_codes`

## 3. 프론트엔드 파일 구조
- `frontend/src_or_app/main_app`
- `frontend/src_or_app/pages/start_input_page`
- `frontend/src_or_app/pages/upload_sample_page`
- `frontend/src_or_app/pages/result_page`
- `frontend/src_or_app/components/supplement_form`
- `frontend/src_or_app/components/supplement_card`
- `frontend/src_or_app/components/ingredient_row`
- `frontend/src_or_app/components/sample_selector`
- `frontend/src_or_app/components/upload_panel`
- `frontend/src_or_app/components/analysis_action_bar`
- `frontend/src_or_app/components/loading_state`
- `frontend/src_or_app/components/error_state`
- `frontend/src_or_app/components/result_summary`
- `frontend/src_or_app/components/duplicated_ingredients_section`
- `frontend/src_or_app/components/risk_items_section`
- `frontend/src_or_app/components/timing_guides_section`
- `frontend/src_or_app/components/supplement_list_section`
- `frontend/src_or_app/components/reset_action_bar`
- `frontend/src_or_app/services/api_client`
- `frontend/src_or_app/services/sample_api`
- `frontend/src_or_app/services/upload_api`
- `frontend/src_or_app/services/analysis_api`
- `frontend/src_or_app/hooks/use_manual_input`
- `frontend/src_or_app/hooks/use_sample_inputs`
- `frontend/src_or_app/hooks/use_upload_parse`
- `frontend/src_or_app/hooks/use_analysis`
- `frontend/src_or_app/utils/validators`
- `frontend/src_or_app/utils/request_builders`
- `frontend/src_or_app/utils/response_guards`
- `frontend/src_or_app/utils/initial_state`
- `frontend/src_or_app/utils/formatters`
- `frontend/src_or_app/types/common`
- `frontend/src_or_app/types/supplement`
- `frontend/src_or_app/types/analysis`

## 4. 실행에 필요한 최소 환경설정 파일 목록
- 루트: `README.md`
- 백엔드: `requirements.txt` 또는 `package.json`, `.env.example`, `.gitignore`
- 프론트엔드: `package.json`, `.env.example`, `.gitignore`
- 문서: `docs/API_CONTRACT.md`, `docs/HANDOFF_SUMMARY.md`

## 5. 백엔드 구현 1차에 만들 파일 목록
- `backend/app/main`
- `backend/app/routes/health`
- `backend/app/schemas/common`
- `backend/app/utils/response_builder`
- `backend/app/utils/error_codes`
- `backend/requirements.txt` 또는 `backend/package.json`
- `backend/.env.example`
- `backend/.gitignore`

## 6. 프론트엔드 구현 1차에 만들 파일 목록
- `frontend/src_or_app/main_app`
- `frontend/src_or_app/pages/start_input_page`
- `frontend/src_or_app/pages/upload_sample_page`
- `frontend/src_or_app/pages/result_page`
- `frontend/src_or_app/utils/initial_state`
- `frontend/src_or_app/types/common`
- `frontend/src_or_app/types/supplement`
- `frontend/src_or_app/types/analysis`
- `frontend/package.json`
- `frontend/.env.example`
- `frontend/.gitignore`

## 비고
- 이 턴에는 실제 코드 생성 전 구조 설계만 수행
- P4 최종 기술 스택 원문 미첨부로 인해 범용 구조로 정리
