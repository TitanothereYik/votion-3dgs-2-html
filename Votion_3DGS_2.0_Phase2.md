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
- **Viewport is interactive (locked 2026-08-31):** FLOOR and SIDE are the editor. Drag red cameras **1+**; star **0** cannot move. Cyan look arrows; in `look_at_target` drag the **orange look-at**. Dragging a look arrow on `look_forward` **switches that rail to `per_point_look`**. Dummy backdrops: `geo-floor-top.png` / `geo-side-elev.png` / `geo-preview-overall.png`. Chrome: V1 left-rail + right viewport, P0 names as stage chips.
- **Mesh flight preview:** a **third pane under FLOOR / SIDE**. **Play lives on that pane** — no Preview button on the left rail (locked 2026-08-31). Play the control video there (black holes OK) before Confirm.
- Reconstruction: SphereSfM → COLMAP `images/` + `sparse/0` (ordinary `SIMPLE_PINHOLE` cube faces). Not WorldFM `transforms.json`.
- Trainer happy path: evolve `Yik Votion WorldFM/tools/train_splat_live.py`. If gsplat failed in P0, P2 still **writes COLMAP** and shows “Open folder”.
- **Train strategy (locked 2026-09-01):** user picks **Splat3** or **MCMC** on the Splat page. Default **Splat3**. Both write `splat.ply` at the ~3M cap. Splat3 → gsplat `DefaultStrategy`. MCMC → gsplat `MCMCStrategy`. Continue keeps the checkpoint’s strategy; switching needs Retrain. ADC is not a third choice.
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
  → train_splat_live on COLMAP pinholes (Splat3 or MCMC)
  → outputs/<scene>/splat.ply
```

---

## UI — Geometry page

PySide6 page already stubbed in P0 as **Geometry**. Dummy: [Phase 2 HTML](Votion_3DGS_2.0_Phase2.html#geo). Two states. Do not let the user edit rails until geometry exists.

Chrome: same P0 window. Stage chip **Geometry**. Left rail = compute + rail fields. Right viewport = FLOOR | SIDE stacked over **Preview flight**. Log + Geometry Help drawers.

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

Dummy: [Phase 2 HTML §04](Votion_3DGS_2.0_Phase2.html#recon). Left: **Reconstruct**, `num_images` / `num_points`. Viewport: COLMAP sparse stand-in. Help = SphereSfM / COLMAP pinholes (not WorldFM `transforms.json`).

### Splat page

Dummy: same HTML, second window. **Splat3 | MCMC** chips (default Splat3), max steps **10000**, Gaussian cap **3M**, Train / Continue / Retrain / Export `splat.ply`. Viewport: live train stats (loss / step). Help = strategy choice + splat.ply, Brush fallback if gsplat failed.

---

## Code to copy from V1 (copy, then adapt — do not import across WSL paths)

| V1 file | P2 use |
|---------|--------|
| `ui/job_control.py` | Cancel flag (already sketched in P0) |
| `ui/camera_presets.py` | Rail **templates** only. Map lookaround / orbit / dolly onto SplatKit archetypes later in P3; P2 only needs the node-27 default + free edit. |
| `ui/camera_path_viz.py` | FLOOR + SIDE + star + LOOK rays. Port matplotlib/plotly to **vispy** (locked 2026-09-01). Do not ship QWebEngine. Do not embed Comfy `camera_plot_geo.js`. |
| `tools/train_splat_live.py` | COLMAP cameras.bin/images.bin (or text). Keep live loss, checkpoint, `splat.ply`. Pass Splat3 (`DefaultStrategy`) or MCMC (`MCMCStrategy`). |
| `ui/theme.css` | Qt stylesheet tokens |

Do **not** copy `worldfm/`, WorldFM `pipeline_runner.py`, or WSL scripts.

---

## Vendor

From [ComfyUI-SplatKit](https://github.com/mickmumpitz/ComfyUI-SplatKit) (clone into `vendor/splatkit` at a **pinned git SHA**, record it in `vendor/splatkit.sha`):

- `core/` — MoGe mesh, camera plot render, SphereSfM wrappers
- `shim/` — rasterizer
- `bin/` download logic for `colmap_sphere.exe` (Windows). Copy their SHA-256 check; **do not invent a hash**.

MoGe weights: `Ruicheng/moge-vitl` `model.pt` via the P0 downloader (P2 subset).

---

## Workers (subprocess)

1. `engine.workers.moge` — Compute geometry. Read P1 `pano.png`, write scene-ref cloud + FLOOR/SIDE caches (`pointcloud.ply` / ortho PNGs).  
2. `engine.workers.camplot` — Preview / Confirm. `rail_json`, `control_video`, `control_mask`.  
3. `engine.workers.sfm` — `colmap_sphere`  
4. `engine.workers.splat` — `train_splat_live`  

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
checkpoints/splat_latest.pt
splat.ply
```

---

## Acceptance tests

- [ ] Missing `pano.png` → clear error (run Phase 1 first). Do not open a second file picker that bypasses P1 modes.
- [ ] **Compute geometry** disabled until pano exists; rail editor disabled until geometry exists.
- [ ] After compute: FLOOR and SIDE visible; origin star at `(0,0,0)` and not draggable; 2+ knots do not crash.
- [ ] Mesh-only flight preview plays **before** Confirm (black holes expected).
- [ ] `colmap/sparse/0` exists after Reconstruct.
- [ ] If gsplat spike passed: `splat.ply` written with the selected strategy (Splat3 default); V1-style Continue works on the same scene name **and the same strategy**.
- [ ] Switching Splat3 ↔ MCMC disables Continue until Retrain (or Continue stays on the checkpoint strategy).
- [ ] If gsplat failed: UI says so; COLMAP folder still valid for Brush.
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
