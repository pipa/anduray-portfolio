"""Placeholder "idea" sketches, made by filtering the finished pieces.

The page multiplies every sketch onto the sheet colour, so a real pencil
thumbnail (a scan or phone photo on white paper, any aspect ratio, any
format) can replace a file here one for one, or be pointed at with the
board's data-sketch / data-sketch-small attributes.

    python3 make-placeholders.py        (needs Pillow + numpy)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

HERE = Path(__file__).parent
WORK = HERE / "../../../assets/work"
PIECES = [
    "montanita-5", "dengue-1", "estilo-5",           # hero cycle
    "montanita-4", "dengue-2", "estilo-1", "banpais-2",
    "buenprovecho-1", "filmfest-3", "h2box-front",   # case-study boards
]
INK = np.array([59, 55, 48], float)   # darkest graphite
BLUR, PRE_BLUR, GAMMA = 8, 1, 1.6     # fitted to Muse's proto sketches
DARKEST = 0.4                         # percentile of pixels pushed to full graphite


def pencil(img):
    g = img.convert("L").filter(ImageFilter.GaussianBlur(PRE_BLUR))
    ga = np.asarray(g, float)
    inv = Image.fromarray((255 - ga).astype(np.uint8)).filter(ImageFilter.GaussianBlur(BLUR))
    dodge = np.clip(ga * 255 / np.maximum(1, 255 - np.asarray(inv, float)), 0, 255) / 255
    lo = min(np.percentile(dodge, DARKEST), 0.6)  # flat duotones barely register; stretch them
    dodge = np.clip((dodge - lo) / (1 - lo), 0, 1)
    d = (dodge ** GAMMA)[..., None]
    return Image.fromarray((INK + d * (255 - INK)).astype(np.uint8), "RGB")


for name in PIECES:
    out = pencil(Image.open(WORK / f"{name}.webp"))
    out.save(HERE / f"{name}.webp", quality=68, method=6)
    small = out.resize((640, round(out.height * 640 / out.width)), Image.LANCZOS)
    small.save(HERE / f"{name}-640.webp", quality=66, method=6)
    print(name, out.size)
