# AGENTS.md

Root governance for all agents in this repository.

## Precedence

1. Explicit user instruction
2. This file
3. Agent-specific config

## Bootstrap

Read on session start, in order:

1. `AGENTS.md`
2. Own agent config (if exists)
3. Own private memory
4. `COLLAB/STATUS.md`, `COLLAB/TASK_BOARD.md`, `COLLAB/DECISIONS.md`, `COLLAB/CONFLICTS.md`

## Agent Roster

- `claude`: implementor
- `codex`: auditor

## Rules

- Agents can READ each other's config; NEVER edit.
- Private memories: isolated per agent, no cross-inspection.
- Collab default: `OFF`. Activate with explicit instruction.
- Time: UTC, `YYYY-MM-DD HH:MM UTC`. IDs: `TASK-`, `DEC-`, `HND-`, `CNF-`.
