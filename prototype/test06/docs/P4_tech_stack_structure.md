# P4 Tech Stack and Structure

## 최종 기술 스택 조합

- frontend: React + Vite
- backend: Node.js + Express
- storage: in-memory
- upload / OCR: stubbed sample parsing

## 선택 이유

- React + Vite: 빠르게 화면을 만들고 로컬 실행이 단순함
- Express: API 수가 적고 rule-based 프로토타입에 충분함
- in-memory: DB 설정 없이 데모 안정성을 확보할 수 있음
- stub upload: 실제 OCR 의존 없이 업로드 흐름을 시연할 수 있음

## 폴더 구조

```text
test06/
  docs/
  backend/
    src/
      data/
      routes/
      services/
      utils/
  frontend/
    src/
      components/
      pages/
```

## 구현 순서

1. backend 최소 실행 구조
2. input/upload/analysis API
3. frontend 최소 실행 구조
4. input / upload / result 화면
5. API 연결

## authoritative_updates YAML

```yaml
authoritative_updates:
  frozen_values:
    frontend_stack: react_vite
    backend_stack: express
    storage_mode: in_memory
    upload_mode: stubbed_sample_parse
  supersedes:
    - multi_option_stack -> single_fixed_stack
  deprecated:
    - sqlite_requirement
    - external_ai_dependency
  carry_forward_only:
    - frontend_stack
    - backend_stack
    - storage_mode
    - upload_mode
  do_not_carry_forward:
    - paid_external_apis

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
