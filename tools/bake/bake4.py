"""Build 2a art: toon kids (all outfits), slim dino with looks, and redrawn rivals. Every sheet gets a thin ink line."""
import sys, math
import numpy as np
from PIL import Image
import bake as B, bake2 as B2
from bake import Canvas, V, rz, ry, rx, down, pose, hair_cut, CW, CH, SS
from bake import GREEN, GREEN_D, SKIN, SKIN_D, HAIR, WHITE, CREAM, NAVY, PLUM, KHAKI, BROWN, GOLD, RED, PINK, ORANGE, DARK, CYAN
from bake2 import chain

def toon_face(mouth, blink, az0=.43, big=1.5, glasses=None, lashes=False):
    def sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        for side in (1, -1):
            az = az0 * side; e = V(math.cos(az), -.04, math.sin(az)); th = V(-math.sin(az), 0, math.cos(az))
            front = (q @ e) > .5; du = (q @ th) / big; dv = (y - e[1]) / big
            if blink:
                col[front & (np.abs(dv + .02 - .5 * du * du) < .028) & (np.abs(du) < .2)] = V(60, 40, 44)
            else:
                top = front & ((du / .215) ** 2 + ((dv - .012) / .285) ** 2 < 1) & (dv > .10)
                col[top] = V(46, 32, 38)
                white = front & ((du / .20) ** 2 + (dv / .27) ** 2 < 1); col[white] = V(255, 252, 244)
                iu = du - .03
                col[white & ((iu / .15) ** 2 + ((dv + .01) / .215) ** 2 < 1)] = V(112, 66, 40)
                col[white & ((iu / .095) ** 2 + ((dv + .015) / .145) ** 2 < 1)] = V(34, 24, 30)
                col[white & (((iu + .055) / .055) ** 2 + ((dv - .09) / .065) ** 2 < 1)] = V(255, 255, 255)
                col[white & (((iu - .06) / .028) ** 2 + ((dv + .10) / .032) ** 2 < 1)] = V(250, 240, 230)
                if lashes:
                    col[front & (np.abs(dv - .20 - .8 * (du * side - .16)) < .022) & (du * side > .16) & (du * side < .27)] = V(46, 32, 38)
            col[front & (np.abs(dv - .40 - .16 * du * side + .9 * du * du) < .026) & (np.abs(du) < .2)] = HAIR
            if glasses is not None:
                d = (du / .27) ** 2 + ((dv - .0) / .33) ** 2
                col[front & (d < 1.0) & (d > .72)] = glasses
                lens = front & (d <= .72); col[lens] = col[lens] * .93 + V(255, 255, 255) * .07
            azb = .92 * side; eb = V(math.cos(azb) * .97, -.30, math.sin(azb) * .97)
            g = np.exp(-(((q - eb) ** 2).sum(1)) / .03); col += (V(255, 120, 120) - col) * (g * .45)[:, None]
        if glasses is not None: col[(x > .8) & (np.abs(y + .04) < .035) & (np.abs(z) < .17)] = glasses
        m = x > .3
        if mouth == "open":
            mo = m & ((z / .24) ** 2 + ((y + .50) / .15) ** 2 < 1) & (y < -.42 + .0)
            mo = m & ((z / .23) ** 2 + ((y + .47) / .16) ** 2 < 1) & (y < -.40)
            col[mo] = V(150, 52, 62); col[mo & (y > -.455)] = V(255, 250, 244); col[mo & (y < -.54) & (np.abs(z) < .13)] = V(244, 128, 136)
        else:
            col[m & (np.abs(y + .50 - .9 * z * z) < .026) & (np.abs(z) < .27)] = V(128, 58, 58)
        return col, None
    return sh

T = dict(hipY=15.5, thigh=6.4, shin=6.8, legr=(3.4, 3.1), shoe=V(9.6, 5.6, 6.4), torso=V(9.6, 10.2, 10.2), chestUp=8.5, neckUp=17.5, headUp=16.5, R=V(21.0, 19.4, 19.8),
         shUp=15.5, shz=11.0, arm=(7.0, 6.8), armr=3.1, hand=5.8)
SHIRTS = ("tropic", "stripe", "star", "sunset")
OVERRIDE = {}   # set by bake6 for townsfolk colours
PAL = {}        # set by bake6 for the golden hatchling
def toonkid(cv, gender, outfit, frame, layout="runner"):
    cv.cel = .5; cv.ink = 1.15
    p = pose(frame, layout); girl = gender == "girl"; mode = p["mode"]
    L = p["lean"] * 1.3; u = V(math.sin(L), math.cos(L), 0)
    top = GREEN; long_sleeve = False; legcol = SKIN; shorts = NAVY; shoe = WHITE; sole = RED; toe = RED
    if girl:
        shorts = KHAKI; shoe = BROWN; sole = DARK; toe = V(120, 76, 50)
        # Each shirt has its own base colour so the four read apart at game size.
        top = {"tropic": V(36, 170, 176), "stripe": V(230, 72, 86), "star": V(108, 86, 196), "sunset": V(255, 150, 80)}.get(outfit, GREEN)
        shorts = {"stripe": NAVY, "star": CREAM, "sunset": V(150, 96, 62)}.get(outfit, KHAKI)
    elif outfit == "street": long_sleeve = True
    elif outfit == "festival": long_sleeve = True; shorts = CREAM; legcol = CREAM; shoe = BROWN; sole = V(120, 76, 50); toe = GOLD
    elif outfit == "explorer": shorts = KHAKI; shoe = BROWN; sole = DARK; toe = V(120, 76, 50)
    elif outfit == "sport": shorts = DARK; shoe = ORANGE; sole = WHITE; toe = WHITE
    top = OVERRIDE.get("top", top); shorts = OVERRIDE.get("shorts", shorts); legcol = OVERRIDE.get("legcol", legcol); shoe = OVERRIDE.get("shoe", shoe)
    trim = OVERRIDE.get("trim", GOLD); deep = GREEN_D if top is GREEN else top * .72
    hipY = T["hipY"] - (T["hipY"] * .5 if p["hipdrop"] else 0); hip = V(0, hipY, 0); legs = []
    for i, sgn in enumerate((1, -1)):
        th, kn = p["legs"][i]; th *= 1.08; kn *= .9
        hj = hip + V(0, -2, 5.2 * sgn); knee = hj + T["thigh"] * down(th); ank = knee + T["shin"] * down(th - kn)
        fa = (th - kn + .25) if mode in ("run", "jump") else (.5 if (mode == "slide" and i == 0) else 0)
        legs.append((hj, knee, ank, fa))
    S = T["shoe"]; lowest = min(a[1] - S[1] * 1.25 for (_, _, a, _) in legs)
    dy = -lowest + (p["hop"] * 1.5 if mode == "run" else p["lift"])
    if mode == "slide": dy = -min(lowest, hipY - T["torso"][1])
    off = V(0, dy, 0); hip = hip + off; trot = rz(-L)
    chest = hip + u * T["chestUp"]; neck = hip + u * T["neckUp"]
    hd = neck + V(1.2 + 4 * math.sin(max(L, 0)), T["headUp"], 0)
    if mode == "slide": hd = neck + V(4.5, T["headUp"] * .9, 0)
    R = T["R"]; hrot = ry(.62) @ rz(-p["head"] * 1.5)
    def HL(x, y, z): return hd + hrot @ V(x, y, z)
    sw = p["sway"]; r1, r2 = T["legr"]
    for (hj, knee, ank, fa) in legs:
        hj = hj + off; knee = knee + off; ank = ank + off
        cv.cone(hj, knee, r1 * 1.15, r1, top if (outfit == "festival" and not girl) else shorts, legcol, split=.62)
        cv.cone(knee, ank, r1, r2, legcol, (WHITE if not girl else CREAM) if legcol is SKIN else None, split=.55)
        fr = rz(fa * .9); fc = ank + fr @ V(S[0] * .32, -S[1] * .35, 0)
        cv.ell(fc + fr @ V(0, -S[1] * .64, 0), (S[0] * 1.05, S[1] * .4, S[2] * 1.04), sole, rot=fr)
        cv.ell(fc, S, shoe, rot=fr); cv.ell(fc + fr @ V(S[0] * .54, .5, 0), S * V(.48, .66, .86), toe, rot=fr)
    TS = T["torso"]
    cv.ell(hip + u * 1.0, TS * V(.93, .55, .93), shorts, rot=trot)
    if (not girl) and outfit == "festival":
        cv.frustum(hip + u * 4.5, hip + V(-.8 * sw - 1.0, -7.0, 0), TS[0] * 1.0, TS[0] * 1.2, top, trim, split=.82, flat=.95)
    def torso_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]; zz = z - .12
        if girl:
            if outfit == "tropic":
                for k in range(9):
                    cx, cy = math.sin(k * 2.4) * .75, math.cos(k * 1.7) * .7
                    d = ((zz - cx) / .2) ** 2 + ((y - cy) / .2) ** 2
                    col[d < 1] = (PINK, GOLD, WHITE)[k % 3]; col[d < .22] = (GOLD, RED, PINK)[k % 3]
            elif outfit == "stripe":
                col[np.cos((zz + y) * 11) > .25] = WHITE; col[np.cos((zz + y) * 11) > .86] = GOLD
            elif outfit == "star":
                gx = (zz * 2.6 + 10) % 1 - .5; gy = (y * 2.6 + 10 + .5 * np.floor(zz * 2.6 + 10)) % 1 - .5
                col[(np.abs(gx) + np.abs(gy) < .26)] = GOLD; col[(np.abs(gx) < .07) | (np.abs(gy) < .07)] = col[(np.abs(gx) < .07) | (np.abs(gy) < .07)]
                col[(np.abs(gx) + np.abs(gy) < .12)] = WHITE
            else:
                band = np.clip((y + 1) / 2, 0, 1)
                col[:] = np.where(band[:, None] > .66, V(255, 214, 96), np.where(band[:, None] > .36, V(255, 150, 80), V(244, 96, 132)))
                col[((zz / .26) ** 2 + ((y - .02) / .26) ** 2 < 1) & (x > 0)] = V(255, 244, 190)
            col[(y > .70)] = deep
        elif outfit == "street":
            col[(x > .2) & (y > -.66) & (y < -.2) & (np.abs(zz) < .6)] = deep
            col[(x > 0) & (y > .2) & (y < .7) & (np.abs(np.abs(zz) - .16) < .04)] = WHITE
        elif outfit == "festival":
            col[(x > 0) & (np.abs(zz) < .075) & (y > -.3)] = trim; col[(y > .66)] = trim
            for k in range(3): col[(x > 0) & ((zz / .09) ** 2 + ((y - .35 + .3 * k) / .09) ** 2 < 1)] = WHITE
        elif outfit == "explorer":
            col[(np.abs(np.abs(z) - .58) < .09) & (y > -.35)] = BROWN; col[(x > .1) & (np.abs(y + .52) < .08)] = BROWN
            col[(x > .2) & (np.abs(zz) < .12) & (np.abs(y + .52) < .13)] = GOLD
        elif outfit == "pixel":   # an 8-bit checker shirt
            sq = (np.floor(zz * 4.5 + 20) + np.floor(y * 4.5 + 20)) % 2 == 0; col[sq] = deep
            col[(x > 0) & (np.abs(zz) < .22) & (np.abs(y - .1) < .22)] = trim; col[(x > 0) & (np.abs(zz) < .1) & (np.abs(y - .1) < .1)] = WHITE
        elif outfit == "sport":
            col[np.abs(z) > .82] = WHITE; d = (zz / .36) ** 2 + ((y - .06) / .36) ** 2
            col[(x > 0) & (d < 1)] = WHITE; col[(x > 0) & (d < .5)] = GOLD
        return col, None
    if girl or outfit == "explorer":
        cv.ell(chest + trot @ V(-TS[0] * 1.02, 1.0, 0), (5.4, 8.0, 7.6), BROWN, rot=trot); cv.ell(chest + trot @ V(-TS[0] * 1.4, -2.0, 0), (2.8, 4.2, 5.2), V(120, 76, 50), rot=trot)
    if (not girl) and outfit == "street": cv.ell(neck + trot @ V(-TS[0] * .62, -1.5, 0), TS * V(.72, .56, .9), deep, rot=trot)
    cv.ell(chest, TS, top, rot=trot @ ry(.25), shader=torso_sh)
    ar = T["armr"]
    cv.cone(neck - u * 2.5, neck + u * 3.0, ar * 1.25, ar * 1.2, SKIN_D)
    if outfit == "explorer" or girl:
        cv.ell(neck + trot @ V(2.0, -1.2, 0), (7.2, 2.8, 8.6), RED if not girl else GOLD, rot=trot); cv.ell(neck + trot @ V(7.0, -4.2, 1), (2.4, 3.6, 2.8), RED if not girl else GOLD, rot=trot)
    sleeve = top if not (girl and outfit == "sunset") else V(255, 214, 96)
    for i, sgn in enumerate((1, -1)):
        th, el = p["arms"][i]; th *= 1.12
        sh = hip + u * T["shUp"] + V(0, 0, T["shz"] * sgn); spl = p["splay"] * sgn
        elb = sh + T["arm"][0] * down(th, spl * .6); hand = elb + T["arm"][1] * down(th + el, spl * .2)
        cv.ell(sh, ar * 1.3, sleeve)
        if long_sleeve: cv.cone(sh, elb, ar * 1.2, ar * 1.1, top); cv.cone(elb, hand, ar * 1.1, ar * 1.05, top, deep, split=.8)
        else: cv.cone(sh, elb, ar * 1.2, ar, sleeve, SKIN, split=.5); cv.cone(elb, hand, ar, ar * .94, SKIN, WHITE if outfit == "sport" else None, split=.7)
        cv.ell(hand + T["hand"] * .4 * down(th + el), T["hand"], SKIN)
    for sgn in (1, -1): cv.ell(HL(-1.0, -1.5, R[2] * .97 * sgn), (R[0] * .15, R[1] * .23, R[2] * .14), SKIN_D, rot=hrot)
    mouth = "open" if mode in ("jump", "cheer", "slide") else p["mouth"]
    cv.ell(hd, R, SKIN, rot=hrot, shader=toon_face(mouth, p["blink"], glasses=V(240, 80, 130) if girl else (V(60, 220, 255) if outfit == "pixel" else None), lashes=girl))
    cv.ell(HL(R[0] * .99, -R[1] * .17, 0), R[0] * .095, SKIN_D)
    band = WHITE if outfit == "sport" else (V(60, 220, 255) if outfit == "pixel" else None)
    cv.ell(hd + hrot @ V(-1.0, 1.2, 0), R * V(1.07, 1.07, 1.06), HAIR, rot=hrot, shader=hair_cut(girl, band))
    k = R[0] / 18.4
    if girl:
        for sgn in (1, -1):   # a soft bob curl below the hat
            cv.ell(HL(-R[0] * .30, -R[1] * .62, R[2] * .86 * sgn), V(6.4, 5.4, 5.0) * k, HAIR, rot=hrot)
        for zz, yy, rr in ((-10.5, 8.0, 5.4), (0, 9.2, 6.0), (10.5, 8.0, 5.4)): cv.ell(HL(R[0] * .74, yy * k, zz * k), V(4.6, rr * .7, rr) * k, HAIR, rot=hrot)
    else:
        for zz, yy, rr, xx in ((-10.0, 11.4, 6.4, .70), (-2.6, 13.0, 7.2, .73), (5.6, 12.4, 6.8, .71), (12.0, 9.6, 5.2, .58)):
            cv.ell(HL(R[0] * xx, yy * k, zz * k), V(5.6, rr * .8, rr) * k, HAIR, rot=hrot @ rx(.25))
        if outfit != "explorer":
            for j, (bx, by, bz) in enumerate(((.10, 1.0, -3.5), (.40, .98, 2.5), (-.20, 1.02, 3.5))):
                a = HL(R[0] * bx, R[1] * (by - .1), bz); cv.cone(a, a + hrot @ (V(5.0 + 1.6 * j, 7.0 - j + .8 * sw, 0) * k), 4.8 * k, 1.4 * k, HAIR)
    if girl or outfit == "explorer":
        hat = V(232, 206, 150) if not girl else V(244, 222, 164); tc = HL(-.5, R[1] * .70, 0)
        cv.ell(tc, (R[0] * 1.30, 2.6, R[2] * 1.26), hat, rot=hrot @ rz(-.10))
        bandc = V(150, 78, 56) if not girl else (V(240, 80, 130) if outfit != "sunset" else V(90, 190, 200))
        def band_sh(q, col):
            col = col.copy(); col[(q[:, 1] < -.02) & (q[:, 1] > -.5)] = bandc; return col, q[:, 1] > -.55
        cv.ell(tc + hrot @ V(0, 3.0, 0), R * V(.84, .62, .82), hat, rot=hrot, shader=band_sh)
        if girl:
            f = tc + hrot @ V(R[0] * .55, 4.5, R[2] * .58)
            for j in range(5): cv.ell(f + hrot @ V(0, 2.6 * math.cos(j * 1.2566), 2.6 * math.sin(j * 1.2566)), 2.2, WHITE)
            cv.ell(f + hrot @ V(1.0, 0, 0), 1.8, GOLD)

def slim_dino(cv, outfit, frame, layout="runner"):
    cv.ink = 1.0
    p = pose(frame, layout); mode = p["mode"]; sw = p["sway"]; skin = PAL.get("skin", GREEN); dark = PAL.get("dark", GREEN_D); cream = PAL.get("cream", V(246, 220, 140)); lite = PAL.get("lite", V(150, 214, 92)); horn = PAL.get("horn", V(255, 170, 70))
    hipY = 34.0 if not p["hipdrop"] else 15.0; hip = V(-3, hipY, 0); legs = []
    for i, sgn in enumerate((1, -1)):
        th, kn = p["legs"][i]; th = th * .85 - .15; kn *= .9
        if mode == "slide": th, kn = (1.25, .2) if i == 0 else (.9, .9)
        hj = hip + V(0, -1, 7.0 * sgn); knee = hj + 13.5 * down(th + .38); ank = knee + 14.0 * down(th - kn - .28)
        legs.append((hj, knee, ank, (th - kn + .1) if mode in ("run", "jump") else (.5 if mode == "slide" else 0)))
    lowest = min(a[1] - 3.8 for (_, _, a, _) in legs); dy = -lowest + (p["hop"] * 1.3 if mode == "run" else p["lift"])
    if mode == "slide": dy = -min(lowest, hipY - 11)
    off = V(0, dy, 0); hip = hip + off
    tilt = .30 + (.08 if mode == "run" else 0) + (-.34 if mode == "slide" else 0) + (.22 if mode in ("cheer", "jump") else 0); brot = rz(tilt)
    def BL(x, y, z=0): return hip + brot @ V(x, y, z)
    up = 16 if mode == "jump" else 0
    pts = [BL(-11, 5), BL(-23, 6 + 1.5 * sw), BL(-35, 8 + 4 * sw + up * .4), BL(-47, 11 + 7 * sw + up * .8), BL(-58, 14 + 10 * sw + up)]
    chain(cv, pts, [8.6, 6.6, 4.6, 2.9, 1.3], skin)
    for j in range(1, 5):
        c = pts[j - 1] + (pts[j] - pts[j - 1]) * .5; cv.ell(c + V(0, [7.0, 5.2, 3.6, 2.2][j - 1], 0), (3.0, 1.4, [6.6, 4.8, 3.2, 2.0][j - 1]), dark)
    for (hj, knee, ank, fa) in legs:
        hj = hj + off; knee = knee + off; ank = ank + off
        cv.cone(hj, knee, 6.6, 4.4, skin); cv.ell(knee, 4.6, lite); cv.cone(knee, ank, 4.0, 2.9, skin)
        fr = rz(fa * .9); fc = ank + fr @ V(3.4, -1.0, 0); cv.ell(fc, (7.6, 3.0, 4.6), skin, rot=fr)
        for t in (-1, 0, 1): cv.cone(fc + fr @ V(6.0, -.4, 2.8 * t), fc + fr @ V(10.2, -1.6, 3.4 * t), 1.7, .5, WHITE)
    def body_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        belly = np.clip((-y - .10) * 3.4, 0, 1) * np.clip((x + .8) * 2, 0, 1); bands = .86 + .14 * (np.cos(x * 21) > .2)
        col += (cream * bands[:, None] - col) * belly[:, None]
        back = np.clip((y - .05) * 3, 0, 1); scale = (np.cos(x * 26 + np.round(y * 9) * 1.57) * np.cos(y * 28)) > .35
        col += (dark - col) * (back * scale * .55)[:, None]
        spot = np.clip((np.cos(x * 8.0 + 1.0) - .55) * 4, 0, 1) * np.clip((y - .3) * 4, 0, 1) * .5
        col += (lite - col) * spot[:, None]
        return col, None
    cv.ell(BL(6, 8), (17.5, 12.0, 11.0), skin, rot=brot, shader=body_sh)
    for i, (x, y, h) in enumerate([(-31, 12.5, 3.0), (-22, 14.5, 4.2), (-13, 17.5, 5.4), (-4, 20, 6.4), (5, 21, 6.6), (13, 20.5, 5.4)]):
        cv.cone(BL(x, y - 2), BL(x - 2.5, y + h * 1.5), 3.4, .7, horn, flat=.45)
    for i, sgn in enumerate((1, -1)):
        th = p["arms"][i][0] * .4 + .9
        if mode in ("cheer", "jump"): th = 2.1 + .3 * i
        sh = BL(18, 5, 8.6 * sgn); elb = sh + 6.6 * down(th, .2 * sgn); hand = elb + 5.6 * down(th + .9)
        cv.cone(sh, elb, 2.9, 2.3, skin); cv.cone(elb, hand, 2.3, 1.9, skin)
        for t in (-1, 0, 1): cv.cone(hand, hand + V(2.4, -1.2, 1.3 * t), 1.0, .3, WHITE)
    nb = BL(19, 12); hd = BL(32, 34)
    if mode == "slide": hd = BL(40, 20)
    cv.cone(nb, hd + V(-4, -6, 0), 9.0, 7.6, skin)
    if outfit == "scarf":
        mid = nb + (hd + V(-4, -6, 0) - nb) * .45
        cv.ell(mid, (10.4, 4.0, 9.8), RED, rot=brot @ rz(.9)); s0 = mid + V(-7, 3, 5); prev = s0
        for j in range(1, 6):
            nxt = s0 + V(-5.4 * j, 2.6 * math.sin(j * 1.0 + sw * 1.5) + 2.2 * sw, -1.0 * j); cv.cone(prev, nxt, 3.6 - .3 * j, 3.4 - .3 * j, WHITE if j == 5 else RED, flat=.55); prev = nxt
    hrot = ry(.34) @ rz(.04 - p["head"] + (.18 if mode == "cheer" else 0))
    def HL(x, y, z=0): return hd + hrot @ V(x, y, z)
    jaw = {"open": .36, "smile": .07}[p["mouth"]]
    if mode == "cheer": jaw = .62 if p["b"] == 0 else .16
    if mode == "jump": jaw = .42
    jr = hrot @ rz(-jaw); jc = HL(4, -6.5)
    cv.ell(jc + jr @ V(9, -2.2, 0), (11.4, 3.2, 7.2), skin, rot=jr); cv.ell(jc + jr @ V(9, -3.2, 0), (9.4, 2.3, 6.0), cream, rot=jr)
    cv.ell(jc + jr @ V(8.5, -.4, 0), (10.0, 2.2, 6.4), V(150, 52, 62), rot=jr); cv.ell(jc + jr @ V(9, .6, 0), (7.0, 1.5, 4.4), V(244, 128, 136), rot=jr)
    for t in range(4):
        for sgn in (1, -1): a = jc + jr @ V(6 + t * 3.2, .6, 5.4 * sgn * (1 - t * .08)); cv.cone(a, a + jr @ V(0, 2.2, 0), 1.1, .3, WHITE)
    def head_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        for side in (1, -1):
            az = .62 * side; e = V(math.cos(az) * .78, .30, math.sin(az) * .78); e = e / np.linalg.norm(e)
            th_ = V(-math.sin(az), 0, math.cos(az)); du = q @ th_; dv = y - e[1]; front = (q @ e) > .5
            if p["blink"]: col[front & (np.abs(dv + .02 - .6 * du * du) < .04) & (np.abs(du) < .26)] = dark * .5
            elif outfit != "shades":
                col[front & ((du / .31) ** 2 + ((dv - .01) / .37) ** 2 < 1)] = dark * .5
                wh = front & ((du / .27) ** 2 + (dv / .33) ** 2 < 1); col[wh] = V(255, 252, 240); iu = du - .05
                col[wh & ((iu / .17) ** 2 + (dv / .23) ** 2 < 1)] = V(214, 150, 40)
                col[wh & ((iu / .10) ** 2 + ((dv + .01) / .17) ** 2 < 1)] = V(30, 22, 28)
                col[wh & (((iu + .06) / .06) ** 2 + ((dv - .10) / .07) ** 2 < 1)] = V(255, 255, 255)
                col[wh & (dv > .20)] = skin * .8
            eb = V(math.cos(az * 1.5) * .9, -.18, math.sin(az * 1.5) * .9); gg = np.exp(-(((q - eb) ** 2).sum(1)) / .03)
            col += (V(255, 130, 120) - col) * (gg * .3)[:, None]
        scale = (np.cos(x * 20 + np.round(y * 7) * 1.57) * np.cos(y * 22)) > .4
        col += (dark - col) * (np.clip((y - .35) * 3, 0, 1) * np.clip(-x + .3, 0, 1) * scale * .5)[:, None]
        return col, None
    cv.ell(hd, (13.0, 11.6, 11.2), skin, rot=hrot, shader=head_sh)
    def snout_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        col[(x > .5) & (np.abs(np.abs(z) - .34) < .10) & (np.abs(y - .50) < .11)] = dark * .45
        col += (lite - col) * (np.clip((y - .2) * 2, 0, 1) * .35)[:, None]
        return col, None
    cv.ell(HL(13.0, -2.2), (12.6, 6.2, 8.0), skin, rot=hrot, shader=snout_sh)
    for t in range(5):
        for sgn in (1, -1): a = HL(9 + t * 3.0, -7.0, 5.6 * sgn * (1 - t * .07)); cv.cone(a, a + V(0, -2.4, 0), 1.2, .3, WHITE)
    for sgn in (1, -1): cv.ell(HL(3, 10.2, 6.4 * sgn), (6.0, 2.6, 3.8), dark, rot=hrot @ rz(-.12))
    if outfit == "shell":   # a cracked eggshell worn as a helmet
        cc = HL(-1.5, 7.6); shell = V(252, 248, 236)
        def crack(q, col):
            edge = -.12 + .2 * np.abs(((q[:, 0] * 2.2 + q[:, 2] * 1.6) % 1) - .5); return col, q[:, 1] > edge
        cv.ell(cc, (12.8, 10.6, 11.8), shell, rot=hrot, shader=crack)
        for a, b in ((.3, .5), (-.5, .2)): cv.ell(cc + hrot @ V(5 * a, 8.6, 6 * b), (2.6, 1.2, 2.2), V(250, 196, 70), rot=hrot)
    elif outfit != "cap":
        for x, y, h in ((-7, 9.5, 5.5), (-1, 11, 5)): cv.cone(HL(x, y), HL(x - 2.5, y + h), 2.8, .6, horn, flat=.45)
    else:
        cc = HL(-1.5, 8.2)
        cv.ell(cc, (12.4, 8.8, 11.4), V(64, 84, 190), rot=hrot, shader=lambda q, col: (col, q[:, 1] > -.2))
        cv.ell(cc + hrot @ V(12.5, -.8, 0), (8.0, 1.4, 8.6), V(250, 120, 60), rot=hrot @ rz(-.12)); cv.ell(cc + hrot @ V(0, 8.6, 0), 1.9, WHITE)
    if outfit == "shades":
        for sgn in (1, -1):
            e = hrot @ V(math.cos(.62 * sgn) * .78, .30, math.sin(.62 * sgn) * .78); e = e / np.linalg.norm(e)
            cv.ell(hd + e * 12.2, (2.0, 4.3, 4.6), V(30, 30, 46), rot=hrot @ ry(-.62 * sgn))
        cv.cone(HL(10.0, 4.2, -5.4), HL(10.0, 4.2, 5.4), 1.1, 1.1, V(30, 30, 46))

# ---------------------------------------------------------------- big cats
def bigcat(cv, kind, frame):
    cv.ink = 1.05; cv.cel = .25
    p = pose(frame, "walker"); mode = p["mode"]; ph = p["ph"]; sw = p["sway"]; b = p["b"]; tiger = kind in ("tiger", "stalker", "jaguar")
    if kind == "jaguar": body = V(22, 12.0, 11.0); legL = 10.5; legR = 4.2; bodyY = 29; fur = V(238, 184, 86); dark = V(64, 46, 40); pale = V(255, 240, 214); headR = V(14.2, 13.0, 13.4)
    elif kind == "stalker": body = V(24, 11.5, 10.5); legL = 12.5; legR = 4.0; bodyY = 33; fur = V(70, 64, 160); dark = V(70, 236, 220); pale = V(190, 170, 250); headR = V(14.0, 12.6, 13.0)
    elif tiger: body = V(23, 12.5, 11.5); legL = 11.5; legR = 4.4; bodyY = 31; fur = V(244, 148, 52); dark = V(46, 36, 44); pale = V(255, 244, 226); headR = V(14.5, 13.2, 13.6)
    else: body = V(15, 9.2, 8.6); legL = 8.4; legR = 3.2; bodyY = 23; fur = V(86, 78, 124); dark = V(52, 46, 84); pale = V(238, 232, 246); headR = V(13.2, 12.0, 12.4)
    pounce = mode == "act"
    pitch = (.10 * math.sin(ph)) if mode == "run" else ([.10, .30, .12, -.10][b] if pounce else 0)
    c0 = V(0, bodyY, 0); brot = rz(pitch)
    def BL(x, y, z=0): return c0 + brot @ V(x, y, z)
    fx, hx = body[0] * .58, -body[0] * .58; legs = []
    for lx, sgn, phs in ((fx, 1, 0.0), (hx, -1, .35), (fx, -1, .6), (hx, 1, .95)):
        front = lx > 0
        if mode == "run": f = ph + phs + (math.pi if not front else 0); th = .05 + .85 * math.sin(f); kn = .25 + 1.05 * max(0, math.cos(f + .5)) ** 1.4
        else: th, kn = [(.3, .9), (1.2, .5), (1.35, .15), (.9, .3)][b] if front else [(-.3, .9), (-.9, .2), (-1.25, .1), (-.6, .5)][b]
        if not front: kn = -kn * .7; th *= .9
        hj = BL(lx, -body[1] * .45, body[2] * .62 * sgn); knee = hj + legL * down(th); ank = knee + legL * down(th - kn); legs.append((hj, knee, ank, front))
    lowest = min(a[1] - legR * 1.3 for (_, _, a, _) in legs)
    dy = -lowest + (p["hop"] * 1.8 if mode == "run" else [0, 4, 16, 9][b])
    off = V(0, dy, 0); c0 = c0 + off
    for (hj, knee, ank, front) in legs:
        hj = hj + off; knee = knee + off; ank = ank + off
        cv.cone(hj, knee, legR * 1.4, legR, fur); cv.cone(knee, ank, legR, legR * .95, fur, pale, split=.55)
        if tiger: cv.ell(hj + (knee - hj) * .6, (legR * 1.2, 1.2, legR * 1.2), dark)
        cv.ell(ank + V(1.6, -.8, 0), (legR * 1.75, legR * 1.0, legR * 1.45), pale)
    def body_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        col += (pale - col) * (np.clip((-y - .22) * 3, 0, 1) * np.clip((x + .5) * 2, 0, 1))[:, None]
        wave = np.cos(x * (11 if tiger else 10) + 1.6 * np.sin(y * 3)); band = np.clip((wave - (.55 if tiger else .5)) * 6, 0, 1) * np.clip((y + .05) * 3, 0, 1)
        if kind == "jaguar":   # rosettes instead of stripes
            spot = np.cos(x * 15) * np.cos(y * 12 + 1.0 + z * 3); band = np.clip((spot - .38) * 7, 0, 1) * np.clip((y + .25) * 3, 0, 1) * (1 - np.clip((spot - .8) * 9, 0, 1) * .8)
        col += (dark - col) * (band * (.95 if tiger else .6))[:, None]
        return col, None
    cv.ell(c0, body, fur, rot=brot, shader=body_sh)
    tb = BL(-body[0] * .92, 3); up = 10 if pounce else 0
    tp = [tb, tb + V(-10, 3 + 2 * sw, 0), tb + V(-18, 10 + 4 * sw + up * .5, 0), tb + V(-19 + 3 * sw, 21 + 3 * sw + up, 0), tb + V(-13 + 5 * sw, 29 + up, 0)]
    rr = [3.6, 3.2, 3.0, 2.8, 2.6] if tiger else [3.0, 2.8, 2.6, 2.4, 2.3]
    for i in range(4): cv.cone(tp[i], tp[i + 1], rr[i], rr[i + 1], fur if (i % 2 == 0 or not tiger) else dark)
    cv.ell(tp[-1], rr[-1] * 1.15, dark if tiger else pale)
    hrot = ry(.55) @ rz(pitch * .4 - p["head"]); hd = BL(body[0] * (1.0 if tiger else 1.05), 9 if tiger else 9.5)
    def HL(x, y, z=0): return hd + hrot @ V(x, y, z)
    STALK.update(BL=BL, HL=HL)
    cv.cone(BL(body[0] * .55, 3), hd, body[1] * .82, body[1] * .78, fur)
    if not tiger:
        cv.ell(BL(body[0] * .80, 1.0), (5.6, 4.2, 8.6), ORANGE, rot=brot @ rz(-.5)); cv.ell(BL(body[0] * .92, -5.0), 2.9, GOLD, glow=.5)
    snarl = pounce and b >= 1
    def head_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        col += (pale - col) * (np.clip((x - .35) * 3, 0, 1) * np.clip((-y + .12) * 3, 0, 1))[:, None]
        if tiger:
            st = (np.cos(z * 13) > .55) & (y > .35) & (x > -.2) & (np.abs(z) < .7); col[st] = dark
            col[(np.abs(np.abs(z) - .78) < .07) & (np.abs(y + .05) < .3) & (x > 0)] = dark
        for side in (1, -1):
            az = .50 * side; e = V(math.cos(az) * .97, .12, math.sin(az) * .97); th_ = V(-math.sin(az), 0, math.cos(az)); du = q @ th_; dv = y - e[1]; front = (q @ e) > .5
            tl = dv - .28 * du * side
            eye = front & ((du / .25) ** 2 + (tl / .23) ** 2 < 1)
            col[front & ((du / .29) ** 2 + (tl / .27) ** 2 < 1)] = dark
            col[eye] = V(255, 220, 90) if tiger else V(170, 240, 120); col[eye & (np.abs(du - .02) < (.045 if not snarl else .03))] = V(24, 20, 30)
            col[eye & (((du + .08) / .05) ** 2 + ((tl - .08) / .06) ** 2 < 1)] = WHITE
            col[front & (tl > .12) & ((du / .30) ** 2 + (tl / .28) ** 2 < 1)] = dark
        col[(x > .88) & (np.abs(z) < .17) & (y < .02) & (y > -.16)] = V(255, 140, 160) if not tiger else dark
        if snarl:
            mo = (x > .5) & ((z / .34) ** 2 + ((y + .46) / .2) ** 2 < 1); col[mo] = V(150, 40, 56); col[mo & (y > -.36)] = WHITE; col[mo & (y < -.58)] = V(244, 128, 136)
        else: col[(x > .6) & (np.abs(y + .34 - .5 * np.abs(z)) < .03) & (np.abs(z) < .3)] = dark
        return col, None
    cv.ell(hd, headR, fur, rot=hrot, shader=head_sh)
    for sgn in (1, -1):
        cv.ell(HL(headR[0] * .55, -headR[1] * .34, headR[2] * .46 * sgn), (headR[0] * .34, headR[1] * .27, headR[2] * .34), pale, rot=hrot)
        a = HL(-2, headR[1] * .72, headR[2] * .62 * sgn)
        if tiger: cv.ell(a + hrot @ V(0, 2.5, 0), (3.2, 5.0, 4.6), fur, rot=hrot); cv.ell(a + hrot @ V(1.4, 2.5, 0), (2.0, 3.2, 3.0), dark, rot=hrot)
        else: cv.cone(a, a + hrot @ V(-1.5, 11, 2.4 * sgn), 5.0, .7, fur); cv.cone(a + hrot @ V(1.6, 1, 0), a + hrot @ V(.6, 8.5, 2.0 * sgn), 2.8, .5, V(255, 150, 170))
    if snarl:
        for sgn in (1, -1): a = HL(headR[0] * .86, -headR[1] * .30, 3.6 * sgn); cv.cone(a, a + hrot @ V(.5, -4.6, 0), 1.5, .3, WHITE)

# ---------------------------------------------------------------- primates
def stalker(cv, outfit, frame):
    """The relay stalker: the big-cat frame in alien colours, with glowing back fins and antennae."""
    bigcat(cv, "stalker", frame)
    p = pose(frame, "walker"); sw = p["sway"]; teal = V(70, 236, 220); st = STALK
    for i, (x, h) in enumerate(((-14, 7), (-6, 9.5), (2, 10.5), (10, 8.5))):
        a = st["BL"](x, 10.5); cv.cone(a, a + V(-3.5, h + sw, 0), 3.2, .6, teal, flat=.4, glow=.55)
    for sgn in (1, -1):
        a = st["HL"](-2, 11, 5.5 * sgn); m = a + V(-5, 9, 2 * sgn); e = m + V(-7 + 2 * sw, 5 + 2 * sw, 1.5 * sgn)
        cv.cone(a, m, 1.3, 1.0, V(70, 64, 160)); cv.cone(m, e, 1.0, .7, V(70, 64, 160)); cv.ell(e, 2.4, teal, glow=.8)
STALK = {}
def primate(cv, kind, frame):
    cv.ink = 1.05; cv.cel = .25
    p = pose(frame, "walker"); mode = p["mode"]; ph = p["ph"]; b = p["b"]; ape = kind == "ape"
    fur = V(176, 92, 44) if ape else V(176, 174, 166); dark = V(112, 56, 40) if ape else V(110, 108, 110); facec = V(124, 78, 62) if ape else V(52, 44, 54); pale = V(238, 170, 110) if ape else V(246, 236, 214)
    def head(hd, hrot, R, snarl):
        def sh(q, col):
            col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
            mask = (x > .28) & ((z / .68) ** 2 + ((y + .06) / .66) ** 2 < 1); col[mask] = facec
            if not ape:
                ruff = (x > .1) & ((z / .82) ** 2 + ((y + .06) / .8) ** 2 < 1) & ~mask; col[ruff] = pale
            for side in (1, -1):
                az = .34 * side; e = V(math.cos(az) * .98, .12, math.sin(az) * .98); th_ = V(-math.sin(az), 0, math.cos(az)); du = q @ th_; dv = y - e[1]; front = (q @ e) > .5
                eye = front & ((du / .15) ** 2 + (dv / .19) ** 2 < 1); col[eye] = V(255, 236, 170)
                col[eye & ((du - .02) ** 2 / .08 ** 2 + dv ** 2 / .11 ** 2 < 1)] = V(30, 22, 28); col[eye & (((du + .04) / .04) ** 2 + ((dv - .07) / .05) ** 2 < 1)] = WHITE
                col[front & (np.abs(dv - .24 + .5 * du * side) < .04) & (np.abs(du) < .2)] = V(30, 22, 28)
            if snarl:
                mo = (x > .5) & ((z / .3) ** 2 + ((y + .46) / .17) ** 2 < 1); col[mo] = V(150, 40, 56); col[mo & (y > -.38)] = WHITE
            else: col[(x > .6) & (np.abs(y + .42 + .5 * z * z) < .03) & (np.abs(z) < .26)] = V(30, 22, 28)
            return col, None
        cv.ell(hd, R, fur, rot=hrot, shader=sh)
        cv.ell(hd + hrot @ V(R[0] * .62, -R[1] * .30, 0), (R[0] * .5, R[1] * .36, R[2] * .52), pale if ape else facec, rot=hrot)
        for sgn in (1, -1): cv.ell(hd + hrot @ V(-1.5, 1, R[2] * .95 * sgn), (2.4, 4.2, 2.6), facec, rot=hrot)
    if ape:   # knuckle-walking thrower
        lean = .62 if mode == "run" else [.3, .05, .7, .5][b]; u = V(math.sin(lean), math.cos(lean), 0); hip = V(-6, 20, 0); legs = []
        for i, sgn in enumerate((1, -1)):
            th, kn = p["legs"][i]; th *= .55; kn *= .6
            hj = hip + V(0, -1, 6.5 * sgn); knee = hj + 8.5 * down(th + .25); ank = knee + 8.5 * down(th - kn - .2); legs.append((hj, knee, ank))
        dy = -min(a[1] - 3.4 for (_, _, a) in legs) + p["hop"] * .5; off = V(0, dy, 0); hip = hip + off
        for (hj, knee, ank) in legs:
            cv.cone(hj + off, knee + off, 5.8, 4.6, fur); cv.cone(knee + off, ank + off, 4.6, 3.8, fur); cv.ell(ank + off + V(2.6, -1.0, 0), (7.0, 3.2, 4.6), dark)
        chest = hip + u * 15; neck = hip + u * 27
        cv.ell(hip + u * 2, (11.5, 9.5, 12), fur, rot=rz(-lean))
        cv.ell(chest, (13.5, 15.5, 14.0), fur, rot=rz(-lean), shader=lambda q, col: (col + (pale - col) * (np.clip((q[:, 0] - .35) * 2.5, 0, 1) * np.clip(.6 - np.abs(q[:, 1]), 0, 1) * .8)[:, None], None))
        for i, sgn in enumerate((1, -1)):
            sh = hip + u * 24 + V(0, 0, 13.5 * sgn)
            if mode == "run": th = .55 + .6 * math.sin(ph + (0 if i else math.pi)); el = .25
            else: th, el = ([(-.8, .9), (-2.5, .6), (2.2, .2), (1.2, .3)][b]) if i == 0 else (.7, .3)
            elb = sh + 15 * down(th, .12 * sgn); hand = elb + 15 * down(th + el)
            cv.ell(sh, 6.4, fur); cv.cone(sh, elb, 5.4, 4.6, fur); cv.cone(elb, hand, 4.6, 4.0, fur); cv.ell(hand + 1.5 * down(th + el), 5.0, dark)
            if i == 0 and mode == "act" and b < 2: cv.ell(hand + 6.5 * down(th + el), 5.2, V(120, 190, 70)); cv.ell(hand + 6.5 * down(th + el) + V(0, 4.6, 0), 1.6, BROWN)
        hd = neck + V(7 + 4 * math.sin(lean), 7, 0); hrot = ry(.55) @ rz(-.1 - p["head"])
        head(hd, hrot, V(13.5, 13.0, 13.0), mode == "act" and b >= 2)
        cv.ell(hd + hrot @ V(-2, 11.5, 0), (7.5, 4.0, 7.0), fur, rot=hrot)
    else:     # langur hanging from a rope: the gripping hand stays at a fixed point
        grip = V(-6, 98, 0)
        sway = (.42 * math.sin(ph)) if mode == "run" else [.2, -.3, .55, .3][b]
        a_dir = down(math.pi - sway * .6); sh = grip - 26 * a_dir * -1
        sh = grip + 26 * down(sway * .6)
        brot = rz(sway * .9 + .25); c0 = sh + brot @ V(4, -12, 0)
        def BL(x, y, z=0): return c0 + brot @ V(x, y, z)
        tb = BL(-6, -11); t_sw = math.sin(ph - .9) if mode == "run" else .4
        tp = [tb, tb + V(-9 - 3 * t_sw, -9, 0), tb + V(-15 - 6 * t_sw, -21, 0), tb + V(-13 - 8 * t_sw, -33, 0), tb + V(-6 - 8 * t_sw, -39, 0), tb + V(0 - 7 * t_sw, -36, 0)]
        chain(cv, tp, [3.2, 3.0, 2.8, 2.6, 2.4, 2.4], fur); cv.ell(tp[-1], 3.2, dark)
        for i, sgn in enumerate((1, -1)):
            th = 1.25 + .25 * math.sin(ph + i * 2) if mode == "run" else [1.2, 1.6, .5, .9][b]; kn = 1.5 if mode == "run" else [1.5, 1.7, .5, 1.0][b]
            hj = BL(-2, -11, 6 * sgn); knee = hj + 11 * down(th + sway); ank = knee + 11 * down(th + sway - kn)
            cv.cone(hj, knee, 5.0, 3.8, fur); cv.cone(knee, ank, 3.8, 3.2, fur); cv.ell(ank + V(1.5, -1.5, 0), (5.4, 2.8, 3.6), facec)
        cv.ell(c0, (10.5, 15, 10.5), fur, rot=brot, shader=lambda q, col: (col + (pale - col) * (np.clip((q[:, 0] - .3) * 2.5, 0, 1) * .85)[:, None], None))
        sh2 = BL(-2, 11, 9.5); elb = sh2 + (grip + V(0, 0, 4) - sh2) * .5 + V(-3, 0, 0)
        cv.ell(sh2, 5.2, fur); cv.cone(sh2, elb, 4.2, 3.6, fur); cv.cone(elb, grip + V(0, -2, 3), 3.6, 3.2, fur); cv.ell(grip + V(0, -1, 3), 4.4, facec)
        sh3 = BL(3, 10, -9.5); th = .9 + .3 * math.sin(ph) if mode == "run" else [.6, -.4, 1.5, 1.2][b]
        e3 = sh3 + 12 * down(th + sway); h3 = e3 + 12 * down(th + sway + .5)
        cv.cone(sh3, e3, 4.2, 3.6, fur); cv.cone(e3, h3, 3.6, 3.2, fur); cv.ell(h3, 4.4, facec)
        hd = BL(6, 24); hrot = ry(.6) @ rz(-sway * .5 - .15)
        head(hd, hrot, V(11.5, 11.0, 11.0), mode == "act" and b >= 2)

def inked(fn, ink=1.0):
    def run(cv, o, f):
        cv.ink = ink; fn(cv, o, f)
    return run
JOBS = {
    "boy": lambda cv, o, f: toonkid(cv, "boy", o, f), "girl": lambda cv, o, f: toonkid(cv, "girl", o, f),
    "dino": lambda cv, o, f: slim_dino(cv, o, f),
    "bot": inked(lambda cv, o, f: B.robot(cv, o, f)), "pixel": inked(B2.JOBS["pixel"], .8), "calf": inked(B2.JOBS["calf"]), "horse": inked(B2.JOBS["horse"]),
    "ghost": inked(B2.JOBS["ghost"], .9), "hatch": inked(B2.JOBS["hatch"]), "red": inked(B2.JOBS["red"]), "tower": inked(B2.JOBS["tower"]),
    "tiger": lambda cv, o, f: bigcat(cv, "tiger", f), "cat": lambda cv, o, f: bigcat(cv, "cat", f),
    "ape": lambda cv, o, f: primate(cv, "ape", f), "langur": lambda cv, o, f: primate(cv, "langur", f),
}
def sheet(kind, outfit):
    atlas = Image.new("RGBA", (B.OW * 4, B.OH * 4))
    for f in range(16):
        cv = Canvas(); JOBS[kind](cv, outfit, f); atlas.paste(cv.image(), (f % 4 * B.OW, f // 4 * B.OH))
    return atlas
if __name__ == "__main__":
    out = sys.argv[1]
    for j in sys.argv[2:]:
        kind, outfit = (j.split("/") + ["plain"])[:2]
        sheet(kind, outfit).save(f"{out}/{kind}_{outfit}.webp", quality=int(B.os.environ.get("BAKE_Q", 90)), method=6); print(j, "ok", flush=True)
