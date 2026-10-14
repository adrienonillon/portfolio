# Génère les miniatures (carrousel, explorateur) des images principales des projets.
# À relancer après l'ajout ou le changement d'une image de projet :  py scripts/miniatures.py
# Lit les lignes « image: asset("…") » de src/data/projects.js et écrit public/assets/miniatures/<même chemin>.webp
import os
import re
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "public", "assets")
OUT = os.path.join(ASSETS, "miniatures")
MAX_WIDTH = 720  # carte du carrousel : 460 px au plus, affichée jusqu'à 1,5× sur écran dense

source = open(os.path.join(ROOT, "src", "data", "projects.js"), encoding="utf-8").read()
files = re.findall(r'^    image: asset\("([^"]+)"\)', source, flags=re.M)

for file in files:
    src = os.path.join(ASSETS, file)
    dst = os.path.join(OUT, os.path.splitext(file)[0] + ".webp")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im = Image.open(src)
    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
    if im.width > MAX_WIDTH:
        im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=80, method=6)
    print(f"{os.path.getsize(src) // 1024:5d} Ko -> {os.path.getsize(dst) // 1024:4d} Ko  {file}")
