# AI Agent Entry Point

This file is the entry point for AI agents working in this repository.

The detailed implementation rules live in `docs/agents`. Do not duplicate those
rules here. Use this file to decide which project documents must be read before
planning or editing.

## Required Reading

Before planning or implementing any task, read:

- `docs/agents/AGENTS.md`
- `docs/agents/TYPES.md`

Then read the task-specific guide:

- Frontend or Nuxt work: `docs/agents/FRONTEND.md`
- Backend or NestJS API work: `docs/agents/API.md`
- Database, entity, repository, or migration work: `docs/agents/DATABASE.md`
- Architecture or boundary changes: `docs/architecture/README.md`

The files in `docs/agents` are the source of truth for implementation rules.

## Planning Mode Workflow

When working in Codex planning mode, do not start implementation immediately.

First produce a short plan that includes:

- Task classification: frontend, backend, database, tests, docs, architecture,
  or mixed.
- Relevant documents read from `docs/agents` and `docs/architecture`.
- Current project files that likely need inspection.
- Proposed implementation steps.
- Expected files to edit.
- Validation commands to run, if available.
- Open questions or assumptions.

Keep the plan scoped to the user request. Do not expand the task into adjacent
frontend, backend, database, or architecture work unless the requested task
requires it.

## Phases Workflow

This project may use phase documents to break implementation into controlled
work packages.

When phases are introduced, they should live under:

```txt
docs/phases/
```

Recommended phase file naming:

```txt
docs/phases/PHASE-1.md
docs/phases/PHASE-2.md
```

Each phase document should define:

- Phase goal.
- Explicit task list.
- Acceptance criteria.
- Files or areas likely affected.
- Out-of-scope items.
- Required validation.
- Dependencies between tasks.

When the user asks to work from a phase document, the agent must:

1. Read this `AGENTS.md`.
2. Read the relevant files in `docs/agents`.
3. Read the requested phase document.
4. Identify the exact task or tasks requested by the user.
5. Produce a plan before editing.
6. Respect the task boundary from the phase document.

If the user asks to implement only one phase task, implement only that task.
Do not start later tasks, refactor unrelated code, or adjust adjacent layers
unless the selected task cannot work without that change.

If a previous task is already implemented, do not rework it unless the current
task explicitly requires a correction.

## Scope Rules

Agents must:

- Keep changes within the smallest reasonable scope.
- Search for existing patterns before creating new structure.
- Avoid mixing frontend and backend changes unless clearly required.
- Avoid changing architecture decisions without documenting the decision.
- Avoid installing dependencies unless explicitly requested.
- Avoid creating configuration files outside the task scope.
- Preserve the MVP boundaries defined in `docs/agents/AGENTS.md`.

## Implementation Rules

For TypeScript work, always follow `docs/agents/TYPES.md`.

For backend work, always follow the dependency direction:

```txt
Controller
  -> Service
    -> Repository
      -> TypeORM
        -> PostgreSQL
```

For frontend work, always follow the dependency direction:

```txt
Page
  -> Composable
    -> Service
      -> Axios API client
        -> NestJS API

Component
  -> Emits intent upward
```

For database work, persistent schema changes require migrations.

## Validation

Before finishing implementation, agents should run the relevant validation
commands when they exist in the project.

If validation commands are not available yet, state that clearly in the final
response and explain what was checked manually.
