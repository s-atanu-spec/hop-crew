"""Pack src/ into one self-contained play.html (index.html is the hand-written landing page). Run from the project root: python3 tools/build.py"""
import base64, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = root / "src"
page = (src / "index.template.html").read_text(encoding="utf-8")
page = re.sub(r"/\*@@css:([\w.-]+)@@\*/", lambda m: (src / "css" / m.group(1)).read_text(encoding="utf-8"), page)
while re.search(r"/\*@@js:[\w.-]+@@\*/", page):   # a script may include another script
    page = re.sub(r"/\*@@js:([\w.-]+)@@\*/", lambda m: (src / "js" / m.group(1)).read_text(encoding="utf-8"), page)
page = re.sub(r"@@asset:([\w./-]+)@@", lambda m: base64.b64encode((src / "assets" / m.group(1)).read_bytes()).decode(), page)
(root / "play.html").write_text(page, encoding="utf-8")
print("play.html", round(len(page) / 1e6, 2), "MB")
