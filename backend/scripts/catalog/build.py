# Construit le catalogue « top 100 marques × 20 parfums » à partir du jeu Parfumo (TidyTuesday)
# et des photos du jeu doevent/perfume (licence MIT).
#
# Utilisation (dans un dossier de travail, hors du dépôt) :
#   curl -L -o parfumo.csv https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2024/2024-12-10/parfumo_data_clean.csv
#   curl -L -o doevent.csv https://huggingface.co/datasets/doevent/perfume/resolve/main/perfumes.csv
#   curl -L -o images.zip  https://huggingface.co/datasets/doevent/perfume/resolve/main/images.zip   (≈ 875 Mo)
#   curated.json : liste [marque, nom] des parfums saisis à la main, pour éviter les doublons
#   pip install pillow numpy scipy && python build.py
import csv, collections, unicodedata, re, json, zipfile, io, hashlib, sys, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
import os
from fr import note as fr_note, accord as fr_accord

csv.field_size_limit(10**9)
OUT_IMG = os.path.join(os.path.dirname(__file__), "../../../frontend/public/bottles")
OUT_JSON = os.path.join(os.path.dirname(__file__), "../../prisma/data/catalog.json")
PER_BRAND = 20
TOP_BRANDS = 100

KEEP_CONC = {"NA", "Eau de Toilette", "Eau de Parfum", "Parfum", "Perfume Oil", "Perfume", "Extrait de Parfum",
             "Eau de Cologne", "Cologne", "Eau Fraîche", "Eau de Parfum Intense", "Eau de Toilette Intense"}
CONC = {"Eau de Toilette": "EAU_DE_TOILETTE", "Eau de Toilette Intense": "EAU_DE_TOILETTE",
        "Eau de Parfum": "EAU_DE_PARFUM", "Eau de Parfum Intense": "EAU_DE_PARFUM", "Parfum": "PARFUM",
        "Perfume": "PARFUM", "Extrait de Parfum": "EXTRAIT", "Perfume Oil": "PERFUME_OIL",
        "Eau de Cologne": "EAU_DE_COLOGNE", "Cologne": "EAU_DE_COLOGNE", "Eau Fraîche": "EAU_DE_COLOGNE"}

# Noms de marques alignés sur ceux déjà présents dans la base
BRAND_ALIASES = {"XerJoff": "Xerjoff", "Kilian": "Kilian Paris", "Initio": "Initio Parfums Privés",
                 "Estēe Lauder": "Estée Lauder", "Jo Malone": "Jo Malone London",
                 "Editions de Parfums Frédéric Malle": "Frédéric Malle", "Nicolaï / Parfums de Nicolaï": "Parfums de Nicolaï"}


def ascii_(s):
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()


def slugify(s):
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", ascii_(s).lower()))


def key(s):
    s = ascii_(s).lower()
    s = re.sub(r"\b(eau de parfum|eau de toilette|edp|edt|extrait de parfum|parfum|cologne|xj 1861)\b", "", s)
    return re.sub(r"[^a-z0-9]+", "", s)


def brand_name(raw):
    return BRAND_ALIASES.get(raw, raw.split(" / ")[0].strip())


def num(x):
    try:
        return float(x)
    except ValueError:
        return 0.0


def clean_name(name, brand_raw):
    core = brand_raw.split(" / ")[0]
    m = re.match(r"^(.*?)\s+" + re.escape(core) + r"\s+(\d{4})\s+.*$", name)
    if m:
        name = m.group(1)
    name = name.strip().lstrip(", ").strip()
    # Le jeu Parfumo supprime le nom de la marque quand il termine le nom du parfum
    # (« Le Lion de Chanel » → « Le Lion de ») : on le remet
    for piece in brand_raw.split(" / ")[1:]:
        if name.endswith(" " + piece.rsplit(" ", 1)[0]):
            name = name[: -len(piece.rsplit(" ", 1)[0])].rstrip()
    if name.endswith(" " + core.split(" ")[0] + " /"):
        name = name.rsplit(" ", 2)[0]
    if re.search(r"(\s(de|by|of|pour|for|di|du)|\sd'|^l'eau de)$", name, re.I) or name.lower() in ("eau de", "l'eau de"):
        name = f"{name} {core}"
    return name


def notes(field):
    if field == "NA":
        return []
    out, seen = [], set()
    for n in field.split(","):
        fr = fr_note(n)
        if fr and fr not in seen:
            seen.add(fr)
            out.append(fr)
    return out


# ─── Sélection ───────────────────────────────────────────
rows = list(csv.DictReader(open("parfumo.csv", encoding="utf-8", errors="replace")))
rows = [r for r in rows if r["Concentration"] in KEEP_CONC]
pop = collections.Counter()
for r in rows:
    pop[r["Brand"]] += num(r["Rating_Count"])
brands = [b for b, _ in pop.most_common(TOP_BRANDS)]

curated = json.load(open("curated.json"))  # [(marque, nom)] déjà saisis à la main
curated_keys = {(key(b), key(n)) for b, n in curated}

selection = []
for b in brands:
    cand = [r for r in rows if r["Brand"] == b and any(r[k] != "NA" for k in ("Top_Notes", "Middle_Notes", "Base_Notes"))]
    cand.sort(key=lambda r: -num(r["Rating_Count"]))
    seen, picked = set(), []
    for r in cand:
        name = clean_name(r["Name"], b)
        k = (key(brand_name(b)), key(name))
        if not name or k in seen or k in curated_keys:
            continue
        seen.add(k)
        picked.append((r, name))
        if len(picked) == PER_BRAND:
            break
    selection += [(b, r, name) for r, name in picked]
print("sélection", len(selection), file=sys.stderr)

# ─── Photos (jeu doevent, MIT) ───────────────────────────
de = list(csv.DictReader(open("doevent.csv", encoding="utf-8"), delimiter="|"))
de_idx = {}
for r in de:
    de_idx.setdefault((key(r["brand"]), key(r["name_perfume"])), r)
zf = zipfile.ZipFile("images.zip")


def cutout(im):
    a = np.asarray(im).astype(int)
    mn, mx = a.min(2), a.max(2)
    bg_like = (mn > 240) & (mx - mn < 12)
    # Fond = zones claires reliées au bord de l'image (étiquetage vectorisé, bien plus rapide)
    labels, _ = ndimage.label(bg_like)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    border = border[border > 0]
    fg = ~np.isin(labels, border)
    fg = ndimage.binary_opening(fg, iterations=1)
    # Bouche les trous intérieurs (verre clair, étiquettes blanches) colonne par colonne
    b = np.maximum.accumulate(fg, 0)
    c = np.flip(np.maximum.accumulate(np.flip(fg, 0), 0), 0)
    fg = fg | (b & c)
    if fg.mean() < 0.03 or fg.mean() > 0.97:
        return None  # détourage impossible (fond non blanc ou image vide)
    alpha = Image.fromarray(np.where(fg, 255, 0).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    rgba = im.convert("RGBA")
    rgba.putalpha(alpha)
    bbox = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
    return rgba.crop(bbox) if bbox else None


def describe(rgba):
    """Forme 3D et couleurs déduites de la silhouette."""
    a = np.asarray(rgba)
    alpha = a[:, :, 3] > 128
    h, w = alpha.shape
    widths = alpha.sum(1)
    body = widths[int(h * 0.35):int(h * 0.95)]
    ratio = h / max(1, widths.max())
    spread = body.std() / max(1, body.mean())
    if spread > 0.12:
        shape = "ROUND"
    elif ratio > 2.3:
        shape = "CYLINDER"
    elif ratio < 1.35:
        shape = "SQUARE"
    else:
        shape = "RECTANGLE"

    def avg(y0, y1):
        region = a[int(h * y0):int(h * y1)]
        msk = region[:, :, 3] > 128
        if not msk.any():
            return "#B0B0B0"
        rgb = region[:, :, :3][msk].mean(0)
        return "#%02X%02X%02X" % tuple(int(v) for v in rgb)

    return shape, avg(0.5, 0.9), avg(0.0, 0.15)


PALETTE = ["#C9A15A", "#8B4A1C", "#3A5F8A", "#E8C98A", "#7A0F14", "#1F3A6B", "#D9768A", "#0F5E5A", "#2A2A2A"]

catalog = []
images_done = 0
for brand_raw, r, name in selection:
    brand = brand_name(brand_raw)
    slug = slugify(f"{brand} {name}")
    accords = [fr_accord(x) for x in r["Main_Accords"].split(",")] if r["Main_Accords"] != "NA" else []
    accords = list(dict.fromkeys(accords))[:6]
    match = de_idx.get((key(brand_raw.split(" / ")[0]), key(name))) or de_idx.get((key(brand), key(name)))
    gender = None
    if match:
        gender = {"Male": "MASCULINE", "Female": "FEMININE", "Unisex": "UNISEX"}.get(match["gender"])
    entry = {
        "slug": slug,
        "name": name,
        "brand": brand,
        "year": int(r["Release_Year"]) if r["Release_Year"].isdigit() else None,
        "gender": gender,
        "concentration": CONC.get(r["Concentration"]),
        "rating": round(num(r["Rating_Value"]) / 2, 2) if r["Rating_Value"] != "NA" else None,
        "ratingCount": int(num(r["Rating_Count"])) or None,
        "top": notes(r["Top_Notes"]),
        "heart": notes(r["Middle_Notes"]),
        "base": notes(r["Base_Notes"]),
        # Parfumo ne donne pas d'intensité : les accords sont pondérés selon leur rang
        "accords": {name_: round(100 - i * 14) for i, name_ in enumerate(accords)},
        "imageUrl": None,
    }
    h = int(hashlib.md5(slug.encode()).hexdigest(), 16)
    entry.update(bottleShape="RECTANGLE", liquidColor=PALETTE[h % len(PALETTE)], capColor="#1A1A1A")
    cached = f"{OUT_IMG}/{slug}.webp"
    if os.path.exists(cached):
        try:
            Image.open(cached).verify()
        except Exception:
            os.remove(cached)  # fichier tronqué par une interruption : on le refait
    if match and os.path.exists(cached):
        # Photo déjà détourée lors d'un passage précédent
        shape, liquid, cap = describe(Image.open(cached).convert("RGBA"))
        entry.update(imageUrl=f"/bottles/{slug}.webp", bottleShape=shape, liquidColor=liquid, capColor=cap)
        images_done += 1
    elif match:
        try:
            im = Image.open(io.BytesIO(zf.read("images/" + match["image_name"]))).convert("RGB")
            cut = cutout(im)
            if cut is not None:
                cut.thumbnail((420, 560))
                cut.save(f"{OUT_IMG}/{slug}.webp", "WEBP", quality=82, method=6)
                shape, liquid, cap = describe(cut)
                entry.update(imageUrl=f"/bottles/{slug}.webp", bottleShape=shape, liquidColor=liquid, capColor=cap)
                images_done += 1
        except KeyError:
            pass
    catalog.append(entry)

# Slugs uniques
seen = collections.Counter()
for e in catalog:
    seen[e["slug"]] += 1
assert all(v == 1 for v in seen.values()), [k for k, v in seen.items() if v > 1][:5]

json.dump(catalog, open(OUT_JSON, "w"), ensure_ascii=False, indent=0)
print("parfums", len(catalog), "photos", images_done, "marques", len({e["brand"] for e in catalog}), file=sys.stderr)
