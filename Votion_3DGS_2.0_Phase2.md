# Votion 3DGS 2.0 — Phase 2: Pano → first splat

**Depends on:** Phase 1 `outputs/<scene>/pano.png` (2D Images, 360 Images, or text) + MoGe weights  
**Unlocks:** Phase 3 (WAN / HiRes / multi-rail)  
**Code home:** `D:\Votion3DGS\`  
**Graph source:** [`docs/260825_MICKMUMPITZ_3DGS-Dataset-Creator_1-0_SMPL.json`](260825_MICKMUMPITZ_3DGS-Dataset-Creator_1-0_SMPL.json) (same file as `d:\AI_3DGS\…_SMPL.json`)  
**Nav:** [Index](Votion_3DGS_2.0_Index.md) · [P0](Votion_3DGS_2.0_Phase0.md) · [P1](Votion_3DGS_2.0_Phase1.md) · P2 · [P3](Votion_3DGS_2.0_Phase3.md) · [P4](Votion_3DGS_2.0_Phase4.md)

---

## Goal

Prove the **splat path without WAN**: take the Phase 1 ERP, run **Compute geometry**, draw **one** camera rail on the MoGe overlay, preview the mesh flight, run SphereSfM, train Gaussians, write `splat.ply`.

This is the first Unreal-validating slice. Phase 1 already created or loaded the pano. Phase 3 later *fills holes* with WAN and adds three more rails. Phase 2 may use a **fixture control video** (mesh reprojection only) if WAN weights are not downloaded yet — that video will have black holes. SfM/train still must run so the plumbing is real.

If Phase 1 **2D Images** is unavailable, Phase 2 still runs on **360 Images** or **text** (or a fixture 360). Ostris is READY as of 2026-09-03.

---

## Locked facts

- Input: **`outputs/<scene>/pano.png` from Phase 1**. Do not re-implement Krea here.
- **Compute geometry** is a real product button, not a hidden worker. SplatKit display name: `Plot Camera - Compute Geometry (internal)` (`SplatKit_CameraPlotSceneReference`). It is depth-only: MoGe → sparse cloud + dense **FLOOR** (top-down X/Z) and **SIDE** (Z/Y) orthos. No WAN, no mesh fly-through yet. Overlay point budget in SplatKit: **4000** (min 500, max 40000).
- **Plot Camera** is the second step (`SplatKit_CameraPlotRenderControlGeo`, display name **Plot Camera**). It splines the rail and renders `control_video` + `control_mask` + `rail_json`.
- Look modes — copy SplatKit `INPUT_TYPES`, not the older draft names. There is **no** dropdown called Height. Height is the **Y** of an anchor.

  | Widget value | Video name | What the camera does |
  |---|---|---|
  | `look_forward` | Look Forward | +Z follows the path tangent (cinematic). SplatKit node default. |
  | `look_at_target` | (orange “look” marker) | Every frame aims at **one** world point. SMPL **CAMERA PLOT 1** (node 27). |
  | `per_point_look` | Per Point Look | Each anchor has its own look target (yellow points). SMPL CAMERA PLOT 2–4 and Add-path. |

  Legacy `fixed_forward` still renders if an old graph has it. Do not put it in the Votion dropdown.
- **P2 ships one rail only.** Default that rail from SMPL node **27** (CAMERA PLOT 1): `look_at_target`, 81 frames, `moge_level` **9**. Do not default four rails here.
- **Origin star is locked at `(0,0,0)`.** SplatKit editor: the start anchor cannot be dragged or deleted. Frame: **+Z** into the pano, **+X** right, **+Y** up. Video: every drone clip starts here so Phase 3 can reproject the 8K pano.
- **Viewport is interactive (locked 2026-08-31 / layout 2026-09-03):** FLOOR and SIDE are the editor and sit **side by side**. Preview flight sits **under both**, spanning the full width. Drag red cameras **1+**; star **0** cannot move. Cyan look arrows; in `look_at_target` drag the **orange look-at**. Dragging a look arrow on `look_forward` **switches that rail to `per_point_look`**. Dummy backdrops: `geo-floor-top.png` / `geo-side-elev.png` / `geo-preview-overall.png`. Chrome: V1 left-rail + right viewport, P0 names as stage chips. Rail gizmos **must be visible** on the plates.
- **Mesh flight preview:** the pane **under** the FLOOR | SIDE pair. **Play lives on that pane** — no Preview button on the left rail (locked 2026-08-31). Play the control video there (black holes OK) before Confirm.
- **FLOOR / SIDE implementation (locked 2026-09-03):** plates + gizmos are **QPainter** on one widget. Do not ship QWebEngine. vispy is not the Geometry editor.
- Reconstruction: SphereSfM → COLMAP `images/` + `sparse/0` (ordinary `SIMPLE_PINHOLE` cube faces). Viewport after Reconstruct is an **orbit of the sparse cloud** (`points3D.bin` + camera centers), not cube-face stills. Not WorldFM `transforms.json`.
- **Tab persistence (locked 2026-09-03):** switching stage chips restores generated views (Panorama ERP, Geometry Preview-flight still + Confirm, Reconstruct sparse, Splat live raster). Do not reset to empty / green warp.
- Trainer: `engine/splat/` over the vendored **LiteGS** backend (`vendor/litegs`, Inria licence, CUDA built at Setup — Index #48). If the LiteGS spike failed, P2 still **writes COLMAP** and shows “Open folder”. The V1 `train_splat_live.py` / gsplat path is retired (2026-09-07).
- **Density controller (locked 2026-09-01, amended 2026-09-07):** user picks **LiteGS** or **MCMC Compact** on the Splat page. Default **LiteGS**. Both write full-SH `splat.ply` at the editable **Gaussian budget** (default 3M). LiteGS → `DensityControllerTamingGS` with the budget as `target_primitives`. MCMC Compact → Jung & Hong 2025 section 3.1 (Metropolis-Hastings adaptive split threshold + stochastic importance prune to the budget; relighting parts out of scope). Continue keeps the checkpoint’s controller (with optimizer and scheduler state); switching needs Retrain. ADC is not a third choice. Old gsplat params-only checkpoints show “Retrain required”.
- **Splat viewport (locked 2026-09-05, transport 2026-09-07):** live **rasterized 3DGS** (ellipses as a surface), not a point cloud and not stats-only. Frames arrive over **shared memory** (`votion_splat_<pid>`, 2-slot RGB8 ring, Qt polls at 60 Hz, PNG fallback); the camera goes to the worker over stdin (`VIEW`). LMB look, RMB pan, wheel dolly; zoom is not product-capped. Reset / default = rails **Star**. Max steps = any integer ≥ 1 (no product cap). **Pause / Resume** in-process; **Stop** on the Splat rail and job bar kills. Per-Gaussian opacity, scale, rotation, SH — MCMC Compact shares this. HUD: state, step / epoch, loss EMA, PSNR (hold-out), Gaussians / budget, it/s, viewport fps, VRAM; loss / PSNR sparkline; **training cameras** list (jump + **GT compare** render | ground truth). Elongated mixed-angle ellipses are the look; needle takeover / glowing whites / crushed blacks are bugs.
- Vendor SplatKit `core/` + `shim/` (MIT). Rasterizer is the torch/triton shim — **not** nvdiffrast. Do not use Matrix-3D PanoLRM.

---

## What this phase takes from the SMPL graph

The full graph is four CAMERA groups + WAN INPAINT + HiRes + dual-res SphereSfM. **P2 implements only SETUP + one Plot Camera + SphereSfM (single trajectory, no HiRes).**

| Graph group / node | P2? | Notes |
|---|---|---|
| SETUP · `SplatKit_DatasetProject` id 41 | Yes | Scene folder analog. Widgets `['120_studio-garden-hires', False]`. Use Votion scene name. Do not invent a name for the bool until `INPUT_TYPES` at the vendor pin. |
| CAMERA PLOT 1 · node **27** | Yes | The one P2 rail. |
| CAMERA PLOT 2–4, ADD TO DATASET | No | Phase 3. |
| WAN INPAINT, HiRes, Dual-Res SfM | No | Phase 3. Optional WAN in P2 **only if** 14B weights are READY — still one rail, no HiRes. |

---

## Pipeline for this phase

```
P1 pano.png
  → Compute geometry (CameraPlotSceneReference)
        FLOOR X→Z + SIDE Z→Y + star at origin
  → User places 1 rail (Plot Camera) → Preview flight → Confirm
  → Render control_video + control_mask + rail_json
  → (Optional) WAN hole-fill if 14B READY; else keep control video
  → SphereSfM (single trajectory; dual-res HiRes is Phase 3)
  → engine.workers.splat (LiteGS raster; LiteGS or MCMC Compact controller) on COLMAP pinholes
  → outputs/<scene>/splat.ply (full SH) · splat_compact.ply (optional)
```

---

## UI — Geometry page

PySide6 page already stubbed in P0 as **Geometry**. Dummy: [Phase 2 HTML](Votion_3DGS_2.0_Phase2.html#geo). Two states. Do not let the user edit rails until geometry exists.

Chrome: same P0 window. Stage chip **Geometry**. Left rail = compute + rail fields. Right viewport = **FLOOR | SIDE side by side**, **Preview flight** under both (full width). Job strip under the chips. Log + Geometry Help drawers.

SplatKit Plot Camera (`camera_plot_geo.js`) is the chrome to port. The HTML dummy (`docs/rail-dummy.js`) is the interaction spec:

| Gizmo | Look | Behavior |
|-------|------|----------|
| Cyan **★ 0** | Pano origin `(0,0,0)` | **Not draggable**, not deletable |
| Red circles **1, 2, 3** | Later anchors | **Drag** on FLOOR (X/Z) or SIDE (Z/Y); the other pane tracks X/Z |
| Cyan **look arrows** | Camera heading | Follow the look target |
| Orange **look-at** | `look_at_target` | **Drag** this one point; every arrow aims at it |
| **geo** / **reset view** | Overlay / pan-zoom | Buttons on each pane (SplatKit) |

`look_forward` + drag a look arrow **switches that rail to `per_point_look`**. Yellow per-knot looks appear only in `per_point_look`.

### Backdrop plates (do not substitute random stock)

Locked dummy media (user-supplied street):

| Pane | File | What it is |
|------|------|------------|
| **FLOOR X → Z ↑** | `docs/media/geo-floor-top.png` | Orthographic **top-down** of the street |
| **SIDE Z → Y ↑** | `docs/media/geo-side-elev.png` | Orthographic **elevation** of the facades |
| **Preview flight** | `docs/media/geo-preview-overall.png` | Wide **overall** street view (Play on this pane, not the rail) |

Product: prefer dense MoGe orthos of *this scene’s* pano; the three files above are the dummy stand-in so the editor is readable. Do not use unrelated MoGe/Matrix-3D stills as the Geometry backdrop.

### State A — before Compute geometry

[Phase 2 HTML §02](Votion_3DGS_2.0_Phase2.html#geo). FLOOR / SIDE / Preview empty (no plates, no gizmos). **Compute geometry** enabled. Suggest paths dim (P3). Confirm dim. Missing `pano.png` → run Phase 1 first. No second file picker.

### State B — after Compute geometry

[Phase 2 HTML §03](Votion_3DGS_2.0_Phase2.html#plot). Plates + gizmos on. Left rail:

| Control | P2 default (SMPL node 27) | Source |
|---|---|---|
| Look mode | `look_at_target` | JSON widget |
| Frames (`length`) | **81** (min 9, max 257, step 4). Must match WAN length later. | SplatKit tooltip |
| `moge_level` | **9** (graph). Node default is 6. | JSON `9` |
| Look-at | `-0.108, 0.073, 1.953` (updates when the orange handle moves in the dummy) | JSON |
| Anchors | 4 lines of **xyz only** (see below) | JSON |
| Preview flight | **Play** on the third pane (`control_video`, black holes OK) | Video 00:11:25 |
| Confirm | Unlocks Reconstruct | V1 Preview gate |

There is **no Preview button on the left rail**.

Knots: the multiline **anchors** widget is the source of truth. The editor only writes that text. If a 3D widget fails to load, the text still works (SplatKit README).

Parser (copy `core` / `_camplot_parse_anchors_ext`, do not invent):

- 3 numbers `x, y, z` — position only
- 6 numbers `x, y, z, tx, ty, tz` — position + per-anchor look target
- JSON `[[x,y,z],…]` also accepted
- At least **2** points. Blank lines and `#` comments ignored.
- Catmull-Rom through every anchor. 2 points = a straight line.

**P2 default knots (node 27, xyz only):**

```
0.000, 0.000, 0.000
0.199, 0.219, 0.488
-0.184, -0.093, 0.920
-0.065, 0.039, 1.404
```

First line is the star. This is a short push along +Z while aiming at the look-at point — a dolly toward a hero (the video’s pond is the same idea).

**Preview flight** renders Plot Camera (mesh + validity mask) **without** WAN. Then Confirm.

The HTML also shows the SplatKit Plot Camera screenshot (`docs/media/ref-splatkit-plot-camera.png`) under the dummy as the chrome to port.

### Reconstruct page

Dummy: [Phase 2 HTML §04](Votion_3DGS_2.0_Phase2.html#recon). Left: **Reconstruct**, `num_images` / `num_points`. Viewport: interactive COLMAP **sparse cloud** (points + cyan cameras; drag orbit, wheel zoom). Not a cube-face still. Help = SphereSfM / COLMAP pinholes (not WorldFM `transforms.json`).

### Splat page

Dummy: same HTML, second window (Postshot-style desk, 2026-09-07). Left rail: **LiteGS | MCMC Compact** chips (default LiteGS), max steps **any integer ≥ 1** (box default 10000, no product cap), **Gaussian budget** editable (default 3,000,000), **Resolution scale** 1 / 0.5 / 0.25, SH degree 3, **Hold-out eval** toggle, Train / **Pause** / **Stop** / Continue / Retrain, Export `splat.ply` / **Export compact** (optional drop `f_rest`), Open COLMAP folder, licence line. Viewport: **live rasterized 3DGS** over shared memory, HUD (state badge TRAINING / PAUSED / IDLE, step and epoch, loss EMA, PSNR, Gaussians / budget, it/s, viewport fps, VRAM), loss / PSNR sparkline under the plate. Right: **Training cameras** list grouped by rail (hold-out marked); click jumps the viewport there; **GT compare** splits render | ground truth; reset returns to the Star. Camera: LMB look, RMB pan, wheel dolly (uncapped). Log drawer shows controller events (densify / prune counts, `eps_curr`, MH acceptance). Help = controller + Pause / Stop + Star + full-SH `splat.ply` + LiteGS licence, Brush fallback if the LiteGS spike failed.

---

## Code to copy from V1 (copy, then adapt — do not import across WSL paths)

| V1 file | P2 use |
|---------|--------|
| `ui/job_control.py` | Cancel flag (already sketched in P0) |
| `ui/camera_presets.py` | Rail **templates** only. Map lookaround / orbit / dolly onto SplatKit archetypes later in P3; P2 only needs the node-27 default + free edit. |
| `ui/camera_path_viz.py` | FLOOR + SIDE + star + LOOK rays. Product editor is **QPainter** on one widget (locked 2026-09-03). Do not ship QWebEngine. Do not stack vispy Line/Markers over Image. Do not embed Comfy `camera_plot_geo.js`. |
| `tools/train_splat_live.py` | **Retired 2026-09-07.** Only the ideas survive (COLMAP `cameras.bin` / `images.bin` loader, live raster viewport, 100-step checkpoint, `splat.ply`). Product trainer is `engine/splat/` over LiteGS: `backend/litegs_backend.py`, `trainer.py`, `controllers/litegs_default.py`, `controllers/mcmc_compact.py`, `viewport.py`, `ply_export.py`. |
| `ui/theme.css` | Qt stylesheet tokens |

Do **not** copy `worldfm/`, WorldFM `pipeline_runner.py`, or WSL scripts.

---

## Vendor

From [ComfyUI-SplatKit](https://github.com/mickmumpitz/ComfyUI-SplatKit) (clone into `vendor/splatkit` at a **pinned git SHA**, record it in `vendor/splatkit.sha`):

- `core/` — MoGe mesh, camera plot render, SphereSfM wrappers
- `shim/` — rasterizer
- `bin/` download logic for `colmap_sphere.exe` (Windows). Copy their SHA-256 check; **do not invent a hash**.

MoGe weights: `Ruicheng/moge-vitl` `model.pt` via the P0 downloader (P2 subset).

From [MooreThreads/LiteGS](https://github.com/MooreThreads/LiteGS) (2026-09-07; `vendor/litegs` at the SHA in `vendor/litegs.sha`, `LICENSE.md` copied next to it): `litegs/` Python package (`io_manager`, `scene`, `render`, `training`, `utils`) and the three CUDA sources `submodules/simple-knn`, `submodules/fused-ssim`, `submodules/gaussian_raster` (`litegs_fused`). Inria Gaussian-Splatting licence → build locally at Setup (`tools/build_litegs.py` through `engine/cuda_jit.prepare`, pip route then CMake fallback), never ship binaries, licence line in Help. Spike result `litegs raster 1-step: OK` in `docs/env_report.txt` gates Train.

---

## Workers (subprocess)

1. `engine.workers.moge` — Compute geometry. Read P1 `pano.png`, write scene-ref cloud + FLOOR/SIDE caches (`pointcloud.ply` / ortho PNGs).  
2. `engine.workers.camplot` — Preview / Confirm. `rail_json`, `control_video`, `control_mask`.  
3. `engine.workers.sfm` — `colmap_sphere`  
4. `engine.workers.splat` — `engine.splat.trainer.SplatTrainer` (modes `train` / `continue` / `retrain` / `view` / `export` / `export_compact` / `export_compact_dc`; args `--strategy litegs|mcmc_compact --max-steps --budget --res-scale --holdout`). Stdout `SPLAT\t…` telemetry (step, loss, psnr, gaussians, its, vram, fps, state, ctl, ckpt, shm, cameras); stdin `VIEW` / `PAUSE` / `RESUME` / `STOP`.  

Unload GPU between workers (process exit). Qt never holds WAN/MoGe.

---

## Outputs (`D:\Votion3DGS\outputs\<scene>\`)

```
pano.png                     from Phase 1
prompt.txt                   from Phase 1 (may be empty until P3)
moge/                        scene-ref cloud + FLOOR/SIDE orthos
rails/rail_00.json
control/control_video.mp4
control/control_mask.mp4     (or PNG sequence — match SplatKit)
colmap/images/
colmap/sparse/0/
checkpoints/splat_latest.pt  LiteGS format votion-litegs-1: params + Adam + scheduler + controller state
checkpoints/splat_meta.json  controller, step, epoch, gaussians, budget, psnr, psnr_eval, done
_work/splat_view.json        persisted viewport camera (written at worker exit)
_work/splat_preview.png      PNG fallback frame (shared memory is the live path)
splat.ply                    full SH (degree 3)
splat_compact.ply            optional: opacity < 0.005 pruned, f_rest optional
```

---

## Acceptance tests

- [ ] Missing `pano.png` → clear error (run Phase 1 first). Do not open a second file picker that bypasses P1 modes.
- [ ] **Compute geometry** disabled until pano exists; rail editor disabled until geometry exists.
- [ ] After compute: FLOOR and SIDE **side by side** with gizmos visible (path, star 0, red 1–3, look arrows); origin star at `(0,0,0)` and not draggable; 2+ knots do not crash.
- [ ] Preview flight sits **under both** plates. Mesh-only flight preview plays **before** Confirm (black holes expected).
- [ ] Switching away from Geometry and back keeps the last Preview-flight frame and Confirm.
- [ ] `colmap/sparse/0` exists after Reconstruct. Viewport shows the sparse cloud (not cube-face stills).
- [x] LiteGS spike line `litegs raster 1-step: OK` in `docs/env_report.txt`; Train gated on it (`litegs_spike_ok`). *(2026-09-07)*
- [x] If the LiteGS spike passed: `splat.ply` written with the selected controller (LiteGS default); Continue works on the same scene name **and the same controller**, resuming the 100-step checkpoint **with optimizer state**. *(alpine_01 MCMC Compact 3000 → 3300 continue, 2026-09-07)*
- [x] Switching LiteGS ↔ MCMC Compact disables Continue until Retrain (“Retrain required: checkpoint is MCMC Compact”). Old gsplat params-only checkpoints show “Retrain required”.
- [x] Splat viewport is a live raster over shared memory (not a point cloud). Reset is the rails Star. Max steps accepts any integer ≥ 1. Stop kills the train job; Pause / Resume are in-process.
- [x] Viewport: camera change → new frame under 50 ms when idle (median 33 ms measured); ≥ 20 fps orbit during training (32 fps, capped at 30); training it/s stays within ~20 % while orbiting (182 vs ~200–240 it/s).
- [x] MCMC Compact uses the same per-Gaussian raster as LiteGS (opacity, anisotropic scale, rotation, SH).
- [x] `alpine_01` Retrain with LiteGS to 10k steps: hold-out PSNR reported (15.6 dB), Gaussians ≤ budget (2.26M / 3M), time recorded (~3.6 min). Viewport frames: no hairline needles taking over; tone histogram vs GT shows 0 % crushed (< 8) and 0 % blown (> 247) pixels, mean within 5 levels (blur lowers contrast, it does not clip). Low absolute PSNR traced to WAN + SphereSfM view inconsistency, not the trainer (single view 33.8 dB; Index Measured table).
- [x] Same run with MCMC Compact to 10k: 510,720 Gaussians, 77 % below LiteGS at the same 3M budget; hold-out PSNR 15.7 dB; 94 s. Split ratio held at 3.4–6.8 % per 100-step cycle by the MH threshold (acceptance 0.43–0.44). *(2026-09-07; the first 24-cycle schedule stalled at 40k because sub-chunk appends were dropped — fixed, appends / prunes are chunk-exact)*
- [x] `splat.ply` carries full SH (45 `f_rest`); compact export writes `splat_compact.ply` (DC-only when asked). Header check 2026-09-07.
- [ ] `splat.ply` and `splat_compact.ply` load in Brush (manual).
- [x] If the LiteGS spike failed: UI says so; COLMAP folder still valid for Brush.
- [x] `app.main` never imports torch (offscreen check 2026-09-07).
- [ ] Unreal import of `splat.ply` is a **manual** check via **MLSLabsRenderer**. Document pass/fail in `outputs/<scene>/unreal_check.txt` — do not claim Unreal success in code.

---

## Risks

- Single-rail mesh-only video has huge black disocclusions → weak SfM. Acceptable for plumbing; Quality needs Phase 3 WAN.
- OpenCV vs OpenGL: V1 Patch1.1 warned mushy splats if this is wrong. **Follow SplatKit export**, do not reuse WorldFM OpenCV→OpenGL conversion blindly.
- `colmap_sphere.exe` Turing+ GPU matching; 3090 is Turing-or-newer — OK per SplatKit README.
- Graph Camera Plot `moge_level` is **9**; HiRes Composite in the same graph uses **6**. P2 copies 9 for Plot Camera. Do not “fix” HiRes in P2.

---

## Explicitly do not do in P2

- No Krea generation (Phase 1).
- No 4-rail default (Phase 3).
- No HiRes Composite 8K (Phase 3).
- No WorldFM frames.
- Do not name a look mode `forward_look` or `Height`. The widget is `look_forward`. Height is Y.
- Do not treat the integer **9** as fps. It is `moge_level` (SplatKit `INPUT_TYPES`).
