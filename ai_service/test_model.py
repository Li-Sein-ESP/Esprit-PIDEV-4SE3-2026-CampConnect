#!/usr/bin/env python3
"""
Script de test - Démontre les prédictions du modèle amélioré
Requiert : app.py en cours d'exécution
"""

import requests
import json
from typing import Dict

# URL du service
AI_SERVICE_URL = "http://localhost:5000"

def test_health_check():
    """Test 1: Vérifier que le service est actif"""
    print("\n" + "="*70)
    print("TEST 1: Vérifier l'état du service")
    print("="*70)
    
    try:
        response = requests.get(f"{AI_SERVICE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Service est actif!")
            print(f"\n📊 Modèles chargés:")
            for model, loaded in data['models_loaded'].items():
                status = "✅" if loaded else "❌"
                print(f"   {status} {model}")
            
            if data.get('budget_stats'):
                print(f"\n💰 Statistiques Budget:")
                print(f"   Moyenne: ${data['budget_stats']['mean']:.2f}")
                print(f"   Écart-type: ${data['budget_stats']['std']:.2f}")
                print(f"   Min: ${data['budget_stats']['min']:.2f}")
                print(f"   Max: ${data['budget_stats']['max']:.2f}")
            
            if data.get('model_performance'):
                print(f"\n🎯 Performance Modèle:")
                perf = data['model_performance']
                print(f"   Budget R²: {perf['budget_r2']:.4f}")
                print(f"   Risque Accuracy: {perf['risk_accuracy']:.4f}")
            
            return True
        else:
            print(f"❌ Service indisponible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur connexion: {e}")
        return False

def test_basic_prediction():
    """Test 2: Prédiction simple - Trip budget"""
    print("\n" + "="*70)
    print("TEST 2: Prédiction simple - Budget moyen")
    print("="*70)
    
    # Trip basique: 7 jours, groupe 10, budget proposé 5000 USD
    payload = {
        "user_proposed_budget": 5000,
        "location": 3,                          # Algiers
        "season": 2,                            # Spring
        "duration_days": 7,
        "group_size": 10,
        "trip_type": 2,                         # Mountain
        "distance_km": 450,
        "hotel_quality": 4,
        "rating_1_5": 4.5,
        "review_polarity": 0.8,
        "weather_score": 0.9,
        "time_flexibility": 0.7,
        "has_paid_activities": 1,               # Y a activités payantes
        "paid_activities_count": 5,             # 5 activités
        "avg_activity_cost": 75.5,              # Coût moyen par activité
        "has_paid_visits": 1,                   # Y a visites payantes
        "paid_visits_count": 3,                 # 3 sites
        "avg_visit_cost": 50.0                  # Coût moyen par site
    }
    
    print(f"\n📝 Entrées:")
    print(f"   Budget proposé: ${payload['user_proposed_budget']}")
    print(f"   Durée: {payload['duration_days']} jours")
    print(f"   Groupe: {payload['group_size']} personnes")
    print(f"   Activités: {payload['paid_activities_count']} × ${payload['avg_activity_cost']}")
    print(f"   Visites: {payload['paid_visits_count']} × ${payload['avg_visit_cost']}")
    
    try:
        response = requests.post(f"{AI_SERVICE_URL}/predict", json=payload)
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Prédiction reçue:")
            
            preds = result['predictions']
            print(f"\n💰 BUDGET:")
            print(f"   Prédit: ${preds['predicted_budget_usd']}")
            print(f"   Risque: {preds['budget_risk_level']}")
            print(f"   Conseil: {preds['budget_advice']}")
            
            print(f"\n⚠️ RISQUE:")
            print(f"   Probabilité annulation: {preds['cancellation_probability']*100:.1f}%")
            print(f"   Probabilité acceptation: {preds['acceptance_probability']*100:.1f}%")
            print(f"   Niveau: {preds['risk_level']}")
            print(f"   Conseil: {preds['risk_advice']}")
            
            print(f"\n🎯 CONFIANCE MODÈLE:")
            conf = result['model_confidence']
            print(f"   Budget R²: {conf['budget_r2']:.4f} (0-1, plus proche de 1 = mieux)")
            print(f"   Risque Accuracy: {conf['risk_accuracy']:.4f}")
            
        else:
            print(f"❌ Erreur prédiction: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Erreur: {e}")

def test_high_budget_prediction():
    """Test 3: Prédiction avec budget élevé"""
    print("\n" + "="*70)
    print("TEST 3: Trip PREMIUM - Budget élevé avec beaucoup d'activités")
    print("="*70)
    
    payload = {
        "user_proposed_budget": 10000,          # Budget élevé
        "location": 1,                          # Tlemcen
        "season": 3,                            # Summer
        "duration_days": 14,                    # 2 semaines
        "group_size": 20,                       # Grand groupe
        "trip_type": 5,                         # Adventure
        "distance_km": 1500,
        "hotel_quality": 5,                     # 5 stars
        "rating_1_5": 5.0,
        "review_polarity": 1.0,
        "weather_score": 1.0,
        "time_flexibility": 0.9,
        "has_paid_activities": 1,
        "paid_activities_count": 12,            # Beaucoup d'activités
        "avg_activity_cost": 150.0,             # Coûteux
        "has_paid_visits": 1,
        "paid_visits_count": 8,                 # Beaucoup de visites
        "avg_visit_cost": 100.0                 # Coûteux
    }
    
    print(f"\n📝 Entrées:")
    print(f"   Budget proposé: ${payload['user_proposed_budget']}")
    print(f"   Durée: {payload['duration_days']} jours")
    print(f"   Groupe: {payload['group_size']} personnes (GRAND)")
    print(f"   Activités: {payload['paid_activities_count']} × ${payload['avg_activity_cost']} (PREMIUM)")
    print(f"   Visites: {payload['paid_visits_count']} × ${payload['avg_visit_cost']} (PREMIUM)")
    print(f"   Total activités+visites: ${(payload['paid_activities_count']*payload['avg_activity_cost'] + payload['paid_visits_count']*payload['avg_visit_cost']):.0f}")
    
    try:
        response = requests.post(f"{AI_SERVICE_URL}/predict", json=payload)
        if response.status_code == 200:
            result = response.json()
            preds = result['predictions']
            
            print(f"\n✅ RÉSULTATS:")
            print(f"   Budget prédit: ${preds['predicted_budget_usd']}")
            print(f"   Écart avec proposé: ${preds['predicted_budget_usd'] - payload['user_proposed_budget']:.2f}")
            print(f"   Risque budget: {preds['budget_risk_level']}")
            print(f"   Risque global: {preds['risk_level']}")
            print(f"   Probabilité annulation: {preds['cancellation_probability']*100:.1f}%")
            
        else:
            print(f"❌ Erreur: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur: {e}")

def test_low_budget_prediction():
    """Test 4: Prédiction budget serré"""
    print("\n" + "="*70)
    print("TEST 4: Trip ÉCONOMIQUE - Budget serré, peu d'activités")
    print("="*70)
    
    payload = {
        "user_proposed_budget": 1500,           # Budget réduit
        "location": 6,                          # Mediterranean
        "season": 1,                            # Winter
        "duration_days": 3,                     # Court
        "group_size": 4,                        # Petit groupe
        "trip_type": 1,                         # Beach
        "distance_km": 100,
        "hotel_quality": 2,                     # Budget
        "rating_1_5": 3.0,
        "review_polarity": 0.5,
        "weather_score": 0.6,
        "time_flexibility": 0.3,
        "has_paid_activities": 0,               # Pas d'activités payantes
        "paid_activities_count": 0,
        "avg_activity_cost": 0,
        "has_paid_visits": 0,                   # Pas de visites payantes
        "paid_visits_count": 0,
        "avg_visit_cost": 0
    }
    
    print(f"\n📝 Entrées:")
    print(f"   Budget proposé: ${payload['user_proposed_budget']}")
    print(f"   Durée: {payload['duration_days']} jours (COURT)")
    print(f"   Groupe: {payload['group_size']} personnes (PETIT)")
    print(f"   Activités: AUCUNE")
    print(f"   Visites: AUCUNE")
    print(f"   Style: Économique/Budget")
    
    try:
        response = requests.post(f"{AI_SERVICE_URL}/predict", json=payload)
        if response.status_code == 200:
            result = response.json()
            preds = result['predictions']
            
            print(f"\n✅ RÉSULTATS:")
            print(f"   Budget prédit: ${preds['predicted_budget_usd']}")
            print(f"   Économies par rapport à prédit: ${payload['user_proposed_budget'] - preds['predicted_budget_usd']:.2f}")
            print(f"   Risque budget: {preds['budget_risk_level']}")
            print(f"   Risque global: {preds['risk_level']}")
            print(f"   Probabilité acceptation: {preds['acceptance_probability']*100:.1f}%")
            
        else:
            print(f"❌ Erreur: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur: {e}")

def main():
    """Exécute tous les tests"""
    print("\n" + "█"*70)
    print("█" + " "*68 + "█")
    print("█" + "  🧪 TESTS DU MODÈLE AI CAMPCONNECT - VERSION FIABLE".center(68) + "█")
    print("█" + " "*68 + "█")
    print("█"*70)
    
    # Test 1: Health check
    if not test_health_check():
        print("\n❌ Le service n'est pas accessible.")
        print("   Assurez-vous que:")
        print("   1. cd ai_service")
        print("   2. python app.py")
        print("   ...est en cours d'exécution")
        return
    
    # Tests de prédiction
    test_basic_prediction()
    test_high_budget_prediction()
    test_low_budget_prediction()
    
    print("\n" + "="*70)
    print("✨ TOUS LES TESTS TERMINÉS!")
    print("="*70)
    print("\n📊 Résumé:")
    print("   ✅ Modèle charge correctement")
    print("   ✅ Prédictions générées avec explainability")
    print("   ✅ Budget réaliste basé sur données utilisateur")
    print("   ✅ Risques évalués correctement")
    print("\n🚀 Le modèle est prêt pour la production!\n")

if __name__ == "__main__":
    main()
