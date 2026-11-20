"""Hop Crew checks. Opens the built play.html in headless Chrome and exercises it offline.
Needs: pip install playwright, and a Chrome or Chromium binary (set CHROME to its path if it is not found).
Run from anywhere: python3 tools/tests/check.py            (add --shots to also write docs/screenshots)
The console message ERR_FILE_NOT_FOUND is expected when the page is opened from a file."""
import asyncio, os, shutil, sys
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHROME = os.environ.get("CHROME") or shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")
ARGS = ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]

async def page(browser, size):
    ctx = await browser.new_context(viewport=size, offline=True); pg = await ctx.new_page(); pg.errs = []
    pg.on("pageerror", lambda e: pg.errs.append((e.stack or str(e))[:400]))
    await pg.goto("file://" + os.path.join(ROOT, "play.html"), wait_until="load", timeout=120000); await pg.wait_for_timeout(3000)
    await pg.evaluate("()=>{try{closeFilm();me.scenes=false;me.tutorialDone=true;me.stage=15}catch(e){}}"); return pg

CHECKS = {
 "every path draws, main road and side trail": """async()=>{const bad=[];for(let l=1;l<=routes.length;l++){try{me.selected=l;g=null;setMode('ready');start();endIntro();
     for(const t of [5,12,20,33,40,50,60,70]){g.d=distanceAt(t);g.time=t;render()} if(detours[l]){g.show=g.show||{};g.show.branch='spur';g.d=distanceAt(44);render()}}catch(e){bad.push('path '+l+': '+e.message)}}return bad}""",
 "every rival draws": """()=>{const bad=[];for(const k of new Set([...Object.keys(encounters),...routeFoes.flat(),'crab','ape']))for(const dive of [0,.5,1])for(const m of [false,true]){
     try{drawFoe(k,300,300,1,m,3.3,dive)}catch(e){bad.push(k+': '+e.message)}}return bad}""",
 "every runner and outfit has a sheet": """()=>{const bad=[];for(const r of runnerList){me.found=3;me.rider=r.id;for(const w of (wearSets[r.kind].length?wearSets[r.kind]:[['x']])){
     if(r.kind==='kid')me.kidWear=w[0];if(r.kind==='girl')me.girlWear=w[0];if(r.kind==='bot')me.botWear=w[0];if(r.kind==='dino')me.wear=w[0];if(!bakedCast[riderKey(1,false)])bad.push('no sheet '+riderKey(1,false))}}return bad}""",
 "path life never overlaps (one speed per lane, clear gaps)": """()=>{const bad=[];for(let zone=0;zone<31;zone++){const cast=lifeCastOf(zone);if(!cast)continue;const P=cast.period,lanes={},rows={};
     cast.forEach(o=>{if(o.fixed)(rows[o.z]??=[]).push(o.at);else(lanes[o.z]??=[]).push(o)});
     for(const z in lanes){const L=lanes[z];if(new Set(L.map(o=>o.v)).size>1)bad.push('zone '+zone+' lane '+z+' mixed speeds');
       for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=wrap(L[i].at,P),c=wrap(L[j].at,P),gap=Math.min(Math.abs(a-c),P-Math.abs(a-c));if(gap<150)bad.push('zone '+zone+' lane '+z+' gap '+Math.round(gap))}}
     for(const z in rows){const F=rows[z].sort((a,c)=>a-c);for(let i=1;i<F.length;i++)if(F[i]-F[i-1]<100)bad.push('zone '+zone+' row '+z+' gap '+Math.round(F[i]-F[i-1]))}}return bad}""",
 "path life sits in front of the 3D scenery": """()=>{const bad=[];for(let zone=0;zone<31;zone++){const cast=lifeCastOf(zone);if(!cast||zone===12)continue;const far=Math.max(...cast.map(o=>o.z))+.15,t=buildWorld(zone).tile,S=11;let hit=0;
     for(let i=0;i+3*S<=t.length;i+=3*S){let y1=-9,y0=99,z0=99,z1=-99;for(let k=0;k<3;k++){const y=t[i+k*S+1],z=t[i+k*S+2];y1=Math.max(y1,y);y0=Math.min(y0,y);z0=Math.min(z0,z);z1=Math.max(z1,z)}
       if(y1>=.35&&y0<=3.4&&z1>=.9&&z0<far)hit++}if(hit)bad.push('zone '+zone+': '+hit+' scenery triangles nearer than '+far.toFixed(2))}return bad}""",
 "sticker pack builds": """async()=>{me.stickers={};for(let i=1;i<=21;i++)me.stickers[i]=1+i%2;const p=await stickerPictures();return p.length===23&&p.every(x=>x.data.length>200)?[]:['pack has '+p.length+' files']}""",
}
GO = "()=>{window.tick=window.__t||window.tick;window.__t=window.tick;me.rider=%d;me.selected=%d;g=null;setMode('ready');fakeFull=true;syncFullscreen();start();endIntro();g.safetyUntil=1e9;g.next=1e12;g.items=[];g.d=%d;window.tick=()=>{}}"
SHOTS = [("neon-causeway", GO % (6, 13, 900)), ("parade", GO % (5, 19, 1500)), ("tea-garden", GO % (6, 6, 1500)), ("festival-lane", GO % (0, 10, 1500)), ("midnight-city", GO % (5, 21, 1500)), ("mars-relay", GO % (3, 14, 1500)),
         ("tropical-island", GO % (6, 18, 1500)), ("firefly-courtyard", GO % (5, 12, 2400)),
         ("sticker-book", "()=>{window.tick=window.__t;fakeFull=false;syncFullscreen();g=null;setMode('menu');me.stickers={};for(let i=1;i<=21;i++)me.stickers[i]=i%4?1+(i%3===0):0;openJourney()}")]
async def main():
    if not CHROME: sys.exit("No Chrome found. Set CHROME to the browser path.")
    failed = 0
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=ARGS); pg = await page(b, {"width": 1100, "height": 860})
        for name, js in CHECKS.items():
            bad = await pg.evaluate(js); failed += bool(bad); print(("FAIL " if bad else "pass ") + name + ("" if not bad else ": " + "; ".join(bad[:6])))
        if pg.errs: failed += 1; print("FAIL page errors:", pg.errs[:4])
        if "--shots" in sys.argv:
            pg = await page(b, {"width": 1280, "height": 720})
            for name, js in SHOTS:
                await pg.evaluate(js); await pg.wait_for_timeout(1600); await pg.screenshot(path=os.path.join(ROOT, "docs", "screenshots", name + ".jpg"), type="jpeg", quality=82); print("shot", name)
        await b.close()
    print("ALL PASS" if not failed else str(failed) + " FAILED"); sys.exit(1 if failed else 0)
asyncio.run(main())
