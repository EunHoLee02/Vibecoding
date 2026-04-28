# P0 Input Summary

## 프로토타입 요약

- 서비스명: Well Track Prototype
- 한 줄 소개: 영양제 정보를 입력하거나 샘플 업로드 흐름을 통해 중복 성분, 과다 가능성, 복용 시간 가이드를 빠르게 보여주는 프로토타입

## 핵심 사용자 / 문제

- 여러 영양제를 함께 복용하는 사용자
- 성분 중복 여부를 한눈에 확인하기 어려운 사용자
- 총 복용량 기준의 주의 항목을 빠르게 보고 싶은 사용자
- 언제 나눠 복용하면 좋은지 정리된 가이드를 원하는 사용자

## MVP 핵심 범위

- 직접 입력
- 샘플 업로드 흐름
- 분석 실행
- 결과 화면 표시

## 제외 범위

- 로그인 / 회원가입
- 관리자
- 결제 / 구독
- 문의 / 운영
- 실제 OCR 필수 연동
- 사용자별 기록 누적 저장

## 핵심 시연 흐름

1. 사용자가 직접 입력하거나 업로드 흐름으로 진입한다.
2. 분석 실행을 누른다.
3. 결과 화면에서 중복 성분, 과다 가능성, 복용 시간 가이드를 확인한다.

## 주요 제약사항

- 프론트엔드와 백엔드를 함께 포함
- 분석은 rule-based 우선
- 결과 표현은 일반 가이드 수준 유지
- endpoint, 필드명, 상태값은 이후 단계에서도 유지

## 추가 확인 필요 항목

- 실제 파일 바이너리 업로드까지 구현할지 여부
- 결과 저장을 남길지 여부

현재 구현에서는 위 두 항목 모두 프로토타입 단순화를 위해 최소화했습니다.

## authoritative_updates YAML

```yaml
authoritative_updates:
  frozen_values:
    service_name: Well Track Prototype
    prototype_scope: core_demo_only
    auth_mode: none
    admin_mode: none
    payment_mode: none
    core_flow: input_to_analysis_to_result
    backend_mode: required
    analysis_mode: rule_based_first
    ocr_mode: stub_or_mock_allowed
    result_persistence: optional
  supersedes:
    - full_service_scope -> core_demo_only
    - full_ocr_required -> stub_or_mock_allowed
  deprecated:
    - login_signup_flows
    - admin_console
    - billing_subscription
  carry_forward_only:
    - service_name
    - core_flow
    - analysis_mode
    - ocr_mode
  do_not_carry_forward:
    - speculative_features

stage_status:
  maturity: provisional
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
