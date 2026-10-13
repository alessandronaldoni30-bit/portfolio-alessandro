#!/usr/bin/env python3
"""
Genera le versioni web delle foto del portfolio.

Per ogni immagine in public/foto/ crea in public/img/ (stesso percorso):
  <nome>-800.webp   -> griglie e anteprime
  <nome>-1600.webp  -> foto grandi, hero, lightbox
e scrive data/images.json con le dimensioni originali (evita salti di layout).

Uso (dalla root del progetto):  python3 scripts/optimize-images.py
Richiede: pip install pillow
Rigenera solo i file mancanti o più vecchi dell'originale.
"""
import json, os, sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "foto"
DST = ROOT / "public" / "img"
META = ROOT / "data" / "images.json"
SIZES = [(800, 72), (1600, 78)]
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

meta, made = {}, 0
for f in sorted(SRC.rglob("*")):
    if f.suffix.lower() not in EXTS or not f.is_file():
        continue
    rel = f.relative_to(SRC)
    with Image.open(f) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        meta["/foto/" + rel.as_posix()] = [im.width, im.height]
        for w, q in SIZES:
            out = DST / rel.parent / f"{rel.stem}-{w}.webp"
            if out.exists() and out.stat().st_mtime >= f.stat().st_mtime:
                continue
            out.parent.mkdir(parents=True, exist_ok=True)
            t = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            t.save(out, "WEBP", quality=q, method=6)
            made += 1

META.write_text(json.dumps(meta, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
print(f"{len(meta)} foto, {made} file generati")
