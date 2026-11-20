"""Bake glossy shaded-depth character sheets (4x4 cells of 256x168) for Dino Bluster.
Frame layout: 0-9 run, 10-11 idle, 12 jump, 13-14 cheer, 15 slide."""
import sys, math
import numpy as np
from PIL import Image
from scipy import ndimage

import os
CW, CH = 256, 168
SS = int(os.environ.get('BAKE_SS', 3)); OUT = float(os.environ.get('BAKE_OUT', 1)); DS = int(round(SS / OUT)); OW, OH = CW * SS // DS, CH * SS // DS
U = 1.5 * SS
W, H = CW * SS, CH * SS
OX, OY = 91.0, 104.0
YAW = 0.42

def ry(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, -s], [0, 1, 0], [s, 0, c]], float)
def rz(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], float)
def rx(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]], float)
def V(*a): return np.array(a, float)
def down(theta, splay=0.0):
    """Limb direction: 0 hangs down, positive swings forward (+x)."""
    return V(math.sin(theta), -math.cos(theta), splay)

class Canvas:
    def __init__(s, yaw=YAW):
        s.rgb = np.zeros((H, W, 3), np.float32)
        s.depth = np.full((H, W), -1e6, np.float32)
        s.alpha = np.zeros((H, W), bool)
        s.R = ry(yaw); s.cel = 0.0; s.ink = 0.0
    def ell(s, c, r, color, rot=None, shader=None, glow=0.0, gloss=1.0):
        c = np.asarray(c, float); r = np.asarray(r, float) * np.ones(3)
        M = s.R @ (rot if rot is not None else np.eye(3))
        cw = s.R @ c
        ext = np.sqrt(((M * r) ** 2).sum(1))
        x0 = int(max(0, math.floor((cw[0] - ext[0] + OX) * U))); x1 = int(min(W, math.ceil((cw[0] + ext[0] + OX) * U) + 1))
        y0 = int(max(0, math.floor((OY - cw[1] - ext[1]) * U))); y1 = int(min(H, math.ceil((OY - cw[1] + ext[1]) * U) + 1))
        if x1 <= x0 or y1 <= y0: return
        X = (np.arange(x0, x1) + .5) / U - OX - cw[0]
        Y = OY - (np.arange(y0, y1) + .5) / U - cw[1]
        X, Y = np.meshgrid(X, Y)
        A = [(M[0, j] * X + M[1, j] * Y) / r[j] for j in range(3)]
        B = [M[2, j] / r[j] for j in range(3)]
        a = sum(b * b for b in B); b_ = 2 * sum(A[j] * B[j] for j in range(3)); c_ = sum(A[j] ** 2 for j in range(3)) - 1
        disc = b_ * b_ - 4 * a * c_
        ok = disc >= 0
        if not ok.any(): return
        z = (-b_ + np.sqrt(np.maximum(disc, 0))) / (2 * a)
        zw = z + cw[2]
        sub_d = s.depth[y0:y1, x0:x1]
        ok &= zw > sub_d
        if not ok.any(): return
        q = np.stack([A[j][ok] + z[ok] * B[j] for j in range(3)], 1)
        col = np.broadcast_to(np.asarray(color, float), q.shape).copy()
        if shader is not None:
            col, keep = shader(q, col)
            if keep is not None:
                idx = np.argwhere(ok); drop = idx[~keep]
                ok[drop[:, 0], drop[:, 1]] = False
                q = q[keep]; col = col[keep]
                if not len(q): return
        n = (q / r) @ M.T
        n /= np.linalg.norm(n, axis=1, keepdims=True)
        nx, ny, nz = n[:, 0], n[:, 1], n[:, 2]
        lit = np.maximum(0, -.46 * nx + .68 * ny + .57 * nz)
        shine = np.maximum(0, -.34 * nx + .43 * ny + .83 * nz) ** 17
        edge = (1 - np.clip(nz, 0, 1)) ** 3
        if s.cel: lit = lit * (1 - s.cel) + s.cel * (np.clip(np.round(lit * 2.4) / 2.4, 0, 1)); shine = shine * (1 - s.cel) + s.cel * (shine > .35) * .8
        tone = .49 + .56 * lit + .10 * edge
        tone = tone * (1 - glow) + glow * 1.04
        out = col * tone[:, None] + gloss * shine[:, None] * V(35, 29, 20) * (1.6) + edge[:, None] * V(17, 12, 17) * (1 - glow)
        s.rgb[y0:y1, x0:x1][ok] = np.clip(out, 0, 255)
        sub_d[ok] = zw[ok]
        s.alpha[y0:y1, x0:x1][ok] = True
    def cone(s, a, b, ra, rb, color, color2=None, split=1.0, flat=1.0, glow=0.0, gloss=1.0):
        a = np.asarray(a, float); b = np.asarray(b, float)
        L = np.linalg.norm(b - a); n = max(2, int(math.ceil(L / (min(ra, rb) * .32))) + 1)
        for i in range(n):
            t = i / (n - 1); rr = ra + (rb - ra) * t
            s.ell(a + (b - a) * t, (rr, rr, rr * flat), color2 if (color2 is not None and t > split) else color, glow=glow, gloss=gloss)
    def frustum(s, a, b, ra, rb, color, color2=None, split=1.0, flat=1.0):
        a = np.asarray(a, float); b = np.asarray(b, float); ax = b - a
        L = np.linalg.norm(ax); ax = ax / L
        ang = math.atan2(-ax[0], -ax[1])           # tilt of the axis away from straight down
        rot = rz(-ang)
        n = max(3, int(L / .55))
        for i in range(n + 1):
            t = i / n; rr = ra + (rb - ra) * t
            s.ell(a + (b - a) * t, (rr, 1.5, rr * flat), color2 if (color2 is not None and t > split) else color, rot=rot)
    def image(s):
        d = np.where(s.alpha, s.depth, -1e6)
        near = ndimage.maximum_filter(d, size=7 * SS)
        ao = np.clip((near - d - 2.0) / 14.0, 0, 1) * s.alpha
        ao = ndimage.gaussian_filter(ao, 1.6 * SS) * .30
        rgb = s.rgb * (1 - ao[..., None])
        # soft dark contact rim so characters read against bright scenery
        a = s.alpha.astype(np.float32)
        inner = ndimage.gaussian_filter(a, 1.1 * SS)
        rim = np.clip((1 - inner) * 2.2, 0, 1) * a * .20
        rgb = rgb * (1 - rim[..., None])
        if s.ink:
            w = max(1, int(round(s.ink * SS)))
            inner = ndimage.binary_erosion(s.alpha, iterations=w)
            jump = (ndimage.maximum_filter(d, size=2 * w + 1) - d) > 3.2
            line = (s.alpha & ~inner) | (jump & s.alpha)
            line = ndimage.gaussian_filter(line.astype(np.float32), .45 * SS)
            k = np.clip(line * 1.7, 0, 1)[..., None]
            rgb = rgb * (1 - k) + (rgb * .22 + V(18, 12, 26)) * k
        pre = np.dstack([rgb * a[..., None], a * 255])
        pre = pre.reshape(OH, DS, OW, DS, 4).mean((1, 3))
        al = pre[..., 3:4]
        out = np.where(al > 0, pre[..., :3] / np.maximum(al / 255, 1e-6), 0)
        return Image.fromarray(np.dstack([np.clip(out, 0, 255), al]).astype(np.uint8), "RGBA")

# ---------- palette ----------
GREEN = V(112, 190, 64)        # recoloured at runtime by the game's tint pass
GREEN_D = V(74, 150, 50)
SKIN = V(226, 160, 116); SKIN_D = V(196, 126, 92)
HAIR = V(56, 40, 46)
WHITE = V(250, 246, 238); CREAM = V(246, 226, 190)
NAVY = V(52, 62, 118); PLUM = V(92, 70, 140); KHAKI = V(206, 176, 118); BROWN = V(150, 96, 62)
GOLD = V(250, 196, 70); RED = V(232, 78, 70); PINK = V(250, 120, 150); ORANGE = V(255, 146, 58)
DARK = V(48, 46, 62); BRASS = V(226, 170, 76); STEEL = V(92, 98, 122)
CYAN = V(110, 236, 255)

def pose_mode(mode, ph=0.0, b=0):
    p = dict(lift=0, lean=.20, legs=[(0, .1), (0, .1)], arms=[(0, .3), (0, .3)], splay=.10, head=0.0,
             mouth="smile", blink=False, sway=0.0, hop=0.0, mode=mode, hipdrop=0.0, look=0.0, ph=ph, b=b)
    if mode == "run":
        def leg(f):
            return (.12 + .86 * math.sin(f), .30 + 1.25 * max(0, math.cos(f + .55)) ** 1.4)
        p["legs"] = [leg(ph), leg(ph + math.pi)]
        p["arms"] = [(-.95 * math.sin(ph) - .05, 1.30 + .25 * math.sin(ph)), (.95 * math.sin(ph) - .05, 1.30 - .25 * math.sin(ph))]
        p["hop"] = 1.6 * abs(math.sin(ph)); p["sway"] = math.sin(ph * 2 - .9); p["head"] = .03 * math.sin(ph * 2)
        p["mouth"] = "open" if math.sin(ph * 2) > .55 else "smile"
    elif mode == "idle":
        p.update(lean=.03, legs=[(.10, .08), (-.10, .08)], arms=[(.06, .12), (-.10, .12)], splay=.30, lift=.7 * b, blink=bool(b), sway=.15 * b)
    elif mode == "jump":
        p.update(lean=.10, legs=[(1.15, 1.55), (-.30, 1.35)], arms=[(-1.25, .50), (2.45, .30)], splay=.25, mouth="open", sway=-1.2, head=-.10, lift=10)
    elif mode == "cheer":
        p.update(lean=0, legs=[(.22 + .1 * b, .12 + .5 * b), (-.22, .12 + .5 * b)], arms=[(-2.25 - .2 * b, -.30), (2.25 + .2 * b, .30)], splay=.15, mouth="open", lift=1 + 5 * b, sway=.6 - 1.2 * b, head=-.12)
    elif mode == "slide":
        p.update(lean=-.95, legs=[(1.42, .12), (1.05, 1.25)], arms=[(-1.0, .3), (.55, .9)], splay=.25, mouth="open", sway=-.9, head=.55, hipdrop=1)
    elif mode == "act":      # four-step throw for roadside performers: b = 0..3
        up = [(-.9, .9), (-2.4, .5), (1.9, .25), (.9, .4)][b]
        p.update(lean=[-.05, -.12, .22, .12][b], legs=[(.35, .15), (-.35, .2)], arms=[up, (.3, .5)], splay=.2, mouth="open" if b >= 2 else "smile", sway=[-.3, -.8, 1.0, .4][b])
    return p

LAYOUTS = {
    "runner": lambda f: ("run", 2 * math.pi * f / 10, 0) if f < 10 else (("idle", 0, f - 10) if f < 12 else (("jump", 0, 0) if f == 12 else (("cheer", 0, f - 13) if f < 15 else ("slide", 0, 0)))),
    "walker": lambda f: ("run", 2 * math.pi * f / 12, 0) if f < 12 else ("act", 0, f - 12),
    "chaser": lambda f: ("run", 2 * math.pi * f / 12, 0) if f < 12 else (("jump", 0, 0) if f == 12 else (("cheer", 0, f - 13) if f < 15 else ("idle", 0, 0))),
}
def pose(frame, layout="runner"):
    return pose_mode(*LAYOUTS[layout](frame))

def face(gender, mouth, blink, robot=False, az0=.50, big=1.18, brow_col=HAIR):
    def sh(q, col):
        col = col.copy()
        x, y, z = q[:, 0], q[:, 1], q[:, 2]
        for side in (1, -1):
            az = az0 * side
            e = V(math.cos(az), -.02, math.sin(az)); th = V(-math.sin(az), 0, math.cos(az))
            front = (q @ e) > .55
            du = (q @ th); dv = y - e[1]
            b = blink
            if b:
                lid = front & (np.abs(dv + .02 - .5 * du * du) < .035) & (np.abs(du) < .2)
                col[lid] = V(70, 44, 44)
            else:
                du = du / big; dv = dv / big
                lash = front & ((du / .228) ** 2 + ((dv - .02) / .30) ** 2 < 1) & (dv > -.06)
                col[lash] = V(46, 32, 38)
                white = front & ((du / .20) ** 2 + (dv / .27) ** 2 < 1)
                col[white] = V(255, 252, 244)
                iu = du - .035; iv = dv - .0
                col[white & ((iu / .145) ** 2 + (iv / .205) ** 2 < 1)] = V(104, 62, 40)
                col[white & ((iu / .095) ** 2 + ((iv + .01) / .14) ** 2 < 1)] = V(34, 24, 30)
                col[white & (((iu + .05) / .052) ** 2 + ((iv - .085) / .06) ** 2 < 1)] = V(255, 255, 255)
                col[white & (((iu - .055) / .026) ** 2 + ((iv + .095) / .03) ** 2 < 1)] = V(250, 240, 230)
                if gender == "girl":
                    flick = front & (np.abs(dv - .19 - .9 * (du * side - .17)) < .03) & (du * side > .17) & (du * side < .30)
                    col[flick] = V(46, 32, 38)
            dq = (q @ th); dw = y - e[1]
            brow = front & (np.abs(dw - .45 - .22 * dq * side) < .03) & (np.abs(dq) < .19)
            col[brow] = brow_col
            # blush
            azb = .86 * side; eb = V(math.cos(azb) * .97, -.25, math.sin(azb) * .97)
            g = np.exp(-(((q - eb) ** 2).sum(1)) / .028)
            col += (V(255, 120, 120) - col) * (g * .42)[:, None]
        m = x > .3
        if mouth == "open":
            mo = m & ((z / .155) ** 2 + ((y + .44) / .115) ** 2 < 1)
            col[mo] = V(150, 52, 62)
            col[mo & (y > -.385)] = V(255, 250, 244)
            col[mo & (y < -.47) & (np.abs(z) < .10)] = V(244, 128, 136)
        else:
            sm = m & (np.abs(y + .46 - 1.15 * z * z) < .027) & (np.abs(z) < .19)
            col[sm] = V(128, 58, 58)
        return col, None
    return sh

def hair_cut(longer, band=None):
    def sh(q, col):
        x, y, z = q[:, 0], q[:, 1], q[:, 2]
        faceo = (x > .16) & (y < .36 + .30 * z * z + .10 * x)
        low = y < (-.86 if longer else -.42) + .5 * np.maximum(0, x + .1)
        keep = ~(faceo | low)
        if band is not None:
            col = col.copy(); col[np.abs(y - .45 + .1 * x) < .085] = band
        return col, keep
    return sh

def kid(cv, gender, outfit, frame):
    p = pose(frame)
    L = p["lean"]; u = V(math.sin(L), math.cos(L), 0)
    girl = gender == "girl"
    # ---- outfit colours ----
    top = GREEN; sleeve_long = False; legcol = SKIN; shorts = NAVY; shoe = WHITE; sole = RED; sock = WHITE
    if outfit == "street":
        sleeve_long = not girl; shorts = PLUM if girl else NAVY; legcol = PLUM if girl else SKIN; shoe = WHITE; sole = PINK if girl else RED
    elif outfit == "festival":
        sleeve_long = not girl; shorts = CREAM; legcol = CREAM; shoe = GOLD if girl else BROWN; sole = BROWN; sock = CREAM
    elif outfit == "explorer":
        shorts = KHAKI; shoe = BROWN; sole = DARK; sock = CREAM
    elif outfit == "sport":
        shorts = DARK; shoe = ORANGE; sole = WHITE; sock = WHITE
    hipY = 27.0 - (17 if p["hipdrop"] else 0)
    hip = V(0, hipY, 0)
    # legs first to ground the figure
    legs = []
    for i, sgn in enumerate((1, -1)):
        th, kn = p["legs"][i]
        hj = hip + V(0, -1, 4.7 * sgn)
        knee = hj + 11.5 * down(th); ank = knee + 12.5 * down(th - kn)
        fa = th - kn + (.25 if p["mode"] in ("run", "jump") else 0)
        if p["mode"] in ("idle", "cheer"): fa = 0
        if p["mode"] == "slide": fa = .5 if i == 0 else 0
        legs.append((hj, knee, ank, fa, sgn))
    lowest = min(a[1] - 4.6 for (_, _, a, _, _) in legs)
    dy = -lowest + (p["hop"] if p["mode"] == "run" else p["lift"])
    if p["mode"] == "slide": dy = -min(lowest, hipY - 8.5)
    off = V(0, dy, 0)
    hip = hip + off
    chest = hip + u * 10.5; neck = hip + u * 21.5
    hd = neck + V(1.6 + 3.5 * math.sin(max(L, 0)), 14.2, 0)
    if p["mode"] == "slide": hd = neck + V(4.5, 13.5, 0)
    R = 16.4
    hrot = ry(.62 + p["look"]) @ rz(-p["head"])
    def HL(x, y, z): return hd + hrot @ V(x, y, z)
    sw = p["sway"]
    # ---- legs ----
    for (hj, knee, ank, fa, sgn) in legs:
        hj = hj + off; knee = knee + off; ank = ank + off
        if outfit in ("explorer", "sport") or (outfit == "street" and not girl):
            cv.cone(hj, knee, 5.5, 4.7, shorts, legcol, split=.62)
        elif outfit == "festival" or (girl and outfit == "street"):
            cv.cone(hj, knee, 5.6, 4.7, GREEN, legcol, split=.72 if (girl and outfit == "festival") else .5)
        else:
            cv.cone(hj, knee, 5.3, 4.6, legcol)
        cv.cone(knee, ank, 4.5, 3.7, legcol, sock if outfit != "festival" and legcol is SKIN else None, split=.66)
        fr = rz(-(math.pi / 2 - (math.pi / 2 - fa)))
        fr = rz(fa * .9)
        fc = ank + fr @ V(2.8, -1.4, 0)
        cv.ell(fc + fr @ V(0, -2.2, 0), (7.6, 2.0, 4.8), sole, rot=fr)
        cv.ell(fc, (7.2, 4.0, 4.5), shoe, rot=fr)
        if outfit == "festival":
            cv.ell(fc + fr @ V(6.2, 1.2, 0), (2.0, 1.5, 1.4), shoe, rot=fr)   # curled toe
    # ---- pelvis / skirt ----
    cv.ell(hip, (8.8, 7.0, 9.8), shorts)
    trot = rz(-L)
    if girl and outfit == "festival":
        hem = hip + V(-1.5 * sw - 3.0 * math.sin(L), -13.5, 0)
        cv.frustum(hip + u * 5, hem, 8.6, 15.5, GREEN, GOLD, split=.84, flat=.9)
    elif girl and outfit == "street":
        cv.frustum(hip + u * 4, hip + V(-1.0 * sw - 1.5, -8.5, 0), 8.8, 14.0, GREEN, WHITE, split=.86, flat=.9)
    elif (not girl) and outfit == "festival":
        cv.frustum(hip + u * 4, hip + V(-.8 * sw - 1.0, -9.5, 0), 9.2, 11.0, GREEN, GOLD, split=.86, flat=.95)
    elif girl and outfit == "sport":
        cv.frustum(hip + u * 2, hip + V(-.6 * sw - .6, -6.5, 0), 9.0, 12.2, DARK, WHITE, split=.84, flat=.92)
    # ---- torso ----
    def torso_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        if outfit == "street" and not girl:
            col[(x > .25) & (y > -.62) & (y < -.18) & (np.abs(z) < .58)] = GREEN_D
            col[(x > 0) & (y > .25) & (y < .72) & (np.abs(np.abs(z) - .17) < .035)] = WHITE
        if outfit == "street" and girl:
            hx = (z / .26); hy = (y - .12) / .26
            heart = (x > 0) & ((hx * hx + hy * hy - .5) ** 3 - hx * hx * hy ** 3 < 0)
            col[heart] = WHITE
        if outfit == "festival":
            col[(x > 0) & (np.abs(z) < .07) & (y > -.2)] = GOLD
            col[(y > .70)] = GOLD
        if outfit == "explorer":
            col[(np.abs(np.abs(z) - .56) < .085) & (y > -.3)] = BROWN
            col[(x > .2) & (np.abs(z - .0) < .5) & (np.abs(y + .50) < .07)] = BROWN
        if outfit == "sport":
            col[np.abs(z) > .80] = WHITE
            col[(x > 0) & ((z / .30) ** 2 + ((y - .08) / .30) ** 2 < 1)] = WHITE
            col[(x > 0) & ((z / .20) ** 2 + ((y - .08) / .20) ** 2 < 1)] = GOLD
        return col, None
    if outfit == "explorer":
        cv.ell(chest + trot @ V(-9.5, 1.5, 0), (5.6, 8.6, 7.4), BROWN, rot=trot)
        cv.ell(chest + trot @ V(-13.2, -1.5, 0), (2.6, 4.2, 5.2), V(120, 76, 50), rot=trot)
    if outfit == "street" and not girl:
        cv.ell(neck + trot @ V(-5.5, -.5, 0), (6.6, 6.0, 8.6), GREEN_D, rot=trot)
    cv.ell(chest, (9.4, 12.8, 10.4), top, rot=trot, shader=torso_sh)
    cv.cone(neck + u * -1.5, neck + u * 3.5, 4.0, 3.8, SKIN_D)
    if outfit == "explorer":
        cv.ell(neck + trot @ V(3.2, -.6, 0), (4.6, 2.6, 6.2), RED, rot=trot)
        cv.ell(neck + trot @ V(5.6, -3.8, 0), (2.2, 3.2, 2.4), RED, rot=trot)
    if girl and outfit == "festival":   # dupatta streaming behind
        s0 = neck + trot @ V(-2, -1.5, 5.5); prev = s0
        for k in range(1, 7):
            nxt = s0 + V(-5.0 * k, 2.2 * math.sin(k * .9 + sw * 1.4) - .5 * k + 2.5 * sw, -1.2 * k)
            cv.cone(prev, nxt, 3.4 - .28 * k, 3.2 - .28 * k, PINK, flat=.55); prev = nxt
        cv.ell(neck + trot @ V(2.5, -1.2, 0), (5.2, 2.4, 7.2), PINK, rot=trot)
    # ---- arms ----
    for i, sgn in enumerate((1, -1)):
        th, el = p["arms"][i]
        sh = hip + u * 19.3 + V(0, 0, 10.4 * sgn)
        spl = p["splay"] * sgn
        elb = sh + 9.4 * down(th, spl * .6) ; hand = elb + 8.6 * down(th + el, spl * .2)
        if sleeve_long:
            cv.cone(sh, elb, 4.5, 4.0, top); cv.cone(elb, hand, 4.0, 3.6, top, GREEN_D, split=.84)
        else:
            cv.cone(sh, elb, 4.5, 3.8, top, SKIN, split=.58); cv.cone(elb, hand, 3.7, 3.2, SKIN, WHITE if outfit == "sport" else None, split=.76)
        cv.ell(hand + .8 * down(th + el), 4.2, SKIN)
        if girl and outfit == "festival":
            w = elb + (hand - elb) * .8; cv.ell(w, 3.5, GOLD)
    # ---- head ----
    cv.ell(HL(-.5, -1.2, R * .97), (2.5, 3.6, 2.1), SKIN_D, rot=hrot)
    cv.ell(HL(-.5, -1.2, -R * .97), (2.5, 3.6, 2.1), SKIN_D, rot=hrot)
    cv.ell(hd, (R, R * .97, R * .95), SKIN, rot=hrot, shader=face(gender, p["mouth"], p["blink"]))
    cv.ell(HL(R * .985, -2.2, 0), 1.75, SKIN_D)
    band = WHITE if outfit == "sport" else None
    cv.ell(hd + hrot @ V(-.8, .9, 0), (R * 1.075, R * 1.06, R * 1.05), HAIR, rot=hrot, shader=hair_cut(girl, band))
    if girl:
        for zz, yy, rr in ((-9.5, 9.6, 6.0), (-3.2, 10.6, 6.4), (3.2, 10.6, 6.4), (9.5, 9.6, 6.0)):
            cv.ell(HL(R * .70, yy, zz), (5.2, rr * .86, rr), HAIR, rot=hrot)
        if outfit == "sport":      # high ponytail
            a = HL(-R * .78, R * .55, 0); b = a + V(-9 - 3 * sw, 4 + 6 * (sw < -1) - 9 - 2 * abs(sw), 0)
            mid = a + V(-7, 5, 0)
            cv.ell(a, 3.4, PINK); cv.cone(a, mid, 4.6, 5.4, HAIR); cv.cone(mid, mid + V(-6 - 4 * sw, -11 + 3 * sw, 0), 5.4, 2.4, HAIR)
        elif outfit == "explorer":  # single braid
            a = HL(-R * .9, -R * .35, 0); prev = a
            for k in range(1, 5):
                nxt = a + V(-2.5 * k - 1.6 * sw * k * .5, -4.6 * k, 0); cv.ell(nxt, 4.3 - .45 * k, HAIR); prev = nxt
            cv.ell(prev + V(-.6, -2.6, 0), 2.3, RED)
        else:                      # pigtails with ties
            for sgn in (1, -1):
                a = HL(-R * .30, R * .22, R * .98 * sgn)
                b = a + V(-7.5 - 4.0 * sw, -12.5 + 2.2 * abs(sw) + (9 if p["mode"] == "jump" else 0), 3.0 * sgn)
                cv.cone(a, b, 5.6, 3.6, HAIR); cv.ell(b, 3.9, HAIR)
                cv.ell(a + (b - a) * .12, (3.6, 3.6, 3.6), PINK if outfit == "street" else GOLD)
        if outfit == "festival":
            f = HL(R * .35, R * .80, R * .72)
            for k in range(5):
                ang = k * 1.2566; cv.ell(f + hrot @ V(0, 2.2 * math.cos(ang), 2.2 * math.sin(ang)), 1.9, PINK)
            cv.ell(f + hrot @ V(.8, 0, 0), 1.5, GOLD)
    else:
        for zz, yy, rr, xx in ((-8.5, 10.4, 5.6, .72), (-2.0, 11.8, 6.2, .74), (5.0, 11.2, 6.0, .72), (10.5, 8.8, 4.6, .60)):
            cv.ell(HL(R * xx, yy, zz), (5.0, rr * .8, rr), HAIR, rot=hrot @ rx(.25))
        if outfit != "explorer":
            for k, (bx, by, bz) in enumerate(((.15, 1.02, -3), (.42, 1.0, 2), (-.15, 1.03, 3))):
                a = HL(R * bx, R * (by - .12), bz); cv.cone(a, a + hrot @ V(4.5 + 1.5 * k, 6.5 - k + .8 * sw, 0), 4.2, 1.2, HAIR)
    if outfit == "explorer":
        hat = V(232, 206, 150)
        top_c = HL(-.5, R * .62, 0)
        cv.ell(top_c, (R * 1.42, 2.3, R * 1.36), hat, rot=hrot @ rz(-.06))
        def band_sh(q, col):
            col = col.copy(); col[(q[:, 1] < -.05) & (q[:, 1] > -.5)] = V(150, 78, 56); return col, q[:, 1] > -.55
        cv.ell(top_c + hrot @ V(0, 2.5, 0), (R * .86, R * .62, R * .84), hat, rot=hrot, shader=band_sh)

def robot(cv, outfit, frame):
    p = pose(frame)
    L = p["lean"] * .8; u = V(math.sin(L), math.cos(L), 0)
    hipY = 19.0 - (10 if p["hipdrop"] else 0)
    hip = V(0, hipY, 0)
    legs = []
    for i, sgn in enumerate((1, -1)):
        th, kn = p["legs"][i]; th *= .85; kn *= .75
        hj = hip + V(0, -2, 5.8 * sgn)
        knee = hj + 7.5 * down(th); ank = knee + 8.0 * down(th - kn)
        fa = (th - kn + .25) if p["mode"] in ("run", "jump") else (.5 if (p["mode"] == "slide" and i == 0) else 0)
        legs.append((hj, knee, ank, fa))
    lowest = min(a[1] - 6.6 for (_, _, a, _) in legs)
    dy = -lowest + (p["hop"] if p["mode"] == "run" else p["lift"])
    if p["mode"] == "slide": dy = -min(lowest, hipY - 10.5)
    off = V(0, dy, 0); hip = hip + off
    trot = rz(-L)
    chest = hip + u * 11.0; neck = hip + u * 22.5
    hd = neck + V(1.2 + 3 * math.sin(max(L, 0)), 13.6, 0)
    if p["mode"] == "slide": hd = neck + V(4.5, 12.5, 0)
    hrot = ry(.62) @ rz(-p["head"])
    def HL(x, y, z): return hd + hrot @ V(x, y, z)
    sw = p["sway"]
    ph = 2 * math.pi * (frame % 10) / 10
    kc = chest + trot @ V(-14.5, 2, 0)
    cv.cone(chest + trot @ V(-8, 2, 0), kc, 1.9, 1.9, BRASS)
    ka = ph if p["mode"] == "run" else (.7 if frame % 2 else 0)
    for sgn in (1, -1):
        kr = trot @ rx(ka)
        c = kc + kr @ V(-1.0, 5.6 * sgn, 0)
        cv.ell(c, (1.9, 5.4, 3.8), BRASS, rot=kr)
        cv.ell(c + trot @ V(1.0, 0, 0), (1.5, 2.7, 1.8), V(150, 104, 52), rot=kr)
    if outfit == "royal":
        s0 = neck + trot @ V(-6, -3, 0)
        for k in range(8):
            c = s0 + V(-2.6 * k - .9 * k * max(0, sw), -3.3 * k + .45 * k * abs(sw), 0)
            cv.ell(c, (3.0, 3.4, 9.0 + 1.0 * k), V(214, 60, 84) if k < 7 else GOLD)
    for (hj, knee, ank, fa) in legs:
        hj = hj + off; knee = knee + off; ank = ank + off
        cv.cone(hj, knee, 3.9, 3.7, STEEL); cv.cone(knee, ank, 3.7, 4.0, STEEL)
        fr = rz(fa * .9); fc = ank + fr @ V(2.6, -1.8, 0)
        cv.ell(fc + fr @ V(0, -3.4, 0), (8.6, 2.0, 5.8), DARK, rot=fr)
        cv.ell(fc, (8.2, 5.2, 5.6), GREEN, rot=fr)
        cv.ell(fc + fr @ V(4.6, .4, 0), (3.9, 3.4, 4.8), CREAM, rot=fr)
        if p["mode"] == "jump":
            fl = fc + fr @ V(-1.5, -5.5, 0)
            for k in range(6):
                t = k / 5
                cv.ell(fl + fr @ V(-1.2 * k, -2.0 * k, 0), 4.0 * (1 - t) + .9, V(255, 150 + 90 * (1 - t) * 0, 60), glow=1, gloss=0)
            for k in range(4):
                t = k / 3
                cv.ell(fl + fr @ V(-.8 * k, -1.5 * k, 2), 2.4 * (1 - t) + .6, V(255, 238, 150), glow=1, gloss=0)
    cv.ell(hip + u * 1.0, (9.6, 6.2, 10.6), STEEL, rot=trot)
    def chest_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        col[np.abs(y + .60) < .07] = BRASS
        zz = z - .12
        d = (zz / .46) ** 2 + ((y - .06) / .44) ** 2
        col[(x > 0) & (d < 1)] = CREAM
        col[(x > 0) & (d < 1) & (d > .76)] = BRASS
        hx = zz / .25; hy = (y - .08) / .25
        col[(x > 0) & ((hx * hx + hy * hy - .5) ** 3 - hx * hx * hy ** 3 < 0)] = RED
        return col, None
    cv.ell(chest, (11.2, 12.2, 12.0), GREEN, rot=trot @ ry(.25), shader=chest_sh)
    cv.cone(neck - u * 2.5, neck + u * 2.5, 4.6, 4.4, STEEL)
    if outfit == "scarf":
        cv.ell(neck + trot @ V(1.2, -.8, 0), (8.0, 3.2, 9.2), RED, rot=trot)
        s0 = neck + trot @ V(-6, -1, 4); prev = s0
        for k in range(1, 6):
            nxt = s0 + V(-5.2 * k, 2.4 * math.sin(k * 1.0 + sw * 1.5) - .3 * k + 2 * sw, -1.0 * k)
            cv.cone(prev, nxt, 3.4 - .25 * k, 3.2 - .25 * k, WHITE if k == 5 else RED, flat=.55); prev = nxt
    for i, sgn in enumerate((1, -1)):
        th, el = p["arms"][i]
        sh = hip + u * 19.5 + V(0, 0, 12.6 * sgn); spl = p["splay"] * sgn
        elb = sh + 7.8 * down(th, spl * .6); hand = elb + 7.4 * down(th + el, spl * .2)
        cv.ell(sh, 4.6, GREEN_D); cv.cone(sh, elb, 3.3, 3.2, STEEL); cv.cone(elb, hand, 3.2, 3.5, STEEL)
        cv.ell(hand + 2.0 * down(th + el), 5.2, CREAM)
    Rr = V(18.4, 16.0, 17.2)
    for sgn in (1, -1):
        cv.ell(HL(-1.0, -.5, Rr[2] * .97 * sgn), (4.4, 4.4, 2.8), BRASS, rot=hrot)
        cv.ell(HL(-1.0, -.5, (Rr[2] + 2.3) * sgn), (2.2, 2.2, 1.5), V(150, 104, 52), rot=hrot)
    blink = p["blink"]; mouth = p["mouth"]
    def head_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        vis = (x > .05) & ((z / .84) ** 2 + ((y + .04) / .64) ** 2 < 1)
        rimv = (x > .05) & ((z / .91) ** 2 + ((y + .04) / .71) ** 2 < 1) & ~vis
        col[vis] = V(36, 42, 70); col[rimv] = CREAM
        for side in (1, -1):
            ez = .37 * side
            if blink: e = vis & (np.abs(y - .08) < .04) & (np.abs(z - ez) < .19)
            else: e = vis & (((z - ez) / .185) ** 2 + ((y - .10) / .25) ** 2 < 1)
            col[e] = CYAN
            if not blink:
                col[e & (((z - ez + .06) / .06) ** 2 + ((y - .20) / .075) ** 2 < 1)] = V(244, 255, 255)
            g = np.exp(-(((z - .70 * side) ** 2 + (y + .30) ** 2)) / .010) * vis
            col += (V(255, 120, 150) - col) * (g * .85)[:, None]
        if mouth == "open": m = vis & ((z / .17) ** 2 + ((y + .30) / .12) ** 2 < 1) & (y < -.27)
        else: m = vis & (np.abs(y + .36 - 1.6 * z * z) < .032) & (np.abs(z) < .18)
        col[m] = CYAN
        return col, None
    cv.ell(hd, Rr, GREEN, rot=hrot, shader=head_sh)
    a0 = HL(-1, Rr[1] * .96, 0); a1 = a0 + hrot @ V(-1.5 - 1.5 * sw, 8.0, 0)
    cv.cone(a0, a1, 1.4, 1.2, STEEL); cv.ell(a0, (3.6, 1.8, 3.6), BRASS, rot=hrot)
    cv.ell(a1, 3.6, V(255, 196, 96), glow=.85)
    if outfit == "royal":
        cc = HL(4.5, Rr[1] * .86, -5.5)
        def crown(q, col):
            ang = np.arctan2(q[:, 2], q[:, 0]); keep = (q[:, 1] > -.3) & (q[:, 1] < .10 + .8 * np.abs(np.sin(ang * 3.0)))
            col = col.copy(); col[(q[:, 1] < -.02)] = V(232, 150, 50); return col, keep
        cv.ell(cc + hrot @ V(0, 3, 0), (6.6, 7.2, 6.6), GOLD, rot=hrot @ rz(-.25), shader=crown)

def sheet(kind, outfit):
    atlas = Image.new("RGBA", (CW * 4, CH * 4))
    for f in range(16):
        cv = Canvas()
        if kind == "bot": robot(cv, outfit, f)
        else: kid(cv, kind, outfit, f)
        atlas.paste(cv.image(), (f % 4 * CW, f // 4 * CH))
    return atlas

if __name__ == "__main__":
    out = sys.argv[1]; jobs = sys.argv[2:]
    for j in jobs:
        kind, outfit = j.split("/")
        im = sheet(kind, outfit); im.save(f"{out}/{kind}_{outfit}.webp", quality=92, method=6)
        print(j, "ok", flush=True)
