# Utilities monorepo

**[Repair an STL in your browser →](https://nitrobin.github.io/meshchopper-stlfixer/)**

npm workspaces. Each utility lives in its own package under `packages/`.

| Package | What it does |
|---|---|
| [`packages/meshchopper-stlfixer`](packages/meshchopper-stlfixer) | Repairs broken STL meshes (non-manifold / open edges, holes, flipped normals) — CLI `meshchopper-stlfixer` + library |
| [`packages/web`](packages/web) | Browser front end for the same engine; builds into [`docs/`](docs), which GitHub Pages serves |

```bash
npm install          # install all workspaces
npm run build        # build all (library first, then the page into docs/)
npm test             # test all
```

## The web page

Live at **https://nitrobin.github.io/meshchopper-stlfixer/**. `docs/` is committed build
output and Pages serves it from branch `main`, folder `/docs` — no CI step, a push deploys.
To work on it:

```bash
npm run build -w @meshchopper-stlfixer/web   # one-off build
npm run dev   -w @meshchopper-stlfixer/web   # rebuild on change
npx serve docs                               # any static server works
```

An optional **manifold3d pass** sits in the options, loaded on demand (~0.5 MB of WASM):
`rebuild` runs the repaired mesh through the kernel, which accepts nothing that is not a valid
solid — shell count and volume come back unchanged — while `union` also re-cuts
self-intersections the way the Windows "Fix model" button does, at the price of welding
overlapping parts together. The CLI has the same thing behind `--manifold <mode>`.

The page speaks 13 languages, picked from the browser and switchable in the header:
English, Russian, German, French, Spanish, Italian, Portuguese, Polish, Czech, Turkish,
Chinese, Japanese, Korean. Every string lives in `packages/web/src/i18n/`; `en.ts` is the
source of truth and the other files are typed against it, so `npm run typecheck` fails on a
missing key. Adding a language is one file plus one line in `i18n/index.ts`.

The repair runs in a Web Worker inside the visitor's browser — no upload, no backend. Each
result can open a **3D preview**: before and after side by side on one shared camera, with a
wireframe overlay, defect highlighting and a "next problem" walk. three.js is a dynamic
import, so it only downloads for people who open a preview.
