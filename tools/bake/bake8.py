"""v37 scenery set pieces: large toon landmarks that stand in a far row behind the path life, plus the parade floats.
Usage: BAKE_SS=4 BAKE_OUT=2 BAKE_Q=84 python3 bake8.py <out dir> [names...]
Writes scene.webp (packed tiles) and prints SCENE <json>: {unit, items: name -> [x, y, width, height, originX, originY]}
in atlas pixels. "unit" is atlas pixels per model unit. Second-colour forms are named "<type>+".
With the word "floats" as the first name it writes street_float<name>.webp strips (four frames) instead."""
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import bake as B, bake2 as B2, bake4 as B4, bake6 as B6
from bake import V, rz, ry, rx
from bake7 import CLAY, CLAY_D, WOOD, WOOD_D, TAN, STONE, STONE_D, LEAF, LEAF_D, BRASS, IRON, CREAM, RED, PINK, GOLD, TEAL, STEEL, BLACK, ORANGE, VIOLET, CYAN, Y, cyl, ring, stripes
from PIL import Image

TERRA = V(214, 110, 66); TERRA_D = V(166, 78, 54); HAY = V(240, 206, 110); SAND = V(232, 178, 116); SAND_D = V(196, 136, 88); LAMP = V(255, 214, 120); DARK = V(70, 44, 46)
straw = lambda q, c: (np.where((np.cos(q[:, 1] * 16 + q[:, 0] * 6) > .72)[:, None], V(214, 170, 80), c), q[:, 1] > -.3)
dome = lambda q, c: (c, q[:, 1] > -.12)
def bx(sh): return lambda q, c, ax: sh(q, c)     # a box shader also receives the face axis

class At:
    """Draws a model shifted and scaled."""
    def __init__(s, cv, d=(0, 0, 0), k=1.0): s.cv = cv; s.d = np.asarray(d, float); s.k = k
    def __setattr__(s, n, v):
        if n in ("cv", "d", "k"): object.__setattr__(s, n, v)
        else: setattr(s.cv, n, v)
    def __getattr__(s, n): return getattr(s.cv, n)
    def p(s, c): return np.asarray(c, float) * s.k + s.d
    def r(s, r): return (np.asarray(r, float) if not np.isscalar(r) else r) * s.k
    def ell(s, c, r, *a, **kw): return s.cv.ell(s.p(c), s.r(r), *a, **kw)
    def cone(s, a, b, ra, rb, *x, **kw): return s.cv.cone(s.p(a), s.p(b), ra * s.k, rb * s.k, *x, **kw)
    def frustum(s, a, b, ra, rb, *x, **kw): return s.cv.frustum(s.p(a), s.p(b), ra * s.k, rb * s.k, *x, **kw)
    def box(s, c, half, *a, **kw): return s.cv.box(s.p(c), s.r(half), *a, **kw)

def arc(cv, cx, cy, r, th, cols, z=0, n=12, a0=0.0, a1=math.pi, glow=0.0):
    pts = [V(cx + r * math.cos(a0 + (a1 - a0) * i / n), cy + r * math.sin(a0 + (a1 - a0) * i / n), z) for i in range(n + 1)]
    for i in range(n): cv.cone(pts[i], pts[i + 1], th, th, cols[i % len(cols)], glow=glow)
def pot(cv, x, y, z, r, col, band=None):
    sh = (lambda q, c: (np.where((np.abs(q[:, 1] - .15) < .13)[:, None], band, c), None)) if band is not None else None
    cv.ell(V(x, y + r * .9, z), (r, r * .9, r), col, shader=sh); cv.ell(V(x, y + r * 1.85, z), (r * .52, r * .2, r * .52), col * .8)

# ---------------- Red Earth Trail ----------------
def hut(cv, T):
    wall = V(226, 150, 98) if not T else V(238, 200, 146)
    cv.box(V(0, 14, 0), V(27, 14, 17), wall); cv.box(V(0, 3, 0), V(27.6, 3, 17.6), TERRA_D)
    for k in range(7): cv.ell(V(-24 + k * 8, 8.4, 17.5), (1.5, 1.5, .5), CREAM)
    cv.box(V(-7, 11, 17.3), V(5.4, 11, .6), DARK); cv.box(V(-7, 22.6, 17.5), V(6.6, 1.2, .7), WOOD_D)
    cv.box(V(14, 17, 17.3), V(4.6, 4.6, .6), DARK); cv.box(V(14, 17, 17.6), V(.6, 4.6, .4), WOOD); cv.box(V(14, 17, 17.6), V(4.6, .6, .4), WOOD)
    cv.ell(V(0, 34, 0), (38, 24, 27), HAY if not T else V(226, 184, 104), shader=straw); cv.ell(V(0, 56, 0), (9, 4, 7), V(214, 170, 80))
    pot(cv, 22, 0, 22, 5.2, CLAY, CREAM); pot(cv, 31, 0, 20, 3.8, TERRA)
    cv.cone(V(-30, 0, 14), V(-30, 26, 14), 1.2, 1.0, WOOD_D); cv.cone(V(-30, 24, 14), V(-22, 24, 17), .9, .9, WOOD_D)
def temple(cv, T):
    a, d = (TERRA, TERRA_D) if not T else (V(232, 150, 120), V(190, 104, 90))
    cv.box(V(0, 3, 0), V(35, 3, 24), d); cv.box(V(0, 7.4, 0), V(32, 1.6, 21), a)
    cv.box(V(0, 25, 0), V(27, 16, 17), a, lines=.5)
    for k in range(3):
        x = -16 + k * 16; cv.box(V(x, 18, 17.3), V(4.6, 9, .6), DARK); cv.ell(V(x, 27, 17.3), (4.6, 4.6, .6), DARK); cv.ell(V(x, 33.5, 17.5), (2, 2, .5), CREAM)
    for x in (-24, -8, 8, 24): cv.cone(V(x, 9, 17.6), V(x, 34, 17.6), 1.5, 1.5, d)
    cv.box(V(0, 38.5, 17.4), V(26, 1.6, .5), V(244, 196, 150))
    cv.ell(V(0, 41, 0), (34, 11, 24), d, shader=dome)
    cv.box(V(0, 56, 0), V(12, 7, 9), a, lines=.5); cv.box(V(0, 54, 9.3), V(3.4, 5, .5), DARK)
    cv.ell(V(0, 63, 0), (16, 6, 12.5), d, shader=dome); cv.ell(V(0, 71, 0), (7.5, 7, 7), a); cv.cone(V(0, 77, 0), V(0, 88, 0), 1.5, .3, GOLD); cv.ell(V(0, 82, 0), 2.1, GOLD)
def horse(cv, T):
    c = V(232, 124, 62) if not T else V(84, 70, 78); band = CREAM if not T else GOLD
    cv.box(V(0, 3, 0), V(22, 3, 11), STONE, lines=.5)
    for (x, z) in ((11, 4.4), (11, -4.4), (-11, 4.4), (-11, -4.4)): cv.cone(V(x, 6, z), V(x * .92, 30, z), 3.0, 3.8, c)
    cv.ell(V(0, 35, 0), (18, 9.4, 8.4), c); cv.ell(V(0, 43, 0), (8.6, 2.6, 8.8), band)
    cv.cone(V(11, 37, 0), V(17, 66, 0), 6.4, 4.4, c)
    for (y, x) in ((48, 13.2), (57, 15.1)): cv.ell(V(x, y, 0), (5.8, 1.5, 5.8), band, rot=rz(.2))
    cv.ell(V(22, 68, 0), (8.6, 4.8, 4.6), c, rot=rz(-.45)); cv.ell(V(27.5, 64.6, 0), (2.6, 2.2, 3.4), c * .8)
    for s_ in (1, -1): cv.cone(V(15, 70, 2.6 * s_), V(12.5, 90, 3.2 * s_), 2.3, .4, c); cv.ell(V(21, 70, 4.2 * s_), 1.5, BLACK)
    cv.cone(V(-17, 39, 0), V(-24, 28, 0), 2.6, 1.0, c)
    for k in range(5): cv.ell(V(-14 + k * 7, 5.2, 11.2), (1.4, 1.4, .5), band)
def pots(cv, T):
    cols = (CLAY, TERRA, V(226, 150, 98)) if not T else (V(226, 186, 120), CLAY, TERRA)
    for r_ in range(3):
        for i in range(4 - r_): pot(cv, -19 + r_ * 6.4 + i * 12.8, r_ * 10.4, -2, 6.6, cols[(r_ + i) % 3], CREAM if (i + r_) % 2 else None)
    pot(cv, -27, 0, 11, 5, cols[1]); pot(cv, 27, 0, 12, 7.4, cols[0], CREAM); pot(cv, 12, 0, 13, 4.2, cols[2])
    cv.cone(V(-34, 0, -4), V(-34, 40, -4), 1.1, 1.0, WOOD_D); cv.cone(V(34, 0, -4), V(34, 40, -4), 1.1, 1.0, WOOD_D); cv.cone(V(-34, 39, -4), V(34, 39, -4), .8, .8, WOOD_D)
    for k in range(4): cv.box(V(-22 + k * 14.5, 31, -4), V(5, 7, .5), (RED, CREAM, GOLD, TEAL)[k])
# ---------------- Firefly Courtyard ----------------
def house(cv, T):
    wall = V(168, 150, 164) if not T else V(128, 156, 176); wall2 = wall * .92; roof = V(134, 84, 96) if not T else V(96, 96, 130)
    cv.box(V(0, 20, -5), V(35, 20, 13), wall); cv.box(V(-9, 51, -7), V(22, 10, 10), wall2)
    cv.box(V(0, 41.4, 0), V(38, 1.6, 19), roof); cv.box(V(-9, 62.2, -7), V(24.5, 1.5, 12), roof)
    for k in range(6): cv.box(V(-29 + k * 8, 65, 4.4), V(2.4, 1.6, .6), wall2)
    for x in (-32, -11, 11, 32): cv.cone(V(x, 3, 14), V(x, 40, 14), 1.9, 1.7, CREAM); cv.box(V(x, 2, 14), V(3, 2, 3), STONE)
    cv.box(V(0, 2, 12), V(37, 2, 7), STONE_D)
    cv.box(V(0, 15, 8.3), V(6, 11, .6), V(96, 60, 54)); cv.ell(V(0, 26, 8.3), (6, 5, .6), V(96, 60, 54)); cv.ell(V(3.4, 14, 9), .9, BRASS)
    for x in (-21, 21): cv.box(V(x, 22, 8.3), V(6, 7, .6), LAMP, glow=.9); cv.box(V(x, 22, 8.7), V(.6, 7, .4), DARK); cv.box(V(x, 22, 8.7), V(6, .6, .4), DARK)
    for x in (-19, 1): cv.box(V(x, 52, 3.3), V(4.6, 5.6, .6), LAMP, glow=.9); cv.ell(V(x, 57.6, 3.3), (4.6, 3.4, .6), LAMP, glow=.9); cv.box(V(x, 51, 3.7), V(.5, 6, .4), DARK)
    for x in (-21.5, 21.5): cv.cone(V(x, 40, 15), V(x, 35, 15), .3, .3, IRON); cv.ell(V(x, 32.6, 15), (2.6, 3.4, 2.6), V(255, 170, 70), glow=.95); cv.ell(V(x, 36, 15), (1.6, .8, 1.6), IRON)
    cv.ell(V(30, 5, 20), (5, 4.6, 5), CLAY); [cv.ell(V(30 + dx, 12 + dy, 20), (3.4, 4.4, 3), LEAF if (dx + dy) % 2 else LEAF_D) for dx, dy in ((-3, 0), (3, 1), (0, 5))]
def gate(cv, T):
    wall = V(172, 154, 166) if not T else V(134, 160, 178)
    for x in (-26, 26):
        cv.box(V(x, 23, 0), V(5.6, 23, 5.6), wall, lines=.5); cv.box(V(x, 47.6, 0), V(7, 1.8, 7), STONE_D); cv.ell(V(x, 53, 0), (4.4, 4.4, 4.4), CREAM)
        cv.ell(V(x, 60.5, 0), (2.4, 3.2, 2.4), V(255, 170, 70), glow=.95); cv.box(V(x, 2.4, 0), V(7, 2.4, 7), STONE_D)
    arc(cv, 0, 44, 26, 3.2, (wall * .9, wall), n=14)
    for k in range(5):
        a = math.pi * (k + 1) / 6; x = 26 * math.cos(a); y = 44 + 26 * math.sin(a) - 3
        cv.cone(V(x, y, 1), V(x, y - 7 - (k % 2) * 3, 1), .3, .3, IRON); cv.ell(V(x, y - 10 - (k % 2) * 3, 1), (2.4, 3, 2.4), (LAMP, V(255, 170, 70), V(160, 240, 200))[k % 3], glow=.95)
    for k in range(7): cv.ell(V(-27 + math.sin(k * 1.7) * 3.6, 8 + k * 5.4, 6), (3.4, 3, 2.2), LEAF if k % 2 else LEAF_D)
def tulsi(cv, T):
    a = TERRA if not T else V(226, 220, 210)
    cv.box(V(0, 3, 0), V(13, 3, 13), STONE); cv.box(V(0, 12, 0), V(9, 6, 9), a, lines=.5); cv.box(V(0, 19.4, 0), V(10.6, 1.6, 10.6), a * .85)
    for (x, z) in ((-9, 9), (9, 9), (-9, -9), (9, -9)): cv.ell(V(x, 22.6, z), 2.2, a)
    for k in range(4): cv.ell(V(-6 + k * 4, 12, 9.3), (1.2, 1.2, .4), CREAM)
    for k, (dx, dy, dz) in enumerate(((0, 0, 0), (-4, 4, 1), (4, 5, -1), (0, 10, 0), (-3, 13, 2), (3, 15, -1), (0, 20, 0))): cv.ell(V(dx, 26 + dy, dz), (4.6, 5, 4.2), LEAF if k % 2 else LEAF_D)
    cv.cone(V(0, 20, 0), V(0, 40, 0), .8, .5, WOOD_D)
    for x in (-8, 8): cv.ell(V(x, 7, 14), (2.6, 1.3, 2.6), CLAY); cv.ell(V(x, 9.8, 14), (1.1, 2.1, 1.1), V(255, 220, 110), glow=1.0)
def lamp(cv, T):
    cv.box(V(0, 2, 0), V(5, 2, 5), STONE_D); cv.cone(V(0, 3, 0), V(0, 50, 0), 1.7, 1.3, IRON); cv.cone(V(0, 50, 0), V(10, 54, 0), 1.2, 1.0, IRON); cv.cone(V(10, 54, 0), V(10, 49, 0), .4, .4, IRON)
    cv.ell(V(10, 44, 0), (4.4, 5.4, 4.4), LAMP if not T else V(160, 240, 200), glow=1.0); cv.ell(V(10, 49.6, 0), (3.4, 1.2, 3.4), IRON); cv.ell(V(10, 38.6, 0), (2.4, 1, 2.4), IRON)
    for k in range(4): cv.ell(V(-3 + math.sin(k * 2.1) * 2.4, 8 + k * 6, 2), (2.6, 2.4, 2), LEAF_D if k % 2 else LEAF)
def cot(cv, T):
    cv.box(V(0, 11, 0), V(20, 1.3, 10), WOOD, shader=bx(stripes(WOOD, CREAM, 9, 0, .1)))
    for (x, z) in ((-19, 9), (19, 9), (-19, -9), (19, -9)): cv.cone(V(x, 0, z), V(x, 14, z), 1.5, 1.3, WOOD_D)
    cv.ell(V(-13, 14.6, 0), (5.4, 2.6, 7), RED if not T else TEAL); cv.box(V(6, 12.8, 0), V(10, .8, 8.6), V(250, 200, 120) if not T else PINK)
    cyl(cv, 0, 9, 4.4, 4.4, WOOD_D, x=30, z=6); cv.ell(V(30, 10.4, 6), (2.8, 1.4, 2.8), CLAY); cv.ell(V(30, 13.4, 6), (1.2, 2.3, 1.2), V(255, 220, 110), glow=1.0)
def wall(cv, T):
    a = V(168, 150, 164) if not T else V(128, 156, 176)
    cv.box(V(0, 8, 0), V(36, 8, 3.4), a, lines=.5); cv.box(V(0, 17, 0), V(37.4, 1.4, 4.6), STONE_D)
    for k in range(6): x = -30 + k * 12; cv.ell(V(x, 19.4, 0), (2.4, 1.2, 2.4), CLAY); cv.ell(V(x, 22, 0), (1.0, 2.0, 1.0), V(255, 220, 110), glow=1.0)
    for x in (-33, 33):
        cv.ell(V(x, 5, 8), (5, 4.6, 5), TERRA)
        for k, (dx, dy) in enumerate(((-3, 0), (3, 1), (0, 6), (-2, 10), (2, 12))): cv.ell(V(x + dx, 12 + dy, 8), (3.4, 4.4, 3), LEAF if k % 2 else LEAF_D)
# ---------------- Rajasthan Desert ----------------
def bigtent(cv, T):
    a, b2 = (RED, CREAM) if not T else (V(60, 110, 200), GOLD)
    for (x, z) in ((-30, 13), (30, 13), (-30, -13), (30, -13)): cv.cone(V(x, 0, z), V(x, 44, z), 1.3, 1.2, WOOD_D)
    cv.ell(V(0, 44, 0), (36, 15, 20), a, shader=lambda q, c: (np.where((np.cos(q[:, 0] * 11) > 0)[:, None], b2, c), q[:, 1] > -.05))
    for k in range(9): cv.ell(V(-32 + k * 8, 41.4, 16.5), (3.6, 4.2, 1.2), GOLD if k % 2 else a)
    cv.cone(V(0, 58, 0), V(0, 70, 0), .8, .7, WOOD_D); cv.cone(V(0, 69, 0), V(10, 66, 0), 3.0, .3, GOLD, flat=.3)
    cv.box(V(0, .8, 0), V(28, .8, 13), V(176, 60, 84), shader=bx(stripes(V(176, 60, 84), GOLD, 7, 0, .86)))
    for k, (x, z, col) in enumerate(((-16, 2, TEAL), (-4, -4, GOLD), (10, 3, PINK), (20, -3, VIOLET))): cv.ell(V(x, 4.6, z), (6.4, 3.4, 5), col)
    cyl(cv, 1.6, 9, 3.6, 3.6, BRASS, x=2, z=8); cv.ell(V(2, 12, 8), (3, 3.4, 3), BRASS); cv.cone(V(2, 15, 8), V(2, 20, 8), 1.0, .5, BRASS)
def restcamel(cv, T):
    fur = V(212, 156, 96) if not T else V(190, 130, 84); fd = fur * .84; rug = RED if not T else TEAL
    for (x, z) in ((12, 7.4), (-12, 7.4), (12, -7.4), (-12, -7.4)): cv.ell(V(x, 3.6, z), (8.4, 3.6, 3.4), fd)
    cv.ell(V(0, 14, 0), (21, 11, 9.6), fur); cv.ell(V(-2, 25.5, 0), (9.6, 9, 7.4), fur)
    cv.ell(V(-2, 26.4, 0), (11.6, 8.4, 9), rug, shader=lambda q, c: (np.where((np.cos(q[:, 0] * 9) > .5)[:, None], GOLD, c), q[:, 1] > -.35))
    for k in range(5): cv.ell(V(-10 + k * 4, 21.5, 9.2), (1.1, 2.2, .8), GOLD)
    cv.cone(V(16, 17, 0), V(25, 44, 0), 5.4, 3.8, fur); cv.ell(V(30.5, 46, 0), (7.8, 4.6, 4.4), fur, rot=rz(-.12)); cv.ell(V(36.4, 44.6, 0), (3.6, 3.2, 3.6), V(236, 196, 150))
    for s_ in (1, -1): cv.ell(V(26.4, 50, 3.2 * s_), (1.8, 2.6, 1.4), fd); cv.ell(V(31.5, 47.6, 4 * s_), 1.5, V(255, 252, 240)); cv.ell(V(32.2, 47.5, 4.9 * s_), .9, BLACK)
    cv.cone(V(-20, 16, 0), V(-27, 10, 0), 1.6, .8, fd)
    cv.cone(V(34, 43, 3), V(44, 2, 12), .5, .5, WOOD_D); cv.cone(V(44, 0, 12), V(44, 9, 12), 1.5, 1.1, WOOD_D)
def matka(cv, T):
    cols = (CLAY, TERRA) if not T else (V(226, 186, 120), CLAY)
    cv.box(V(0, 5, 0), V(24, 1.2, 9), WOOD); [cv.cone(V(x, 0, z), V(x, 5, z), 1.3, 1.3, WOOD_D) for x in (-22, 22) for z in (-7, 7)]
    for i, x in enumerate((-15, 0, 15)):
        n = (3, 4, 2)[i]
        for j in range(n): r_ = 7.4 - j * 1.3; yb = 6.2 + sum((7.4 - m * 1.3) * 1.7 for m in range(j)); pot(cv, x, yb, 0, r_, cols[(i + j) % 2], CREAM if j % 2 == 0 else GOLD)
    cv.ell(V(-30, 3, 8), (4.4, 3, 4.4), BRASS); cv.ell(V(28, 4, 9), (5.6, 4.6, 5.6), cols[0], shader=None)
def fortgate(cv, T):
    a, d = (SAND, SAND_D) if not T else (V(240, 170, 150), V(204, 124, 116))
    for x in (-27, 27):
        cv.box(V(x, 27, 0), V(7.4, 27, 7.4), a, lines=.5); cv.box(V(x, 55.4, 0), V(9, 1.6, 9), d); cv.box(V(x, 2.4, 0), V(8.6, 2.4, 8.6), d)
        for (dx, dz) in ((-5, 5), (5, 5), (-5, -5), (5, -5)): cv.cone(V(x + dx, 57, dz), V(x + dx, 67, dz), .9, .9, CREAM)
        cv.box(V(x, 67.6, 0), V(7.6, 1, 7.6), d); cv.ell(V(x, 68.4, 0), (6.8, 8, 6.8), GOLD if not T else CREAM, shader=dome); cv.cone(V(x, 76, 0), V(x, 83, 0), .9, .2, GOLD)
        cv.box(V(x, 30, 7.6), V(3, 5, .5), DARK); cv.ell(V(x, 35, 7.6), (3, 3, .5), DARK)
    cv.box(V(0, 49, 0), V(22, 6.4, 6), a, lines=.5); arc(cv, 0, 30, 19.6, 2.6, (d, a), n=12)
    for k in range(5): cv.box(V(-16 + k * 8, 57.6, 0), V(2.4, 2.2, 6), d)
    for k in range(7): cv.cone(V(-18 + k * 6, 44, 6.4), V(-16 + k * 6, 39 - (k % 2) * 2, 6.4), 2.4, .3, (RED, GOLD, TEAL, PINK)[k % 4], flat=.3)
# ---------------- Poila Boishakh Parade ----------------
def stand(cv, T):
    cv.box(V(0, 5, -6), V(36, 5, 7), WOOD, lines=.7); cv.box(V(0, 2.4, 2), V(36, 2.4, 2), WOOD_D)
    for x in (-37, 37): cv.cone(V(x, 0, -13), V(x, 74, -13), 1.4, 1.2, WOOD_D)
    cols = (RED, GOLD, TEAL, PINK, CREAM, ORANGE, VIOLET)
    for k in range(9): cv.cone(V(-33 + k * 8.2, 72 - 3 * math.sin(k / 8 * math.pi), -13), V(-31 + k * 8.2, 63 - 3 * math.sin(k / 8 * math.pi), -13), 3.2, .3, cols[(k + (3 if T else 0)) % 7], flat=.3)
    back = ("leader", "elder", "cook") if not T else ("islander", "florist", "mechanic"); front = ("florist", "mechanic", "picker", "potter") if not T else ("cook", "picker", "leader", "elder")
    for i, n in enumerate(back): B6.npc(At(cv, (-22 + i * 22, 10, -6), .56), n, 13 + (i + T) % 2)
    for i, n in enumerate(front): B6.npc(At(cv, (-30 + i * 20, 0, 8), .56), n, 13 + (i + 1 + T) % 2)
    cv.cel = .4; cv.ink = 1.15
def pgate(cv, T):
    cols = (RED, GOLD, TEAL, PINK) if not T else (ORANGE, CREAM, LEAF, VIOLET)
    for x in (-30, 30):
        for k in range(8): cv.cone(V(x, k * 7.4, 0), V(x, k * 7.4 + 7.6, 0), 2.6, 2.6, cols[k % 2 * 1])
        cv.box(V(x, 2, 0), V(5, 2, 5), STONE)
    arc(cv, 0, 58, 30, 4.2, cols, n=16)
    cv.ell(V(0, 88, 1.6), (8.6, 8.6, 1.6), GOLD); cv.ell(V(0, 88, 3), (5.6, 5.6, 1), ORANGE)
    for k in range(10): a = k * math.pi / 5; cv.cone(V(math.cos(a) * 9, 88 + math.sin(a) * 9, 1.6), V(math.cos(a) * 13.4, 88 + math.sin(a) * 13.4, 1.6), 1.5, .3, GOLD)
    for k in range(7):
        a = math.pi * (k + 1) / 8; x = 30 * math.cos(a); y = 58 + 30 * math.sin(a) - 5
        for j in range(3 + k % 2): cv.ell(V(x, y - j * 4.2, 1.5), (2.2, 2.2, 2.2), ORANGE if (j + k) % 2 else GOLD)
def bigstall(cv, T):
    a = PINK if not T else LEAF
    cv.box(V(0, 9, 4), V(30, 9, 8), WOOD, lines=.8); cv.box(V(0, 22, 4), V(28, 4, 7), V(190, 232, 240)); cv.box(V(0, 18.6, 4), V(31, .8, 9), WOOD_D)
    for k in range(9): cv.ell(V(-24 + k * 6, 21.6, 10), (2.4, 2.2, 1.6), (CREAM, PINK, ORANGE, GOLD, V(170, 210, 80))[k % 5])
    cv.box(V(0, 26, -9), V(31, 26, 1.4), V(250, 226, 170)); [cv.box(V(0, y, -7), V(28, .8, 2), WOOD_D) for y in (34, 44)]
    for k in range(7): pot(cv, -24 + k * 8, 34.8 if k % 2 else 44.8, -6.4, 2.8, (CLAY, BRASS, TERRA)[k % 3])
    for (x, z) in ((-30, 14), (30, 14)): cv.cone(V(x, 0, z), V(x, 52, z), 1.2, 1.1, WOOD_D)
    cv.ell(V(0, 54, 4), (35, 4.2, 15), a, shader=lambda q, c: (np.where((np.cos(q[:, 0] * 13) > 0)[:, None], CREAM, c), None))
    for k in range(9): cv.ell(V(-32 + k * 8, 50.6, 17.6), (3.4, 3.6, 1), CREAM if k % 2 else a)
    cv.box(V(0, 63, 0), V(16, 4.4, 1), V(250, 200, 70)); [cv.ell(V(-9 + k * 6, 63, 1.2), (1.8, 1.8, .5), RED) for k in range(4)]
def balloons(cv, T):
    cv.box(V(0, 2, 0), V(5, 2, 5), STONE); cv.cone(V(0, 3, 0), V(0, 44, 0), 1.3, 1.1, WOOD_D)
    cols = (RED, GOLD, TEAL, PINK, VIOLET, ORANGE, CYAN, V(170, 210, 80))
    for k in range(8):
        a = k * 2.4 + (1 if T else 0); p = V(math.cos(a) * (8 + k % 3 * 3), 56 + k * 4.4 + (k % 2) * 2, math.sin(a) * 5)
        cv.cone(V(0, 44, 0), p - V(0, 6, 0), .25, .25, IRON); cv.ell(p, (6, 7.2, 6), cols[(k + T * 3) % 8], gloss=1.6); cv.ell(p - V(0, 7.4, 0), (1, .9, 1), cols[(k + T * 3) % 8] * .8)
    for k in range(3): c = V(-9 + k * 9, 30 + k * 4, 3); [cv.cone(c, c + V(math.cos(j * 1.571 + .4) * 4.4, math.sin(j * 1.571 + .4) * 4.4, 0), 1.7, .3, (RED, CREAM, TEAL, GOLD)[j], flat=.3) for j in range(4)]

# ---------------- parade floats: an effigy on a rolling cart, four frames ----------------
def floatcart(cv, ph, skirt):
    spoke = lambda q, c: (c, (np.hypot(q[:, 0], q[:, 1]) > .76) | (np.cos(np.arctan2(q[:, 1], q[:, 0]) * 6 + ph * 2) > .9) | (np.hypot(q[:, 0], q[:, 1]) < .24))
    for x in (-21, 21): cv.ell(V(x, 7, -13.4), (7, 7, 1.3), WOOD_D, shader=spoke)
    cv.box(V(0, 12, 0), V(33, 2.4, 13), WOOD); cv.box(V(0, 8.4, 13.2), V(33, 3.4, .5), skirt, shader=bx(stripes(skirt, CREAM, 10, 0, .3)))
    for x in (-21, 21): cv.ell(V(x, 7, 13.9), (7, 7, 1.3), WOOD_D, shader=spoke)
    for k in range(9): cv.ell(V(-32 + k * 8, 13.6, 13.6), (2, 2, 1.4), ORANGE if k % 2 else GOLD)
    cv.cone(V(33, 12, 0), V(46, 16, 0), 1.2, 1.0, WOOD_D)
def floatowl(cv, o, f):
    cv.cel = .4; cv.ink = 1.15; ph = f / 4 * 2 * math.pi; bob = .8 * math.sin(ph); floatcart(cv, ph, RED); c = At(cv, (0, 14 + bob, 0))
    body = lambda q, col: (np.where((np.cos(q[:, 1] * 9 + np.abs(q[:, 0]) * 5) > .55)[:, None] & (q[:, 1] < .25)[:, None], TEAL, col), None)
    c.ell(V(0, 34, 0), (21, 30, 15), CREAM, shader=body)
    for s_ in (1, -1):
        c.ell(V(19 * s_, 30, 0), (6.4, 20, 10), RED, rot=rz(-.16 * s_), shader=stripes(RED, GOLD, 8, 1, .5))
        c.ell(V(8.6 * s_, 47, 12.6), (8, 8, 2.2), GOLD); c.ell(V(8.6 * s_, 47, 14.4), (5.6, 5.6, 1.4), CREAM); c.ell(V(8.6 * s_, 47, 15.4), (3, 3, 1), BLACK)
        c.cone(V(11 * s_, 60, 4), V(16 * s_, 72, 3), 4.2, .5, TEAL); c.ell(V(7 * s_, 3.4, 9), (4.6, 2.6, 5.4), ORANGE)
    c.cone(V(0, 43, 14), V(0, 36, 19), 3.2, .4, ORANGE); [c.ell(V(-8 + k * 8, 22 - abs(k - 1) * 2, 14.4 - abs(k - 1)), (2.4, 2.4, 1), (RED, GOLD, RED)[k]) for k in range(3)]
def floattiger(cv, o, f):
    cv.cel = .4; cv.ink = 1.15; ph = f / 4 * 2 * math.pi; bob = .8 * math.sin(ph + 1); floatcart(cv, ph, TEAL); c = At(cv, (0, 14 + bob, 0)); og = V(252, 178, 52)
    for x in (-10, 10): c.cone(V(x, 0, 0), V(x * .6, 16, 0), 1.6, 1.6, WOOD_D)
    face = lambda q, col: (np.where(((np.cos(q[:, 1] * 10 - np.abs(q[:, 0]) * 3) > .78) & (np.abs(q[:, 0]) > .42))[:, None] | ((np.cos(q[:, 0] * 12) > .8) & (q[:, 1] > .5))[:, None], BLACK, col), None)
    c.ell(V(0, 42, 0), (27, 25, 14), og, shader=face)
    for s_ in (1, -1):
        c.ell(V(19 * s_, 64, 0), (7.4, 7.4, 4), og); c.ell(V(19 * s_, 63.6, 2.6), (4.4, 4.4, 2.4), PINK)
        c.ell(V(10 * s_, 48, 12), (5.6, 6.4, 2.2), V(255, 252, 240)); c.ell(V(10 * s_, 47.4, 13.6), (2.6, 3.6, 1.4), BLACK)
        c.ell(V(6.4 * s_, 31, 12.6), (8.4, 6.4, 4.4), V(255, 250, 236))
        for k in range(3): c.cone(V(11 * s_, 31 + (k - 1) * 2, 14), V(26 * s_, 31 + (k - 1) * 5, 12), .45, .2, V(255, 252, 240))
    c.ell(V(0, 36.4, 15.4), (4, 3, 2.4), V(230, 90, 110)); c.ell(V(0, 25, 12), (6, 4.2, 3), RED)
    for k in range(5): c.ell(V(-8 + k * 4, 67 - abs(k - 2) * 1.2, 6), (1.8, 4, 1.4), (RED, GOLD, TEAL, GOLD, RED)[k])
def floatfish(cv, o, f):
    cv.cel = .4; cv.ink = 1.15; ph = f / 4 * 2 * math.pi; bob = 1.0 * math.sin(ph + 2); floatcart(cv, ph, V(250, 130, 160)); c = At(cv, (0, 14 + bob, 0)); sil = V(206, 220, 236)
    for x in (-14, 12): c.cone(V(x, 0, 0), V(x, 24, 0), 1.5, 1.5, WOOD_D)
    scale = lambda q, col: (np.where((q[:, 1] < -.25)[:, None], V(250, 250, 244), np.where(((np.cos(q[:, 0] * 14) * np.cos(q[:, 1] * 9 + q[:, 0] * 7) > .55) & (q[:, 0] < .45))[:, None], V(120, 170, 214), col)), None)
    c.ell(V(0, 40, 0), (32, 15, 8.4), sil, shader=scale)
    c.cone(V(-28, 40, 0), V(-42, 54, 0), 4.4, 1.2, TEAL, flat=.35); c.cone(V(-28, 40, 0), V(-42, 27, 0), 4.4, 1.2, TEAL, flat=.35)
    c.cone(V(-4, 53, 0), V(-14, 62, 0), 5.4, .6, TEAL, flat=.3); c.cone(V(2, 30, 6), V(-8, 22, 8), 3.4, .5, TEAL, flat=.3)
    for s_ in (1, -1): c.ell(V(21, 44, 6.4 * s_), (4.2, 4.2, 1.6), V(255, 252, 240)); c.ell(V(21.6, 44, 7.6 * s_), (2.2, 2.2, 1), BLACK)
    c.ell(V(31, 38, 0), (3, 3.4, 4.4), RED); [c.ell(V(-20 + k * 9, 57 - abs(k - 2) * 2.6, 0), (1.8, 1.8, 1.8), GOLD) for k in range(5)]

# ---------------- v38: set pieces for the other paths ----------------
BARK = V(150, 100, 70); BARK_D = V(112, 74, 56)
def canopy(cv, pts, a=LEAF, b=LEAF_D):
    for k, (x, y, z, r_) in enumerate(pts): cv.ell(V(x, y, z), (r_, r_ * .86, r_ * .9), a if k % 2 else b)
def mangotree(cv, T):
    cv.cone(V(0, 0, 0), V(2, 44, 0), 6.4, 4.4, BARK); cv.cone(V(2, 38, 0), V(-16, 56, 2), 3.2, 2.2, BARK); cv.cone(V(2, 40, 0), V(18, 58, -2), 3.2, 2.2, BARK); cv.ell(V(0, 1, 0), (10, 2.4, 8), BARK_D)
    a, b2 = (V(74, 160, 78), V(50, 128, 66)) if not T else (V(120, 180, 84), V(84, 150, 70))
    canopy(cv, ((-22, 62, 0, 20), (20, 64, 0, 21), (0, 78, 0, 23), (-10, 60, 12, 17), (12, 58, 12, 16), (-30, 74, -4, 14), (30, 76, -4, 14), (0, 64, 14, 15)), a, b2)
    for k, (x, y) in enumerate(((-26, 52), (-12, 46), (6, 44), (22, 48), (32, 58), (-2, 54))): cv.cone(V(x, y + 7, 15), V(x, y + 3, 15), .4, .4, BARK_D); cv.ell(V(x, y, 15), (3.2, 4.2, 3), V(255, 196, 60) if (k + T) % 3 else V(244, 130, 70))
def palm(cv, T):
    pts = [V(0 + 5 * math.sin(k * .35), k * 9.5, 0) for k in range(9)]
    for k in range(8): cv.cone(pts[k], pts[k + 1], 4.4 - k * .25, 4.2 - k * .25, BARK if k % 2 else BARK_D)
    top = pts[-1]; a, b2 = (V(88, 170, 84), V(56, 132, 70)) if not T else (V(130, 184, 84), V(90, 150, 70))
    for k in range(9):
        ang = k * .7 - .1; d = V(math.cos(ang), 0, math.sin(ang) * .5); mid = top + d * 16 + V(0, 7, 0); tip = top + d * 33 + V(0, -6, 0)
        cv.cone(top, mid, 3.4, 4.8, a if k % 2 else b2, flat=.35); cv.cone(mid, tip, 4.8, .6, a if k % 2 else b2, flat=.35)
    for (x, z) in ((-3, 3), (3, 2), (0, -3)): cv.ell(top + V(x, -5, z), 3.6, V(150, 190, 80) if not T else BARK)
def banyan(cv, T):
    cv.cone(V(0, 0, 0), V(0, 40, 0), 10, 7, BARK); cv.ell(V(0, 1, 0), (16, 3, 12), BARK_D)
    for (x, z) in ((-24, 4), (-14, -3), (16, 3), (26, -2), (34, 5)): cv.cone(V(x, 0, z), V(x * .9, 46, z), 1.6, 1.2, BARK_D)
    a, b2 = (V(60, 140, 76), V(44, 112, 64)) if not T else (V(90, 160, 80), V(64, 130, 68))
    canopy(cv, ((-34, 58, 0, 20), (-12, 66, 0, 24), (14, 68, 0, 24), (36, 58, 0, 20), (0, 80, -2, 20), (-24, 56, 12, 14), (24, 56, 12, 14), (0, 58, 14, 16)), a, b2)
    cv.box(V(0, 5, 12), V(12, 5, 4), STONE, lines=.5); cv.ell(V(0, 12, 12), (2, 1, 2), CLAY); cv.ell(V(0, 14.4, 12), (.9, 1.8, .9), V(255, 220, 110), glow=1.0)
def bambooclump(cv, T):
    g1 = V(140, 190, 80) if not T else V(196, 196, 96); g2 = V(96, 150, 66)
    for i in range(7):
        x0 = -12 + i * 4; lean = (i - 3) * .14; top = V(x0 + math.sin(lean) * 66, 68 + (i % 3) * 7, (i % 2) * 4 - 2); cv.cone(V(x0, 0, (i % 2) * 4 - 2), top, 2.6, 1.8, g1)
        for k in range(1, 6): p = V(x0, 0, (i % 2) * 4 - 2) + (top - V(x0, 0, (i % 2) * 4 - 2)) * k / 6; cv.ell(p, (2.9, .8, 2.9), g2)
        for k in range(4): a = lean + (k - 1.5) * .7; cv.ell(top + V(math.sin(a) * 9, 2 - k * 5, 2), (8, 2.2, 1.6), LEAF if k % 2 else LEAF_D, rot=rz(-a * .8 + .4 * (1 if k % 2 else -1)))
    cv.ell(V(0, 1.6, 0), (20, 3, 10), LEAF_D)
def teabush(cv, T):
    a, b2 = (V(70, 150, 84), V(104, 184, 96)) if not T else (V(84, 160, 90), V(140, 200, 104))
    for r_ in range(3):
        for i in range(6): cv.ell(V(-36 + i * 14.4 + r_ * 4, 8 + r_ * 9, -r_ * 9), (9.4, 8.4, 7.4), b2 if (i + r_) % 2 else a)
    for (x, y, z) in ((-20, 14, 6), (10, 15, 6), (30, 13, 6)): cv.ell(V(x, y, z), (2, 1.6, 1.6), V(190, 230, 120))
    cyl(cv, 0, 13, 7.4, 9.4, V(214, 170, 100), x=-52, z=8, color2=V(176, 130, 76), split=.8); cv.ell(V(-52, 14, 8), (9, 3.4, 9), b2)
def teashed(cv, T):
    wall = V(232, 214, 180); roof = V(190, 84, 70) if not T else V(84, 130, 150)
    cv.box(V(0, 15, 0), V(32, 15, 14), wall, lines=.5); cv.box(V(0, 3, 0), V(33, 3, 15), STONE_D)
    cv.box(V(0, 33, 4), V(37, 1.6, 20), roof, rot=rx(.22), shader=bx(stripes(roof, roof * .82, 9, 0, .7)))
    cv.box(V(-16, 12, 14.3), V(6, 12, .6), DARK); cv.box(V(12, 18, 14.3), V(9, 6, .6), V(120, 170, 190)); cv.box(V(12, 18, 14.7), V(.6, 6, .4), WOOD)
    for k in range(3): cyl(cv, 0, 11, 6, 8, V(214, 170, 100), x=24 + k * 0, z=22 - k * 0) if k == 0 else None
    cv.ell(V(24, 12, 22), (8, 4, 8), V(104, 184, 96)); cyl(cv, 0, 9, 5, 6.4, V(214, 170, 100), x=38, z=18); cv.ell(V(38, 10, 18), (6, 3, 6), V(104, 184, 96))
    for x in (-34, 34): cv.cone(V(x, 0, 22), V(x, 30, 22), 1.3, 1.2, WOOD_D)
def jungleplant(cv, T):
    a, b2 = (V(60, 150, 90), V(40, 118, 76)) if not T else (V(96, 170, 90), V(60, 130, 76))
    for k in range(7):
        ang = (k - 3) * .42; L = 46 + (k % 2) * 10; tip = V(math.sin(ang) * L, 14 + math.cos(ang) * L * .9, (k % 3 - 1) * 5)
        cv.cone(V(0, 2, 0), tip * .55 + V(0, 4, 0), 1.6, 1.2, b2); cv.ell(tip * .78 + V(0, 4, 0), (L * .34, 9, 3), a if k % 2 else b2, rot=rz(math.pi / 2 - ang))
    for (x, y, col) in ((-10, 20, RED), (8, 26, ORANGE), (0, 14, PINK)):
        cv.cone(V(0, 2, 6), V(x, y, 8), .9, .8, b2); [cv.ell(V(x + math.cos(j * 1.257) * 3.4, y + math.sin(j * 1.257) * 3.4, 9), (2.6, 2.6, 1.4), col) for j in range(5)]; cv.ell(V(x, y, 10), 1.8, GOLD)
def reeds(cv, T):
    for k in range(9): x = -30 + k * 7.4; h = 34 + (k * 7 % 16); cv.cone(V(x, 0, (k % 3 - 1) * 4), V(x + (k % 3 - 1) * 4, h, (k % 3 - 1) * 4), 1.1, .5, LEAF if k % 2 else LEAF_D); (cv.ell(V(x + (k % 3 - 1) * 4, h + 3, (k % 3 - 1) * 4), (1.9, 5, 1.9), BARK_D) if k % 2 == 0 else None)
    for (x, z, col) in ((-22, 12, PINK), (6, 14, V(255, 252, 244)), (26, 10, PINK if not T else V(250, 220, 120))):
        cv.ell(V(x, 1.2, z), (9, 1.2, 7), V(70, 150, 96))
        for j in range(6): a = j * 1.047; cv.ell(V(x + math.cos(a) * 3, 5, z + math.sin(a) * 2.4), (2.4, 4.4, 1.8), col, rot=rz(-math.cos(a) * .5))
        cv.ell(V(x, 5, z), 1.8, GOLD)
def watertank(cv, T):
    for (x, z) in ((-11, 8), (11, 8), (-11, -8), (11, -8)): cv.cone(V(x, 0, z), V(x, 22, z), 1.5, 1.4, IRON)
    cv.box(V(0, 22, 0), V(15, 1.2, 11), IRON); col = V(60, 60, 78) if not T else V(84, 150, 190)
    cyl(cv, 23, 50, 14, 14, col, color2=col * .8, split=.75); cv.ell(V(0, 50, 0), (14, 4, 14), col * .86); cv.ell(V(0, 53, 0), (4, 2, 4), IRON)
    for y in (30, 40): ring(cv, y, 14.4, col * .7, .9)
    cv.cone(V(14, 30, 0), V(22, 30, 0), 1.2, 1.2, IRON); cv.cone(V(22, 30, 0), V(22, 0, 0), 1.2, 1.2, IRON)
def clothesline(cv, T):
    for x in (-36, 36): cv.cone(V(x, 0, 0), V(x, 46, 0), 1.4, 1.2, WOOD_D); cv.box(V(x, 1.6, 0), V(4, 1.6, 4), STONE)
    cv.cone(V(-36, 44, 0), V(36, 44, 0), .4, .4, IRON)
    cols = (RED, GOLD, TEAL, PINK, V(250, 246, 238), VIOLET) if not T else (ORANGE, V(250, 246, 238), LEAF, PINK, GOLD, TEAL)
    for k in range(5): w = (9, 5, 7, 9, 5)[k]; x = -28 + k * 14; cv.box(V(x, 44 - (14 if k % 2 == 0 else 9), 0), V(w * .62, 14 if k % 2 == 0 else 9, .5), cols[k], shader=bx(stripes(cols[k], cols[k + 1], 5, 1, .86)))
def kiterack(cv, T):
    for x in (-22, 22): cv.cone(V(x, 0, 0), V(x, 56, 0), 1.4, 1.2, WOOD_D)
    for y in (24, 52): cv.cone(V(-24, y, 0), V(24, y, 0), 1.1, 1.1, WOOD_D)
    cols = (RED, GOLD, TEAL, PINK, VIOLET, ORANGE)
    for k in range(6):
        x = -15 + (k % 3) * 15; y = 38 if k < 3 else 12; c1 = cols[(k + T) % 6]; cv.box(V(x, y, 1.4), V(6.6, 6.6, .6), c1, rot=rz(math.pi / 4)); cv.box(V(x, y, 2), V(3, 3, .5), cols[(k + 2 + T) % 6], rot=rz(math.pi / 4)); cv.cone(V(x, y - 9, 2), V(x + 2, y - 14, 2), .8, .2, c1)
    cyl(cv, 0, 8, 5, 5, WOOD, x=32, z=6); cv.ell(V(32, 9, 6), (5.6, 1.4, 5.6), RED)
def stairhut(cv, T):
    wall = V(236, 200, 160) if not T else V(170, 200, 214)
    cv.box(V(0, 20, 0), V(17, 20, 13), wall, lines=.5); cv.box(V(0, 41.4, 0), V(19.4, 1.6, 15.4), CLAY_D)
    cv.box(V(-3, 13, 13.3), V(6, 13, .6), V(60, 130, 150)); cv.ell(V(1, 13, 14), .9, BRASS); cv.box(V(10, 26, 13.3), V(3.4, 3.4, .5), DARK)
    for k in range(4): cv.ell(V(24 + (k % 2) * 7, 5, 6 - (k // 2) * 8), (4, 4.4, 4), CLAY); cv.ell(V(24 + (k % 2) * 7, 12, 6 - (k // 2) * 8), (4.4, 5, 4), LEAF if k % 2 else LEAF_D)
    cv.cone(V(-10, 43, 0), V(-10, 60, 0), .7, .6, IRON); [cv.cone(V(-10, 58 - k * 4, 0), V(-3 - k, 58 - k * 4, 0), .5, .5, IRON) for k in range(3)]
def shopfront(cv, T):
    wall = V(240, 214, 170) if not T else V(84, 80, 120); awn = RED if not T else V(255, 96, 200); glass = V(150, 200, 220) if not T else V(255, 220, 130)
    cv.box(V(0, 26, -4), V(34, 26, 12), wall, lines=.5); cv.box(V(0, 53.6, -4), V(36, 1.6, 13.4), wall * .8)
    cv.box(V(-14, 16, 8.3), V(14, 12, .6), glass, glow=.85 if T else .1); cv.box(V(-14, 16, 8.8), V(.7, 12, .4), DARK); cv.box(V(-14, 16, 8.8), V(14, .7, .4), DARK)
    cv.box(V(18, 14, 8.3), V(8, 14, .6), V(96, 60, 54) if not T else V(60, 50, 90)); cv.ell(V(23, 14, 9), 1.0, BRASS)
    cv.ell(V(0, 33, 14), (35, 4, 10), awn, shader=lambda q, c: (np.where((np.cos(q[:, 0] * 13) > 0)[:, None], CREAM, c), None))
    cv.box(V(0, 44, 8.4), V(22, 5, .8), V(52, 62, 118) if not T else V(40, 30, 70)); [cv.ell(V(-14 + k * 7, 44, 9.4), (2.2, 2.6, .6), (GOLD, CREAM, GOLD, CREAM, GOLD)[k], glow=.9 if T else 0) for k in range(5)]
    for k in range(4): cv.ell(V(-24 + k * 6.6, 9, 9.4), (2.4, 2.6, 1.6), (ORANGE, RED, GOLD, LEAF)[k])
    cv.box(V(0, 1.6, 12), V(35, 1.6, 6), STONE_D)
def bookstall(cv, T):
    cv.box(V(0, 9, 0), V(26, 9, 8), WOOD, lines=.7); cv.box(V(0, 30, -8), V(27, 30, 1.2), WOOD_D)
    cols = (RED, TEAL, GOLD, V(250, 246, 238), VIOLET, ORANGE, LEAF, PINK)
    for r_ in range(3):
        cv.box(V(0, 22 + r_ * 13, -5), V(25, .8, 3), WOOD)
        for k in range(11): h = 4.4 + ((k * 7 + r_ * 3) % 4) * .9; cv.box(V(-22 + k * 4.4, 23 + r_ * 13 + h, -4.4), V(1.8, h, 2.4), cols[(k + r_ * 3 + T) % 8])
    for k in range(5): cv.box(V(-18 + k * 9, 19.4 + (k % 2), 2), V(3.6, 1.2 + (k % 2), 5), cols[(k * 3 + T) % 8], rot=ry(.2 * (k % 3 - 1)))
    for x in (-27, 27): cv.cone(V(x, 0, 10), V(x, 64, 10), 1.2, 1.1, WOOD_D)
    cv.ell(V(0, 66, 2), (31, 3.6, 13), LEAF_D if not T else V(60, 110, 200), shader=lambda q, c: (np.where((np.cos(q[:, 0] * 12) > 0)[:, None], CREAM, c), None))
def boat(cv, T):
    hull = V(120, 76, 50) if not T else V(60, 110, 150)
    cv.ell(V(0, 10, 0), (44, 10, 11), hull, shader=lambda q, c: (np.where((np.abs(q[:, 1] - .2) < .1)[:, None], CREAM, c), q[:, 1] < .5)); cv.ell(V(0, 14.6, 0), (40, 1.6, 9), WOOD)
    cv.cone(V(40, 12, 0), V(52, 24, 0), 3, .8, hull); cv.cone(V(-40, 12, 0), V(-50, 22, 0), 3, .8, hull)
    cv.ell(V(-6, 22, 0), (18, 12, 9.4), V(232, 196, 120), shader=lambda q, c: (np.where((np.cos(q[:, 0] * 16) > .7)[:, None], V(196, 150, 84), c), q[:, 1] > -.3))
    cv.cone(V(22, 14, 0), V(22, 54, 0), 1.0, .8, WOOD_D); cv.cone(V(22, 52, 0), V(34, 48, 0), 3.4, .3, RED if not T else GOLD, flat=.3)
    cv.cone(V(-30, 16, 6), V(-56, 4, 10), .9, .9, WOOD_D); cv.ell(V(-58, 3, 10), (5, 1.4, 2.6), WOOD)
    cv.ell(V(0, 1, 2), (50, 1.4, 14), V(214, 190, 140))
def stilthut(cv, T):
    for (x, z) in ((-20, 10), (20, 10), (-20, -10), (20, -10)): cv.cone(V(x, 0, z), V(x, 26, z), 1.6, 1.4, V(170, 150, 90))
    cv.box(V(0, 26, 0), V(26, 1.4, 14), WOOD); wall = V(214, 186, 120) if not T else V(196, 160, 110)
    cv.box(V(0, 39, -1), V(21, 12, 11), wall, shader=bx(stripes(wall, wall * .84, 7, 0, .8))); cv.box(V(-6, 37, 10.3), V(5, 10, .6), DARK); cv.box(V(11, 41, 10.3), V(4, 4, .5), DARK)
    cv.ell(V(0, 50, 0), (31, 18, 19), HAY if not T else V(150, 170, 90), shader=straw)
    for k in range(5): cv.cone(V(27 + k * 3.2, 25 - k * 5.2, 12), V(33 + k * 3.2, 25 - k * 5.2, 12), .9, .9, WOOD_D)
    cv.cone(V(27, 27, 12), V(43, 1, 12), 1.0, 1.0, WOOD_D); cv.cone(V(33, 27, 12), V(49, 1, 12), 1.0, 1.0, WOOD_D)
def ferris(cv, T):
    for s_ in (1, -1): cv.cone(V(-24, 0, 9 * s_), V(0, 50, 9 * s_), 1.8, 1.4, V(60, 110, 200)); cv.cone(V(24, 0, 9 * s_), V(0, 50, 9 * s_), 1.8, 1.4, V(60, 110, 200))
    cv.cone(V(0, 50, -10), V(0, 50, 10), 3, 3, GOLD); cols = (RED, GOLD, TEAL, PINK, VIOLET, ORANGE, LEAF, CYAN)
    arc(cv, 0, 50, 40, 1.6, (RED, CREAM), n=24, a0=0, a1=2 * math.pi)
    for k in range(8):
        a = k * math.pi / 4 + (.2 if T else 0); p = V(math.cos(a) * 40, 50 + math.sin(a) * 40, 0); cv.cone(V(0, 50, 0), p, .9, .9, IRON)
        cv.box(p + V(0, -6, 0), V(5.4, 4, 4.4), cols[(k + T) % 8]); cv.ell(p + V(0, -1, 0), (6.4, 1.6, 5.4), cols[(k + 3 + T) % 8]); cv.ell(p + V(0, -5, 4.6), (1.6, 1.6, .5), V(255, 224, 190))
    cv.box(V(0, 2, 0), V(30, 2, 12), WOOD)
def lanternrack(cv, T):
    for x in (-32, 32): cv.cone(V(x, 0, 0), V(x, 66, 0), 1.5, 1.3, WOOD_D); cv.box(V(x, 1.6, 0), V(4, 1.6, 4), STONE)
    for y in (64, 42): cv.cone(V(-34, y, 0), V(34, y, 0), 1.1, 1.1, WOOD_D)
    cols = (RED, V(255, 170, 70), V(255, 214, 120), PINK, V(160, 240, 200))
    for r_, y in enumerate((64, 42)):
        for k in range(5 - r_):
            x = -26 + k * 13 + r_ * 6.5; c1 = cols[(k + r_ * 2 + T) % 5]; cv.cone(V(x, y, 0), V(x, y - 4, 0), .3, .3, IRON); cv.ell(V(x, y - 10, 0), (5, 6.4, 5), c1, glow=.8, shader=lambda q, c: (np.where((np.cos(np.arctan2(q[:, 2], q[:, 0]) * 5) > .86)[:, None], GOLD, c), None)); cv.cone(V(x, y - 16, 0), V(x, y - 21, 0), .9, .2, c1)
def habitat(cv, T):
    shell = V(232, 236, 244) if not T else V(250, 214, 170)
    cv.ell(V(0, 2, 0), (34, 30, 26), shell, shader=lambda q, c: (np.where((np.abs(np.cos(np.arctan2(q[:, 2], q[:, 0]) * 3)) > .97)[:, None] | (np.abs(q[:, 1] - .45) < .03)[:, None], STEEL, c), q[:, 1] > 0.06))
    cv.box(V(-34, 9, 6), V(9, 9, 8), STEEL); cv.box(V(-43.3, 9, 6), V(.6, 7, 5), V(255, 140, 50)); cv.ell(V(-44, 9, 6), (.6, 2.4, 2.4), CYAN, glow=.8)
    for k in range(3): cv.ell(V(-10 + k * 13, 14 + (k % 2) * 3, 24 - abs(k - 1) * 3), (4, 4, 1.4), CYAN, glow=.7)
    cv.cone(V(8, 30, 0), V(8, 46, 0), .8, .6, IRON); cv.ell(V(8, 47, 0), 1.8, RED, glow=.9); cv.box(V(0, 1.4, 0), V(38, 1.4, 28), V(150, 96, 80))
def antenna(cv, T):
    cv.box(V(0, 3, 0), V(11, 3, 9), STEEL)
    for k in range(6): y = 6 + k * 11; w = 7 - k * .9; [cv.cone(V(-w * s_, y, 0), V(-(w - .9) * s_, y + 11, 0), .9, .8, IRON) for s_ in (1, -1)]; cv.cone(V(-w, y, 0), V(w - .9, y + 11, 0), .6, .6, IRON)
    R = rz(-.7); cv.ell(V(6, 76, 0), (15, 5, 15), V(236, 240, 248), rot=R, shader=lambda q, c: (c, q[:, 1] < .15)); n = R @ V(0, 1, 0); cv.cone(V(6, 76, 0), V(6, 76, 0) + n * 12, .7, .6, IRON); cv.ell(V(6, 76, 0) + n * 13, 2, RED if not T else CYAN, glow=.9)
    for k in range(3): cv.ell(V(-2 + k * 2, 22 + k * 16, 2), (1.2, 1.2, 1), CYAN, glow=.9)
def solar(cv, T):
    for x in (-24, 0, 24): cv.cone(V(x, 0, 0), V(x, 16, 0), 1.3, 1.2, IRON)
    grid = lambda q, c, ax: (np.where(((np.abs(np.cos(q[:, 0] * 9.4)) > .96) | (np.abs(np.cos(q[:, 1] * 3.14)) < .08))[:, None], V(200, 214, 236), c), None)
    cv.box(V(0, 24, 0), V(38, 13, 1.0), V(40, 70, 150) if not T else V(60, 60, 110), rot=rx(-.6), shader=grid)
    cv.box(V(30, 4, 12), V(6, 4, 5), V(255, 140, 50), lines=.6); cv.box(V(30, 9, 12), V(4, 1, 3), STEEL)
def totem(cv, T):
    st = V(150, 156, 140) if not T else V(176, 150, 120); moss = V(96, 150, 90)
    cv.box(V(0, 4, 0), V(15, 4, 12), st * .8, lines=.5)
    for k in range(3):
        y = 18 + k * 20; w = 12 - k; cv.box(V(0, y, 0), V(w, 10, w * .8), st, lines=.5)
        for s_ in (1, -1): cv.ell(V(4.4 * s_, y + 3, w * .8 + .3), (2.6, 2.6, .8), DARK); cv.ell(V(4.4 * s_, y + 3, w * .8 + 1), (1.1, 1.1, .5), GOLD if k == 2 else CREAM)
        cv.box(V(0, y - 4, w * .8 + .3), V(5.4, 1.5, .7), DARK); [cv.box(V(-3.6 + j * 2.4, y - 4, w * .8 + 1), V(.7, 1.2, .4), CREAM) for j in range(4)]
        for s_ in (1, -1): cv.box(V((w + 3) * s_, y + 2, 0), V(3, 4, 3), st * .9)
    cv.ell(V(-6, 70, 0), (9, 3.4, 8), moss); cv.ell(V(8, 30, 9), (5, 3, 2), moss); [cv.ell(V(-17 + k * 5, 5 + k % 2 * 3, 12), (3.4, 5, 2), LEAF if k % 2 else LEAF_D) for k in range(3)]
def beachhut(cv, T):
    for (x, z) in ((-24, 10), (24, 10), (-24, -10), (24, -10)): cv.cone(V(x, 0, z), V(x, 40, z), 1.5, 1.4, V(190, 150, 96))
    cv.box(V(0, 12, 8), V(25, 12, 3), V(214, 170, 110), shader=bx(stripes(V(214, 170, 110), V(180, 136, 84), 8, 0, .8))); cv.box(V(0, 24.6, 8), V(27, 1.2, 5), WOOD)
    for k in range(4): cv.ell(V(-16 + k * 10, 29, 8), (2.6, 3.6, 2.6), (ORANGE, V(120, 190, 90), PINK, GOLD)[k]); cv.cone(V(-15 + k * 10, 31, 8), V(-13 + k * 10, 37, 8), .4, .4, RED)
    cv.ell(V(0, 46, 0), (36, 20, 22), HAY if not T else V(150, 170, 90), shader=straw)
    for k, col in enumerate((TEAL, PINK, GOLD) if not T else (ORANGE, CYAN, RED)): cv.ell(V(36 + k * 7, 24, -2 + k * 3), (3.4, 23, 1.4), col, rot=rz(-.12 - k * .05), shader=lambda q, c: (np.where((np.abs(q[:, 0]) < .22)[:, None], CREAM, c), None))
def lounger(cv, T):
    a = RED if not T else TEAL
    cv.cone(V(-8, 0, 0), V(-4, 56, 0), 1.2, 1.0, WOOD_D); cv.ell(V(-4, 54, 0), (30, 12, 30), a, shader=lambda q, c: (np.where((np.cos(np.arctan2(q[:, 2], q[:, 0]) * 4) > 0)[:, None], CREAM, c), q[:, 1] > -.02))
    cv.box(V(18, 9, 6), V(17, 1.2, 7), V(250, 246, 238), shader=bx(stripes(V(250, 246, 238), a, 8, 0, .5))); cv.box(V(37, 16, 6), V(1.2, 9, 7), V(250, 246, 238), rot=rz(-.5))
    for (x, z) in ((4, 12), (30, 12), (4, 0), (30, 0)): cv.cone(V(x, 0, z), V(x, 9, z), 1.0, 1.0, WOOD)
    cv.ell(V(-22, 5, 12), (5.4, 5, 5.4), V(120, 190, 90)); cv.cone(V(-21, 9, 12), V(-18, 17, 12), .5, .5, RED); cv.ell(V(-34, 4, 6), 4, (GOLD, RED)[T], shader=lambda q, c: (np.where((np.cos(q[:, 0] * 5) > 0)[:, None], CREAM, c), None))
def blocks(cv, T):
    cols = (RED, GOLD, TEAL, V(60, 110, 200), LEAF, PINK)
    for i, (x, y, z, r_) in enumerate(((-16, 9, 0, 0), (4, 9, 2, .2), (22, 9, -2, -.15), (-6, 27, 0, .1), (13, 27, 0, -.1), (3, 45, 0, .3))):
        c1 = cols[(i + T) % 6]; cv.box(V(x, y, z), V(9, 9, 9), c1, rot=ry(r_), lines=.4); cv.ell(V(x, y, z) + ry(r_) @ V(0, 0, 9.3), (4.6, 4.6, .6), CREAM, rot=ry(r_)); cv.ell(V(x, y, z) + ry(r_) @ V(0, 0, 9.8), (2.4, 2.4, .5), cols[(i + 2 + T) % 6], rot=ry(r_))
    cv.cone(V(3, 54, 0), V(3, 70, 0), 9, .6, cols[(3 + T) % 6]); cv.ell(V(34, 6, 8), 6, cols[(1 + T) % 6], shader=lambda q, c: (np.where((np.abs(q[:, 1]) < .16)[:, None], CREAM, c), None))
def signal(cv, T):
    cv.box(V(0, 3, 0), V(7, 3, 7), IRON); cv.cone(V(0, 5, 0), V(0, 80, 0), 2.2, 1.6, V(250, 246, 238), color2=IRON, split=.25); cv.ell(V(0, 82, 0), 2.6, GOLD)
    R = rz(-.5 if not T else 0); cv.box(V(0, 70, 2) + R @ V(12, 0, 0), V(12, 3.4, .8), RED, rot=R, shader=bx(lambda q, c: (np.where((np.abs(q[:, 0] - .45) < .16)[:, None], CREAM, c), None)))
    cv.box(V(-5, 58, 2), V(3.4, 6.4, 1.6), IRON); cv.ell(V(-5, 61, 3.8), 2.2, RED, glow=.9 if T else .1); cv.ell(V(-5, 55, 3.8), 2.2, V(90, 230, 130), glow=.1 if T else .9)
    for k in range(6): cv.cone(V(4, 10 + k * 8, 0), V(9, 10 + k * 8, 0), .6, .6, IRON)
    cv.cone(V(9, 8, 0), V(9, 52, 0), .7, .7, IRON)
def station(cv, T):
    wall = V(250, 226, 170) if not T else V(190, 226, 236); roof = RED if not T else V(60, 110, 200)
    cv.box(V(0, 3, 4), V(36, 3, 16), STONE); cv.box(V(0, 22, -2), V(26, 16, 10), wall, lines=.5)
    cv.box(V(0, 41, 2), V(34, 1.8, 17), roof, rot=rx(.16)); cv.ell(V(0, 46, -2), (30, 9, 12), roof, shader=dome)
    cv.box(V(-12, 18, 8.3), V(5.4, 12, .6), V(60, 130, 150)); cv.box(V(8, 24, 8.3), V(7, 6, .6), V(150, 200, 220)); cv.box(V(8, 24, 8.7), V(.6, 6, .4), WOOD)
    cv.ell(V(0, 56, 4), (6.4, 6.4, 1.6), CREAM); cv.ell(V(0, 56, 5.4), (5.2, 5.2, .6), V(250, 246, 238)); cv.cone(V(0, 56, 6), V(0, 60, 6), .5, .4, BLACK); cv.cone(V(0, 56, 6), V(3, 56, 6), .5, .4, BLACK)
    for x in (-30, 30): cv.cone(V(x, 6, 16), V(x, 38, 16), 1.3, 1.2, GOLD)
    cv.box(V(22, 9, 14), V(8, .9, 3), WOOD); [cv.box(V(22 + s_ * 6.4, 7, 14), V(.8, 2.4, 2.6), IRON) for s_ in (1, -1)]
def newsstand(cv, T):
    body = V(40, 110, 96) if not T else V(96, 60, 130)
    cv.box(V(0, 20, -2), V(22, 20, 10), body, lines=.5); cv.box(V(0, 22, 8.3), V(17, 9, .6), V(255, 226, 150), glow=.75)
    cv.ell(V(0, 43, 2), (26, 5, 15), body * .8, shader=dome); cv.box(V(0, 36, 8.6), V(18, 3, .8), V(250, 246, 238)); [cv.box(V(-12 + k * 6, 36, 9.3), V(1.6, 1.4, .4), BLACK) for k in range(5)]
    cols = (RED, GOLD, CYAN, PINK, V(250, 246, 238))
    for k in range(5): cv.box(V(-13 + k * 6.4, 23 + (k % 2) * 2, 9.2), V(2.4, 3.6, .5), cols[k])
    cv.box(V(0, 11, 9), V(18, 1, 2), WOOD); [cv.box(V(-12 + k * 8, 13.6, 9.6), V(3, 1.4, 1.6), cols[(k + 2) % 5]) for k in range(4)]
    cv.box(V(30, 9, 6), V(5, 9, 4), V(60, 60, 78)); cv.box(V(30, 13, 10.2), V(3.4, 3, .4), cols[2], glow=.6)
def streetclock(cv, T):
    cv.box(V(0, 3, 0), V(7, 3, 7), IRON); cv.cone(V(0, 5, 0), V(0, 56, 0), 2.4, 1.8, V(52, 62, 100) if not T else V(40, 110, 96)); cv.ell(V(0, 30, 0), (3, 2, 3), GOLD)
    cv.ell(V(0, 68, 0), (13, 13, 5), GOLD); cv.ell(V(0, 68, 4.4), (10.6, 10.6, 1.4), V(255, 244, 200), glow=.8)
    for k in range(12): a = k * math.pi / 6; cv.ell(V(math.cos(a) * 8.6, 68 + math.sin(a) * 8.6, 5.6), (.8, .8, .4), BLACK)
    cv.cone(V(0, 68, 6), V(0, 75, 6), .8, .5, BLACK); cv.cone(V(0, 68, 6), V(5, 65, 6), .8, .5, BLACK); cv.ell(V(0, 83, 0), (2.4, 3.4, 2.4), GOLD)
    for s_ in (1, -1): cv.cone(V(0, 50, 0), V(12 * s_, 54, 0), 1.0, .8, IRON); cv.ell(V(12 * s_, 50, 0), (2.6, 3.4, 2.6), V(255, 214, 120), glow=.95)
def crates(cv, T):
    for i, (x, y, z, r_) in enumerate(((-18, 7, 0, .1), (2, 7, 2, -.1), (22, 7, -1, .2), (-8, 21, 0, -.15), (12, 21, 1, .1))):
        cv.box(V(x, y, z), V(9.4, 7, 8), WOOD, rot=ry(r_), lines=.9)
    for i, (x, z) in enumerate(((-12, 2), (-5, -1), (3, 3), (10, 0), (17, 2), (-8, 4), (8, 5))): cv.ell(V(x, 30.6 + (i % 2), z), (3.6, 4.2, 3.4), (V(255, 196, 60), V(244, 150, 70), V(170, 200, 80))[(i + T) % 3])
    for i in range(4): cv.ell(V(-20 + i * 5.4, 15.6, 3), (3.2, 3.8, 3), V(255, 196, 60) if not T else V(170, 200, 80))
    cv.ell(V(30, 3.4, 9), (3.6, 4.2, 3.4), V(255, 196, 60), rot=rz(1.2))

SCENE = dict(hut=hut, temple=temple, horse=horse, pots=pots, house=house, gate=gate, tulsi=tulsi, lamp=lamp, cot=cot, wall=wall,
             bigtent=bigtent, restcamel=restcamel, matka=matka, fortgate=fortgate, stand=stand, pgate=pgate, bigstall=bigstall, balloons=balloons,
             mangotree=mangotree, palm=palm, banyan=banyan, bambooclump=bambooclump, teabush=teabush, teashed=teashed, jungleplant=jungleplant, reeds=reeds, watertank=watertank, clothesline=clothesline, kiterack=kiterack, stairhut=stairhut,
             shopfront=shopfront, bookstall=bookstall, boat=boat, stilthut=stilthut, ferris=ferris, lanternrack=lanternrack, habitat=habitat, antenna=antenna, solar=solar, totem=totem, beachhut=beachhut, lounger=lounger, blocks=blocks, signal=signal, station=station,
             newsstand=newsstand, streetclock=streetclock, crates=crates)
FLOATS = dict(floatowl=floatowl, floattiger=floattiger, floatfish=floatfish)
def render(fn, tall):
    cv = B4.Canvas(); cv.cel = .4; cv.ink = 1.15; fn(cv, tall); return cv.image()
if __name__ == "__main__":
    out = sys.argv[1]; args = sys.argv[2:]; q = int(os.environ.get("BAKE_Q", 84)); k = B.OW / 256
    if args and args[0] == "floats":
        for n in (args[1:] or FLOATS):
            atlas = Image.new("RGBA", (B.OW * 4, B.OH))
            for f in range(4): cv = B4.Canvas(); FLOATS[n](cv, None, f); atlas.paste(cv.image(), (f * B.OW, 0))
            atlas.save(f"{out}/street_{n}.webp", quality=q, method=6); print("float", n, "ok", flush=True)
        sys.exit()
    if args and args[0] == "preview":      # loose tiles for a quick look
        for n in args[1:]: render(SCENE[n.rstrip("+")], n.endswith("+")).save(f"{out}/{n}.png"); print(n, "ok", flush=True)
        sys.exit()
    names = [n + s for n in SCENE for s in ("", "+")]; tiles = []
    for full in names:
        im = render(SCENE[full.rstrip("+")], full.endswith("+")); box = im.getbbox(); tiles.append((full, im.crop(box), 91 * 1.5 * k - box[0], 104 * 1.5 * k - box[1])); print(full, "ok", flush=True)
    # shelf packing, tallest first
    order = sorted(range(len(tiles)), key=lambda i: -tiles[i][1].height); maxw = 2048; x = y = rowh = 0; place = {}
    for i in order:
        w, h = tiles[i][1].size
        if x + w + 2 > maxw: x = 0; y += rowh + 2; rowh = 0
        place[i] = (x, y); x += w + 2; rowh = max(rowh, h)
    atlas = Image.new("RGBA", (maxw, y + rowh)); table = {}
    for i, (full, im, ox, oy) in enumerate(tiles):
        atlas.paste(im, place[i]); table[full] = [place[i][0], place[i][1], im.width, im.height, round(ox), round(oy)]
    atlas.save(f"{out}/scene.webp", quality=q, method=6); print("SCENE", json.dumps({"unit": 1.5 * k, "items": table}, separators=(",", ":")))
