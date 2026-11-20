"""v33 road obstacles as toon props. Every obstacle type has a normal and a tall form.
Usage: BAKE_SS=6 BAKE_OUT=2 python3 bake7.py <out dir>
Writes props.webp (a grid of tiles) and prints PROPS <json>: name -> [column, row, x, y, width, height] of the
drawn part inside its tile, in tile pixels. Tall forms are named "<type>+"."""
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import bake as B, bake2 as B2, bake4 as B4
from bake import V, rz, ry, rx
from PIL import Image

CLAY = V(206, 104, 70); CLAY_D = V(150, 68, 52); WOOD = V(176, 120, 72); WOOD_D = V(120, 76, 50); TAN = V(226, 186, 120); STONE = V(168, 164, 170); STONE_D = V(116, 112, 126)
LEAF = V(88, 170, 84); LEAF_D = V(52, 122, 66); BRASS = V(232, 176, 78); IRON = V(70, 72, 92); CREAM = V(250, 240, 214); RED = V(226, 72, 66); PINK = V(250, 130, 160); GOLD = V(250, 200, 70)
TEAL = V(60, 170, 176); STEEL = V(110, 134, 170); BLACK = V(44, 40, 52); ORANGE = V(255, 140, 50); VIOLET = V(150, 110, 230); CYAN = V(110, 236, 255)

def Y(y, x=0, z=0): return V(x, y, z)
def cyl(cv, y0, y1, r0, r1, col, x=0, z=0, **kw): cv.frustum(V(x, y0, z), V(x, y1, z), r0, r1, col, **kw)
def ring(cv, y, r, col, t=1.3, x=0, z=0): cv.ell(V(x, y, z), (r, t, r), col)
def stripes(a, b, every, axis=1, th=.2):
    def sh(q, col):
        col = col.copy(); col[np.cos(q[:, axis] * every) > th] = b; return col, None
    return sh

def kiln(cv, T):
    h = 44 if T else 26; cyl(cv, 0, h, 15 if not T else 12, 13 if not T else 10, CLAY, color2=CLAY_D, split=.86)
    cv.ell(Y(h), (13 if not T else 10, 9, 13 if not T else 10), CLAY, shader=stripes(CLAY, CLAY_D, 9, 1, .8))
    cv.ell(Y(9, 0, 12 if not T else 9.5), (5.5, 7, 3), BLACK); cv.ell(Y(7, 0, 12.6 if not T else 10), (3.6, 4.4, 2.2), ORANGE, glow=.9); cv.ell(Y(5, 0, 13 if not T else 10.4), (2, 2.4, 1.6), GOLD, glow=.9)
    cyl(cv, h + 6, h + 14, 4, 3.2, CLAY_D); ring(cv, h + 14, 4.2, BLACK)
def urn(cv, T):
    if T:
        cv.ell(Y(20), (11, 19, 11), CLAY, shader=stripes(CLAY, CREAM, 7, 1, .9)); cyl(cv, 36, 54, 5, 4.2, CLAY); ring(cv, 55, 7, CLAY_D, 1.6); ring(cv, 2, 8, CLAY_D, 2)
        for s in (1, -1): cv.cone(V(5 * s, 50, 0), V(10 * s, 40, 0), 1.4, 1.4, CLAY_D)
    else:
        cv.ell(Y(15), (15, 14, 15), CLAY, shader=stripes(CLAY, CREAM, 6, 1, .9)); cyl(cv, 26, 33, 8, 9, CLAY); ring(cv, 34, 10.5, CLAY_D, 1.6); ring(cv, 2, 9, CLAY_D, 2)
def flower(cv, T):
    cyl(cv, 0, 13, 8, 11.5, CLAY, color2=CLAY_D, split=.8); ring(cv, 13.5, 12.4, CLAY_D, 1.5)
    balls = ((0, 24, 0, 12),) if not T else ((0, 30, 0, 10), (0, 50, 0, 8))
    if T: cv.cone(Y(13), Y(50), 1.6, 1.3, WOOD_D)
    for (x, y, z, r) in balls:
        cv.ell(V(x, y, z), r, LEAF, shader=stripes(LEAF, LEAF_D, 5, 0, .7))
        for k in range(7):
            a = k * .9; p = V(x + math.cos(a) * r * .75, y + math.sin(a * 1.7) * r * .6 + 2, z + r * .62); cv.ell(p, 3.0, (PINK, GOLD, CREAM)[k % 3]); cv.ell(p + V(0, 0, 1.6), 1.2, ORANGE)
def brick(cv, T):
    rows = 5 if T else 3
    for r in range(rows):
        for k in range(2):
            x = (-7.5 + 15 * k) + (3.5 if r % 2 else -3.5) * (1 if rows > 3 else 1) * .5; cv.box(V(x, 5 + r * 10, 0), V(7.2, 4.6, 8), (CLAY, V(222, 124, 86))[(r + k) % 2])
    cv.box(V(3, 5 + rows * 10 - 1, 1), V(7.2, 4.6, 8), CLAY_D, rot=ry(.5))
def basket(cv, T):
    for i in range(2 if T else 1):
        y = i * 27; cyl(cv, y, y + 22, 10.5, 14.5, TAN, color2=WOOD, split=.86)
        for k in range(1, 4): ring(cv, y + k * 5.5, 11 + k * 1.05, WOOD, .7)
        ring(cv, y + 22.5, 15.2, WOOD_D, 1.6)
    top = 27 * (2 if T else 1) - 4
    for k, (x, z) in enumerate(((-6, 3), (5, 5), (0, -4), (7, -3), (-3, 8))): cv.ell(V(x, top + 3 + (k % 2) * 2, z), (5.2, 4.6, 4.8), (GOLD, ORANGE, V(170, 210, 80))[k % 3])
def log(cv, T):
    if T:
        cyl(cv, 0, 56, 11, 10, WOOD_D, color2=WOOD_D); cv.ell(Y(56), (10, 2, 10), TAN, shader=lambda q, c: (np.where((np.cos(np.hypot(q[:, 0], q[:, 2]) * 14) > .4)[:, None], WOOD, c), None))
        cv.cone(V(7, 30, 4), V(17, 39, 6), 3.4, 2.4, WOOD_D); cv.ell(V(18, 40, 6), 3.2, LEAF)
        for s in (1, -1): cv.cone(V(6 * s, 4, 6), V(14 * s, 0, 9), 4.2, 1.6, WOOD_D)
    else:
        cv.cone(V(-15, 12, 0), V(15, 12, 0), 12, 12, WOOD_D); cv.ell(V(16.5, 12, 0), (2.6, 11.4, 11.4), TAN, shader=lambda q, c: (np.where((np.cos(np.hypot(q[:, 1], q[:, 2]) * 13) > .4)[:, None], WOOD, c), None))
        cv.cone(V(-4, 20, 5), V(-9, 31, 8), 3.2, 2.2, WOOD_D); cv.ell(V(-10, 33, 8), 3.4, LEAF); cv.ell(V(2, 23.5, 3), (7, 2.4, 6), LEAF_D)
def root(cv, T):
    if T:
        pts = [V(-3, 0, 0), V(2, 16, 2), V(-3, 32, -1), V(3, 46, 1), V(0, 58, 0)]; B2.chain(cv, pts, [9, 7.5, 6, 4.4, 2], WOOD_D)
        for (p, d) in ((pts[2], V(-10, 6, 3)), (pts[3], V(9, 5, -2))): cv.cone(p, p + d, 2.6, 1.2, WOOD_D); cv.ell(p + d, (5, 2.6, 4), LEAF)
        for s in (1, -1): cv.cone(V(-3, 3, 0), V(12 * s - 3, 0, 6 * s), 5, 1.6, WOOD_D)
    else:
        for (a, b, c2, r) in ((V(-15, 0, 4), V(-6, 22, 2), V(6, 9, 0), 5.4), (V(4, 0, -5), V(9, 28, -2), V(16, 2, 3), 4.6), (V(-4, 0, 9), V(1, 14, 8), V(10, 0, 9), 3.8)):
            B2.chain(cv, [a, a * .4 + b * .6, b, b * .5 + c2 * .5, c2], [r, r * .95, r * .85, r * .7, r * .5], WOOD_D)
        cv.ell(V(8, 30, -2), (5.5, 2.6, 4.4), LEAF); cv.ell(V(-7, 24, 2), (4.6, 2.4, 4), LEAF_D)
def reel(cv, T):
    for i in range(2 if T else 1):
        y = i * 29 + 1; col = (RED, TEAL)[i]
        cyl(cv, y, y + 3.4, 14.5, 14.5, WOOD); cyl(cv, y + 3.4, y + 22, 9.5, 9.5, col, color2=col); cyl(cv, y + 22, y + 25.4, 14.5, 14.5, WOOD)
        for k in range(1, 6): ring(cv, y + 3.4 + k * 3.1, 9.9, col * .8, .5)
    cv.cone(Y(25 if not T else 54), V(14, 34 if not T else 62, 8), .7, .7, CREAM)
def crate(cv, T):
    for i in range(2 if T else 1):
        c = V(1.5 * i, 14 + i * 28, 0); r = ry(.25 * i); cv.box(c, V(14, 13.5, 12), WOOD, rot=r)
        for dy in (-10.5, 10.5): cv.box(c + V(0, dy, 0), V(14.8, 2.4, 12.8), WOOD_D, rot=r)
        for dx in (-11, 11): cv.box(c + r @ V(dx, 0, 0), V(2.2, 13.5, 12.6), TAN, rot=r)
        cv.box(c + r @ V(0, 0, 12.2), V(2, 15, .6), TAN, rot=r @ rz(.82))
def ribbed(cv, T):
    if T: cyl(cv, 0, 50, 10, 10, STEEL); [ring(cv, 4 + k * 6, 10.8, STEEL * .78, 1.0) for k in range(8)]; cyl(cv, 50, 58, 10, 5.5, STEEL); ring(cv, 59, 6.4, IRON, 1.6); cv.cone(V(-6, 60, 0), V(6, 60, 0), 1.2, 1.2, IRON)
    else: cv.ell(Y(16), (15, 15, 15), TEAL, shader=stripes(TEAL, TEAL * .72, 12, 1, .2)); cyl(cv, 28, 34, 8.5, 10, TEAL); ring(cv, 35, 11, BRASS, 1.5); ring(cv, 2, 9, TEAL * .7, 2)
def sluice(cv, T):
    if T:
        for s in (1, -1): cv.box(V(11 * s, 28, 0), V(2.6, 28, 4), STONE_D)
        cv.box(V(0, 20, 0), V(9, 18, 1.6), TEAL, lines=1.0); cv.box(V(0, 55, 0), V(14, 2.6, 4.6), STONE_D); cv.cone(V(0, 40, 0), V(0, 57, 0), 1.3, 1.3, IRON); cv.ell(V(0, 61, 0), (6.5, 6.5, 1.6), RED); cv.ell(V(0, 61, 1), (3.2, 3.2, 1.4), IRON)
    else:
        cv.box(V(0, 12, 0), V(15, 12, 11), STONE, lines=.6); cv.box(V(0, 12, 11.2), V(10.5, 8, .8), BLACK)
        for k in range(5): cv.box(V(-8 + k * 4, 12, 12), V(.9, 8, .7), TEAL)
        cv.ell(V(0, 2, 16), (11, 1.4, 5), V(120, 200, 230)); cv.box(V(0, 25, 0), V(16, 1.8, 12), STONE_D)
def pipe(cv, T):
    if T: cyl(cv, 0, 54, 8.5, 8.5, STEEL); [ring(cv, y, 10.2, IRON, 1.6) for y in (3, 28, 52)]; cyl(cv, 54, 57, 9.4, 9.4, IRON); ring(cv, 57.6, 6.6, BLACK, .8); cv.ell(V(9, 40, 3), (3.6, 3.6, 2), RED); cv.cone(V(6, 40, 3), V(9, 40, 3), 1.2, 1.2, IRON)
    else:
        cv.cone(V(-15, 13, 0), V(13, 13, 0), 12.5, 12.5, STEEL)
        for x in (-15, -1, 13): cv.ell(V(x, 13, 0), (2.2, 14, 14), IRON)
        cv.ell(V(15, 13, 0), (1.4, 10.5, 10.5), BLACK); cv.ell(V(15.6, 9, 3), (1, 3.4, 4), V(120, 200, 230))
def barrel(cv, T):
    for i in range(2 if T else 1):
        y = i * 29; cv.ell(Y(y + 15), (14.5, 18, 14.5), WOOD, shader=lambda q, c: ((np.where((np.cos(np.arctan2(q[:, 2], q[:, 0]) * 9) > .93)[:, None], WOOD_D, c)), np.abs(q[:, 1]) < .78))
        for yy in (4, 15, 26): ring(cv, y + yy, 14.9 if yy == 15 else 13.2, IRON, 1.3)
        ring(cv, y + 29, 11.6, WOOD_D, 1.2); ring(cv, y + 29.4, 9.6, TAN, .8)
def lotus(cv, T):
    cv.ell(Y(1.6), (16, 1.8, 13), LEAF_D); cv.ell(Y(2.4, -2, 1), (12, 1.4, 9.5), LEAF)
    base = 4 if not T else 40
    if T: cv.cone(Y(2), Y(40), 2.0, 1.6, LEAF_D); cv.ell(V(8, 22, 3), (8, 1.6, 6), LEAF, rot=rz(.4))
    for ringk, (n, rad, hh, col) in enumerate(((8, 9, 12, PINK), (6, 5.5, 16, V(255, 170, 190)), (4, 2.5, 18, CREAM))):
        for k in range(n):
            a = k / n * 2 * math.pi + ringk * .4; b0 = V(math.cos(a) * rad * .5, base, math.sin(a) * rad * .5); cv.cone(b0, V(math.cos(a) * rad * 1.5, base + hh, math.sin(a) * rad * 1.5), 4.2 - ringk, 1.0, col, flat=.55)
    cv.ell(Y(base + 5), 4, GOLD)
def reed(cv, T):
    n = 6; hh = 56 if T else 30
    for k in range(n):
        x = -10 + k * 4; z = (k % 3 - 1) * 4; lean = (k - 2.5) * .06; top = V(x + lean * hh, hh - (k % 3) * 6, z); cv.cone(V(x, 0, z), top, 1.2, .9, LEAF_D)
        if k % 2 == 0: cv.cone(top + V(0, -9, 0), top + V(lean * 3, -1, 0), 2.7, 2.5, WOOD_D)
        else: cv.cone(V(x, 0, z), V(x + (6 if k > 2 else -6), hh * .6, z + 2), 2.2, .5, LEAF, flat=.4)
    cv.ell(Y(1.5), (14, 2, 8), LEAF_D)
def paddle(cv, T):
    if T:
        for (x, lean, col) in ((-6, -.08, RED), (0, 0, TEAL), (6, .08, GOLD)):
            top = V(x + lean * 60, 60, 0); cv.cone(V(x, 0, 0), top, 1.5, 1.3, WOOD); cv.ell(V(x + lean * 12, 12, 0), (5.2, 11, 1.6), col, rot=rz(-lean)); cv.ell(top, 2.2, WOOD_D)
        cv.box(V(0, 30, -2), V(10, 1.6, 1.6), WOOD_D)
    else:
        cv.box(V(0, 9, 0), V(14, 2, 6), WOOD_D);
        for s in (1, -1): cv.box(V(10 * s, 4.5, 0), V(1.8, 4.5, 6), WOOD_D)
        for (a, b2, col) in ((V(-17, 12, 3), V(15, 26, 3), RED), (V(17, 12, -3), V(-15, 28, -3), TEAL)):
            cv.cone(a, b2, 1.5, 1.3, WOOD); d = (b2 - a) / np.linalg.norm(b2 - a); cv.ell(b2 + d * 5, (8, 4.6, 1.6), col, rot=rz(math.atan2(d[1], d[0])))
def tea(cv, T):
    cv.box(V(0, 13, 0), V(14, 13, 12), V(46, 120, 88)); cv.box(V(0, 13, 12.2), V(9, 8.5, .6), CREAM); cv.ell(V(0, 14, 13), (5, 3, 1), LEAF, rot=rz(.6)); cv.ell(V(2, 12, 13.2), (4, 2.4, 1), LEAF_D, rot=rz(-.5))
    for dy in (1.5, 24.5): cv.box(V(0, dy, 0), V(14.8, 1.6, 12.8), BRASS)
    if T:
        cv.ell(V(0, 37, 0), (12, 12, 10.5), TAN, shader=stripes(TAN, WOOD, 16, 0, .9)); cv.cone(V(0, 47, 0), V(0, 53, 0), 4, 5.5, TAN); cv.ell(V(0, 47.5, 0), (4.6, 1.4, 4.6), WOOD_D)
        for k in range(4): cv.ell(V(-5 + k * 3.4, 55 + (k % 2) * 1.5, 1), (2.6, 3.6, 1.6), LEAF, rot=rz(.5 - k * .3))
    else:
        for k in range(5): cv.ell(V(-8 + k * 4, 28 + (k % 2) * 2, 2), (3, 4.2, 2), (LEAF, LEAF_D)[k % 2], rot=rz(.6 - k * .3))
def stone(cv, T):
    def carve(q, c):
        c = c.copy(); c[(q[:, 2] > .3) & (np.abs(np.hypot(q[:, 0], q[:, 1] - .1) - .45) < .09)] = STONE_D; c[(q[:, 2] > .3) & (np.hypot(q[:, 0], q[:, 1] - .1) < .12)] = STONE_D; return c, None
    if T: cv.ell(Y(30), (11, 31, 9), STONE, shader=carve); cv.ell(Y(3), (14, 4, 11), STONE_D); cv.ell(V(5, 8, 8), (5, 2.4, 3), LEAF_D)
    else: cv.ell(Y(15), (15.5, 16, 12), STONE, shader=carve); cv.ell(Y(3), (17, 4, 13), STONE_D); cv.ell(V(-8, 7, 9), (5, 2.4, 3), LEAF_D)
def crystal(cv, T):
    shards = ((0, 0, 58, 8.5, VIOLET, 0), (-9, 3, 30, 5.5, CYAN, -.3), (9, -2, 24, 5, VIOLET, .35)) if T else ((-7, 0, 30, 7.5, VIOLET, -.2), (7, 2, 34, 7, CYAN, .18), (0, 6, 18, 5.5, V(220, 170, 255), 0))
    for (x, z, hh, r, col, lean) in shards:
        top = V(x + lean * hh, hh, z); mid = V(x + lean * hh * .7, hh * .7, z); cv.cone(V(x, 0, z), mid, r, r * .85, col, flat=.7, glow=.25); cv.cone(mid, top, r * .85, .6, col * 1.08, flat=.7, glow=.35)
    cv.ell(Y(2), (15, 3, 10), STONE_D)
def column(cv, T):
    hh = 54 if T else 26; flute = lambda q, c: (np.where((np.cos(np.arctan2(q[:, 2], q[:, 0]) * 10) > .55)[:, None], CREAM * .82, c), None)
    cv.box(V(0, 2.5, 0), V(13, 2.5, 11), STONE)
    for i in range(int(hh / 9)): cv.ell(Y(9.5 + i * 9), (9.5, 5.2, 9.5), CREAM, shader=flute)
    if T: cv.box(V(0, hh + 5, 0), V(12.5, 2.4, 10.5), STONE); cv.ell(Y(hh + 1.5), (11, 2.4, 11), CREAM)
    else: cv.ell(Y(hh + 5, 2, 0), (9.8, 3, 9.8), CREAM, rot=rz(.25)); cv.ell(V(13, 4, 8), (5, 3.4, 4), CREAM * .9); cv.ell(V(-9, 9, 9), (4.6, 2.2, 3), LEAF_D)
def boulder(cv, T):
    if T:
        for (y, rx_, ry_, x) in ((9, 14, 10, 0), (26, 11, 8.5, 2), (40, 8.5, 7, -1.5), (52, 5.5, 5, 1)): cv.ell(V(x, y, 0), (rx_, ry_, rx_ * .85), (STONE, V(190, 170, 150), STONE_D, V(200, 186, 170))[int(y) % 4], rot=rz(.12 * x))
    else:
        cv.ell(V(-3, 13, 0), (15, 14, 12), V(176, 150, 130), rot=rz(.2)); cv.ell(V(9, 8, 5), (9, 8.5, 8), STONE); cv.ell(V(-9, 5, 8), (6, 5, 5), STONE_D); cv.ell(V(-2, 25, 3), (7, 2.4, 5), LEAF_D)
def lash(cv, T):
    hh = 58 if T else 30; bamboo = V(196, 204, 96)
    for k, (x, z) in enumerate(((-7, 2), (0, 5), (7, 1), (-3, -4), (4, -4))):
        top = hh - (k % 3) * 4; cv.cone(V(x, 0, z), V(x, top, z), 4.2, 4.0, bamboo)
        for j in range(1, int(top / 10) + 1): cv.ell(V(x, j * 10 - 2, z), (4.6, 1.0, 4.6), V(150, 160, 70))
        cv.ell(V(x, top, z), (3.2, .8, 3.2), V(120, 110, 60))
    for y in (8, hh - 12): ring(cv, y, 11.5, TAN, 1.8)
def bollard(cv, T):
    hh = 42 if T else 22; cyl(cv, 0, hh, 8.5, 7, IRON); cv.ell(Y(hh), (11.5, 5, 11.5), IRON); ring(cv, 2, 11, BLACK, 2.2)
    for k in range(3): ring(cv, hh * .45 + k * 2.6, 8.8, TAN, 1.4)
    cv.cone(V(8, hh * .45, 0), V(15, 3, 6), 1.5, 1.5, TAN)
    if T: cyl(cv, hh + 4, hh + 9, 2, 2, IRON); cv.ell(Y(hh + 13), (4.6, 5.5, 4.6), GOLD, glow=.85); ring(cv, hh + 18.5, 5.5, IRON, 1.2)
def drum(cv, T):
    lace = lambda q, c: (np.where((np.abs(((np.arctan2(q[:, 2], q[:, 0]) * 3.2 + q[:, 1] * 3) % 2) - 1) < .16)[:, None], CREAM, c), np.abs(q[:, 1]) < .8)
    for i in range(2 if T else 1):
        y = i * 29; cv.ell(Y(y + 15), (13.5, 18, 13.5), RED if i == 0 else TEAL, shader=lace); ring(cv, y + 1.5, 10.6, BRASS, 1.5); ring(cv, y + 28.5, 10.6, BRASS, 1.5); ring(cv, y + 29.6, 9.4, CREAM, .9)
    cv.cone(V(8, 31 if not T else 60, 3), V(17, 37 if not T else 66, 6), 1.1, 1.1, WOOD); cv.ell(V(17.5, 37.5 if not T else 66.5, 6), 2.2, CREAM)
def lantern(cv, T):
    base = 6 if not T else 36
    if T: cyl(cv, 0, 4, 9, 7, IRON); cv.cone(Y(4), Y(36), 1.6, 1.6, IRON)
    else: cyl(cv, 0, 5, 9, 8, WOOD_D)
    ribs = lambda q, c: (np.where((np.cos(q[:, 1] * 13) > .86)[:, None], V(214, 90, 50), c), None)
    cv.ell(Y(base + 12), (12.5, 12.5, 12.5), V(255, 150, 60), shader=ribs, glow=.5); cv.ell(Y(base + 12), (7, 8, 7), GOLD, glow=.9)
    for dy in (.5, 23.5): ring(cv, base + dy, 6.2, BLACK, 1.6)
    cv.cone(Y(base + 24), Y(base + 28), .8, .8, BLACK); cv.cone(Y(base - 1 if T else base), Y(base - 7 if T else base - 4), 1.3, .4, RED)
def hive(cv, T):
    n = 7 if T else 4
    for k in range(n): ring(cv, 4 + k * 7.4, (14.5 - k * (1.5 if T else 2.4)), (GOLD, V(232, 170, 50))[k % 2], 4.4)
    cv.ell(Y(4 + n * 7.4 - 2), (4.6 if T else 5.4, 4, 4.6 if T else 5.4), V(232, 170, 50)); cv.ell(V(0, 7, 13.6), (4, 4.6, 2), BLACK)
    for k in range(4): b0 = V(-14 + k * 9, 20 + (k * 13) % 30, 12); cv.ell(b0, (2.2, 1.6, 1.6), GOLD); cv.ell(b0 + V(.6, 0, .2), (.7, 1.7, 1.7), BLACK); cv.ell(b0 + V(-.6, 1.6, 0), (1.6, .5, 1.2), CREAM)
def tire(cv, T):
    for k in range(3 if T else 2):
        y = 6 + k * 11; ring(cv, y, 15.5, BLACK, 5.6); ring(cv, y + 5, 9, V(70, 66, 80), 1.2)
    top = 6 + (3 if T else 2) * 11 - 3
    for k, (x, z, hh, r) in enumerate(((0, 0, 24, 7), (-6, 3, 15, 5), (6, -2, 17, 5.4), (2, 5, 11, 4))):
        cv.cone(V(x, top, z), V(x + (k % 2) * 2 - 1, top + hh, z), r, .8, (ORANGE, RED, V(255, 180, 60), GOLD)[k], glow=.75); cv.cone(V(x, top, z + 1.5), V(x, top + hh * .55, z + 1.5), r * .5, .6, GOLD, glow=.95)
def cone(cv, T):
    hh = 54 if T else 34; cv.box(V(0, 2, 0), V(13, 2, 13), BLACK)
    white = lambda q, c: (c, None)
    cv.frustum(Y(4), Y(hh), 9.5 if not T else 7, 2.4, ORANGE)
    for (y0, y1) in (((hh * .42, hh * .56),) if not T else ((hh * .3, hh * .4), (hh * .6, hh * .7))):
        r0 = (9.5 if not T else 7) + (2.4 - (9.5 if not T else 7)) * ((y0 - 4) / (hh - 4)); r1 = (9.5 if not T else 7) + (2.4 - (9.5 if not T else 7)) * ((y1 - 4) / (hh - 4)); cv.frustum(Y(y0), Y(y1), r0 + .4, r1 + .4, CREAM)
    cv.ell(Y(hh), 2.6, ORANGE)
def beacon(cv, T):
    hh = 42 if T else 12; cv.box(V(0, 4, 0), V(11, 4, 10), IRON); cv.box(V(0, 4, 10.2), V(7, 2, .5), GOLD)
    if T: cyl(cv, 8, hh, 3.2, 2.6, STEEL); [ring(cv, y, 3.6, IRON, 1) for y in (16, 28)]
    cyl(cv, hh, hh + 3, 7, 7, IRON); cv.ell(Y(hh + 10), (7.5, 8.5, 7.5), CYAN, glow=.9); cv.ell(Y(hh + 10), (3.4, 4.4, 3.4), CREAM, glow=1.0)
    for a in range(4): ang = a * 1.571 + .4; cv.cone(V(math.cos(ang) * 7.6, hh + 3, math.sin(ang) * 7.6), V(math.cos(ang) * 3, hh + 20, math.sin(ang) * 3), .8, .8, IRON)
    ring(cv, hh + 20, 3.8, IRON, 1.4)
def stall(cv, T):
    cv.box(V(0, 12, 0), V(20, 2, 11), WOOD);
    for (x, z) in ((-18, 9), (18, 9), (-18, -9), (18, -9)): cv.cone(V(x, 0, z), V(x, 46, z), 1.5, 1.5, WOOD_D)
    awn = lambda q, c: (np.where((np.cos(q[:, 0] * 11) > 0)[:, None], CREAM, c), None)
    cv.ell(Y(48), (24, 4.6, 14), RED, shader=awn); cv.ell(Y(44.5, 0, 12), (23, 2.6, 2), RED, shader=awn)
    for k in range(7): cv.ell(V(-14 + k * 4.6, 16.5 + (k % 2), 4 - (k % 3) * 4), (4.4, 4, 4.2), (GOLD, ORANGE, RED, V(170, 210, 80))[k % 4])
    for s in (1, -1): cv.ell(V(13 * s, 4.5, 11.5), (4.6, 4.6, 1.6), BLACK); cv.ell(V(13 * s, 4.5, 12.4), (1.6, 1.6, 1.2), BRASS)
def wheel(cv, T):
    base = 34 if T else 16
    if T: cv.box(V(0, 2, 0), V(13, 2, 9), WOOD_D); [cv.cone(V(8 * s, 3, 0), V(0, base, 0), 2.4, 2.0, WOOD_D) for s in (1, -1)]
    def spokes(q, c):
        c = c.copy(); r = np.hypot(q[:, 0], q[:, 1]); a = np.arctan2(q[:, 1], q[:, 0]); keep = (r > .76) | (r < .24) | (np.cos(a * 8) > .9); c[r < .24] = BRASS; c[(r > .76)] = WOOD_D; c[(r > .84) & (np.cos(a * 16) > .6)] = BRASS; return c, keep
    cv.ell(V(0, base, 0), (16, 16, 2.4), WOOD, shader=spokes, rot=rz(.1) if not T else None); cv.ell(V(0, base, 2.4), (2.6, 2.6, 2), IRON)
def stump(cv, T):
    hh = 46 if T else 20; cyl(cv, 0, hh, 13 if not T else 11, 11 if not T else 9, WOOD_D)
    rings = lambda q, c: (np.where((np.cos(np.hypot(q[:, 0], q[:, 2]) * 15) > .3)[:, None], WOOD, c), None)
    if T:
        for k in range(5): a = k * 1.257; cv.cone(V(math.cos(a) * 6, hh - 2, math.sin(a) * 6), V(math.cos(a) * 7.5, hh + 7 + (k % 3) * 4, math.sin(a) * 7.5), 3.8, .8, WOOD)
        cv.cone(V(8, 26, 3), V(18, 34, 6), 3, 2, WOOD_D); cv.ell(V(19, 36, 6), (5, 3, 4), LEAF)
    else: cv.ell(Y(hh), (11, 2, 11), TAN, shader=rings)
    for k in range(4): a = k * 1.571 + .5; cv.cone(V(math.cos(a) * 8, 5, math.sin(a) * 8), V(math.cos(a) * 18, 0, math.sin(a) * 14), 4.6, 1.5, WOOD_D)
    cv.ell(V(-6, hh * .55, 9), (6, 4.4, 3), LEAF_D); cv.ell(V(5, 7, 11), (3, 2.6, 2.4), RED); cv.cone(V(5, 3, 11), V(5, 7, 11), 1, 1, CREAM)
def shell(cv, T):
    if T:
        coral = V(255, 130, 120)
        for (b0, t0, r) in ((V(0, 0, 0), V(-2, 30, 0), 4.6), (V(-2, 30, 0), V(-10, 50, 2), 3.2), (V(-2, 30, 0), V(6, 56, -1), 3.4), (V(-1, 16, 0), V(11, 32, 3), 3), (V(-1, 14, 0), V(-12, 28, -2), 2.8), (V(6, 56, -1), V(10, 64, 0), 2)): cv.cone(b0, t0, r, r * .6, coral); cv.ell(t0, r * .75, V(255, 190, 170))
        cv.ell(Y(2), (12, 3, 9), TAN)
    else:
        fan = lambda q, c: (np.where((np.cos(np.arctan2(q[:, 0], q[:, 1] + 1.0) * 26) > .5)[:, None], V(255, 170, 160), c), q[:, 1] > -.8)
        cv.ell(V(0, 16, 0), (17, 17, 5.5), V(250, 130, 130), shader=fan); cv.ell(V(0, 3, 0), (6.5, 3.6, 5), V(255, 200, 180)); cv.ell(V(12, 4, 8), (3.4, 3, 3), CREAM); cv.ell(Y(1.2), (16, 1.6, 9), TAN)
def bell(cv, T):
    hang = 44 if T else 0
    if T:
        for s in (1, -1): cv.cone(V(13 * s, 0, 0), V(13 * s, 62, 0), 2.2, 2.0, WOOD_D)
        cv.cone(V(-15, 62, 0), V(15, 62, 0), 2.4, 2.4, WOOD_D); cv.cone(Y(62), Y(56), .9, .9, IRON); body = 34
    else: body = 4
    flare = lambda q, c: (c, None)
    cv.frustum(Y(body), Y(body + 4), 13 if not T else 10.5, 11 if not T else 9, BRASS); cv.frustum(Y(body + 4), Y(body + 18), 11 if not T else 9, 7.5 if not T else 6.2, GOLD); cv.ell(Y(body + 19), (7.5 if not T else 6.2, 6, 7.5 if not T else 6.2), GOLD)
    ring(cv, body + 1, 13.6 if not T else 11, BRASS, 1.6); ring(cv, body + 10, 9.6 if not T else 8, BRASS, .9); cv.ell(Y(body + 26), (2.4, 2.8, 2.4), BRASS); cv.ell(Y(body - 1.5), 2.6, IRON)

def cactus(cv, T):
    ribs = lambda q, c: (np.where((np.cos(np.arctan2(q[:, 2], q[:, 0]) * 9) > .8)[:, None], LEAF_D, c), None)
    if T:
        cv.cone(Y(0), Y(52), 7.5, 7, LEAF); cv.ell(Y(52), (7, 6, 7), LEAF, shader=ribs)
        for (s_, y0, hh) in ((1, 22, 20), (-1, 30, 16)):
            e = V(13 * s_, y0, 0); cv.cone(V(5 * s_, y0, 0), e, 4.2, 4.2, LEAF); cv.cone(e, e + V(0, hh, 0), 4.4, 4, LEAF); cv.ell(e + V(0, hh, 0), 4.2, LEAF)
        for k in range(9): cv.ell(V(0, 6 + k * 5, 7.2), (.8, 2.4, .8), LEAF_D)
        for (x, y) in ((0, 59), (13, 43), (-13, 47)): cv.ell(V(x, y, 0), 3.2, PINK); cv.ell(V(x, y + 1.6, 0), 1.6, GOLD)
    else:
        cv.ell(Y(15), (15, 15.5, 15), LEAF, shader=ribs); cv.ell(V(11, 27, 3), (6.5, 7, 6), LEAF, shader=ribs); cv.ell(Y(31), 3.6, PINK); cv.ell(Y(33), 1.8, GOLD); cv.ell(V(12, 34.5, 3), 2.6, CREAM); cv.ell(Y(1.5), (15, 2, 10), TAN)
# ---- Neon Causeway street furniture (drawn on the far pavement) ----
NEON_P = V(255, 96, 200); NEON_C = V(110, 240, 255)
def diner(cv, T):
    cv.box(V(0, 16, 0), V(30, 16, 12), V(250, 236, 220)); cv.box(V(-8, 17, 12.2), V(15, 9, .6), V(60, 200, 220), glow=.55); cv.box(V(19, 13, 12.2), V(6, 13, .6), V(120, 70, 200))
    for k in range(3): cv.box(V(-18 + k * 10, 17, 12.6), V(.7, 9, .5), V(250, 236, 220))
    awn = lambda q, c: (np.where((np.cos(q[:, 0] * 14) > 0)[:, None], NEON_C, c), None)
    cv.ell(V(0, 33, 9), (32, 3.2, 9), NEON_P, shader=awn); cv.box(V(0, 34, 0), V(31, 2, 12.6), V(120, 70, 200))
    cv.box(V(0, 46, 2), V(20, 9, 1.6), V(44, 40, 70)); cv.ell(V(-8, 46, 4), (7, 7, 1.2), NEON_P, glow=.95, shader=lambda q, c: (c, np.hypot(q[:, 0], q[:, 1]) > .7))
    cv.ell(V(-8, 44, 4.4), (4.4, 2.6, 1), NEON_C, glow=.95, shader=lambda q, c: (c, q[:, 1] < .2)); [cv.cone(V(-10 + k * 2, 46.5, 4.4), V(-10 + k * 2 + .8, 50, 4.4), .5, .3, V(255, 255, 255), glow=.9) for k in range(3)]
    for k in range(3): cv.box(V(4 + k * 5.2, 46, 4), V(1.6, 4.6 - k, .6), (NEON_C, V(255, 226, 120), NEON_P)[k], glow=.9)
def table(cv, T):
    cv.cone(Y(0), Y(34), 1.1, 1.1, IRON); awn = lambda q, c: (np.where((np.cos(np.arctan2(q[:, 2], q[:, 0]) * 4) > 0)[:, None], CREAM, c), q[:, 1] > -.1)
    cv.ell(Y(33), (17, 7, 17), NEON_P if not T else NEON_C, shader=awn); cyl(cv, 12, 14, 9, 9, CREAM); cv.cone(Y(0), Y(12), 1.6, 1.6, IRON)
    for s_ in (1, -1): cyl(cv, 0, 7, 3, 3, IRON, x=13 * s_); ring(cv, 7.6, 4, RED, 1.2, x=13 * s_)
    cv.ell(V(-3, 15.6, 2), (1.8, 1.8, 1.8), CYAN); cv.ell(V(3, 15.4, -1), (2.2, 1.2, 2.2), GOLD)
def vending(cv, T):
    cv.box(V(0, 20, 0), V(10, 20, 8), TEAL if not T else NEON_P * .85); cv.box(V(-1.5, 24, 8.2), V(6.5, 12, .5), V(40, 50, 90), glow=.2)
    for r in range(3):
        for c2 in range(3): cv.ell(V(-6 + c2 * 4.5, 16 + r * 7, 8.6), (1.6, 2.4, .8), (RED, GOLD, CYAN, PINK, CREAM)[(r * 2 + c2) % 5], glow=.6)
    cv.box(V(7, 22, 8.2), V(1.4, 5, .5), CREAM, glow=.5); cv.box(V(0, 5, 8.2), V(6.5, 2.4, .5), BLACK); cv.box(V(0, 41, 0), V(10.6, 1.4, 8.6), IRON)
def sign(cv, T):
    cv.cone(Y(0), Y(50), 1.6, 1.4, IRON); cv.box(V(0, 2, 0), V(6, 2, 6), IRON)
    cv.ell(V(0, 52, 1), (11, 11, 1.4), NEON_C if T else NEON_P, glow=.95, shader=lambda q, c: (c, np.abs(np.hypot(q[:, 0], q[:, 1]) - .78) < .2))
    for k in range(5): a = k * 1.2566 + 1.57; cv.cone(V(0, 52, 1.6), V(math.cos(a) * 6.5, 52 + math.sin(a) * 6.5, 1.6), 1.5, .5, GOLD, glow=.95)
    cv.cone(V(0, 30, 1), V(9, 30, 1), 1.4, 1.4, NEON_P if T else NEON_C, glow=.9); cv.cone(V(9, 30, 1), V(5, 34, 1), 1.2, .6, NEON_P if T else NEON_C, glow=.9); cv.cone(V(9, 30, 1), V(5, 26, 1), 1.2, .6, NEON_P if T else NEON_C, glow=.9)
def busstop(cv, T):
    for x in (-18, 18): cv.cone(V(x, 0, 0), V(x, 36, 0), 1.4, 1.4, IRON)
    cv.box(V(0, 37, 2), V(21, 1.6, 9), NEON_C, glow=.5); cv.box(V(0, 20, -4), V(18, 13, .6), V(120, 200, 230), glow=.15); cv.box(V(0, 9, 3), V(13, 1.4, 4), WOOD); 
    for x in (-10, 10): cv.box(V(x, 4, 3), V(1.2, 4, 3.4), IRON)
    cv.box(V(14, 26, -3), V(4.4, 6.4, .5), NEON_P, glow=.8)
# ---- furniture for the other paths: plain village and town pieces. The tall form is a second colour. ----
def bench(cv, T):
    col = WOOD if not T else TEAL
    cv.box(V(0, 9, 0), V(16, 1.2, 5), col); cv.box(V(0, 16, -4.4), V(16, 4.4, .9), col, lines=.8)
    for x in (-13, 13): cv.box(V(x, 4.5, 0), V(1.2, 4.5, 4.6), IRON); cv.box(V(x, 14, -4.6), V(1.2, 6, .8), IRON)
def chai(cv, T):
    cv.box(V(0, 9, 0), V(18, 9, 9), WOOD, lines=.8); cv.box(V(0, 18.6, 0), V(19.5, 1, 10), WOOD_D)
    for (x, z) in ((-17, 8), (17, 8), (-17, -8), (17, -8)): cv.cone(V(x, 18, z), V(x, 40, z), 1.1, 1.1, WOOD_D)
    awn = lambda q, c: (np.where((np.cos(q[:, 0] * 12) > 0)[:, None], CREAM, c), None)
    cv.ell(Y(42), (22, 3.6, 12), RED if not T else LEAF, shader=awn)
    cv.ell(V(-8, 24, 2), (5, 5, 5), BRASS); cv.cone(V(-4, 25, 2), V(1, 28, 2), 1.2, .8, BRASS); cv.ell(V(-8, 29.5, 2), (2.2, 1.4, 2.2), IRON)
    for k in range(4): cyl(cv, 19.6, 23.2, 1.7, 2.0, CREAM, x=3 + k * 4.2, z=4)
    cv.ell(V(12, 22.6, -3), (4.4, 3, 4.4), CLAY)
def haystack(cv, T):
    hay = V(240, 206, 110); straw = lambda q, c: (np.where((np.cos(q[:, 1] * 14 + q[:, 0] * 5) > .75)[:, None], V(214, 170, 80), c), None)
    cv.ell(Y(13 if not T else 20), (20 if not T else 16, 15 if not T else 22, 15 if not T else 13), hay, shader=straw); cv.ell(Y(26 if not T else 40), (11 if not T else 8, 7 if not T else 8, 9 if not T else 7), hay, shader=straw)
    cv.cone(V(12, 2, 9), V(20, 30, 9), .9, .9, WOOD_D)
    for k in range(3): cv.cone(V(20, 30, 9), V(19 + k * 1.6, 36, 9), .5, .4, IRON)
def signpost(cv, T):
    cv.cone(Y(0), Y(44), 1.8, 1.6, WOOD_D); cv.ell(Y(1.5), (5, 2, 4), LEAF_D)
    for k, (y, col, dx) in enumerate(((36, TAN, 7), (27, CREAM if not T else TAN, -7))):
        cv.box(V(dx, y, 1), V(10, 3.2, .8), col, rot=rz(.05 * (1 - 2 * k))); cv.cone(V(dx + (11 if dx > 0 else -11), y, 1), V(dx + (15 if dx > 0 else -15), y, 1), 3.2, .4, col, flat=.25)
def tent(cv, T):
    a, b2 = (RED, CREAM) if not T else (TEAL, CREAM); pan = lambda q, c: (np.where((np.cos(np.arctan2(q[:, 2], q[:, 0]) * 5) > 0)[:, None], b2, c), None)
    cv.cone(Y(0), Y(42), 22, 1.0, a, flat=.8); cv.ell(Y(14), (15.4, 14, 12.4), a, shader=pan); cv.ell(V(0, 10, 12.4), (5.5, 10, 2), BLACK); cv.cone(Y(42), Y(49), .7, .7, WOOD_D); cv.cone(V(0, 48, 0), V(7, 46, 0), 2.2, .3, GOLD, flat=.3)
def flag(cv, T):
    cv.cone(Y(0), Y(60), 1.4, 1.0, WOOD_D); cv.box(V(0, 1.5, 0), V(4, 1.5, 4), STONE)
    cols = (RED, GOLD, TEAL, PINK, CREAM) if not T else (ORANGE, CREAM, LEAF, GOLD, PINK)
    for k in range(5): cv.cone(V(1, 56 - k * 6.5, 0), V(11 + (k % 2) * 2, 53 - k * 6.5, 0), 3.4, .4, cols[k], flat=.3)
def well(cv, T):
    cyl(cv, 0, 13, 13, 13, STONE, color2=STONE_D, split=.8); ring(cv, 13.5, 13.6, STONE_D, 1.6); ring(cv, 13.8, 10, V(70, 150, 190), .6)
    for x in (-12, 12): cv.cone(V(x, 13, 0), V(x, 38, 0), 1.6, 1.4, WOOD_D)
    cv.cone(V(-13, 37, 0), V(13, 37, 0), 1.4, 1.4, WOOD_D); cv.ell(Y(42), (17, 3, 11), CLAY if not T else LEAF_D); cv.cone(Y(37), Y(24), .5, .5, TAN); cyl(cv, 18, 24, 3, 3.6, WOOD)
def fruitcart(cv, T):
    cv.box(V(0, 14, 0), V(17, 2.4, 9), WOOD); cv.cone(V(-16, 15, 0), V(-25, 22, 0), 1.1, 1.1, WOOD_D)
    spoke = lambda q, c: (c, (np.hypot(q[:, 0], q[:, 1]) > .78) | (np.cos(np.arctan2(q[:, 1], q[:, 0]) * 8) > .9) | (np.hypot(q[:, 0], q[:, 1]) < .22))
    cv.ell(V(4, 9, 9.6), (9, 9, 1.4), WOOD_D, shader=spoke); cv.cone(V(-12, 0, 6), V(-12, 13, 6), 1.1, 1.1, WOOD_D)
    cols = (GOLD, ORANGE, RED, V(170, 210, 80)) if not T else (V(170, 210, 80), CREAM, PINK, GOLD)
    for k in range(9): cv.ell(V(-13 + k * 3.4, 19 + (k % 3) * 1.6, 3 - (k % 2) * 5), (4, 3.6, 3.8), cols[k % 4])
    cv.cone(V(12, 16, -6), V(12, 44, -6), .9, .9, IRON); cv.ell(V(8, 45, -3), (17, 3.6, 12), cols[0], shader=lambda q, c: (np.where((np.cos(np.arctan2(q[:, 2], q[:, 0]) * 4) > 0)[:, None], CREAM, c), None))
STREET = dict(diner=diner, table=table, vending=vending, sign=sign, busstop=busstop, bench=bench, chai=chai, haystack=haystack, signpost=signpost, tent=tent, flag=flag, well=well, fruitcart=fruitcart)
PROPS = dict(kiln=kiln, urn=urn, flower=flower, brick=brick, basket=basket, log=log, root=root, reel=reel, crate=crate, ribbed=ribbed, sluice=sluice, pipe=pipe, barrel=barrel, lotus=lotus,
             reed=reed, paddle=paddle, tea=tea, stone=stone, crystal=crystal, column=column, boulder=boulder, lash=lash, bollard=bollard, drum=drum, lantern=lantern, hive=hive, tire=tire,
             cone=cone, beacon=beacon, stall=stall, wheel=wheel, stump=stump, shell=shell, bell=bell, cactus=cactus)
def render(name, tall, table=None):
    cv = B4.Canvas(); cv.cel = .4; cv.ink = 1.15; (table or PROPS)[name](cv, tall); return cv.image()
if __name__ == "__main__":
    out = sys.argv[1]; k = B.OW / 256; tw, th = int(84 * k), int(108 * k); ox, oy = int(91 * 1.5 * k) - tw // 2, int(104 * 1.5 * k) - th + int(5 * k)   # the model origin sits 91 x 104 units into each cell, at 1.5 pixels a unit
    names = [n + s for n in PROPS for s in ("", "+")]; cols = 10; rows = (len(names) + cols - 1) // cols
    atlas = Image.new("RGBA", (tw * cols, th * rows)); table = {}
    only = sys.argv[2:]
    for i, full in enumerate(names):
        if only and full.rstrip("+") not in only: continue
        tile = render(full.rstrip("+"), full.endswith("+")).crop((ox, oy, ox + tw, oy + th)); box = tile.getbbox() or (0, 0, 1, 1)
        atlas.paste(tile, (i % cols * tw, i // cols * th)); table[full] = [i % cols, i // cols, box[0], box[1], box[2] - box[0], box[3] - box[1]]; print(full, "ok", flush=True)
    # street furniture: wider tiles, one row
    sw = int(108 * k); sx = int(91 * 1.5 * k) - sw // 2; snames = [n + s_ for n in STREET for s_ in ("", "+")]; street = Image.new("RGBA", (sw * len(snames), th)); stable = {}
    for i, full in enumerate(snames):
        tile = render(full.rstrip("+"), full.endswith("+"), STREET).crop((sx, oy, sx + sw, oy + th)); box = tile.getbbox() or (0, 0, 1, 1); street.paste(tile, (i * sw, 0)); stable[full] = [i, 0, box[0], box[1], box[2] - box[0], box[3] - box[1]]
    street.save(f"{out}/street.webp", quality=int(os.environ.get("BAKE_Q", 86)), method=6); print("STREET", json.dumps({"tile": [sw, th], "items": stable}, separators=(",", ":")))
    atlas.save(f"{out}/props.webp", quality=int(os.environ.get("BAKE_Q", 86)), method=6)
    print("PROPS", json.dumps({"tile": [tw, th], "items": table}, separators=(",", ":")))
