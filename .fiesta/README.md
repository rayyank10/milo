# `.fiesta/` — Milo's harness contract

This folder is how Milo drives the **fiesta** automation harness as a tenant. The
harness reads these files at the pinned commit and holds no Milo-specific
knowledge of its own — everything Milo-specific lives here, in Milo's repo.

| File | What it declares |
|------|------------------|
| `manifest.yaml` | Milo's identity (`org`/`product`/`repo`), where ownership comes from, and which shared mental models the planner should use. |
| `gates.yaml` | Milo's verification gates. When present, these **replace** the harness's built-in default gate set. |
| `preview.yaml` | How to turn a branch + page into a live preview URL, for the visual gate. |
| `workflows/*.yaml` | Milo workflows, composed from the harness's capability handlers. |
| `scripts/` | Helper scripts a gate invokes (e.g. the block-structure check). |

## Gates

`gates.yaml` declares four gates, each bound to a platform template:

- **lint** — `npx eslint {changed_files} --max-warnings 0`
- **unit-tests** — `npx web-test-runner {test_files} --node-resolve`
- **block-structure** — `node .fiesta/scripts/check-block-structure.mjs {changed_files}`:
  every changed `libs/blocks/<name>/` must contain both `<name>.js` and `<name>.css`.
  This check used to be hardcoded in the harness; declaring it here lets the
  harness stay generic.
- **visual** — captures screenshots of the preview at the given breakpoints and
  routes the evidence to a human for sign-off.

The harness substitutes `{changed_files}` / `{test_files}` with the run's file
list and runs each command in the worktree. A present `gates.yaml` replaces the
default gates, so this set is the complete list Milo runs.

Patch-coverage (Milo's 100% rule) stays enforced by Milo's existing CI (codecov);
it isn't duplicated here because the harness's `coverage` template measures total,
not patch, coverage.

## Preview

`preview.yaml`'s `pin_pattern` substitutes `{branch}` and `{page}`. On Edge
Delivery Services a branch is served at `<branch>--milo--<owner>.aem.page`, so the
visual gate can screenshot a branch's real rendering. Live capture requires the
fork to be connected to AEM Code Sync.

## Mental models

`manifest.yaml`'s `mental_models.use` lists the models Milo selects by id. The
**selection** is Milo's; the model **content** is shared and resolved from the
registry at run time (so the same models are reused across products rather than
copied into each repo).

## Workflows

`workflows/restyle-block.yaml` composes registered capability handlers
(`codegen.generate` → `mock.approval`). The harness namespaces the id to
`milo.restyle-block`.
