# Votion 3DGS 2.0 — Phase 3: WAN, 8K reprojection, multi-rail SfM

**Depends on:** Phase 2 first-splat plumbing (MoGe + one rail + SfM) and Phase 1 8K `pano.png`  
**Unlocks:** Phase 4 (profiles / installer)  
**Graph source:** [`docs/260825_MICKMUMPITZ_3DGS-Dataset-Creator_1-0_SMPL.json`](260825_MICKMUMPITZ_3DGS-Dataset-Creator_1-0_SMPL.json)  
**Nav:** [Index](Votion_3DGS_2.0_Index.md) · [P0](Votion_3DGS_2.0_Phase0.md) · [P1](Votion_3DGS_2.0_Phase1.md) · [P2](Votion_3DGS_2.0_Phase2.md) · P3 · [P4](Votion_3DGS_2.0_Phase4.md)

---

## Goal

Implement the Mickmumpitz **dataset** graph in native Python: four camera rails (optional 5th), WAN 2.1 I2V 14B fp8 + Matrix-3D pano LoRA + LightX2V, **HiRes Composite in geometry mode** from the Phase 1 8K pano, dual-res SphereSfM.

This is the quality leap. WAN stays **1440×720**. Sharpness is the 8K reprojection trick ([video 00:05:00 / 00:14:55](https://www.youtube.com/watch?v=eJuYBNrD8HI)). There is **no camera count that produces a perfect scan** — see [How many camera sets](#how-many-camera-sets).

---

## Locked facts

- Quality default: WAN 2.1 I2V **14B fp8 720p** + LightX2V on RTX 3090 24GB. Graph also carries a GGUF loader (`wan2.1-i2v-14b-720p-Q4_K_M.gguf`) for ≤16 GB cards — not the 3090 Quality path.
- LoRA **order from JSON `links` 1→2→4** (do not swap):
  1. `UNETLoader` id 4 `wan\Wan2_1-I2V-14B-720P_fp8_e4m3fn.safetensors`
  2. `LoraLoaderModelOnly` id 5 **pano** `pano_video_gen_720p_comfy.safetensors` strength **0.98**
  3. `LoraLoaderModelOnly` id 7 **LightX2V** `lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors` strength **1**
  4. `ModelSamplingSD3` id 8 shift **5**
- WAN clip: `SplatKit_WanI2VMaskedConditioning` widgets **`[1440, 720, 81, 'black', False]`** = width, height, length, `hole_fill`, `invert_mask`. CLIP-Vision: `clip_vision_h.safetensors`, encode **`center`**. VAE: `wan_2.1_vae.safetensors`. Upscaler title “Upscaler for the WAN hole-fill”: `4x-UltraSharp.pth`.
- KSampler widgets `[0, 'fixed', 4, 1, 'euler', 'normal', 1]` but **steps is linked** to PrimitiveInt id 55 title **STEPS** = **8**. Effective: seed 0, steps **8**, cfg 1, `euler`, `normal`, denoise 1. The stored `4` is unused.
- HiRes: `base_mode=geometry`, `output_width=8192`, **frames `0-80/2`** (SMPL widgets + SplatKit node default). The HiRes *doc* recommendation `0-15,16-/8` is a **different** recipe — expose it as an optional preset, do not silently replace the graph default.
- Four Camera Plot nodes (ids **27, 122, 133, 144**) + optional Add-path id **157**. Each rail owns `rail_json` (shared `condition_dir` overwrites).
- Rails **share the pano-center origin** (P2 star). Warn if a rail’s first knot is far from origin (coverage will be mostly Wan).
- Scene prompt **must describe the actual pano** (SplatKit README). Empty `prompt.txt` → block WAN. The graph’s generic CLIP positive is **not** a silent replacement for the scene.
- SageAttention / Triton-Windows: try; if import fails, continue. Video: SageAttention **patch avoids black frames** — if Sage is on, apply that patch (copy from SplatKit / Kijai at vendor pin).
- Do **not** upscale Wan views with SeedVR as the sharpness path. Sharpness is HiRes geometry-mode reprojection.
- Native WAN i2v. Do **not** shell out to hidden ComfyUI.

---

## Map from the SMPL Comfy graph

Source: `docs/260825_MICKMUMPITZ_3DGS-Dataset-Creator_1-0_SMPL.json` (`last_node` 175, `last_link` 474, 77 nodes).

| Group | What it is |
|---|---|
| SETUP | Dataset Project + pano + STEPS=8 |
| LOAD DIFFUSION MODELS | WAN fp8, pano LoRA, LightX2V, CLIP, CLIP-Vision, VAE, upscaler |
| CAMERA PLOT 1–4 / CAMERA 1–4 | One Plot Camera + WAN INPAINT + HiRes per rail |
| ADD TO DATASET / ADD TO DATASET - CAMERA PLOT | Optional 5th rail. HiRes `traj_index` **4**, `auto_name` **True** (the four defaults have `auto_name` False). Add-to-dataset hires width widget **4096** (not 8192) — copy as-is, do not “fix.” |

Per rail:

1. `SplatKit_CameraPlotRenderControlGeo` → `control_video`, `control_mask`, `rail_json`  
   Widgets that matter: anchors, orientation, `length=81`, `moge_level=9`, `moge_ckpt='auto (download)'`, `look_at_target`. Trailing `'' / None / None` in the JSON are leftover serialized empties — ignore.
2. `SplatKit_WanI2VMaskedConditioning` (“Wan Conditioning”) + `KSampler` + `VAEDecode` + `CreateVideo` widgets `[16, 8]` (copy; name `INPUT_TYPES` from Comfy core at implement time).
3. `SplatKit_HiResComposite` — WAN frames + 8K pano + upscaler + `rail_json`. `traj_index` 0…3 (and 4 on the add-path).
4. After the four composites: `SplatKit_SphereSfMDatasetDualRes` id 84 (`exhaustive`, hires width **8192**, set name `my_scene_hires` in the graph — use the **Votion scene name**).
5. Optional: `SplatKit_SphereSfMAddToDatasetDualRes` id 90.

Native port = SplatKit `core/` functions, not Comfy nodes. WAN sampling = Diffusers / thin loader of the same safetensors.

Copy these into `engine/video/defaults.py` with comments `from SMPL json node id N`.

---

## How many camera sets

**There is no number that produces a perfect scan.** Extra rails do not raise per-view fidelity (every path reprojects the **same** MoGe depth). They buy **explorable volume**. Glass / mirrors / depth silhouettes stay MoGe failures no matter how many drones you add ([SplatKit HiRes “Known limits”](https://github.com/mickmumpitz/ComfyUI-SplatKit/blob/main/docs/HIRES_COMPOSITE.md)). Shorter travel per rail **plus** more rails beats one long rail, because 8K coverage **decays** as you leave the origin.

| Case | Rails | Why | Source |
|---|---|---|---|
| P2 scout / plumbing | **1** | Prove SfM + train. Black holes OK. | P2 lock |
| Quality default | **4** | Graph CAMERA 1–4. Video: “Four drone clips are usually more than enough.” SplatKit `suggest_paths(count=4)`. | JSON + transcript 00:13:xx + `path_suggest.py` |
| Optional extra | **+1** (5th) | `SphereSfMAddToDatasetDualRes`. Graph ADD TO DATASET. | JSON |
| Suggest-paths cap | **≤ 8** | `suggest_paths` clamps `count` to 8. | SplatKit source |
| Hero object (pond, statue) | Keep 4; make **one** rail `look_at_target` at the object | Video: circle a pond / aim at it. Graph camera 1 is this. | Transcript + node 27 |
| High then descend | One `per_point_look` with rising Y, or the **crane-rise** suggestion | Video extra-drone example. Suggest archetype 3. | Transcript + `path_suggest.py` |
| Corridor / street | **push-in** `look_forward` along the open azimuth | Suggest archetype 1. Stay inside clearance. | `path_suggest.py` |
| Open garden / plaza | 4 **short** rails in different azimuths, not one long garden path | HiRes: long path coverage 0.85 → 0.49 by frame 80; one 2523 px hole. | HiRes doc |
| Glass / water / mirrors | Do **not** add rails expecting a fix | Extra paths are more views of the same wrong depth. Water should stay view-dependent after train (video pond). Optional later: HiRes `semantic_pano` to force WAN on glass — **not wired in this SMPL graph**. | HiRes known limits + video |

**Suggest-path archetypes** (SplatKit `core/path_suggest.py`, default four, all start at origin):

| Order | Label | Orientation | Motion |
|---|---|---|---|
| 1 | `push-in` | `look_forward` | Gentle S-dolly into the most open direction |
| 2 | `arc-sweep` | `look_forward` | Lateral S-arc, swing right then left while advancing |
| 3 | `crane-rise` | `per_point_look` | Rise while pushing in; aim pinned on the wall ahead |
| 4 | `pull-back` | `per_point_look` | Retreat, hold aim forward (reveal) |

Votion **Suggest paths** (P3): select the four rail slots, fill each with one archetype (same as SplatKit “✦ Suggest paths (all selected)”). The user then edits. Do not overwrite Confirm’d rails without asking.

Quality default on first P3 open: **copy the four SMPL knot sets** below (studio-garden demo), not a blank editor. Suggest paths is the “fit this room” button.

---

## SMPL demo rails (copy, then let the user edit)

All first knots are `0,0,0`. `length=81`, `moge_level=9`.

**Rail 0 — CAMERA PLOT 1, node 27** — `look_at_target` `-0.108, 0.073, 1.953`

```
0.000, 0.000, 0.000
0.199, 0.219, 0.488
-0.184, -0.093, 0.920
-0.065, 0.039, 1.404
```

**Rail 1 — node 122** — `per_point_look`

```
0.000, 0.000, 0.000, 0.386, 0.021, 1.085
0.430, 0.021, 0.843, 1.784, 0.043, 1.931
0.819, 0.043, -0.292, 2.525, 0.032, -0.347
0.808, 0.032, -1.413, 2.411, 0.021, -1.983
```

**Rail 2 — node 133** — `per_point_look`

```
0.000, 0.000, 0.000, 1.160, 0.202, -0.953
0.714, 0.423, -1.231, 0.918, 0.416, -1.870
0.223, 0.329, -1.412, 0.223, 0.215, -2.093
-0.408, 0.215, -1.474, -0.510, 0.098, -1.994
```

**Rail 3 — node 144** — `per_point_look`

```
0.000, 0.000, 0.000, -1.195, 0.000, 0.124
-0.464, 0.387, 0.129, -1.564, 0.000, -0.245
-0.686, 0.151, -0.519, -1.483, 0.000, -0.740
-0.290, 0.199, -0.983, -0.893, 0.000, -1.584
```

**Rail 4 optional — node 157** — `per_point_look` (Add to dataset)

```
0.000, 0.000, 0.000, -0.222, 0.000, -0.812
-0.395, 0.189, 0.356, -1.301, 0.124, 0.932
0.028, 0.539, 0.668, 0.390, 0.552, 1.611
0.225, 0.811, 0.083, 0.692, 0.772, -0.493
```

---

## UI — Geometry page in P3

Dummy: [Phase 3 HTML](Votion_3DGS_2.0_Phase3.html#geo-ui). Same Plot Camera chrome and **three street plates** as Phase 2 (`geo-floor-top.png`, `geo-side-elev.png`, `geo-preview-overall.png`). Differences from P2:

- Four rail slots (+ optional 5th **+ Add rail**). Active rail dropdown (dummy: `1 look_at_target · pond`).
- **Suggest paths** on. Active rail solid on FLOOR/SIDE; others dimmed.
- **Confirm rails** gates Generate. Play is still on the Preview flight pane only.
- `moge_level` shared (graph **9** on every Plot Camera). Mixed levels break HiRes cache reuse.

Selecting a rail highlights that spline. Preview **this rail** before Confirm. Changing knots after Confirm dirties the rail. Warn if knot 0 ≠ origin (editor also locks it).

---

## UI — Generate page (WAN + HiRes)

Dummy: [Phase 3 HTML](Votion_3DGS_2.0_Phase3.html#gen-ui). Left rail:

- `prompt.txt` required; empty blocks Generate.
- **Seed (WAN)** visible, default `0`, user may edit.
- Style suffix (graph CLIP id 10) **visible**, default = that graph sentence, user may edit or clear.
- **Negative** (graph CLIP id 11) **visible**, pre-filled, user may edit.
- HiRes frames: graph default `0-80/2`; optional `0-15,16-/8`; `all` = 81.
- Debug save: product default **off**.
- Generate / Stop / **Open frames folder**.

Viewport: sequential rail progress (WAN then HiRes, coverage). **`gate_masks` after HiRes** is a **split still**, not two feathered circles:

- File: `docs/media/ref-hires-mask-split.png`
- Left = binary mask (**white = 8K photograph**, **black = WAN fill**)
- Right = the source 8K equirectangular pano those whites were reprojected from

The same split is in HTML §04 (“What the mask means after HiRes”).

Log + Generate Help drawers. Rails run **sequentially** on one 3090. Coverage ≈ 0 → `output_width` too small vs 8K.

---

## How WAN fills missing area

One panorama cannot constrain a 3D scene. SplatKit invents the missing viewpoints, then reconstructs them:

```
pano ─▶ MoGe mesh ─▶ Plot Camera control video + validity mask
     ─▶ Wan I2V masked conditioning ─▶ 1440×720 ERP clip
     ─▶ HiRes Composite (geometry) ─▶ 8K frames (WAN only in holes)
     ─▶ SphereSfM dual-res ─▶ COLMAP
```

### 1. Control video is the hole map

Plot Camera reprojects the mesh along the spline. Anything the original pano never saw is a **black hole**. `control_mask`: **white = valid/known, black = hole** (`invert_mask=False`).

Flying **through a wall** is allowed: Wan will generate a fitting scene on the other side (video). Preview so that is intentional.

### 2. Masked I2V — only the holes are generated

`SplatKit_WanI2VMaskedConditioning` is mechanically Wan’s `concat_latent_image` + `concat_mask`:

- Resize control video to **1440×720**, length **81**.
- Paint holes with `hole_fill='black'` **before** VAE encode so the encoder never sees stale pixels.
- Pool the mask to latent resolution and pack it into Wan’s **4-frames-per-latent** layout.
- CLIP-Vision of the pano (`center`) conditions identity.
- Positive / negative CLIP from `prompt.txt` (required) plus the graph negatives.

**SMPL CLIP strings (copy into defaults; do not silently replace `prompt.txt`):**

- Positive (graph id 10): `A high quality panoramic video of the scene, photorealistic, very clear, smooth camera movement, ultra-detailed, high resolution. Panorama.`
- Negative (graph id 11): `The video is not of a high quality, it has a low resolution. Distortion. strange artifacts.`

Product: **positive = `prompt.txt` (the actual scene)** plus the optional style suffix (visible, default = graph sentence). Negative is a visible box pre-filled from graph id 11. SplatKit README: a wrong prompt visibly degrades what WAN paints into the holes.

### 3. Sample

Model chain above. 8 LightX2V-distilled steps, cfg 1, euler, denoise 1, seed 0. Decode with `wan_2.1_vae`. Result is a **720p ERP video**, not 8K.

### 4. HiRes puts the 8K photograph back

WAN **repaints the whole frame**. That is fine for watching video and **wrong for a splat** (views disagree → blur). HiRes:

- Reproject the original **8192×4096** pano through the **same** `rail_json`.
- Wherever the mesh can answer, the output **is** the photograph (`base_mode=geometry`).
- WAN (upscaled with 4x-UltraSharp, tone-matched) fills only the holes.
- `gate_masks`: **white = real 8K, black = WAN fill.** Coverage = fraction that is white.

`panorama_geometry` must be the **same** pano Plot Camera / WAN saw. A re-upscale or HDR tonemap collapses coverage (measured 0.51 → 0.04).

### HiRes widgets from SMPL node 96 (copy)

```
rail='', set_name='hires_composite', traj_index=0, output_width=8192,
base_mode='geometry', frames='0-80/2', proxy_width=2048, geom_scale=2,
moge_level=6, merge_long=1440, depth_grid='geometry_res',
moge_ckpt='auto (download)', rho_hi=4, tone_work=1024, prefetch=True,
save_video=False, debug_save='all', gate_mode='hard_soft_edge',
tone_mode='off', auto_name=False, save_proxies=True,
gate_edge=0, edge_erode=0, disc_erode=8, bg_fill='wan'
```

Notes, not silent fixes:

- Plot Camera `moge_level=9`, HiRes `moge_level=6`. SplatKit tooltip wants them matched. **Copy both.** Matching them is a later lock question.
- Graph `debug_save='all'` writes ~40 MB × several layers × 41 frames. Product: map to a **Debug** checkbox, default **off**.
- Graph `tone_mode='off'` (paste WAN unmodified). SplatKit default is `luma`. Copy `off`.
- Frame spec **`0-80/2`** = 41 frames / rail. Alternate preset `0-15,16-/8` = 25 frames, cheaper, spends budget near the origin (SplatKit recommended). `all` = 81, ~10× SfM matching work.

Typical geometry-mode coverage at 8192 (SplatKit bathroom): forward 0.85/0.73, orbit 0.84/0.71, up 0.91/0.86, floating 0.93/0.92.

---

## Dual-res SphereSfM (node 84 widgets)

```
['', 'my_scene_hires', 'exhaustive', 'stop', 0, 8192, 0.0066, 10, 32768, 4, 1.5, 4, 30, 1, 'camera_major', '*.png', 1, 0, False]
```

Replace `my_scene_hires` with the Votion scene name. Hires width **8192**. Matcher `exhaustive`. Training images are **pinhole cube faces**, not equirect.

Add-path node 90 hires width **4096** — copy as-is.

Train cap ~**3M** Gaussians.

---

## Models (from the graph notes)

| File | Role |
|---|---|
| `Wan2_1-I2V-14B-720P_fp8_e4m3fn.safetensors` | Quality UNET |
| `wan2.1-i2v-14b-720p-Q4_K_M.gguf` | GGUF alt, not 3090 Quality |
| `pano_video_gen_720p_comfy.safetensors` | Matrix-3D pano LoRA (Comfy keys) |
| `lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors` | Distill |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | CLIP type `wan` |
| `clip_vision_h.safetensors` | CLIP-Vision |
| `wan_2.1_vae.safetensors` | VAE |
| `4x-UltraSharp.pth` | Hole-fill upscaler |

Do not load the Skywork `.ckpt` without `convert_pano_lora.py`.

---

## Workers

1. `engine.workers.wan` — one rail per process. Load 14B fp8 + LoRAs, generate, unload, exit.  
2. `engine.workers.hires` — geometry-mode composite, write 8K PNGs to disk (**never** as one giant GPU tensor).  
3. `engine.workers.sfm` — dual-res: low-res proxies for matching, 8K cube faces for training images.

Quality: sequential rails on one 3090. HiRes ~11 GB peak (SplatKit, 5090) **after** WAN has exited.

---

## Acceptance tests

- [ ] Four rails, sequential WAN, four `rail_json` files that do not overwrite.
- [ ] Optional 5th Add-rail writes via `SphereSfMAddToDatasetDualRes` without colliding (`auto_name` True on that HiRes node).
- [ ] WAN outputs 1440×720 ERP clips (measure, record in `env_report`).
- [ ] Empty `prompt.txt` blocks Generate.
- [ ] HiRes frames on disk at 8192×4096; mean coverage logged; not 0.0.
- [ ] UI shows `gate_masks` (white = 8K, black = WAN).
- [ ] Dual-res COLMAP `images/` are pinhole cube faces, not equirect.
- [ ] In-app train with 3M cap completes without OOM on 3090 after WAN has exited.
- [ ] SageAttention missing → warning in log, job still completes. If Sage is on: no all-black Wan frames.
- [ ] Suggest paths fills four distinct archetypes, all starting at the star.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Native WAN i2v is the largest P3 unknown | Port Diffusers WanPipeline or Matrix-3D `code/panoramic_image_to_video.py` **on Windows**; Matrix-3D README is Linux-tested. |
| 14B fp8 + 24GB | LightX2V; Kijai fp8 file; unload before HiRes. |
| LoRA key convention | `pano_video_gen_720p_comfy.safetensors` only. |
| Windows rasterizer | SplatKit shim; `triton-windows` optional. |
| `moge_level` 9 vs HiRes 6 | Copy JSON. Do not silently unify. |

---

## Explicitly do not do in P3

- Do not stretch WAN to 8K and skip composite.
- Do not use SeedVR (or any video upscaler) **instead of** HiRes geometry composite.
- Do not enable `base_mode=wan` as the splat default (video-watching mode; low-frequency drift).
- Do not run PanoLRM or keep WorldFM as a parallel engine.
- Do not claim extra rails fix glass.
- Do not default `frames` to `0-15,16-/8` while documenting the graph as `0-80/2` — they are two presets.
