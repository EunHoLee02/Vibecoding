# P0 프로토타입 입력 정리

## 1. 프로토타입 요약
- 서비스명: `Well Track Prototype`
- 한 줄 소개: 사용자가 영양제 정보를 입력하거나 업로드하면 중복 성분, 과다 가능성, 복용 시간 가이드를 빠르게 보여주는 프로토타입
- 목표: 3분 안에 입력 → 분석 → 결과 확인 흐름을 시연한다.

## 2. 핵심 사용자/문제
- 핵심 사용자:
  - 여러 영양제를 함께 복용하는 일반 사용자
  - 중복 성분이나 과다 가능성을 빠르게 확인하고 싶은 사용자
- 핵심 문제:
  - 여러 제품의 성분 중복을 직접 계산하기 어렵다.
  - 총 복용량 기준으로 주의가 필요한 성분을 한눈에 파악하기 어렵다.
  - 복용 시간을 정리해서 보기 어렵다.

## 3. 프로토타입 MVP 핵심 범위
- 영양제 직접 입력
- 샘플 업로드 또는 샘플 데이터 선택
- 분석 실행
- 결과 화면에서 입력 목록, 중복 성분, 과다 가능성, 복용 시간 가이드, 요약 한 줄 표시

## 4. 제외 범위
- 로그인/회원가입
- 관리자 기능
- 결제/구독
- 문의/운영 기능
- 사용자별 기록 누적 저장
- 의료 진단/처방처럼 보이는 기능

## 5. 핵심 시연 흐름
1. 사용자가 영양제 정보를 직접 입력하거나 샘플 업로드/샘플 선택을 사용한다.
2. 분석 실행 버튼을 누른다.
3. 결과 화면에서 중복 성분, 과다 가능성, 복용 시간 가이드, 요약 한 줄을 확인한다.

## 6. 주요 제약사항
- 프로토타입 전용 범위만 구현한다.
- 백엔드와 프론트엔드를 함께 포함한다.
- 분석은 rule-based 우선이다.
- OCR은 실제 연동 대신 stub/mock 우선이다.
- 결과 표현은 일반 가이드 수준으로만 유지한다.

## 7. 추가 확인 필요 항목
- 없음

## 이번 단계 확정 사항
- 프로토타입 범위는 입력 → 분석 실행 → 결과 확인으로 고정한다.
- 로그인/회원가입/관리자/결제/문의/운영 기능은 제외한다.
- 백엔드 포함 구조를 유지한다.
- 분석은 rule-based 우선, OCR은 stub/mock 우선으로 고정한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 핵심 사용자 행동은 직접 입력 또는 샘플 업로드/선택 후 분석 실행과 결과 확인이다.
- 결과 화면은 입력 목록, 중복 성분, 과다 가능성, 복용 시간 가이드, 요약 한 줄을 반드시 보여줘야 한다.
- 표현은 의료적 확정이 아닌 일반 가이드 수준이어야 한다.

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- 사용자 계정, 관리자, 결제, 운영 기능을 추가하면 프로토타입 범위를 벗어난다.

## 바로 다음 단계 진행 가능 항목
- P1 핵심 사용자 시나리오 정의

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.mode: prototype_only
    prototype.auth_mode: none
    prototype.admin_mode: none
    prototype.payment_mode: none
    prototype.core_flow: input_to_analysis_to_result
    prototype.backend_mode: required
    prototype.analysis_mode: rule_based_first
    prototype.ocr_mode: stub_or_mock_allowed
    prototype.result_persistence: optional
  supersedes:
    - full_service_scope -> prototype_only
  deprecated:
    - login_signup_flows
    - admin_console
    - billing_subscription
    - persistent_user_history
  carry_forward_only:
    - prototype.mode
    - prototype.auth_mode
    - prototype.admin_mode
    - prototype.payment_mode
    - prototype.core_flow
    - prototype.backend_mode
    - prototype.analysis_mode
    - prototype.ocr_mode
    - prototype.result_persistence
  do_not_carry_forward:
    - login_signup_flows
    - admin_console
    - billing_subscription
    - persistent_user_history

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
