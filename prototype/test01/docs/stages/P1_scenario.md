# P1 핵심 시나리오

## 대표 시나리오 1
- 이름: 직접 입력으로 분석 실행
- 시작 조건: 사용자가 홈에서 `직접 입력 시작`을 선택했다.
- 사용자 행동:
  1. 영양제 1개 이상을 입력한다.
  2. 성분과 함량을 입력한다.
  3. `분석 실행` 버튼을 누른다.
- 시스템 반응:
  1. 요청을 검증한다.
  2. rule-based 분석을 수행한다.
  3. 결과 화면으로 이동한다.
- 결과 화면:
  - 입력된 영양제 목록
  - 중복 성분
  - 과다 가능성
  - 복용 시간 가이드
  - 한 줄 요약

## 대표 시나리오 2
- 이름: 샘플 업로드 stub으로 분석 실행
- 시작 조건: 사용자가 홈에서 `샘플 업로드`를 선택했다.
- 사용자 행동:
  1. 샘플 카드 또는 파일명 기반 stub를 선택한다.
  2. 파싱 결과를 확인한다.
  3. `이 조합으로 분석 실행` 버튼을 누른다.
- 시스템 반응:
  1. 샘플 payload를 반환한다.
  2. 분석 결과를 생성한다.
  3. 결과 화면으로 이동한다.

## 대표 시나리오 3
- 이름: 결과 재확인
- 시작 조건: 이미 분석 결과 ID가 있다.
- 사용자 행동:
  1. 결과 URL에 진입한다.
- 시스템 반응:
  1. 저장된 결과를 조회한다.
  2. 동일한 결과 구조를 다시 렌더링한다.

## 시연 순서 추천
1. 홈에서 직접 입력 흐름 시연
2. 샘플 업로드 stub 흐름 시연
3. 결과 URL 재방문으로 결과 조회 시연

## 실패 시 fallback
- 직접 입력이 번거로우면 샘플 업로드 stub 사용
- 파일명이 없거나 샘플 키가 없으면 내장 샘플 목록 사용
- 결과 조회 실패 시 홈으로 돌아가 새 분석 실행

## 이번 단계 확정 사항
- 데모 시나리오는 3개로 고정한다.
- 한 시나리오는 5단계 이내 행동으로 끝낸다.
- 결과 재조회는 `분석 결과 단건 조회` 수준으로만 포함한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 홈, 직접 입력, 샘플 업로드, 결과 확인의 4개 화면 흐름으로 설계 가능
- 샘플 업로드는 실제 OCR이 아니라 파싱 stub 결과 확인 흐름으로 처리한다.

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- 결과 이력 목록을 추가하면 현재 시나리오 수와 범위를 넘는다.

## 바로 다음 단계 진행 가능 항목
- P2 화면/흐름 설계

## 단계 상태
- provisional

```yaml
authoritative_updates:
  frozen_values:
    prototype.demo_scenarios:
      - manual_analysis
      - sample_stub_analysis
      - result_revisit
    prototype.max_steps_per_scenario: 5
    prototype.screen_count_target: 4
  supersedes:
    - generic_demo_flow -> manual_analysis/sample_stub_analysis/result_revisit
  deprecated:
    - full_history_scenario
  carry_forward_only:
    - prototype.demo_scenarios
    - prototype.max_steps_per_scenario
    - prototype.screen_count_target
  do_not_carry_forward:
    - full_history_scenario

stage_status:
  maturity: provisional
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
