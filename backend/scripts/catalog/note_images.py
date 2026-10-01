# Trouve une photo pour chaque note olfactive (Wikipédia / Wikimedia Commons, licences libres)
# et l'enregistre en vignette ronde dans frontend/public/notes.
#
# Utilisation : python note_images.py notes.json
#   notes.json : [[nom de la note, nombre de parfums], ...] exporté depuis la base
import io, json, os, re, sys, time, unicodedata, urllib.parse, urllib.request
from PIL import Image, ImageOps
from fr import BASE

HERE = os.path.dirname(__file__)
OUT_DIR = os.path.join(HERE, "../../../frontend/public/notes")
OUT_JSON = os.path.join(HERE, "../../prisma/data/note-images.json")
UA = {"User-Agent": "FragranceLab-student-project/1.0 (alexandre.devroye@gmail.com)"}

# Français → terme anglais (dictionnaire inverse de la traduction des notes)
FR_TO_EN = {}
for en, fr in BASE.items():
    FR_TO_EN.setdefault(fr, en)

# Choix manuels : notes abstraites ou ambiguës, illustrées par ce qu'elles évoquent
OVERRIDES = {
    "Musc": "Cotton", "Musc blanc": "Cotton", "Ambre": "Amber", "Ambre blanc": "Amber", "Ambre gris": "Ambergris",
    "Ambroxan": "Ambergris", "Cuir": "Leather", "Cuir blanc": "Leather", "Daim": "Suede", "Oud": "Agarwood",
    "Aldéhydes": "Soap bubble", "Notes marines": "Sea", "Notes aquatiques": "Water", "Note solaire": "Sunlight",
    "Notes boisées": "Wood", "Bois": "Wood", "Bois secs": "Driftwood", "Bois précieux": "Ebony", "Bois blonds": "Birch",
    "Bois ambré": "Amber", "Notes vertes": "Leaf", "Feuilles vertes": "Leaf", "Herbe": "Poaceae", "Épices": "Spice",
    "Fruits": "Fruit", "Notes fruitées": "Fruit", "Fruits rouges": "Berry", "Fruits secs": "Dried fruit",
    "Notes florales": "Flower", "Fleurs": "Flower", "Fleurs blanches": "Jasminum", "Agrumes": "Citrus",
    "Notes poudrées": "Face powder", "Notes animales": "Civet", "Notes cuirées": "Leather", "Résines": "Resin",
    "Accord aérien": "Cloud", "Iso E Super": "Wood", "Cashmeran": "Cashmere wool", "Bois de cachemire": "Cashmere wool",
    "Cachemire": "Cashmere wool", "Hédione": "Jasminum", "Coumarine": "Tonka bean", "Akigalawood": "Patchouli",
    "Fève tonka": "Tonka bean", "Mousse de chêne": "Evernia prunastri", "Mousse d'arbre": "Pseudevernia furfuracea",
    "Mousse": "Moss", "Gaïac": "Guaiacum officinale", "Labdanum": "Cistus ladanifer", "Ciste": "Cistus",
    "Benjoin": "Benzoin (resin)", "Encens": "Frankincense", "Myrrhe": "Myrrh", "Opoponax": "Opopanax",
    "Styrax": "Liquidambar orientalis", "Héliotrope": "Heliotropium arborescens", "Ylang-ylang": "Cananga odorata",
    "Muguet": "Convallaria majalis", "Néroli": "Orange blossom", "Fleur d'oranger": "Orange blossom",
    "Petit-grain": "Bitter orange", "Iris": "Iris germanica", "Racine d'iris": "Orris root", "Beurre d'iris": "Orris root",
    "Tubéreuse": "Polianthes tuberosa", "Œillet": "Dianthus caryophyllus", "Freesia": "Freesia", "Pivoine": "Paeonia",
    "Gardénia": "Gardenia jasminoides", "Osmanthus": "Osmanthus fragrans", "Frangipanier": "Plumeria",
    "Fleur de tilleul": "Tilia", "Ambrette": "Abelmoschus moschatus", "Graine d'ambrette": "Abelmoschus moschatus",
    "Cypriol": "Cyperus scariosus", "Nagarmotha": "Cyperus scariosus", "Papyrus": "Cyperus papyrus",
    "Davana": "Artemisia pallens", "Civette": "Civet", "Castoréum": "Castoreum", "Élémi": "Elemi",
    "Baume de Tolu": "Myroxylon balsamum", "Baume du Pérou": "Balsam of Peru", "Mastic": "Pistacia lentiscus",
    "Santal": "Santalum album", "Cèdre": "Cedrus", "Vétiver": "Vetiver", "Patchouli": "Pogostemon cablin",
    "Bergamote": "Bergamot orange", "Mandarine": "Mandarin orange", "Citron": "Lemon", "Citron vert": "Lime (fruit)",
    "Pamplemousse": "Grapefruit", "Cédrat": "Citron", "Yuzu": "Yuzu", "Orange amère": "Bitter orange",
    "Cardamome": "Cardamom", "Poivre rose": "Schinus molle", "Poivre": "Black pepper", "Poivre noir": "Black pepper",
    "Poivre de Sichuan": "Sichuan pepper", "Safran": "Saffron", "Muscade": "Nutmeg", "Cannelle": "Cinnamon",
    "Clou de girofle": "Clove", "Coriandre": "Coriander", "Gingembre": "Ginger", "Cumin": "Cumin",
    "Vanille": "Vanilla", "Lavande": "Lavandula", "Romarin": "Rosemary", "Sauge sclarée": "Salvia sclarea",
    "Sauge": "Salvia officinalis", "Basilic": "Basil", "Menthe": "Mentha", "Menthe poivrée": "Peppermint",
    "Thym": "Thyme", "Armoise": "Artemisia vulgaris", "Absinthe": "Artemisia absinthium", "Estragon": "Tarragon",
    "Géranium": "Pelargonium graveolens", "Jasmin": "Jasminum officinale", "Jasmin sambac": "Jasminum sambac",
    "Rose": "Rose", "Violette": "Viola odorata", "Feuille de violette": "Viola odorata", "Lys": "Lilium candidum",
    "Magnolia": "Magnolia", "Mimosa": "Acacia dealbata", "Narcisse": "Narcissus poeticus", "Jacinthe": "Hyacinthus orientalis",
    "Orchidée": "Orchidaceae", "Lotus": "Nelumbo nucifera", "Nénuphar": "Nymphaea", "Lilas": "Syringa vulgaris",
    "Chèvrefeuille": "Lonicera periclymenum", "Tiaré": "Gardenia taitensis", "Fleur de cerisier": "Cherry blossom",
    "Tabac": "Tobacco", "Feuille de tabac": "Tobacco", "Fleur de tabac": "Nicotiana", "Café": "Coffee bean",
    "Cacao": "Cocoa bean", "Chocolat": "Chocolate", "Caramel": "Caramel", "Praliné": "Praline (nut confection)",
    "Miel": "Honey", "Rhum": "Rum", "Cognac": "Cognac", "Whisky": "Whisky", "Thé": "Tea", "Thé vert": "Green tea",
    "Thé noir": "Black tea", "Thé blanc": "White tea", "Maté": "Ilex paraguariensis", "Lait": "Milk",
    "Amande": "Almond", "Amande amère": "Bitter almond", "Noisette": "Hazelnut", "Pistache": "Pistachio",
    "Noix de coco": "Coconut", "Pomme": "Apple", "Pomme verte": "Granny Smith", "Poire": "Pear", "Pêche": "Peach",
    "Abricot": "Apricot", "Prune": "Plum", "Cerise": "Cherry", "Framboise": "Raspberry", "Fraise": "Strawberry",
    "Mûre": "Blackberry", "Cassis": "Blackcurrant", "Litchi": "Lychee", "Ananas": "Pineapple", "Mangue": "Mango",
    "Melon": "Melon", "Figue": "Common fig", "Feuille de figuier": "Common fig", "Datte": "Date palm",
    "Dattes": "Date palm", "Grenade": "Pomegranate", "Fruit de la passion": "Passion fruit", "Rhubarbe": "Rhubarb",
    "Goyave": "Guava", "Coing": "Quince", "Nectarine": "Nectarine", "Clémentine": "Clementine", "Kumquat": "Kumquat",
    "Orange": "Orange (fruit)", "Orange sanguine": "Blood orange", "Genévrier": "Juniperus communis",
    "Baie de genièvre": "Juniper berry", "Cyprès": "Cupressus sempervirens", "Pin": "Pinus sylvestris",
    "Sapin": "Abies alba", "Baume de sapin": "Abies balsamea", "Bouleau": "Betula pendula", "Bois de rose": "Aniba rosaeodora",
    "Bois d'olivier": "Olive", "Ébène": "Ebony", "Bois flotté": "Driftwood", "Galbanum": "Galbanum",
    "Anis": "Anise", "Anis étoilé": "Illicium verum", "Carvi": "Caraway", "Angélique": "Angelica archangelica",
    "Eucalyptus": "Eucalyptus", "Laurier": "Laurus nobilis", "Myrte": "Myrtus communis", "Verveine": "Lemon verbena",
    "Camomille": "Chamomile", "Lierre": "Hedera helix", "Sel": "Sea salt", "Riz": "Rice", "Sucre": "Sugar",
    "Sucre brun": "Brown sugar", "Canne à sucre": "Sugarcane", "Guimauve": "Marshmallow",
    "Barbe à papa": "Cotton candy", "Fumée": "Smoke", "Champagne": "Champagne", "Gin": "Gin", "Vin": "Wine",
    "Cire d'abeille": "Beeswax", "Aubépine": "Crataegus monogyna", "Souci": "Calendula officinalis",
    "Tagète": "Tagetes", "Fleur de pommier": "Apple blossom", "Pois de senteur": "Sweet pea",
    "Trèfle": "Trifolium", "Liqueur de cerise": "Cherry liqueur", "Cerise noire": "Cherry", "Griotte": "Sour cherry",
    "Caramel au beurre": "Toffee", "Fruits confits": "Candied fruit", "Accord caïpirinha": "Caipirinha",
    "Menthe verte": "Spearmint", "Pamplemousse rose": "Grapefruit",
}

# Qualificatifs retirés pour retrouver l'ingrédient de base (« Bergamote de Calabre » → « Bergamote »)
SUFFIXES = re.compile(
    r"\s+(de|d'|du|des)\s.*$|\s+(turque|absolue|concrète|Bourbon|\(huile\)|\(essence\)|\(extrait\)|sauvage|blanche?|noire?|rouge|verte?)$",
    re.I,
)


def base_of(name):
    candidates = [name]
    current = name
    while True:
        stripped = SUFFIXES.sub("", current).strip()
        if stripped == current or not stripped:
            break
        candidates.append(stripped)
        current = stripped
    for c in candidates:
        if c in OVERRIDES:
            return c, OVERRIDES[c]
    for c in candidates:
        if c in FR_TO_EN:
            return c, FR_TO_EN[c]
    # Notes laissées en anglais par la traduction
    if re.fullmatch(r"[A-Za-z' -]+", name):
        return name, name
    return None, None


def api(params):
    url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({**params, "format": "json"})
    for attempt in range(3):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20))
        except Exception:
            time.sleep(2 * (attempt + 1))
    return {}


def find_image(term):
    """Photo principale de la page Wikipédia la plus pertinente pour le terme."""
    r = api({"action": "query", "titles": term, "redirects": 1, "prop": "pageimages|info", "piprop": "thumbnail",
             "pithumbsize": 400, "inprop": "url"})
    pages = list(r.get("query", {}).get("pages", {}).values())
    page = pages[0] if pages else {}
    if "thumbnail" not in page:
        r = api({"action": "query", "generator": "search", "gsrsearch": term, "gsrlimit": 1, "prop": "pageimages|info",
                 "piprop": "thumbnail", "pithumbsize": 400, "inprop": "url"})
        pages = list(r.get("query", {}).get("pages", {}).values())
        page = pages[0] if pages else {}
    if "thumbnail" not in page:
        return None
    return {"thumb": page["thumbnail"]["source"], "page": page.get("fullurl"), "title": page.get("title")}


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", s))


def main():
    notes = json.load(open(sys.argv[1]))
    os.makedirs(OUT_DIR, exist_ok=True)
    by_base, result = {}, {}
    for name, count in notes:
        base, term = base_of(name)
        if not term:
            continue
        if base not in by_base:
            info = find_image(term)
            if info:
                slug = slugify(base)
                path = os.path.join(OUT_DIR, f"{slug}.webp")
                if not os.path.exists(path):
                    try:
                        data = urllib.request.urlopen(urllib.request.Request(info["thumb"], headers=UA), timeout=30).read()
                        im = Image.open(io.BytesIO(data)).convert("RGB")
                        ImageOps.fit(im, (240, 240), Image.LANCZOS).save(path, "WEBP", quality=82)
                    except Exception:
                        info = None
                if info:
                    info["imageUrl"] = f"/notes/{slug}.webp"
            by_base[base] = info
            time.sleep(0.15)  # requêtes espacées par politesse envers l'API
        info = by_base[base]
        if info:
            result[name] = {"imageUrl": info["imageUrl"], "source": info["page"], "subject": info["title"]}
    json.dump(result, open(OUT_JSON, "w"), ensure_ascii=False, indent=1)
    covered = sum(c for n, c in notes if n in result)
    print(f"{len(result)}/{len(notes)} notes illustrées, {len({v['imageUrl'] for v in result.values()})} images, "
          f"{round(covered / sum(c for _, c in notes) * 100)} % des apparitions", file=sys.stderr)


if __name__ == "__main__":
    main()
