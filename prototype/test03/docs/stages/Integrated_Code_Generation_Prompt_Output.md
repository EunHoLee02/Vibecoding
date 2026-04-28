# 통합 코드 생성 산출물 요약

## 전체 프로젝트 구조
```txt
test03/
  README.md
  docs/stages/
  backend/
    app/
      __init__.py
      main.py
      catalog.py
      schemas.py
      services.py
    requirements.txt
    .env.example
  frontend/
    app/
      layout.tsx
      globals.css
      page.tsx
      input-source/page.tsx
      result/page.tsx
    components/
      manual-input-form.tsx
      sample-input-panel.tsx
      result-view.tsx
    lib/
      api.ts
      types.ts
      result-storage.ts
    package.json
    tsconfig.json
    next.config.ts
    next-env.d.ts
    .env.example
```

## 구현 고정 요약
- route: `/`, `/input-source`, `/result`
- endpoint: `GET /health`, `GET /api/v1/sample-inputs`, `POST /api/v1/uploads/parse`, `POST /api/v1/analyses`
- 결과 전달: 분석 응답 즉시 반환 + 프론트 `sessionStorage`
- 분석 방식: rule-based
- 업로드 방식: stub/mock parse
