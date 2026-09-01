# Video Summary: We Open Sourced World Generation
**Creator:** Mickmumpitz | **Video Link:** [YouTube](https://www.youtube.com/watch?v=eJuYBNrD8HI)

This document provides a full structural breakdown and resource guide for generating explorable 3D environments from a single 2D image or text prompt using locally executed open-source AI models and [ComfyUI](https://www.comfy.org/).

---

## 1. Core Concepts & Technical Foundation

* **3D Gaussian Splatting [00:01:50]:** Replaces standard polygon meshes with clouds of millions of semi-transparent 3D ellipsoids ("blobs"). Each ellipsoid stores position, scale, rotation, opacity, and spherical harmonics (angle-dependent color/brightness). This enables real-time rendering of complex visuals like reflections, translucency, fine foliage, and specularity without ray tracing or shaders.
* **The High-Resolution Reprojection Trick [00:05:00]:** Generative video models (like Wan 2.1) cap out at 720p resolution, which becomes blurry when stretched across a 360° field of view. To solve this, the pipeline reprojects the original high-resolution 8K input image back onto the generated camera views using known depth and geometry data.
* **Synthetic Drone Training Data [00:04:40]:** The underlying Matrix-3D model relies on a Wan 2.1 LoRA trained by flying a virtual 360° drone inside Unreal Engine 5 across 500 game environments to teach the model consistent parallax and movement.

---

## 2. Research & Tested Models Summary

During development, several state-of-the-art monocular 3D and world-generation models were evaluated:

| Model / Paper | Strengths | Limitations / Key Findings |
| :--- | :--- | :--- |
| **Apple SHARP** | Predicts 3D Gaussian Splats in under a second from 2D images. | Slice-360 + stitch = ugly seams. Does not invent off-axis detail. Non-commercial license. MoGe alignment still failed those two. |
| **Insta360 UniSHARP** | Super fast 360° world reconstruction. | Scene geometry breaks down quickly when moving off-center. |
| **Tencent HY-World 2.0** | High generation quality. | Two huge models in memory at once; designed for four GPUs. |
| **NVIDIA Lyra** | Complete 3D environment generation. | 91 GB checkpoint size; Linux-only; ~6 min first start. |
| **Skywork Matrix-3D** *(Selected)* | Pairs rough depth mesh with Wan 2.1 video inpainting LoRA (UE5 drone fleet, 500 games). | Native 720p output, resolved via high-res texture reprojection. |
| **World Labs Marble** | Fast generation, crisp rendering (Closed Source reference). | Restricted movement area; no working reflections. |
| **SeedVR (upscale try)** | Video upscaler on Wan views. | Slow; “didn’t do too much.” Not the sharpness path — 8K reproject is. |

---

## 3. Step-by-Step ComfyUI Workflow

1. **360° Panorama Creation [00:08:00]:**
   * **Text-to-Panorama:** Uses a custom Krea 2 LoRA to output equirectangular 360° images, followed by an automated seam-fixing node (seam strip only) and an upscaling pass. Keep the LoRA trigger prefix (`img-txt-2-360 A full 360 degree equirectangular panorama in 2:1 spherical projection,`). Upscaler prompt stays simple (`High resolution photography`).
   * **Outpainting an Image:** Places an uploaded 2D picture onto a green background; a dedicated LoRA fills in the remaining 360° environment. Outpaint instruction is leave-as-is; check stretch in a 360 preview.
2. **Pathing & Synthetic Dataset Generation [00:11:30]:**
   * Computes scene depth using Microsoft MoGe to establish rough geometry.
   * Uses custom SplatKit nodes to plot camera trajectories (Forward-Look, Per-Point Look, or Height adjustments). Top-down + side drone preview; all paths start at the pano-center star. Preview the mesh flight before Wan. Four rails usually enough. Flying through a wall is allowed (Wan invents the far side).
   * Generates multi-angle videos using Matrix-3D and Wan 2.1. SageAttention patch used to avoid black frames.
3. **High-Res Composite & COLMAP Export [00:14:55]:**
   * Projects the 8K original texture back over the video sequence.
   * Formats camera data and frames into a COLMAP-compatible dataset folder.
4. **Gaussian Splat Training [00:15:45]:**
   * Imports the generated COLMAP dataset into trainers like Brush, LichtFeld Studio, or Postshot to finalize the 3D environment.

---

## 4. Complete Reference Links & Resource Directory

### Primary Tools & Selected Pipeline
* **ComfyUI:** [Official Webpage](https://www.comfy.org/)
* **Skywork Matrix-3D:** [GitHub Repository](https://github.com/SkyworkAI/Matrix-3D) | [Research Paper (arXiv)](https://arxiv.org/abs/2508.08086) | [Project Page](https://matrix-3d.github.io/)
* **Wan 2.1 Video Model:** [GitHub Repository](https://github.com/Wan-Video/Wan2.1)
* **LightX2V:** [GitHub Repository](https://github.com/ModelTC/LightX2V)
* **Microsoft MoGe:** [GitHub Repository](https://github.com/microsoft/MoGe)
* **Krea 2:** [Krea 2 Technical Report](https://www.krea.ai/blog/krea-2-technical-report)

### Splat Training & Dataset Tools
* **Brush Splat Trainer:** [GitHub Repository](https://github.com/ArthurBrussee/brush)
* **LichtFeld Studio:** [GitHub Repository](https://github.com/MrNeRF/LichtFeld-Studio)
* **Postshot:** [Jawset Official Site](https://www.jawset.com/)
* **COLMAP:** [Official Documentation](https://colmap.github.io/)
* **Poly Haven HDRIs:** [Poly Haven Assets](https://polyhaven.com/hdris)

### Hardware Acceleration & Optimizations
* **SageAttention:** [GitHub Repository](https://github.com/thu-ml/SageAttention)
* **Triton:** [GitHub Repository](https://github.com/triton-lang/triton)

### Evaluated Research & Models
* **Apple SHARP:** [GitHub Repository](https://github.com/apple/ml-sharp) | [Research Paper (arXiv)](https://arxiv.org/abs/2512.10685) | [Project Page](https://apple.github.io/ml-sharp/)
* **Insta360 UniSHARP:** [GitHub Repository](https://github.com/Insta360-Research-Team/UniSHARP) | [Project Page](https://insta360-research-team.github.io/unisharp/)
* **Tencent HY-World 2.0:** [GitHub Repository](https://github.com/Tencent-Hunyuan/HY-World2.0)
* **NVIDIA Lyra:** [GitHub Repository](https://github.com/nv-tlabs/lyra)
* **ByteDance SeedVR2:** [GitHub Repository](https://github.com/ByteDance-Seed/SeedVR)
* **World Labs Marble:** [Platform Link](https://marble.worldlabs.ai/)

### Community & Workflows
* **Mickmumpitz Free Workflows:** [ComfyUI 360 Gaussian Splatting Guide](https://mickmumpitz.ai/posts/comfyui-360-gaussian-splatting-free-workflows)
* **Mickmumpitz Patreon:** [Patreon Page](https://www.patreon.com/mickmumpitz)
* **Mickmumpitz Twitter/X:** [Twitter Profile](https://twitter.com/mickmumpitz)