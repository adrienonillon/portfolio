# Génère les miniatures (carrousel, explorateur) des images principales des projets.
# À relancer après l'ajout ou le changement d'une image de projet :  py scripts/miniatures.py
# Lit les lignes « image: asset("…") » de src/data/projects.js et écrit public/assets/miniatures/<même chemin>.webp
# (720 px) et <même chemin>@360.webp (360 px)
import os
import re
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "public", "assets")
OUT = os.path.join(ASSETS, "miniatures")
MAX_WIDTH = 720  # carte du carrousel : 460 px au plus, affichée jusqu'à 1,5× sur écran dense

source = open(os.path.join(ROOT, "src", "data", "projects.js"), encoding="utf-8").read()
files = re.findall(r'^    image: asset\("([^"]+)"\)', source, flags=re.M)

# Deux largeurs : le navigateur choisit selon la taille affichée (petites cartes sur mobile, grandes sur ordinateur)
WIDTHS = {"": MAX_WIDTH, "@360": 360}

for file in files:
    src = os.path.join(ASSETS, file)
    base = Image.open(src)
    base = base.convert("RGBA" if base.mode in ("RGBA", "LA", "P") else "RGB")
    sizes = []
    for suffix, width in WIDTHS.items():
        dst = os.path.join(OUT, os.path.splitext(file)[0] + suffix + ".webp")
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        im = base
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        im.save(dst, "WEBP", quality=80, method=6)
        sizes.append(f"{os.path.getsize(dst) // 1024} Ko")
    print(f"{os.path.getsize(src) // 1024:5d} Ko -> {' / '.join(sizes):14s} {file}")
