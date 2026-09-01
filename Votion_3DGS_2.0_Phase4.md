# Votion 3DGS 2.0 — Phase 4: Productize

**Depends on:** Phases 0–3 working on the 3090 Quality path  
**Unlocks:** installable desktop product  
**Nav:** [Index](Votion_3DGS_2.0_Index.md) · [P0](Votion_3DGS_2.0_Phase0.md) · [P1](Votion_3DGS_2.0_Phase1.md) · [P2](Votion_3DGS_2.0_Phase2.md) · [P3](Votion_3DGS_2.0_Phase3.md) · P4

---

## Goal

Turn the engine into something a Windows user can install: Quality / Fast / Scout profiles, small installer (code + scripts, **not** 60 GB of weights), in-app field guide, crash reload, Unreal export checklist, **Open in Brush / LichtFeld / Postshot**.

Reuse ideas from `Yik Votion WorldFM/docs/SmallInstaller_EasyUsers_Plan.md` (ungated HF only, no token UI) — but **native Windows**, not WSL.

---

## Locked facts

- Small installer: app + venv bootstrap; models download post-install.
- No Hugging Face token UI for the default manifest (all listed files were public URLs in the Comfy notes).
- Profiles:

| Profile | WAN | HiRes | Rails | Notes |
|---------|-----|-------|--------|--------|
| Quality | 14B fp8 720p + LightX2V | 8K geometry | 4 | Locked default for 3090 |
| Fast | GGUF Q4 **or** Matrix-3D 5B | 8K optional | 2–4 | 5B weights optional download |
| Scout | 5B or skip WAN | skip | 1 | Plumbing / path check |

- In-app gsplat remains the trainer; the user chooses **Splat3** (default) or **MCMC** on the Splat page. External trainers are one-click folder open.
- Gaussian cap ~3M; document why 1M is wrong for 8K datasets (SplatKit HiRes doc).
- Crash reload: V1 already has “Reload path from disk” / “Reload 3DGS from disk” — port that behavior.

---

## Installer

Inno or NSIS (pick one at implement time; **UNKNOWN which you prefer** — default Inno if unset).

Start Menu:

1. Votion 3DGS (launch `tools\launch.bat`)  
2. Download models  
3. Setup (create venv, check NVIDIA driver)

Install dir default: `D:\Votion3DGS` (space-free, matches your code home). Also test a path with spaces.

Do **not** embed WAN 14B in the installer.

---

## Open in… (external trainers)

Mickmumpitz ends at COLMAP. Buttons on the Splat page:

- Open `outputs/<scene>/colmap` in Explorer  
- **Brush** — [github.com/ArthurBrussee/brush](https://github.com/ArthurBrussee/brush) if `brush.exe` is on PATH or a user-set path in Settings  
- **LichtFeld Studio** — [github.com/MrNeRF/LichtFeld-Studio](https://github.com/MrNeRF/LichtFeld-Studio); field guide: high primitive cap ~3M  
- **Postshot** — [jawset.com](https://www.jawset.com/)

If the exe is missing: open the docs URL, do not invent install flags.

---

## Unreal

**Locked (interim):** Unreal Engine **5.5** + **MLSLabsRenderer** for real-time `splat.ply` playback (3DGS / 4DGS).

| | Link |
|--|------|
| GitHub (Lite / source) | [mlslabs/MLSLabsGaussianSplattingRenderer-UE](https://github.com/mlslabs/MLSLabsGaussianSplattingRenderer-UE) |
| Fab listing | [MLSLabs Gaussian Splatting Renderer](https://www.fab.com/listings/f91b57cc-958d-40dd-a455-2535bf00e588) |

Workflow: install/enable MLSLabsRenderer in the UE 5.5 project (copy `Plugins/MLSLabsRenderer` per their README), import `splat.ply`, place the Gaussian actor in the level. Field-guide recipe “first Unreal splat” should point here.

MoGe `pointcloud.ply` is **not** the Unreal asset (V1 README rule — keep it).

V1 used Luma AI / NanoGS — **superseded** for V2 interim by MLSLabs. Do not document Luma/NanoGS as the current path.

### Update slot — UE Renderer (future)

**Status:** empty placeholder. If a better Unreal 3DGS/4DGS player appears, drop it here and update the Index certainty log. Until then, MLSLabs remains the documented playback path.

---

## Field guide (in-app)

Port structure of `Yik Votion WorldFM/ui/field_guide.md`, rewritten for V2.

**Placement (locked 2026-08-31):** a **Help drawer** at the bottom of the window, same chrome as the Log drawer. Not a Home accordion, not a stage-chip page, not a seventh page.

**Copy (locked 2026-08-31):** page-specific. Home Help = this full V2 guide. Panorama Help = graph MarkdownNote id 4 with Votion labels. Geometry / Generate / Reconstruct / Splat Help = that stage’s recipe only.

**HTML dummy:** [Phase 4 HTML](Votion_3DGS_2.0_Phase4.html). Two windows:

1. **Splat** — **Splat3 | MCMC** chips, Continue train, Reload 3DGS from disk, Open in Explorer / Brush / LichtFeld / Postshot. Viewport = splat playback stand-in. Help = strategy + Brush click path + UE 5.5 MLSLabsRenderer.
2. **Home / settings** — Quality / Fast / Scout dropdown (P4 unlocks Fast/Scout). `config.json` hint. Help drawer holds the field guide (not an accordion in the viewport).

Installer is a `.pipe` diagram (Inno/NSIS → Start Menu → install dir), not an in-app page.

Content to port:

- Inputs (Phase 1, three first-class modes): **(1) 2D Images → ERP (default)**, **(2) 360 Images**, **(3) text → ERP**. Happy path is (1) → Phase 2 splat → Phase 3 WAN.
- **2D Images** surroundings: type a sentence **or** local Florence-2 caption (editable). Empty manual box → block Generate. Graph demo `Professional photography of living room.` is a demo string, not a silent default.
- **2D Images blocked** until native Ostris Edit is READY. **360 Images** and **text** are not blocked.
- **text:** keep the Krea 360 trigger prefix; one sentence for the actual scene.
- **2D Images:** green wrap; surroundings prompt; h_fov slider default **70**; check 360 preview for stretch.
- WAN prompt must match the pano
- Look modes: `look_forward` (Look Forward), `look_at_target`, `per_point_look` (Per Point Look). Height is the Y of a knot, not a dropdown.
- **Preview the mesh drone flight** (FLOOR + SIDE) before Generate. Star = origin. Four rails usually enough; optional 5th. Wall clip = Wan invents the other side (intentional).
- 8K reprojection: do not skip in Quality. SeedVR is **not** the sharpness lever.
- Glass/mirrors: extra rails will not fix MoGe (SplatKit HiRes “known limits”). Water/spec should stay **view-dependent** after splat train (video pond).
- Why 3DGS: polygons fail on foliage / hair / glass; Gaussians are ellipsoids + spherical harmonics, real-time, no ray tracing.
- Open in Brush (video click path): Brush → Directory → `outputs/<scene>` (COLMAP folder) → Start. Live cloud on top, training frame below.
- In-app train: pick **Splat3** (default) or **MCMC** before Train. Continue keeps the checkpoint’s strategy.
- Recipes: first Unreal splat (MLSLabsRenderer); fast path check; corridor; orbit / pond circle / high-then-descend

---

## Settings to persist (`D:\Votion3DGS\config.json`)

- GPU index  
- ComfyUI root (default `D:\ComfyUI_windows_portable_360`) for copy-if-exists  
- Paths to Brush / LichtFeld / Postshot  
- Last scene name  
- Profile  
- Last splat strategy (`splat3` or `mcmc`)  

Do not store HF tokens.

---

## Acceptance tests

- [ ] Fresh Windows 11 + 3090: Setup → Download Quality models → Launch → **2D Images (or 360 Images / text)** → 8K ERP → Confirm rails → Generate → `splat.ply` without WSL or ComfyUI running. 2D Images requires Ostris READY; until then, 360 Images / text still complete the product loop.
- [ ] Splat page: **Splat3** (default) and **MCMC** both train to `splat.ply`; switching requires Retrain.
- [ ] Fast/Scout selectable; Scout skips HiRes.
- [ ] Kill mid-WAN: cancel works; scene reloadable.
- [ ] Open-in-Explorer on COLMAP works even if Brush is not installed.
- [ ] Installer is small relative to model pack.
- [ ] `splat.ply` imports and plays in UE 5.5 via MLSLabsRenderer (manual check; record in `unreal_check.txt`).

---

## P5 reminder (not this phase)

5B as Fast default, SeedVR2 **experiment only** (video: slow, little gain vs 8K reproject), macOS, Matrix-3D opt reconstruction — see [Index](Votion_3DGS_2.0_Index.md).

---

Open these HTML pages in a browser. Markdown siblings remain the editable source.

If implementation starts, keep HTML in sync with the markdown (or treat HTML as generated from markdown in a later step).
