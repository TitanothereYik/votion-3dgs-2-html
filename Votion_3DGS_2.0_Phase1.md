# Votion 3DGS 2.0 — Phase 1: 2D Images / 360 Images / text → 8K ERP

**Depends on:** Phase 0 window + venv + Krea 2 weights (Florence-2 if auto-caption is used)  
**Unlocks:** Phase 2 (MoGe → one rail → first `splat.ply`)  
**Out of scope:** MoGe, WAN, SphereSfM, Gaussian train  
**Graph:** `d:\AI_3DGS\260825_MICKMUMPITZ_Krea2-360Pano-Creator_1-0.json`  
**Nav:** [Index](Votion_3DGS_2.0_Index.md) · [P0](Votion_3DGS_2.0_Phase0.md) · P1 · [P2](Votion_3DGS_2.0_Phase2.md) · [P3](Votion_3DGS_2.0_Phase3.md) · [P4](Votion_3DGS_2.0_Phase4.md)

---

## Goal

The 2.0 happy path is **one 2D image → a full 3DGS scene**. This phase only makes the **8K equirectangular panorama**. Phase 2 turns that file into the first splat. Phase 3 fills holes with WAN.

Three inputs, one output (`outputs/<scene>/pano.png`):

| UI mode | Graph MODE | What happens |
|---------|------------|----------------|
| **1 2D Images (default)** | `false` = B IMAGE→PANO | Warp 2D image onto green ERP → Ostris Edit + ERP outpaint LoRA → seam → 8K |
| **2 360 Images** | skip Krea | User file is already 2:1 ERP (Poly Haven, 360 camera, or a previous run) |
| **3 text** | `true` = A TEXT→PANO | Krea 2 Turbo + 360 T2I LoRA → seam → 8K |

How-to text is **in the graph** (MarkdownNote id 4). Copy it into the Panorama page help. Do not rewrite the meaning.

---

## Locked facts (from you + the JSON — not inferred)

- Product default is **2D Images**. **360 Images** and **text** stay first-class.
- Native Python. No ComfyUI in the product. No WSL.
- **Ostris Edit** (`Krea2OstrisEditModelPatch` + `TextEncodeKrea2OstrisEdit`, pack [ostris/ComfyUI-Krea2-Ostris-Edit](https://github.com/ostris/ComfyUI-Krea2-Ostris-Edit) pin `7756566160c4a1b24bb1bd9f0ff3ced1a83d7547` in the graph): native port **READY** (2026-09-03). 2D Images Generate is enabled. Do **not** shell out to ComfyUI.
- Surroundings (2D Images): user types a sentence **or** runs **Florence-2** (open-source, local) to caption the 2D image, then **may edit** the box before Generate. Always append **`no peoples, no cars`** (typed or caption). Empty box still blocks Generate. Hub: `florence-community/Florence-2-large` rev `4271c66b88cdbc05735372ec13b2360108de5317`.
- **h_fov:** slider **and** typed number, default **70**, range **10–170**, step **0.5** (`MickmumpitzPanoWarp` `INPUT_TYPES`). **Live Warp preview** on the 2:1 pane: green `#00ff00` ERP canvas, curved FOV window, `+` crosshair, bar `2048 × 1024` (locked 2026-08-31). That 70 is widget index 3 on `MickmumpitzPanoWarp` titled “Photo on ERP canvas (set h_fov)” (graph title — keep). **Other warp slots stay unnamed** until `INPUT_TYPES` is read from [ComfyUI-Mickmumpitz-Nodes](https://github.com/mickmumpitz/ComfyUI-Mickmumpitz-Nodes) at graph pin `e3df7e1199c8170335fe8c7d3dc0ecf1839d2784`. Raw widget list to copy, do not invent labels: `[2048, 1024, 1, 70, 0, 0, 0, 2, 10, 0.55, "#000000"]` (width/height also linked from ResolutionPicker).
- Generate resolution: **2048×1024** (ResolutionPicker “Pano resolution (keep 2:1)”). Final: **8192×4096** (second ResolutionPicker + `ImageScale` lanczos).
- ComfyUI required a dummy INPUT IMAGE even in text mode. **Votion must not.**

---

## 2D Images (graph groups ④ / ④a–c + ⑤)

Copied from the JSON. Do not invent nodes.

```
2D image
  → MickmumpitzPanoWarp (h_fov type or drag, default 70, 10–170 step 0.5)
  → green canvas #00ff00 + ImageCompositeMasked “Control canvas (photo on green)”
  → Krea2OstrisEditModelPatch (widget true) + ERP OUTPAINT LoRA krea2_oedit_360_erp_outpaint_lora_v1 strength 1
  → TextEncodeKrea2OstrisEdit
       positive = outpaint instruction + " " + surroundings sentence
  → ModelSamplingFlux “IMAGE→PANO (do not touch)” widgets 0.90625, 0.5, 2048, 1024
  → KSampler IMAGE→PANO: seed 12345 fixed, steps 10, cfg 1, er_sde, simple, denoise 1
  → Harmonize boundary (widgets 1, 8, 800, true — names from node source at pin)
  → Put original 2D image back (ImageCompositeMasked)
  → roll 50% → SEAM INPAINT node **63** (IMAGE path, not the text seam) → roll back
  → shared 8K tail (⑤)
```

**Outpaint instruction (leave as-is)** — graph node title, do not strip:

`Fill the green spaces according to the image. Outpaint as a seamless 360 equirectangular panorama (2:1). Keep the horizon level. Match left and right edges.`

**Surroundings** — graph demo widget is `Professional photography of living room.` That is **demo content**, not a hidden default. Always append **`no peoples, no cars`** to typed text and to Florence-2 captions. If the box is empty (before suffix) → **block Generate**. If they chose Florence-2, fill the box from the caption + suffix, then they can edit.

**StringConcatenate** “Prompt = instruction + scene” separator is a single space (`" "`). After a successful 2D Images Generate, write that same concat to `prompt.txt` for later WAN (locked 2026-08-31).

UNET / CLIP / VAE / LoRA filenames: see [Index](Votion_3DGS_2.0_Index.md). CLIPLoader: `qwen3vl_4b_fp8_scaled.safetensors`, type `krea2`. UNET: `krea2_turbo_fp8_scaled` (3090). Not nvfp4.

---

## text (graph groups ③ / ③a–b + ⑤)

```
trigger prefix + user scene sentence
  → CLIPTextEncode 🌍 SCENE PROMPT
  → empty negative (ConditioningZeroOut, cfg 1)
  → 360 PANO LoRA krea2_t2i_360_erp_lora_v1 strength 1
  → KSampler TEXT→PANO: seed 322344328372862 fixed, steps 10, cfg 1, er_sde, simple, denoise 1
  → roll 50% → SEAM INPAINT node **31** (TEXT path) → roll back
  → shared 8K tail
```

**Trigger prefix (leave as prefix).** Graph widget on `🌍 SCENE PROMPT`:

`img-txt-2-360 A full 360 degree equirectangular panorama in 2:1 spherical projection,`

User text is appended after that comma. UI must lock the prefix.

Empty scene sentence → **block Generate**. After a successful text Generate, write `prompt.txt` = locked trigger prefix + user sentence (the full Krea prompt) for later WAN (locked 2026-08-31).

---

## 360 Images

- File picker, 2:1 only. Reject non-2:1; do not letterbox.
- Store as-is even if width ≠ 8192. Visible **Upscale to 8K** runs the shared 8K tail (locked 2026-08-31). Quality HiRes later refuses if width ≠ 8192.
- Keep the **upscaler prompt** box on this rail (graph ⑤). Default `High resolution photography`.
- No Krea, no Ostris, no Florence-2 required.
- Still store `prompt.txt` (needed later for WAN). Empty is OK in P1; Phase 3 blocks WAN if empty.

---

## Shared 8K tail (graph ⑤) — **2D Images** and **text** only

Copied from JSON node titles/widgets:

1. Real-ESRGAN `ImageUpscaleWithModel` (`RealESRGAN_x2.pth`)
2. `ImageScale` lanczos → 8192×4096
3. `ImageCASharpening+` amount **0.5** (ComfyUI_essentials)
4. `ImageAddNoise` seed 0 fixed, **0.01**
5. `UltimateSDUpscaleNoUpscale` — tiled refine. Tile w/h linked from PrimitiveInt **1024** (overrides the 512 widgets on the node). Sampler widgets on node **77**, copy this list into `engine/pano/defaults.py` with `from Krea json node 77`:
   `[0, "fixed", 2, 1, "er_sde", "simple", 0.15, "Linear", 512, 512, 32, 64, "None", 1, 64, 8, 16, true, false, 1]`
   Pack pin in graph: `ssitu/ComfyUI_UltimateSDUpscale` `627c871f14532b164331f08d0eebfbf7404161ee`. Diffusion **model** input is Unbundle slot `MODEL` (base Krea, node 68 slot 0) — not `MODEL_360` / `MODEL_EDIT`. Do not invent names for the trailing ints until `INPUT_TYPES` is read.
6. Upscaler prompt CLIPTextEncode: visible box, default `High resolution photography`, user may edit (locked 2026-08-31). Video: do **not** put scene details here.
7. Save `outputs/<scene>/pano.png`. 360 preview.

If UltimateSDUpscale cannot be ported: that is a **Quality blocker**. Do **not** ship Real-ESRGAN 2× + lanczos as Quality. Quality 8K tail **must match graph ⑤** (locked 2026-09-01).

**Seam INPAINT is not shared.** Two KSamplers in the JSON (id 86 is only a label, ignore it):

| Path | Node | Title | Model unbundle slot | Positive | Widgets |
|------|------|--------|---------------------|----------|---------|
| TEXT ③b | **31** | SEAM INPAINT (Krea) | `MODEL_360` (node 26 slot 1) | same SCENE PROMPT CLIP encode (node 21) | seed **8** fixed, steps 10, cfg **1**, `er_sde`, `simple`, denoise **0.55** |
| IMAGE ④c | **63** | SEAM INPAINT (Krea, reference rolls along) | `MODEL_EDIT` (node 53 slot 2) | `MickmumpitzPanoKrea2Reference` “Rolled reference (positive)” node 58 (`widgets_values: [8]`) | seed **12345** fixed, steps 10, cfg **4**, `euler`, `simple`, denoise **0.45** |

Do **not** copy the TEXT seam recipe onto the **2D Images** path. IMAGE seam also uses a rolled reference as negative (node 59). Widget `8` on PanoKrea2Reference is unnamed until `INPUT_TYPES` at the Mickmumpitz-Nodes pin.

---

## UI (Panorama page)

Dummy: [Phase 1 HTML](Votion_3DGS_2.0_Phase1.html). Same window chrome as P0 (chips, job strip, left rail, viewport, Log + Help drawers). Switching chips restores the generated 8K ERP (not the green warp).

### Left rail

- Toggle: **2D Images (default)** / **360 Images** / **text**. Native Ostris is READY — 2D Generate is enabled when a photo is loaded and surroundings are non-empty (locked 2026-09-03).
- **2D Images:** image drop **shows a thumbnail**. **h_fov** slider **and** typed number, default **70**, range **10–170**, step **0.5**. Surroundings radios **Type a sentence** | **Florence-2 caption, then edit**, **Caption** button only when Florence-2 is selected (`engine.workers.caption`). Always append **`no peoples, no cars`**. Seeds IMAGE→PANO `12345` and seam INPAINT (node 63) `12345`. Upscaler prompt `High resolution photography`.
- **360 Images:** 2:1 picker; `prompt.txt` (empty OK in P1); **Use as pano.png** and **Upscale to 8K**; keep the upscaler prompt box.
- **text:** locked trigger prefix, scene sentence, `prompt.txt` preview = prefix + sentence, seeds TEXT→PANO `322344328372862` and seam (node 31) `8`, Generate enabled.

### Viewport

- Split is **user-draggable**. **Left** 2:1 ERP. **Right** spherical look (yaw + pitch) — HDRI-style, not a pan-only unwrapped strip.
- Left pane **Fit** = full picture in the pane. **100%** = native pixels + 2D slide. Right 360 pane stays the spherical look.
- **2D Images before Generate:** left is the Warp **green `#00ff00` ERP canvas** (2:1), photo in a **curved FOV window**, **+** crosshair, footer **2048 × 1024**. Type or drag h_fov to widen/narrow that window. Right 360 is the same still, warped to a sphere. After a successful Generate, left becomes the **8K ERP** and right looks around that file.
- **360 Images / text:** left = unwrapped 2:1 ERP, right = spherical look of that file.

### Drawers

- **Log:** `engine.workers.pano` / caption status.
- **Help:** graph MarkdownNote id 4 with Votion labels (do not rewrite the meaning).

Docs section **02** under the dummy is a **3-column equal-height** card grid (2D / 360 / text), not a free-flowing figure dump. Graphs in **03** are `.pipe` diagrams, not numbered lists.

---

## Worker

`engine.workers.pano` — one process, then exit (VRAM back before Phase 2 MoGe).

Florence-2 is a **separate** short job (`engine.workers.caption`) that only fills the text box. It does not Generate the pano.

---

## Acceptance tests

- [ ] **2D Images** is the default toggle.
- [ ] **360 Images:** 2:1 file becomes `pano.png` without Krea.
- [ ] **text:** 2:1 image **without** a 2D input image; trigger prefix still on the Krea prompt.
- [ ] **2D Images:** Generate is enabled when Ostris is READY, a photo is loaded, and surroundings are non-empty.
- [ ] **2D Images:** original image region recognizable; outpaint instruction string unchanged; left/right seam not a visible cut in the 360 viewer.
- [ ] Florence-2 fills the surroundings box **and** appends `no peoples, no cars`; user can edit; empty manual box blocks Generate.
- [ ] Typed surroundings also end with `no peoples, no cars` in `prompt.txt`.
- [ ] Left 2:1 **Fit / 100%** and a draggable split; right 360 tilts and looks spherical.
- [ ] After Generate, switching chips away and back still shows the 8K ERP (not the green warp).
- [ ] **h_fov** accepts a typed value as well as the slider (10–170, step 0.5).
- [ ] **2D Images** and **text:** final size **measured** (expect 8192×4096) and recorded in `env_report` / scene log.
- [ ] Same 8K file is what Phase 3 HiRes uses as geometry pano **and** texture.

---

## Risks · do not

- Do not shell out to ComfyUI.
- Do not invent Warp widget names; read `INPUT_TYPES` at the Mickmumpitz-Nodes pin.
- Do not invent a Florence-2 Hub revision — pin the first working id in the manifest (done: `florence-community/Florence-2-large` @ `4271c66`).
- Do not generate at 8K natively in Krea. Do not skip seam roll.
- Do not strip trigger prefix / outpaint instruction / surroundings suffix `no peoples, no cars`.
- Do not bring HunyuanWorld / FLUX Fill back.

---

Open the HTML sibling in a browser. Keep HTML in sync with this markdown.
