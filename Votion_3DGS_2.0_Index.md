# Votion 3DGS 2.0 — Phase Plan Index

**Status:** Phase specs in markdown and Blueprint HTML.

**Locations:**

- `d:\InSpatio World\Yik Votion WorldFM\docs\`
- `D:\Votion3DGS\docs\`

**Product name:** Votion 3DGS  
**Code home:** `D:\Votion3DGS\` (new, independent of Yik Votion WorldFM)  
**V1 archive:** `d:\InSpatio World\Yik Votion WorldFM\` (Gradio + WSL WorldFM — do not mix into V2)

---

## How to read these files

| File | Phase | One-line goal |
|------|--------|----------------|
| [Votion_3DGS_2.0_Phase0.md](Votion_3DGS_2.0_Phase0.md) | P0 Skeleton | Native Windows PySide6 window, job bus, venv, model downloader |
| [Votion_3DGS_2.0_Phase1.md](Votion_3DGS_2.0_Phase1.md) | P1 Pano | **2D Images** (default) / **360 Images** / **text** → 8K ERP (`pano.png`) |
| [Votion_3DGS_2.0_Phase2.md](Votion_3DGS_2.0_Phase2.md) | P2 First splat | Compute geometry → Plot Camera (1 rail) → SphereSfM → `splat.ply` (LiteGS or MCMC Compact) |
| [Votion_3DGS_2.0_Phase3.md](Votion_3DGS_2.0_Phase3.md) | P3 Dataset | 4 rails (+ optional 5th), WAN 720p hole-fill, 8K HiRes, dual-res SfM |
| [Votion_3DGS_2.0_Phase4.md](Votion_3DGS_2.0_Phase4.md) | P4 Product | Profiles, installer, Open-in-Brush/LichtFeld, Unreal, field guide |

P5 (stretch) is an appendix on this page, not its own file. **HTML next to each markdown file is the dummy UI spec** (window chrome, widgets, Geometry plates, FOV crop, HiRes mask split). Markdown keeps graph numbers and locked facts.

---

## Certainty log (answered by you — not inferred)

These are the only product facts treated as **locked**. Everything else in the phase files is either (a) copied from a named source, or (b) marked **UNKNOWN / DO NOT INVENT**.

1. **Engine:** native Python. No ComfyUI in the product. No WSL.
2. **Shell:** PySide6 (native Python GUI). Engineering Blueprint look from V1.
3. **HTML layout:** index + one file per phase.
4. **Code home:** `D:\Votion3DGS\`. Also copy these docs there when Agent mode is allowed.
5. **GPU / Quality generator (amended 2026-10-30, #61):** RTX 3090 24GB. Quality is WorldStereo memory-DMD, not WAN 2.1.
6. **Weights policy:** if a file exists in ComfyUI, copy into `<install_root>\models`; otherwise download from Hugging Face. Ready files live under `<install_root>\models\` matching Comfy folder names. Dev default install root: `D:\Votion3DGS`. Hub cache is not the Windows user profile (see 28).
7. **ComfyUI root (you named it):** `D:\ComfyUI_windows_portable_360`
8. **Do not reuse Comfy `python_embeded`.** Independent Votion venv. Only weights may be copied.
9. **Venv pin:** Python **3.12** + CUDA **12.8** + current stable PyTorch **cu128** wheel. Exact PyTorch *patch* is **not** pinned here — record it in `requirements.lock` on first successful Phase 0 install.
10. **Product name:** Votion 3DGS
11. **Trainer (amended 2026-10-30, #61):** in-app **LiteGS** backend → `splat.ply`. The dataset is known-pose COLMAP under `worldstereo/dataset` (WorldStereo pinholes plus six gnomonic faces of the 8K pano). Train writes `worldstereo/train`. User picks the density controller **LiteGS** (default) or **MCMC Compact** on the Splat page before Train / Retrain. LiteGS = vendored [MooreThreads/LiteGS](https://github.com/MooreThreads/LiteGS) raster + `DensityControllerTamingGS` with the UI Gaussian budget as `target_primitives`. MCMC Compact = Jung & Hong, *MCMC-Guided Compact 3DGS* (SIGGRAPH Asia 2025 TC, section 3.1 only: Metropolis-Hastings adaptive split threshold + stochastic importance prune). Both share the same Gaussian raster (opacity, anisotropic scale, rotation, SH). ADC / Splat Density is not offered. Continue uses the checkpoint’s controller; switching LiteGS ↔ MCMC Compact requires Retrain. Brush / LichtFeld / Postshot stay “Open in…”. The former gsplat Splat3 / MCMC trainer (locked 2026-09-01) is retired; see 48–56. Live train viewport, Stop, uncapped max steps, and Star camera: see 41–47 (locked 2026-09-05).
12. **Unreal:** Engine **5.5** + **MLSLabsRenderer** (interim) for `splat.ply` playback — [GitHub](https://github.com/mlslabs/MLSLabsGaussianSplattingRenderer-UE) · [Fab](https://www.fab.com/listings/f91b57cc-958d-40dd-a455-2535bf00e588). Hold an **update slot** for a better UE renderer later.
13. **Pano inputs (2.0):** three first-class modes on Phase 1 — **(1) 2D Images → ERP (default)**, **(2) 360 Images**, **(3) text → ERP**. Happy path is (1), then MoGe-2 depth, then WorldStereo.
14. **2D Images surroundings:** user types a sentence **or** local **Florence-2** captions the 2D image (editable). Always append **`no peoples, no cars`** at the end (typed or caption). Empty box still blocks Generate. Florence Hub (measured first successful P1 caption): `florence-community/Florence-2-large` rev `4271c66b88cdbc05735372ec13b2360108de5317`.
15. **Ostris:** native port **READY** (2026-09-03, pack pin `7756566160c4a1b24bb1bd9f0ff3ced1a83d7547`). 2D Images Generate is enabled. Do **not** shell out to ComfyUI.
16. **Chrome:** V1 left rail + right viewport + six P0 names as stage chips. Chips **navigate** the six pages. A **job strip** (caption + bar) sits under the chips on every page. **Log** and **Help** are matching bottom drawers (not a Home accordion, not a seventh page).
17. **Panorama viewport (2026-09-03):** user-draggable split. **Left** = unwrapped 2:1 ERP (live h_fov warp before 2D Generate, then the 8K file). **Fit** = full picture in the pane. **100%** = native pixels + 2D slide. **Right** = spherical HDRI-style look (yaw + pitch), not a pan-only 2:1 strip. 2D drop shows a thumbnail; live warp shows the photo.
18. **Seeds visible and editable:** 2D IMAGE→PANO `12345`, 2D seam `12345`, text TEXT→PANO `322344328372862`, text seam `8`, WAN `0`.
19. **Upscaler prompt:** visible box, default `High resolution photography`, editable. **Keep it on the 360 Images rail** (graph ⑤). Also on 2D and text.
20. **h_fov (2026-09-03):** slider **and** typed number. Default **70**. Range **10–170**, step **0.5** (`MickmumpitzPanoWarp` `INPUT_TYPES`). Live warp on the left 2:1 pane.
21. **Geometry editor:** SplatKit Plot Camera chrome. Cyan **star 0** (pano origin) is locked. Red cameras **1, 2, 3…** are draggable. Each camera has a **cyan look arrow**. In `look_at_target`, one **orange look-at** aims every arrow (drag the orange). `look_forward` + drag a look arrow → `per_point_look`. FLOOR and SIDE sit **side by side**; Preview flight sits **under both**. Dummy plates: `docs/media/geo-*.png`. Rail gizmos must be visible on the plates.
22. **Seam INPAINT:** keep two recipes (TEXT node 31 vs IMAGE node 63). Do not copy TEXT onto 2D Images.
23. **360 Images size:** store as-is; visible **Upscale to 8K** runs the shared tail.
24. **Owner / license / audience (2026-09-01):** owner **Yik** (personal); license **MIT**; first audience a **small private team**. No telemetry.
25. **Geometry viewport (2026-09-03):** FLOOR / SIDE plates + gizmos are **QPainter** on one widget. Do **not** ship QWebEngine. vispy `Image` + Line/Markers dropped the rail on this Windows QOpenGLWidget stack — vispy is **not** the Geometry editor.
26. **Installer:** **Inno Setup**.
27. **Profiles at 2.0 launch:** Quality **and** Fast **and** Scout all ship. Fast/Scout stay disabled in the P0 dummy until P4 unlocks them.
28. **moge_level:** Plot Camera **9** and HiRes **6** — copy both forever; do not unify.
29. **Hub cache (2026-09-02):** On **Download models**, Hugging Face hub + Xet cache is `<install_root>\.hf_cache\` (`HF_HOME`, `HF_HUB_CACHE`, `HF_XET_CACHE`). `<install_root>` is the folder the user selected in the Inno Setup installer (dev default `D:\Votion3DGS`). Do **not** write Hub cache to `C:\Users\<user>\.cache\huggingface`.
30. **Download progress (2026-09-03):** During **Download models**, each Home model-status cell shows its own progress bar (queued empty; the active file shows % from measured bytes). Not log-only.
31. **Reconstruct viewport (2026-09-03):** After Reconstruct, show the COLMAP **sparse cloud** (`points3D.bin` + camera centers). Drag orbit, wheel zoom. Not cube-face stills.
32. **Tab persistence (2026-09-03):** Switching stage chips must not wipe generated views. Panorama keeps the 8K ERP (not the green warp). Geometry keeps the last Preview-flight frame and Confirm. Same rule for every tab.
33. **Job progress (2026-09-03):** Every background job (pano, MoGe, Play/Confirm, SphereSfM, Train, downloads) drives the strip under the chips. Not log-only. #30 Home per-cell bars stay.
34. **Generate dummy PNG (2026-09-04):** `docs/media/ref-hires-mask-split.png` stays in the **HTML dummy only**. Product Generate / Reconstruct never load that file.
35. **Generate live split (2026-09-04):** While WAN runs, left = black/white **validity mask** (white = known, black = hole). Right = last WAN frame with holes filled. Updates in real time, including low-res / latent previews — not only after the finished mp4.
36. **Click rail number (2026-09-04):** On Generate, clicking a rail number shows that rail in the viewport.
37. **WAN then HiRes (2026-09-04):** Two stages. Generate WAN → review 720p → optionally re-gen a rail (new prompt and/or new path) → **Confirm WAN → HiRes**. HiRes must not auto-start after WAN.
38. **Reconstruct ditch (2026-09-04):** Keep or Ditch each rail. A ditched rail is left out of SphereSfM (WAN sometimes hallucinates).
39. **Re-gen one rail (2026-09-04):** From Reconstruct, Re-gen WAN on a single rail (jumps to Generate for that rail).
40. **Newest sparse (2026-09-04):** After Reconstruct finishes loading, always show the newest kept-rail COLMAP sparse. Do not keep an older 1-rail / previous solve on screen.
41. **Live train viewport (2026-09-05):** While Train / Continue / view-loop runs, the Splat pane is a Postshot-style **raster of the Gaussians** (ellipses as a surface). Not a point cloud and not stats-only.
42. **Max steps (2026-09-05):** any integer **≥ 1**. Default in the box may be 10000. **No product cap.**
43. **Unlocked camera (2026-09-05):** LMB look/orbit, RMB pan, wheel dolly. Zoom is **not** product-capped.
44. **Star reset (2026-09-05):** Reset / default pose is the rails **Star** (origin of every rail). Do **not** tighten the orbit around the cloud.
45. **Per-Gaussian raster (2026-09-05):** each splat uses its own opacity, anisotropic scale, rotation, and color/SH. Opacity is not a shared slider. **MCMC Compact uses this same representation** as LiteGS.
46. **Stop (2026-09-05):** a Stop button on the Splat rail **and** on the job bar kills training. Continue resumes the last 100-step checkpoint.
47. **Anisotropy vs needle takeover (2026-09-05):** elongated / mixed-angle ellipses (including thin needles as a *look*) are expected. Hairline needles **taking over the scene over time**, glowing whites, and crushed blacks as training proceeds are **bugs** (not a Qt overlay).
48. **LiteGS backend and licence (2026-09-07):** the trainer is `vendor/litegs/` at the pinned SHA in `vendor/litegs.sha` (LICENSE.md next to it). LiteGS carries the Inria Gaussian-Splatting licence (research / evaluation, no commercial use without Inria consent): **vendor as-is, build the three CUDA extensions locally at Setup (`tools/build_litegs.py`, pip then CMake), never redistribute binaries, show the licence line in Help.** Train is gated on `litegs raster 1-step: OK` in `docs/env_report.txt` (`engine.splat.status.litegs_spike_ok`); the P0 gsplat spike line is history only.
49. **MCMC Compact scope (2026-09-07):** only Jung & Hong section 3.1 is implemented (clean room, no public code exists): Metropolis-Hastings walk of the split threshold toward a target split ratio, plus Mini-Splatting-style stochastic importance pruning to the Gaussian budget. BRDF, learned normals, MALA light sampling and deferred shading (relighting) are **out of scope**; Unreal MLSLabsRenderer cannot consume them.
50. **Shared-memory viewport (2026-09-07):** the live raster travels over `multiprocessing.shared_memory` (`votion_splat_<pid>`, 2-slot RGB8 ring), not PNG-on-disk. Qt attaches by name and polls at 60 Hz; the camera goes to the worker over **stdin** (`VIEW\t{json}`). A camera change renders after the next step (≤ 1 step latency, capped at 30 fps while training so the step loop keeps > 80 %); idle view renders only on camera change, no busy loop. PNG stays as the fallback when attach fails.
51. **Pause / Resume (2026-09-07):** in-process over stdin (`PAUSE` / `RESUME`); the viewport stays live while paused. Stop still kills (#46). Continue resumes the 100-step checkpoint **with optimizer and scheduler state**, not params only.
52. **Real Gaussian budget (2026-09-07):** the Splat page budget box (default 3,000,000) is passed to the worker and is the controller target (LiteGS `target_primitives`; MCMC Compact importance-prune target). It is no longer decorative.
53. **Full-SH export (2026-09-07):** `splat.ply` carries SH degree 3 (`f_dc_*` + 45 `f_rest_*`) for Unreal MLSLabsRenderer, Postshot and Brush. **Export compact** prunes `opacity < 0.005` and can drop the `f_rest` bands (DC only) for size.
54. **Hold-out PSNR (2026-09-07):** optional hold-out eval keeps every 8th SphereSfM view out of training and reports PSNR each epoch (HUD + `splat_meta.json`). Resolution scale 1 / 0.5 / 0.25 trains on downsampled frames.
55. **Retrain required (2026-09-07):** checkpoints written by the retired gsplat trainer (params only) are not loadable; Continue / Export on one shows “Retrain required”.
56. **Step-based schedule (2026-09-07):** LiteGS drives densify / SH warm-up by epoch (tuned for ~200-image scenes); Votion scenes have hundreds of small views per epoch and any step count, so SH warms up one band per clamp(steps / 10, 200, 1000) and densify runs between 5 % and 80 % of the steps (opacity decay no more often than every 2000 steps): LiteGS TamingGS in ~24 cycles, MCMC Compact at the 3DGS cadence of one cycle per 100 steps (its Metropolis-Hastings chain and 5 % split target compound per cycle). Appends and prunes are chunk-exact (LiteGS stores Gaussians in fixed chunks; a sub-chunk append would be dropped, a non-multiple prune padded with duplicates). Training cameras list + **GT compare** (render | ground truth) on the Splat page judge convergence.
57. **Gnomonic cube faces (2026-09-08):** SphereSfM still matches equirect frames as `SPHERE`, then `sphere_cubic_reprojecer` emits `SIMPLE_PINHOLE` 90° cameras. **Votion rewrites every cube-face PNG as a true gnomonic pinhole** of that ERP (`engine/sfm/cubic_reproject.py`, after every Reconstruct). Do **not** run vanilla COLMAP pinhole on raw ERP. Do **not** un-bend `points3D` to flatten a bowed splat — the GT images were the bowl. alpine_01 measured: binary face `frame_00000` front ~31 % line sag vs ~0.2 % on a gnomonic remap of the same `equirect_hires` frame. Retrain after Reconstruct; do not Continue a checkpoint fitted to the old faces. MoGe/HiRes floor-plane prior is a **later** step if rails still bowl after this remap.
58. **WorldStereo reopen — gate G1 (2026-10-29, Yik):** The rejection of Hunyuan / HY-World 2.0 below (two huge models at once, four GPUs) stays for that stack. Yik reopens one piece only: the standalone WorldStereo memory-DMD model (`FuchengSu/WorldStereo`, Apache-2.0 code, pin in `vendor/worldstereo.sha`), one GPU (RTX 3090), as an experimental Quality generator in `PRD/WorldStereo2_MemoryDMD_FP8_PRD.md`. Do not vendor or import `Tencent-Hunyuan/HY-World-2.0`. Do not bring back WorldMirror, HY-Pano, WorldNav, or HY-World’s 3DGS trainer. WAN 2.1 stays the default and stays installed. The experimental toggle is gate G3, recorded as #60.
59. **WorldStereo weights — gate G2 (2026-10-29, Yik):** The inference code is Apache-2.0 (`vendor/worldstereo/LICENSE.md`). The official weight repo `hanshanxue/WorldStereo` has no licence file. The FP8 repack `apozz/WorldStereo-fp8` says the overlay is MIT (inherited) and the Wan base is Apache-2.0. HY-World 2.0’s own repo is the Tencent Hunyuan Community License (excludes EU, UK, and Korea). Which of those governs the weights is still **UNKNOWN**. Yik accepts that risk in writing for this experiment. Do not treat the FP8 card’s MIT sentence as a settled licence. Two files inside the WorldStereo pin (`src/sp_utils/parallel_states.py`, `src/sp_utils/communications.py`) also carry a Tencent Hunyuan Community License header; they stay in the pinned tree and are noted in `vendor/worldstereo_NOTICE.md`.
60. **WorldStereo experimental toggle — gate G3 (2026-10-29, Yik):** WorldStereo may ship on the Generate page as a generator choice, **off by default**, Quality profile only. WAN 2.1 + pano LoRA stays the default and stays installed. Switching back to WAN must leave every WAN output untouched. The control stays disabled, with a tooltip, until the weights row is READY. Fast and Scout do not offer it. **Superseded for the default route by #61.**
61. **WorldStereo is the Quality route (2026-10-30, Yik):** After reviewing `alpine_02`, Yik makes WorldStereo memory-DMD the only Quality generator. The WAN 2.1 14B generator, pano LoRA, LightX2V, ERP HiRes, and SphereSfM code paths are removed. Git history is the only copy. Leftover `colmap/`, `wan/`, `hires/`, and WAN weights on disk are not deleted by the app. Shared Wan 2.1 parts that WorldStereo loads stay: umT5, CLIP-Vision H, the Wan 2.1 VAE, and the 480P Diffusers config. `4x-UltraSharp` stays for pinhole HiRes hole fill. Up to six views per rail (front, back, left, right, up, down), default all six. Default rails are four straight `look_forward` lines. The weights licence is still UNKNOWN (#59). Yik accepts that risk for the **default** route, not only the experiment. Fast and Scout stay disabled. This is not the §8 bake-off.
62. **Spaced views are the default frame layout (2026-10-30, Yik):** Six full trajectories made generation about six times one view. Spaced keeps each view's camera steady and gives that view only its slot of the 21 rail frames: front, left, right, up, down, back, then repeat. The six runs are interleaved back into one 21-frame rail. A non-front run adds one anchor frame at rail position 0 so the start image is still a pano cut at the origin; that frame is not kept. Separate (a full trajectory per view) stays available. The short-run timing measurement against the 7439 s alpine_02 front trajectory has not been run; it waits until the GPU is free. **Superseded by #63.**
63. **Joint all-rail generation (2026-11-04, Yik):** One WorldStereo sample covers every kept rail. The default is 10 frames per rail, 40 frames in one pass, out along one rail and back along the next, starting at the star. Per rail (21 front frames each) stays as the other Generate option. Spaced, six-view Separate, the combined preview, per-view exclude, and Dense are removed. 40 keyframes is past the clip this checkpoint was trained on (21). Quality, time, and VRAM for that 40-frame sample are unmeasured; the run waits until the GPU is free. A longer sequence is the same planner with a higher frame cap, chained through the memory bank.
64. **Geometry-locked WorldStereo (2026-11-10, Yik):** The guide video is a solid mesh from the 2048x1024 MoGe pano depth, textured with the 8K pano, with the ground plane snapped. After each joint chunk, pixels the guide left empty are lifted with aligned MoGe frame depth into a shared layer under worldstereo/world; later chunks render that layer in their guide. HiRes all composites the 8K pano mesh, then the shared layer, then the frame's own WorldStereo pixels, with a feathered seam. Quality, time, and VRAM are unmeasured until Yik runs it.
65. **Photo paste and one scene depth (2026-11-10, Yik):** After the 8K tail, 2D Images pastes the original photo back with a feathered seam. Panorama depth is one cache under `outputs/<scene>/depth`, keyed by the panorama hash. The default backend is `moge2`, picked by Yik on 2026-11-11 from the alpine bake-off in `tools/depth_bakeoff.py` (ground fit 0.70 vs 0.58 for `moge1`, facade error 0.0042 vs 0.0055, MIT weights). Geometry, Plot Camera, the guide, and HiRes all read that cache. A rail plotted on an older depth must be re-plotted before Generate; the depth key sits beside each rail in `rails/rail_XX.depth_key`, which Start over keeps. Backends other than `moge1` run in their own venvs under `.venvs/` (`tools/depth_backends/install.ps1`). Detect h_fov reads lens EXIF first and falls back to MoGe. Backend licences: MoGe-2 weights MIT, PaGeR weights CC BY-NC (non-commercial), DAP weights under Meta's DINOv3 licence.
66. **Geometry editor stays local (2026-11-12):** Dragging a rail point or the look target, and switching Active rail, updates the floor and side views only. It does not rebuild Generate or Reconstruct. The rail file is written when Play starts the mesh flight, and again when the active rail changes, without that rebuild. Confirm rails is what refreshes Generate and Reconstruct.

### Measured on this PC (not guessed)

| Item | Fact | Source |
|------|------|--------|
| ComfyUI Python | 3.13 (`python313._pth`) | `D:\ComfyUI_windows_portable_360\python_embeded\python313._pth` |
| ComfyUI torch | `2.13.0+cu130` (CUDA 13.0) | `python_embeded\Lib\site-packages\torch\version.py` |
| Required Krea/WAN/LoRA files in that ComfyUI `models\` | **Not present** (no `.safetensors` found; `extra_model_paths.yaml` not configured) | Inventory 2026-08-31 |
| Copy-from-Comfy | **No-op until those files appear** | Same inventory |
| V1 app | Gradio + WSL2 + WorldFM + custom `train_splat_live.py` (not nerfstudio) | `Yik Votion WorldFM` |
| Host Python 3.12 | **3.12.10** (`py -3.12`) | Measured 2026-09-01 |
| GPU | RTX 3090 24GB, driver **595.79**, nvidia-smi CUDA **13.2** (driver max; venv torch stays cu128) | `nvidia-smi` 2026-09-01 |
| Florence-2 Hub | `florence-community/Florence-2-large` rev `4271c66b88cdbc05735372ec13b2360108de5317` | First successful P1 caption |
| Warp h_fov range | **10–170**, step **0.5** | `MickmumpitzPanoWarp` `INPUT_TYPES` at vendor pin |
| Ostris Edit | Native port **READY** | 2026-09-03; pack pin `7756566` |
| LiteGS vendor SHA | `004b95215c90c36cdaf4b354301132b700ac287b` (MooreThreads/LiteGS `master`) | `vendor/litegs.sha`, 2026-09-07 |
| LiteGS build route | `simple-knn`, `fused_ssim`, `litegs_fused` built with MSVC 14.43 + CUDA 12.8 + ninja via `engine/cuda_jit.prepare` (pip route; CMake fallback kept). Needed the `__CUDACC__` guard in `compiled_autograd.h` and CUDA 12.6 math headers on `INCLUDE`. | `docs/env_report.txt` `## litegs spike` |
| LiteGS 1-step raster | `litegs raster 1-step: OK loss=0.6010 visible=4096/4096 cluster=128` | `docs/env_report.txt`, 2026-09-07 |
| alpine_01 LiteGS 10k | 972 SphereSfM views (360² faces + six 2048² pano faces), 2.26M Gaussians at 10k steps, ~3.6 min on the 3090 (~200 it/s at 19k → ~80 it/s at 2.2M), hold-out PSNR 15.6 dB. Single-view overfit reaches 33.8 dB in 600 steps, so the raster + optimizer are sound; the low multi-view PSNR is view inconsistency in the WAN + SphereSfM data (frame 1 alone fits to 30.8 dB, frames 1–3 together only 22.3 dB). | Measured 2026-09-07 |
| alpine_01 MCMC Compact 10k | 3DGS cadence (75 densify cycles of 100 steps, decay every 2000), MH acceptance 0.43–0.44 (target 0.44), split ratio 3.4–6.8 % per cycle (target 5 %), 19,456 → **510,720** Gaussians (77 % below LiteGS at the same 3M budget), hold-out PSNR **15.7 dB**, 94 s on the 3090 (re-run: 533,120 / 15.5 dB — split sampling is stochastic) (~130 it/s while densifying, ~220 it/s after). Viewport frame: 0 % crushed (<8) / 0 % blown (>247) pixels vs GT. An earlier 24-cycle schedule stalled at 40k because LiteGS drops sub-chunk appends; appends and prunes are now chunk-exact. | Measured 2026-09-07 |
| alpine_01 cube-face sag | SphereSfM `frame_00000` front PNG ~31 % quadratic line sag; true 90° gnomonic of the same `equirect_hires/frame_00000.png` ~0.2 %. cameras.bin already `SIMPLE_PINHOLE` f=W/2 (90°). | Measured 2026-09-08 |
| alpine_01 photo paste | 8192×4096 paste of a 70° crop: 3.7 s, about 2 GiB. Pixels outside the feather are unchanged. | Measured 2026-11-11 |
| alpine_01 depth bake-off | At 2048×1024, scaled to a 0.20 m camera height. Ground fit / facade error / edge match: MoGe v1 0.58 / 0.0055 / 0.39; MoGe-2 0.70 / 0.0042 / 0.44; PaGeR 0.66 / 0.0050 / 0.45; DAP 0.58 / 0.0052 / 0.42. Yik picked MoGe-2. | `outputs/alpine_01/_work/depth_bakeoff/summary.json`, 2026-11-11 |
| alpine_01 MoGe-2 cache | 4096×2048, 158 s, scale 0.890, 80.7 % valid. A second read from `depth/` was 0.2 s. | Measured 2026-11-11 |

### Still UNKNOWN (do not fill in)

- Exact PyTorch 2.x patch number for cu128 + Python 3.12 on Windows.
- ~~Whether `gsplat` CUDA wheels exist for Python 3.12 + CUDA 12.8 on Windows (Phase 0 spike).~~ **Moot 2026-09-07:** trainer moved to LiteGS, built locally (row above).
- Whether `triton-windows` / SageAttention build on this stack (optional accelerators).
- MickmumpitzPanoWarp widget names **other than** h_fov (min/max/step locked: 10–170 / 0.5).
- Harmonize / UltimateSDUpscale extra widget names (copy arrays from the Krea JSON; name from node source at pin).
- ~~Exact Florence-2 Hub id / revision.~~ **Measured:** `florence-community/Florence-2-large` @ `4271c66`.
- ~~Native Ostris Edit port on Windows.~~ **READY 2026-09-03.** Do not shell out to ComfyUI.
- ~~Disk free space on `D:` for the model download.~~ **Measured 2026-09-01:** 142.3 GB free. The downloader still checks before the WorldStereo weights.
- ~~Unreal Engine version / playback plugin~~ **Locked (interim):** UE 5.5 + MLSLabsRenderer. **Update slot open** for a future better renderer.

---

## Pipeline (locked architecture)

```
2D Images (default) or 360 Images or text
  → Krea 2 360 pano (2K then 8K)          [Phase 1; 360 Images skips Krea]
  → Compute geometry (MoGe FLOOR + SIDE + star)  [Phase 2]
  → Plot Camera (`look_forward` / `look_at_target` / `per_point_look`)
  → WorldStereo memory-DMD (up to six pinhole views per rail)   [Quality]
  → Pinhole HiRes (8K pano through MoGe; UltraSharp only in holes)
  → Known-pose COLMAP (`worldstereo/dataset`)
  → In-app LiteGS or MCMC Compact (Gaussian budget, default 3M) → splat.ply (full SH)
  → Optional Open in Brush / LichtFeld / Postshot
```

**Hard rules:**

- Quality generation is WorldStereo memory-DMD. Wan 2.1 I2V, Matrix-3D, and LightX2V are not in this build.
- Sharpness is the 8K panorama through the MoGe-2 mesh. SeedVR is not a sharpness path.
- **All rails start from the same origin** (the star / pano center). That is the viewpoint that already has the 8K texture.
- The mesh guide has holes where the panorama never looked. WorldStereo fills them. Preview the mesh flight before Generate.
- **Four rails is usually enough.** Extra rails buy volume, not per-view fidelity, and do not fix glass. Optional 5th rail.
- Keep **view-dependent reflections** (Gaussian SH, not a polygon mesh). Marble was rejected for restricted roam **and** dead reflections. Example in the video: a pond that still reflects after splat train.
- SageAttention is optional for speed; the video also uses the SageAttention **patch to avoid black frames**. If Sage is on, apply that patch. If import fails, run without it (may be slower; watch for black frames).

**Rejected approaches (do not re-open in 2.0):**

| Tried | Why it died (video) |
|-------|---------------------|
| Slice a 360, run Apple SHARP per face, stitch | Ugly seams; SHARP does not invent off-axis detail; **non-commercial** license |
| MoGe to line up those SHARP views | Progress, then same two killers: not flexible enough once you move + license |
| UniSHARP | Fast 360, worlds fall apart quickly once you leave center |
| Hunyuan / HY-World 2.0 | Two huge models in memory at once; designed for **four GPUs**. **Exception (2026-10-29, #58):** the standalone WorldStereo memory-DMD model, one GPU only |
| NVIDIA Lyra | 91 GB, Linux-only, ~6 min first start |
| World Labs Marble | Closed source; small roam; **no working reflections** |

**Current path:** Krea 2 panorama, MoGe-2 depth, WorldStereo memory-DMD, pinhole HiRes, known-pose COLMAP, LiteGS or MCMC Compact.

**V1 is not upgraded.** HunyuanWorld / WorldFM / the HY-World 2.0 stack stay archived. The only reopen is #58 (standalone WorldStereo, one GPU).

---

## Target tree (`D:\Votion3DGS\`)

```
D:\Votion3DGS\
  app\                 PySide6
  engine\              pipeline + workers (subprocess isolation)
  vendor\splatkit\     core/ + shim/ from ComfyUI-SplatKit (MIT, no ComfyUI imports)
  vendor\litegs\       MooreThreads/LiteGS at vendor\litegs.sha (Inria licence; CUDA built at Setup, never shipped)
  vendor\moge\
  bin\                 colmap_sphere.exe (download on first use)
  .hf_cache\           Hub + Xet cache (install folder the user chose; not C:\Users\…\.cache)
  models\              ready weights (HF download / Comfy copy)
  outputs\<scene>\
  docs\                these phase plans
  tools\               download_models.py, model_manifest.json
  requirements.lock    written in Phase 0 — not invented now
```

---

## Model files (this build)

Download into `<install_root>\models\`. Hub blobs land in `<install_root>\.hf_cache\`, not `C:\Users\<user>\.cache\huggingface`. Dev default: `D:\Votion3DGS`.

### Panorama

| File | Folder | Source |
|------|--------|--------|
| `krea2_turbo_fp8_scaled.safetensors` | diffusion_models | [Comfy-Org/Krea-2](https://huggingface.co/Comfy-Org/Krea-2) |
| `krea2_t2i_360_erp_lora_v1.safetensors` | loras | [Krea2-360-ERP-LoRAs](https://huggingface.co/mickmumpitz/Krea2-360-ERP-LoRAs) |
| `krea2_oedit_360_erp_outpaint_lora_v1.safetensors` | loras | same repo |
| `qwen3vl_4b_fp8_scaled.safetensors` | text_encoders | [Comfy-Org/Krea-2](https://huggingface.co/Comfy-Org/Krea-2) |
| Krea VAE | vae | panorama decode |
| `RealESRGAN_x2.pth` | upscale_models | [ai-forever/Real-ESRGAN](https://huggingface.co/ai-forever/Real-ESRGAN) |

The RTX 50xx nvfp4 Krea file is not the 3090 default.

### Generate, depth, and HiRes

| File | Role |
|------|------|
| `WorldStereo-memory-dmd-fp8_e4m3fn_scaled.safetensors` | [apozz/WorldStereo-fp8](https://huggingface.co/apozz/WorldStereo-fp8) |
| `dinov2-base` | [facebook/dinov2-base](https://huggingface.co/facebook/dinov2-base) |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | WorldStereo text encoder |
| `clip_vision_h.safetensors` | WorldStereo vision encoder |
| MoGe-2 `Ruicheng/moge-2-vitl-normal` | scene depth |
| MoGe v1 `Ruicheng/moge-vitl` `model.pt` | Detect, when a photo has no lens data |
| `4x-UltraSharp.pth` | HiRes holes only |

Florence-2 (optional caption): `florence-community/Florence-2-large` rev `4271c66b88cdbc05735372ec13b2360108de5317`. Always append `no peoples, no cars`.

---

## VRAM profiles (Quality locked; others from named sources)

| Profile | GPU assumption | Generator | HiRes | Rails | Source |
|---------|----------------|-----------|-------|-------|--------|
| **Quality (default)** | RTX 3090 24GB | WorldStereo memory-DMD FP8 | Pinhole, 2× keyframe | 4 straight | #61, 2026-10-30 |
| Fast | 16GB class | Not in this build | — | — | Disabled. Do not invent a model name. |
| Scout | 12GB class | Not in this build | — | — | Disabled. Do not invent a model name. |

---

## P5 stretch (not a 2.0 blocker)

- SeedVR2 as an experiment only. Do not substitute it for the 8K panorama through the mesh.
- macOS is not supported. This build is Windows.

---

## HTML copies (dummy UI spec)

Open in a browser. The HTML is the **visual spec** for PySide6: window chrome, widgets, and viewports. Markdown stays the locked facts and graph numbers. If they disagree, the HTML dummy plus this certainty log win over leftover ASCII mockups.

Shared window (every dummy `.desk`):

- Title bar **Votion 3DGS**, brand row, six **stage chips** that navigate Home / Panorama / Geometry / Generate / Reconstruct / Splat.
- **Job strip** under the chips on every page (caption + bar for the running background job).
- **Left rail** = page controls. **Right viewport** = preview / editor.
- Bottom: **Log** drawer (subprocess) and **Help** drawer (page-specific copy). Not a Home accordion, not a seventh page.
- Switching chips **restores** generated views (do not reset to empty / green warp).

| HTML | Dummy pages |
|------|-------------|
| [Index](Votion_3DGS_2.0_Index.html) | Home overview |
| [Phase 0](Votion_3DGS_2.0_Phase0.html) | Home: scene, profile, download, model status |
| [Phase 1](Votion_3DGS_2.0_Phase1.html) | Panorama: 2D / 360 / text, green FOV crop, seeds, Caption |
| [Phase 2](Votion_3DGS_2.0_Phase2.html) | Geometry (empty + Plot Camera rail), Reconstruct, Splat (live raster over shared memory, LiteGS / MCMC Compact, budget, Pause, Stop, HUD, training cameras + GT compare) |
| [Phase 3](Votion_3DGS_2.0_Phase3.html) | Geometry (4 rails), Generate (WAN then Confirm HiRes, live mask\|WAN split), Reconstruct (keep/ditch) |
| [Phase 4](Votion_3DGS_2.0_Phase4.html) | Splat Open-in… + LiteGS / MCMC Compact, Home Help / `config.json` |

Interactive bits in the dummies (not screenshots of a running app): Panorama **h_fov** type-or-drag warps the green FOV window; **Fit / 100%** on the left 2:1 pane; Geometry **drag cameras 1–3** and the **orange look-at**; Generate **click a rail number**; Reconstruct **sparse orbit**; Splat **LiteGS / MCMC Compact** chips, editable budget, Pause, HUD and a live-raster plate with a training-camera list (`docs/rail-dummy.js`). Job strip under the chips on every desk. `ref-hires-mask-split.png` is **HTML showcase only**.

Unreal import target is **UE 5.5** + **MLSLabsRenderer** (interim). Update slot held for a future better UE splat renderer.
