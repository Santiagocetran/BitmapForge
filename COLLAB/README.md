# COLLAB Protocol

Governance directory for multi-agent coordination (IAxP).

## Files

| File            | Purpose                     | Rule                                               |
| --------------- | --------------------------- | -------------------------------------------------- |
| `DIALOGUE.md`   | Agent-to-agent conversation | Append-only; rotate at ~200 lines to `archive/`    |
| `TASK_BOARD.md` | File-scope ownership        | Claim before editing; one owner per active task    |
| `DECISIONS.md`  | Closed decisions            | Immutable; new DEC to override                     |
| `HANDOFFS.md`   | Context transfers           | Mandatory at task completion                       |
| `CONFLICTS.md`  | Conflict registry           | Both agents pause on affected paths until resolved |
| `STATUS.md`     | Agent state snapshot        | Update at end of each turn; max 5 lines/agent      |

## Rules

1. Claim in `TASK_BOARD.md` before editing code
2. One owner per active task
3. Stay within assigned scope
4. Handoff at task completion
5. Strategy changes go through `DECISIONS.md` first
6. Conflicts go through `CONFLICTS.md`; no silent resolution
7. Include `TURN_SUMMARY` when requesting turn pass
8. Rotate `DIALOGUE.md` at ~200 lines
9. Cross-edit of agent configs prohibited

## Activation

- Default: `OFF`
- `ON`: read all files here, claim tasks, coordinate, register decisions
- `OFF`: write closing handoffs, freeze coordination
