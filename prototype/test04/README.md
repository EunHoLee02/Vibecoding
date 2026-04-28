# Well Track Prototype `test04`

이 폴더는 `prototype_prompt_pack/welltrack_prototype_prompt_pack`만 기준으로 만든 프로토타입입니다.

## 근거 문서

- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/01_P0_input_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/02_P1_scenario_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/03_P2_screen_flow_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/04_P3_data_api_contract_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/05_P4_tech_stack_structure_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/06_P5_backend_build_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/07_P6_frontend_build_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/08_P7_final_handoff_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/09_final_code_generation_prompt.txt`

## 구현 범위

- 직접 입력 -> 분석 실행 -> 결과 확인 흐름
- 샘플 선택 또는 mock 업로드 흐름
- 결과 항목:
  - `supplements`
  - `duplicated_ingredients`
  - `risk_items`
  - `timing_guides`
  - `summary_text`

## 제외 범위

- 로그인 / 회원가입
- 관리자
- 결제 / 구독
- 문의 / 운영
- 실제 OCR
- 외부 유료 API

## 실행 방법

```powershell
Set-Location "c:\Users\eunho\Desktop\VibeCoding\WellTrack\prototype\test04"
npm start
```

브라우저에서 `http://localhost:3104`로 접속하면 됩니다.

## 구현 메모

- 백엔드는 Node.js 내장 `http` 서버를 사용합니다.
- 프론트엔드는 정적 HTML/CSS/JS로 구성했습니다.
- 위험 기준값과 시간 가이드는 프롬프트 팩의 허용 범위인 "샘플 기준값 / rule-based"를 따른 시연용 규칙입니다.
- 실제 의료 판단 근거가 아니라 프로토타입 시연용 규칙이므로 UI와 응답 문구도 일반 가이드 수준으로 제한했습니다.
