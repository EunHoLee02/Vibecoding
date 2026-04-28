# P2 화면 설계와 사용자 플로우

## 1. 프로토타입 전체 화면 목록
1. `start_input_screen`
2. `upload_or_sample_screen`
3. `result_screen`

## 2. 화면별 목적
- `start_input_screen`
  - 직접 입력으로 가장 빠르게 분석을 시작한다.
- `upload_or_sample_screen`
  - 샘플 선택 또는 업로드 흐름을 시연한다.
- `result_screen`
  - 분석 결과를 확인하고 다시 입력 흐름으로 돌아간다.

## 3. 화면별 주요 UI 요소
- `start_input_screen`
  - 프로토타입 소개 문구
  - 영양제 입력 카드
  - 성분 행 추가/삭제 버튼
  - 영양제 추가 버튼
  - `분석 실행` 버튼
  - `샘플 업로드 체험` 버튼
- `upload_or_sample_screen`
  - 샘플 카드 목록
  - 파일 업로드 입력
  - 파싱 결과 미리보기
  - `샘플 불러오기` 버튼
  - `업로드 파일로 불러오기` 버튼
  - `이 조합으로 분석 실행` 버튼
- `result_screen`
  - 입력 영양제 목록
  - 중복 성분 섹션
  - 과다 가능성 섹션
  - 복용 시간 가이드 섹션
  - 요약 한 줄
  - `다시 입력하기` 버튼
  - `샘플 업로드 체험으로 이동` 버튼

## 4. 화면별 주요 사용자 액션
- `start_input_screen`
  - 제품명, 제조사, 성분 입력
  - 영양제 추가
  - 성분 추가/삭제
  - 분석 실행
  - 업로드/샘플 화면으로 이동
- `upload_or_sample_screen`
  - 샘플 카드 선택
  - 파일 업로드
  - 파싱 결과 확인
  - 분석 실행
- `result_screen`
  - 결과 확인
  - 다시 입력하기
  - 업로드/샘플 화면으로 이동

## 5. 화면 간 이동 흐름
- `/` → `/result`
- `/` → `/input-source`
- `/input-source` → `/result`
- `/result` → `/`
- `/result` → `/input-source`

## 6. 필수 CTA 버튼 목록
- `분석 실행`
- `샘플 업로드 체험`
- `샘플 불러오기`
- `업로드 파일로 불러오기`
- `이 조합으로 분석 실행`
- `다시 입력하기`
- `샘플 업로드 체험으로 이동`

## 7. 빈 상태 / 로딩 상태 / 오류 상태
- 빈 상태
  - 직접 입력 폼의 초기 값
  - 업로드/샘플 화면의 파싱 결과 없음
  - 결과 화면의 분석 결과 없음
- 로딩 상태
  - 샘플 불러오는 중
  - 업로드 파싱 중
  - 분석 실행 중
- 오류 상태
  - 입력 검증 실패
  - 샘플 또는 업로드 파싱 실패
  - 분석 실패
  - 결과 데이터 없음

## 8. 프로토타입 시연용 대표 사용자 플로우
1. 사용자가 `/`에서 직접 입력을 시작한다.
2. 최소 1개 영양제와 1개 이상 성분을 입력한다.
3. `분석 실행` 버튼을 누른다.
4. 시스템이 `/result`로 이동하고 결과를 렌더링한다.
5. 사용자는 `다시 입력하기` 또는 `샘플 업로드 체험으로 이동`을 선택한다.

## 9. 다음 단계에서 바로 사용할 화면/플로우 고정 요약
- route는 `/`, `/input-source`, `/result`로 고정한다.
- 화면 수는 3개로 고정한다.
- 직접 입력과 업로드/샘플 흐름은 모두 동일한 결과 화면으로 수렴한다.

## 이번 단계 확정 사항
- `start_input_screen`, `upload_or_sample_screen`, `result_screen` 3개 화면으로 고정한다.
- route는 `/`, `/input-source`, `/result`로 고정한다.
- CTA 이름은 이후 단계에서 바꾸지 않도록 현재 이름으로 고정한다.

## 다음 단계 입력으로 넘길 핵심 요약
- 직접 입력과 업로드/샘플 입력이 모두 동일한 결과 응답 구조를 사용해야 한다.
- 결과 화면은 입력 목록, 중복 성분, 과다 가능성, 복용 시간 가이드, 요약 한 줄을 반드시 렌더링해야 한다.
- 분석 결과는 즉시 보여주는 단일 흐름을 유지한다.

## 추가 확인 필요 항목
- 없음

## 충돌 가능 항목
- 결과 화면을 여러 단계로 쪼개거나 route를 추가하면 현재 화면 고정안과 충돌한다.

## 바로 다음 단계 진행 가능 항목
- P3 데이터 모델과 API 계약 정의

## 단계 상태
- minimum_complete

```yaml
authoritative_updates:
  frozen_values:
    prototype.routes:
      start_input_screen: /
      upload_or_sample_screen: /input-source
      result_screen: /result
    prototype.cta_names:
      - 분석 실행
      - 샘플 업로드 체험
      - 샘플 불러오기
      - 업로드 파일로 불러오기
      - 이 조합으로 분석 실행
      - 다시 입력하기
      - 샘플 업로드 체험으로 이동
    prototype.screen_names:
      - start_input_screen
      - upload_or_sample_screen
      - result_screen
  supersedes:
    - flexible_screen_count -> fixed_three_screens
  deprecated:
    - login_screen
    - admin_screen
    - payment_screen
  carry_forward_only:
    - prototype.routes
    - prototype.cta_names
    - prototype.screen_names
  do_not_carry_forward:
    - login_screen
    - admin_screen
    - payment_screen

stage_status:
  maturity: minimum_complete
  unresolved_conflicts:
    - none
  missing_core_demo_items:
    - none
```
