# Traduction des notes et accords Parfumo (anglais) vers le français du site
import re

BASE = {
    "musk": "Musc", "white musk": "Musc blanc", "bergamot": "Bergamote", "patchouli": "Patchouli",
    "sandalwood": "Santal", "vanilla": "Vanille", "amber": "Ambre", "jasmine": "Jasmin", "vetiver": "Vétiver",
    "rose": "Rose", "tonka bean": "Fève tonka", "mandarin orange": "Mandarine", "mandarin": "Mandarine",
    "cedarwood": "Cèdre", "cedar": "Cèdre", "lemon": "Citron", "cardamom": "Cardamome", "frankincense": "Encens",
    "incense": "Encens", "iris": "Iris", "pink pepper": "Poivre rose", "orange blossom": "Fleur d'oranger",
    "lavender": "Lavande", "leather": "Cuir", "oakmoss": "Mousse de chêne", "lily of the valley": "Muguet",
    "ylang-ylang": "Ylang-ylang", "benzoin": "Benjoin", "cinnamon": "Cannelle", "violet": "Violette",
    "grapefruit": "Pamplemousse", "geranium": "Géranium", "oud": "Oud", "agarwood": "Oud", "neroli": "Néroli",
    "saffron": "Safran", "labdanum": "Labdanum", "ambergris": "Ambre gris", "nutmeg": "Muscade",
    "coriander": "Coriandre", "heliotrope": "Héliotrope", "ginger": "Gingembre", "black pepper": "Poivre noir",
    "orange": "Orange", "peach": "Pêche", "blackcurrant": "Cassis", "tuberose": "Tubéreuse", "carnation": "Œillet",
    "freesia": "Freesia", "tobacco": "Tabac", "gaiac wood": "Gaïac", "guaiac wood": "Gaïac", "clove": "Clou de girofle",
    "pepper": "Poivre", "plum": "Prune", "clary sage": "Sauge sclarée", "pear": "Poire", "magnolia": "Magnolia",
    "violet leaf": "Feuille de violette", "moss": "Mousse", "rosemary": "Romarin", "petitgrain": "Petit-grain",
    "apple": "Pomme", "basil": "Basilic", "juniper berry": "Baie de genièvre", "peony": "Pivoine",
    "galbanum": "Galbanum", "myrrh": "Myrrhe", "sage": "Sauge", "raspberry": "Framboise", "aldehydes": "Aldéhydes",
    "bitter orange": "Orange amère", "lime": "Citron vert", "honey": "Miel", "cypress": "Cyprès",
    "orris root": "Racine d'iris", "orris": "Iris", "woods": "Bois", "gardenia": "Gardénia", "cistus": "Ciste",
    "mint": "Menthe", "rosewood": "Bois de rose", "green notes": "Notes vertes", "jasmine sambac": "Jasmin sambac",
    "cashmeran": "Cashmeran", "styrax": "Styrax", "cashmere wood": "Bois de cachemire", "lily": "Lys",
    "elemi resin": "Élémi", "elemi": "Élémi", "pineapple": "Ananas", "spices": "Épices", "osmanthus": "Osmanthus",
    "woody notes": "Notes boisées", "thyme": "Thym", "juniper": "Genévrier", "coconut": "Noix de coco",
    "civet": "Civette", "suede": "Daim", "almond": "Amande", "cumin": "Cumin", "tolu balm": "Baume de Tolu",
    "opoponax": "Opoponax", "ambroxan": "Ambroxan", "ambrox": "Ambroxan", "orchid": "Orchidée",
    "narcissus": "Narcisse", "hyacinth": "Jacinthe", "mimosa": "Mimosa", "rum": "Rhum", "caramel": "Caramel",
    "papyrus": "Papyrus", "pimento": "Piment de la Jamaïque", "lotus": "Lotus", "cocoa": "Cacao",
    "cyclamen": "Cyclamen", "coffee": "Café", "birch": "Bouleau", "blackberry": "Mûre", "frangipani": "Frangipanier",
    "davana": "Davana", "citrus fruits": "Agrumes", "citrus notes": "Agrumes", "tarragon": "Estragon",
    "lilac": "Lilas", "tea": "Thé", "green tea": "Thé vert", "white tea": "Thé blanc", "black tea": "Thé noir",
    "lychee": "Litchi", "litchi": "Litchi", "white blossoms": "Fleurs blanches", "aniseed": "Anis",
    "honeysuckle": "Chèvrefeuille", "star anise": "Anis étoilé", "castoreum": "Castoréum", "maté": "Maté",
    "marine notes": "Notes marines", "aquatic notes": "Notes aquatiques", "praliné": "Praliné", "praline": "Praliné",
    "blond woods": "Bois blonds", "artemisia": "Armoise", "mugwort": "Armoise", "melon": "Melon", "cypriol": "Cypriol",
    "citron": "Cédrat", "apricot": "Abricot", "green apple": "Pomme verte", "fig leaf": "Feuille de figuier",
    "fig": "Figue", "yuzu": "Yuzu", "white pepper": "Poivre blanc", "peru balsam": "Baume du Pérou",
    "caraway": "Carvi", "tiaré": "Tiaré", "tangerine": "Mandarine", "angelica": "Angélique", "amberwood": "Bois ambré",
    "peppermint": "Menthe poivrée", "water lily": "Nénuphar", "chamomile": "Camomille", "white amber": "Ambre blanc",
    "rhubarb": "Rhubarbe", "precious woods": "Bois précieux", "ambrette seed": "Graine d'ambrette",
    "ambrette": "Ambrette", "resins": "Résines", "amyris": "Amyris", "sichuan pepper": "Poivre de Sichuan",
    "cherry": "Cerise", "absinth": "Absinthe", "pine": "Pin", "floral notes": "Notes florales",
    "red berries": "Fruits rouges", "eucalyptus": "Eucalyptus", "hedione": "Hédione", "akigalawood®": "Akigalawood",
    "vervain": "Verveine", "mango": "Mangue", "strawberry": "Fraise", "blood orange": "Orange sanguine",
    "coriander seed": "Graine de coriandre", "tagetes": "Tagète", "fir balsam": "Baume de sapin",
    "blackcurrant bud": "Bourgeon de cassis", "pine needle": "Aiguilles de pin", "hawthorn": "Aubépine",
    "beeswax": "Cire d'abeille", "mastic": "Mastic", "pomegranate": "Grenade", "bitter almond": "Amande amère",
    "tree moss": "Mousse d'arbre", "iso-e-super": "Iso E Super", "coumarin": "Coumarine", "dry woods": "Bois secs",
    "milk": "Lait", "green leaves": "Feuilles vertes", "fruits": "Fruits", "solar note": "Note solaire",
    "grass": "Herbe", "dried fruits": "Fruits secs", "nectarine": "Nectarine", "cherry blossom": "Fleur de cerisier",
    "passion fruit": "Fruit de la passion", "laurel": "Laurier", "ivy": "Lierre", "blossoms": "Fleurs",
    "hazelnut": "Noisette", "cognac": "Cognac", "carrot seed": "Graine de carotte", "myrtle": "Myrte",
    "ebony": "Ébène", "powdery notes": "Notes poudrées", "quince": "Coing", "fruity notes": "Notes fruitées",
    "fir": "Sapin", "birch tar": "Goudron de bouleau", "champaca flower": "Champaca", "salt": "Sel",
    "olive wood": "Bois d'olivier", "rose water": "Eau de rose", "rosa centifolia": "Rose centifolia",
    "linden blossom": "Fleur de tilleul", "nagarmotha": "Nagarmotha", "clover": "Trèfle", "cashmere": "Cachemire",
    "brown sugar": "Sucre brun", "woodland strawberry": "Fraise des bois", "mace": "Macis", "cassia": "Cassia",
    "spearmint": "Menthe verte", "animalic notes": "Notes animales", "pink grapefruit": "Pamplemousse rose",
    "leathery notes": "Notes cuirées", "clementine": "Clémentine", "pot marigold": "Souci", "cedar leaf": "Feuille de cèdre",
    "kumquat": "Kumquat", "chocolate": "Chocolat", "sweet pea": "Pois de senteur", "white leather": "Cuir blanc",
    "red pepper": "Poivre rouge", "date": "Datte", "rice": "Riz", "almond milk": "Lait d'amande", "wild rose": "Rose sauvage",
    "driftwood": "Bois flotté", "air accord": "Accord aérien", "apple blossom": "Fleur de pommier", "chili": "Piment",
    "white lily": "Lys blanc", "white cedar": "Cèdre blanc", "white peach": "Pêche blanche", "rose absolute": "Rose absolue",
    "bourbon vanilla": "Vanille Bourbon", "vanilla absolute": "Vanille absolue", "orris butter": "Beurre d'iris",
    "smoke": "Fumée", "sugar": "Sucre", "salted caramel": "Caramel salé", "whisky": "Whisky", "wine": "Vin",
    "champagne": "Champagne", "gin": "Gin", "pistachio": "Pistache", "marshmallow": "Guimauve", "cotton candy": "Barbe à papa",
    "oud wood": "Oud", "patchouli leaf": "Feuille de patchouli", "lemon zest": "Zeste de citron", "orange zest": "Zeste d'orange",
}

# Origines et qualificatifs : « Calabrian bergamot » → « Bergamote de Calabre »
ORIGINS = {
    "calabrian": "de Calabre", "italian": "d'Italie", "sicilian": "de Sicile", "bulgarian": "de Bulgarie",
    "turkish": "turque", "moroccan": "du Maroc", "egyptian": "d'Égypte", "indian": "d'Inde", "haitian": "d'Haïti",
    "indonesian": "d'Indonésie", "madagascan": "de Madagascar", "madagascar": "de Madagascar", "virginia": "de Virginie",
    "atlas": "de l'Atlas", "grasse": "de Grasse", "may": "de mai", "damask": "de Damas", "florentine": "de Florence",
    "mysore": "de Mysore", "australian": "d'Australie", "provençal": "de Provence", "tunisian": "de Tunisie",
    "somalian": "de Somalie", "guatemala": "du Guatemala", "ceylon": "de Ceylan", "cambodian": "du Cambodge",
    "laotian": "du Laos", "thai": "de Thaïlande", "tahitian": "de Tahiti", "new caledonian": "de Nouvelle-Calédonie",
    "venezuelan": "du Venezuela", "java": "de Java", "spanish": "d'Espagne", "french": "de France",
    "paraguayan": "du Paraguay", "brazilian": "du Brésil", "bourbon": "Bourbon", "siam": "de Siam", "papua": "de Papouasie",
    "egyptian geranium": "", "green": "vert", "red": "rouge", "white": "blanc", "black": "noir",
}
QUALIFIERS = {"absolute": "absolue", "concrete": "concrète", "oil": "(huile)", "essence": "(essence)", "extract": "(extrait)"}


def note(raw: str) -> str:
    name = raw.strip().replace("™", "").replace("®", "").strip()
    key = name.lower()
    if key in BASE:
        return BASE[key]
    words = key.split()
    # Qualificatif final (absolue…)
    suffix = ""
    if words and words[-1] in QUALIFIERS:
        suffix = " " + QUALIFIERS[words[-1]]
        words = words[:-1]
    # Origine en tête (une ou deux mots)
    for n in (2, 1):
        head = " ".join(words[:n])
        rest = " ".join(words[n:])
        if head in ORIGINS and rest in BASE and ORIGINS[head]:
            return f"{BASE[rest]} {ORIGINS[head]}{suffix}"
    joined = " ".join(words)
    if joined in BASE:
        return BASE[joined] + suffix
    return name[:1].upper() + name[1:]


ACCORDS = {
    "Spicy": "Épicé", "Sweet": "Sucré", "Woody": "Boisé", "Floral": "Floral", "Fresh": "Frais", "Fruity": "Fruité",
    "Citrus": "Agrumes", "Powdery": "Poudré", "Oriental": "Oriental", "Green": "Vert", "Synthetic": "Synthétique",
    "Creamy": "Crémeux", "Gourmand": "Gourmand", "Resinous": "Résineux", "Smoky": "Fumé", "Leathery": "Cuir",
    "Aquatic": "Aquatique", "Earthy": "Terreux", "Animal": "Animal", "Chypre": "Chypré", "Fougère": "Fougère",
}


def accord(raw: str) -> str:
    return ACCORDS.get(raw.strip(), raw.strip())
