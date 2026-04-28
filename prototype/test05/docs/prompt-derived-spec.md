# Prompt-Derived Spec

## 목적

이 문서는 `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack` 안의 단계별 프롬프트를 읽고, `test05` 구현에 고정한 결정사항을 요약합니다.

## 고정 범위

- 서비스 형태: 정식 서비스가 아닌 프로토타입
- 인증: 없음
- 관리자/결제/문의/운영: 없음
- 핵심 흐름: `입력 -> 분석 실행 -> 결과 확인`
- 백엔드: 필수
- 분석: rule-based 우선
- 업로드 처리: OCR 실제 연동 대신 stub/mock 허용
- 결과 저장: 필수 아님

근거:
- `01_P0_input_prompt.txt`
- `02_P1_scenario_prompt.txt`

## 고정 화면과 route

- `#/input`: 시작 및 직접 입력 화면
- `#/upload`: 업로드 또는 샘플 선택 화면
- `#/result`: 분석 결과 화면

근거:
- `03_P2_screen_flow_prompt.txt`

## 고정 API

- `GET /api/health`
- `GET /api/samples`
- `POST /api/uploads/mock`
- `POST /api/analysis`

근거:
- `04_P3_data_api_contract_prompt.txt`
- `06_P5_backend_build_prompt.txt`

## 고정 데이터 모델

- `supplement`
  - `id`
  - `product_name`
  - `manufacturer`
  - `ingredients`
- `ingredient`
  - `name`
  - `amount`
  - `unit`
- `analysis_result`
  - `supplements`
  - `duplicated_ingredients`
  - `risk_items`
  - `timing_guides`
  - `summary_text`

근거:
- `04_P3_data_api_contract_prompt.txt`

## 구현 선택

- 저장 방식: JSON mock data
- 백엔드: Node.js 내장 HTTP 서버
- 프론트엔드: 정적 HTML/CSS/JavaScript
- 실행 방식: `npm start` 한 번으로 백엔드와 프론트엔드 동시 제공

선정 이유:
- `05_P4_tech_stack_structure_prompt.txt`가 요구한 빠른 로컬 실행, 낮은 복잡도, mock/stub 우선 원칙을 가장 단순하게 만족하기 때문입니다.

## 표현 제한

- 의료 진단, 처방처럼 보이는 문구 금지
- 질환 개선 보장 표현 금지
- 일반적인 복용 가이드 수준만 표시

근거:
- `01_P0_input_prompt.txt`
- `07_P6_frontend_build_prompt.txt`
- `08_P7_final_handoff_prompt.txt`
