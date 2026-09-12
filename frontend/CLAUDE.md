
## Toolchain (binding)
- Package manager is pnpm. Install with `pnpm add --save-exact`. Never hand-edit package.json.
- Node >=22. Vite 7 with `@tailwindcss/vite` — never the PostCSS plugin.
- Router is TanStack Router with the Vite plugin and file-based routes. `routeTree.gen.ts`
  is generated, never hand-edited, and is gitignored.
