# P7 단계 프로토타입 최종 점검 + 코드 생성 직전 handoff 문서

## 1. 최종 범위 점검 결과
- 정식 서비스가 아니라 핵심 기능 시연용 프로토타입
- 핵심 흐름: **input → analysis → result**
- 인증/관리자/결제/문의/운영 기능 없음
- 분석 방식: **rule-based 우선**
- OCR: **stub/mock 우선**
- 결과 저장: optional
- 사용자별 누적 기록 제외

## 2. 충돌 여부 점검 결과
- 명시적 충돌 없음
- P3 API 계약 ↔ P5 백엔드 범위 일치
- P3 결과 응답 구조 ↔ P6 결과 화면 렌더링 항목 일치
- rule-based 원칙 유지
- OCR stub/mock 우선 원칙 유지
- 다만 P2/P4 원문 미첨부로 화면명/CTA/기술 스택은 미검증

## 3. 누락 여부 점검 결과
### 이미 포함된 핵심 항목
- 직접 입력
- 성분 행 추가/삭제
- 샘플 선택
- 파일 업로드 기반 mock parse
- 분석 실행
- 결과 표시
- 다시 입력 / 초기화

## 4. 최종 화면/route 고정 목록
### 최종 화면 목록
1. `start_input_screen`
2. `upload_or_sample_screen`
3. `result_screen`

### 최종 프론트 route 고정 목록
1. `/`
2. `/input-source`
3. `/result`

## 5. 최종 API/endpoint 고정 목록
### 보조 endpoint
- `GET /health`

### 핵심 domain endpoint
- `GET /api/v1/sample-inputs`
- `POST /api/v1/uploads/parse`
- `POST /api/v1/analyses`

## 6. 최종 데이터 모델/상태값 고정 목록
### 데이터 모델
- `IngredientItem`
- `SupplementInput`
- `SampleInputOption`
- `UploadParseResult`
- `AnalysisRequest`
- `DuplicateIngredientItem`
- `RiskItem`
- `TimingGuide`
- `AnalysisResult`

### enum
- `source_type`: `manual`, `upload`, `sample`
- `parse_status`: `parsed`, `failed`
- `analysis_status`: `completed`, `failed`
- `risk_level`: `caution`, `high`
- `recommended_time`: `morning`, `afternoon`, `evening`, `with_meal`, `empty_stomach`, `anytime`
- 프론트 로컬 상태: `idle`, `validating`, `uploading`, `analyzing`, `success`, `error`

### 최종 결과 응답 구조
```json
{
  "success": true,
  "data": {
    "analysis_status": "completed",
    "supplements": [],
    "duplicated_ingredients": [],
    "risk_items": [],
    "timing_guides": [],
    "summary_text": "string"
  },
  "error": null
}
```

## 7. 백엔드 handoff 요약
- 구현 범위: `/health`, `/api/v1/sample-inputs`, `/api/v1/uploads/parse`, `/api/v1/analyses`
- 로그인/권한/관리자/결제/문의/운영 API 금지
- rule-based 분석만 구현
- 동일 입력 → 동일 출력
- OCR 실연동 금지, stub/mock 우선
- 결과 저장 전제 금지
- 별도 result 조회 endpoint 금지

## 8. 프론트엔드 handoff 요약
- 구현 범위: 시작/입력 화면, 업로드/샘플 화면, 로딩 상태, 결과 화면
- 로그인/관리자/결제/문의/운영/설정 화면 금지
- 결과는 API 응답 필드를 최소 가공으로 렌더링
- 전역 상태관리 최소화
- 복잡한 UI 추상화 금지

## 9. 시연 체크리스트
1. 시작 화면 진입
2. 직접 입력 또는 샘플/업로드 선택
3. 최소 1개 이상의 supplement 입력 상태 확보
4. 분석 실행 버튼 클릭
5. 로딩 상태 확인
6. 결과 화면 진입
7. `supplements`, `duplicated_ingredients`, `risk_items`, `timing_guides`, `summary_text` 확인
8. 다시 입력하기 또는 초기화
9. 처음 상태로 복귀 확인

## 10. 코드 생성 직전에 반드시 유지할 고정 규칙
1. 프로토타입 범위를 넘는 기능 추가 금지
2. 로그인/회원가입/관리자/결제/문의/운영 기능 추가 금지
3. P3 필드명/enum 변경 금지
4. P3/P5 endpoint 이름 변경 금지
5. `POST /api/v1/analyses` 응답에 결과 즉시 포함
6. 결과 조회 전용 별도 endpoint 추가 금지
7. OCR 실제 연동 금지, stub/mock 우선 유지
8. 분석은 rule-based + 결정적 동작 유지
9. 응답 구조는 항상 `{ success, data, error }`
10. 결과 화면은 `supplements`, `duplicated_ingredients`, `risk_items`, `timing_guides`, `summary_text` 를 최소 가공 렌더링

## 11. 바로 다음 단계에서 사용할 최종 통합 요약
이 프로토타입은 **로그인 없는 영양제 조합 분석 데모**다. 사용자는 시작 화면에서 직접 입력하거나, 샘플 선택/파일 업로드(mock parse)를 통해 영양제 목록을 만든 뒤, `POST /api/v1/analyses` 로 분석을 실행한다. 백엔드는 rule-based 로 **중복 성분**, **과다 가능성**, **복용 시간 가이드**, **요약 한 줄**을 생성하고, 프론트는 그 결과를 **최소 가공으로 바로 렌더링**한다.
