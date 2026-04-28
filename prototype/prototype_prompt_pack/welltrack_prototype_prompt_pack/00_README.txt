Well Track Prototype Prompt Pack

구성:
- 01_P0_input_prompt.txt
- 02_P1_scenario_prompt.txt
- 03_P2_screen_flow_prompt.txt
- 04_P3_data_api_contract_prompt.txt
- 05_P4_tech_stack_structure_prompt.txt
- 06_P5_backend_build_prompt.txt
- 07_P6_frontend_build_prompt.txt
- 08_P7_final_handoff_prompt.txt
- 09_final_code_generation_prompt.txt

사용 순서:
1. 새 채팅에서 프로토타입 기준 문서(이미 만든 prototype master prompt)를 먼저 넣는다.
2. 01_P0_input_prompt.txt 실행
3. 결과에서 아래 3개를 다음 단계로 넘긴다.
   - Prototype Decision Register
   - 이번 단계 확정 사항
   - authoritative_updates YAML
4. 02 -> 08 순서대로 진행한다.
5. 08이 끝나면 09_final_code_generation_prompt.txt로 실제 코드 생성을 시작한다.

중요:
- 각 단계는 이전 단계의 authoritative_updates YAML을 그대로 붙여넣어야 한다.
- route, endpoint, field, enum 이름은 단계가 올라가도 바꾸지 않는다.
- 로그인/회원가입/관리자/결제/문의/운영 기능은 프로토타입 범위에서 제외한다.
