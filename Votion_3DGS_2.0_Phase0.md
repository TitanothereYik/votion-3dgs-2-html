# Votion 3DGS 2.0 — Phase 0: Desktop skeleton

**Depends on:** nothing  
**Unlocks:** Phase 1 (pano: 2D Images / 360 Images / text → 8K ERP)  
**Out of scope:** diffusion, MoGe, WAN, SfM, training  
**Code home:** `D:\Votion3DGS\`  
**Nav:** [Index](Votion_3DGS_2.0_Index.md) · P0 · [P1](Votion_3DGS_2.0_Phase1.md) · [P2](Votion_3DGS_2.0_Phase2.md) · [P3](Votion_3DGS_2.0_Phase3.md) · [P4](Votion_3DGS_2.0_Phase4.md)

---

## Goal

A native Windows desktop window named **Votion 3DGS** that can start, show model status, download missing Hugging Face weights into `<install_root>\models` (Hub cache in `<install_root>\.hf_cache`), and run a **cancelable job queue** as **subprocesses**. No browser, no WSL, no ComfyUI UI.

This phase does **not** generate panoramas or splats.

---

## Locked facts for this phase

- Independent venv: **Python 3.12** + **CUDA 12.8** + PyTorch **cu128** wheel. Do **not** reuse `D:\ComfyUI_windows_portable_360\python_embeded` (that is Python 3.13 + torch 2.13.0+cu130).
- Exact PyTorch patch: **UNKNOWN** until first successful `pip install`. Write it to `requirements.lock`.
- Weights: look in `D:\ComfyUI_windows_portable_360\ComfyUI\models` first; **inventory on 2026-08-31 found none of the required `.safetensors`**. Then download from the URLs on the [Index](Votion_3DGS_2.0_Index.md). Hub cache is `<install_root>\.hf_cache\` (install folder the user will choose in Inno Setup; P0/dev root is `D:\Votion3DGS`). Ready files go to `<install_root>\models\`. Do **not** write Hub cache to `C:\Users\<user>\.cache\huggingface`.
- GPU default: RTX 3090, index 0 unless the user picks another CUDA device.
- Visual system: port tokens from `Yik Votion WorldFM/ui/theme.css` (JetBrains Mono, dark cyanotype). Do not invent a new brand palette.

---

## Deliverables

1. Folder `D:\Votion3DGS\` with the tree on the Index page (empty `engine` packages with `__init__.py` is enough).
2. PySide6 main window: title **Votion 3DGS**, scene name field, GPU index, Log drawer, Help drawer, **Download models**, **Stop**.
3. `tools/model_manifest.json` listing every file from the Index tables (id, repo, filename, local relative path, `public: true`). No invented file sizes.
4. `tools/download_models.py` — copy-if-exists from ComfyUI, else `huggingface_hub` into `<install_root>\.hf_cache` then hardlink/copy into `models\`. Each Home status cell shows a progress bar (`PROGRESS` lines; not log-only).
5. Model status machine: `MISSING_*` | `READY` (subset READY is OK in P0: downloader itself must work even if WAN files are still missing).
6. Job bus: start worker subprocess, stream stdout, cancel (port logic from `Yik Votion WorldFM/ui/job_control.py` — file exists). The strip under the chips shows job progress (`PROGRESS` lines), not log-only.
7. `tools/env_report.py` — writes `docs/env_report.txt` with: `nvidia-smi`, `python --version`, `torch.__version__`, `torch.version.cuda`. This is the anti-hallucination record.
8. `docs\` copy of these phase markdown files (and later HTML).

---

## Work steps (in order)

### 0.1 Create the repo on D:

P0 only needs `job_control` ideas and theme tokens. Copy `train_splat_live.py` in Phase 2.

### 0.2 Venv

```text
py -3.12 -m venv D:\Votion3DGS\.venv
.venv\Scripts\activate
python -m pip install --upgrade pip
# PyTorch: use the official cu128 command FROM pytorch.org at install time.
# Then: PySide6, huggingface_hub, httpx/tqdm
python tools\env_report.py
```

If Python 3.12 is not installed, **stop and install it** — do not silently use 3.13 from ComfyUI.

### 0.3 CUDA / gsplat spike (document, do not fake success)

After torch installs, try `import torch; torch.cuda.is_available()` on the 3090.

Then attempt `gsplat` install. **UNKNOWN** whether a Windows wheel exists for 3.12 + cu128. Outcomes to record in `env_report.txt`:

- wheel installs and a 1-step dummy raster works → P2 trainer path is unblocked
- also record that `DefaultStrategy` (Splat3) and `MCMCStrategy` (MCMC) import — both are required for the Splat page choice
- wheel missing / compile fails → P2 must say “trainer blocked; COLMAP export still proceeds” (external Brush) until solved

Do not claim gsplat works in the UI until this spike passes.

### 0.4 PySide6 shell

Pages (stubs with labels only except Home):

1. Home / scene  
2. Panorama (P1 fills this — **2D Images** / **360 Images** / **text**)  
3. Geometry  
4. Generate  
5. Reconstruct  
6. Splat  

Home is functional: scene name, profile dropdown (Quality / Fast / Scout — Fast/Scout **disabled** until P4), GPU index, model status list, Download, Stop. **Log** and **Help** are bottom drawers (not a permanent pane, not a Home accordion). Panorama Generate stays disabled until P1.

**HTML dummy:** [Phase 0 HTML](Votion_3DGS_2.0_Phase0.html). Window chrome is V1 Engineering Blueprint: title **Votion 3DGS**, stage chips (Home on), **job strip under the chips**, left rail (scene `alpine_01`, Quality, CUDA `0`, download set **P1 subset** vs All), right viewport = model status grid (`MISSING_*` / `READY`). During **Download models**, each cell has its own progress bar. Log + Help drawers. This is the shell every later page reuses.

### 0.5 Downloader

Lookup order per manifest entry:

1. `D:\ComfyUI_windows_portable_360\ComfyUI\models\<folder>\<filename>`
2. If found: copy (or hardlink if same drive) to `<install_root>\models\<folder>\<filename>`
3. Else: HF download into `<install_root>\.hf_cache\` (same volume), then hardlink/copy to that dest. Never `C:\Users\<user>\.cache\huggingface`.
4. Else: status `MISSING_<id>` with the URL from the Index (do not invent a second URL)

P0 may download **manifest-all** or a “P1 subset” (Krea 2 + LoRAs + VAE + CLIP + RealESRGAN; Florence-2 if captioning is enabled). Prefer a checkbox: `P1 subset` vs `All`. Default **P1 subset** so a Quality WAN 14B pull is not forced before Phase 3.

P2 subset (MoGe `model.pt`) can wait until Phase 2. SphereSfM binary can wait until Phase 2 if the SplatKit download helper is vendored then.

### 0.6 Subprocess isolation rule (from V1, keep)

The Qt process never `import torch` for inference. Workers are `python -m engine.workers.*`. P0 ships one dummy worker that prints 20 lines and exits, to prove cancel + log streaming.

---

## Files to add (expected)

```
D:\Votion3DGS\
  app\main.py
  app\windows\main_window.py
  app\theme.qss
  engine\job.py
  engine\workers\dummy.py
  tools\download_models.py
  tools\model_manifest.json
  tools\env_report.py
  tools\launch.bat
```

---

## Acceptance tests

- [ ] Double-click `tools\launch.bat` opens a desktop window titled **Votion 3DGS** (not a browser).
- [ ] `env_report.txt` exists and shows Python 3.12, CUDA 12.8 torch, `cuda.is_available() True` on the 3090.
- [ ] Download of **Krea 2 fp8 + CLIP + VAE** reaches `models\` (or a clear missing-URL error — not a hang). MoGe may still be missing.
- [ ] A Hub download writes cache under `<install_root>\.hf_cache\` (P0: `D:\Votion3DGS\.hf_cache`), not `C:\Users\<user>\.cache\huggingface`.
- [ ] During Download models, each Home status cell shows its own progress bar.
- [ ] Background jobs update the strip under the chips (dummy worker in P0).
- [ ] Dummy job streams logs; Stop ends the subprocess.
- [ ] No WSL, no `localhost:7860`, no ComfyUI process.

---

## Risks

| Risk | What we know | Mitigation |
|------|----------------|------------|
| gsplat vs 3.12/cu128 | Unknown on this PC | Spike in 0.3; fallback Brush in P2 |
| 3.12 not installed | Not checked | Install before venv |
| Driver too old for CUDA 12.8 | Not checked | `nvidia-smi` in env_report; stop if driver < 12.8 requirement |
| Disk | Not measured | Downloader checks free space before WAN 14B |

---

## Explicitly do not do in P0

- Do not wrap Gradio.
- Do not call WorldFM / HunyuanWorld.
- Do not vendor the full SplatKit tree until P2 (only job/theme).
- Do not pin a fictional torch version in docs after install — **write the real one**.
