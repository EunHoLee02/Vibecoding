# P1 Scenarios

## 프로토타입 대표 시나리오

### 시나리오 1: 직접 입력 분석

1. 사용자가 시작 화면에서 영양제와 성분을 입력한다.
2. `직접 입력 분석하기`를 누른다.
3. 시스템이 입력을 저장하고 분석을 실행한다.
4. 결과 화면에서 중복 성분, 과다 가능성, 복용 시간 가이드를 보여준다.

### 시나리오 2: 샘플 업로드 체험

1. 사용자가 업로드 화면으로 이동한다.
2. 샘플을 선택하거나 파일 이름이 있는 업로드 stub를 고른다.
3. `샘플 불러오기`를 누른다.
4. 시스템이 샘플 파싱 결과를 보여준다.
5. `이 조합 분석하기`를 눌러 결과 화면으로 이동한다.

## 시연 우선순위

- P0: 직접 입력, 샘플 불러오기, 분석 결과 확인
- P1: 업로드 정교화, 분석 설명 보강
- P2: 개인화 및 운영 영역

## 제외 시나리오

- 로그인 후 저장된 기록 조회
- 관리자 개입
- 결제나 상담 유도

## authoritative_updates YAML

```yaml
authoritative_updates:
  frozen_values:
    scenario_primary: manual_input_analysis
    scenario_secondary: sample_upload_analysis
    demo_time_target_minutes: 3
    result_sections:
      - supplements
      - duplicated_ingredients
      - risk_items
      - timing_guides
      - summary_text
  supersedes:
    - broad_user_journey -> manual_input_analysis
  deprecated:
    - account_based_scenarios
  carry_forward_only:
    - scenario_primary
    - scenario_secondary
    - result_sections
  do_not_carry_forward:
    - admin_or_payment_scenarios

stage_status:
  maturity: provisional
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
