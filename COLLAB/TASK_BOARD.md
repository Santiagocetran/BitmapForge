# TASK_BOARD

Active task state for collab mode.

| task_id | owner | status | scope | updated_at_utc | notes |
| ------- | ----- | ------ | ----- | -------------- | ----- |

<!--
Status values: todo, in_progress, blocked, done
Scope: file globs defining what the agent can edit
Rules:
- Claim (assign owner) before editing any code
- One owner per active task
- Don't touch files outside your task's scope
-->
