# P1 핵심 시나리오 정의

## 1. 프로토타입 핵심 사용자 시나리오
- 시나리오 A: 사용자가 영양제 정보를 직접 입력하고 분석 결과를 확인한다.
- 시나리오 B: 사용자가 샘플 데이터 또는 업로드 파일을 사용해 분석 결과를 확인한다.

## 2. 시연용 대표 사용자 플로우
1. 사용자가 시작/입력 화면에 들어온다.
2. 직접 입력을 선택하면 제품명과 성분 정보를 입력한다.
3. 또는 업로드/샘플 화면으로 이동해 샘플을 선택하거나 파일 업로드를 시도한다.
4. 분석 실행 버튼을 누른다.
5. 시스템이 중복 성분, 과다 가능성, 복용 시간 가이드, 요약 한 줄을 반환한다.
6. 사용자가 결과 화면을 확인한 뒤 다시 입력하기를 선택한다.

## 3. 필수 사용자 행동 목록
- 제품명 입력
- 제조사 선택 입력 또는 공란 유지
- 성분명 입력
- 성분 함량과 단위 입력
- 영양제 추가
- 성분 행 추가/삭제
- 샘플 선택 또는 파일 업로드
- 분석 실행 버튼 클릭
- 결과 화면에서 다시 입력하기 클릭

## 4. 필수 시스템 반응 목록
- 최소 1개 영양제 입력 여부를 검증한다.
- 샘플 선택 또는 파일 업로드 흐름에서 파싱 결과를 미리 보여준다.
- 동일 입력에는 동일 분석 결과를 반환한다.
- 결과 화면에서 입력 목록, 중복 성분, 과다 가능성, 복용 시간 가이드, 요약 한 줄을 렌더링한다.
- 입력 오류나 업로드 실패 시 일반 가이드 수준의 오류 메시지를 보여준다.

## 5. P0 / P1 / P2 시나리오 우선순위
- P0
  - 직접 입력
  - 샘플 선택 또는 업로드 흐름
  - 분석 실행
  - 결과 표시
- P1
  - 업로드 흐름의 안내 메시지 보강
  - 결과 요약 문구 보강
- P2
  - 결과 저장
  - 개인화
  - 운영 기능

## 6. 제외해야 할 시나리오
- 로그인/회원가입
- 사용자별 기록 누적
- 관리자 개입
- 결제 흐름
- 문의/신고 흐름
- 의료 진단/처방처럼 보이는 결과 해석

## 7. 다음 단계에서 바로 사용할 수 있는 시나리오 고정 요약
- 필수 사용자 시나리오는 `직접 입력 분석 흐름`과 `샘플 업로드/선택 분석 흐름` 두 가지다.
- 두 흐름 모두 최종 목표는 결과 화면에서 중복 성분, 과다 가능성, 복용 시간 가이드, 요약 한 줄을 확인하는 것이다.

## 이번 단계 확정 사항
- 시연 시나리오는 직접 입력 흐름과 업로드/샘플 흐름 두 개로 고정한다.
- 결과 해석 항목은 중복 성분, 과다 가능성, 복용 시간 가이드, 요약 한 줄로 고정한다.
- 사용자 행동은 실제 화면 버튼과 입력 요소로 연결 가능한 수준으로 고정한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 시작/입력 화면, 업로드/샘플 화면, 결과 화면이 필요하다.
- 직접 입력과 샘플 입력 모두 분석 실행 버튼으로 같은 분석 결과 구조에 도달해야 한다.
- 다시 입력하기 동작이 필요하다.

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- 별도 인증 흐름이나 관리자 흐름을 추가하면 확정 시나리오와 충돌한다.

## 바로 다음 단계 진행 가능 항목
- P2 화면 설계와 사용자 플로우 정의

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.scenarios:
      - manual_input_analysis_flow
      - sample_upload_analysis_flow
    prototype.result_sections:
      - supplements
      - duplicated_ingredients
      - risk_items
      - timing_guides
      - summary_text
  supersedes:
    - generic_user_flow -> two_demo_flows
  deprecated:
    - user_history_flow
    - admin_intervention_flow
    - payment_flow
  carry_forward_only:
    - prototype.scenarios
    - prototype.result_sections
  do_not_carry_forward:
    - user_history_flow
    - admin_intervention_flow
    - payment_flow

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
