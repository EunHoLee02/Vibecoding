# P0 단계 프로토타입 입력 정보 정리

아래는 **P0단계 프로토타입 입력 정보 정리** 결과입니다.  
이번 정리는 제공해주신 **Prototype Decision Register**를 최우선 authoritative source로 사용했고, 프로토타입 전용 마스터 프롬프트의 P0 기준과 마지막 필수 출력 형식을 따랐습니다.

---

## 1. 프로토타입 요약

**서비스명**  
- **Well Track Prototype** *(확정)*

**한 줄 소개**  
- 사용자가 영양제 정보를 입력하거나 업로드하면, **중복 성분**, **과다 복용 가능성**, **복용 시간 가이드**를 빠르게 보여주는 프로토타입 *(확정)*

**프로토타입 목표**  
- 핵심 가치가 한눈에 보이도록 한다.
- 사용자가 **3분 이내**에 **입력 → 분석 → 결과 확인** 흐름을 체험할 수 있게 한다.
- **로그인 없이** 바로 핵심 기능을 시연한다.

**프로토타입 성격**  
- 정식 서비스가 아니라 **핵심 기능 시연용 프로토타입**
- **프론트엔드 + 백엔드 포함**
- 분석은 **rule-based 우선**
- OCR은 **실연동보다 stub/mock 우선**
- 의료 서비스처럼 보이지 않도록 **일반 가이드 수준 표현만 유지**

## 2. 핵심 사용자/문제

### 핵심 사용자
1. 여러 영양제를 함께 복용하는 일반 사용자  
2. 중복 성분이나 과다 복용 가능성을 빠르게 확인하고 싶은 사용자

### 핵심 사용자 문제
1. 여러 영양제의 성분이 겹치는지 직접 계산하기 어렵다.  
2. 총 복용량 기준으로 과다 가능성을 한눈에 파악하기 어렵다.  
3. 언제 먹는 게 좋은지 정리해서 보기 어렵다.

## 3. 프로토타입 MVP 핵심 범위

### 핵심 기능
1. **영양제 직접 입력**
2. **영양제 이미지 업로드 또는 샘플 업로드**
3. **입력된 영양제 조합 분석 실행**
4. **결과 화면 표시**
   - 입력된 영양제 목록
   - 중복 성분 목록
   - 과다 가능성 표시
   - 복용 시간 가이드
   - 요약 한 줄

### 범위 정의
- 핵심 흐름은 **input_to_analysis_to_result** 로 고정
- 사용자는 로그인 없이 바로 시작
- 업로드 기능은 포함하되, OCR은 실제 인식 대신 **mock/stub 허용**
- 백엔드는 실제 분석 시연을 위해 포함
- 결과 저장은 필수 아님
- 사용자별 데이터 누적 저장은 제외 가능

### 구현 방식 방향
- **빠르게 시연 가능한 구조**
- **과도한 운영/인증/권한 설계 배제**
- 이후 단계에서 바꾸지 않도록 **단순하고 일관된 구조** 유지
- 데이터 저장은 아직 **sqlite 또는 간단한 json/mock data 후보 상태**

## 4. 제외 범위
1. 로그인
2. 회원가입
3. 비밀번호 재설정
4. 관리자 기능 / 관리자 페이지
5. 결제 / 구독
6. 문의 / 오류 신고
7. 사용자별 기록 누적
8. 운영 로그
9. 배포 자동화
10. 고도화된 OCR 정확도 개선
11. 개인화 기능
12. 결과 저장 기능(필수 아님이므로 현 단계 제외 가능)
13. 생성형 AI 설명 기능(필수 아님, 제외 가능)

## 5. 핵심 시연 흐름
1. 사용자가 영양제 정보를 **직접 입력**하거나 **샘플 이미지/파일을 업로드**한다.
2. 사용자가 **분석 실행** 버튼을 누른다.
3. 시스템이 rule-based 방식으로 조합을 분석한다.
4. 결과 화면에서 아래 내용을 확인한다.
   - 입력된 영양제 목록
   - 중복 성분 목록
   - 과다 가능성 표시
   - 복용 시간 가이드
   - 요약 한 줄

## 6. 주요 제약사항
- 이번 작업은 **정식 서비스 개발이 아니라 프로토타입 제작**
- **핵심 기능 시연 범위만 다룸**
- 로그인/회원가입/관리자/결제 기능 추가 금지
- 프로토타입 범위를 넘는 확장 금지
- 프론트엔드 필요: **예**
- 백엔드 필요: **예**
- 파일 업로드 필요: **예**
- 외부 API 필요: **선택**
- OCR: **실연동보다 stub/mock 우선**
- 분석: **rule-based 우선**
- 의료 진단/처방처럼 보이는 표현 금지
- 일반적인 참고/가이드 수준으로만 결과 제시

## 7. 추가 확인 필요 항목
1. 데이터 저장 방식 최종 선택
2. 업로드 입력 방식의 최소 범위
3. 직접 입력 시 최소 입력 항목
4. rule-based 분석 기준의 기준 데이터
5. 샘플 시연 데이터 구성
6. 외부 API 사용 여부

# 이번 단계 확정 사항
- prototype.mode = `prototype_only`
- prototype.auth_mode = `none`
- prototype.admin_mode = `none`
- prototype.payment_mode = `none`
- prototype.core_flow = `input_to_analysis_to_result`
- prototype.backend_mode = `required`
- 서비스명 = `Well Track Prototype`
- 프론트엔드 필요 = `yes`
- 백엔드 필요 = `yes`
- 파일 업로드 필요 = `yes`
- 외부 API 필요 = `optional`
- 분석 방식 우선순위 = `rule_based_first`
- OCR 정책 = `mock_or_stub_first`

# 다음 단계 입력으로 넘길 핵심 요약
Well Track Prototype는 로그인 없이 사용자가 영양제 정보를 직접 입력하거나 이미지/샘플 업로드 후 분석을 실행하면, 결과 화면에서 **중복 성분**, **과다 복용 가능성**, **복용 시간 가이드**를 확인할 수 있는 **프론트엔드+백엔드 기반 프로토타입**이다. 핵심 흐름은 **input → analysis → result** 이며, 분석은 **rule-based 우선**, OCR은 **mock/stub 우선**으로 한다.

# 단계 상태
- stage: P0
- status: 완료
- maturity: minimum_complete

## authoritative_updates YAML
```yaml
authoritative_updates:
  frozen_values:
    prototype.mode: prototype_only
    prototype.auth_mode: none
    prototype.admin_mode: none
    prototype.payment_mode: none
    prototype.core_flow: input_to_analysis_to_result
    prototype.backend_mode: required
    prototype.service_name: Well Track Prototype
    prototype.service_summary: 사용자가 영양제 정보를 입력하거나 업로드하면 중복 성분, 과다 복용 가능성, 복용 시간 가이드를 빠르게 보여주는 프로토타입
    prototype.frontend_required: yes
    prototype.backend_required: yes
    prototype.file_upload_required: yes
    prototype.external_api_mode: optional
    prototype.analysis_mode: rule_based_first
    prototype.ocr_mode: mock_or_stub_first
    prototype.result_storage_mode: optional_not_required
    prototype.user_history_mode: none
    prototype.core_features:
      - supplement_manual_input
      - supplement_image_or_sample_upload
      - combination_analysis_run
      - analysis_result_display
```
