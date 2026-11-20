"""v37 sticker pictures: one toon picture for every delivery, used for stickers, hidden items, the sticker book and the pack.
Usage: BAKE_SS=4 BAKE_OUT=2 BAKE_Q=88 python3 bake9.py <out dir>
Writes items.webp, a grid of 7 x 3 square tiles in path order (path 1 first)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import bake as B, bake2 as B2, bake4 as B4
from bake import V, rz, ry, rx
from bake7 import CLAY, CLAY_D, WOOD, WOOD_D, TAN, STONE, STONE_D, LEAF, LEAF_D, BRASS, IRON, CREAM, RED, PINK, GOLD, TEAL, STEEL, BLACK, ORANGE, VIOLET, CYAN, Y, cyl, ring, stripes
from bake8 import arc, bx, At
from PIL import Image

FLAME = V(255, 220, 110)
def flame(cv, x, y, z, k=1.0): cv.ell(V(x, y, z), (3.4 * k, 7 * k, 3.4 * k), ORANGE, glow=.9); cv.ell(V(x, y - 1.5 * k, z + 1), (1.8 * k, 4 * k, 1.8 * k), FLAME, glow=1.0)
def lamps(cv):
    cv = At(cv, (-3, 9, 0), 1.0)
    for (x, z, k) in ((-13, -8, .8), (6, 2, 1.15)):
        cv.ell(V(x, 20 * k, z), (20 * k, 11 * k, 15 * k), CLAY, shader=lambda q, c: (c, q[:, 1] < .2)); cv.ell(V(x, 22 * k, z), (18 * k, 2.4 * k, 13 * k), CLAY_D); cv.ell(V(x, 22.6 * k, z), (14 * k, 1.6 * k, 10 * k), V(250, 200, 90))
        cv.cone(V(x + 17 * k, 23 * k, z), V(x + 24 * k, 26 * k, z), 3 * k, 1.6 * k, CLAY); flame(cv, x + 22 * k, 34 * k, z, k)
        for j in range(5): cv.ell(V(x - 12 * k + j * 6 * k, 15 * k, z + 13.4 * k), (1.3 * k, 1.3 * k, .6), CREAM)
def mango(cv):
    blush = lambda q, c: (c + (V(244, 96, 60) - c) * np.clip((q[:, 0] + q[:, 1]) * .8 - .1, 0, 1)[:, None], None)
    cv.ell(V(0, 30, 0), (20, 25, 16), V(255, 196, 60), rot=rz(.3), shader=blush); cv.cone(V(-7, 53, 0), V(-9, 60, 0), 1.6, 1.2, WOOD_D)
    cv.ell(V(4, 60, 0), (13, 4.4, 6), LEAF, rot=rz(.25)); cv.ell(V(4, 60.6, 0), (11, .8, 1), LEAF_D, rot=rz(.25))
def kite(cv):
    cv.box(V(2, 38, 0), V(19, 19, .9), RED, rot=rz(math.pi / 4)); cv.box(V(2, 38, .6), V(9.5, 9.5, .7), GOLD, rot=rz(math.pi / 4))
    cv.cone(V(2, 11, 1.2), V(2, 65, 1.2), .9, .9, WOOD_D); cv.cone(V(-25, 38, 1.2), V(29, 38, 1.2), .9, .9, WOOD_D)
    p = V(2, 11, 0)
    for k in range(4): n = p + V(-6 + (k % 2) * 9, -5.5, 0); cv.cone(p, n, .5, .5, IRON); cv.cone(n + V(-4, 0, 0), n + V(4, 1, 0), 2.6, .4, (TEAL, GOLD, PINK, TEAL)[k], flat=.3); p = n
def umbrella(cv):
    cv.cone(V(0, 6, 0), V(0, 58, 0), 1.3, 1.1, WOOD_D); arc(cv, 4.5, 6, 4.5, 1.3, (WOOD_D,), n=6, a0=math.pi, a1=2 * math.pi)
    cv.ell(V(0, 38, 0), (30, 20, 30), RED, shader=lambda q, c: (np.where((np.cos(np.arctan2(q[:, 2], q[:, 0]) * 4) > 0)[:, None], CREAM, c), q[:, 1] > -.02)); cv.ell(V(0, 59, 0), 2.2, GOLD)
def garland(cv):
    for k in range(16):
        a = k * math.pi / 8 + .2; cv.ell(V(math.cos(a) * 21, 33 + math.sin(a) * 23, math.sin(a * 2) * 2), (6.4, 6.4, 5.4), (ORANGE, GOLD, PINK, ORANGE)[k % 4]); cv.ell(V(math.cos(a) * 21, 33 + math.sin(a) * 23, 5.2), 1.7, V(190, 90, 40))
    for k in range(3): cv.ell(V(0, 6 - k * 0 + k * 0, 0) + V((k - 1) * 4, 4 - abs(k - 1) * 3, 4), (3, 4.4, 2.4), (PINK, CREAM, PINK)[k])
def tea(cv):
    cv.ell(V(0, 9, 0), (27, 3.6, 20), CREAM); cv.ell(V(0, 10.6, 0), (20, 1.6, 14), V(226, 214, 190))
    cyl(cv, 12, 40, 12, 18, V(250, 246, 238)); cv.ell(V(0, 40, 0), (18, 2.6, 18), CREAM); cv.ell(V(0, 40.8, 0), (15.4, 1.6, 15.4), V(190, 110, 50))
    arc(cv, 19, 27, 8, 2.2, (V(250, 246, 238),), n=8, a0=-math.pi / 2, a1=math.pi / 2); cv.ell(V(0, 24, 17), (6, 2, 1), TEAL); cv.ell(V(0, 30, 17.4), (9, 1.2, 1), GOLD)
    for k in range(3): cv.ell(V(-7 + k * 7, 52 + (k % 2) * 6, 0), (2.4, 6, 2.4), V(255, 255, 255), rot=rz(.3 * (k - 1)))
def drum(cv):
    R = rz(.35); ax = R @ V(1, 0, 0)
    cv.ell(V(0, 30, 0), (26, 19, 19), RED, rot=R, shader=lambda q, c: (np.where((np.abs(np.abs(q[:, 0]) - .55) < .08)[:, None], GOLD, np.where((np.cos(np.arctan2(q[:, 2], q[:, 1]) * 9) > .9)[:, None] & (np.abs(q[:, 0]) < .5)[:, None], CREAM, c)), np.abs(q[:, 0]) < .8))
    for s_ in (1, -1): cv.ell(V(0, 30, 0) + ax * 20.6 * s_, (2.2, 15.4, 15.4), CREAM, rot=R)
    for s_ in (1, -1): cv.cone(V(8 * s_ + 14, 58, 6), V(-6 * s_ + 8, 46, 9), 1.5, 1.2, WOOD); cv.ell(V(8 * s_ + 14, 58, 6), 2.6, WOOD_D)
def bamboo(cv):
    g1 = V(140, 190, 80); g2 = V(96, 150, 66)
    for i, (x0, x1, z) in enumerate(((-16, -4, -4), (-2, 6, 2), (10, 18, -2))):
        a = V(x0, 6, z); b2 = V(x1, 62 - i * 4, z); cv.cone(a, b2, 4.2, 3.8, g1)
        for k in range(1, 5): cv.ell(a + (b2 - a) * k / 5, (4.9, 1.2, 4.9), g2, rot=rz(-math.atan2(x1 - x0, 56)))
    for (x, y, r_) in ((10, 58, .5), (16, 50, .1), (-10, 60, 2.6), (22, 44, -.3)): cv.ell(V(x + math.cos(r_) * 8, y + math.sin(r_) * 8, 3), (9, 2.6, 2), LEAF, rot=rz(r_))
    cv.cone(V(-18, 20, 5), V(20, 22, 5), 1.6, 1.6, TAN)
def fish(cv):
    sil = V(206, 220, 236); scale = lambda q, col: (np.where((q[:, 1] < -.3)[:, None], V(250, 250, 244), np.where(((np.cos(q[:, 0] * 13) * np.cos(q[:, 1] * 8 + q[:, 0] * 6) > .5) & (q[:, 0] < .4))[:, None], V(120, 170, 214), col)), None)
    cv.ell(V(3, 32, 0), (26, 13.4, 8), sil, rot=rz(.12), shader=scale)
    cv.cone(V(-20, 29, 0), V(-32, 42, 0), 4.2, 1.2, TEAL, flat=.35); cv.cone(V(-20, 29, 0), V(-31, 18, 0), 4.2, 1.2, TEAL, flat=.35)
    cv.cone(V(0, 44, 0), V(-9, 53, 0), 5, .6, TEAL, flat=.3); cv.cone(V(4, 22, 5), V(-4, 14, 7), 3.2, .5, TEAL, flat=.3)
    cv.ell(V(20, 37, 6), (4, 4, 1.6), V(255, 252, 240)); cv.ell(V(20.6, 37, 7.4), (2.1, 2.1, 1), BLACK); cv.ell(V(28.6, 34, 0), (2.4, 3, 4), RED)
def sweets(cv):
    cv.ell(V(0, 9, 0), (30, 4, 22), BRASS); cv.ell(V(0, 11, 0), (25, 2, 18), V(250, 220, 130))
    for (x, z, y, col) in ((-13, 5, 18, CREAM), (1, 9, 18, V(255, 170, 190)), (14, 4, 18, V(255, 190, 90)), (-6, -6, 18, V(255, 190, 90)), (8, -7, 18, CREAM), (-5, 3, 30, V(255, 170, 190)), (7, 1, 30, CREAM), (1, 2, 41, V(255, 190, 90))):
        cv.ell(V(x, y, z), 8.4, col); cv.ell(V(x + 1, y + 7.6, z + 2), (2, 1, 2), V(120, 190, 90))
def lantern(cv):
    cv.ell(V(0, 34, 0), (21, 23, 21), RED, glow=.35, shader=lambda q, c: (np.where((np.cos(np.arctan2(q[:, 2], q[:, 0]) * 6) > .86)[:, None], GOLD, c), None))
    for y in (56, 12): cyl(cv, y - 2.4, y + 2.4, 9, 9, GOLD)
    arc(cv, 0, 58, 7, .8, (IRON,), n=8); cv.cone(V(0, 10, 0), V(0, 2, 0), .7, .7, GOLD)
    for k in range(3): cv.cone(V(0, 3, 0), V((k - 1) * 3, -5, 0), 1.2, .4, RED)
def candles(cv):
    cv.ell(V(0, 6, 0), (27, 3.4, 18), BRASS)
    for (x, h, z) in ((-14, 30, -2), (1, 44, 3), (15, 24, -3)):
        cyl(cv, 7, h, 6.4, 6.4, V(252, 244, 226), x=x, z=z); cv.ell(V(x, h, z), (6.4, 1.6, 6.4), V(240, 226, 196)); cv.ell(V(x + 5, h - 6, z + 3.4), (1.6, 4.4, 1.4), V(240, 226, 196)); cv.cone(V(x, h, z), V(x, h + 3, z), .5, .5, BLACK); flame(cv, x, h + 9, z, .95)
def cell_(cv):
    R = rz(-.3)
    cv.ell(V(0, 32, 0), (15, 26, 15), V(70, 200, 120), rot=R, shader=lambda q, c: (np.where((q[:, 1] > .32)[:, None], V(60, 60, 78), c), np.abs(q[:, 1]) < .86)); up = R @ V(0, 1, 0)
    cv.ell(V(0, 32, 0) + up * 22.6, (13, 2, 13), V(60, 60, 78), rot=R); cv.ell(V(0, 32, 0) + up * 26, (5.4, 3.4, 5.4), GOLD, rot=R); cv.ell(V(0, 32, 0) - up * 22.6, (13, 2, 13), V(50, 150, 90), rot=R)
    for (a, b2) in ((V(3, 36, 14.4), V(-4, 28, 14.4)), (V(-4, 28, 14.6), V(3, 29, 14.6)), (V(3, 29, 14.4), V(-5, 19, 14.4))): cv.cone(a + V(-3, -2, 0), b2 + V(-3, -2, 0), 2.2, 1.2, FLAME, glow=.9)
def dish(cv):
    cv = At(cv, (-4, -3, 0), .9)
    cv.box(V(0, 3, 0), V(15, 3, 12), IRON); cv.cone(V(0, 5, 0), V(0, 26, 0), 2.6, 2.2, STEEL); R = rz(-.6)
    cv.ell(V(2, 36, 0), (24, 9, 24), V(236, 240, 248), rot=R, shader=lambda q, c: (np.where((np.abs(np.hypot(q[:, 0], q[:, 2]) - .6) < .05)[:, None], STEEL, c), q[:, 1] < .15))
    n = R @ V(0, 1, 0); cv.cone(V(2, 36, 0), V(2, 36, 0) + n * 20, 1.0, .8, IRON); cv.ell(V(2, 36, 0) + n * 21, 3.2, RED, glow=.8)
    for k in range(3): arc(cv, 2 + n[0] * 24, 36 + n[1] * 24, 5 + k * 5, .9, (CYAN,), n=6, a0=math.pi * .05, a1=math.pi * .6, glow=.9)
def ticket(cv):
    for i, (dx, dy, r_, col) in enumerate(((-4, 26, .28, V(255, 206, 96)), (4, 36, -.12, V(255, 246, 226)))):
        R = rz(r_); cv.box(V(dx, dy, i * 3), V(24, 12.4, .9), col, rot=R, lines=.6); cv.box(V(dx, dy, i * 3 + 1), V(22, 10.4, .3), col * .93, rot=R)
        for k in range(3): cv.box(V(dx, dy, i * 3 + 1.4) + R @ V(-11 + k * 3.6, 0, 0), V(1, 7, .3), (RED, TEAL)[i], rot=R)
        cv.box(V(dx, dy, i * 3 + 1.4) + R @ V(9, 3, 0), V(8, 1.6, .3), IRON, rot=R); cv.box(V(dx, dy, i * 3 + 1.4) + R @ V(7, -3, 0), V(6, 1.2, .3), IRON, rot=R); cv.ell(V(dx, dy, i * 3 + 1.6) + R @ V(19, -7, 0), (2, 2, .5), BLACK)
def herbs(cv):
    for k in range(9):
        a = (k - 4) * .2; tip = V(math.sin(a) * 30, 30 + math.cos(a) * 30, (k % 3 - 1) * 3); cv.cone(V(0, 14, 0), tip, 1.0, .7, LEAF_D)
        for j in range(3): p = V(0, 14, 0) + (tip - V(0, 14, 0)) * (.5 + j * .22); cv.ell(p + V(3.4 * (1 if (j + k) % 2 else -1), 0, 1), (5.4, 2.8, 2.2), LEAF if (j + k) % 2 else V(130, 200, 110), rot=rz(a + .9 * (1 if (j + k) % 2 else -1)))
    cv.cone(V(0, 2, 0), V(0, 16, 0), 4.4, 3.4, LEAF_D); cyl(cv, 12, 17, 5.6, 5.6, RED); cv.cone(V(4, 15, 4), V(11, 9, 5), 1.6, .6, RED); cv.cone(V(-4, 15, 4), V(-10, 10, 5), 1.6, .6, RED)
def colours(cv):
    for (x, z, col, y) in ((-17, -4, PINK, 0), (0, 6, GOLD, 0), (17, -4, TEAL, 0), (-8, -12, VIOLET, 14), (9, -12, ORANGE, 14)):
        if y: cv.box(V(x, 7, z), V(9, 7, 7), WOOD_D)
        cv.ell(V(x, y + 9, z), (12, 8, 12), BRASS, shader=lambda q, c: (c, q[:, 1] < .2)); cv.ell(V(x, y + 11, z), (10.4, 9, 10.4), col, shader=lambda q, c: (c, q[:, 1] > -.05))
def coconut(cv):
    cv.ell(V(0, 28, 0), (22, 24, 21), V(120, 190, 90)); cv.ell(V(0, 47, 0), (13, 5, 12), V(250, 246, 230)); cv.ell(V(0, 48.6, 0), (9, 2.4, 8), V(200, 236, 240))
    cv.cone(V(4, 46, 0), V(13, 66, 0), 1.3, 1.3, RED, color2=CREAM, split=.5); cv.cone(V(-6, 49, 2), V(-8, 60, 2), .7, .7, WOOD_D); cv.ell(V(-13, 62, 2), (7, 5.4, 1), PINK, shader=lambda q, c: (c, q[:, 1] > -.2)); cv.ell(V(-3, 62, 2), (7, 5.4, 1), GOLD, shader=lambda q, c: (c, q[:, 1] > -.2))
def trumpet(cv):
    cv = At(cv, (-5, 6, 0), .82)
    R = rz(.25); P = lambda x, y, z=0: V(0, 32, 0) + R @ V(x, y, z)
    cv.cone(P(-30, 0), P(10, 0), 2.2, 2.2, BRASS); cv.cone(P(10, 0), P(30, 0), 2.4, 15, BRASS); cv.ell(P(30, 0), (2.4, 15, 15), GOLD, rot=R); cv.ell(P(31.4, 0), (1.6, 11, 11), V(170, 110, 40), rot=R)
    cv.ell(P(-31, 0), (2.4, 4, 4), GOLD, rot=R)
    for k in range(3): cv.cone(P(-14 + k * 7, -7), P(-14 + k * 7, 9), 2.6, 2.6, BRASS); cv.ell(P(-14 + k * 7, 11), (3.2, 1.4, 3.2), CREAM, rot=R)
    cv.cone(P(-20, -8), P(6, -8), 1.8, 1.8, BRASS)
def toy(cv):
    fur = V(206, 150, 96); cv.ell(V(0, 20, 0), (16, 17, 13), fur); cv.ell(V(0, 18, 9), (9, 10, 5), V(240, 206, 160)); cv.ell(V(0, 46, 0), (15, 13.4, 12.4), fur)
    for s_ in (1, -1):
        cv.ell(V(11 * s_, 57, 0), (5.4, 5.4, 3.4), fur); cv.ell(V(11 * s_, 57, 2), (3, 3, 2), PINK); cv.ell(V(6 * s_, 49, 11), 1.9, BLACK)
        cv.ell(V(17 * s_, 26, 3), (5.4, 8, 5), fur, rot=rz(.5 * s_)); cv.ell(V(9 * s_, 5, 5), (7, 5, 8.4), fur)
    cv.ell(V(0, 43, 11), (6.4, 5, 4), V(240, 206, 160)); cv.ell(V(0, 45, 14), (2.2, 1.6, 1.4), BLACK); cv.ell(V(0, 33.6, 6), (8, 2.4, 8), RED)
    cv.cone(V(-14, 24, -4), V(-26, 26, -6), 1.5, 1.5, STEEL); cv.ell(V(-28, 31, -6), (1.6, 5, 4.4), GOLD); cv.ell(V(-28, 21, -6), (1.6, 5, 4.4), GOLD)
def key(cv):
    R = rz(-.7); P = lambda x, y, z=0: V(0, 32, 0) + R @ V(x, y, z)
    for k in range(14): a = k * math.pi / 7; b2 = (k + 1) * math.pi / 7; cv.cone(P(-18 + math.cos(a) * 11, math.sin(a) * 11), P(-18 + math.cos(b2) * 11, math.sin(b2) * 11), 3.4, 3.4, GOLD)
    cv.cone(P(-7, 0), P(30, 0), 3.2, 3.2, GOLD); cv.ell(P(-7, 0), (4.4, 4.4, 4.4), BRASS)
    for (x, h) in ((18, 9), (25, 12), (30, 8)): cv.box(P(x, -h / 2 - 2), V(2.4, h / 2, 2.2), GOLD, rot=R)
    cv.ell(P(-18, 0, 2), 2.4, V(232, 78, 70))

ITEMS = [lamps, mango, kite, umbrella, garland, tea, drum, bamboo, fish, sweets, lantern, candles, cell_, dish, ticket, herbs, colours, coconut, trumpet, toy, key]
if __name__ == "__main__":
    out = sys.argv[1]; k = B.OW / 256; half = int(40 * 1.5 * k); cx = int(91 * 1.5 * k); cy = int((104 - 32) * 1.5 * k); t = half * 2; only = sys.argv[2:]
    atlas = Image.new("RGBA", (t * 7, t * 3))
    for i, fn in enumerate(ITEMS):
        if only and fn.__name__.rstrip("_") not in only: continue
        cv = B4.Canvas(); cv.cel = .4; cv.ink = 1.25; fn(cv); im = cv.image().crop((cx - half, cy - half, cx + half, cy + half)); atlas.paste(im, (i % 7 * t, i // 7 * t)); print(fn.__name__, "ok", flush=True)
    atlas.save(f"{out}/items.webp", quality=int(os.environ.get("BAKE_Q", 88)), method=6); print("ITEMS tile", t)
