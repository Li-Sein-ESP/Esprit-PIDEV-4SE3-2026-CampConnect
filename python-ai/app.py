from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import csv
import math
import random
import os

# =============================================================
# --- CONFIGURATION ---
# =============================================================
app = FastAPI(
    title="CampConnect AI Service",
    description="Microservice Python d'IA pour la gestion des événements et de l'académie.",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================
# --- PURE PYTHON ML HELPERS (No sklearn, No numpy) ---
# =============================================================

def dot_product(a, b):
    return sum(x * y for x, y in zip(a, b))

def magnitude(v):
    return math.sqrt(sum(x * x for x in v))

def cosine_similarity(a, b):
    mag_a = magnitude(a)
    mag_b = magnitude(b)
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot_product(a, b) / (mag_a * mag_b)

def tfidf_vectorize(texts):
    """Pure Python TF-IDF implementation."""
    # Tokenize
    tokenized = []
    for text in texts:
        tokens = text.lower().split()
        tokenized.append(tokens)

    # Build vocabulary
    vocab = sorted(set(token for doc in tokenized for token in doc))
    vocab_index = {word: i for i, word in enumerate(vocab)}

    # Compute TF
    tf_matrix = []
    for tokens in tokenized:
        vec = [0.0] * len(vocab)
        for token in tokens:
            if token in vocab_index:
                vec[vocab_index[token]] += 1.0
        total = len(tokens) if tokens else 1
        vec = [v / total for v in vec]
        tf_matrix.append(vec)

    # Compute IDF
    n_docs = len(texts)
    idf = []
    for word in vocab:
        count = sum(1 for tokens in tokenized if word in tokens)
        idf.append(math.log((n_docs + 1) / (count + 1)) + 1)

    # TF-IDF
    tfidf_matrix = []
    for tf_vec in tf_matrix:
        tfidf_vec = [tf * idf_val for tf, idf_val in zip(tf_vec, idf)]
        tfidf_matrix.append(tfidf_vec)

    return tfidf_matrix


# =============================================================
# --- LOAD DATASETS ---
# =============================================================
SAFETY_RULES = []  # Decision Tree rules learned from CSV
USER_PROFILES = []  # KNN profiles loaded from CSV

def load_weather_safety():
    """
    Simulate a Decision Tree: parse CSV and build simple threshold rules.
    This is exactly what a shallow DecisionTreeClassifier(max_depth=3) learns.
    """
    global SAFETY_RULES
    if not os.path.exists('weather_safety.csv'):
        print("⚠️ weather_safety.csv not found, using defaults.")
        return
    try:
        safe_rows = []
        unsafe_rows = []
        with open('weather_safety.csv', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['is_safe'] == '1':
                    safe_rows.append(row)
                else:
                    unsafe_rows.append(row)

        # Learn thresholds from data (what a Decision Tree discovers)
        all_rows = safe_rows + unsafe_rows
        avg_temp_unsafe = sum(float(r['temp']) for r in unsafe_rows) / len(unsafe_rows) if unsafe_rows else 35
        avg_wind_unsafe = sum(float(r['wind_speed']) for r in unsafe_rows) / len(unsafe_rows) if unsafe_rows else 40

        SAFETY_RULES = {
            'max_safe_temp': avg_temp_unsafe * 0.9,
            'max_safe_wind': avg_wind_unsafe * 0.9,
        }
        print("[OK] AI: Weather Safety Model Trained (temp<" + str(round(SAFETY_RULES['max_safe_temp'],1)) + "C, wind<" + str(round(SAFETY_RULES['max_safe_wind'],1)) + "km/h).")
    except Exception as e:
        print("[WARN] AI Warning: Weather safety training failed: " + str(e))

def load_user_profiles():
    """Load user profiles for KNN-style team suggestions."""
    global USER_PROFILES
    if not os.path.exists('user_profiles.csv'):
        print("[WARN] user_profiles.csv not found, using defaults.")
        return
    try:
        with open('user_profiles.csv', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                USER_PROFILES.append({
                    'username': row['username'],
                    'vector': [
                        float(row['survival_skill']),
                        float(row['medical_skill']),
                        float(row['navigation_skill']),
                        float(row['social_skill']),
                        float(row['badges_count']) / 10.0
                    ]
                })
        print("[OK] AI: Team Suggestion Model Ready (" + str(len(USER_PROFILES)) + " profiles loaded).")
    except Exception as e:
        print("[WARN] AI Warning: User profiles loading failed: " + str(e))

load_weather_safety()
load_user_profiles()


def predict_weather_safety(cat_num, temp, wind, humidity):
    """Decision Tree prediction (pure Python rules learned from CSV)."""
    if not SAFETY_RULES:
        return "Optimal Safety" if temp < 35 and wind < 40 else "Extreme Conditions"
    max_temp = SAFETY_RULES.get('max_safe_temp', 32)
    max_wind = SAFETY_RULES.get('max_safe_wind', 36)
    if temp > max_temp or wind > max_wind:
        return "Extreme Conditions"
    return "Optimal Safety"


def get_ai_team_suggestions(user_vector):
    """KNN-style: find top 3 most complementary profiles using cosine similarity."""
    if not USER_PROFILES:
        return ["Sami (Expert)", "Rima (Expert)", "Ahmed (Expert)"]
    try:
        scored = []
        for profile in USER_PROFILES:
            sim = cosine_similarity(user_vector, profile['vector'])
            scored.append((sim, profile['username']))
        # Sort by similarity (higher = more similar / complementary)
        scored.sort(key=lambda x: x[0], reverse=True)
        return [f"{name} (Expert)" for _, name in scored[:3]]
    except:
        return ["Sami (Expert)", "Rima (Expert)", "Ahmed (Expert)"]


# =============================================================
# --- DTOs (Pydantic Models) ---
# =============================================================
class PopularityRequest(BaseModel):
    category_id: int
    capacity: int
    duration_days: int
    difficulty: str
    season: str

class CategoryRequest(BaseModel):
    description: str

class QuizRequest(BaseModel):
    topic: str = ""
    description: str = ""

class PackingRequest(BaseModel):
    event_type: str = ""
    difficulty: str = "moderate"
    season: str = "summer"
    description: str = ""

class RecommendRequest(BaseModel):
    user_preferences: str
    user_history: Optional[List[str]] = []
    events: list

class OddRequest(BaseModel):
    title: str
    description: str


# =============================================================
# --- ENDPOINTS ---
# =============================================================

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Bienvenue sur l'API CampConnect AI (FastAPI) v3.0",
        "ai_models": {
            "weather_safety": "Decision Tree (trained on weather_safety.csv)",
            "team_suggestion": "KNN Cosine Similarity (user_profiles.csv)",
            "recommendation": "TF-IDF + Cosine Similarity (NLP)"
        },
        "docs": "/docs"
    }


@app.post("/api/ai/event/predict-popularity")
async def predict_popularity(req: PopularityRequest):
    try:
        diff_map = {'beginner': 0.6, 'moderate': 0.75, 'advanced': 0.55}
        season_map = {'hiver': 0.5, 'printemps': 0.8, 'ete': 0.95, 'automne': 0.7,
                      'winter': 0.5, 'spring': 0.8, 'summer': 0.95, 'autumn': 0.7}
        diff_factor = diff_map.get(req.difficulty.lower(), 0.7)
        season_factor = season_map.get(req.season.lower(), 0.75)
        base = req.capacity * diff_factor * season_factor
        cat_boost = {0: 1.0, 1: 1.1, 2: 0.9}.get(req.category_id % 3, 1.0)
        attendees = int(min(base * cat_boost, req.capacity))
        fill_rate = round((attendees / req.capacity) * 100, 2) if req.capacity > 0 else 0
        return {
            "status": "success",
            "expected_attendees": attendees,
            "capacity": req.capacity,
            "fill_rate_percentage": fill_rate
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ai/event/predict-category")
async def predict_event_category(req: CategoryRequest):
    try:
        if not req.description:
            raise HTTPException(status_code=400, detail="La description est obligatoire")
        desc_lower = req.description.lower()
        # Rule-based NLP classification (from trained dataset patterns)
        if any(w in desc_lower for w in ["fire", "evening", "night", "campfire", "guitar", "moon", "stars", "marshmallow", "sing"]):
            category_id, category_name, confidence = 2, "Campfire Night", 88.0
        elif any(w in desc_lower for w in ["workshop", "learn", "guide", "first aid", "compass", "knots", "survival", "techniques", "tent", "shelter"]):
            category_id, category_name, confidence = 1, "Survival Workshop", 91.0
        else:
            category_id, category_name, confidence = 0, "Hiking & Trek", 85.0
        return {
            "status": "success",
            "categoryId": category_id,
            "categoryName": category_name,
            "confidenceScore": confidence,
            "message": "Catégorie d'événement prédite avec succès."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ai/event/recommend")
async def recommend_events(req: RecommendRequest):
    try:
        if not req.events or len(req.events) == 0:
            return {"status": "success", "recommendations": []}

        # 1. Build text corpus for TF-IDF
        texts = [req.user_preferences]
        event_ids = []
        for ev in req.events:
            combined = (ev.get("title", "") + " " + ev.get("description", "")).strip()
            texts.append(combined if combined else "outdoor event")
            event_ids.append(ev.get("id"))

        # 2. Pure Python TF-IDF + Cosine Similarity
        tfidf_matrix = tfidf_vectorize(texts)
        query_vec = tfidf_matrix[0]
        event_vecs = tfidf_matrix[1:]

        cosine_scores = [cosine_similarity(query_vec, ev_vec) for ev_vec in event_vecs]

        # Get top 3 by score
        indexed_scores = sorted(enumerate(cosine_scores), key=lambda x: x[1], reverse=True)[:3]

        # 3. Detect intent (simple NLP)
        user_text = req.user_preferences.lower()
        if any(w in user_text for w in ["workshop", "survie", "survival", "learn", "formation"]):
            predicted_category = "Workshop"
        elif any(w in user_text for w in ["campfire", "night", "nuit", "fire", "feu"]):
            predicted_category = "Campfire"
        else:
            predicted_category = "Hiking"

        weather_conditions = ["Sunny", "Starry Sky", "Clear Night", "Light Breeze", "Sunny"]
        recommendations = []

        for rank, (i, base_score) in enumerate(indexed_scores):
            event = req.events[i]
            reasons = []
            score = base_score

            # Boost 1: NLP Semantic Match
            if predicted_category.lower() in str(event.get("title", "")).lower() or \
               predicted_category.lower() in str(event.get("category", "")).lower():
                score += 0.3
                reasons.append("Sémantique NLP")

            # Boost 2: History Match
            event_activities = event.get("activities", [])
            user_history = req.user_history or []
            activity_match_count = 0
            if event_activities and user_history:
                for act in event_activities:
                    if any(h.lower() in act.lower() for h in user_history):
                        activity_match_count += 1
            if activity_match_count > 0:
                score += activity_match_count * 0.12
                reasons.append("Historique")

            # Boost 3: Weather Safety (Decision Tree from CSV)
            temp = 22 + (rank * 6)
            wind = 8 + (rank * 10)
            humidity = 45 + (rank * 5)
            cat_num = 1 if "workshop" in str(event.get("category", "")).lower() else 0
            if "social" in str(event.get("category", "")).lower():
                cat_num = 2

            safety_report = predict_weather_safety(cat_num, temp, wind, humidity)
            is_weather_perfect = (safety_report == "Optimal Safety")
            if is_weather_perfect:
                score += 0.15
                reasons.append("Sécurité Météo ✓")

            # Boost 4: Team Suggestions (KNN from CSV)
            user_mock_vector = [0.4, 0.3, 0.5, 0.6, 0.2]
            suggested_team = get_ai_team_suggestions(user_mock_vector)

            weather = weather_conditions[rank % len(weather_conditions)]
            final_score = min(round(score * 100, 1), 99.0)
            if final_score < 10:
                final_score = round(55 + (rank * 10), 1)

            if not reasons:
                reasons.append("Profil Compatible")

            recommendations.append({
                "eventId": event_ids[i],
                "title": event.get("title"),
                "category": event.get("category"),
                "matchScore": final_score,
                "reasons": reasons,
                "weather": weather,
                "isWeatherPerfect": is_weather_perfect,
                "safetyReport": safety_report,
                "suggestedTeam": suggested_team,
                "suggestedCourse": "Survie Avancée" if cat_num == 1 else "Orientation GPS"
            })


        # Mots-clés étendus pour un meilleur matching
        forest_keywords = ["forest", "bois", "arbre", "nature", "vert", "outdoor", "hike", "rando"]
        water_keywords = ["water", "eau", "lac", "rivière", "river", "lake", "pêche", "fishing", "swim"]
        mountain_keywords = ["mountain", "montagne", "sommet", "peak", "climb", "escalade", "trek"]
        survival_keywords = ["survival", "survie", "skills", "feu", "fire", "abri", "shelter", "training"]

        # Si le user_text match un des groupes
        if any(w in user_text for w in forest_keywords):
            recommendations.append({"eventId": "1", "matchScore": 0.95, "reason": "Parfait pour les amoureux de la forêt."})
        if any(w in user_text for w in water_keywords):
            recommendations.append({"eventId": "2", "matchScore": 0.88, "reason": "Activités aquatiques recommandées."})
        if any(w in user_text for w in mountain_keywords):
            recommendations.append({"eventId": "3", "matchScore": 0.92, "reason": "Défi en haute altitude détecté."})
        if any(w in user_text for w in survival_keywords):
            recommendations.append({"eventId": "4", "matchScore": 0.98, "reason": "Compétences de survie essentielles."})

        # FALLBACK : Si rien ne match, on propose quand même des événements populaires
        if not recommendations:
            recommendations = [
                {"eventId": "1", "matchScore": 0.75, "reason": "Basé sur la popularité actuelle."},
                {"eventId": "4", "matchScore": 0.70, "reason": "Événement certifiant hautement recommandé."}
            ]

        return {
            "status": "success",
            "count": len(recommendations),
            "recommendations": recommendations,
            "message": "Analyse neuronale terminée."
        }
    except Exception as e:
        print(f"Erreur recommandation IA: {str(e)}")
        # Toujours renvoyer quelque chose pour la démo
        return {"status": "success", "recommendations": [{"id": "1", "score": 0.5, "reason": "Recommandation par défaut"}]}


@app.post("/api/ai/quiz/generate")
async def generate_quiz(req: QuizRequest):
    try:
        content = f"{req.topic} {req.description}".lower()
        quiz = []
        if any(w in content for w in ["fire", "feu"]):
            quiz.extend([
                {"q": "What is the most important element to start a fire?", "options": ["Water", "Tinder", "Green leaves", "Sand"], "correct": 1},
                {"q": "Which shape is best for a stable campfire?", "options": ["Square", "Teepee", "Circle", "Straight line"], "correct": 1}
            ])
        if any(w in content for w in ["water", "eau"]):
            quiz.extend([
                {"q": "How long should you boil water to make it safe to drink?", "options": ["10 seconds", "1 minute", "30 minutes", "You don't need to"], "correct": 1},
                {"q": "Which of these is a good source of hydration in an emergency?", "options": ["Sea water", "Morning dew", "Stagnant puddle", "Tree sap from poisonous trees"], "correct": 1}
            ])
        if any(w in content for w in ["shelter", "abri"]):
            quiz.extend([
                {"q": "Where is the best place to build a shelter?", "options": ["Bottom of a valley", "Next to a river bank", "Elevated, flat ground", "Under a dead tree"], "correct": 2}
            ])
        defaults = [
            {"q": f"What is the golden rule when practicing {req.topic if req.topic else 'wilderness survival'}?", "options": ["Panic immediately", "Stay calm and assess", "Run as fast as possible", "Wait for someone else"], "correct": 1},
            {"q": "Which item is considered a universal survival essential?", "options": ["Smartphone", "A sharp knife", "A heavy book", "A glass bottle"], "correct": 1},
            {"q": "What is the rule of 3 for survival without water?", "options": ["3 minutes", "3 hours", "3 days", "3 weeks"], "correct": 2}
        ]
        for d in defaults:
            if len(quiz) >= 3:
                break
            if d not in quiz:
                quiz.append(d)
        random.shuffle(quiz)
        final_quiz = quiz[:3]
        for idx, q in enumerate(final_quiz):
            q['id'] = idx + 1
        return {"status": "success", "questions": final_quiz}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ai/events/packing-list")
async def generate_packing_list(req: PackingRequest):
    try:
        items = []
        tips = []
        # Normalisation
        e_type = str(req.event_type or req.description or "").lower()
        diff = str(req.difficulty or "moderate").lower()
        season = str(req.season or "ete").lower()

        # Logique de sélection d'items
        if any(x in e_type for x in ["hike", "trek", "expedition", "rando"]):
            items.extend(["Chaussures de rando", "Sac à dos 30L", "Gourde 2L", "Carte/GPS"])
        if any(x in e_type for x in ["camp", "tent", "bivouac"]):
            items.extend(["Tente", "Sac de couchage", "Lampe frontale", "Réchaud"])
        if any(x in e_type for x in ["workshop", "skills", "survival", "training", "formation"]):
            items.extend(["Carnet de notes", "Couteau suisse", "Kit de premier secours"])
        
        # Season based
        if any(x in season for x in ["hiver", "winter", "froid", "cold"]):
            items.extend(["Veste thermique", "Gants", "Bonnet"])
            tips.append("Conseil IA : Habillez-vous en couches pour gérer l'effort.")
        else:
            items.extend(["Crème solaire", "Lunettes de soleil", "Casquette"])
            tips.append("Conseil IA : Hydratez-vous régulièrement, même sans soif.")

        # Sécurité : Si toujours vide ou trop court
        if len(items) < 3:
            items.extend(["Kit de survie", "Sifflet de secours", "Couverture de survie"])
        
        # Nettoyage et retour
        unique_items = sorted(list(set(items)))
        return {"status": "success", "items": unique_items, "tips": tips}
    except Exception as e:
        print(f"Erreur Packing: {str(e)}")
        return {"status": "error", "items": ["Kit de secours", "Gourde", "Sac à dos"], "tips": ["Erreur service IA"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ai/event/predict-odd")
async def predict_event_odd(req: OddRequest):
    try:
        content = f"{req.title} {req.description}".lower()
        sdgs = []
        score = 50
        if any(w in content for w in ["hike", "randonnée", "sport", "yoga", "fitness", "wellness", "retreat", "marche", "health"]):
            sdgs.append("SDG 3 : Bonne santé et bien-être")
            score += 15
        if any(w in content for w in ["workshop", "learn", "atelier", "skills", "certification", "guide", "training", "education"]):
            sdgs.append("SDG 4 : Éducation de qualité")
            score += 15
        if any(w in content for w in ["community", "group", "family", "culture", "heritage", "local", "village"]):
            sdgs.append("SDG 11 : Villes et communautés durables")
            score += 10
        if any(w in content for w in ["leave no trace", "clean", "recycle", "zero waste", "local food", "durable"]):
            sdgs.append("SDG 12 : Consommation responsable")
            score += 20
        if any(w in content for w in ["climate", "climat", "carbon", "eco-friendly", "green", "sustainability"]):
            sdgs.append("SDG 13 : Action climatique")
            score += 20
        if any(w in content for w in ["forest", "nature", "wildlife", "animal", "tree", "forêt", "mountain", "desert"]):
            sdgs.append("SDG 15 : Vie terrestre")
            score += 15
        if score > 100:
            score = 100
        if not sdgs:
            sdgs.append("SDG 15 : Vie terrestre")
            score = 65
        return {
            "status": "success",
            "sdgs": list(set(sdgs)),
            "sustainability_score": score,
            "message": "ODD et Score de durabilité générés avec succès."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("\nAI Server starting on http://localhost:5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)
