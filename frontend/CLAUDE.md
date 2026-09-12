
## Toolchain (binding)
- Package manager is pnpm. Install with `pnpm add --save-exact`. Never hand-edit package.json.
- Node >=22. Vite 7 with `@tailwindcss/vite` — never the PostCSS plugin.
- Router is TanStack Router with the Vite plugin and file-based routes. `routeTree.gen.ts`
  is generated, never hand-edited, and is gitignored.

## Git (binding)
- Read-only git only: `status`, `branch`, `diff`, `log`. Nothing else.
- NEVER run: commit, add, push, pull, fetch, checkout, switch, merge, rebase, stash,
  reset, revert, tag, or any command that mutates the repo or remote.
- Do not stage files. Do not create branches.
- After finishing a task, output a plain list of suggested commits: the files in each
  group and a one-line Conventional Commit message. The human runs them.
- Commit granularity: one logical change per commit. A primitive, its types, its styles
  and its tests are four separate commits.
