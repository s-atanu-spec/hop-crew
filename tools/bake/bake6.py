"""v22 art pass: townsfolk, toon snakes, golden hatchling, and sharp close-up strips.
Usage: BAKE_SS=6 BAKE_OUT=<1.5|2|3> python3 bake6.py <out dir> <mode> name ...
  mode sheet : full 4x4 sheet           (name: boy/street, hatch, cobra, anaconda, red ...)
  mode front : 4-frame front portrait   (idle, blink, cheer A, cheer B)
  mode close : 4-frame side close-up    (idle, jump, cheer A, cheer B)
  mode npc   : 4-frame townsperson      (idle, blink, cheer A, cheer B), three-quarter view"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import bake as B, bake2 as B2, bake4 as B4
from bake import V, rz, ry, rx
from PIL import Image
FRONT = B.YAW + .42
GREY = V(206, 204, 210)
# name: (gender, base outfit, colours, hair, skin)
NPCS = {
    "potter":   ("boy", "festival", dict(top=V(196, 104, 70), trim=V(250, 226, 170), shorts=V(246, 226, 190), legcol=V(246, 226, 190)), GREY, None),
    "florist":  ("girl", "tropic", dict(top=V(246, 120, 160), shorts=V(250, 244, 230)), None, None),
    "picker":   ("girl", "stripe", dict(top=V(64, 160, 96), shorts=V(120, 76, 50)), None, V(204, 140, 100)),
    "leader":   ("boy", "festival", dict(top=V(214, 56, 60), trim=V(250, 196, 70), shorts=V(52, 62, 118), legcol=V(52, 62, 118), shoe=V(48, 46, 62)), None, None),
    "mechanic": ("boy", "street", dict(top=V(60, 116, 206), shorts=V(48, 46, 62), shoe=V(255, 146, 58)), None, V(204, 140, 100)),
    "islander": ("boy", "sport", dict(top=V(250, 200, 60), shorts=V(36, 170, 176)), None, V(190, 124, 86)),
    "cook":     ("boy", "explorer", dict(top=V(250, 246, 238), shorts=V(52, 62, 118)), None, None),
    "elder":    ("girl", "star", dict(top=V(150, 96, 200), shorts=V(246, 226, 190)), GREY, None),
}
def npc(cv, name, frame):
    gender, outfit, cols, hair, skin = NPCS[name]
    keep = (B4.HAIR, B4.SKIN, B4.SKIN_D)
    try:
        B4.OVERRIDE.clear(); B4.OVERRIDE.update(cols)
        if hair is not None: B4.HAIR = hair
        if skin is not None: B4.SKIN = skin; B4.SKIN_D = skin * .86
        B4.toonkid(cv, gender, outfit, frame)
    finally:
        B4.OVERRIDE.clear(); B4.HAIR, B4.SKIN, B4.SKIN_D = keep
# Side-event crowds and helpers during a run, in the same toon style. Walker layout: 0-11 walk, 12-15 throw.
CROWD = {
    "desert":  ("boy", "explorer", dict(top=V(226, 170, 90), shorts=V(246, 226, 190)), None, V(204, 140, 100), None),
    "drummer": ("boy", "festival", dict(top=V(214, 56, 60), trim=V(250, 196, 70), shorts=V(246, 226, 190), legcol=V(246, 226, 190)), None, None, "drum"),
    "spool":   ("girl", "stripe", dict(top=V(250, 112, 100), shorts=V(52, 62, 118)), None, None, None),
    "builder": ("boy", "street", dict(top=V(250, 184, 60), shorts=V(52, 62, 118), shoe=V(150, 96, 62)), None, V(204, 140, 100), None),
    "racer":   ("boy", "sport", dict(top=V(255, 92, 184), shorts=V(48, 46, 62), shoe=V(110, 236, 255)), None, None, None),
    "florist": ("girl", "tropic", dict(top=V(246, 120, 160), shorts=V(250, 244, 230)), None, None, None),
    "keeper":  ("girl", "star", dict(top=V(60, 170, 180), shorts=V(246, 226, 190)), None, V(204, 140, 100), None),
    "mask":    ("boy", "festival", dict(top=V(150, 92, 204), trim=V(250, 196, 70), shorts=V(255, 146, 58), legcol=V(255, 146, 58)), None, None, None),
    "crew":    ("boy", "sport", dict(top=V(255, 142, 52), shorts=V(48, 46, 62)), None, V(190, 124, 86), None),
    "kolkata": ("boy", "festival", dict(top=V(250, 246, 238), trim=V(232, 78, 70), shorts=V(250, 246, 238), legcol=V(250, 246, 238)), None, None, None),
    "bandit":  ("boy", "street", dict(top=V(72, 72, 100), shorts=V(48, 46, 62), shoe=V(48, 46, 62)), None, V(204, 140, 100), None),
    "tower":   ("boy", "festival", dict(top=V(52, 62, 130), trim=V(250, 196, 70), shorts=V(52, 62, 130), legcol=V(52, 62, 130), shoe=V(120, 76, 50)), V(214, 212, 220), None, "lantern"),
}
def crowd(cv, name, frame):
    gender, outfit, cols, hair, skin, prop = CROWD[name]; keep = (B4.HAIR, B4.SKIN, B4.SKIN_D)
    try:
        B4.OVERRIDE.clear(); B4.OVERRIDE.update(cols)
        if hair is not None: B4.HAIR = hair
        if skin is not None: B4.SKIN = skin; B4.SKIN_D = skin * .86
        B4.toonkid(cv, gender, outfit, frame, "walker")
    finally:
        B4.OVERRIDE.clear(); B4.HAIR, B4.SKIN, B4.SKIN_D = keep
    if prop == "lantern":   # the clock-tower keeper's lantern, held out in front
        c = V(15, 27 + .8 * math.sin(frame * .52), 5); cv.cone(c + V(0, 6, 0), c + V(-3, 11, -1), .7, .7, V(120, 76, 50)); cv.ell(c + V(0, 5.6, 0), (3.0, 1.2, 3.0), V(232, 176, 78)); cv.ell(c, (3.4, 4.6, 3.4), V(255, 226, 120), glow=.9); cv.ell(c + V(0, -4.6, 0), (3.0, 1.2, 3.0), V(232, 176, 78))
    if prop == "drum":
        c = V(12, 25, 0); cv.ell(c, (6.5, 8.0, 8.0), V(196, 104, 70), rot=rz(.25)); cv.ell(c + V(5.4, 1.4, 0), (1.6, 7.0, 7.0), V(252, 240, 214), rot=rz(.25)); cv.ell(c + V(-5.4, -1.4, 0), (1.6, 7.0, 7.0), V(252, 240, 214), rot=rz(.25))
def pixel(cv, outfit, frame):
    """Pixel Kid as a toon kid: an 8-bit checker shirt, cyan visor glasses and headband. The boosted form is all gold."""
    gold = outfit == "up"; keep = (B4.HAIR,)
    try:
        B4.OVERRIDE.clear()
        B4.OVERRIDE.update(dict(top=V(255, 206, 70), trim=V(255, 255, 255), shorts=V(232, 160, 40), shoe=V(255, 250, 230)) if gold else dict(top=V(60, 132, 236), trim=V(255, 96, 120), shorts=V(232, 78, 70), shoe=V(250, 246, 238)))
        if gold: B4.HAIR = V(255, 222, 110)
        B4.toonkid(cv, "boy", "pixel", frame)
    finally:
        B4.OVERRIDE.clear(); (B4.HAIR,) = keep
def ray(cv, outfit, frame):
    """A luminous ray gliding above the tide pools."""
    cv.cel = .3; cv.ink = 1.0; cv = Moved(cv, V(0, 24, 0))
    ph = frame / 12 * 2 * math.pi; flap = math.sin(ph); body = V(120, 220, 240); deep = V(110, 96, 220); glowc = V(200, 255, 250)
    brot = rz(.06 * math.sin(ph + 1))
    for sgn in (-1, 1):
        a = flap * .75; d = V(-.2, math.sin(a), math.cos(a) * sgn); d = d / np.linalg.norm(d); chord = V(1, 0, 0) - d * d[0]; chord = chord / np.linalg.norm(chord)
        rot = np.stack([chord, np.cross(d, chord), d], axis=1); sh = V(0, 1, 5 * sgn)
        cv.ell(sh + d * 11, (13, 1.9, 13), deep if sgn < 0 else body, rot=rot); cv.cone(sh + d * 20 + chord * 2, sh + d * 29 - chord * 5, 4.0, .6, deep, flat=.4)
        if sgn > 0:
            for k in range(3): cv.ell(sh + d * (7 + k * 6) + chord * (3 - k * 2) + np.cross(d, chord) * 1.6, 1.5, glowc, glow=.8)
    cv.ell(V(0, 1, 0), (17, 4.6, 9), body, rot=brot)
    tail = [V(-15, 1, 0), V(-26, 1 + 2 * flap, 0), V(-37, 0 - 2 * flap, 0), V(-46, 2 * flap, 0)]; B2.chain(cv, tail, [2.6, 1.7, 1.0, .4], deep)
    for sgn in (1, -1):
        cv.cone(V(14, 0, 4.5 * sgn), V(22, -2.5, 6.5 * sgn), 2.6, 1.0, body); eye(cv, V(11.5, 3.6, 5.2 * sgn), rz(0), 2.2, sgn, V(40, 40, 90))
def car(cv, outfit, frame):
    """The neon interceptor: 0-11 driving with spinning wheels and a flashing light bar, 12-15 lunging. Outfit "wreck" is the crashed prop."""
    # outfit is "<kind>" or "<wreck kind>:<car style>", for example "taxi" or "wreck2:hatch"
    outfit, _, style = outfit.partition(":"); style = style or outfit
    cv.cel = .4; cv.ink = 1.15; wreck = outfit.startswith("wreck"); civil = style in ("taxi", "hatch", "van", "crewvan")
    if outfit == "wreck3": cv = Turned(cv, rz(math.pi) @ rz(-.06), V(4, 15, 0), V(0, 2 if style != "van" else 8, 0))      # on its roof
    lunge = frame >= 12 and not wreck and not civil; b = frame - 12; ph = frame / 12 * 2 * math.pi
    paint = V(124, 72, 210); deep = V(74, 44, 140); glass = V(44, 58, 110); cyan = V(110, 240, 255); pink = V(255, 96, 200)
    if wreck: paint = V(96, 74, 130); deep = V(60, 48, 86); glass = V(36, 40, 60); cyan = V(120, 150, 160); pink = V(150, 100, 130)
    if style == "taxi": paint = V(255, 200, 60); deep = V(214, 150, 40); cyan = V(40, 40, 56); pink = V(40, 40, 56)
    if style == "hatch": paint = V(70, 200, 190); deep = V(40, 140, 150); cyan = V(255, 255, 255); pink = V(255, 120, 170)
    if style == "van": paint = V(255, 120, 150); deep = V(200, 70, 110); cyan = V(255, 255, 255); pink = V(110, 240, 255)
    if style == "crewvan": paint = V(84, 96, 124); deep = V(52, 60, 84); cyan = V(255, 190, 80); pink = V(255, 190, 80)
    if wreck and civil: paint = paint * .86 + V(60, 56, 70) * .14; deep = deep * .86; glass = V(36, 40, 60)
    pitch = -.04 * math.sin(ph * 2) if not lunge else [-.05, -.14, -.2, -.08][b]; lift = .8 * abs(math.sin(ph * 2)) if not lunge else [0, 2, 4, 1][b]
    if wreck: pitch = {"wreck": .07, "wreck2": .30, "wreck3": 0}[outfit]; lift = {"wreck": -2.5, "wreck2": 7, "wreck3": 0}[outfit]
    rot = rz(pitch); c = V(4 + (0 if not lunge else [0, 4, 9, 4][b]), 13.5 + lift, 0)
    def BL(x, y, z=0): return c + rot @ V(x, y, z)
    for wx in (22, -20):
        for sgn in (-1, 1):
            w = V(c[0] + wx, 7.2, 12.5 * sgn); cv.ell(w, (7.4, 7.4, 3.8), V(34, 30, 46)); cv.ell(w + V(0, 0, 1.6 * sgn), (3.8, 3.8, 3.2), V(210, 214, 230))
            cv.ell(w + V(math.cos(-ph * 3) * 4.6, math.sin(-ph * 3) * 4.6, 2.4 * sgn), 1.3, cyan, glow=.7)
    def body_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        col += (deep - col) * np.clip((-y - .1) * 2.5, 0, 1)[:, None]; col[(np.abs(y - .12) < .09) & (np.abs(x) < .9)] = cyan; col[(np.abs(y + .12) < .05) & (np.abs(x) < .86)] = pink
        return col, None
    cv.ell(c, (37, 8.4, 14.5), paint, rot=rot, shader=body_sh)
    cv.ell(BL(13, 3.5), (22, 6.0, 13.4), paint, rot=rot @ rz(-.1))                      # long bonnet
    def cabin_sh(q, col):
        col = col.copy(); x, y = q[:, 0], q[:, 1]; col[(y > -.1) & (np.abs(x - .05) < .9)] = glass; col[(y > .15) & (np.abs(x - y * .5 + .1) < .07)] = cyan * .8; col[np.abs(x + .12) < .05] = paint
        return col, None
    cv.ell(BL(-5, 8.5), (17.5, 9.0, 12.2), paint, rot=rot, shader=cabin_sh)
    if not civil: cv.cone(BL(-30, 8), BL(-36, 13.5), 1.6, 1.2, deep); cv.ell(BL(-35, 14.5), (6.0, 1.3, 13.5), deep, rot=rot)      # spoiler
    if style in ("van", "crewvan"): cv.ell(BL(-12, 11), (22, 11, 13), paint, rot=rot, shader=cabin_sh)
    if civil:   # everyday cars get bumpers, wheel arches, a door line and a wing mirror
        for bx in (37.5, -34.5): cv.ell(BL(bx, -2.5), (3.4, 2.4, 13.6), V(150, 154, 170), rot=rot)
        for wx in (22, -20): cv.ell(BL(wx - 4, -4.5, 13.6), (9.6, 7.6, 1.6), deep, rot=rot, shader=lambda q, c: (c, q[:, 1] > 0))
        cv.box(BL(2, 0, 14.4), V(.5, 6.5, .4), deep, rot=rot); cv.ell(BL(12, 6.5, 14.6), (2.2, 1.6, 1.8), paint, rot=rot); cv.ell(BL(-2, 1.5, 14.6), (2.2, .7, .6), V(230, 232, 240), rot=rot)
    flash = frame % 2 == 0
    if civil and not wreck:
        if style == "taxi": cv.box(BL(-5, 18.4), V(4.5, 1.8, 3), V(255, 244, 170), rot=rot, glow=.8)
        for sgn in (1, -1): cv.ell(BL(39, 1.5, 8.5 * sgn), (2.2, 2.6, 3.4), V(255, 244, 170), glow=.9); cv.ell(BL(-36, 2.5, 9 * sgn), (1.6, 2.2, 3.2), V(255, 60, 90), glow=.8)
        return
    if wreck:   # dents and a wisp of smoke instead of lights
        for (dx, dy, dz, r) in ((18, 2, 13.6, 5.5), (-14, 1, 13.8, 4.5), (4, -3, 14.2, 4)): cv.ell(BL(dx, dy, dz), (r, r * .7, .9), deep * .78, rot=rot)      # shallow dents and scrapes
        for k in range(3): cv.cone(BL(-20 + k * 13, 4 - k, 14.4), BL(-12 + k * 13, 3 - k, 14.4), .45, .3, V(226, 228, 236))
        cv.ell(BL(24, 9.5), (13, 1.6, 12.5), paint, rot=rot @ rz(.55))                      # bonnet popped open
        for a in (-.5, .1, .7): cv.cone(BL(-2, 12, 11.8), BL(-2 + 7 * math.cos(a), 12 + 7 * math.sin(a), 12), .5, .3, V(200, 230, 240))   # cracked glass
        return
    cv.ell(BL(-5, 17.8), (6.5, 1.6, 9.5), V(40, 40, 60), rot=rot); cv.ell(BL(-5, 18.6, 5), (3.2, 2.0, 3.6), V(255, 70, 80), glow=.9 if flash else .1); cv.ell(BL(-5, 18.6, -5), (3.2, 2.0, 3.6), V(80, 150, 255), glow=.1 if flash else .9)
    for sgn in (1, -1):
        cv.ell(BL(39, 1.5, 8.5 * sgn), (2.2, 2.6, 3.4), V(255, 244, 170), glow=.9); cv.ell(BL(-36, 2.5, 9 * sgn), (1.6, 2.2, 3.2), V(255, 60, 90), glow=.8)
    cv.ell(BL(39.5, -2.5), (2.0, 2.2, 10.5), V(34, 30, 46), rot=rot)
class Turned:
    """Draws the same model rotated about a pivot, then shifted."""
    def __init__(s, cv, R, pivot, shift): s.cv = cv; s.R = R; s.p = pivot; s.d = shift
    def at(s, c): return s.R @ (np.asarray(c, float) - s.p) + s.p + s.d
    def ell(s, c, r, color, rot=None, **kw): return s.cv.ell(s.at(c), r, color, rot=s.R @ (rot if rot is not None else np.eye(3)), **kw)
    def cone(s, a, b, *x, **kw): return s.cv.cone(s.at(a), s.at(b), *x, **kw)
    def box(s, c, half, color, rot=None, **kw): return s.cv.box(s.at(c), half, color, rot=s.R @ (rot if rot is not None else np.eye(3)), **kw)
def little_rider(cv, seat, lean, shirt, helmet, leg_a, hands):
    """A small toon rider for the street traffic: round head, helmet, one arm to the handlebar, one leg to the pedal."""
    skin = V(226, 160, 116); hip = seat; chest = hip + V(2 + lean * 6, 9, 0); head = chest + V(2 + lean * 4, 13.5, 0)     # a big toon head, like the walkers
    foot = hip + V(4 + 5 * math.cos(leg_a), -11 + 3.5 * math.sin(leg_a), 3); knee = (hip + foot) / 2 + V(4, 2, 2)
    cv.cone(hip, knee, 3.0, 2.5, V(52, 62, 118)); cv.cone(knee, foot, 2.4, 2.0, V(52, 62, 118)); cv.ell(foot + V(1.5, -.6, 0), (3.4, 1.8, 2.2), V(250, 246, 238))
    cv.ell((hip + chest) / 2, (6.4, 8.2, 6.2), shirt, rot=rz(-lean * .6)); cv.cone(chest + V(0, 1, 4), hands, 2.5, 2.1, shirt); cv.ell(hands, 2.6, skin)
    cv.ell(head, 9.4, skin); cv.ell(head + V(-.8, 2.2, 0), (10.0, 8.8, 10.0), helmet, shader=lambda q, c: (c, q[:, 1] > -.15))
    cv.ell(head + V(6.6, .6, 3.6), 2.4, V(255, 252, 240)); cv.ell(head + V(7.6, .5, 4.2), 1.4, V(40, 30, 40)); cv.ell(head + V(8.6, -3.4, 0), (1.4, .8, 2.2), V(150, 60, 70))
def scooter(cv, outfit, frame):
    cv.cel = .4; cv.ink = 1.15; ph = frame / 4 * 2 * math.pi; bob = .6 * math.sin(ph); body = V(120, 230, 200); dark = V(44, 40, 52)
    for x in (-14, 15): cv.ell(V(x, 5.6, 0), (5.6, 5.6, 2.6), dark); cv.ell(V(x, 5.6, 1.6), (2.4, 2.4, 1.6), V(210, 214, 230)); cv.ell(V(x + 3.6 * math.cos(-ph), 5.6 + 3.6 * math.sin(-ph), 2.2), .9, V(110, 240, 255), glow=.7)
    c = V(0, 9 + bob, 0); cv.ell(c + V(-8, 3, 0), (11, 5.6, 5.4), body); cv.ell(c + V(2, -.5, 0), (9, 2.2, 4.6), body * .8); cv.cone(c + V(11, 0, 0), c + V(15, 19, 0), 3.4, 2.4, body, flat=.6)
    cv.ell(c + V(-9, 8.6, 0), (8, 2.2, 4.4), dark); cv.cone(c + V(15, 19, -5), c + V(15, 19, 5), 1.1, 1.1, dark); cv.ell(c + V(17.6, 14, 0), (1.6, 2.4, 2.6), V(255, 244, 170), glow=.9); cv.ell(c + V(-19, 6, 0), (1.4, 1.8, 2.4), V(255, 60, 90), glow=.8)
    little_rider(cv, c + V(-7, 11, 0), .1, V(255, 96, 150), V(110, 236, 255), -.6, c + V(14, 19, 4))
def bike(cv, outfit, frame):
    cv.cel = .4; cv.ink = 1.15; ph = frame / 4 * 2 * math.pi; frame_c = V(255, 120, 70); dark = V(44, 40, 52)
    spoke = lambda q, c: (c, (np.hypot(q[:, 0], q[:, 1]) > .78) | (np.cos(np.arctan2(q[:, 1], q[:, 0]) * 6 + ph * 2) > .93) | (np.hypot(q[:, 0], q[:, 1]) < .2))
    for x in (-15, 15): cv.ell(V(x, 9, 0), (9, 9, 1.3), dark, shader=spoke)
    bb = V(-1, 9, 0); seat = V(-6, 22, 0); bars = V(11, 24, 0)
    for (a, b2) in ((V(-15, 9, 0), bb), (bb, seat), (seat, V(-15, 9, 0)), (bb, V(9, 21, 0)), (seat + V(0, -2, 0), V(9, 21, 0)), (V(9, 21, 0), V(15, 9, 0)), (V(9, 21, 0), bars)): cv.cone(a, b2, 1.2, 1.2, frame_c)
    cv.ell(seat + V(-1, 1.2, 0), (4.2, 1.5, 2.6), dark); cv.cone(bars + V(0, 0, -4), bars + V(0, 0, 4), 1.0, 1.0, dark)
    pedal = bb + V(4.6 * math.cos(-ph), 4.6 * math.sin(-ph), 2.5); cv.cone(bb, pedal, .9, .9, dark)
    little_rider(cv, seat + V(0, 3, 0), .28, V(250, 200, 60), V(255, 96, 120), -ph, bars + V(0, 0, 3))
def beast4(frame): return frame * 3            # four evenly spaced steps of the twelve-step walk
def cow(cv, outfit, frame):
    cv.cel = .35; cv.ink = 1.1; white = V(250, 246, 238); brown = V(150, 96, 62)
    p, BL, brot, _, _ = four_legs(cv, beast4(frame), V(20, 12, 10.5), 8.6, 3.4, 27, white, V(70, 56, 56), stride=.45); sw = p["sway"]
    patch = lambda q, c: (np.where(((np.cos(q[:, 0] * 4.2 + 1) * np.cos(q[:, 1] * 3.6 + q[:, 2] * 2)) > .28)[:, None], brown, c), None)
    cv.ell(BL(0, 0), V(20, 12, 10.5), white, rot=brot, shader=patch); cv.ell(BL(-6, -10.5), (5, 3.4, 5), V(250, 170, 180))
    t0 = BL(-19, 6); cv.cone(t0, t0 + V(-4, -10 + 2 * sw, 0), 1.3, 1.0, white); cv.ell(t0 + V(-4, -12 + 2 * sw, 0), 2.2, brown)
    hd = BL(24, 5); cv.cone(BL(15, 4), hd, 7.5, 6.5, white); cv.ell(hd, (9, 8, 8), white, shader=patch); cv.ell(hd + V(7.5, -3, 0), (5.4, 4.6, 5.6), V(250, 170, 180))
    for sgn in (1, -1):
        cv.cone(hd + V(-2, 6.5, 4.5 * sgn), hd + V(1, 12, 7.5 * sgn), 1.6, .5, V(240, 226, 190)); cv.ell(hd + V(-5, 4, 8 * sgn), (2.2, 3.4, 4.2), brown); eye(cv, hd + V(4.6, 2.4, 6 * sgn), np.eye(3), 2.2, sgn, V(60, 40, 40))
        cv.ell(hd + V(11.6, -2.6, 2 * sgn), .8, V(120, 70, 80))
def goat(cv, outfit, frame):
    cv.cel = .35; cv.ink = 1.1; fur = V(214, 180, 130); dark = V(120, 86, 60)
    p, BL, brot, _, _ = four_legs(cv, beast4(frame), V(14, 8.5, 7.5), 7.4, 2.4, 21, fur, dark, stride=.6); sw = p["sway"]
    cv.ell(BL(0, 0), V(14, 8.5, 7.5), fur, rot=brot); cv.cone(BL(-13, 4), BL(-16, 9 + 2 * sw), 1.6, .8, fur)
    hd = BL(17, 8); cv.cone(BL(10, 3), hd, 5, 4.4, fur); cv.ell(hd, (6.5, 5.6, 5.6), fur); cv.ell(hd + V(5.5, -2, 0), (4, 3, 3.6), V(250, 236, 210)); cv.cone(hd + V(5, -5, 0), hd + V(4, -10, 0), 1.6, .4, V(250, 246, 238))
    for sgn in (1, -1): cv.cone(hd + V(-2, 4.5, 3 * sgn), hd + V(-7, 10, 4.5 * sgn), 1.4, .4, dark); cv.ell(hd + V(-3.5, 1, 6 * sgn), (1.8, 2.4, 3.2), dark); eye(cv, hd + V(3, 1.6, 4.2 * sgn), np.eye(3), 1.7, sgn, V(60, 40, 40))
def dog(cv, outfit, frame):
    cv.cel = .35; cv.ink = 1.1; fur = V(196, 130, 76); pale = V(250, 236, 210)
    p, BL, brot, _, _ = four_legs(cv, beast4(frame), V(12, 7, 6.5), 6.0, 2.2, 17, fur, pale, stride=.8); sw = p["sway"]
    cv.ell(BL(0, 0), V(12, 7, 6.5), fur, rot=brot); cv.ell(BL(4, -3.5), (7, 3.6, 5), pale); cv.cone(BL(-11, 3), BL(-17, 11 + 4 * sw), 1.6, .7, fur)
    hd = BL(14, 7); cv.cone(BL(8, 2), hd, 4.6, 4, fur); cv.ell(hd, (6, 5.4, 5.4), fur); cv.ell(hd + V(5.5, -1.6, 0), (4.2, 2.8, 3.4), pale); cv.ell(hd + V(9.2, -.8, 0), 1.3, V(44, 40, 52)); cv.ell(hd + V(6, -4.2, 0), (2, 1.4, 1.6), V(250, 120, 140))
    for sgn in (1, -1): cv.ell(hd + V(-2.5, 1.5 + sw, 5 * sgn), (2.4, 4.4, 1.8), V(120, 76, 50)); eye(cv, hd + V(3, 1.8, 4 * sgn), np.eye(3), 1.6, sgn, V(60, 40, 40))
def camel(cv, outfit, frame):
    cv.cel = .35; cv.ink = 1.1; fur = V(226, 180, 110); dark = V(170, 124, 76)
    p, BL, brot, _, _ = four_legs(cv, beast4(frame), V(18, 10, 9), 13.5, 2.8, 36, fur, dark, stride=.5); sw = p["sway"]
    cv.ell(BL(0, 0), V(18, 10, 9), fur, rot=brot); cv.ell(BL(-1, 9.5), (9, 8, 7), fur); cv.ell(BL(-1, 8), (11, 5.5, 9.6), V(214, 60, 70), shader=stripes(V(214, 60, 70), V(250, 200, 70), 9, 0, .8))
    cv.cone(BL(-17, 3), BL(-21, -6 + 2 * sw), 1.4, .9, fur)
    n0 = BL(15, 3); n1 = BL(24, 12); n2 = BL(27, 23); B2.chain(cv, [n0, n1, n2], [6, 4.4, 3.6], fur); hd = n2 + V(4, 2, 0); cv.ell(hd, (7, 4.6, 4.6), fur, rot=rz(-.2)); cv.ell(hd + V(5.5, -1.6, 0), (3.6, 2.8, 3.4), V(240, 206, 150))
    for sgn in (1, -1): cv.ell(hd + V(-4, 3.6, 3 * sgn), (1.4, 2.2, 1.4), dark); eye(cv, hd + V(1.5, 1.6, 3.6 * sgn), np.eye(3), 1.6, sgn, V(60, 40, 40))
def stripes(a, b, every, axis=1, th=.2):
    def sh(q, col):
        col = col.copy(); col[np.cos(q[:, axis] * every) > th] = b; return col, None
    return sh
def duck(cv, outfit, frame):
    cv.cel = .35; cv.ink = 1.1; ph = frame / 4 * 2 * math.pi; bob = 1.0 * abs(math.sin(ph)); white = V(252, 250, 244); bill = V(255, 160, 50)
    for sgn in (1, -1): f = V(1 + 3 * math.sin(ph) * sgn, 1.2, 2.6 * sgn); cv.cone(V(0, 6 + bob, 2.6 * sgn), f, 1.0, .8, bill); cv.ell(f + V(1.6, -.4, 0), (2.6, .8, 2), bill)
    c = V(0, 9 + bob, 0); cv.ell(c, (8.5, 6, 6), white, rot=rz(.12)); cv.cone(c + V(-7, 2, 0), c + V(-11, 6, 0), 2.6, .6, white, flat=.6)
    hd = c + V(7.5, 8, 0); cv.cone(c + V(5, 2, 0), hd, 3.2, 2.8, white); cv.ell(hd, 4.2, white); cv.ell(hd + V(4.6, -.6, 0), (3.2, 1.4, 2.6), bill)
    for sgn in (1, -1): cv.ell(hd + V(2, 1.2, 3 * sgn), 1.0, V(30, 22, 28))
def rickshaw(cv, outfit, frame):
    cv.cel = .4; cv.ink = 1.15; ph = frame / 4 * 2 * math.pi; dark = V(44, 40, 52); cab = V(60, 170, 176); gold = V(250, 200, 70)
    spoke = lambda q, c: (c, (np.hypot(q[:, 0], q[:, 1]) > .78) | (np.cos(np.arctan2(q[:, 1], q[:, 0]) * 6 + ph * 2) > .93) | (np.hypot(q[:, 0], q[:, 1]) < .2))
    cv.ell(V(27, 9, 0), (9, 9, 1.3), dark, shader=spoke)
    for sgn in (1, -1): cv.ell(V(-14, 9, 9 * sgn), (9, 9, 1.3), dark, shader=spoke)
    cv.box(V(-14, 16, 0), V(11, 5, 9), cab); cv.box(V(-22, 25, 0), V(2.2, 6, 9), cab); cv.box(V(-13, 21, 0), V(8, 1.6, 8), V(232, 78, 70))
    cv.ell(V(-13, 40, 0), (15, 3.4, 11), gold, shader=stripes(gold, V(232, 78, 70), 12, 0, .5))
    for (x, z) in ((-24, 8), (-24, -8), (-3, 8), (-3, -8)): cv.cone(V(x, 20, z), V(x, 39, z), .8, .8, dark)
    for (a, b2) in ((V(-3, 12, 0), V(10, 12, 0)), (V(10, 12, 0), V(8, 24, 0)), (V(10, 12, 0), V(22, 22, 0)), (V(22, 22, 0), V(27, 9, 0)), (V(22, 22, 0), V(23, 28, 0))): cv.cone(a, b2, 1.2, 1.2, V(232, 78, 70))
    cv.ell(V(8, 25.5, 0), (4.2, 1.5, 2.6), dark); cv.cone(V(23, 28, -4), V(23, 28, 4), 1.0, 1.0, dark); pedal = V(10, 12, 2.5) + V(4.6 * math.cos(-ph), 4.6 * math.sin(-ph), 0); cv.cone(V(10, 12, 2.5), pedal, .9, .9, dark)
    little_rider(cv, V(8, 28, 0), .25, V(250, 246, 238), V(60, 130, 230), -ph, V(23, 28, 3))
def oxcart(cv, outfit, frame):
    cv.cel = .35; cv.ink = 1.1; ph = frame / 4 * 2 * math.pi; wood = V(176, 120, 72); wood_d = V(120, 76, 50)
    ox = Moved(cv, V(30, 0, 0)); p, BL, brot, _, _ = four_legs(ox, beast4(frame), V(17, 11, 10), 8.2, 3.2, 25, V(236, 226, 206), V(90, 70, 64), stride=.45)
    ox.ell(BL(0, 0), V(17, 11, 10), V(236, 226, 206), rot=brot); ox.ell(BL(-4, 10), (6, 4.6, 6), V(236, 226, 206)); hd = BL(20, 4); ox.cone(BL(13, 3), hd, 6.5, 5.6, V(236, 226, 206)); ox.ell(hd, (7.6, 6.6, 6.6), V(236, 226, 206)); ox.ell(hd + V(6.5, -2.6, 0), (4.4, 3.8, 4.6), V(120, 96, 90))
    for sgn in (1, -1): ox.cone(hd + V(-1, 5.5, 4 * sgn), hd + V(4, 12, 6 * sgn), 1.5, .4, V(60, 50, 50)); eye(ox, hd + V(4, 2, 5 * sgn), np.eye(3), 1.9, sgn, V(60, 40, 40))
    spoke = lambda q, c: (c, (np.hypot(q[:, 0], q[:, 1]) > .8) | (np.cos(np.arctan2(q[:, 1], q[:, 0]) * 8 + ph * 2) > .9) | (np.hypot(q[:, 0], q[:, 1]) < .2))
    cv.cone(V(-8, 20, 0), V(22, 22, 0), 1.2, 1.2, wood_d); cv.box(V(-26, 22, 0), V(18, 2, 10), wood); 
    for sgn in (1, -1): cv.box(V(-26, 28, 9.5 * sgn), V(18, 5, .8), wood, lines=.8); cv.ell(V(-26, 13, 11 * sgn), (13, 13, 1.6), wood_d, shader=spoke)
    for k, (x, z) in enumerate(((-34, 0), (-27, 3), (-20, -2), (-30, -4), (-23, 4))): cv.ell(V(x, 31 + (k % 2) * 2, z), (5.4, 4.6, 5), (V(232, 200, 110), V(214, 180, 96))[k % 2])
    little_rider(cv, V(-10, 28, 0), .1, V(250, 246, 238), V(232, 78, 70), -.9, V(2, 30, 3))
def rover(cv, outfit, frame):
    cv.cel = .4; cv.ink = 1.15; ph = frame / 4 * 2 * math.pi; body = V(236, 232, 224); dark = V(60, 62, 80); panel = V(60, 90, 190)
    for x in (-15, 0, 15):
        for sgn in (1, -1): cv.ell(V(x, 5.6 + (.8 * math.sin(ph + x) if sgn > 0 else 0), 10 * sgn), (5.6, 5.6, 3), dark); cv.ell(V(x + 3.4 * math.cos(-ph), 5.6 + 3.4 * math.sin(-ph), 12.6 * sgn), .9, V(255, 150, 60))
        cv.cone(V(x, 6, 0), V(x * .5, 14, 0), 1.3, 1.3, dark)
    cv.box(V(0, 17, 0), V(15, 4.6, 9), body); cv.box(V(-3, 23, 0), V(12, .9, 12.5), panel, lines=1.0); cv.cone(V(11, 21, 0), V(13, 36, 0), 1.2, 1.0, dark); cv.box(V(14.5, 37.5, 0), V(3.6, 2.4, 3), body)
    cv.ell(V(18.2, 37.5, 0), (1, 1.8, 1.8), V(110, 236, 255), glow=.9); cv.cone(V(-11, 22, 4), V(-15, 34, 6), .6, .5, dark); cv.ell(V(-15.5, 36, 6), (3.6, 3.6, 1.2), body, rot=ry(.5)); cv.ell(V(15.2, 17, 9.2), 1.2, V(255, 96, 90), glow=.8 if frame % 2 else .2)
def hatch(cv, outfit, frame):
    try:
        B4.PAL.update(skin=V(250, 200, 70), dark=V(214, 150, 40), cream=V(255, 244, 200), lite=V(255, 228, 130), horn=V(255, 140, 60))
        B4.slim_dino(cv, "shell", frame)
    finally: B4.PAL.clear()

# ---------------- toon snakes: 0-11 move, 12-15 strike ----------------
def snake_head(cv, at, rot, size, skin, dark, jaw, tongue):
    def HL(x, y, z=0): return at + rot @ (V(x, y, z) * size)
    def head_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        for side in (1, -1):
            e = V(.45, .42, .78 * side); e = e / np.linalg.norm(e); d = ((q - e) ** 2).sum(1)
            col[d < .26] = dark * .45; col[d < .2] = V(255, 250, 236); col[(d < .2) & (np.abs(q[:, 0] - e[0] - .06) < .1)] = V(30, 22, 28); col[((q - e - V(.02, .14, 0)) ** 2).sum(1) < .012] = V(255, 255, 255)
        col += (dark - col) * (np.clip((y - .45) * 3, 0, 1) * .6)[:, None]
        return col, None
    jr = rot @ rz(-jaw)
    cv.ell(HL(5, -3.2) + jr @ (V(3.5, -1.2, 0) * size), V(8.6, 2.4, 5.8) * size, V(246, 226, 170), rot=jr)
    if jaw > .2:
        cv.ell(HL(5, -2.6) + jr @ (V(3.5, .2, 0) * size), V(7.2, 1.6, 4.6) * size, V(214, 70, 90), rot=jr)
        for sgn in (1, -1): a = HL(11, -1.6, 2.6 * sgn); cv.cone(a, a + rot @ (V(.6, -4.2, 0) * size), 1.0 * size, .25 * size, B.WHITE)
    cv.ell(HL(0, 0), V(9.0, 6.8, 7.6) * size, skin, rot=rot, shader=head_sh)
    cv.ell(HL(8.5, -.8), V(6.4, 4.4, 5.6) * size, skin, rot=rot)
    for sgn in (1, -1): cv.ell(HL(13.4, .6, 1.8 * sgn), .9 * size, dark * .5)
    if tongue:
        a = HL(14.5, -2.6); b = a + rot @ (V(7, -1 + tongue, 0) * size); cv.cone(a, b, .8 * size, .6 * size, V(232, 60, 80))
        for sgn in (1, -1): cv.cone(b, b + rot @ (V(3.2, .6, 1.8 * sgn) * size), .6 * size, .2 * size, V(232, 60, 80))
def banded(a, b, every):
    def sh(q, col):
        col = col.copy(); col[np.cos(q[:, 0] * every) > .55] = b; col += (V(250, 236, 190) - col) * np.clip((-q[:, 1] - .35) * 3, 0, 1)[:, None]; return col, None
    return sh
class Scaled:
    """Draws the same model bigger."""
    def __init__(s, cv, k): s.cv = cv; s.k = k
    def ell(s, c, r, *a, **kw): return s.cv.ell(c * s.k, (np.array(r, float) if not np.isscalar(r) else r) * s.k, *a, **kw)
    def cone(s, a, b, ra, rb, *x, **kw): return s.cv.cone(a * s.k, b * s.k, ra * s.k, rb * s.k, *x, **kw)
def cobra(cv, outfit, frame):
    cv.cel = .45; cv.ink = 1.1; cv = Scaled(cv, 1.12)
    skin = V(104, 84, 190); dark = V(66, 52, 140); band = V(250, 196, 70)
    strike = frame >= 12; b = frame - 12; ph = frame / 12 * 2 * math.pi
    sway = 0 if strike else math.sin(ph); lunge = [0, .45, 1, .5][b] if strike else 0
    # coils on the ground
    for ring, (rad, yy, rr) in enumerate(((17, 5.0, 5.4), (12.5, 13.5, 5.0))):
        n = 12; pts = [V(-6 + math.cos(k / n * 2 * math.pi + ring) * rad, yy + .6 * math.sin(k * 1.3), math.sin(k / n * 2 * math.pi + ring) * rad * .62) for k in range(n + 1)]
        for k in range(n): cv.cone(pts[k], pts[k + 1], rr, rr, band if (k + ring) % 4 == 0 else skin)
    tail = [V(-22, 3, 8), V(-31, 2.5, 5), V(-38, 3.5 + 2 * sway, 2), V(-43, 6 + 3 * sway, 0)]
    B2.chain(cv, tail, [3.6, 2.6, 1.7, .8], skin)
    # rising neck with a slow sway, leaning forward on the strike
    base = V(-3, 17, 0); pts = [base]
    for k in range(1, 7):
        t = k / 6; pts.append(base + V((4 + 3 * sway) * math.sin(t * 2.6) + lunge * 20 * t * t, 34 * t - lunge * 9 * t * t, 1.5 * sway * math.sin(t * 3)))
    B2.chain(cv, pts, [5.2, 5.0, 4.8, 4.6, 4.5, 4.3, 4.0], skin)
    for k in (1, 3, 5): cv.ell(pts[k], (5.3, 1.5, 5.3), band)
    top = pts[-1]; lean = -.25 - lunge * .55 + .1 * sway; rot = rz(lean)
    # the hood, wide and flat behind the neck
    def hood_sh(q, col):
        col = col.copy(); z, y = q[:, 2], q[:, 1]
        for sgn in (1, -1): d = ((z - .42 * sgn) / .2) ** 2 + ((y - .1) / .26) ** 2; col[(d < 1) & (q[:, 0] > 0)] = band; col[(d < .35) & (q[:, 0] > 0)] = dark
        col += (V(250, 236, 190) - col) * (np.clip(.75 - np.abs(z), 0, 1) * np.clip(q[:, 0] * 2, 0, 1) * .55)[:, None]
        return col, None
    cv.ell(pts[4] + V(-2.5 + lunge * 8, 3, 0), (4.2, 17.5, 19.0 + 1.5 * (1 if strike else .5 + .5 * math.sin(ph * 2))), skin, rot=rz(-.12 - lunge * .3), shader=hood_sh)
    snake_head(cv, top + rot @ V(4, 4.5, 0), rot, 1.3, skin, dark, .5 if (strike and b in (1, 2)) else .05, (1.5 * math.sin(ph * 3) if (not strike and frame % 6 < 2) else 0))
def anaconda(cv, outfit, frame):
    cv.cel = .45; cv.ink = 1.1; cv = Scaled(cv, 1.18)
    skin = V(122, 150, 62); dark = V(70, 92, 44); strike = frame >= 12; b = frame - 12; ph = frame / 12 * 2 * math.pi
    lunge = [0, .5, 1, .4][b] if strike else 0
    pts = []; n = 16
    for k in range(n + 1):
        t = k / n; x = -56 + 86 * t + lunge * 10 * t; wig = math.sin(t * 9 - ph) * (1 - t * .55)
        pts.append(V(x, 8.4 + 1.2 * abs(wig) + (10 + lunge * 6) * max(0, t - .78) * 4 * (t - .78) * 5, wig * 9))
    radii = [1.6 + 7.2 * math.sin(min(1, k / n * 1.25) * math.pi * .5) * (1 - .25 * (k / n) ** 3) for k in range(n + 1)]
    for k in range(n):
        cv.cone(pts[k], pts[k + 1], radii[k], radii[k + 1], dark if k % 3 == 1 else skin, V(240, 226, 150) if k % 3 != 1 else None, split=.42)
    d = pts[-1] - pts[-2]; ang = math.atan2(d[1], d[0]); rot = rz(ang * .6 - lunge * .1)
    snake_head(cv, pts[-1] + rot @ V(5, 2.5, 0), rot, 1.4, skin, dark, .55 if (strike and b in (1, 2)) else .06, (1.2 if (not strike and frame % 6 < 2) else 0))
def sentinel(cv, outfit, frame):
    """The clockwork sentinel: a squat tower-clock guard. A clock face for a chest, a winding key on its back,
    a spiked helmet with one red visor. Runner layout: 0-9 march, 10-11 stand, 12 lunge, 13-14 alarm, 15 crouch."""
    cv.cel = .4; cv.ink = 1.15
    steel = V(74, 96, 150); deep = V(48, 62, 104); brass = V(232, 176, 78); cream = V(252, 244, 220); red = V(255, 84, 70)
    march = frame < 10; ph = frame / 10 * 2 * math.pi if march else 0; sw = math.sin(ph) if march else 0
    lunge = frame == 12; alarm = frame in (13, 14); crouch = frame == 15
    bob = abs(math.sin(ph)) * 1.6 if march else 0; lean = (.32 if lunge else 0) + (.05 * sw); drop = 9 if crouch else 0
    rot = rz(-lean); c = V(2 + (9 if lunge else 0), 33 + bob - drop, 0)
    def BL(x, y, z=0): return c + rot @ V(x, y, z)
    # legs and big boots
    for sgn in (1, -1):
        step = sw * sgn * (1 if march else 0); lift = max(0, math.cos(ph) * sgn) * 5 if march else 0
        hipj = BL(0, -11, 7.5 * sgn); foot = V(c[0] + step * 9 + (-6 * sgn if lunge else 0), 4 + lift, 7.5 * sgn)
        cv.cone(hipj, foot + V(0, 2, 0), 4.6, 3.8, deep); cv.ell(foot + V(2.5, -.4, 0), (8.0, 3.8, 5.6), brass); cv.ell(foot + V(2.5, -2.8, 0), (8.4, 1.6, 6.0), deep)
    # winding key on the back, turning as it marches
    ka = ph * 1.0 + (frame * .8 if not march else 0); kb = BL(-15, 4); ke = BL(-25, 4)
    cv.cone(kb, ke, 2.0, 2.0, brass)
    for sgn in (1, -1): cv.ell(ke + rot @ V(-1.5, 6.4 * sgn * math.cos(ka), 6.4 * sgn * math.sin(ka)), (2.2, 5.6, 5.6) if abs(math.cos(ka)) > .5 else (2.2, 5.0, 5.0), brass)
    # drum body with a clock face on the near side
    cv.ell(c, (15.5, 15.0, 12.5), steel, rot=rot)
    cv.ell(BL(0, -10.5), (14.2, 3.4, 11.6), brass, rot=rot); cv.ell(BL(0, 11.5), (12.6, 2.6, 10.4), brass, rot=rot)
    hand = ph * 1.0 + frame * .5
    def face_sh(q, col):
        col = col.copy(); x, y = q[:, 0], q[:, 1]; r = np.hypot(x, y); a = np.arctan2(x, y)
        col[r > .86] = brass; col[(r > .68) & (r < .82) & (np.cos(a * 12) > .93)] = deep
        for ang, ln, w in ((hand, .62, .07), (hand * .25 + 1.2, .42, .09)):
            ux, uy = math.sin(ang), math.cos(ang); along = x * ux + y * uy; across = np.abs(x * uy - y * ux)
            col[(along > -.05) & (along < ln) & (across < w)] = deep
        col[r < .1] = red
        return col, q[:, 2] > -.2
    cv.ell(BL(0, 0, 9.2), (11.4, 11.4, 4.6), cream, rot=rot, shader=face_sh)
    # arms with brass gauntlets
    for sgn in (1, -1):
        swing = (-sw * sgn * .7) if march else (1.3 if lunge else (2.6 if alarm and (frame + (sgn > 0)) % 2 else .2))
        sh = BL(1, 8, 14.2 * sgn); hd2 = sh + 12.5 * B.down(swing, .12 * sgn)
        cv.ell(sh, 4.6, brass); cv.cone(sh, hd2, 3.4, 3.0, deep); cv.ell(hd2, (4.6, 4.6, 4.6), brass)
    # helmet: a dome with a brim, one red visor and a spike
    hrot = rot @ ry(.3); hc = BL(1.5, 20.5)
    def helm_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        slit = (x > .1) & (np.abs(y + .08) < .17); col[slit] = V(30, 26, 44); col[slit & (np.abs(y + .08) < .09) & (x > .3)] = red
        col[(np.abs(z) < .08) & (y > .2)] = brass
        return col, None
    cv.ell(hc, (10.0, 8.6, 9.4), steel, rot=hrot, shader=helm_sh)
    cv.ell(hc + rot @ V(0, -3.6, 0), (12.4, 1.9, 11.6), brass, rot=rot)
    cv.cone(hc + rot @ V(0, 7.5, 0), hc + rot @ V(-.5, 14.5, 0), 2.6, .5, brass); cv.ell(hc + rot @ V(0, 7.2, 0), (3.6, 1.6, 3.6), brass)
    if alarm:
        for k in range(3): a = hc + rot @ V(-6 + 6 * k, 16 + 2 * (k % 2), 0); cv.ell(a, 1.5, red, glow=.8)
# ---------------- toon beasts on four legs: 0-11 gallop, 12-15 charge ----------------
def four_legs(cv, frame, body, legL, legR, bodyY, fur, pale, splay=.62, stride=.85):
    p = B.pose(frame, "walker"); mode = p["mode"]; ph = p["ph"]; b = p["b"]; charge = mode == "act"
    pitch = (.08 * math.sin(ph)) if mode == "run" else [.06, .2, .08, -.08][b]
    c0 = V(0, bodyY, 0); brot = rz(pitch); legs = []
    fx, hx = body[0] * .6, -body[0] * .6
    for lx, sgn, phs in ((fx, 1, 0.0), (hx, -1, .35), (fx, -1, .6), (hx, 1, .95)):
        front = lx > 0
        if mode == "run": f = ph + phs + (math.pi if not front else 0); th = .05 + stride * math.sin(f); kn = .25 + 1.0 * max(0, math.cos(f + .5)) ** 1.4
        else: th, kn = [(.3, .8), (1.1, .5), (1.3, .15), (.8, .3)][b] if front else [(-.3, .8), (-.8, .2), (-1.15, .1), (-.5, .5)][b]
        if not front: kn = -kn * .7; th *= .9
        hj = c0 + brot @ V(lx, -body[1] * .45, body[2] * splay * sgn); knee = hj + legL * B.down(th); ank = knee + legL * B.down(th - kn); legs.append((hj, knee, ank))
    lowest = min(a[1] - legR * 1.3 for (_, _, a) in legs); dy = -lowest + (p["hop"] * 1.4 if mode == "run" else [0, 3, 9, 5][b])
    off = V(0, dy, 0); c0 = c0 + off
    for (hj, knee, ank) in legs:
        hj = hj + off; knee = knee + off; ank = ank + off
        cv.cone(hj, knee, legR * 1.45, legR, fur); cv.cone(knee, ank, legR, legR * .9, fur); cv.ell(ank + V(1.4, -.8, 0), (legR * 1.6, legR * .95, legR * 1.35), pale)
    def BL(x, y, z=0): return c0 + brot @ V(x, y, z)
    return p, BL, brot, charge, b
def eye(cv, at, rot, r, side, iris=V(255, 214, 90)):
    cv.ell(at, r * 1.18, V(40, 30, 40)); cv.ell(at + rot @ V(r * .25, 0, r * .25 * side), r, V(255, 252, 240))
    cv.ell(at + rot @ V(r * .75, -r * .05, r * .5 * side), r * .58, iris); cv.ell(at + rot @ V(r * 1.05, -r * .05, r * .62 * side), r * .34, V(24, 20, 30))
class Moved:
    """Draws the same model shifted."""
    def __init__(s, cv, d): s.cv = cv; s.d = d
    def ell(s, c, *a, **kw): return s.cv.ell(c + s.d, *a, **kw)
    def cone(s, a, b, *x, **kw): return s.cv.cone(a + s.d, b + s.d, *x, **kw)
def boar(cv, outfit, frame):
    cv.cel = .35; cv.ink = 1.1
    fur = V(156, 100, 72); dark = V(92, 58, 50); pale = V(64, 46, 44); snoutc = V(244, 158, 150); body = V(22, 14.5, 12.5)
    p, BL, brot, charge, b = four_legs(cv, frame, body, 7.6, 3.9, 25, fur, pale); sw = p["sway"]
    def body_sh(q, col):
        col = col.copy(); x, y = q[:, 0], q[:, 1]
        col += (V(206, 150, 112) - col) * np.clip((-y - .15) * 3, 0, 1)[:, None]; col += (dark - col) * (np.clip((y - .45) * 4, 0, 1) * .8)[:, None]
        return col, None
    cv.ell(BL(0, 0), body, fur, rot=brot, shader=body_sh)
    for i, x in enumerate((-13, -7, -1, 5, 11, 16)):   # bristle ridge
        a = BL(x, 12.8 - abs(x) * .08); cv.cone(a, a + brot @ V(-3.0, 6.0 + (i % 2) * 1.6 + sw, 0), 2.9, .6, dark, flat=.5)
    tb = BL(-21, 4); m = tb + V(-5, 4 + sw, 0); cv.cone(tb, m, 1.5, 1.2, fur); cv.cone(m, m + V(-1 + sw, 5, 2), 1.2, .5, fur); cv.ell(m + V(-1 + sw, 5.6, 2), 1.8, dark)
    hrot = brot @ rz((.18 if charge and b >= 1 else -.08) - p["head"]) @ ry(.3); hd = BL(21, -1.5)
    def HL(x, y, z=0): return hd + hrot @ V(x, y, z)
    cv.ell(hd, (12.5, 11.5, 11.0), fur, rot=hrot)
    cv.cone(HL(6, -2), HL(17.5, -3.5), 7.4, 5.6, fur); cv.ell(HL(18.5, -3.6), (2.6, 5.4, 5.6), snoutc, rot=hrot)
    for sgn in (1, -1):
        cv.ell(HL(20.6, -3.2, 2.1 * sgn), (1.0, 1.6, 1.2), V(150, 70, 80), rot=hrot)
        t0 = HL(12.5, -6.5, 5.6 * sgn); t1 = t0 + hrot @ V(3.5, 1.0, 2.2 * sgn); cv.cone(t0, t1, 1.9, 1.5, B.WHITE); cv.cone(t1, t1 + hrot @ V(1.0, 6.0, .6 * sgn), 1.5, .35, B.WHITE)
        e0 = HL(-3.5, 9.5, 7.6 * sgn); cv.cone(e0, e0 + hrot @ V(-3.5, 7.5, 2.5 * sgn), 3.6, .8, dark, flat=.55)
        eye(cv, HL(6.2, 4.6, 7.6 * sgn), hrot, 2.9, sgn)
        cv.cone(HL(3.0, 9.2, 7.0 * sgn), HL(9.5, 6.8, 6.6 * sgn), 1.3, 1.0, dark)   # angry brow
    if charge and b >= 1: cv.ell(HL(13, -8.6), (5.0, 1.6, 4.4), V(150, 52, 62), rot=hrot)
def croc(cv, outfit, frame):
    cv.cel = .35; cv.ink = 1.1
    cv = Moved(cv, V(12, 0, 0))   # keeps the long tail inside the cell
    skin = V(104, 160, 86); dark = V(62, 110, 64); belly = V(240, 230, 160); body = V(27, 8.2, 11.5)
    p, BL, brot, charge, b = four_legs(cv, frame, body, 5.2, 3.5, 14.5, skin, V(78, 124, 70), splay=.95, stride=.7); sw = p["sway"]; ph = p["ph"]
    def body_sh(q, col):
        col = col.copy(); x, y = q[:, 0], q[:, 1]
        col += (belly - col) * np.clip((-y - .05) * 3.5, 0, 1)[:, None]; col += (dark - col) * (np.clip((y - .3) * 3, 0, 1) * (np.cos(x * 17) > 0) * .55)[:, None]
        return col, None
    cv.ell(BL(0, 0), body, skin, rot=brot, shader=body_sh)
    tail = [BL(-22, 0)]
    for k in range(1, 7): tail.append(BL(-22 - k * 8.5, .6 * k + 2.2 * math.sin(ph - k * .8) * (k / 6) * (0 if charge else 1) + (k * 1.6 if charge else 0), 3.2 * math.sin(ph - k * .9) * (k / 6)))
    B2.chain(cv, tail, [7.2, 6.2, 5.0, 3.9, 2.8, 1.8, .8], skin)
    for k in range(6): cv.cone(tail[k] + V(0, [6.4, 5.4, 4.3, 3.3, 2.3, 1.4][k], 0), tail[k] + V(-2.4, [6.4, 5.4, 4.3, 3.3, 2.3, 1.4][k] + 4.4 - k * .45, 0), 2.3, .5, dark, flat=.5)
    for x in (-15, -8, -1, 6, 13):
        for sgn in (1, -1): a = BL(x, 7.2, 4.2 * sgn); cv.cone(a, a + brot @ V(-1.6, 3.6, 0), 2.4, .5, dark, flat=.6)
    jaw = .5 if (charge and b in (1, 2)) else (.14 if (not charge and math.sin(ph * 2) > .4) else .05)
    hrot = brot @ rz((.16 if charge and b >= 1 else 0) - p["head"]) @ ry(.25); hd = BL(28, 1.5)
    def HL(x, y, z=0): return hd + hrot @ V(x, y, z)
    cv.cone(BL(20, 0), hd, 8.0, 7.2, skin)
    jr = hrot @ rz(-jaw)
    cv.ell(HL(0, -2) + jr @ V(12, -1.6, 0), (15.5, 2.6, 7.2), belly, rot=jr)
    if jaw > .2: cv.ell(HL(0, -1.6) + jr @ V(11.5, .2, 0), (13.5, 1.6, 6.0), V(226, 88, 104), rot=jr)
    cv.ell(hd, (8.6, 7.0, 8.6), skin, rot=hrot); cv.ell(HL(13, .2), (15.5, 3.8, 7.4), skin, rot=hrot); cv.ell(HL(26.5, 1.2), (3.4, 3.2, 5.4), skin, rot=hrot)
    for t in range(6):
        for sgn in (1, -1):
            a = HL(6 + t * 3.8, -2.6, 6.2 * sgn * (1 - t * .05)); cv.cone(a, a + hrot @ V(0, -2.8, 0), 1.25, .3, B.WHITE)
            if jaw > .2 and t < 5: a2 = HL(0, -2) + jr @ V(7 + t * 3.8, .6, 5.6 * sgn); cv.cone(a2, a2 + jr @ V(0, 2.6, 0), 1.15, .3, B.WHITE)
    for sgn in (1, -1):
        cv.ell(HL(1.5, 6.4, 5.2 * sgn), (3.9, 3.6, 3.6), skin); eye(cv, HL(2.6, 7.0, 5.9 * sgn), hrot, 2.5, sgn); cv.ell(HL(27.6, 3.8, 2.2 * sgn), 1.0, dark * .6)
# ---------------- toon birds of prey: 0-11 flap, 12-15 swoop with talons out ----------------
def raptor(cv, frame, body, back, belly, headc, forked, size=1.0, kind="eagle", wingc=None):
    cv.cel = .35; cv.ink = 1.1; cv = Moved(Scaled(cv, size), V(4, 36, 0) * size)
    swoop = frame >= 12; b = frame - 12; ph = frame / 12 * 2 * math.pi
    flap = math.sin(ph) if not swoop else [.75, .2, -.35, .1][b]
    tilt = (-.10 + .05 * math.sin(ph)) if not swoop else [-.2, -.42, -.5, -.3][b]; brot = rz(tilt); bob = -2.2 * flap if not swoop else 0
    def BL(x, y, z=0): return V(0, bob, 0) + brot @ V(x, y, z)
    beak = V(250, 190, 60); wingc = back if wingc is None else wingc; owl = kind == "owl"; bat = kind == "bat"
    # far wing first, then body, then near wing
    def skin_wing(sgn):
        # A bat's wing is skin stretched between long finger bones: smooth panels, dark bones, a scalloped edge.
        a = flap * 1.12 + .14; sh = BL(1.5, 4.0, 5.5 * sgn); skin = wingc; bone = back * .8
        d0 = V(-.10, math.sin(a), math.cos(a) * sgn); d0 = d0 / np.linalg.norm(d0); wrist = sh + d0 * 15
        chord = V(1, 0, 0) - d0 * d0[0]; chord = chord / np.linalg.norm(chord); nrm = np.cross(d0, chord)
        rot0 = np.stack([chord, nrm, d0], axis=1)
        cv.ell(sh + d0 * 8 - chord * 3, (9.5, 1.3, 9.5), skin, rot=rot0)
        tips = []
        for k, (back_x, ln) in enumerate(((-.05, 21), (-.55, 19), (-1.1, 15))):
            ang = a * 1.45; dk = V(back_x, math.sin(ang), math.cos(ang) * sgn); dk = dk / np.linalg.norm(dk); tip = wrist + dk * ln; tips.append(tip)
            ck = V(1, 0, 0) - dk * dk[0]; ck = ck / np.linalg.norm(ck)
            cv.ell(wrist + dk * ln * .5 - ck * 1.5, (5.2, 1.2, ln * .52), skin * (1 - .07 * k), rot=np.stack([ck, np.cross(dk, ck), dk], axis=1))
        cv.cone(sh, wrist, 1.7, 1.3, bone)
        for tip in tips: cv.cone(wrist, tip, 1.2, .5, bone); cv.ell(tip, .9, bone)
        cv.cone(wrist, wrist + chord * 4.5 + d0 * 1.5, 1.1, .3, bone)      # thumb claw
    def wing(sgn):
        a = flap * 1.12 + .14; prev = BL(1.5, 4.5, 6.0 * sgn)
        for k, (ln, wd, bend) in enumerate(((21, 10.5, 0), (17, 7.6, .45))):
            ang = a * (1 + bend); d = V(-.18 - k * .16, math.sin(ang), math.cos(ang) * sgn); d = d / np.linalg.norm(d)
            chord = V(1, 0, 0) - d * d[0]; chord = chord / np.linalg.norm(chord); nrm = np.cross(d, chord)
            cv.ell(prev + d * ln * .5, (wd, 1.8, ln * .58), wingc if k == 0 else wingc * .8, rot=np.stack([chord, nrm, d], axis=1))
            if bat: cv.cone(prev + chord * wd * .5, prev + d * ln + chord * wd * .3, 1.5, 1.0, back)      # arm bone along the leading edge
            for t in (.3, .55, .8):   # trailing feathers
                e0 = prev + d * ln * t - chord * wd * .55; cv.cone(e0, e0 - chord * (5.5 - k) + d * 2.2, 2.6 - k * .5, .5, wingc * .72, flat=.4)
            prev = prev + d * ln
        for j in range(4):   # finger feathers at the tip
            t0 = prev + chord * (2.6 - 2.3 * j) - d * 4; cv.cone(t0, t0 + d * (8.5 - j) - chord * (1 + j), 2.2, .4, wingc * .62, flat=.4)
    (skin_wing if bat else wing)(-1)
    def body_sh(q, col):
        col = col.copy(); x, y = q[:, 0], q[:, 1]
        col += (belly - col) * np.clip((-y + .05) * 3, 0, 1)[:, None]; col += (back * .7 - col) * (np.clip(-y, 0, 1) * (np.cos(x * 16 + y * 9) > .55) * .5)[:, None]
        return col, None
    cv.ell(BL(0, 0), (13.5, 11.2, 10.6) if owl else (11.5, 8.4, 7.8) if bat else (15.5, 9.2, 8.8), back, rot=brot, shader=body_sh)
    if owl:   # winding key on the back
        ka = ph * 2 + frame; kb = BL(-6, 9); ke = BL(-10, 16); cv.cone(kb, ke, 1.6, 1.6, beak)
        for sgn in (1, -1): cv.ell(ke + V(0, 2.5 + 4.6 * sgn * math.cos(ka), 4.6 * sgn * math.sin(ka)), (1.8, 4.0, 4.0), beak)
    # tail: one fan, or two lobes for the kite
    tb = BL(-13, 1)
    for sgn in (() if bat else (1, -1) if forked else (0,)):
        cv.ell(tb + brot @ V(-9, 2.6 * sgn - .5, 2.4 * sgn), (10.5, 2.6 if forked else 3.2, 4.2 if forked else 7.2), back * .8, rot=brot @ rz(-.3 * sgn))
        if not forked and not owl: cv.ell(tb + brot @ V(-17, -.8, 0), (3.2, 1.3, 7.4), V(250, 246, 238), rot=brot)
    # legs: tucked in flight, thrown forward on the swoop
    for sgn in (1, -1):
        hipj = BL(-1, -6.5, 3.6 * sgn); reach = [.5, 1.25, 1.6, 1.0][b] if swoop else -.75
        knee = hipj + 6.0 * B.down(reach * .7); foot = knee + 6.5 * B.down(reach + (.25 if swoop else -.5))
        cv.cone(hipj, knee, 3.0, 1.9, belly); cv.cone(knee, foot, 1.5, 1.2, beak)
        for t in (-1, 0, 1): cv.cone(foot, foot + B.down(reach + .5 + .3 * t, .5 * t) * (4.6 if swoop else 2.6), 1.1, .3, V(40, 34, 40) if swoop else beak)
    hrot = brot @ rz(.22 - tilt * .6) @ ry(.3); hd = BL(15.5, 5.5)
    def HL(x, y, z=0): return hd + hrot @ V(x, y, z)
    hc = headc if headc is not None else back
    if owl:
        hd = BL(13, 7.5); cv.ell(hd, (10.6, 10.2, 10.4), hc, rot=hrot)
        cv.ell(HL(6.6, -.5), (4.6, 8.0, 9.6), belly, rot=hrot)                                   # pale face disc
        for sgn in (1, -1):
            eye(cv, HL(8.6, 1.2, 4.9 * sgn), hrot, 4.3, sgn, V(255, 170, 60)); cv.ell(HL(8.2, 1.2, 4.9 * sgn), (2.4, 5.4, 5.4), beak * .9, rot=hrot)   # brass eye rim
            cv.cone(HL(-1.5, 8.2, 6.4 * sgn), HL(-4, 14.5, 8.6 * sgn), 3.0, .6, hc * .7, flat=.5)   # ear tufts
            cv.cone(HL(5.5, 7.0, 6.2 * sgn), HL(10.6, 4.4, 2.2 * sgn), 1.5, 1.1, hc * .5)          # stern brow
        cv.cone(HL(10.6, -1.2), HL(12.2, -5.2), 2.4, .5, beak)
        for k in range(3): cv.ell(BL(8 - k * 6, -2 - k * .6, 9.6), 1.2, beak)                     # rivets
    elif bat:
        hd = BL(11.5, 6); cv.ell(hd, (8.2, 7.6, 7.6), hc, rot=hrot)
        for sgn in (1, -1):
            e0 = HL(-1, 5.5, 5.0 * sgn); e1 = HL(-3.5, 17, 7.6 * sgn); cv.cone(e0, e1, 4.4, .7, hc, flat=.5); cv.cone(e0 + hrot @ V(1.2, 1, 0), e1 + hrot @ V(.6, -2.5, 0), 2.6, .4, V(240, 150, 180), flat=.4)
            eye(cv, HL(5.2, 1.6, 4.6 * sgn), hrot, 2.7, sgn, V(255, 226, 90)); cv.cone(HL(2.6, 5.4, 5.0 * sgn), HL(7.8, 3.2, 3.6 * sgn), 1.2, .9, hc * .5)
        cv.ell(HL(7.4, -1.6), (3.0, 2.6, 3.6), hc * 1.15, rot=hrot); cv.ell(HL(9.6, -1.0), 1.2, V(240, 150, 180))
        bite = swoop and b in (1, 2)
        if bite: cv.ell(HL(7.0, -4.6), (2.8, 2.2, 3.0), V(150, 40, 60), rot=hrot)
        for sgn in (1, -1): f0 = HL(8.0, -3.2, 1.7 * sgn); cv.cone(f0, f0 + hrot @ V(.2, -3.6 if bite else -2.4, 0), .9, .25, B.WHITE)
    else:
        cv.cone(BL(9, 2), hd, 7.2, 6.6, hc)
        cv.ell(hd, (8.4, 7.8, 7.6), hc, rot=hrot)
        openb = .5 if (swoop and b in (1, 2)) else .08
        cv.cone(HL(6, -.6), HL(12.5, -1.6), 3.5, 2.2, beak); cv.cone(HL(12.5, -1.6), HL(13.6, -5.4), 2.2, .5, beak)      # hooked upper beak
        jr = hrot @ rz(-openb); cv.cone(HL(6, -2.6), HL(6, -2.6) + jr @ V(5.6, -.6, 0), 2.4, 1.0, beak * .86)
        cv.ell(HL(6.6, -.2), (2.2, 2.6, 3.4), V(255, 226, 120))
        for sgn in (1, -1):
            eye(cv, HL(3.6, 1.6, 5.6 * sgn), hrot, 2.5, sgn); cv.cone(HL(.6, 5.2, 5.6 * sgn), HL(7.2, 2.6, 5.0 * sgn), 1.5, 1.1, back * .5)   # stern brow
    (skin_wing if bat else wing)(1)
def eagle(cv, outfit, frame): raptor(cv, frame, None, V(124, 86, 62), V(236, 212, 170), V(250, 246, 238), False, 1.0)
def kite(cv, outfit, frame): raptor(cv, frame, None, V(86, 68, 74), V(204, 112, 70), None, True, .9)
def owl(cv, outfit, frame): raptor(cv, frame, None, V(214, 160, 80), V(252, 238, 196), V(214, 160, 80), False, .95, "owl", V(84, 106, 156))
def bat(cv, outfit, frame): raptor(cv, frame, None, V(78, 60, 116), V(160, 118, 180), None, False, .95, "bat", V(118, 84, 168))
def crab(cv, outfit, frame):
    """King coconut crab, seen from the front: 0-11 scuttle, 12-15 claws up and snap."""
    cv.cel = .4; cv.ink = 1.15
    shell = V(238, 96, 62); dark = V(170, 52, 44); pale = V(255, 214, 170)
    snap = frame >= 12; b = frame - 12; ph = frame / 12 * 2 * math.pi
    bob = 1.6 * abs(math.sin(ph * 2)) if not snap else [0, 3, 5, 2][b]; c = V(0, 15 + bob, 0)
    for side in (1, -1):
        for k in range(3):   # walking legs
            f = ph * 2 + k * 2.1 + (0 if side > 0 else math.pi); lift = max(0, math.sin(f)) * 4 if not snap else 0
            hipj = c + V(side * (11 + k * 1.5), -3, -4 + k * 3.5); knee = hipj + V(side * (9 + k), 5 + lift, -1 + k); foot = knee + V(side * (5 + 2 * math.cos(f) * (0 if snap else 1)), -(knee[1]) + lift * .6, 0)
            cv.cone(hipj, knee, 3.6, 2.9, shell); cv.cone(knee, foot, 2.8, .9, dark)
    def shell_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        col += (pale - col) * np.clip((-y - .25) * 3, 0, 1)[:, None]
        for sx, sy, r in ((-.45, .45, .16), (.4, .5, .13), (0, .62, .1), (-.15, .3, .08), (.62, .2, .09)): col[((x - sx) / r) ** 2 + ((y - sy) / r) ** 2 < 1] = dark
        col[(z > .2) & (np.abs(y + .32 - .25 * x * x) < .05) & (np.abs(x) < .34)] = dark * .6     # a firm little mouth
        return col, None
    cv.ell(c, (19.5, 11.0, 12.5), shell, shader=shell_sh)
    for side in (1, -1):
        st = c + V(side * 5.5, 9, 7); top = st + V(side * 1.2, 7.5 + (1.5 if snap else .8 * math.sin(ph * 2 + side)), 1)
        cv.cone(st, top, 1.6, 1.4, shell); et = top + V(0, 1.8, 1.0); cv.ell(et, 3.5, V(40, 30, 40)); cv.ell(et + V(0, 0, .6), 3.1, V(255, 252, 240)); cv.ell(et + V(-.6 * side, -.2, 2.3), 1.5, V(24, 20, 30))
        cv.cone(top + V(-2.6 * side, 5.2, 2), top + V(2.2 * side, 3.8, 2.4), 1.2, .9, dark)        # brow
        # big claws
        up = (.9 if not snap else [1.0, 1.5, 1.7, 1.2][b]) + .12 * math.sin(ph * 2 + side); sh = c + V(side * 15, 4, 6)
        elb = sh + V(side * 9, 3, 2); hand = elb + V(side * 4.5 * math.cos(up), 11 * math.sin(up), 3)
        cv.cone(sh, elb, 3.6, 3.2, shell); cv.cone(elb, hand, 3.2, 3.8, shell)
        gape = .2 + (.55 if (snap and b in (0, 2)) else (.25 if not snap and math.sin(ph * 3 + side) > .5 else 0))
        cl = hand + V(side * 2.5, 5, 1); cv.ell(cl, (9.0, 7.6, 6.2), shell)
        for sgn2, ln in ((1, 10.5), (-1, 8.5)):
            ang = 1.57 - side * .25 + sgn2 * gape * (1 if side > 0 else -1) * .0 + sgn2 * gape; tip = cl + V(math.cos(ang) * ln * .55 * side * -1 * 0 + side * sgn2 * gape * 5, ln, 0)
            cv.cone(cl + V(side * sgn2 * 3.0, 3.5, 0), tip + V(0, 2, 0), 4.8 if sgn2 > 0 else 3.6, .8, shell if sgn2 > 0 else dark)
def ghost(cv, outfit, frame):
    """Little Ghost: a soft round spirit with big eyes, rosy cheeks, a scalloped hem, a wispy tail and a green scarf."""
    cv.cel = .25; cv.ink = .95
    p = B.pose(frame, "runner"); mode = p["mode"]; ph = p["ph"]; b = p["b"]
    white = V(246, 250, 255); shade = V(190, 208, 246); pink = V(255, 170, 190)
    y0 = 38 + (3.2 * math.sin(ph) if mode == "run" else 1.6 * b) + (11 if mode == "jump" else 0) + (4 * b if mode == "cheer" else 0)
    lean = {"run": .24, "jump": -.06, "slide": 1.0, "cheer": 0, "idle": .04}.get(mode, 0)
    if mode == "slide": y0 = 17
    c = V(0, y0, 0); rot = rz(-lean)
    def BL(x, y, z=0): return c + rot @ V(x, y, z)
    wave = math.sin(ph) if mode == "run" else (.5 - b)
    # wispy tail curling back
    tail = [BL(-4, -12), BL(-11, -17 + 2 * wave), BL(-18, -19 + 3.5 * wave), BL(-24, -17 + 5 * wave), BL(-27, -13 + 6 * wave)]
    B2.chain(cv, tail, [8.5, 6.4, 4.4, 2.6, 1.0], white)
    for k, (x, z) in enumerate(((5, 6.5), (7.5, 0), (5, -6.5), (-1, 8), (-1, -8))):   # scalloped hem
        cv.ell(BL(x, -14 + 1.2 * math.sin(ph + k * 1.3), z), (4.4, 4.2, 4.4), white)
    def body_sh(q, col):
        col = col.copy(); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        col += (shade - col) * (np.clip((-y - .2) * 1.6, 0, 1) * .7)[:, None]
        blink = p["blink"]; openm = mode in ("jump", "cheer", "slide") or p["mouth"] == "open"
        for side in (1, -1):
            az = .46 * side; e = V(math.cos(az) * .93, .22, math.sin(az) * .93); th_ = V(-math.sin(az), 0, math.cos(az)); du = q @ th_; dv = y - e[1]; front = (q @ e) > .5
            if blink: col[front & (np.abs(dv - .5 * du * du) < .035) & (np.abs(du) < .2)] = V(40, 44, 80)
            else:
                eyem = front & ((du / .2) ** 2 + (dv / .27) ** 2 < 1); col[eyem] = V(36, 40, 84)
                col[eyem & (((du + .05) / .06) ** 2 + ((dv - .1) / .08) ** 2 < 1)] = V(255, 255, 255); col[eyem & (((du - .05) / .035) ** 2 + ((dv + .1) / .04) ** 2 < 1)] = V(200, 214, 255)
            ch = V(math.cos(az * 1.7) * .9, -.14, math.sin(az * 1.7) * .9); gg = np.exp(-(((q - ch) ** 2).sum(1)) / .022); col += (pink - col) * (gg * .75)[:, None]
        m = (x > .8) & (np.abs(z) < (.11 if openm else .09)) & ((y + (.2 if openm else .12)) ** 2 < (.012 if openm else .0016) + (0 if openm else 0))
        col[m] = V(150, 60, 90) if openm else V(60, 60, 100)
        return col, None
    cv.ell(BL(0, 1.5), (13.0, 17.0, 12.0), white, rot=rot, shader=body_sh)
    for sgn in (1, -1):   # little arms
        up = mode in ("cheer", "jump"); th = (-.7 * math.sin(ph) * sgn) if mode == "run" else .3
        sh = BL(1, -5.5, 11.2 * sgn); hand = sh + (V(1.5, 8.5, 6.5 * sgn) if up else 7.0 * B.down(th + .5, .7 * sgn)); cv.cone(sh, hand, 2.9, 2.5, white); cv.ell(hand, 2.8, white)
    # scarf, in the colour the game can tint
    cv.ell(BL(1.5, -8.5), (12.6, 3.2, 12.2), B.GREEN, rot=rot)
    s0 = BL(-8, -8, 6); prev = s0
    for j in range(1, 5):
        nxt = s0 + V(-5.5 * j, 2.4 * math.sin(j * 1.1 + ph) + (3 if mode == "jump" else 0) * j * .4, -1.2 * j); cv.cone(prev, nxt, 3.4 - .4 * j, 3.1 - .4 * j, B.GREEN if j < 4 else B.GREEN_D, flat=.55); prev = nxt
JOBS = dict(B4.JOBS); JOBS.update({k: (lambda cv, o, f, k=k: crowd(cv, k, f)) for k in CROWD}); JOBS.update(pixel=pixel, ray=ray, pursuit=car, scooter=scooter, bike=bike, cow=cow, goat=goat, dog=dog, camel=camel, duck=duck, rickshaw=rickshaw, oxcart=oxcart, rover=rover, jaguar=lambda cv, o, f: B4.bigcat(cv, "jaguar", f)); JOBS.update(boar=boar, croc=croc, eagle=eagle, kite=kite, owl=owl, bat=bat, crab=crab, ghost=B4.inked(ghost, .95)); JOBS.update(hatch=B4.inked(hatch), cobra=cobra, anaconda=anaconda, clock=sentinel, stalker=B4.stalker)
def cell(fn, yaw=B.YAW):
    cv = B4.Canvas(yaw=yaw); fn(cv); return cv.image()
def split(j):
    kind, outfit = (j.split("/") + ["plain"])[:2]; return kind, outfit, j.replace("/", "_")
if __name__ == "__main__":
    out, mode = sys.argv[1], sys.argv[2]; q = int(os.environ.get("BAKE_Q", 84))
    for j in sys.argv[3:]:
        kind, outfit, name = split(j)
        if mode == "strip4":   # four frames in a row: light street traffic and the three wrecks
            jobs = [(kind, outfit, f) for f in range(4)] if kind != "wrecks" else [("pursuit", o, 0) for o in ("wreck:taxi", "wreck2:hatch", "wreck3:van", "wreck:hatch")]
            atlas = Image.new("RGBA", (B.OW * 4, B.OH))
            for i, (kk, oo, ff) in enumerate(jobs): atlas.paste(cell(lambda cv: JOBS[kk](cv, oo, ff)), (i * B.OW, 0))
            atlas.save(f"{out}/{'pursuit_wreck' if kind == 'wrecks' else 'street_' + name}.webp", quality=q, method=6); print(mode, j, "ok", flush=True); continue
        if mode == "one":      # a single frame, for props
            atlas = cell(lambda cv: JOBS[kind](cv, outfit, 0)); atlas.save(f"{out}/{name}.webp", quality=q, method=6); print(mode, j, "ok", flush=True); continue
        if mode == "chomp":    # the red dino's zoomed poses: stand, leap, jaws, jaws
            atlas = Image.new("RGBA", (B.OW * 4, B.OH))
            for i, f in enumerate((15, 12, 13, 14)): atlas.paste(cell(lambda cv: JOBS[kind](cv, outfit, f)), (i * B.OW, 0))
            fw = B.OW; boxes = [atlas.crop((i * fw, 0, (i + 1) * fw, B.OH)).getbbox() for i in range(4)]; k = fw / 256; pad = int(3 * k)
            x0 = max(0, min(b[0] for b in boxes) - pad); y0 = max(0, min(b[1] for b in boxes) - pad); x1 = min(fw, max(b[2] for b in boxes) + pad); y1 = min(B.OH, max(b[3] for b in boxes) + pad)
            cut = Image.new("RGBA", ((x1 - x0) * 4, y1 - y0))
            for i in range(4): cut.paste(atlas.crop((i * fw + x0, y0, i * fw + x1, y1)), (i * (x1 - x0), 0))
            cut.save(f"{out}/chomp_{name}.webp", quality=q, method=6); print("BOX", j, round(x0 / k, 2), round(y0 / k, 2), round((x1 - x0) / k, 2), round((y1 - y0) / k, 2), flush=True); continue
        if mode in ("sheet", "film"):
            atlas = Image.new("RGBA", (B.OW * 4, B.OH * 4))
            for f in range(16): atlas.paste(cell(lambda cv: JOBS[kind](cv, outfit, f)), (f % 4 * B.OW, f // 4 * B.OH))
        else:
            frames = (10, 12, 13, 14) if mode == "close" else (10, 11, 13, 14); atlas = Image.new("RGBA", (B.OW * 4, B.OH))
            for i, f in enumerate(frames):
                if mode == "npc": im = cell(lambda cv: npc(cv, kind, f), FRONT - .1)
                else: im = cell(lambda cv: JOBS[kind](cv, outfit, f), FRONT if mode == "front" else B.YAW)
                atlas.paste(im, (i * B.OW, 0))
            name = {"front": "front_", "close": "close_", "npc": "npc_"}[mode] + name
        if mode == "film": name = "film_" + name
        if mode == "front" and os.environ.get("FRONT_CROP"):
            # Big portraits: keep only the part of each cell the character uses, and report that box
            # (in 256x168 cell pixels) so the game can place it. Printed as: BOX key x y w h
            fw = B.OW; boxes = [atlas.crop((i * fw, 0, (i + 1) * fw, B.OH)).getbbox() for i in range(4)]; k = fw / 256; pad = int(3 * k)
            x0 = max(0, min(b[0] for b in boxes) - pad); y0 = max(0, min(b[1] for b in boxes) - pad); x1 = min(fw, max(b[2] for b in boxes) + pad); y1 = min(B.OH, max(b[3] for b in boxes) + pad)
            cut = Image.new("RGBA", ((x1 - x0) * 4, y1 - y0))
            for i in range(4): cut.paste(atlas.crop((i * fw + x0, y0, i * fw + x1, y1)), (i * (x1 - x0), 0))
            atlas = cut; print("BOX", j, round(x0 / k, 2), round(y0 / k, 2), round((x1 - x0) / k, 2), round((y1 - y0) / k, 2), flush=True)
        atlas.save(f"{out}/{name}.webp", quality=q, method=6); print(mode, j, "ok", flush=True)
