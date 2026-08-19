# meshchopper-stlfixer

*doctor meshchopper* — repairs STL files that a slicer refuses to accept — *"non-manifold edges"*, *"open edges"*,
inside-out normals — without leaving the terminal. Pure TypeScript, zero dependencies, same
behaviour on macOS, Linux and Windows.

```bash
npx meshchopper-stlfixer cat.stl        # writes cat-fixed.stl next to the original
```

The original file is never touched unless you ask for `--in-place`.

## What it fixes

| Slicer complains | What is actually wrong | What `meshchopper-stlfixer` does |
|---|---|---|
| open edges / not watertight | the exporter wrote the same corner twice with different float32 values | welds vertices within a scale-derived tolerance |
| open edges that survive welding | genuine holes in the surface | traces the boundary loops and triangulates them |
| non-manifold edges | an edge shared by 3+ triangles: leftover inner walls, doubled faces | drops the duplicates, then cuts the surplus triangles and re-seals |
| flipped / inverted normals | inconsistent triangle winding, or a shell built inside out | unifies winding per shell, flips shells with negative volume |
| noise, stray specks | zero-area triangles, bowtie vertices, tiny detached shells | removes / splits them (shell removal is opt-in) |

Not a mesh error: Bambu Studio's **"floating regions"** warning is about geometry that has
nothing under it while printing. Re-orient the model or turn on supports — no file repair
will make it go away.

No terminal? The same engine runs at
**[nitrobin.github.io/meshchopper-stlfixer](https://nitrobin.github.io/meshchopper-stlfixer/)** —
drop a file in, get a repaired one back, and open a 3D preview to see before and after side
by side with the defects highlighted. It runs in a Web Worker in your own browser; nothing is
uploaded.

## Install

```bash
npm install -g meshchopper-stlfixer   # then: meshchopper-stlfixer model.stl
npx meshchopper-stlfixer model.stl    # or without installing
```

Needs Node.js 20.11+.

## Usage

```
meshchopper-stlfixer <file.stl|dir> [more...] [options]

  -o, --out <path>        Output file (single input) or output directory
      --in-place          Overwrite the input; keeps a .bak copy unless --no-backup
      --suffix <text>     Suffix for the default output name       (default "-fixed")
  -c, --check             Report only, write nothing; exit 1 if a file is broken
  -r, --recursive         Descend into subdirectories when given a directory
      --ascii             Write ASCII STL instead of binary
      --tolerance <mm>    Vertex merge distance; "auto" = bbox diagonal * 1e-6
      --no-fill-holes     Leave holes open
      --max-hole-edges <n>  Skip holes with more boundary edges     (default 1000)
      --keep-largest      Keep only the biggest shell
      --drop-tiny-shells <ratio>  Drop shells below ratio * biggest shell volume
      --no-flip-inverted  Do not turn inside-out shells right side out
      --manifold <mode>   Extra pass through manifold3d: off (default), rebuild
                          or union — see below
      --json              Machine-readable report on stdout
  -q, --quiet             Only print problems
```

Exit codes: `0` repaired (or already clean), `1` still broken / `--check` found problems,
`2` bad usage.

```console
$ meshchopper-stlfixer cat.stl
cat.stl
  68067 triangles, 33 shell(s), 86.40 x 19.46 x 14.92 mm
  before: 47 open edges, 26 non-manifold edges, 2 flipped edges, 2 bowtie vertices
  fixed:  merged 170154 duplicate vertices, dropped 6 degenerate triangles,
          cut 22 non-manifold triangles, filled 3 holes (+3 triangles)
  after:  clean, watertight
  volume: 8037.97 -> 8037.83 mm3, 68042 triangles
  wrote:  cat-fixed.stl
```

Batch a folder, check in CI:

```bash
meshchopper-stlfixer models/ -r --in-place   # repair everything, .bak next to each file
meshchopper-stlfixer models/ -r --check      # exits 1 if anything needs repair
```

## The manifold3d pass

`--manifold rebuild` hands the repaired mesh to the [manifold3d](https://github.com/elalish/manifold)
kernel and takes back what it emits. Manifold accepts nothing that is not a valid solid, so the
pass both proves the result and tidies leftovers; shell count and volume come back unchanged.

`--manifold union` additionally unions the solid with itself, which re-cuts self-intersections —
the same class of repair as the Windows *Fix model* button. It also welds together parts that
interpenetrate, so a print-in-place hinge comes out as one fused lump. Measured on a
68k-triangle articulated model:

| | triangles | volume | shells |
|---|---|---|---|
| plain repair | 68 042 | 8037.83 mm³ | 33 |
| `--manifold rebuild` | 68 040 | 8037.86 mm³ | 33 |
| `--manifold union` | 78 042 | 7746.14 mm³ | 20 |

`manifold-3d` is an **optional** dependency: a normal install pulls it in, `npm install
--omit=optional` does not, and the flag then explains what to install. Nothing else in the
package has dependencies, and importing the library does not load it.

```ts
import { rebuildWithManifold } from 'meshchopper-stlfixer/manifold';
```

## Library

The core is plain computation with no Node APIs, so it also runs in a browser.

```ts
import { readFile, writeFile } from 'node:fs/promises';
import { parseStl, repairSoup, writeBinaryStl, analyze } from 'meshchopper-stlfixer';

const result = repairSoup(parseStl(await readFile('cat.stl')));
console.log(result.before.openEdges, '->', result.after.openEdges);
await writeFile('cat-fixed.stl', writeBinaryStl(result.mesh));
```

| Export | Purpose |
|---|---|
| `parseStl`, `writeBinaryStl`, `writeAsciiStl`, `isBinaryStl` | file format |
| `weldVertices`, `analyze`, `isBroken` | topology inspection |
| `findDefects` | where the defects are — edges, vertices and faces, for highlighting |
| `repairStl`, `repairSoup`, `inspectSoup` | the whole pipeline |
| `removeDegenerate`, `removeDuplicateFaces`, `cutNonManifoldEdges`, `splitBowtieVertices`, `unifyWinding`, `fillHoles`, `flipInvertedShells`, `dropShells` | individual steps |
| `rebuildWithManifold` (from `meshchopper-stlfixer/manifold`) | the optional manifold3d pass |

## How the repair runs

```
weld vertices            merge corners closer than the tolerance
drop degenerate          zero-area and repeated-corner triangles
drop duplicates          triangles covering the same three vertices
cut non-manifold edges   keep the best opposing pair, delete the surplus
split bowtie vertices    give each surface fan its own copy of the vertex
unify winding            flood fill so neighbours agree on direction
fill holes               ear clipping for small loops, centre fan for big ones
drop tiny shells         opt-in
flip inverted shells     negative-volume shells are turned outwards, unless they
                         are enclosed by another shell — that is a cavity, and
                         its boundary faces inwards on purpose
```

The steps after welding repeat until the mesh stops changing, capped at three passes.
Tolerance defaults to `bounding box diagonal * 1e-6` — STL stores float32, so coordinates
carry roughly that much noise; pass `--tolerance` if a model needs a coarser merge.

Sealing a slit-shaped hole requires a zero-area triangle. `meshchopper-stlfixer` keeps it: watertight
beats tidy, and slicers do not mind.

## Limits

Topological repair only. It will not fix self-intersecting geometry, wrong wall thickness,
or a model that is simply modelled wrong — for that, run a boolean/remesh tool. Very large
holes (>1000 boundary edges) are skipped unless you raise `--max-hole-edges`.

## Development

```bash
npm install
npm run build      # tsc -> dist/
npm test           # builds, then node --test
npm run typecheck
```

MIT
