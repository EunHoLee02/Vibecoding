prototype_prompt_pack_v2
=====================

파일 설명:
- 00_prototype_master_prompt_v2.txt
  프로토타입 전용 마스터 프롬프트 v2

- 01_prototype_execution_template_common.txt
  단계별로 바로 붙여넣는 공통 실행 템플릿

- 02_prototype_quick_start_prompt.txt
  빠르게 시작할 때 쓰는 축약 프롬프트

v2 강화 포인트:
1. 섹션 제목/순서 고정 규칙 추가
2. 빈 섹션은 생략하지 않고 반드시 `없음`으로 표기
3. authoritative_updates YAML은 fenced code block과 key 정렬 규칙 사용
4. P4 기술 선택은 기본 raw score와 조정 한도를 둔 닫힌 비교 방식으로 고정
5. quick start도 구조화 블록 우선과 출력 순서 고정 규칙을 따르도록 강화

권장 사용 순서:
1. 00 파일을 기준 문서로 보관
2. 01 파일 템플릿에 현재 단계 입력을 채워서 사용
3. 아주 빠르게 시작할 때는 02 파일 사용

주의:
- 이 패키지는 정식 서비스 개발용이 아니라 프로토타입 전용이다.
- 로그인/회원가입/관리자/결제는 기본 제외다.
- 핵심 기능 시연용 프론트+백 구조에 맞춰져 있다.
- 정식 서비스 수준 보안/운영/권한 설계는 기본 목표가 아니다.
