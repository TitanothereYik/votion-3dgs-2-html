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
| [Votion_3DGS_2.0_Phase2.md](Votion_3DGS_2.0_Phase2.md) | P2 First splat | Compute geometry → Plot Camera (1 rail) → SphereSfM → `splat.ply` (Splat3 or MCMC) |
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
5. **GPU / WAN default:** RTX 3090 24GB. Quality = WAN 2.1 I2V **14B fp8 720p** + LightX2V.
6. **Weights policy:** if a file exists in ComfyUI, copy into `<install_root>\models`; otherwise download from Hugging Face. Ready files live under `<install_root>\models\` matching Comfy folder names. Dev default install root: `D:\Votion3DGS`. Hub cache is not the Windows user profile (see 28).
7. **ComfyUI root (you named it):** `D:\ComfyUI_windows_portable_360`
8. **Do not reuse Comfy `python_embeded`.** Independent Votion venv. Only weights may be copied.
9. **Venv pin:** Python **3.12** + CUDA **12.8** + current stable PyTorch **cu128** wheel. Exact PyTorch *patch* is **not** pinned here — record it in `requirements.lock` on first successful Phase 0 install.
10. **Product name:** Votion 3DGS
11. **Trainer:** in-app gsplat → `splat.ply`. User picks **Splat3** (default) or **MCMC** on the Splat page before Train / Retrain. Splat3 = gsplat `DefaultStrategy` (original 3DGS densify / split / prune). MCMC = gsplat `MCMCStrategy` ([3DGS as MCMC](https://arxiv.org/abs/2404.09591)). Both share the same Gaussian raster (opacity, anisotropic scale, rotation, SH). ADC / Splat Density is not offered. Continue uses the checkpoint’s strategy; switching Splat3 ↔ MCMC requires Retrain. In-app Splat3 is **not** Jawset Postshot’s binary. Brush / LichtFeld / Postshot stay “Open in…”. Live train viewport, Stop, uncapped max steps, and Star camera: see 41–47 (locked 2026-09-05).
12. **Unreal:** Engine **5.5** + **MLSLabsRenderer** (interim) for `splat.ply` playback — [GitHub](https://github.com/mlslabs/MLSLabsGaussianSplattingRenderer-UE) · [Fab](https://www.fab.com/listings/f91b57cc-958d-40dd-a455-2535bf00e588). Hold an **update slot** for a better UE renderer later.
13. **Pano inputs (2.0):** three first-class modes on Phase 1 — **(1) 2D Images → ERP (default)**, **(2) 360 Images**, **(3) text → ERP**. Happy path is (1) then Phase 2 splat then Phase 3 WAN.
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
45. **Per-Gaussian raster (2026-09-05):** each splat uses its own opacity, anisotropic scale, rotation, and color/SH. Opacity is not a shared slider. **MCMC uses this same representation** as Splat3.
46. **Stop (2026-09-05):** a Stop button on the Splat rail **and** on the job bar kills training. Continue resumes the last 100-step checkpoint.
47. **Anisotropy vs needle takeover (2026-09-05):** elongated / mixed-angle ellipses (including thin needles as a *look*) are expected. Hairline needles **taking over the scene over time**, glowing whites, and crushed blacks as training proceeds are **bugs** (not a Qt overlay).

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

### Still UNKNOWN (do not fill in)

- Exact PyTorch 2.x patch number for cu128 + Python 3.12 on Windows.
- Whether `gsplat` CUDA wheels exist for Python 3.12 + CUDA 12.8 on Windows (Phase 0 spike).
- Whether `triton-windows` / SageAttention build on this stack (optional accelerators).
- MickmumpitzPanoWarp widget names **other than** h_fov (min/max/step locked: 10–170 / 0.5).
- Harmonize / UltimateSDUpscale extra widget names (copy arrays from the Krea JSON; name from node source at pin).
- ~~Exact Florence-2 Hub id / revision.~~ **Measured:** `florence-community/Florence-2-large` @ `4271c66`.
- ~~Native Ostris Edit port on Windows.~~ **READY 2026-09-03.** Do not shell out to ComfyUI.
- ~~Disk free space on `D:` for ~45–60 GB models.~~ **Measured 2026-09-01:** 142.3 GB free. Downloader still checks before WAN 14B.
- ~~Unreal Engine version / playback plugin~~ **Locked (interim):** UE 5.5 + MLSLabsRenderer. **Update slot open** for a future better renderer.

---

## Pipeline (locked architecture)

```
2D Images (default) or 360 Images or text
  → Krea 2 360 pano (2K then 8K)          [Phase 1; 360 Images skips Krea]
  → Compute geometry (MoGe FLOOR + SIDE + star)  [Phase 2]
  → Plot Camera (`look_forward` / `look_at_target` / `per_point_look`)
  → WAN 2.1 + Matrix-3D pano LoRA (720p ERP, holes filled)   [Phase 3]
  → HiRes Composite geometry mode (reproject 8K; WAN only in holes)
  → SphereSfM dual-res → COLMAP pinhole dataset
  → In-app gsplat Splat3 or MCMC (~3M cap) → splat.ply
  → Optional Open in Brush / LichtFeld / Postshot
```

**Hard rules from the Mickmumpitz video** ([transcript](https://www.youtube.com/watch?v=eJuYBNrD8HI), not inferred):

- WAN is capped at 720p / 1440×720 ERP. Structure from Wan is fine; **softness** is the problem. Sharpness is the **8K reprojection trick**, not a bigger video model.
- **SeedVR** was tried as an upscaler on the Wan views: slow and “didn’t do too much.” It is **not** a sharpness path (P5 experiment only).
- **All drone rails start from the same origin** (the MoGe star / pano center). That is the only viewpoint that already has the 8K texture, so HiRes can reproject “how every pixel moves.”
- Mesh control video has **black holes** where the pano never saw. Wan + Matrix-3D LoRA inpaints those holes. Flying **through a wall** is allowed — Wan invents the other side — but the user must **preview the mesh flight** before spending a 14B run.
- **Four rails is usually enough.** Quality default stays 4. Extra rails buy volume, not per-view fidelity, and do not fix glass. Optional 5th via Add-to-dataset.
- Keep **view-dependent reflections** (Gaussian SH, not a polygon mesh). Marble was rejected for restricted roam **and** dead reflections. Example in the video: a pond that still reflects after splat train.
- SageAttention is optional for speed; the video also uses the SageAttention **patch to avoid black frames**. If Sage is on, apply that patch. If import fails, run without it (may be slower; watch for black frames).

**Rejected approaches (do not re-open in 2.0):**

| Tried | Why it died (video) |
|-------|---------------------|
| Slice a 360, run Apple SHARP per face, stitch | Ugly seams; SHARP does not invent off-axis detail; **non-commercial** license |
| MoGe to line up those SHARP views | Progress, then same two killers: not flexible enough once you move + license |
| UniSHARP | Fast 360, worlds fall apart quickly once you leave center |
| Hunyuan / HY-World 2.0 | Two huge models in memory at once; designed for **four GPUs** |
| NVIDIA Lyra | 91 GB, Linux-only, ~6 min first start |
| World Labs Marble | Closed source; small roam; **no working reflections** |

**Selected:** Skywork Matrix-3D = MoGe mesh as camera condition + **LoRA on Wan 2.1** (not a new video model). LoRA trained by flying a virtual 360° drone in **UE5** through **500** game worlds. Votion ports that idea natively (SplatKit `core/`), not ComfyUI.

**V1 is not upgraded.** HunyuanWorld / WorldFM / HY-World 2.0 stay archived.

---

## Target tree (`D:\Votion3DGS\`)

```
D:\Votion3DGS\
  app\                 PySide6
  engine\              pipeline + workers (subprocess isolation)
  vendor\splatkit\     core/ + shim/ from ComfyUI-SplatKit (MIT, no ComfyUI imports)
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

## Model filenames (from the two ComfyUI graphs you attached)

Filenames and Hugging Face URLs below are copied from the MarkdownNote nodes in:

- `d:\AI_3DGS\260825_MICKMUMPITZ_Krea2-360Pano-Creator_1-0.json`
- `d:\AI_3DGS\260825_MICKMUMPITZ_3DGS-Dataset-Creator_1-0_SMPL.json`

Sizes are **not** listed unless a source stated them. Download into `<install_root>\models\…` matching Comfy folder names. Hub blobs land in `<install_root>\.hf_cache\` first (same volume as models), not `C:\Users\<user>\.cache\huggingface`. Dev default: `D:\Votion3DGS`.

### Panorama (Phase 1; downloader can fetch in Phase 0)

| File | Comfy folder | URL (from workflow note) |
|------|----------------|---------------------------|
| `krea2_turbo_fp8_scaled.safetensors` | diffusion_models | [Comfy-Org/Krea-2](https://huggingface.co/Comfy-Org/Krea-2/resolve/main/diffusion_models/krea2_turbo_fp8_scaled.safetensors) |
| `krea2_t2i_360_erp_lora_v1.safetensors` | loras | [mickmumpitz/Krea2-360-ERP-LoRAs](https://huggingface.co/mickmumpitz/Krea2-360-ERP-LoRAs/resolve/main/krea2_t2i_360_erp_lora_v1.safetensors) |
| `krea2_oedit_360_erp_outpaint_lora_v1.safetensors` | loras | [same repo](https://huggingface.co/mickmumpitz/Krea2-360-ERP-LoRAs/resolve/main/krea2_oedit_360_erp_outpaint_lora_v1.safetensors) |
| `qwen3vl_4b_fp8_scaled.safetensors` | text_encoders | [Comfy-Org/Krea-2](https://huggingface.co/Comfy-Org/Krea-2/resolve/main/text_encoders/qwen3vl_4b_fp8_scaled.safetensors) |
| `wan_2.1_vae.safetensors` | vae | [Comfy-Org Wan 2.1](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/vae/wan_2.1_vae.safetensors) |
| `RealESRGAN_x2.pth` | upscale_models | [ai-forever/Real-ESRGAN](https://huggingface.co/ai-forever/Real-ESRGAN/resolve/main/RealESRGAN_x2.pth) |

Optional (workflow note, RTX 50xx): `krea2_turbo_nvfp4.safetensors` — **not** for the 3090 Quality default.

### Video / dataset (Phase 3)

| File | Comfy folder | URL (from workflow note) |
|------|----------------|---------------------------|
| `Wan2_1-I2V-14B-720P_fp8_e4m3fn.safetensors` | diffusion_models | [Kijai/WanVideo_comfy](https://huggingface.co/Kijai/WanVideo_comfy/blob/main/Wan2_1-I2V-14B-720P_fp8_e4m3fn.safetensors) |
| `pano_video_gen_720p_comfy.safetensors` | loras | [mickmumpitz/Wan2.1-Pano360-LoRA](https://huggingface.co/mickmumpitz/Wan2.1-Pano360-LoRA/blob/main/pano_video_gen_720p_comfy.safetensors) |
| `lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors` | loras | [Kijai Lightx2v](https://huggingface.co/Kijai/WanVideo_comfy/blob/main/Lightx2v/lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors) |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | text_encoders | [Comfy-Org](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/blob/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors) |
| `clip_vision_h.safetensors` | clip_vision | [Comfy-Org](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/blob/main/split_files/clip_vision/clip_vision_h.safetensors) |
| `4x-UltraSharp.pth` | upscale_models | [Kim2091/UltraSharp](https://huggingface.co/Kim2091/UltraSharp/blob/main/4x-UltraSharp.pth) |

GGUF alternative (workflow: “16GB or less”; **not** the 3090 Quality default): `wan2.1-i2v-14b-720p-Q4_K_M.gguf` from [city96](https://huggingface.co/city96/Wan2.1-I2V-14B-720P-gguf).

MoGe checkpoint: Hugging Face `Ruicheng/moge-vitl` `model.pt` (SplatKit default). SphereSfM: `colmap_sphere.exe` auto-download from SplatKit `bin/` (SHA verified there — copy that checksum into our downloader; do not invent one).

Florence-2 (Phase 1 auto-caption, optional): Microsoft Florence-2 family, Apache-2.0. Hub (first successful P1 caption): `florence-community/Florence-2-large` rev `4271c66b88cdbc05735372ec13b2360108de5317`. Always append `no peoples, no cars`. Do not invent a quantized fork.

---

## VRAM profiles (Quality locked; others from named sources)

| Profile | GPU assumption | WAN | HiRes | Rails | Source |
|---------|----------------|-----|-------|-------|--------|
| **Quality (default)** | RTX 3090 24GB | 14B fp8 720p + LightX2V | 8K geometry mode | 4 | You locked this |
| Fast | 16GB class | **Matrix-3D 5B** (default). GGUF Q4 is not the Fast default. | 8K optional | 2–4 | Locked 2026-09-01. Exact 5B filename from Matrix-3D README at implement — do not invent. |
| Scout | 12GB class | 5B + low-VRAM | skip | 1–2 | Matrix-3D README (~12GB 5B low-vram) |

Matrix-3D PanoLRM (~80GB in their README) is **out of 2.0**.

---

## P5 stretch (not a 2.0 blocker)

- SeedVR2 as an **experiment only**. Video: they upscaled Wan views with it; it was slow and did little. **Do not** substitute it for 8K geometry-mode reprojection.
- Matrix-3D optimization reconstruction as an advanced alternative to SphereSfM
- macOS: SplatKit SphereSfM is Windows/Linux only today

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
| [Phase 2](Votion_3DGS_2.0_Phase2.html) | Geometry (empty + Plot Camera rail), Reconstruct, Splat (live raster, Splat3 / MCMC, Stop) |
| [Phase 3](Votion_3DGS_2.0_Phase3.html) | Geometry (4 rails), Generate (WAN then Confirm HiRes, live mask\|WAN split), Reconstruct (keep/ditch) |
| [Phase 4](Votion_3DGS_2.0_Phase4.html) | Splat Open-in… + Splat3 / MCMC, Home Help / `config.json` |

Interactive bits in the dummies (not screenshots of a running app): Panorama **h_fov** type-or-drag warps the green FOV window; **Fit / 100%** on the left 2:1 pane; Geometry **drag cameras 1–3** and the **orange look-at**; Generate **click a rail number**; Reconstruct **sparse orbit**; Splat **Splat3 / MCMC** chips plus a live-raster plate (`docs/rail-dummy.js`). Job strip under the chips on every desk. `ref-hires-mask-split.png` is **HTML showcase only**.

Unreal import target is **UE 5.5** + **MLSLabsRenderer** (interim). Update slot held for a future better UE splat renderer.
