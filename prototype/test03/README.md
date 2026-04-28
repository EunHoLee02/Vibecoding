# Well Track Prototype - test03

`prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack`를 기준으로
P0~P7 단계를 정리하고, 그 확정본에 맞춰 구현한 프로토타입입니다.

핵심 흐름:
1. 시작/입력 화면에서 영양제 정보를 직접 입력
2. 또는 업로드/샘플 화면에서 샘플 선택 또는 파일 업로드 흐름 체험
3. 분석 실행
4. 결과 화면에서 중복 성분, 과다 가능성, 복용 시간 가이드 확인

고정 범위:
- 로그인/회원가입 없음
- 관리자/결제/문의/운영 기능 없음
- rule-based 분석 우선
- OCR은 stub/mock 우선
- 결과는 `POST /api/v1/analyses` 응답으로 즉시 반환

문서:
- `docs/stages/P0_input.md`
- `docs/stages/P1_scenario.md`
- `docs/stages/P2_screen_flow.md`
- `docs/stages/P3_data_api_contract.md`
- `docs/stages/P4_tech_stack_structure.md`
- `docs/stages/P5_backend_build.md`
- `docs/stages/P6_frontend_build.md`
- `docs/stages/P7_final_handoff.md`
- `docs/stages/Integrated_Code_Generation_Prompt_Output.md`

구조:
- `backend`: FastAPI API
- `frontend`: Next.js App Router UI

실행 순서:
1. 백엔드
   - `cd prototype/test03/backend`
   - `python -m venv .venv`
   - `.venv\\Scripts\\activate`
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --reload`
2. 프론트엔드
   - `cd prototype/test03/frontend`
   - `npm install`
   - `npm run dev`

PowerShell 실행 예시:
- `>>`는 명령이 아니라 PowerShell 프롬프트 표시이므로 입력하지 않습니다.
- 기본 포트로 실행:
  - `cd C:\Users\eunho\Desktop\VibeCoding\WellTrack\prototype\test03\frontend`
  - `npm run dev`
- 다른 포트로 실행:
  - `cd C:\Users\eunho\Desktop\VibeCoding\WellTrack\prototype\test03\frontend`
  - `$env:PORT=3108`
  - `npm run dev`
- `npm start`는 `next build` 이후 프로덕션 서버 실행용입니다. 개발 중에는 `npm run dev`를 사용합니다.

환경 변수:
- 프론트엔드: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`
