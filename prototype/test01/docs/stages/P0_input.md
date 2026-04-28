# P0 입력 정리

## 프로토타입 요약
- 서비스명: Well Track Prototype
- 한 줄 소개: 사용자가 영양제 정보를 직접 입력하거나 샘플 업로드 stub를 통해 불러오면 중복 성분, 과다 가능성, 복용 시간 가이드를 빠르게 보여주는 프로토타입
- 목표: 3분 이내에 입력 → 분석 → 결과 확인 흐름을 체험하게 한다.

## 핵심 사용자/문제
- 여러 영양제를 함께 복용하는 사용자가 성분 중복을 직접 계산하기 어렵다.
- 총 복용량 기준의 과다 가능성을 한눈에 파악하기 어렵다.
- 언제 먹는 게 좋은지 정리해서 보기 어렵다.

## 프로토타입 MVP 핵심 범위
- 영양제 직접 입력
- 샘플 업로드 stub 또는 샘플 데이터 불러오기
- rule-based 분석 실행
- 결과 화면에서 중복 성분, 과다 가능성, 복용 시간 가이드, 한 줄 요약 표시

## 제외 범위
- 로그인/회원가입/비밀번호 재설정
- 관리자 페이지
- 결제/구독
- 문의/오류 신고
- 사용자별 기록 누적
- 운영 로그/배포 자동화

## 핵심 시연 흐름
1. 사용자가 직접 입력 또는 샘플 업로드 stub를 선택한다.
2. 영양제 조합을 제출한다.
3. 분석 결과에서 입력 목록, 중복 성분, 과다 가능성, 복용 시간 가이드, 요약을 확인한다.

## 주요 제약사항
- 의료 진단/처방처럼 보이는 표현 금지
- 외부 AI와 유료 API 의존 금지
- OCR은 실제 연동보다 stub/mock 우선
- endpoint, 필드명, 상태값은 이후 단계에서 고정 유지

## 추가 확인 필요 항목
- 실제 파일 업로드 바이너리 처리까지 포함할지 여부
- 결과 저장 이력을 UI에서 노출할지 여부

## 이번 단계 확정 사항
- 프로토타입은 로그인 없는 핵심 분석 데모만 구현한다.
- 프론트엔드와 백엔드를 모두 포함한다.
- 분석은 rule-based 우선, OCR은 stub/mock 우선이다.
- 결과 저장은 사용자 이력 저장이 아니라 분석 결과 단건 조회 정도만 허용한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 핵심 흐름은 `input_to_analysis_to_result`
- 반드시 보여줄 결과 항목은 입력 목록, 중복 성분, 과다 가능성, 복용 시간 가이드, 한 줄 요약
- 저장 방식 후보는 sqlite 또는 mock이지만 한 단계 뒤에 하나로 고정한다.

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- 실제 OCR 업로드를 필수 기능으로 오해하면 프로토타입 범위를 넘는다.

## 바로 다음 단계 진행 가능 항목
- P1 핵심 시나리오 정의

## 단계 상태
- provisional

```yaml
authoritative_updates:
  frozen_values:
    prototype.admin_mode: none
    prototype.analysis_mode: rule_based_first
    prototype.auth_mode: none
    prototype.backend_mode: required
    prototype.core_flow: input_to_analysis_to_result
    prototype.mode: prototype_only
    prototype.ocr_mode: stub_or_mock_allowed
    prototype.payment_mode: none
    prototype.result_persistence: optional
  supersedes:
    - full_service_scope -> prototype_only
    - login_signup_flows -> none
  deprecated:
    - full_user_journey
  carry_forward_only:
    - prototype.admin_mode
    - prototype.analysis_mode
    - prototype.auth_mode
    - prototype.backend_mode
    - prototype.core_flow
    - prototype.mode
    - prototype.ocr_mode
    - prototype.payment_mode
    - prototype.result_persistence
  do_not_carry_forward:
    - login_signup_flows

stage_status:
  maturity: provisional
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
