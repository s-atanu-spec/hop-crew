"""Build-1 cast for Dino Bluster: toy-style kids, dinos, four-legged runners, ghost, block kid, keeper."""
import sys, math
import numpy as np
from PIL import Image
import bake as B
from bake import Canvas, V, rz, ry, rx, down, pose, face, hair_cut, U, OX, OY, W, H, CW, CH
from bake import GREEN, GREEN_D, SKIN, SKIN_D, HAIR, WHITE, CREAM, NAVY, PLUM, KHAKI, BROWN, GOLD, RED, PINK, ORANGE, DARK, BRASS, STEEL, CYAN

def _box(s, c, half, color, rot=None, shader=None, glow=0.0, lines=0.0):
    """Axis-aligned box in its own frame, drawn with flat faces and darkened edges."""
    c = np.asarray(c, float); half = np.asarray(half, float) * np.ones(3)
    M = s.R @ (rot if rot is not None else np.eye(3)); cw = s.R @ c
    ext = np.abs(M) @ half
    x0 = int(max(0, math.floor((cw[0] - ext[0] + OX) * U))); x1 = int(min(W, math.ceil((cw[0] + ext[0] + OX) * U) + 1))
    y0 = int(max(0, math.floor((OY - cw[1] - ext[1]) * U))); y1 = int(min(H, math.ceil((OY - cw[1] + ext[1]) * U) + 1))
    if x1 <= x0 or y1 <= y0: return
    X = (np.arange(x0, x1) + .5) / U - OX - cw[0]; Y = OY - (np.arange(y0, y1) + .5) / U - cw[1]
    X, Y = np.meshgrid(X, Y)
    far = np.full(X.shape, 1e9); near = np.full(X.shape, -1e9); axis = np.zeros(X.shape, int)
    for j in range(3):
        o = M[0, j] * X + M[1, j] * Y; d = M[2, j]
        if abs(d) < 1e-6:
            inside = np.abs(o) <= half[j]; far = np.where(inside, far, -1e9); continue
        t1 = (-half[j] - o) / d; t2 = (half[j] - o) / d
        hi = np.maximum(t1, t2); lo = np.minimum(t1, t2)
        axis = np.where(hi < far, j, axis); far = np.minimum(far, hi); near = np.maximum(near, lo)
    ok = far >= near
    zw = far + cw[2]; sub = s.depth[y0:y1, x0:x1]; ok &= zw > sub
    if not ok.any(): return
    ax = axis[ok]; z = far[ok]
    p = np.stack([M[0, j] * X[ok] + M[1, j] * Y[ok] + M[2, j] * z for j in range(3)], 1)
    q = p / half
    col = np.broadcast_to(np.asarray(color, float), q.shape).copy()
    if shader is not None:
        col, _ = shader(q, col, ax)
    sign = np.sign(M[2, ax]); nl = np.zeros_like(q); nl[np.arange(len(ax)), ax] = sign
    n = nl @ M.T
    lit = np.maximum(0, -.46 * n[:, 0] + .68 * n[:, 1] + .57 * n[:, 2])
    tone = (.52 + .58 * lit) * (1 - glow) + glow * 1.04
    other = np.abs(q).copy(); other[np.arange(len(ax)), ax] = 0
    edge = np.clip((other.max(1) - (1 - 1.1 / np.maximum(half.min(), 1.5))) * 6, 0, 1)
    tone = tone * (1 - .22 * edge)
    if lines:
        g = np.abs(((p / lines) % 1) - .5); g[np.arange(len(ax)), ax] = 0
        tone = tone * (1 - .10 * (g.max(1) > .46))
    s.rgb[y0:y1, x0:x1][ok] = np.clip(col * tone[:, None], 0, 255)
    sub[ok] = zw[ok]; s.alpha[y0:y1, x0:x1][ok] = True
Canvas.box = _box

def chain(cv, pts, radii, color, **kw):
    for i in range(len(pts) - 1):
        cv.cone(pts[i], pts[i + 1], radii[i], radii[i + 1], color, **kw)

# ------------------------------------------------------------------ kids, toy proportions
def kid(cv, gender, outfit, frame, layout="runner"):
    p = pose(frame, layout); girl = gender == "girl"
    L = p["lean"] * .8; u = V(math.sin(L), math.cos(L), 0)
    top = GREEN; long_sleeve = False; legcol = SKIN; shorts = NAVY; shoe = WHITE; sole = RED; sock = WHITE
    if outfit == "street": long_sleeve = not girl; shorts = PLUM if girl else NAVY; legcol = PLUM if girl else SKIN; sole = PINK if girl else RED
    elif outfit == "festival": long_sleeve = not girl; shorts = CREAM; legcol = CREAM; shoe = GOLD if girl else BROWN; sole = V(120, 76, 50); sock = CREAM
    elif outfit == "explorer": shorts = KHAKI; shoe = BROWN; sole = DARK; sock = CREAM
    elif outfit == "sport": shorts = DARK; shoe = ORANGE; sole = WHITE
    hipY = 19.0 - (10 if p["hipdrop"] else 0); hip = V(0, hipY, 0)
    legs = []
    for i, sgn in enumerate((1, -1)):
        th, kn = p["legs"][i]; th *= .9; kn *= .8
        hj = hip + V(0, -2, 5.6 * sgn); knee = hj + 7.6 * down(th); ank = knee + 8.0 * down(th - kn)
        fa = (th - kn + .25) if p["mode"] in ("run", "jump") else (.5 if (p["mode"] == "slide" and i == 0) else 0)
        legs.append((hj, knee, ank, fa))
    lowest = min(a[1] - 6.4 for (_, _, a, _) in legs)
    dy = -lowest + (p["hop"] if p["mode"] == "run" else p["lift"])
    if p["mode"] == "slide": dy = -min(lowest, hipY - 10.5)
    off = V(0, dy, 0); hip = hip + off; trot = rz(-L)
    chest = hip + u * 10.5; neck = hip + u * 21.0
    hd = neck + V(1.2 + 3 * math.sin(max(L, 0)), 14.4, 0)
    if p["mode"] == "slide": hd = neck + V(4.5, 13.0, 0)
    R = V(18.4, 17.2, 17.4)
    hrot = ry(.62) @ rz(-p["head"])
    def HL(x, y, z): return hd + hrot @ V(x, y, z)
    sw = p["sway"]
    skirt = girl and outfit in ("street", "festival", "sport")
    for (hj, knee, ank, fa) in legs:
        hj = hj + off; knee = knee + off; ank = ank + off
        thigh = shorts if (outfit in ("explorer", "sport") or (outfit == "street" and not girl)) else (GREEN if (outfit == "festival" or (girl and outfit == "street")) else legcol)
        cv.cone(hj, knee, 5.2, 4.7, thigh, legcol, split=.66)
        cv.cone(knee, ank, 4.6, 4.3, legcol, sock if (legcol is SKIN) else None, split=.6)
        fr = rz(fa * .9); fc = ank + fr @ V(2.6, -1.8, 0)
        cv.ell(fc + fr @ V(0, -3.3, 0), (8.5, 2.0, 5.8), sole, rot=fr)
        cv.ell(fc, (8.1, 5.1, 5.6), shoe, rot=fr)
        cv.ell(fc + fr @ V(4.4, .5, 0), (3.9, 3.4, 4.8), WHITE if shoe is not WHITE else sole, rot=fr)
    cv.ell(hip + u * 1.0, (9.6, 6.4, 10.4), shorts, rot=trot)
    if girl and outfit == "festival":
        cv.frustum(hip + u * 6, hip + V(-1.5 * sw - 2.5 * math.sin(L), -11.0, 0), 9.6, 16.5, GREEN, GOLD, split=.82, flat=.92)
    elif girl and outfit == "street":
        cv.frustum(hip + u * 5, hip + V(-1.0 * sw - 1.2, -7.0, 0), 9.8, 14.6, GREEN, WHITE, split=.84, flat=.92)
    elif girl and outfit == "sport":
        cv.frustum(hip + u * 3, hip + V(-.6 * sw - .6, -5.6, 0), 9.8, 13.0, DARK, WHITE, split=.82, flat=.92)
    elif (not girl) and outfit == "festival":
        cv.frustum(hip + u * 5, hip + V(-.8 * sw - 1.0, -8.0, 0), 10.2, 12.0, GREEN, GOLD, split=.84, flat=.95)
    def torso_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]; zz = z - .12
        if outfit == "street" and not girl:
            col[(x > .2) & (y > -.66) & (y < -.2) & (np.abs(zz) < .6)] = GREEN_D
            col[(x > 0) & (y > .2) & (y < .7) & (np.abs(np.abs(zz) - .16) < .04)] = WHITE
        if outfit == "street" and girl:
            hx = zz / .30; hy = (y - .05) / .30
            col[(x > 0) & ((hx * hx + hy * hy - .5) ** 3 - hx * hx * hy ** 3 < 0)] = WHITE
        if outfit == "festival":
            col[(x > 0) & (np.abs(zz) < .075) & (y > -.3)] = GOLD
            col[(y > .66)] = GOLD
            for k in range(3): col[(x > 0) & (((zz) / .09) ** 2 + ((y - .35 + .3 * k) / .09) ** 2 < 1)] = WHITE
        if outfit == "explorer":
            col[(np.abs(np.abs(z) - .58) < .09) & (y > -.35)] = BROWN
            col[(x > .1) & (np.abs(y + .52) < .08)] = BROWN
            col[(x > .2) & (np.abs(zz) < .12) & (np.abs(y + .52) < .13)] = GOLD
        if outfit == "sport":
            col[np.abs(z) > .82] = WHITE
            d = (zz / .36) ** 2 + ((y - .06) / .36) ** 2
            col[(x > 0) & (d < 1)] = WHITE; col[(x > 0) & (d < .5)] = GOLD
        return col, None
    if outfit == "explorer":
        cv.ell(chest + trot @ V(-11.0, 1.0, 0), (6.4, 9.0, 8.4), BROWN, rot=trot)
        cv.ell(chest + trot @ V(-15.5, -2.0, 0), (3.0, 4.6, 5.8), V(120, 76, 50), rot=trot)
    if outfit == "street" and not girl:
        cv.ell(neck + trot @ V(-6.5, -1.5, 0), (7.6, 6.6, 10.0), GREEN_D, rot=trot)
    cv.ell(chest, (10.4, 11.8, 11.2), top, rot=trot @ ry(.25), shader=torso_sh)
    cv.cone(neck - u * 2.5, neck + u * 2.5, 4.6, 4.4, SKIN_D)
    if outfit == "explorer":
        cv.ell(neck + trot @ V(2.0, -1.0, 0), (7.6, 3.0, 9.0), RED, rot=trot)
        cv.ell(neck + trot @ V(7.5, -4.0, 1), (2.6, 3.8, 3.0), RED, rot=trot)
    if girl and outfit == "festival":
        s0 = neck + trot @ V(-5, -1.5, 5.5); prev = s0
        for k in range(1, 7):
            nxt = s0 + V(-5.0 * k, 2.4 * math.sin(k * .9 + sw * 1.4) - .4 * k + 2.5 * sw, -1.2 * k)
            cv.cone(prev, nxt, 3.8 - .3 * k, 3.6 - .3 * k, PINK, flat=.55); prev = nxt
        cv.ell(neck + trot @ V(1.5, -1.0, 0), (7.8, 3.0, 9.2), PINK, rot=trot)
    for i, sgn in enumerate((1, -1)):
        th, el = p["arms"][i]
        sh = hip + u * 18.6 + V(0, 0, 11.8 * sgn); spl = p["splay"] * sgn
        elb = sh + 7.6 * down(th, spl * .6); hand = elb + 7.2 * down(th + el, spl * .2)
        cv.ell(sh, 4.7, top)
        if long_sleeve: cv.cone(sh, elb, 4.2, 3.9, top); cv.cone(elb, hand, 3.9, 3.7, top, GREEN_D, split=.8)
        else: cv.cone(sh, elb, 4.2, 3.6, top, SKIN, split=.55); cv.cone(elb, hand, 3.6, 3.4, SKIN, WHITE if outfit == "sport" else (GOLD if (girl and outfit == "festival") else None), split=.72)
        cv.ell(hand + 1.8 * down(th + el), 4.9, SKIN)
    # head
    for sgn in (1, -1): cv.ell(HL(-1.0, -1.5, R[2] * .97 * sgn), (2.8, 4.0, 2.4), SKIN_D, rot=hrot)
    cv.ell(hd, R, SKIN, rot=hrot, shader=face(gender, p["mouth"], p["blink"], az0=.40, big=1.34))
    cv.ell(HL(R[0] * .99, -3.0, 0), 1.9, SKIN_D)
    band = WHITE if outfit == "sport" else None
    cv.ell(hd + hrot @ V(-1.0, 1.2, 0), R * V(1.07, 1.07, 1.06), HAIR, rot=hrot, shader=hair_cut(girl, band))
    if girl:
        for zz, yy, rr in ((-11.0, 10.6, 6.6), (-3.8, 11.8, 7.2), (3.8, 11.8, 7.2), (11.0, 10.6, 6.6)):
            cv.ell(HL(R[0] * .70, yy, zz), (5.6, rr * .86, rr), HAIR, rot=hrot)
        if outfit == "sport":
            a = HL(-R[0] * .72, R[1] * .62, 0); mid = a + V(-8, 6, 0)
            cv.ell(a, 3.8, PINK); cv.cone(a, mid, 5.2, 6.2, HAIR); cv.cone(mid, mid + V(-7 - 4 * sw, -13 + 3 * sw, 0), 6.2, 2.6, HAIR)
        elif outfit == "explorer":
            for sgn in (1, -1):
                a = HL(-R[0] * .45, -R[1] * .55, R[2] * .86 * sgn)
                b = a + V(-3.0 - 2.0 * sw, -9.5, 2.0 * sgn); cv.cone(a, b, 5.0, 3.6, HAIR); cv.ell(a + (b - a) * .25, 3.9, RED)
        else:
            for sgn in (1, -1):
                a = HL(-R[0] * .22, R[1] * .30, R[2] * 1.0 * sgn)
                b = a + V(-8.0 - 4.5 * sw, -13.0 + 2.4 * abs(sw) + (9 if p["mode"] == "jump" else 0), 3.5 * sgn)
                cv.ell(a + V(-1, 0, 2.0 * sgn), 7.2, HAIR); cv.cone(a, b, 6.4, 4.0, HAIR); cv.ell(b, 4.4, HAIR)
                cv.ell(a + (b - a) * .30, 4.3, PINK if outfit == "street" else GOLD)
        if outfit == "festival":
            f = HL(R[0] * .30, R[1] * .84, R[2] * .70)
            for k in range(5):
                ang = k * 1.2566; cv.ell(f + hrot @ V(0, 2.5 * math.cos(ang), 2.5 * math.sin(ang)), 2.2, PINK)
            cv.ell(f + hrot @ V(1.0, 0, 0), 1.7, GOLD)
    else:
        for zz, yy, rr, xx in ((-10.0, 11.4, 6.4, .70), (-2.6, 13.0, 7.2, .73), (5.6, 12.4, 6.8, .71), (12.0, 9.6, 5.2, .58)):
            cv.ell(HL(R[0] * xx, yy, zz), (5.6, rr * .8, rr), HAIR, rot=hrot @ rx(.25))
        if outfit != "explorer":
            for k, (bx, by, bz) in enumerate(((.10, 1.0, -3.5), (.40, .98, 2.5), (-.20, 1.02, 3.5))):
                a = HL(R[0] * bx, R[1] * (by - .1), bz); cv.cone(a, a + hrot @ V(5.0 + 1.6 * k, 7.0 - k + .8 * sw, 0), 4.8, 1.4, HAIR)
    if outfit == "explorer":
        hat = V(232, 206, 150); tc = HL(-.5, R[1] * .62, 0)
        cv.ell(tc, (R[0] * 1.42, 2.5, R[2] * 1.38), hat, rot=hrot @ rz(-.06))
        def band_sh(q, col):
            col = col.copy(); col[(q[:, 1] < -.05) & (q[:, 1] > -.5)] = V(150, 78, 56); return col, q[:, 1] > -.55
        cv.ell(tc + hrot @ V(0, 2.8, 0), R * V(.86, .64, .84), hat, rot=hrot, shader=band_sh)

# ------------------------------------------------------------------ dinos
def dino(cv, style, outfit, frame, layout="runner"):
    p = pose(frame, layout); red = style == "red"; baby = style == "hatch"
    skin = V(214, 70, 52) if red else (V(248, 192, 62) if baby else GREEN)
    dark = V(132, 44, 58) if red else (V(214, 140, 44) if baby else GREEN_D)
    cream = V(255, 190, 130) if red else (V(255, 242, 196) if baby else V(246, 220, 140))
    k = 1.0 if red else (.80 if baby else 1.0); hk = 1.0 if red else (1.30 if baby else 1.08)
    mode = p["mode"]; sw = p["sway"]; ph = p["ph"]
    hipY = (31.0 if not p["hipdrop"] else 15.0) * k; hip = V(-3 * k, hipY, 0)
    legs = []
    for i, sgn in enumerate((1, -1)):
        th, kn = p["legs"][i]; th = th * .8 - .15; kn *= .85
        if mode == "slide": th, kn = (1.25, .2) if i == 0 else (.9, .9)
        hj = hip + V(0, -1 * k, 8.4 * k * sgn); knee = hj + 12.5 * k * down(th + .35); ank = knee + 12.0 * k * down(th - kn - .25)
        fa = (th - kn + .1) if mode in ("run", "jump") else (.5 if mode == "slide" else 0)
        legs.append((hj, knee, ank, fa))
    lowest = min(a[1] - 4.4 * k for (_, _, a, _) in legs)
    dy = -lowest + (p["hop"] if mode == "run" else p["lift"])
    if mode == "slide": dy = -min(lowest, hipY - 13 * k)
    off = V(0, dy, 0); hip = hip + off
    tilt = .22 + (.10 if mode == "run" else 0) + (-.30 if mode == "slide" else 0) + (.25 if mode == "cheer" else 0) + (.20 if mode == "jump" else 0)
    brot = rz(tilt)
    def BL(x, y, z=0): return hip + brot @ (V(x, y, z) * k)
    # tail
    pts = [BL(-12, 6), BL(-24, 7 + 1.5 * sw), BL(-36, 9 + 4 * sw + (8 if mode == "jump" else 0)), BL(-47, 12 + 7 * sw + (14 if mode == "jump" else 0)), BL(-55, 15 + 9 * sw + (18 if mode == "jump" else 0))]
    chain(cv, pts, [11 * k, 8.6 * k, 6.0 * k, 3.6 * k, 1.6 * k], skin)
    for (hj, knee, ank, fa) in legs:
        hj = hj + off; knee = knee + off; ank = ank + off
        cv.cone(hj, knee, 7.6 * k, 5.6 * k, skin); cv.cone(knee, ank, 5.0 * k, 3.8 * k, skin)
        fr = rz(fa * .9); fc = ank + fr @ (V(3.6, -1.2, 0) * k)
        cv.ell(fc, V(8.6, 3.6, 5.4) * k, skin, rot=fr)
        for t in (-1, 0, 1): cv.ell(fc + fr @ (V(7.8, -.8, 3.0 * t) * k), V(2.6, 1.9, 1.7) * k, cream, rot=fr)
    def body_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        belly = np.clip((-y - .12) * 3.2, 0, 1) * np.clip((x + .75) * 2, 0, 1)
        col += (cream - col) * belly[:, None]
        if not baby:
            band = np.clip((np.cos(x * 9.0 + y * 2.0) - .45) * 3, 0, 1) * np.clip((y - .15) * 3, 0, 1) * .6
            col += (dark - col) * band[:, None]
        return col, None
    cv.ell(BL(6, 8), V(20, 15.5, 14.5) * k, skin, rot=brot, shader=body_sh)
    # spine plates
    for i, (x, y, h) in enumerate([(-30, 14, 3.4), (-20, 17, 4.6), (-9, 21.5, 5.6), (2, 24.5, 6.2), (12, 25, 5.4)]):
        if red: cv.cone(BL(x, y), BL(x - 3, y + h * 1.9), 3.6 * k, .6 * k, dark)
        else: cv.ell(BL(x, y + 1), V(4.4, h, 3.0) * k, dark, rot=brot @ rz(.35))
    # arms
    for i, sgn in enumerate((1, -1)):
        th = p["arms"][i][0] * .35 + .9
        if mode in ("cheer", "jump"): th = 2.0 + .3 * i
        sh = BL(19, 6, 10.5 * sgn); elb = sh + 6.0 * k * down(th, .2 * sgn); hand = elb + 5.0 * k * down(th + .9)
        cv.cone(sh, elb, 3.4 * k, 2.8 * k, skin); cv.cone(elb, hand, 2.8 * k, 2.4 * k, skin)
        for t in (-1, 1): cv.ell(hand + V(1.5, -.5, 1.4 * t) * k, 1.5 * k, cream)
    # neck + head
    nb = BL(20, 14); hd = BL(31, 31) + V(0, -6 if mode == "slide" else 0, 0) * k
    if mode == "slide": hd = BL(38, 20)
    cv.cone(nb, hd + V(-4, -6, 0) * k, 11.5 * k, 10 * k, skin)
    hrot = ry(.34) @ rz(.04 - p["head"] + (.18 if mode == "cheer" else 0))
    def HL(x, y, z=0): return hd + hrot @ (V(x, y, z) * k * hk)
    jaw = {"open": .34, "smile": .08}[p["mouth"]]
    if mode == "cheer": jaw = .62 if p["b"] == 0 else .16
    if mode == "jump": jaw = .42
    if outfit == "scarf":
        cv.ell(nb + brot @ (V(4, 9, 0) * k), V(12.5, 4.6, 12.0) * k, RED, rot=brot @ rz(.5))
        s0 = nb + brot @ (V(-4, 13, 6) * k); prev = s0
        for j in range(1, 6):
            nxt = s0 + V(-5.4 * j, 2.6 * math.sin(j * 1.0 + sw * 1.5) + 2.2 * sw, -1.0 * j) * k
            cv.cone(prev, nxt, (3.8 - .3 * j) * k, (3.6 - .3 * j) * k, WHITE if j == 5 else RED, flat=.55); prev = nxt
    jr = hrot @ rz(-jaw)
    jc = HL(4, -7.5)
    cv.ell(jc + jr @ (V(8.5, -2.4, 0) * k * hk), V(11.0, 3.6, 8.2) * k * hk, skin, rot=jr)
    cv.ell(jc + jr @ (V(8.5, -3.6, 0) * k * hk), V(9.0, 2.6, 6.8) * k * hk, cream, rot=jr)
    cv.ell(jc + jr @ (V(8, -.4, 0) * k * hk), V(9.6, 2.4, 7.2) * k * hk, V(150, 52, 62), rot=jr)
    cv.ell(jc + jr @ (V(8.5, .6, 0) * k * hk), V(6.8, 1.6, 5.0) * k * hk, V(244, 128, 136), rot=jr)
    def head_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        for side in (1, -1):
            az = .62 * side; e = V(math.cos(az) * .78, .30, math.sin(az) * .78); e = e / np.linalg.norm(e)
            th_ = V(-math.sin(az), 0, math.cos(az)); du = q @ th_; dv = y - e[1]; front = (q @ e) > .5
            if p["blink"]:
                col[front & (np.abs(dv + .02 - .6 * du * du) < .04) & (np.abs(du) < .26)] = dark * .5
            else:
                col[front & ((du / .31) ** 2 + ((dv - .01) / .37) ** 2 < 1)] = dark * .55
                wh = front & ((du / .27) ** 2 + (dv / .33) ** 2 < 1)
                col[wh] = V(255, 226, 120) if red else V(255, 252, 240)
                iu = du - .05
                if red: col[wh & ((iu / .07) ** 2 + (dv / .26) ** 2 < 1)] = V(40, 20, 26)
                else:
                    col[wh & ((iu / .17) ** 2 + (dv / .23) ** 2 < 1)] = V(96, 60, 36)
                    col[wh & ((iu / .11) ** 2 + ((dv + .01) / .16) ** 2 < 1)] = V(30, 22, 28)
                    col[wh & (((iu + .06) / .06) ** 2 + ((dv - .10) / .07) ** 2 < 1)] = V(255, 255, 255)
                if red: col[front & (dv > .16 - .9 * du * side) & ((du / .34) ** 2 + (dv / .42) ** 2 < 1)] = dark
            if not red:
                eb = V(math.cos(az * 1.5) * .9, -.18, math.sin(az * 1.5) * .9); gg = np.exp(-(((q - eb) ** 2).sum(1)) / .03)
                col += (V(255, 130, 120) - col) * (gg * .35)[:, None]
        return col, None
    cv.ell(hd, V(14.5, 13.2, 13.0) * k * hk, skin, rot=hrot, shader=head_sh)
    def snout_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        col[(x > .55) & (y > .25) & (np.abs(np.abs(z) - .34) < .11) & (np.abs(y - .52) < .12)] = dark * .5
        return col, None
    cv.ell(HL(13.5, -2.6), V(12.0, 7.4, 9.4) * k * hk, skin, rot=hrot, shader=snout_sh)
    teeth = range(0, 6) if red else (1, 4)
    for t in teeth:
        for sgn in (1, -1):
            a = HL(8 + t * 2.9, -8.2, 6.6 * sgn * (1 - t * .07)); cv.cone(a, a + V(0, -(3.6 if red else 2.2), 0) * k * hk, 1.5 * k * hk, .4 * k * hk, WHITE)
    for sgn in (1, -1):
        cv.ell(HL(3, 11.5, 7.4 * sgn), V(6.6, 3.2, 4.4) * k * hk, dark if red else skin, rot=hrot @ rz(-.35 if red else .1))
    if red:
        for x, y, h in ((-6, 12, 9), (2, 13.5, 8), (9, 11, 5)): cv.cone(HL(x, y), HL(x - 3, y + h), 3.6 * k, .6 * k, cream)
    if outfit == "cap":
        cc = HL(-1, 9.5)
        def cap_sh(q, col): return col, q[:, 1] > -.25
        cv.ell(cc, V(13.6, 9.6, 12.6) * k * hk, V(64, 84, 190), rot=hrot, shader=cap_sh)
        cv.ell(cc + hrot @ (V(13, -1.5, 0) * k * hk), V(8.5, 1.5, 9.5) * k * hk, V(250, 120, 60), rot=hrot @ rz(-.12))
        cv.ell(cc + hrot @ (V(0, 9.4, 0) * k * hk), 2.0 * k, WHITE)
    if outfit == "shades":
        for sgn in (1, -1):
            e = hrot @ V(math.cos(.62 * sgn) * .78, .30, math.sin(.62 * sgn) * .78)
            cv.ell(hd + e * 13.6 * k * hk, V(2.2, 4.8, 4.8) * k * hk, V(30, 30, 46), rot=hrot @ ry(-.62 * sgn))
        cv.cone(HL(10.6, 4.6, -6), HL(10.6, 4.6, 6), 1.2 * k, 1.2 * k, V(30, 30, 46))
    if baby:
        def shell_sh(q, col):
            ang = np.arctan2(q[:, 2], q[:, 0]); return col, q[:, 1] > (.12 + .22 * np.sign(np.sin(ang * 5)) * np.abs(np.sin(ang * 5)) ** .6)
        cv.ell(HL(-2, 4), V(15.6, 14.6, 14.2) * k * hk, V(252, 248, 236), rot=hrot @ rz(.12), shader=shell_sh)

# ------------------------------------------------------------------ four-legged runners
def quad(cv, kind, frame, layout="runner"):
    p = pose(frame, layout); mode = p["mode"]; ph = p["ph"]; sw = p["sway"]; b = p["b"]
    if kind == "calf":
        body = V(22, 17, 16.5); legL = 9.0; legR = 6.2; bodyY = 31; skin = V(150, 170, 204); dark = V(112, 130, 170); fx, hx = 12, -12
    elif kind == "horse":
        body = V(20, 14.0, 13); legL = 12.0; legR = 4.9; bodyY = 37; skin = V(206, 104, 62); dark = V(150, 68, 46); fx, hx = 11, -11
    else:
        body = V(17, 9.5, 8.8); legL = 9.0; legR = 3.0; bodyY = 24; skin = V(74, 68, 104); dark = V(52, 48, 78); fx, hx = 10, -11
    gallop = kind != "calf"
    pitch = 0.0
    if mode == "run": pitch = (.10 * math.sin(ph) if gallop else .03 * math.sin(ph * 2))
    if mode == "cheer": pitch = .42 + .08 * b
    if mode == "jump": pitch = .22
    if mode == "act": pitch = [.05, .25, -.2, -.05][b]
    drop = 0
    if mode == "slide": drop = legL * 1.55
    c0 = V(0, bodyY - drop, 0); brot = rz(pitch)
    def BL(x, y, z=0): return c0 + brot @ V(x, y, z)
    legs = []
    for i, (lx, sgn, phs) in enumerate(((fx, 1, 0.0), (hx, -1, .35 if gallop else 0.0), (fx, -1, math.pi * (.18 if gallop else 1)), (hx, 1, math.pi * (.18 if gallop else 1) + (.35 if gallop else 0)))):
        front = lx > 0
        if mode == "run":
            f = ph + phs + (math.pi if (gallop and not front) else 0)
            th = (.05 + .8 * math.sin(f)); kn = .25 + 1.0 * max(0, math.cos(f + .5)) ** 1.4
        elif mode == "jump" or (mode == "act" and b >= 2): th, kn = (1.0, 1.3) if front else (-.9, .3)
        elif mode == "cheer": th, kn = (.9 + .3 * (sgn > 0) + .3 * b, 1.2) if front else (-.25, .15)
        elif mode == "slide": th, kn = (1.35, .1) if front else (-1.35, .1)
        elif mode == "act": th, kn = (.2, .5) if front else (-.5, .9)
        else: th, kn = (.06 * sgn, .08)
        hj = BL(lx, -body[1] * .45, body[2] * .62 * sgn)
        if not front: kn = -kn * .7; th = th * .9
        knee = hj + legL * down(th); ank = knee + legL * down(th - kn)
        legs.append((hj, knee, ank, front, sgn))
    lowest = min(a[1] - legR * 1.2 for (_, _, a, _, _) in legs)
    dy = -lowest + (p["hop"] * (1.6 if gallop else .8) if mode == "run" else p["lift"])
    if mode == "slide": dy = -min(lowest, c0[1] - body[1] - 1)
    if mode == "cheer": dy = -min(a[1] - legR * 1.2 for (_, _, a, fr, _) in legs if not fr)
    off = V(0, dy, 0); c0 = c0 + off
    for (hj, knee, ank, front, sgn) in legs:
        hj = hj + off; knee = knee + off; ank = ank + off
        if kind == "calf":
            cv.cone(hj, knee, legR * 1.15, legR, skin); cv.cone(knee, ank, legR, legR * 1.08, skin)
            cv.ell(ank + V(.6, -1.4, 0), (legR * 1.25, legR * .8, legR * 1.2), dark)
            for t in (-1, 0, 1): cv.ell(ank + V(legR * 1.0, -2.2, legR * .55 * t), 1.7, CREAM)
        elif kind == "horse":
            cv.cone(hj, knee, legR * 1.3, legR, skin, CREAM, split=.8); cv.cone(knee, ank, legR, legR * .9, skin, DARK, split=.55)
            cv.ell(ank + V(.8, -1.2, 0), (legR * 1.5, legR * 1.0, legR * 1.3), DARK)
        else:
            cv.cone(hj, knee, legR * 1.35, legR, skin); cv.cone(knee, ank, legR, legR * .95, skin, WHITE, split=.5)
            cv.ell(ank + V(1.4, -.8, 0), (legR * 1.6, legR * .95, legR * 1.3), WHITE)
    if kind == "calf":
        def body_sh(q, col):
            col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
            col += (V(190, 204, 228) - col) * np.clip((-y - .3) * 2.5, 0, 1)[:, None]
            cloth = (y > -.05) & (np.abs(x + .05) < .52)
            col[cloth] = GREEN
            col[cloth & ((np.abs(np.abs(x + .05) - .46) < .06) | (y < .04))] = GOLD
            dx = (x + .05) / .2; dz = (y - .45) / .2
            col[cloth & (np.abs(dx) + np.abs(dz) < 1) & (z > 0)] = GOLD
            col[cloth & (np.abs(dx) + np.abs(dz) < .5) & (z > 0)] = RED
            return col, None
        cv.ell(c0, body, skin, rot=brot, shader=body_sh)
        tb = BL(-body[0] * .96, 3); cv.cone(tb, tb + V(-5 - 2 * sw, -9, 0), 1.6, 1.2, dark); cv.ell(tb + V(-5.4 - 2 * sw, -10.5, 0), 2.4, DARK)
        hd = BL(body[0] * .92, 9) + V(0, 4 if mode in ("cheer", "jump") else 0, 0)
        hrot = ry(.45) @ rz(pitch * .4 - p["head"])
        def HL(x, y, z=0): return hd + hrot @ V(x, y, z)
        flap = math.sin(ph * 2) * .35 if mode == "run" else (.5 if mode in ("jump", "cheer") else .1 * b)
        for sgn in (1, -1):
            er = hrot @ ry((-.55 - flap) * sgn) @ rz(.1)
            ec = HL(-6, 3, 13.5 * sgn) + er @ V(-3, 0, 6 * sgn)
            cv.ell(ec, (3.0, 13.5, 11.0), skin, rot=er); cv.ell(ec + er @ V(1.6, -.5, .5 * sgn), (2.0, 11.0, 8.6), V(240, 170, 180), rot=er)
        def head_sh(q, col):
            col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
            for side in (1, -1):
                az = .50 * side; e = V(math.cos(az) * .96, .08, math.sin(az) * .96); th_ = V(-math.sin(az), 0, math.cos(az)); du = q @ th_; dv = y - e[1]; front = (q @ e) > .5
                if p["blink"]: col[front & (np.abs(dv - .5 * du * du) < .04) & (np.abs(du) < .2)] = DARK
                else:
                    col[front & ((du / .21) ** 2 + (dv / .27) ** 2 < 1)] = V(34, 28, 44)
                    col[front & (((du + .05) / .07) ** 2 + ((dv - .10) / .09) ** 2 < 1)] = WHITE
                    col[front & (((du - .07) / .035) ** 2 + ((dv + .11) / .04) ** 2 < 1)] = WHITE
                eb = V(math.cos(az * 1.7) * .9, -.30, math.sin(az * 1.7) * .9); gg = np.exp(-(((q - eb) ** 2).sum(1)) / .03)
                col += (V(255, 150, 170) - col) * (gg * .55)[:, None]
            col[(y > .62) & (x > -.2)] = GOLD
            return col, None
        cv.ell(hd, (15.5, 15.0, 14.5), skin, rot=hrot, shader=head_sh)
        up = mode in ("cheer", "jump") or (mode == "run" and False)
        t0 = HL(13.5, -4)
        if up: tp = [t0, HL(21, -2), HL(27, 5), HL(28, 13), HL(24, 18 + 2 * b)]
        elif mode == "slide": tp = [t0, HL(20, -5), HL(27, -4), HL(33, -1), HL(36, 4)]
        else: tp = [t0, HL(19, -9), HL(21 + 2 * sw, -16), HL(22 + 4 * sw, -22), HL(26 + 5 * sw, -25)]
        chain(cv, tp, [6.4, 5.4, 4.4, 3.6, 3.0], skin); cv.ell(tp[-1], 3.2, V(240, 170, 180))
        if p["mouth"] == "open" or up: cv.ell(HL(11, -10.5), (4.2, 2.6, 4.6), V(170, 60, 80), rot=hrot)
        for sgn in (1, -1): cv.cone(HL(12, -8, 6.2 * sgn), HL(16.5, -10.5, 7.4 * sgn), 1.7, .8, WHITE)
    elif kind == "horse":
        def body_sh(q, col):
            col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
            sad = (np.abs(x) < .42) & (y > -.35)
            col[sad] = GREEN; col[sad & ((np.abs(np.abs(x) - .37) < .06) | (y < -.26))] = GOLD
            col[sad & (((x) / .16) ** 2 + ((y - .3) / .2) ** 2 < 1) & (z > 0)] = CREAM
            col[(np.abs(x - .72) < .05) | (np.abs(x + .72) < .05)] = CREAM
            return col, None
        cv.ell(c0, body, skin, rot=brot, shader=body_sh)
        tb = BL(-body[0] * .95, 4); cv.cone(tb, tb + V(-6 - 2 * sw, 9, 0), 3.0, 1.6, DARK)
        nk = -.32 - (.75 if mode == 'slide' else 0); nb = BL(body[0] * .72, 5); nt = nb + (brot @ rz(nk)) @ V(0, 30, 0)
        cv.cone(nb, nt, 7.6, 5.4, skin)
        for t in (.3, .5, .7): cv.ell(nb + (nt - nb) * t, (6.6 - 1.6 * t + .9, 1.3, 6.6 - 1.6 * t + .9), CREAM if t != .5 else DARK, rot=brot @ rz(nk))
        hrot = ry(.42) @ rz(pitch - .35 - p["head"] + (.35 if mode == 'slide' else 0))
        hd = nt + hrot @ V(5, 2, 0)
        def HL(x, y, z=0): return hd + hrot @ V(x, y, z)
        def head_sh(q, col):
            col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
            col[(np.abs(x - .25) < .06)] = CREAM; col[x > .78] = DARK
            for side in (1, -1):
                d = ((x + .25) / .2) ** 2 + ((y - .15) / .34) ** 2
                e = (z * side > .3) & (d < 1); col[e] = WHITE; col[(z * side > .3) & (((x + .22) / .09) ** 2 + ((y - .15) / .17) ** 2 < 1)] = V(30, 22, 28)
            return col, None
        cv.ell(hd, (11.5, 6.4, 6.2), skin, rot=hrot, shader=head_sh)
        for sgn in (1, -1):
            a = HL(-6.5, 5, 3.6 * sgn); cv.cone(a, a + hrot @ V(-2.5, 13, 1.2 * sgn), 3.0, .8, skin, CREAM, split=.7)
        for j in range(4): cv.ell(nb + (nt - nb) * (.25 + .2 * j) + V(-6.5 - .8 * j - 1.5 * max(sw, 0), 0, 0), (3.4, 4.6, 2.4), DARK)
        cv.ell(nb + (nt - nb) * .12 + V(2, 0, 0), (9.0, 2.6, 9.0), GOLD, rot=brot @ rz(nk))
    else:  # cat
        def body_sh(q, col):
            col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
            col += (V(236, 228, 240) - col) * (np.clip((-y - .25) * 3, 0, 1) * np.clip((x + .2) * 2, 0, 1))[:, None]
            band = np.clip((np.cos(x * 10) - .5) * 3, 0, 1) * np.clip((y - .1) * 3, 0, 1) * .7
            col += (dark - col) * band[:, None]
            return col, None
        cv.ell(c0, body, skin, rot=brot, shader=body_sh)
        tb = BL(-body[0] * .9, 3)
        chain(cv, [tb, tb + V(-9, 4 + 2 * sw, 0), tb + V(-15, 13 + 4 * sw, 0), tb + V(-13 + 3 * sw, 23 + 3 * sw, 0), tb + V(-8 + 5 * sw, 29, 0)], [3.2, 2.9, 2.7, 2.5, 2.3], skin)
        hrot = ry(.5) @ rz(pitch * .5 - p["head"])
        hd = BL(body[0] * .98, 8.5)
        def HL(x, y, z=0): return hd + hrot @ V(x, y, z)
        cv.cone(BL(body[0] * .6, 3), hd, 7.5, 7.5, skin)
        cv.ell(BL(body[0] * .78, 1.5), (6.2, 4.6, 8.4), ORANGE, rot=brot @ rz(-.5)); cv.ell(BL(body[0] * .86, -4.5), 2.6, GOLD)
        def head_sh(q, col):
            col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
            col += (V(236, 228, 240) - col) * (np.clip((x - .45) * 3, 0, 1) * np.clip((-y + .1) * 3, 0, 1))[:, None]
            for side in (1, -1):
                az = .50 * side; e = V(math.cos(az) * .97, .10, math.sin(az) * .97); th_ = V(-math.sin(az), 0, math.cos(az)); du = q @ th_; dv = y - e[1]; front = (q @ e) > .5
                eye = front & ((du / .24) ** 2 + ((dv - .25 * du * side) / .22) ** 2 < 1)
                col[eye] = V(255, 214, 90); col[eye & (np.abs(du - .02) < .05)] = V(24, 20, 30)
                col[front & (dv - .25 * du * side > .13) & ((du / .26) ** 2 + ((dv - .25 * du * side) / .24) ** 2 < 1)] = dark
            col[(x > .9) & (np.abs(z) < .16) & (y < -.02) & (y > -.2)] = V(255, 150, 170)
            return col, None
        cv.ell(hd, (11.5, 10.5, 11.0), skin, rot=hrot, shader=head_sh)
        for sgn in (1, -1):
            a = HL(-2, 7.5, 6.6 * sgn); cv.cone(a, a + hrot @ V(-1.5, 9.5, 2.2 * sgn), 4.6, .7, skin)
            cv.cone(a + hrot @ V(1.4, 1, 0), a + hrot @ V(.6, 7.5, 1.8 * sgn), 2.6, .5, V(255, 150, 170))

# ------------------------------------------------------------------ friendly ghost
def ghost(cv, frame, layout="runner"):
    p = pose(frame, layout); mode = p["mode"]; ph = p["ph"]; sw = p["sway"]; b = p["b"]
    body = V(244, 250, 255); shade = V(196, 214, 244)
    y0 = 40 + (3.0 * math.sin(ph) if mode == "run" else 1.5 * b) + (12 if mode == "jump" else 0) + (4 * b if mode == "cheer" else 0)
    lean = {"run": .22, "jump": -.05, "slide": 1.05, "cheer": 0, "idle": .04}.get(mode, 0)
    stretch = {"jump": 1.18, "slide": .9}.get(mode, 1.0)
    if mode == "slide": y0 = 17
    c = V(0, y0, 0); rot = rz(-lean)
    def GL(x, y, z=0): return c + rot @ V(x, y, z)
    # tail
    n = 6; prev = GL(0, -10 * stretch)
    for j in range(1, n + 1):
        t = j / n
        nxt = GL(-4 * t, (-10 - 30 * t) * stretch) + V(-9 * t * t * (1.5 if mode == "run" else .6) + 3 * math.sin(ph + j * .9) * t, 0, 0)
        if mode == "slide": nxt = GL(-3 * t, (-10 - 26 * t)) + V(0, 2 * math.sin(j * 1.3) * t, 0)
        cv.cone(prev, nxt, 15.5 * (1 - t * .86) + .5, 15.5 * (1 - (t + 1 / n) * .86) + .5, body, glow=.22); prev = nxt
    def face_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        col += (shade - col) * np.clip((-y - .2) * 1.3, 0, .8)[:, None]
        for side in (1, -1):
            az = .36 * side; e = V(math.cos(az) * .98, .12, math.sin(az) * .98); th_ = V(-math.sin(az), 0, math.cos(az)); du = q @ th_; dv = y - e[1]; front = (q @ e) > .5
            if p["blink"]: col[front & (np.abs(dv - .7 * du * du) < .035) & (np.abs(du) < .16)] = V(40, 44, 80)
            else:
                col[front & ((du / .15) ** 2 + (dv / .23) ** 2 < 1)] = V(40, 44, 80)
                col[front & (((du + .045) / .05) ** 2 + ((dv - .09) / .07) ** 2 < 1)] = WHITE
            eb = V(math.cos(az * 2.1) * .92, -.16, math.sin(az * 2.1) * .92); gg = np.exp(-(((q - eb) ** 2).sum(1)) / .02)
            col += (V(255, 150, 180) - col) * (gg * .7)[:, None]
        m = x > .3
        if p["mouth"] == "open": col[m & ((z / .12) ** 2 + ((y + .22) / .12) ** 2 < 1)] = V(70, 60, 110)
        else: col[m & (np.abs(y + .2 - 1.6 * z * z) < .03) & (np.abs(z) < .14)] = V(70, 60, 110)
        return col, None
    cv.ell(GL(0, 2), (17.5, 20.5 * stretch, 16.5), body, rot=rot @ ry(.62), shader=face_sh, glow=.22)
    for i, sgn in enumerate((1, -1)):
        th = {"run": -.9 + .5 * math.sin(ph + i * 3.1), "jump": 2.6, "cheer": 2.5 + .3 * b * sgn, "slide": 1.4, "idle": .5}.get(mode, .4)
        a = GL(-1, -9, 15.5 * sgn); h2 = a + 10 * down(th, .5 * sgn)
        cv.cone(a, h2, 4.6, 3.6, body, glow=.22); cv.ell(h2, 4.2, body, glow=.22)
    # scarf (takes the runner colour)
    sc = GL(1, -12 * stretch); cv.ell(sc, (15.5, 3.4, 15.0), GREEN, rot=rot)
    prev = GL(-9, -12 * stretch, 9)
    for j in range(1, 5):
        nxt = prev + V(-5.5, 2.2 * math.sin(j + sw * 1.5) + sw, -1); cv.cone(prev, nxt, 3.4 - .3 * j, 3.1 - .3 * j, GREEN, flat=.55); prev = nxt
    for j in range(3):
        a = ph * 1.0 + j * 2.1 + frame * .7
        cv.ell(GL(-20 - 6 * j, -4 + 12 * math.sin(a), 6 * math.cos(a)), 1.6 - .3 * j, V(255, 244, 190), glow=.9)

# ------------------------------------------------------------------ block kid
def pixel(cv, powered, frame, layout="runner"):
    p = pose(frame, layout); mode = p["mode"]; ph = p["ph"]; b = p["b"]
    s = 1.28
    hood = V(255, 206, 84) if powered else GREEN; hood2 = V(255, 236, 150) if powered else GREEN_D
    pants = V(255, 244, 220) if powered else NAVY; shoe = WHITE; skin = V(236, 176, 128); hair = V(60, 42, 60)
    band = WHITE if powered else ORANGE; glow = .28 if powered else 0
    hipY = 15.5 * s - (8 * s if mode == "slide" else 0)
    leg = [p["legs"][0][0] * .95, p["legs"][1][0] * .95]
    if mode == "jump": leg = [1.0, -.7]
    if mode == "slide": leg = [1.45, 1.2]
    if mode == "cheer": leg = [.25, -.25]
    low = min(hipY - 15.5 * s * math.cos(a) for a in leg)
    dy = -low + (p["hop"] * 1.5 if mode == "run" else p["lift"]) if mode != "slide" else 2.6 * s - (hipY - 8 * s) + 6
    if mode == "slide": dy = -(hipY - 5.2 * s)
    hip = V(0, hipY + dy, 0)
    L = {"run": .12, "slide": -.85, "jump": .05}.get(mode, 0.0); trot = rz(-L)
    for i, sgn in enumerate((1, -1)):
        r = rz(leg[i]); c = hip + V(0, 0, 3.7 * s * sgn) + r @ V(0, -7.2 * s, 0)
        cv.box(c, V(3.5, 7.4, 3.5) * s, pants, rot=r, lines=3.5 * s, glow=glow)
        cv.box(hip + V(0, 0, 3.7 * s * sgn) + r @ V(1.4 * s, -13.6 * s, 0), V(5.2, 2.2, 3.7) * s, shoe, rot=r, lines=0)
    bc = hip + trot @ V(0, 8.6 * s, 0)
    def body_sh(q, col, ax):
        col = col.copy(); col[np.abs(q[:, 1] + .15) < .16] = hood2
        front = (ax == 0) & (q[:, 0] > 0); col[front & (np.abs(q[:, 2]) < .34) & (np.abs(q[:, 1] - .45) < .25)] = WHITE if not powered else V(255, 150, 60)
        return col, None
    cv.box(bc, V(5.6, 8.8, 7.6) * s, hood, rot=trot, shader=body_sh, lines=3.5 * s, glow=glow)
    arms = [p["arms"][0][0], p["arms"][1][0]]
    if mode == "jump": arms = [-1.3, 2.5]
    if mode == "cheer": arms = [-2.4 - .2 * b, 2.4 + .2 * b]
    if mode == "slide": arms = [-1.0, .7]
    for i, sgn in enumerate((1, -1)):
        r = rz(arms[i]); sh = hip + trot @ V(0, 15.2 * s, 10.3 * s * sgn)
        cv.box(sh + r @ V(0, -5.8 * s, 0), V(2.8, 6.4, 2.8) * s, hood, rot=r, lines=3.5 * s, glow=glow)
        cv.box(sh + r @ V(0, -13.0 * s, 0), V(2.8, 1.9, 2.8) * s, skin, rot=r)
    hd = hip + trot @ V(1.2 * s, 27.4 * s, 0) + (V(4, -1, 0) if mode == "slide" else V(0, 0, 0))
    hrot = ry(.55) @ rz(-p["head"] - (.5 if mode == "slide" else 0))
    def head_sh(q, col, ax):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        f = (ax == 0) & (x > 0)
        for side in (1, -1):
            if p["blink"]: col[f & (np.abs(z - .42 * side) < .2) & (np.abs(y - .02) < .06)] = hair
            else:
                col[f & (np.abs(z - .42 * side) < .2) & (np.abs(y - .08) < .26)] = CYAN if powered else V(36, 30, 48)
                col[f & (np.abs(z - .42 * side + .09) < .08) & (np.abs(y - .22) < .1)] = WHITE
            col[f & (np.abs(z - .74 * side) < .12) & (np.abs(y + .34) < .1)] = V(255, 140, 150)
        if p["mouth"] == "open": col[f & (np.abs(z) < .22) & (np.abs(y + .52) < .14)] = V(150, 52, 62)
        else:
            col[f & (np.abs(z) < .3) & (np.abs(y + .56) < .06)] = V(120, 56, 60)
            col[f & (np.abs(np.abs(z) - .3) < .07) & (np.abs(y + .47) < .07)] = V(120, 56, 60)
        return col, None
    cv.box(hd, V(9.6, 9.6, 9.6) * s, skin, rot=hrot, shader=head_sh, lines=4.8 * s)
    cv.box(hd + hrot @ (V(-1.2, 6.9, 0) * s), V(9.9, 3.2, 10.2) * s, hair, rot=hrot, lines=4.8 * s)
    cv.box(hd + hrot @ (V(-7.6, 0, 0) * s), V(2.8, 9.9, 10.2) * s, hair, rot=hrot, lines=4.8 * s)
    cv.box(hd + hrot @ (V(6.6, 6.2, 5.4) * s), V(3.6, 2.6, 4.8) * s, hair, rot=hrot)
    cv.box(hd + hrot @ (V(.2, 3.3, 0) * s), V(10.1, 1.5, 10.4) * s, band, rot=hrot, glow=.5 if powered else 0)
    t0 = hd + hrot @ (V(-10.2, 3.3, 4) * s)
    for j in range(1, 4): cv.box(t0 + V(-3.4 * j * s, (-1.4 * j + 1.6 * p["sway"] * (j % 2)) * s, 0), V(1.7, 1.5, .8) * s, band, glow=.5 if powered else 0)
    if powered:
        for j in range(6):
            a = ph + j * 1.047 + frame * .9; rr = 30 + 6 * math.sin(a * 2)
            cv.box(hip + V(rr * math.cos(a) * .9, 20 * s + rr * math.sin(a) * .8, 10 * math.sin(a * 1.3)), V(1.9, 1.9, 1.9), V(255, 250, 200), rot=rz(a), glow=.9)

# ------------------------------------------------------------------ clock-tower keeper
def keeper(cv, frame, layout="walker"):
    p = pose(frame, layout); mode = p["mode"]; sw = p["sway"]; b = p["b"]
    coat = V(58, 70, 130); coat2 = V(40, 48, 96); skin = V(214, 156, 120); beard = V(238, 236, 232)
    L = p["lean"] * .6; u = V(math.sin(L), math.cos(L), 0)
    hip = V(0, 30, 0); legs = []
    for i, sgn in enumerate((1, -1)):
        th, kn = p["legs"][i]; th *= .7; kn *= .75
        hj = hip + V(0, -1, 5.0 * sgn); knee = hj + 13 * down(th); ank = knee + 13 * down(th - kn)
        legs.append((hj, knee, ank, th - kn + .2 if mode == "run" else 0))
    dy = -min(a[1] - 4.6 for (_, _, a, _) in legs) + p["hop"] * .6
    off = V(0, dy, 0); hip = hip + off; trot = rz(-L)
    for (hj, knee, ank, fa) in legs:
        cv.cone(hj + off, knee + off, 4.8, 4.2, DARK); cv.cone(knee + off, ank + off, 4.2, 3.6, DARK)
        fr = rz(fa * .8); fc = ank + off + fr @ V(2.6, -1.4, 0); cv.ell(fc, (7.4, 4.0, 4.6), V(96, 62, 44), rot=fr)
    chest = hip + u * 13; neck = hip + u * 27
    cv.frustum(hip + u * 8, hip + V(-1.5 * sw - 1, -13, 0), 10.4, 13.6, coat, GOLD, split=.9, flat=.9)
    def coat_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]; zz = z - .12
        col[(x > 0) & (np.abs(zz) < .05)] = coat2
        for k in range(3): col[(x > 0) & (((zz - .16) / .08) ** 2 + ((y - .4 + .4 * k) / .07) ** 2 < 1)] = GOLD
        return col, None
    cv.ell(chest, (10.6, 15, 11.2), coat, rot=trot @ ry(.25), shader=coat_sh)
    cv.ell(neck + trot @ V(1, -1.5, 0), (8.4, 3.4, 9.6), RED, rot=trot)
    hd = neck + V(1.5 + 3 * math.sin(max(L, 0)), 12.5, 0); hrot = ry(.6) @ rz(-p["head"]); R = V(13.2, 12.8, 12.6)
    def HL(x, y, z=0): return hd + hrot @ V(x, y, z)
    for i, sgn in enumerate((1, -1)):
        th, el = p["arms"][i]; th *= .8
        if mode == "run" and i == 0: th, el = 1.1 + .1 * math.sin(p["ph"]), .5
        sh = hip + u * 24.5 + V(0, 0, 11.6 * sgn); elb = sh + 11 * down(th, .1 * sgn); hand = elb + 10 * down(th + el)
        cv.ell(sh, 5.0, coat); cv.cone(sh, elb, 4.4, 4.0, coat); cv.cone(elb, hand, 4.0, 3.8, coat, GOLD, split=.82); cv.ell(hand + 1.5 * down(th + el), 4.4, skin)
        if i == 0 and not (mode == "act" and b >= 2):
            top_ = hand + V(1.5, 1, 0); bot = top_ + V(2 * sw, -11, 0)
            cv.cone(top_, bot + V(0, 4, 0), .8, .8, DARK); cv.ell(bot, (5.0, 6.2, 5.0), V(255, 206, 96), glow=.85); cv.ell(bot + V(0, 5.6, 0), (3.6, 1.6, 3.6), DARK); cv.ell(bot + V(0, -5.6, 0), (3.6, 1.4, 3.6), DARK)
    cv.ell(hd, R, skin, rot=hrot, shader=face("boy", p["mouth"], p["blink"], az0=.42, big=1.0, brow_col=beard))
    cv.ell(HL(R[0] * .98, -1.5), 2.6, V(196, 126, 100))
    def beard_sh(q, col): return col, (q[:, 1] < -.05) & (q[:, 0] > -.55)
    cv.ell(hd + hrot @ V(1.5, -4.5, 0), R * V(1.06, 1.12, 1.05), beard, rot=hrot, shader=lambda q, col: (col, (q[:, 1] < -.12 - .35 * np.clip(q[:, 0], 0, 1) * (np.abs(q[:, 2]) < .34)) & (q[:, 0] > -.6)))
    for sgn in (1, -1): cv.cone(HL(R[0] * .95, -5.5, 1.5 * sgn), HL(R[0] * .8, -7, 9 * sgn), 2.6, 1.4, beard)
    def cap_sh(q, col):
        col = col.copy(); col[np.abs(q[:, 1] - .05) < .1] = GOLD; return col, q[:, 1] > -.06
    cv.ell(hd + hrot @ V(-.5, 3.5, 0), R * V(1.09, .98, 1.09), coat2, rot=hrot, shader=cap_sh)
    cv.ell(HL(R[0] * .95, 4.0), (7.5, 1.5, 9.0), DARK, rot=hrot @ rz(-.15))
    cv.ell(HL(R[0] * .6, 9.5), 2.6, GOLD)

JOBS = {
    "boy": lambda cv, o, f: kid(cv, "boy", o, f), "girl": lambda cv, o, f: kid(cv, "girl", o, f),
    "dino": lambda cv, o, f: dino(cv, "green", o, f), "hatch": lambda cv, o, f: dino(cv, "hatch", o, f),
    "red": lambda cv, o, f: dino(cv, "red", o, f, "chaser"),
    "calf": lambda cv, o, f: quad(cv, "calf", f), "horse": lambda cv, o, f: quad(cv, "horse", f),
    "cat": lambda cv, o, f: quad(cv, "cat", f, "walker"),
    "ghost": lambda cv, o, f: ghost(cv, f), "pixel": lambda cv, o, f: pixel(cv, o == "up", f),
    "tower": lambda cv, o, f: keeper(cv, f),
}
def sheet(kind, outfit, frames=range(16)):
    atlas = Image.new("RGBA", (CW * 4, CH * 4))
    for f in frames:
        cv = Canvas(); JOBS[kind](cv, outfit, f); atlas.paste(cv.image(), (f % 4 * CW, f // 4 * CH))
    return atlas
if __name__ == "__main__":
    out = sys.argv[1]
    for j in sys.argv[2:]:
        kind, outfit = (j.split("/") + ["plain"])[:2]
        sheet(kind, outfit).save(f"{out}/{kind}_{outfit}.webp", quality=92, method=6); print(j, "ok", flush=True)
