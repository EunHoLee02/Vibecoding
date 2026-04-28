# Well Track Prototype `test05`

이 폴더는 `prototype_prompt_pack/welltrack_prototype_prompt_pack`만 근거로 만든 프로토타입입니다.

## 범위

- 로그인, 회원가입, 관리자, 결제, 문의, 운영 기능 없음
- 핵심 흐름은 `입력 -> 분석 실행 -> 결과 확인`
- 분석은 rule-based
- 업로드/OCR은 실제 OCR 대신 stub/mock 우선
- 결과는 의료 진단이 아닌 일반 가이드 수준 표현만 사용

## 실행 방법

1. 터미널에서 `WellTrack/prototype/test05`로 이동
2. `npm start`
3. 브라우저에서 `http://localhost:3050`

포트 `3050`이 이미 사용 중이면 PowerShell에서 `$env:PORT='3051'; npm start`처럼 다른 포트로 실행할 수 있습니다.

## 폴더 구조

- `backend/`: API와 정적 파일 서빙
- `backend/data/`: 샘플 영양제 데이터와 기준값
- `backend/lib/`: 분석 로직과 데이터 로더
- `frontend/`: 입력, 업로드/샘플 선택, 결과 화면
- `docs/`: 프롬프트 팩에서 고정한 명세

## 근거 문서

- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/01_P0_input_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/02_P1_scenario_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/03_P2_screen_flow_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/04_P3_data_api_contract_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/05_P4_tech_stack_structure_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/06_P5_backend_build_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/07_P6_frontend_build_prompt.txt`
- `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/08_P7_final_handoff_prompt.txt`
