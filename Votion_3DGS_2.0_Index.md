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
6. **Weights policy:** if a file exists in ComfyUI, copy into the project; otherwise download from Hugging Face into `D:\Votion3DGS\models`.
7. **ComfyUI root (you named it):** `D:\ComfyUI_windows_portable_360`
8. **Do not reuse Comfy `python_embeded`.** Independent Votion venv. Only weights may be copied.
9. **Venv pin:** Python **3.12** + CUDA **12.8** + current stable PyTorch **cu128** wheel. Exact PyTorch *patch* is **not** pinned here — record it in `requirements.lock` on first successful Phase 0 install.
10. **Product name:** Votion 3DGS
11. **Trainer:** in-app gsplat → `splat.ply`. User picks **Splat3** (default) or **MCMC** on the Splat page before Train / Retrain. Splat3 = gsplat `DefaultStrategy` (original 3DGS densify / split / prune). MCMC = gsplat `MCMCStrategy` ([3DGS as MCMC](https://arxiv.org/abs/2404.09591)). ADC / Splat Density is not offered. Continue uses the checkpoint’s strategy; switching Splat3 ↔ MCMC requires Retrain. In-app Splat3 is **not** Jawset Postshot’s binary. Brush / LichtFeld / Postshot stay “Open in…”.
12. **Unreal:** Engine **5.5** + **MLSLabsRenderer** (interim) for `splat.ply` playback — [GitHub](https://github.com/mlslabs/MLSLabsGaussianSplattingRenderer-UE) · [Fab](https://www.fab.com/listings/f91b57cc-958d-40dd-a455-2535bf00e588). Hold an **update slot** for a better UE renderer later.
13. **Pano inputs (2.0):** three first-class modes on Phase 1 — **(1) 2D Images → ERP (default)**, **(2) 360 Images**, **(3) text → ERP**. Happy path is (1) then Phase 2 splat then Phase 3 WAN.
14. **2D Images surroundings:** user types a sentence **or** local **Florence-2** captions the 2D image (editable). Exact Florence-2 Hub id is **not** pinned here — record it in `model_manifest.json` on first successful P1 install.
15. **Ostris:** native port required for **2D Images**. Until READY, disable 2D Images Generate; **360 Images** and **text** still work; Phase 2 can splat those.
16. **Chrome:** V1 left rail + right viewport + six P0 names as stage chips. Chips **navigate** the six pages. **Log** and **Help** are matching bottom drawers (not a Home accordion, not a seventh page).
17. **Panorama viewport:** 2:1 ERP still left, drag-to-look 360 right.
18. **Seeds visible and editable:** 2D IMAGE→PANO `12345`, 2D seam `12345`, text TEXT→PANO `322344328372862`, text seam `8`, WAN `0`.
19. **Upscaler prompt:** visible box, default `High resolution photography`, editable.
20. **Geometry editor:** SplatKit Plot Camera chrome. Cyan **star 0** (pano origin) is locked. Red cameras **1, 2, 3…** are draggable. Each camera has a **cyan look arrow**. In `look_at_target`, one **orange look-at** aims every arrow (drag the orange). `look_forward` + drag a look arrow → `per_point_look`. FLOOR / SIDE / Preview flight use the three street plates in `docs/media/geo-*.png`.
21. **Seam INPAINT:** keep two recipes (TEXT node 31 vs IMAGE node 63). Do not copy TEXT onto 2D Images.
22. **360 Images size:** store as-is; visible **Upscale to 8K** runs the shared tail.

### Measured on this PC (not guessed)

| Item | Fact | Source |
|------|------|--------|
| ComfyUI Python | 3.13 (`python313._pth`) | `D:\ComfyUI_windows_portable_360\python_embeded\python313._pth` |
| ComfyUI torch | `2.13.0+cu130` (CUDA 13.0) | `python_embeded\Lib\site-packages\torch\version.py` |
| Required Krea/WAN/LoRA files in that ComfyUI `models\` | **Not present** (no `.safetensors` found; `extra_model_paths.yaml` not configured) | Inventory 2026-08-31 |
| Copy-from-Comfy | **No-op until those files appear** | Same inventory |
| V1 app | Gradio + WSL2 + WorldFM + custom `train_splat_live.py` (not nerfstudio) | `Yik Votion WorldFM` |

### Still UNKNOWN (do not fill in)

- Exact PyTorch 2.x patch number for cu128 + Python 3.12 on Windows.
- Whether `gsplat` CUDA wheels exist for Python 3.12 + CUDA 12.8 on Windows (Phase 0 spike).
- Whether `triton-windows` / SageAttention build on this stack (optional accelerators).
- Exact Florence-2 Hub id / revision.
- MickmumpitzPanoWarp widget names other than the titled h_fov=70 (read `INPUT_TYPES` at node pin).
- Harmonize / UltimateSDUpscale extra widget names (copy arrays from the Krea JSON; name from node source at pin).
- Native Ostris Edit port on Windows (blocks **2D Images** until READY).
- Disk free space on `D:` for ~45–60 GB models.
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
  models\              HF downloads (and any future Comfy copies)
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

Sizes are **not** listed unless a source stated them. Download into `D:\Votion3DGS\models\…` matching Comfy folder names.

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

Florence-2 (Phase 1 auto-caption, optional): Microsoft Florence-2, Apache-2.0. **Exact repo id/revision UNKNOWN** until first successful P1 install — write it into `model_manifest.json`. Do not invent a quantized fork.

---

## VRAM profiles (Quality locked; others from named sources)

| Profile | GPU assumption | WAN | HiRes | Rails | Source |
|---------|----------------|-----|-------|-------|--------|
| **Quality (default)** | RTX 3090 24GB | 14B fp8 720p + LightX2V | 8K geometry mode | 4 | You locked this |
| Fast | 16GB class | GGUF Q4 **or** Matrix-3D 5B | 8K optional | 2–4 | Workflow note + Matrix-3D README |
| Scout | 12GB class | 5B + low-VRAM | skip | 1–2 | Matrix-3D README (~12GB 5B low-vram) |

Matrix-3D PanoLRM (~80GB in their README) is **out of 2.0**.

---

## P5 stretch (not a 2.0 blocker)

- Matrix-3D 5B as default Fast path
- SeedVR2 as an **experiment only**. Video: they upscaled Wan views with it; it was slow and did little. **Do not** substitute it for 8K geometry-mode reprojection.
- Matrix-3D optimization reconstruction as an advanced alternative to SphereSfM
- macOS: SplatKit SphereSfM is Windows/Linux only today

---

## HTML copies (dummy UI spec)

Open in a browser. The HTML is the **visual spec** for PySide6: window chrome, widgets, and viewports. Markdown stays the locked facts and graph numbers. If they disagree, the HTML dummy plus this certainty log win over leftover ASCII mockups.

Shared window (every dummy `.desk`):

- Title bar **Votion 3DGS**, brand row, six **stage chips** that navigate Home / Panorama / Geometry / Generate / Reconstruct / Splat.
- **Left rail** = page controls. **Right viewport** = preview / editor.
- Bottom: **Log** drawer (subprocess) and **Help** drawer (page-specific copy). Not a Home accordion, not a seventh page.

| HTML | Dummy pages |
|------|-------------|
| [Index](Votion_3DGS_2.0_Index.html) | Home overview |
| [Phase 0](Votion_3DGS_2.0_Phase0.html) | Home: scene, profile, download, model status |
| [Phase 1](Votion_3DGS_2.0_Phase1.html) | Panorama: 2D / 360 / text, green FOV crop, seeds, Caption |
| [Phase 2](Votion_3DGS_2.0_Phase2.html) | Geometry (empty + Plot Camera rail), Reconstruct, Splat (Splat3 / MCMC) |
| [Phase 3](Votion_3DGS_2.0_Phase3.html) | Geometry (4 rails), Generate (WAN + HiRes mask split) |
| [Phase 4](Votion_3DGS_2.0_Phase4.html) | Splat Open-in… + Splat3 / MCMC, Home Help / `config.json` |

Interactive bits in the dummies (not screenshots of a running app): Panorama **h_fov** slider warps the green FOV window; Geometry **drag cameras 1–3** and the **orange look-at**; Splat **Splat3 / MCMC** chips (`docs/rail-dummy.js`).

Unreal import target is **UE 5.5** + **MLSLabsRenderer** (interim). Update slot held for a future better UE splat renderer.
