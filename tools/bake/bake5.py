"""Front three-quarter portraits for story scenes: one row of four frames per runner (idle, blink, cheer A, cheer B).
Usage: BAKE_SS=6 BAKE_OUT=1.5 BAKE_Q=84 python3 bake5.py <out dir> boy/street dino/plain calf ..."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bake as B, bake4 as B4
from PIL import Image
FRONT = B.YAW + .42
def strip(kind, outfit):
    atlas = Image.new("RGBA", (B.OW * 4, B.OH))
    for i, f in enumerate((10, 11, 13, 14)):
        cv = B4.Canvas(yaw=FRONT); B4.JOBS[kind](cv, outfit, f); atlas.paste(cv.image(), (i * B.OW, 0))
    return atlas
if __name__ == "__main__":
    out = sys.argv[1]
    for j in sys.argv[2:]:
        kind, outfit = (j.split("/") + ["plain"])[:2]
        name = f"front_{kind}_{outfit}.webp" if "/" in j else f"front_{kind}.webp"
        strip(kind, outfit).save(f"{out}/{name}", quality=int(os.environ.get("BAKE_Q", 84)), method=6); print(j, "ok", flush=True)
