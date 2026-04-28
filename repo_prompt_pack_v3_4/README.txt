이 폴더에는 다음이 포함되어 있습니다.

- 00_master_prompt_v3_4.txt
  v3.4 전체 마스터 프롬프트

- 01_execution_template_common.txt
  모든 단계 공통 실행용 축약 템플릿

- 02_step_0_execution_template.txt ~ 02_step_12_execution_template.txt
  단계별 실행용 축약 템플릿
  (10a, 10b, 10c 포함)

v3.4 강화 포인트:
1. 같은 입력이면 section 제목/순서, frozen_values, stage_status, enum/endpoint 이름이 최대한 동일하게 나오도록 정규화 규칙을 추가
2. 빈 섹션은 생략하지 않고 반드시 `없음`으로 표기
3. authoritative_updates YAML은 fenced code block과 고정 key 순서를 사용
4. 7단계 기술 선택은 기본 후보, 기본 점수표, 조정 허용 범위를 닫힌 규칙으로 제한
5. 10a/10b/10c 구현 단계는 충돌 시에도 동일한 섹션 순서로 `구현 보류` 상태를 출력

권장 사용 순서:
1. 00_master_prompt_v3_4.txt를 기준 문서로 저장
2. 실제 대화에서는 01_execution_template_common.txt 또는 각 단계별 템플릿 사용
3. 각 단계 완료 후 authoritative_updates YAML과 이번 단계 확정 사항을 다음 단계 입력으로 넘김
4. Canonical Decision Register는 최신 frozen_values만 남기고 정렬해서 갱신
