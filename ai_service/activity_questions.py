"""
Questionnaire pour CampConnect - Questions sur les activités et visites payantes
Retourne les réponses sous forme de JSON pour passer au modèle AI
"""

ACTIVITY_QUESTIONS = [
    {
        "id": 1,
        "question": "Allez-vous faire des activités payantes (sports, excursions, etc.)?",
        "type": "yes_no",
        "maps_to": "has_paid_activities"
    },
    {
        "id": 2,
        "question": "Combien d'activités payantes prévoyez-vous environ?",
        "type": "number",
        "min": 0,
        "max": 15,
        "maps_to": "paid_activities_count",
        "conditional_on": {"question_id": 1, "answer": "yes"}
    },
    {
        "id": 3,
        "question": "Quel est le coût moyen par activité (en USD)?",
        "type": "number_float",
        "min": 0,
        "max": 500,
        "maps_to": "avg_activity_cost",
        "conditional_on": {"question_id": 1, "answer": "yes"},
        "examples": ["Randonnée: 30-80 USD", "Escalade: 50-120 USD", "Quad: 60-150 USD", "Parachute: 200-300 USD"]
    },
    {
        "id": 4,
        "question": "Allez-vous visiter des sites/musées/monuments payants?",
        "type": "yes_no",
        "maps_to": "has_paid_visits"
    },
    {
        "id": 5,
        "question": "Combien de sites/musées payants prévoyez-vous de visiter?",
        "type": "number",
        "min": 0,
        "max": 20,
        "maps_to": "paid_visits_count",
        "conditional_on": {"question_id": 4, "answer": "yes"}
    },
    {
        "id": 6,
        "question": "Quel est le coût moyen par site/musée (en USD)?",
        "type": "number_float",
        "min": 0,
        "max": 300,
        "maps_to": "avg_visit_cost",
        "conditional_on": {"question_id": 4, "answer": "yes"},
        "examples": ["Musée: 10-30 USD", "Parc national: 20-50 USD", "Monument: 5-25 USD"]
    }
]

def get_questionnaire():
    """Retourne le questionnaire complet"""
    return {
        "title": "Questions sur les activités et visites payantes",
        "description": "Ces questions aident le modèle AI à prédire le budget réel",
        "questions": ACTIVITY_QUESTIONS
    }

def validate_answer(question_id: int, answer):
    """Valide une réponse selon le type de question"""
    question = next((q for q in ACTIVITY_QUESTIONS if q["id"] == question_id), None)
    if not question:
        return False, "Question non trouvée"
    
    if question["type"] == "yes_no":
        if answer not in ["yes", "no", True, False, 1, 0]:
            return False, "Réponse doit être oui/non"
        return True, None
    
    elif question["type"] == "number":
        try:
            val = int(answer)
            if val < question.get("min", 0) or val > question.get("max", 100):
                return False, f"Nombre doit être entre {question.get('min')} et {question.get('max')}"
            return True, None
        except:
            return False, "Doit être un nombre entier"
    
    elif question["type"] == "number_float":
        try:
            val = float(answer)
            if val < question.get("min", 0) or val > question.get("max", 10000):
                return False, f"Nombre doit être entre {question.get('min')} et {question.get('max')}"
            return True, None
        except:
            return False, "Doit être un nombre"
    
    return True, None

def map_answers_to_features(answers: dict):
    """
    Convertit les réponses au questionnaire en features pour le modèle
    
    Input: {
        "has_paid_activities": True,
        "paid_activities_count": 5,
        "avg_activity_cost": 75.5,
        "has_paid_visits": True,
        "paid_visits_count": 3,
        "avg_visit_cost": 50.0
    }
    
    Output: Dictionnaire prêt pour envoyer au modèle AI
    """
    features = {
        "has_paid_activities": int(answers.get("has_paid_activities", 0)),
        "paid_activities_count": int(answers.get("paid_activities_count", 0)),
        "avg_activity_cost": float(answers.get("avg_activity_cost", 0)),
        "has_paid_visits": int(answers.get("has_paid_visits", 0)),
        "paid_visits_count": int(answers.get("paid_visits_count", 0)),
        "avg_visit_cost": float(answers.get("avg_visit_cost", 0))
    }
    
    return features

if __name__ == "__main__":
    import json
    print(json.dumps(get_questionnaire(), indent=2, ensure_ascii=False))
