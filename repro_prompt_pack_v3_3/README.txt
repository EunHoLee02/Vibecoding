이 폴더에는 다음이 포함되어 있습니다.

- 00_master_prompt_v3_3.txt
  v3.3 전체 마스터 프롬프트

- 01_execution_template_common.txt
  모든 단계 공통 실행용 축약 템플릿

- 02_step_0_execution_template.txt ~ 02_step_12_execution_template.txt
  단계별 실행용 축약 템플릿
  (10a, 10b, 10c 포함)

권장 사용 순서:
1. 00_master_prompt_v3_3.txt를 기준 문서로 저장
2. 실제 대화에서는 01_execution_template_common.txt 또는 각 단계별 템플릿 사용
3. 각 단계 완료 후 authoritative_updates YAML과 이번 단계 확정 사항을 다음 단계 입력으로 넘김
4. Canonical Decision Register는 최신 frozen_values만 유지하면서 갱신
