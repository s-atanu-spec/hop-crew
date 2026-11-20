"""Style samples: two toon directions for the kids and a slimmer, more detailed dino."""
import sys, math
import numpy as np
from PIL import Image
import bake as B, bake2 as B2
from bake import Canvas, V, rz, ry, rx, down, pose, face, hair_cut, CW, CH
from bake import GREEN, GREEN_D, SKIN, SKIN_D, HAIR, WHITE, CREAM, NAVY, PLUM, RED, PINK, GOLD, DARK, ORANGE
from bake2 import chain

STYLES = {
 "A": dict(hipY=15.5, thigh=6.4, shin=6.8, legr=(3.3, 3.0), shoe=V(9.6, 5.6, 6.4), torso=V(9.4, 10.0, 10.0), chestUp=8.5, neckUp=17.5, headUp=16.5, R=V(21.0, 19.4, 19.8),
           shUp=15.5, shz=10.8, arm=(7.0, 6.8), armr=3.0, hand=5.8, eye=1.62, az=.43, lean=1.6, swing=1.15, cel=.75, ink=1.25),
 "B": dict(hipY=27.0, thigh=11.5, shin=12.0, legr=(4.5, 3.4), shoe=V(7.8, 4.2, 4.7), torso=V(8.8, 12.0, 9.6), chestUp=11.0, neckUp=22.0, headUp=12.6, R=V(15.4, 14.8, 14.8),
           shUp=19.0, shz=10.4, arm=(9.6, 9.0), armr=3.4, hand=4.1, eye=1.28, az=.44, lean=1.35, swing=1.1, cel=.0, ink=.8),
}
def toon(cv, gender, style, frame):
    P = STYLES[style]; cv.cel = P["cel"]; cv.ink = P["ink"]
    p = pose(frame); girl = gender == "girl"; mode = p["mode"]
    L = p["lean"] * P["lean"] * .8; u = V(math.sin(L), math.cos(L), 0)
    top = GREEN; legcol = PLUM if girl else SKIN; shorts = PLUM if girl else NAVY; sole = PINK if girl else RED
    hipY = P["hipY"] - (P["hipY"] * .5 if p["hipdrop"] else 0); hip = V(0, hipY, 0); legs = []
    for i, sgn in enumerate((1, -1)):
        th, kn = p["legs"][i]; th *= .95 * P["swing"]; kn *= .9
        hj = hip + V(0, -2, 5.2 * sgn); knee = hj + P["thigh"] * down(th); ank = knee + P["shin"] * down(th - kn)
        fa = (th - kn + .25) if mode in ("run", "jump") else (.5 if (mode == "slide" and i == 0) else 0)
        legs.append((hj, knee, ank, fa))
    sh_h = P["shoe"][1] * 1.25
    lowest = min(a[1] - sh_h for (_, _, a, _) in legs)
    dy = -lowest + (p["hop"] * 1.5 if mode == "run" else p["lift"])
    if mode == "slide": dy = -min(lowest, hipY - P["torso"][1])
    off = V(0, dy, 0); hip = hip + off; trot = rz(-L)
    chest = hip + u * P["chestUp"]; neck = hip + u * P["neckUp"]
    hd = neck + V(1.2 + 4 * math.sin(max(L, 0)), P["headUp"], 0)
    if mode == "slide": hd = neck + V(4.5, P["headUp"] * .9, 0)
    R = P["R"]; hrot = ry(.62) @ rz(-p["head"] * 1.5)
    def HL(x, y, z): return hd + hrot @ V(x, y, z)
    sw = p["sway"]; r1, r2 = P["legr"]; S = P["shoe"]
    for (hj, knee, ank, fa) in legs:
        hj = hj + off; knee = knee + off; ank = ank + off
        cv.cone(hj, knee, r1 * 1.12, r1, shorts if not girl else GREEN, legcol, split=.6)
        cv.cone(knee, ank, r1, r2, legcol, WHITE if legcol is SKIN else None, split=.6)
        fr = rz(fa * .9); fc = ank + fr @ V(S[0] * .32, -S[1] * .35, 0)
        cv.ell(fc + fr @ V(0, -S[1] * .64, 0), (S[0] * 1.05, S[1] * .4, S[2] * 1.04), sole, rot=fr)
        cv.ell(fc, S, WHITE, rot=fr); cv.ell(fc + fr @ V(S[0] * .54, .5, 0), S * V(.48, .66, .86), sole, rot=fr)
    T = P["torso"]
    cv.ell(hip + u * 1.0, T * V(.93, .55, .93), shorts, rot=trot)
    if girl: cv.frustum(hip + u * (T[1] * .45), hip + V(-1.0 * sw - 1.2, -T[1] * .62, 0), T[0] * 1.0, T[0] * 1.5, GREEN, WHITE, split=.84, flat=.92)
    def torso_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]; zz = z - .12
        if girl:
            hx = zz / .30; hy = (y - .05) / .30; col[(x > 0) & ((hx * hx + hy * hy - .5) ** 3 - hx * hx * hy ** 3 < 0)] = WHITE
        else:
            col[(x > .2) & (y > -.66) & (y < -.2) & (np.abs(zz) < .6)] = GREEN_D
            col[(x > 0) & (y > .2) & (y < .7) & (np.abs(np.abs(zz) - .16) < .04)] = WHITE
        return col, None
    if not girl: cv.ell(neck + trot @ V(-T[0] * .62, -1.5, 0), T * V(.72, .56, .9), GREEN_D, rot=trot)
    cv.ell(chest, T, top, rot=trot @ ry(.25), shader=torso_sh)
    cv.cone(neck - u * 2.5, neck + u * 3.0, P["armr"] * 1.25, P["armr"] * 1.2, SKIN_D)
    for i, sgn in enumerate((1, -1)):
        th, el = p["arms"][i]; th *= P["swing"]
        sh = hip + u * P["shUp"] + V(0, 0, P["shz"] * sgn); spl = p["splay"] * sgn
        elb = sh + P["arm"][0] * down(th, spl * .6); hand = elb + P["arm"][1] * down(th + el, spl * .2); ar = P["armr"]
        cv.ell(sh, ar * 1.3, top)
        if girl: cv.cone(sh, elb, ar * 1.15, ar, top, SKIN, split=.5); cv.cone(elb, hand, ar, ar * .94, SKIN)
        else: cv.cone(sh, elb, ar * 1.2, ar * 1.1, top); cv.cone(elb, hand, ar * 1.1, ar * 1.05, top, GREEN_D, split=.8)
        cv.ell(hand + P["hand"] * .4 * down(th + el), P["hand"], SKIN)
    for sgn in (1, -1): cv.ell(HL(-1.0, -1.5, R[2] * .97 * sgn), (R[0] * .15, R[1] * .23, R[2] * .14), SKIN_D, rot=hrot)
    mouth = "open" if mode in ("jump", "cheer", "slide") or (mode == "run" and style == "A") else p["mouth"]
    cv.ell(hd, R, SKIN, rot=hrot, shader=face(gender, mouth, p["blink"], az0=P["az"], big=P["eye"]))
    cv.ell(HL(R[0] * .99, -R[1] * .17, 0), R[0] * .1, SKIN_D)
    cv.ell(hd + hrot @ V(-1.0, 1.2, 0), R * V(1.07, 1.07, 1.06), HAIR, rot=hrot, shader=hair_cut(girl, None))
    k = R[0] / 18.4
    if girl:
        for zz, yy, rr in ((-11.0, 10.6, 6.6), (-3.8, 11.8, 7.2), (3.8, 11.8, 7.2), (11.0, 10.6, 6.6)):
            cv.ell(HL(R[0] * .70, yy * k, zz * k), V(5.6, rr * .86, rr) * k, HAIR, rot=hrot)
        for sgn in (1, -1):
            a = HL(-R[0] * .22, R[1] * .30, R[2] * 1.0 * sgn)
            b = a + V(-8.0 - 4.5 * sw, -13.0 + 2.4 * abs(sw) + (9 if mode == "jump" else 0), 3.5 * sgn) * k
            cv.ell(a + V(-1, 0, 2.0 * sgn), 7.2 * k, HAIR); cv.cone(a, b, 6.4 * k, 4.0 * k, HAIR); cv.ell(b, 4.6 * k, HAIR); cv.ell(a + (b - a) * .30, 4.4 * k, PINK)
    else:
        for zz, yy, rr, xx in ((-10.0, 11.4, 6.4, .70), (-2.6, 13.0, 7.2, .73), (5.6, 12.4, 6.8, .71), (12.0, 9.6, 5.2, .58)):
            cv.ell(HL(R[0] * xx, yy * k, zz * k), V(5.6, rr * .8, rr) * k, HAIR, rot=hrot @ rx(.25))
        for j, (bx, by, bz) in enumerate(((.10, 1.0, -3.5), (.40, .98, 2.5), (-.20, 1.02, 3.5))):
            a = HL(R[0] * bx, R[1] * (by - .1), bz); cv.cone(a, a + hrot @ (V(5.0 + 1.6 * j, 7.0 - j + .8 * sw, 0) * k), 4.8 * k, 1.4 * k, HAIR)

def slim_dino(cv, frame):
    """Leaner body, longer legs and neck, with scales, belly bands, plates and claws picked out."""
    p = pose(frame); mode = p["mode"]; sw = p["sway"]; skin = GREEN; dark = GREEN_D; cream = V(246, 220, 140); lite = V(150, 214, 92)
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
        back = np.clip((y - .05) * 3, 0, 1)
        scale = (np.cos(x * 26 + np.round(y * 9) * 1.57) * np.cos(y * 28)) > .35
        col += (dark - col) * (back * scale * .55)[:, None]
        spot = np.clip((np.cos(x * 8.0 + 1.0) - .55) * 4, 0, 1) * np.clip((y - .3) * 4, 0, 1) * .5
        col += (lite - col) * spot[:, None]
        return col, None
    cv.ell(BL(6, 8), (17.5, 12.0, 11.0), skin, rot=brot, shader=body_sh)
    for i, (x, y, h) in enumerate([(-31, 12.5, 3.0), (-22, 14.5, 4.2), (-13, 17.5, 5.4), (-4, 20, 6.4), (5, 21, 6.6), (13, 20.5, 5.4)]):
        a = BL(x, y - 2); cv.cone(a, BL(x - 2.5, y + h * 1.5), 3.4, .7, V(255, 170, 70), flat=.45)
    for i, sgn in enumerate((1, -1)):
        th = p["arms"][i][0] * .4 + .9
        if mode in ("cheer", "jump"): th = 2.1 + .3 * i
        sh = BL(18, 5, 8.6 * sgn); elb = sh + 6.6 * down(th, .2 * sgn); hand = elb + 5.6 * down(th + .9)
        cv.cone(sh, elb, 2.9, 2.3, skin); cv.cone(elb, hand, 2.3, 1.9, skin)
        for t in (-1, 0, 1): cv.cone(hand, hand + V(2.4, -1.2, 1.3 * t), 1.0, .3, WHITE)
    nb = BL(19, 12); hd = BL(32, 34)
    if mode == "slide": hd = BL(40, 20)
    cv.cone(nb, hd + V(-4, -6, 0), 9.0, 7.6, skin)
    hk = 1.0; hrot = ry(.34) @ rz(.04 - p["head"] + (.18 if mode == "cheer" else 0))
    def HL(x, y, z=0): return hd + hrot @ (V(x, y, z) * hk)
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
            else:
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
    for x, y, h in ((-7, 9.5, 5.5), (-1, 11, 5)): cv.cone(HL(x, y), HL(x - 2.5, y + h), 2.8, .6, V(255, 170, 70), flat=.45)

def cell(fn, f):
    cv = Canvas(); fn(cv, f); return cv.image()
if __name__ == "__main__":
    frames = [10, 2, 5, 12, 13]; z = 1.3; W = int(CW * z); H = int(CH * z)
    rows = [("Current boy", lambda cv, f: B2.kid(cv, "boy", "street", f)), ("Toon A boy", lambda cv, f: toon(cv, "boy", "A", f)), ("Toon B boy", lambda cv, f: toon(cv, "boy", "B", f)),
            ("Toon A girl", lambda cv, f: toon(cv, "girl", "A", f)), ("Toon B girl", lambda cv, f: toon(cv, "girl", "B", f)),
            ("Current dino", lambda cv, f: B2.dino(cv, "green", "plain", f)), ("Slim dino", slim_dino)]
    pick = sys.argv[2:] or [r[0] for r in rows]; rows = [r for r in rows if r[0] in pick]
    im = Image.new("RGBA", (W * len(frames), H * len(rows)), (168, 176, 160, 255))
    for r, (name, fn) in enumerate(rows):
        for c, f in enumerate(frames): im.alpha_composite(cell(fn, f).resize((W, H), Image.LANCZOS), (c * W, r * H))
        print(name, flush=True)
    im.convert("RGB").save(sys.argv[1])
