# Well Track Prototype - test01

`prototype_prompt_pack`와 `welltrack_prototype_prompt_pack`를 기준으로 만든
로그인 없는 Well Track 프로토타입입니다.

핵심 데모 흐름:
1. 직접 입력 또는 샘플 업로드 stub
2. 분석 실행
3. 결과 확인

고정 범위:
- 로그인/회원가입 없음
- 관리자/결제/문의 없음
- rule-based 분석 우선
- OCR은 stub/mock 우선
- SQLite 기반 결과 저장

문서:
- `docs/stages/P0_input.md`
- `docs/stages/P1_scenario.md`
- `docs/stages/P2_screen_flow.md`
- `docs/stages/P3_data_api_contract.md`
- `docs/stages/P4_tech_stack_structure.md`
- `docs/stages/P5_backend_build.md`
- `docs/stages/P6_frontend_build.md`
- `docs/stages/P7_final_handoff.md`

구조:
- `backend`: FastAPI API
- `frontend`: Next.js UI

실행 순서:
1. 백엔드
   - `cd prototype/test01/backend`
   - `python -m venv .venv`
   - `.venv\\Scripts\\activate`
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --reload`
2. 프론트엔드
   - `cd prototype/test01/frontend`
   - `npm install`
   - `npm run dev`

환경 변수:
- 프론트엔드: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`
