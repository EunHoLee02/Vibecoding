# Well Track Prototype `test06`

`test06`은 `prototype_prompt_pack`과 `welltrack_prototype_prompt_pack`의 단계(P0~P7)를 따라 새로 만든 독립 프로토타입입니다.

핵심 흐름은 아래 3단계만 구현합니다.

1. 영양제 직접 입력 또는 샘플 업로드 흐름 진입
2. 입력 조합 분석 실행
3. 중복 성분, 과다 가능성, 복용 시간 가이드 결과 확인

제외 범위:

- 로그인 / 회원가입
- 관리자
- 결제 / 구독
- 문의 / 운영
- 실제 OCR 연동

## 폴더 구성

- [docs](./docs): 프롬프트 팩 단계별 산출물
- [backend](./backend): Express 기반 API 서버
- [frontend](./frontend): React + Vite 기반 데모 UI
- [FINAL_SPEC.md](./FINAL_SPEC.md): 최종 고정 규칙과 계약 요약

## 실행 방법

백엔드:

```powershell
cd c:\Users\eunho\Desktop\VibeCoding\WellTrack\prototype\test06\backend
npm install
npm run dev
```

프론트엔드:

```powershell
cd c:\Users\eunho\Desktop\VibeCoding\WellTrack\prototype\test06\frontend
npm install
npm run dev
```

기본 포트:

- backend: `3001`
- frontend: `3002`

## 구현 근거

- 출처 1: `WellTrack/prototype/prototype_prompt_pack/00_prototype_master_prompt_v1.txt`
- 출처 2: `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/00_README.txt`
- 출처 3: `WellTrack/prototype/prototype_prompt_pack/welltrack_prototype_prompt_pack/01_P0_input_prompt.txt` ~ `09_final_code_generation_prompt.txt`

추가 설명이 필요한 선택은 각 단계 문서와 [FINAL_SPEC.md](./FINAL_SPEC.md)에 적었습니다.
