"""
API Prédiction Budget - CampConnect
Version: FastAPI (High Performance)
Modèle amélioré avec budget utilisateur, activités payantes et explainability
Conversion en dinars tunisiens avec calcul détaillé du transport
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any, Tuple
from contextlib import asynccontextmanager
import pandas as pd
import pickle
import numpy as np
import json
import os
import uvicorn
from datetime import datetime
import re
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.cluster import KMeans

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup
    load_models()
    yield
    # Clean up (if needed) on shutdown

app = FastAPI(
    title="CampConnect AI Service", 
    description="FastAPI service for trip budget and risk prediction",
    lifespan=lifespan
)

# ==================== CONFIGURATION DEVISE & TRANSPORT ====================
USD_TO_TND_RATE = 3.15  # Taux de change USD vers Dinar Tunisien (2026)
TRANSPORT_COST_PER_KM_TND = 0.5  # TND par km pour le transport (voiture/bus)
TRANSPORT_MODE_MULTIPLIER = {
    "bus": 0.7,
    "train": 0.6,
    "car": 1.0,
    "van": 1.25
}
FOOD_COST_PER_DAY_PERSON = 30.0  # TND
CAMPING_NIGHT_PRICE_PERSON = 15.0 # TND par nuit par personne (Estimation camping Tunisie)

REGION_MAPPING = {
    'tunis': 1, 'ariana': 1, 'ben arous': 1, 'manouba': 1,
    'kairouan': 2,
    'bizerte': 3, 'raf raf': 3, 'cap angela': 3,
    'nabeul': 4, 'hammamet': 4, 'korba': 4,
    'tozeur': 5, 'tamerza': 5, 'chebika': 5,
    'kebili': 6, 'douz': 6, 'ksar ghilane': 6,
    'siliana': 7, 'kesra': 7,
    'zaghouan': 8, 'zriba': 8,
    'beja': 9, 'testour': 9,
    'jendouba': 10, 'ain draham': 10, 'beni mtir': 10,
    'gabes': 11,
    'medenine': 12, 'djerba': 12, 'zarzis': 12,
    'tataouine': 13, 'douiret': 13, 'chenini': 13,
    'gafsa': 14, 'metlaoui': 14,
    'sousse': 15, 'port el kantaoui': 15,
    'monastir': 16,
    'mahdia': 17,
    'sfax': 18, 'kerkennah': 18,
    'kasserine': 19, 'thala': 19,
    'sidi bouzid': 20
}

DESTINATION_ALIASES = {
    "jerba": "djerba",
    "djerbah": "djerba",
    "houmt souk": "djerba",
    "houmt essouk": "djerba",
    "midoun": "djerba",
    "ajim": "djerba",
    "guellala": "djerba",
    "mednine": "medenine",
    "la marsa": "tunis",
    "carthage": "tunis",
    "sidi bou said": "tunis",
    "gammarth": "tunis",
    "ain draham": "jendouba",
    "ain-draham": "jendouba",
    "a n draham": "jendouba",
    "a in draham": "jendouba",
    "bni mtir": "jendouba",
    "bni m tir": "jendouba",
    "bni m'tir": "jendouba",
    "beni mtir": "jendouba",
    "beni m'tir": "jendouba",
}

EXTERNAL_ITINERARY_XLSX_PATHS = [
    "camping_tunisia_clean.xlsx",
    r"C:\Users\lenovo\Downloads\camping_tunisia_clean.xlsx",
    "tunisia_improved.xlsx",
]

SEASON_MAPPING = {
    'hiver': 1, 'winter': 1,
    'printemps': 2, 'spring': 2,
    'ete': 3, 'summer': 3,
    'automne': 4, 'fall': 4, 'autumn': 4,
    'toute l\'annee': 2 # Default to Spring for all-year
}


def _region_id_from_name(name: Optional[str], default_id: int = 1) -> int:
    """Aligne destination libre sur REGION_MAPPING (accents / aliases)."""
    if not name or not str(name).strip():
        return default_id
    key = _normalize_text(str(name))
    if key in REGION_MAPPING:
        return REGION_MAPPING[key]
    for token in key.split():
        if len(token) >= 3 and token in REGION_MAPPING:
            return REGION_MAPPING[token]
        if token in DESTINATION_ALIASES:
            alias = DESTINATION_ALIASES[token]
            if alias in REGION_MAPPING:
                return REGION_MAPPING[alias]
    for reg_key in REGION_MAPPING:
        if len(reg_key) >= 3 and reg_key in key:
            return REGION_MAPPING[reg_key]
    return default_id


def _season_id_from_name(name: Optional[str], default_id: int = 2) -> int:
    """Saison en français / EN → id (accents retirés via normalisation)."""
    if not name or not str(name).strip():
        return default_id
    key = _normalize_text(str(name))
    return int(SEASON_MAPPING.get(key, default_id))


# ==================== CHARGEMENT DES RESSOURCES ====================
model_budget = None
model_risk = None
scaler = None
model_stats = None
itinerary_data = None
itinerary_ml_ready = False

def _normalize_text(text: Any) -> str:
    import unicodedata
    if not text:
        return ""
    # Enlever les accents
    s = "".join(c for c in unicodedata.normalize('NFD', str(text))
                 if unicodedata.category(c) != 'Mn').lower()
    # Supprimer absolument TOUT ce qui n'est pas lettre, chiffre ou espace
    import re
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    return " ".join(s.split()) # Nettoyer les espaces multiples

def _resolve_destination_candidates(raw_region: str) -> List[str]:
    # Extraction du texte entre parenthèses AVANT normalisation
    import re
    candidates = []
    
    paren_match = re.search(r'\((.*?)\)', raw_region)
    if paren_match:
        content = paren_match.group(1).strip()
        if content:
            candidates.append(_normalize_text(content))
            
    # Normalisation de la base
    base = _normalize_text(raw_region)
    candidates.insert(0, base)
    
    # aliases exacts
    if base in DESTINATION_ALIASES:
        candidates.append(DESTINATION_ALIASES[base])
    
    # alias via tokens
    tokens = base.split()
    for t in tokens:
        if len(t) >= 2 and t in DESTINATION_ALIASES:
            candidates.append(DESTINATION_ALIASES[t])
            
    # Tokens individuels
    for t in tokens:
        if len(t) >= 3 and t not in ["camping", "parc", "centre", "base", "camp"]:
            candidates.append(t)

    # déduplication en conservant l'ordre
    out = []
    seen = set()
    for c in candidates:
        if c and c not in seen:
            # Sécurité supplémentaire : On enlève tout caractère spécial résiduel
            clean_c = re.sub(r'[^a-z0-9\s]', ' ', c).strip()
            if clean_c and clean_c not in seen:
                out.append(clean_c)
                seen.add(clean_c)
    return out

def _get_flexible_region_filter(df: pd.DataFrame, raw_region: str) -> Tuple[pd.Series, Optional[str]]:
    """Applique une stratégie de filtrage multi-niveaux pour trouver une destination."""
    destination_candidates = _resolve_destination_candidates(raw_region)
    region_filter = pd.Series(False, index=df.index)
    matched_candidate = None

    # 1. Recherche exacte/sous-chaîne simple (Désactivation Regex pour supporter les parenthèses)
    for candidate in destination_candidates:
        candidate_filter = (
            df['region_norm'].str.contains(candidate, na=False, regex=False) |
            df['ville_norm'].str.contains(candidate, na=False, regex=False)
        )
        if candidate_filter.any():
            return candidate_filter, candidate

    # 2. Recherche par tokens (mots-clés)
    all_tokens = []
    for candidate in destination_candidates:
        all_tokens.extend([t for t in re.split(r'[\s,;:/\\|-]+', candidate) if len(t) >= 2])
    
    ignore_list = ["camping", "parc", "centre", "base", "camp", "village", "station", "tunisie", "site"]
    search_tokens = [t for t in all_tokens if t not in ignore_list]

    if search_tokens:
        token_filter = pd.Series(False, index=df.index)
        for token in sorted(set(search_tokens)):
            # Sécurité: aucune regex pour éviter les erreurs de motif invalide.
            token_filter = token_filter | df['region_norm'].str.contains(token, na=False, regex=False)
            token_filter = token_filter | df['ville_norm'].str.contains(token, na=False, regex=False)
        if token_filter.any():
            return token_filter, search_tokens[0]

    # 3. Recherche "Fuzzy" (préfixe de 4 lettres)
    full_text_query = " ".join(destination_candidates)
    short_tokens = [t[:4] for t in re.split(r'[\s,;:/\\|-]+', full_text_query) if len(t) >= 4]
    if short_tokens:
        fuzzy_filter = pd.Series(False, index=df.index)
        for token in set(short_tokens):
            fuzzy_filter = fuzzy_filter | df['region_norm'].str.contains(token, na=False, regex=False)
            fuzzy_filter = fuzzy_filter | df['ville_norm'].str.contains(token, na=False, regex=False)
        if fuzzy_filter.any():
            return fuzzy_filter, short_tokens[0]

    return region_filter, None

def _pick_first_existing_column(df: pd.DataFrame, candidates: List[str]) -> Optional[str]:
    cols = {c.lower().strip(): c for c in df.columns}
    for cand in candidates:
        if cand.lower() in cols:
            return cols[cand.lower()]
    return None

def _normalize_itinerary_dataframe(df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Normalise le dataset Excel pour qu'il corresponde au format attendu par l'API.
    """
    df = df_raw.copy()
    df.columns = [str(c).strip() for c in df.columns]

    col_region = _pick_first_existing_column(df, ["region", "gouvernorat", "governorate"])
    col_ville = _pick_first_existing_column(df, ["ville", "city", "localite", "locality"])
    col_saison = _pick_first_existing_column(df, ["saison", "season"])
    col_activite = _pick_first_existing_column(df, ["activite", "activity", "name", "nom"])
    col_description = _pick_first_existing_column(df, ["description", "details"])
    col_price = _pick_first_existing_column(df, ["price_tnd", "prix_tnd", "price", "prix", "cost_tnd", "prix_TND"])
    col_duration = _pick_first_existing_column(df, ["duration_h", "duration", "duree_h", "duration_hours"])
    col_type = _pick_first_existing_column(df, ["type", "category", "categorie"])
    col_destination = _pick_first_existing_column(df, ["destination", "site", "place", "lieu", "camping_site"])

    if col_region is None and col_ville is None:
        raise ValueError("Le fichier tunisia_improved.xlsx doit contenir au moins une colonne region/ville.")
    if col_activite is None:
        raise ValueError("Le fichier tunisia_improved.xlsx doit contenir une colonne activite/name.")

    if col_region is None and col_ville is not None:
        df["region"] = df[col_ville].astype(str)
    else:
        df["region"] = df[col_region].astype(str)

    if col_ville is None:
        df["ville"] = df["region"].astype(str)
    else:
        df["ville"] = df[col_ville].astype(str)

    if col_saison is None:
        df["saison"] = "Toute l'annee"
    else:
        df["saison"] = df[col_saison].astype(str)

    df["activite"] = df[col_activite].astype(str)
    df["description"] = df[col_description].astype(str) if col_description else "Activite locale"
    df["price_tnd"] = pd.to_numeric(df[col_price], errors="coerce").fillna(0.0) if col_price else 0.0
    df["duration_h"] = pd.to_numeric(df[col_duration], errors="coerce").fillna(1.5) if col_duration else 1.5
    df["type"] = df[col_type].astype(str) if col_type else "activity"
    df["destination"] = df[col_destination].astype(str) if col_destination else df["ville"].astype(str)

    if "id" not in df.columns:
        df["id"] = np.arange(1, len(df) + 1)
    else:
        df["id"] = pd.to_numeric(df["id"], errors="coerce").fillna(np.arange(1, len(df) + 1)).astype(int)

    # cluster optionnel: on crée des clusters simples basés sur le prix si absent
    if "cluster" not in df.columns:
        if len(df) >= 3 and df["price_tnd"].nunique() > 1:
            q1 = df["price_tnd"].quantile(0.33)
            q2 = df["price_tnd"].quantile(0.66)
            df["cluster"] = np.where(df["price_tnd"] <= q1, 2, np.where(df["price_tnd"] <= q2, 1, 0))
        else:
            df["cluster"] = 1

    # Nettoyage final
    for c in ["region", "ville", "saison", "activite", "description", "type", "destination"]:
        df[c] = df[c].fillna("").astype(str).str.strip()
    df["price_tnd"] = df["price_tnd"].clip(lower=0)
    df["duration_h"] = df["duration_h"].clip(lower=0.5)

    return df

def _build_itinerary_ml_model(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Construit un mini-modèle ML (KMeans) pour segmenter les activités.
    - cluster 2 => économique
    - cluster 1 => standard
    - cluster 0 => premium
    """
    work = df.copy()

    le_type = LabelEncoder()
    work["type_encoded"] = le_type.fit_transform(work["type"].fillna("activity").astype(str))

    work["price_tnd"] = pd.to_numeric(work["price_tnd"], errors="coerce").fillna(0.0)
    work["duration_h"] = pd.to_numeric(work["duration_h"], errors="coerce").fillna(1.5)
    work["price_per_h"] = (work["price_tnd"] / work["duration_h"].replace(0, 1)).fillna(0.0)

    features = ["duration_h", "price_tnd", "price_per_h", "type_encoded"]
    scaler_it = StandardScaler()
    X = scaler_it.fit_transform(work[features].fillna(0.0))

    # KMeans simple et robuste pour 3 niveaux d'activités
    kmeans_it = KMeans(n_clusters=3, random_state=42, n_init=10)
    clusters = kmeans_it.fit_predict(X)
    work["cluster"] = clusters

    # Réordonner les clusters par prix moyen: low=2, medium=1, high=0
    cluster_price = work.groupby("cluster")["price_tnd"].mean().sort_values()
    order = list(cluster_price.index)  # low, mid, high
    remap = {order[0]: 2, order[1]: 1, order[2]: 0}
    work["cluster"] = work["cluster"].map(remap).fillna(1).astype(int)

    return {
        "df": work,
        "le_type": le_type,
        "scaler_itinerary": scaler_it,
        "kmeans_itinerary": kmeans_it,
        "itinerary_features": features,
    }

def load_models():
    """Charge tous les modèles et ressources au démarrage"""
    global model_budget, model_risk, scaler, model_stats, itinerary_data, itinerary_ml_ready
    
    try:
        # Charger les modèles
        if os.path.exists('models/model_budget.pkl'):
            with open('models/model_budget.pkl', 'rb') as f:
                model_budget = pickle.load(f)
            print("Model Budget loaded")
        
        if os.path.exists('models/model_risk.pkl'):
            with open('models/model_risk.pkl', 'rb') as f:
                model_risk = pickle.load(f)
            print("Model Risk loaded")
        
        # Charger le scaler
        if os.path.exists('models/scaler.pkl'):
            with open('models/scaler.pkl', 'rb') as f:
                scaler = pickle.load(f)
            print("Scaler loaded")
        
        # Charger les statistiques
        if os.path.exists('models/model_stats.json'):
            with open('models/model_stats.json', 'r') as f:
                model_stats = json.load(f)
            print("Stats loaded")
            
        # Charger le modèle d'itinéraire (pickle historique)
        if os.path.exists('models/itinerary_model.pkl'):
            with open('models/itinerary_model.pkl', 'rb') as f:
                itinerary_data = pickle.load(f)
            
            # Pré-normalisation des colonnes de recherche pour la performance
            df_it = itinerary_data['df']
            df_it['region_norm'] = df_it['region'].apply(_normalize_text)
            df_it['ville_norm'] = df_it['ville'].apply(_normalize_text)
            df_it['saison_norm'] = df_it['saison'].apply(_normalize_text)
            
            # Si le pickle historique ne contient que df/cluster, on garde.
            print("Itinerary model loaded and normalized (from pickle)")

        # Priorité au nouveau dataset Excel fourni par l'utilisateur
        excel_path = next((p for p in EXTERNAL_ITINERARY_XLSX_PATHS if os.path.exists(p)), None)
        if excel_path:
            df_excel_raw = pd.read_excel(excel_path)
            df_excel = _normalize_itinerary_dataframe(df_excel_raw)

            df_excel['region_norm'] = df_excel['region'].apply(_normalize_text)
            df_excel['ville_norm'] = df_excel['ville'].apply(_normalize_text)
            df_excel['saison_norm'] = df_excel['saison'].apply(_normalize_text)

            # Construire un vrai modèle ML pour l'itinéraire à partir du dataset Excel
            itinerary_data = _build_itinerary_ml_model(df_excel)
            itinerary_ml_ready = True
            print(f"Itinerary ML model trained from Excel: {excel_path} ({len(df_excel)} rows)")
        elif itinerary_data and isinstance(itinerary_data, dict) and "df" in itinerary_data:
            # Fallback: si pickle chargé, vérifier cluster sinon entraîner en mémoire
            df_loaded = itinerary_data["df"]
            if "cluster" not in df_loaded.columns:
                itinerary_data = _build_itinerary_ml_model(df_loaded)
                itinerary_ml_ready = True
                print("Itinerary ML model trained in-memory from loaded dataset")
            else:
                itinerary_ml_ready = True
        
    except Exception as e:
        print(f"Error loading models: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

# ==================== SCHÉMAS DE DONNÉES ====================
class ActivityItem(BaseModel):
    """Activité envoyée par le backend Java (champs extra ignorés)."""
    model_config = ConfigDict(extra="ignore")

    name: str = ""
    price: float = 0.0
    duration: float = 1.0
    type: Optional[str] = None

class TripFeatures(BaseModel):
    user_proposed_budget: Optional[float] = 1000.0
    location: Optional[int] = 1
    location_name: Optional[str] = None
    season: Optional[int] = 1
    season_name: Optional[str] = None
    duration_days: Optional[int] = 3
    group_size: Optional[int] = 2
    trip_type: Optional[int] = 1
    distance_km: Optional[float] = 100.0
    hotel_quality: Optional[int] = 3
    rating_1_5: Optional[float] = 4.0
    review_polarity: Optional[float] = 0.5
    weather_score: Optional[float] = 0.7
    time_flexibility: Optional[float] = 0.5
    # Optionnel: Activités sélectionnées par l'utilisateur
    selected_activities: Optional[List[ActivityItem]] = None

class ItineraryRequest(BaseModel):
    region: str # Ex: "Bizerte"
    season: str # Ex: "Été"
    duration_days: int = 3
    budget_level: Optional[str] = None # "low", "medium", "high"
    total_budget_tnd: Optional[float] = None  # Budget total en dinars
    num_people: Optional[int] = 1  # Nombre de personnes
    distance_km: Optional[float] = 100.0 # Distance pour le transport
    transport_mode: Optional[str] = "car"  # bus, car, van
    # Permet de générer des plannings différents à chaque appel (ex: après refus)
    variation_seed: Optional[int] = None

class DestinationValidationRequest(BaseModel):
    region: str

class DestinationValidationResponse(BaseModel):
    valid: bool
    input_region: str
    matched_region: Optional[str] = None
    activities_count: int = 0
    message: str

class ItineraryOption(BaseModel):
    program_id: int
    title: str
    budget_level: str
    description: str
    total_estimated_cost_tnd: float
    average_per_person_tnd: float
    breakdown: Dict[str, float]  # Transport, Hébergement, Nourriture, Activités
    budget_status: str # "Dans le budget" ou "Dépasse le budget"
    days: List[Dict[str, Any]]
    num_people: Optional[int] = 1  # Nombre de personnes pour le calcul

class SelectedItineraryRequest(BaseModel):
    """Demande de calcul de budget pour un itinéraire sélectionné"""
    region: str
    season: str
    duration_days: int = 3
    budget_level: str  # "low", "medium", "high"
    num_people: int = 1
    distance_km: Optional[float] = 100.0
    transport_mode: Optional[str] = "car"
    # Optionnel: coût de transport saisi par l'utilisateur (TND)
    transport_cost_tnd: Optional[float] = None
    # Optionnel: modèle de coût transport (per_person, per_day_group, flat_group)
    transport_cost_type: Optional[str] = None
    hotel_quality: Optional[int] = 3
    user_proposed_budget_tnd: Optional[float] = None
    group_size: Optional[int] = 1
    selected_activities: Optional[List[ActivityItem]] = None
    include_food: Optional[bool] = False
    include_accommodation: Optional[bool] = False

class BudgetBreakdown(BaseModel):
    """Détail du budget"""
    transport: float
    hebergement: float
    nourriture: float
    activites: float
    total: float

class BudgetCalculationResponse(BaseModel):
    """Réponse du calcul de budget"""
    status: str
    budget_level: str
    total_budget_tnd: float
    per_person_tnd: float
    breakdown: BudgetBreakdown
    budget_status: str  # "Dans le budget" ou "Dépasse le budget"
    budget_advice: str
    cancellation_probability: Optional[float] = None
    risk_level: Optional[str] = None
    predicted_total_budget_tnd: Optional[float] = None
    estimated_total_budget_tnd: Optional[float] = None
    timestamp: str


def _compute_intelligent_risk_scan(
    ml_cancellation_probability: float,
    model_risk_loaded: bool,
    user_budget_tnd: float,
    predicted_budget_tnd: float,
    duration_days: float,
    group_size: int,
    distance_km: float,
    paid_activities_count: int,
    avg_activity_cost_tnd: float,
) -> Tuple[float, str]:
    """
    Indice de risque / « anomalie » combinant le classifieur ML (historique)
    et des signaux explicables (pression budgétaire, marge, densité d'activités, trajets).
    Retourne (probabilité 0–1, message court pour l'UI type Risk Scan).
    """
    g = max(int(group_size), 1)
    d = max(float(duration_days), 1.0)

    # --- Composantes heuristiques [0, 1] ---
    budget_stress = 0.0
    if user_budget_tnd > 0:
        ratio = predicted_budget_tnd / user_budget_tnd
        if ratio > 1.08:
            budget_stress = float(min(1.0, (ratio - 1.08) / 0.38))
    else:
        budget_stress = 0.22

    daily_pp = user_budget_tnd / (g * d) if user_budget_tnd > 0 else predicted_budget_tnd / (g * d)
    low_daily = 0.0
    if daily_pp < 32:
        low_daily = float(min(1.0, (32 - daily_pp) / 32))
    elif daily_pp < 48:
        low_daily = float((48 - daily_pp) / 80)

    act_density = float(min(1.0, paid_activities_count / max(4.0 * d, 1.0)))

    transfer_intensity = float(min(1.0, (distance_km / d) / 220.0))

    margin_risk = 0.0
    if user_budget_tnd > 0 and predicted_budget_tnd > 0:
        margin = (user_budget_tnd - predicted_budget_tnd) / user_budget_tnd
        if margin < 0:
            margin_risk = float(min(1.0, abs(margin) + 0.15))
        elif margin < 0.07:
            margin_risk = 0.5
        elif margin < 0.12:
            margin_risk = 0.28

    cost_spike = 0.0
    if paid_activities_count > 0 and avg_activity_cost_tnd > 75:
        cost_spike = float(min(1.0, (avg_activity_cost_tnd - 50) / 100.0))

    heuristic = float(
        np.mean([budget_stress, low_daily, act_density, transfer_intensity, margin_risk, cost_spike])
    )

    if model_risk_loaded:
        w_ml = 0.44
    else:
        # Sans modèle entraîné, la probabilité ML par défaut (0.5) est non informative
        w_ml = 0.12
        ml_cancellation_probability = 0.5

    composite = float(np.clip(w_ml * ml_cancellation_probability + (1.0 - w_ml) * heuristic, 0.0, 1.0))

    factors: List[Tuple[float, str]] = [
        (budget_stress, "L'estimation globale dépasse votre enveloppe : prévoir une marge ou réduire le périmètre."),
        (low_daily, "Budget quotidien par personne serré : attention aux repas, navettes et billets sur place."),
        (act_density, "Planning dense en activités payantes : le coût réel peut vite grimper si tout est retenu."),
        (transfer_intensity, "Longs trajets pour la durée du séjour : prévoir carburant, location ou fatigue (nuitées supplémentaires)."),
        (margin_risk, "Peu de marge entre votre plafond et l'estimation : les imprévus pèsent vite sur le total."),
        (cost_spike, "Activités unitaires coûteuses : vérifiez les options « groupe » ou les créneaux hors saison."),
    ]
    factors.sort(key=lambda x: -x[0])
    top = [msg for score, msg in factors if score >= 0.22][:2]

    if not top:
        if composite < 0.32:
            top = ["Profil cohérent : risque budgétaire modéré selon les signaux actuels."]
        elif composite < 0.55:
            top = ["Quelques tensions possibles ; surveillez surtout le transport et les extras."]
        else:
            top = [
                "Le modèle et les indicateurs convergent vers un risque élevé d'écart ou de changement de plan."
            ]

    advice = " ".join(top)
    return composite, advice


# ==================== ENDPOINT PRINCIPAL ====================
@app.post("/predict")
async def predict(trip_data: TripFeatures):
    """
    Prédiction du budget et risque pour un trip
    Intègre les activités sélectionnées si disponibles.
    """
    try:
        data = trip_data.model_dump()
        
        # ==================== CALCULS DES ACTIVITÉS SÉLECTIONNÉES ====================
        selected_acts = data.get('selected_activities')
        user_budget_tnd = float(data.get('user_proposed_budget', 0))
        has_paid_activities = 0
        paid_activities_count = 0
        avg_activity_cost = 0.0
        
        if selected_acts:
            paid_acts = [a for a in selected_acts if a['price'] > 0]
            has_paid_activities = 1 if len(paid_acts) > 0 else 0
            paid_activities_count = len(paid_acts)
            if paid_activities_count > 0:
                avg_activity_cost = sum([a['price'] for a in paid_acts]) / paid_activities_count

        # Liste d'activités sans prix (Java envoie souvent des libellés seuls) : estimation compatible dataset
        if paid_activities_count > 0 and avg_activity_cost <= 0 and user_budget_tnd > 0:
            avg_activity_cost = float(
                np.clip(user_budget_tnd * 0.18 / paid_activities_count, 25.0, 140.0)
            )
        
        # ==================== MAPPAGE DES NOMS EN IDS ====================
        loc_id = int(data.get('location', 1) or 1)
        if data.get('location_name'):
            loc_id = _region_id_from_name(str(data['location_name']), loc_id)

        season_id = int(data.get('season', 1) or 1)
        if data.get('season_name'):
            season_id = _season_id_from_name(str(data['season_name']), season_id)
            
        # ==================== EXTRACTION DES FEATURES ====================
        features_order = [
            'user_proposed_budget', 'location', 'season', 'duration_days',
            'group_size', 'trip_type', 'distance_km', 'hotel_quality',
            'rating_1_5', 'review_polarity', 'weather_score', 'time_flexibility',
            'has_paid_activities', 'paid_activities_count', 'avg_activity_cost',
            'has_paid_visits', 'paid_visits_count', 'avg_visit_cost'
        ]
        
        features_values = []
        for f in features_order:
            # IMPORTANT: même échelle que train.py / trips_data_realistic.csv (TND pour budget & coût activité)
            if f == 'user_proposed_budget':
                val = user_budget_tnd
            elif f == 'location':
                val = loc_id
            elif f == 'season':
                val = season_id
            elif f == 'has_paid_activities':
                val = has_paid_activities
            elif f == 'paid_activities_count':
                val = paid_activities_count
            elif f == 'avg_activity_cost':
                val = avg_activity_cost
            else:
                val = data.get(f)
            features_values.append(float(val) if val is not None else 0.0)
        
        # Calcul ambiguity
        total_activities = float(paid_activities_count) + float(data.get('paid_visits_count', 0))
        ambiguity_level = min(total_activities / 15.0, 1.0)
        features_values.append(ambiguity_level)
        
        # ==================== PRÉDICTIONS ====================
        if not model_budget or not scaler:
            raise HTTPException(status_code=500, detail="Modèle non chargé")
            
        # Création d'un DataFrame avec les noms de colonnes pour éviter les warnings
        column_names = features_order + ['ambiguity_level']
        features_df = pd.DataFrame([features_values], columns=column_names)
        
        features_normalized = scaler.transform(features_df)
        
        # Prédiction du budget optimal (en USD par le modèle)
        # On passe les features normalisées (qui sont maintenant un DF si possible)
        predicted_budget_usd = float(model_budget.predict(features_normalized)[0])
        
        # S'assurer de la cohérence avec les stats
        if model_stats:
            predicted_budget_usd = max(predicted_budget_usd, model_stats['budget']['min'])
        
        # Conversion finale en TND pour l'utilisateur
        predicted_budget_tnd = predicted_budget_usd * USD_TO_TND_RATE
        
        # Prédiction du risque (classifieur ML — historique d'acceptation / friction)
        if model_risk:
            risk_proba = model_risk.predict_proba(features_normalized)[0]
            acceptance_probability = float(risk_proba[1])
            ml_cancellation_probability = 1.0 - acceptance_probability
        else:
            acceptance_probability = 0.5
            ml_cancellation_probability = 0.5

        # ==================== CALCULS DU PROGRAMME (DÉTAILS) ====================
        distance_km = float(data.get('distance_km', 100))
        duration_days = float(data.get('duration_days', 3))
        hotel_quality = float(data.get('hotel_quality', 3))
        
        # Transport en TND
        transport_tnd = distance_km * TRANSPORT_COST_PER_KM_TND
        # Hébergement en TND
        hotel_tnd = ((30 + (hotel_quality - 1) * 25) * duration_days) * USD_TO_TND_RATE
        # Activités (en TND)
        activities_tnd = (total_activities * 30) * USD_TO_TND_RATE # Estimation forfaitaire
        
        # ==================== CONSEILS & ANALYSE ====================
        budget_delta = predicted_budget_tnd - user_budget_tnd
        
        if budget_delta > (user_budget_tnd * 0.2):
            budget_advice = f"⚠️ Votre budget ({user_budget_tnd:.0f} DT) est trop juste. Prévoyez environ {predicted_budget_tnd:.0f} DT."
            budget_risk = "Élevé"
        elif budget_delta < -(user_budget_tnd * 0.2):
            budget_advice = f"✅ Excellent ! Votre budget est large. Vous pouvez ajouter des activités de luxe."
            budget_risk = "Faible"
        else:
            budget_advice = f"👍 Budget réaliste pour un trip de {int(duration_days)} jours."
            budget_risk = "Optimal"

        # Indice Risk Scan : ML + signaux explicables (marge, activités, trajets…)
        avg_act_tnd = float(avg_activity_cost) if paid_activities_count > 0 else 0.0
        cancellation_probability, risk_advice = _compute_intelligent_risk_scan(
            ml_cancellation_probability,
            model_risk is not None,
            user_budget_tnd,
            predicted_budget_tnd,
            duration_days,
            int(data.get("group_size") or 2),
            distance_km,
            paid_activities_count,
            avg_act_tnd,
        )

        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "predictions": {
                "user_budget_tnd": round(user_budget_tnd, 2),
                "predicted_budget_tnd": round(predicted_budget_tnd, 2),
                "difference_tnd": round(budget_delta, 2),
                "budget_risk_level": budget_risk,
                "budget_advice": budget_advice,
                "cancellation_probability": round(cancellation_probability, 3),
                "ml_cancellation_component": round(ml_cancellation_probability, 3),
                "risk_level": "Faible" if cancellation_probability < 0.3 else ("Modéré" if cancellation_probability < 0.6 else "Élevé"),
                "risk_advice": risk_advice,
            },
            "breakdown_tnd": {
                "transport_estimatif": round(transport_tnd, 2),
                "hotel_estimatif": round(hotel_tnd, 2),
                "activites_estimatif": round(activities_tnd, 2),
                "marge_securite": round(predicted_budget_tnd * 0.1, 2)
            }
        }

        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================== ENDPOINTS ITINÉRAIRE ====================
@app.post("/recommend-itinerary")
async def recommend_itinerary(req: ItineraryRequest):
    """
    Propose 3 programmes d'itinéraire structurés par jours basés sur le budget:
    - LOW (Budget): Activités économiques
    - MEDIUM (Standard): Mix équilibré
    - HIGH (Premium): Activités haut de gamme
    """
    if not itinerary_data:
        raise HTTPException(status_code=500, detail="Modèle d'itinéraire non chargé")
    
    try:
        df = itinerary_data['df']
        
        # 1. Filtrage par région flexible
        region_filter, matched_candidate = _get_flexible_region_filter(df, req.region)

        filtered_df = df[region_filter]
        
        if filtered_df.empty:
            # Fallback ultime : On retourne les activités les plus populaires si on ne trouve vraiment rien
            # au lieu de bloquer l'utilisateur avec une erreur 404
            print(f"WARNING: Destination '{req.region}' not found. Using global popular activities.")
            filtered_df = df.head(20) 

        if filtered_df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"Destination '{req.region}' non reconnue dans le dataset itinéraire."
            )
            
        # 2. Filtrage par saison
        target_season = _normalize_text(req.season)
        # Filtrage par saison (Désactivation Regex pour plus de sécurité)
        season_filter = (df['saison_norm'].str.contains(target_season, na=False, regex=False)) | \
                        (df['saison_norm'].str.contains("annee", na=False, regex=False))
        season_df = filtered_df[filtered_df.index.isin(df[season_filter].index)]
        
        if season_df.empty:
            season_df = filtered_df
    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR in recommend_itinerary: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    # Seed de variation: si l'utilisateur refuse, un nouvel appel donnera un planning différent.
    # (Pas besoin de changer le backend: si aucune seed n'est fournie, on varie par temps.)
    try:
        import time
        variation_seed = int(req.variation_seed) if req.variation_seed is not None else int(time.time() * 1000) % 1_000_000_007
    except Exception:
        variation_seed = 42

    # 3. Calculer la médiane et quartiles de prix pour le filtrage par budget
    price_stats = season_df['price_tnd'].describe()
    q1 = season_df['price_tnd'].quantile(0.25)
    q3 = season_df['price_tnd'].quantile(0.75)
    
    # 4. Générer les programmes (mode single varié ou 3 niveaux)
    programs = []
    single_varied_mode = (req.budget_level or "").lower() in ["single", "varied", "mix", "mixed"]
    if single_varied_mode:
        budget_levels = [
            {
                "level": "varied",
                "label": "🧭 Planning Varié Recommandé",
                "description": "Un seul planning équilibré avec activités variées",
                "price_filter": lambda df: df
            }
        ]
    else:
        budget_levels = [
            {
                "level": "low",
                "label": "🎒 Budget Économique (Optimisé)",
                "description": "Priorité aux activités gratuites et locales",
                "price_filter": lambda df: df[df['price_tnd'] <= q1] if len(df[df['price_tnd'] <= q1]) > 0 else df
            },
            {
                "level": "medium",
                "label": "⭐ Standard & Confort",
                "description": "Mix équilibré pour un séjour complet",
                "price_filter": lambda df: df[(df['price_tnd'] > q1) & (df['price_tnd'] <= q3)] if len(df[(df['price_tnd'] > q1) & (df['price_tnd'] <= q3)]) > 0 else df
            },
            {
                "level": "high",
                "label": "💎 Premium & Aventure",
                "description": "Expériences exclusives et activités payantes",
                "price_filter": lambda df: df[df['price_tnd'] > q3] if len(df[df['price_tnd'] > q3]) > 0 else df
            }
        ]
    
    num_people = req.num_people or 1
    dist_km = req.distance_km or 100.0
    
    # Coûts fixes
    transport_mode = (req.transport_mode or "car").lower()
    transport_multiplier = TRANSPORT_MODE_MULTIPLIER.get(transport_mode, 1.0)
    transport_total = dist_km * TRANSPORT_COST_PER_KM_TND * transport_multiplier
    food_total = num_people * req.duration_days * FOOD_COST_PER_DAY_PERSON
    accommodation_total = num_people * req.duration_days * CAMPING_NIGHT_PRICE_PERSON
    
    for budget_config in budget_levels:
        budget_level = budget_config['level']
        label = budget_config['label']
        desc = budget_config['description']
        
        # Filtrer par prix
        budget_df = budget_config['price_filter'](season_df)
        if budget_df.empty: budget_df = season_df
            
        # Sélection par cluster (ML)
        if budget_level == "varied":
            candidate_df = budget_df
        elif budget_level == "low":
            candidate_df = budget_df[budget_df['cluster'] == 2] if 'cluster' in budget_df.columns and 2 in budget_df['cluster'].values else budget_df
        elif budget_level == "high":
            candidate_df = budget_df[budget_df['cluster'] == 0] if 'cluster' in budget_df.columns and 0 in budget_df['cluster'].values else budget_df
        else:
            candidate_df = budget_df[budget_df['cluster'] == 1] if 'cluster' in budget_df.columns and 1 in budget_df['cluster'].values else budget_df
        
        if candidate_df.empty: candidate_df = budget_df
        
        # 3 activités par jour (matin / après-midi / soirée) avec sélection déterministe
        total_needed = max(req.duration_days * 3, 3)
        ranked_df = candidate_df.copy()
        # Mélange initial pour casser le déterminisme du dataset
        if len(ranked_df) > 1:
            ranked_df = ranked_df.sample(frac=1.0, random_state=variation_seed)

        if single_varied_mode:
            # Mélange varié: répartit low/medium/high pour éviter un planning monotone
            low_pool = ranked_df[ranked_df['price_tnd'] <= q1]
            med_pool = ranked_df[(ranked_df['price_tnd'] > q1) & (ranked_df['price_tnd'] <= q3)]
            high_pool = ranked_df[ranked_df['price_tnd'] > q3]
            varied_rows = []
            chunk = max(req.duration_days, 1)
            if not low_pool.empty:
                varied_rows.append(low_pool.sample(frac=1.0, random_state=variation_seed).head(chunk))
            if not med_pool.empty:
                varied_rows.append(med_pool.sample(frac=1.0, random_state=variation_seed + 1).head(chunk))
            if not high_pool.empty:
                varied_rows.append(high_pool.sample(frac=1.0, random_state=variation_seed + 2).head(chunk))
            if varied_rows:
                ranked_df = pd.concat(varied_rows, ignore_index=False)
        elif 'rating_1_5' in ranked_df.columns:
            ranked_df = ranked_df.sort_values(by='rating_1_5', ascending=False)
        else:
            if budget_level == "low":
                ranked_df = ranked_df.sort_values(by='price_tnd', ascending=True)
            elif budget_level == "high":
                ranked_df = ranked_df.sort_values(by='price_tnd', ascending=False)
            else:
                median_price = ranked_df['price_tnd'].median()
                ranked_df = ranked_df.assign(_mid_score=(ranked_df['price_tnd'] - median_price).abs()) \
                                     .sort_values(by='_mid_score', ascending=True)

        if not ranked_df.empty:
            ranked_df = ranked_df.drop_duplicates(subset=['activite', 'destination'], keep='first')
            sample = ranked_df.head(total_needed * 2)
        else:
            sample = ranked_df
        
        # Structurer par jours (version "intelligente": diversité + pertinence destination)
        days_planning = []
        activities_cost_total = 0.0

        # Trouver un camping suggéré dans la région (Désactivation Regex)
        camping_suggestion = "Camping Nature"
        campings_in_region = season_df[season_df['type'].str.contains('Plage|Nature|Foret|Camping', case=False, na=False, regex=True)]
        # Si le regex échoue ou ne trouve rien, on tente une recherche simple sans regex
        if campings_in_region.empty:
            campings_in_region = season_df[season_df['type'].str.contains('Camping', case=False, na=False, regex=False)]
        if not campings_in_region.empty:
            camping_suggestion = str(campings_in_region.iloc[0]['destination'])

        slots = ["Matin", "Après-midi", "Soirée"]
        target_region_norm = _normalize_text(req.region)
        target_tokens = [t for t in re.split(r'[\s,;:/\\|-]+', target_region_norm) if len(t) >= 2]

        candidates = sample.to_dict('records')
        if not candidates:
            candidates = season_df.to_dict('records')

        used_activity_names = set()
        used_pairs = set()

        # Répartition budgétaire quotidienne (planning varié)
        if single_varied_mode:
            day_profiles = ["low", "medium", "high", "medium"]
        else:
            day_profiles = [budget_level] * max(req.duration_days, 1)

        for day in range(1, req.duration_days + 1):
            day_acts = []
            day_types = set()
            day_locations = []
            day_profile = day_profiles[(day - 1) % len(day_profiles)]

            for slot in slots:
                best_act = None
                best_score = -1e9

                for act in candidates:
                    act_name = str(act.get("activite", "")).strip()
                    if not act_name:
                        continue
                    act_name_norm = _normalize_text(act_name)
                    if act_name_norm in used_activity_names:
                        continue
                    score = 0.0

                    act_location = str(act.get("destination") or act.get("ville") or req.region).strip()
                    pair_key = (act_name_norm, _normalize_text(act_location))
                    if pair_key in used_pairs:
                        continue

                    act_type = str(act.get("type", "activity")).strip().lower()
                    act_price = float(act.get("price_tnd", 0.0) or 0.0)
                    act_duration = float(act.get("duration_h", 1.5) or 1.5)
                    loc_norm = _normalize_text(act_location)

                    # 1. Pertinence destination de base
                    if target_region_norm and target_region_norm in loc_norm:
                        score += 5.0
                    token_hits = sum(1 for t in target_tokens if t in loc_norm)
                    score += token_hits * 1.5

                    # 2. COHÉRENCE GÉOGRAPHIQUE (Crucial pour l'intelligence)
                    # Si on a déjà choisi une activité aujourd'hui, on préfère rester au même endroit
                    if day_locations:
                        if act_location in day_locations:
                            score += 4.0  # Bonus important pour rester dans la même ville
                        else:
                            score -= 2.0  # Malus pour changer de ville dans la même journée

                    # 3. LOGIQUE TEMPORELLE (Type d'activité selon le moment)
                    if slot == "Matin":
                        if any(kw in act_type for kw in ["culture", "site", "musee", "histoire", "marche", "monument"]):
                            score += 2.5
                        elif "nature" in act_type or "parc" in act_type:
                            score += 1.5
                    elif slot == "Après-midi":
                        if any(kw in act_type for kw in ["aventure", "sport", "plage", "loisir", "excursion", "randonnee"]):
                            score += 2.5
                        elif "shopping" in act_type:
                            score += 1.5
                    elif slot == "Soirée":
                        if any(kw in act_type for kw in ["restaurant", "gastronomie", "cafe", "vue", "detente"]):
                            score += 3.0
                        elif "spectacle" in act_type or "culture" in act_type:
                            score += 1.5

                    # 4. Diversité des types dans la journée
                    if act_type not in day_types:
                        score += 1.5
                    else:
                        score -= 1.0

                    # 5. Cohérence budget selon profil du jour
                    if day_profile == "low":
                        score -= act_price * 0.05
                    elif day_profile == "high":
                        score += min(act_price, 150.0) * 0.015
                    else:  # medium
                        score -= abs(act_price - 40.0) * 0.025

                    # 6. Durée et Rating
                    score -= abs(act_duration - 2.5) * 0.5
                    if "rating_1_5" in act and act["rating_1_5"] is not None:
                        try:
                            score += float(act["rating_1_5"]) * 0.5
                        except Exception: pass

                    if score > best_score:
                        best_score = score
                        best_act = act

                if best_act is not None:
                    act_name = str(best_act.get("activite", "Activité locale")).strip()
                    act_location = str(best_act.get("destination") or best_act.get("ville") or req.region).strip()
                    act_type = str(best_act.get("type", "activity")).strip()
                    act_price = float(best_act.get("price_tnd", 0.0) or 0.0)
                    act_duration = float(best_act.get("duration_h", 1.5) or 1.5)
                    act_desc = str(best_act.get("description", "Activité locale") or "Activité locale").strip()
                    raw_id = best_act.get("id", 0)
                    try:
                        act_id = 0 if pd.isna(raw_id) else int(raw_id)
                    except Exception:
                        act_id = 0

                    day_acts.append({
                        "id": act_id,
                        "name": act_name,
                        "description": act_desc,
                        "location": act_location,
                        "time_slot": slot,
                        "price": act_price,
                        "duration": act_duration
                    })

                    used_activity_names.add(_normalize_text(act_name))
                    used_pairs.add((_normalize_text(act_name), _normalize_text(act_location)))
                    day_types.add(act_type.lower())
                    day_locations.append(act_location)
                    activities_cost_total += act_price

            # Fallback minimal uniquement si dataset très limité
            while len(day_acts) < 3:
                idx = len(day_acts)
                day_acts.append({
                    "id": 900000 + day * 10 + idx,
                    "name": f"Temps libre encadré - {req.region}",
                    "description": "Moment libre pour découverte personnelle de la destination.",
                    "location": req.region,
                    "time_slot": slots[idx],
                    "price": 0.0,
                    "duration": 1.0
                })
                day_locations.append(req.region)

            main_location = day_locations[0] if day_locations else req.region
            days_planning.append({
                "day": day,
                "title": f"Jour {day} : Exploration de {main_location}",
                "camping_site": camping_suggestion,
                "activities": day_acts
            })
            
        # Total global: Transport (1 forfait) + (Hébergement + Nourriture + Activités) * nb_personnes
        # activities_cost_total est ici le coût par personne
        total_activities_for_group = activities_cost_total * num_people
        total_global = transport_total + food_total + accommodation_total + total_activities_for_group
        
        # Vérification budget
        budget_status = "Dans le budget"
        if req.total_budget_tnd and total_global > req.total_budget_tnd:
            budget_status = "⚠️ Dépasse le budget"
            
        programs.append({
            "program_id": len(programs) + 1,
            "title": label,
            "budget_level": budget_level,
            "description": desc,
            "total_estimated_cost_tnd": round(total_global, 2),
            "average_per_person_tnd": round(total_global / num_people, 2),
            "budget_status": budget_status,
            "breakdown": {
                "transport": round(transport_total, 2),
                "hebergement": round(accommodation_total, 2),
                "nourriture": round(food_total, 2),
                "activites": round(total_activities_for_group, 2)
            },
            "days": days_planning,
            "num_people": num_people
        })
        
    return {
        "status": "success",
        "region": req.region,
        "duration_days": req.duration_days,
        "user_limit_tnd": req.total_budget_tnd,
        "programs": programs
    }

@app.post("/validate-itinerary-destination", response_model=DestinationValidationResponse)
def validate_itinerary_destination(req: DestinationValidationRequest):
    if not itinerary_data:
        raise HTTPException(status_code=500, detail="Modèle d'itinéraire non chargé")
    try:
        df = itinerary_data['df']
        # Filtrage par région flexible
        region_filter, matched_candidate = _get_flexible_region_filter(df, req.region)

        filtered_df = df[region_filter]
        if filtered_df.empty:
            return DestinationValidationResponse(
                valid=False,
                input_region=req.region,
                matched_region=None,
                activities_count=0,
                message=f"Destination '{req.region}' non reconnue dans le dataset itinéraire."
            )

        matched_region = str(
            filtered_df.iloc[0].get('ville')
            or filtered_df.iloc[0].get('region')
            or matched_candidate
            or req.region
        )
        return DestinationValidationResponse(
            valid=True,
            input_region=req.region,
            matched_region=matched_region,
            activities_count=int(len(filtered_df)),
            message=f"Destination valide: {matched_region} ({len(filtered_df)} activités)."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================== ENDPOINT CALCUL BUDGET POUR ITINÉRAIRE SÉLECTIONNÉ ====================
@app.post("/calculate-budget-for-itinerary")
async def calculate_budget_for_itinerary(req: SelectedItineraryRequest):
    """
    Calcule le budget détaillé pour un itinéraire sélectionné par l'utilisateur.
    Prend en compte:
    - Le niveau de budget choisi (low, medium, high)
    - La destination, saison, durée, nombre de personnes
    - Distance et qualité d'hébergement
    Retourne une décomposition complète du budget avec conseils.
    """
    try:
        # ==================== CONSTANTS ====================
        num_people = req.num_people or 1
        dist_km = req.distance_km or 100.0
        transport_mode = (req.transport_mode or "car").lower()
        transport_multiplier = TRANSPORT_MODE_MULTIPLIER.get(transport_mode, 1.0)
        hotel_quality = req.hotel_quality or 3
        duration_days = req.duration_days or 3
        
        # ==================== CALCUL DES COÛTS ====================
        # Transport (TND)
        # Si l'utilisateur fournit un coût explicite, on l'utilise (ticket/location/forfait),
        # sinon fallback au modèle au km.
        transport_total = None
        cost_type = (req.transport_cost_type or "").strip().lower() if req.transport_cost_type else None
        if req.transport_cost_tnd is not None and req.transport_cost_tnd >= 0:
            unit_cost = float(req.transport_cost_tnd)
            if cost_type in [None, "", "per_person", "ticket"]:
                transport_total = unit_cost * num_people
            elif cost_type in ["per_day_group", "rental_per_day", "per_day"]:
                transport_total = unit_cost * duration_days
            elif cost_type in ["flat_group", "flat", "forfait"]:
                transport_total = unit_cost
            else:
                # inconnu => on suppose ticket par personne
                transport_total = unit_cost * num_people

        if transport_total is None:
            transport_total = dist_km * TRANSPORT_COST_PER_KM_TND * transport_multiplier
        
        # Hébergement (TND) - par nuit par personne
        # On aligne sur le tarif camping par défaut, majoré par la qualité
        include_accommodation = req.model_dump().get("include_accommodation", False)
        if include_accommodation:
            accommodation_cost_per_night = CAMPING_NIGHT_PRICE_PERSON + (hotel_quality - 1) * 15
            accommodation_total = accommodation_cost_per_night * duration_days * num_people
        else:
            accommodation_total = 0.0
        
        # Nourriture (TND) - par jour par personne (seulement si inclus)
        include_food = req.model_dump().get("include_food", False)
        food_total = FOOD_COST_PER_DAY_PERSON * duration_days * num_people if include_food else 0.0
        
        # Activités: priorité aux activités réellement sélectionnées dans l'itinéraire
        selected_activities = req.selected_activities or []
        paid_activity_prices = [float(a.price) for a in selected_activities if float(a.price) > 0]
        paid_activities_count = len(paid_activity_prices)

        if len(selected_activities) > 0:
            # L'utilisateur a explicitement fourni des activités
            activities_total = sum(float(a.price) for a in selected_activities) * num_people
            avg_activity_cost_per_person = (activities_total / num_people) / paid_activities_count if paid_activities_count > 0 else 0.0
        else:
            # Fallback si absolument aucune activité n'est envoyée (ni gratuite ni payante)
            if req.budget_level.lower() == "low":
                activities_cost_per_day_per_person = 20
            elif req.budget_level.lower() == "medium":
                activities_cost_per_day_per_person = 60
            else:  # high
                activities_cost_per_day_per_person = 120

            activities_total = activities_cost_per_day_per_person * duration_days * num_people
            avg_activity_cost_per_person = activities_cost_per_day_per_person
        
        # Total calculé à partir des postes réels de dépense.
        calculated_total_budget_tnd = transport_total + accommodation_total + food_total + activities_total
        
        # ==================== GESTION PRÉDICTIONS MODEL ====================
        location_id = _region_id_from_name(req.region, 1)
        season_id = _season_id_from_name(req.season, 2)

        # Préparer les features pour le modèle
        features_order = [
            'user_proposed_budget', 'location', 'season', 'duration_days',
            'group_size', 'trip_type', 'distance_km', 'hotel_quality',
            'rating_1_5', 'review_polarity', 'weather_score', 'time_flexibility',
            'has_paid_activities', 'paid_activities_count', 'avg_activity_cost',
            'has_paid_visits', 'paid_visits_count', 'avg_visit_cost'
        ]

        user_budget_tnd = req.user_proposed_budget_tnd or calculated_total_budget_tnd

        features_values = [
            user_budget_tnd,  # TND — aligné train.py / scaler
            location_id,
            season_id,
            duration_days,
            num_people,  # group_size (budget total du groupe)
            1,  # trip_type (défaut)
            dist_km,
            hotel_quality,
            4.0,  # rating_1_5 (défaut)
            0.5,  # review_polarity (défaut)
            0.7,  # weather_score (défaut)
            0.5,  # time_flexibility (défaut)
            1 if paid_activities_count > 0 else 0,
            paid_activities_count if paid_activities_count > 0 else int(duration_days),
            avg_activity_cost_per_person,  # TND / pers — aligné train.py
            0,  # has_paid_visits
            0,  # paid_visits_count
            0   # avg_visit_cost
        ]
        
        # Ambiguity
        total_activities = paid_activities_count if paid_activities_count > 0 else int(duration_days)
        ambiguity_level = min(total_activities / 15.0, 1.0)
        features_values.append(ambiguity_level)
        
        # Prédictions avec le modèle
        predicted_budget_tnd = calculated_total_budget_tnd
        ml_cancellation_raw = 0.5
        model_risk_applied = False

        if model_budget and scaler:
            column_names = features_order + ['ambiguity_level']
            features_df = pd.DataFrame([features_values], columns=column_names)
            features_normalized = scaler.transform(features_df)

            predicted_budget_usd = float(model_budget.predict(features_normalized)[0])
            predicted_budget_tnd = predicted_budget_usd * USD_TO_TND_RATE

            if model_risk:
                try:
                    risk_proba = model_risk.predict_proba(features_normalized)[0]
                    acceptance_probability = float(risk_proba[1])
                    ml_cancellation_raw = 1.0 - acceptance_probability
                    model_risk_applied = True
                except Exception:
                    pass

        cancellation_probability, _risk_scan_advice = _compute_intelligent_risk_scan(
            ml_cancellation_raw,
            model_risk_applied,
            user_budget_tnd,
            predicted_budget_tnd,
            float(duration_days),
            num_people,
            dist_km,
            paid_activities_count,
            float(avg_activity_cost_per_person),
        )
        risk_level = (
            "Faible" if cancellation_probability < 0.3 else (
                "Modéré" if cancellation_probability < 0.6 else "Élevé"
            )
        )

        # ==================== CONSEILS ====================
        budget_delta = calculated_total_budget_tnd - user_budget_tnd
        budget_status = "Dans le budget" if budget_delta <= 0 else "Dépasse le budget"
        
        if budget_delta > (user_budget_tnd * 0.2) if user_budget_tnd > 0 else False:
            budget_advice = f"⚠️ Budget calculé {calculated_total_budget_tnd:.0f} DT pour le groupe, soit {budget_delta:.0f} DT de plus que prévu."
        elif budget_delta < -(user_budget_tnd * 0.2) if user_budget_tnd > 0 else False:
            budget_advice = f"✅ Excellent ! Vous restez sous budget de {abs(budget_delta):.0f} DT pour le groupe."
        else:
            budget_advice = f"👍 Budget calculé réaliste de {calculated_total_budget_tnd:.0f} DT pour {int(duration_days)} jours."
        
        # ==================== RÉPONSE ====================
        return BudgetCalculationResponse(
            status="success",
            budget_level=req.budget_level,
            total_budget_tnd=round(calculated_total_budget_tnd, 2),
            per_person_tnd=round(calculated_total_budget_tnd / num_people, 2),
            breakdown=BudgetBreakdown(
                transport=round(transport_total, 2),
                hebergement=round(accommodation_total, 2),
                nourriture=round(food_total, 2),
                activites=round(activities_total, 2),
                total=round(calculated_total_budget_tnd, 2)
            ),
            budget_status=budget_status,
            budget_advice=budget_advice,
            cancellation_probability=round(cancellation_probability, 3),
            risk_level=risk_level,
            predicted_total_budget_tnd=round(predicted_budget_tnd, 2),
            estimated_total_budget_tnd=round(calculated_total_budget_tnd, 2),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================== ENDPOINT DIAGNOSTIC ====================
@app.get("/health")
async def health():
    """Vérifie l'état du service et des modèles"""
    return {
        "status": "healthy",
        "framework": "FastAPI",
        "models_loaded": {
            "budget": model_budget is not None,
            "risk": model_risk is not None,
            "scaler": scaler is not None,
            "stats": model_stats is not None,
            "itinerary": itinerary_data is not None,
            "itinerary_ml_ready": itinerary_ml_ready
        }
    }

# ==================== DÉMARRAGE ====================
if __name__ == '__main__':
    print("\nSTARTING AI SERVICE (FastAPI) - CAMPCONNECT")
    uvicorn.run(app, host='0.0.0.0', port=5050)
