# P5 단계 프로토타입 백엔드 구현 지시문

## 1. 이번 단계에서 구현할 백엔드 기능 범위
### 포함 범위
- `GET /health`
- `GET /api/v1/sample-inputs`
- `POST /api/v1/uploads/parse`
- `POST /api/v1/analyses`
- rule-based 분석 서비스
- 공통 응답 포맷
- 최소 seed/mock 데이터

### 제외 범위
- 로그인 / 회원가입
- 사용자 세션 / 권한 / 토큰
- 관리자 기능
- 결제
- 문의 / 운영 API
- 외부 유료 API 의존
- 비동기 큐 / 작업 스케줄러
- 사용자별 기록 저장

### 직접 입력 처리 방식 고정
- 직접 입력 전용 별도 API는 만들지 않음
- `POST /api/v1/analyses` 에서 `source_type = "manual"` 로 처리

### 결과 반환 방식 고정
- 분석 결과 조회용 별도 endpoint 추가 없음
- `POST /api/v1/analyses` 응답에 결과 즉시 포함

## 2. 백엔드 파일 구조
```txt
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
```

## 3. 구현 순서
1. 서버 뼈대 + 공통 응답
2. 데이터 스키마 + 입력 검증
3. 샘플 조회 API
4. 업로드/mock 파싱 API
5. 분석 로직 + 분석 API
6. 테스트 및 시연 안정화

## 4. 분석 로직 구현 지시
- 동일 입력이면 항상 동일 출력
- 외부 API 호출 금지
- 랜덤값 사용 금지
- 중복 성분 계산: `ingredient_name` 정규화 + 같은 unit 기준 그룹화
- 과다 가능성 계산: 기준표와 비교해 `caution | high`
- 복용 시간 가이드 계산: 단순 매핑
- `summary_text` 생성: 고정 템플릿

## 5. 업로드/mock 처리 구현 지시
- 실제 OCR 구현 금지
- 실제 파일 업로드는 받되 내부에서는 샘플 파싱 결과 반환
- 반환 구조는 항상 `UploadParseResult`
- 파일 영구 저장 금지

## 6. 공통 응답/에러 처리 지시
- 성공: `{ success: true, data, error: null }`
- 실패: `{ success: false, data: null, error: { code, message } }`
- 에러 코드: `INVALID_REQUEST`, `SAMPLE_NOT_FOUND`, `PARSE_FAILED`, `ANALYSIS_FAILED`, `INTERNAL_ERROR`

## 7. endpoint별 테스트 케이스 목록
- `/health`: 200, `status=ok`
- `/api/v1/sample-inputs`: sample 배열 존재
- `/api/v1/uploads/parse`: multipart 업로드, parse_status 확인, 동일 파일명 동일 결과
- `/api/v1/analyses`: 요청 검증, 응답 필드 존재, 동일 입력 동일 결과
