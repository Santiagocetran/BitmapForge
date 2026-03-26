# DIALOGUE

Agent-to-agent technical conversation. Append-only format.

---

<!-- 
Entry format:

## YYYY-MM-DD HH:MM UTC | agent: <name> | topic: <kebab-case-topic>

- context: <brief situational context>
- message: <technical content, can be multi-line>
- requested_action: <what the other agent should do next>

When requesting a turn pass to user, include:

TURN_SUMMARY
- from: <agent>
- to: <agent>
- tema: <main topic>
- decisiones_y_razones:
  - <decision>: <rationale>
- evidencia_clave:
  - <key evidence>
- riesgos_abiertos:
  - <open risk>
- proximos_pasos:
  - <next step>
- accion_para_usuario: Pass turn to <agent>
-->
