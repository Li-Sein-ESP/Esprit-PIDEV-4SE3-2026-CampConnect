#!/usr/bin/env python3
"""
Script de test - Démonstration du calcul du budget en DINARS TUNISIENS
Teste la nouvelle API avec conversion de devise et détail du transport
"""

import requests
import json

# URL du service
AI_SERVICE_URL = "http://localhost:5000"

def test_budget_calculation_dinars():
    """Test: Calcul complet du budget en dinars avec tous les critères"""
    print("\n" + "="*80)
    print("🧮 TEST: CALCUL DU BUDGET EN DINARS TUNISIENS")
    print("="*80)
    
    # Données de test: Trip avec activités, visites, hôtel et transport
    test_data = {
        "user_proposed_budget": 5000,  # Budget proposé en USD
        "location": 2,                 # Destination tunisienne
        "season": 2,                   # Été
        "duration_days": 7,            # 7 jours
        "group_size": 5,               # 5 personnes
        "trip_type": 2,                # Trip familial
        "distance_km": 600,            # 600 km de trajet (transport compris)
        "hotel_quality": 4,            # Hôtel 4 étoiles
        "rating_1_5": 4.5,
        "review_polarity": 0.8,
        "weather_score": 0.9,
        "time_flexibility": 0.7,
        "has_paid_activities": 1,      # Activités payantes
        "paid_activities_count": 4,    # 4 activités payantes
        "avg_activity_cost": 80,       # 80 USD par activité
        "has_paid_visits": 1,          # Visites payantes
        "paid_visits_count": 3,        # 3 visites payantes
        "avg_visit_cost": 60           # 60 USD par visite
    }
    
    try:
        print("\n📤 Envoi de la requête...")
        print(f"   Budget proposé: {test_data['user_proposed_budget']} USD")
        print(f"   Distance: {test_data['distance_km']} km")
        print(f"   Activités payantes: {test_data['paid_activities_count']}")
        print(f"   Visites payantes: {test_data['paid_visits_count']}")
        print(f"   Durée: {test_data['duration_days']} jours")
        print(f"   Groupe: {test_data['group_size']} personnes")
        
        response = requests.post(f"{AI_SERVICE_URL}/predict", json=test_data)
        
        if response.status_code == 200:
            result = response.json()
            
            print("\n✅ RÉPONSE DU SERVICE AI:")
            print("="*80)
            
            # Affichage des prédictions
            predictions = result.get('predictions', {})
            print("\n💰 BUDGET PRÉDIT:")
            print(f"   En USD: ${predictions.get('predicted_budget_usd', 0):.2f}")
            print(f"   En Dinars Tunisiens: {predictions.get('predicted_budget_tnd', 0):.2f} DT")
            print(f"   Taux de change: {predictions.get('currency_rate', '1 USD = 3.15 DT')}")
            
            print(f"\n⚠️  NIVEAU DE RISQUE: {predictions.get('budget_risk_level', 'N/A')}")
            print(f"   Conseil: {predictions.get('budget_advice', 'N/A')}")
            
            # Affichage du détail du budget
            explanation = result.get('explanation', {})
            budget_analysis = explanation.get('budget_analysis_dinars', {})
            
            if budget_analysis:
                print("\n📊 DÉTAIL DU BUDGET EN DINARS:")
                breakdown = budget_analysis.get('breakdown_tnd', {})
                if breakdown:
                    print(f"   🚗 Transport: {breakdown.get('transport_cost', 0):.2f} DT")
                    print(f"   🏨 Hôtel (7 nuits): {breakdown.get('hotel_total', 0):.2f} DT")
                    print(f"   🎯 Activités ({breakdown.get('paid_activities', 0)}): {breakdown.get('activities_cost', 0):.2f} DT")
                    print(f"   🏛️  Visites ({breakdown.get('paid_visits', 0)}): {breakdown.get('visits_cost', 0):.2f} DT")
                    print(f"   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                    total_exp = breakdown.get('total_experiences_cost', 0)
                    transport = breakdown.get('transport_cost', 0)
                    hotel = breakdown.get('hotel_total', 0)
                    total = transport + hotel + total_exp
                    print(f"   📌 TOTAL ESTIMÉ: {total:.2f} DT")
            
            # Risque d'acceptation
            print(f"\n📈 ANALYSE DU RISQUE:")
            print(f"   Probabilité d'acceptation: {predictions.get('acceptance_probability', 0)*100:.1f}%")
            print(f"   Probabilité d'annulation: {predictions.get('cancellation_probability', 0)*100:.1f}%")
            print(f"   Niveau de risque: {predictions.get('risk_level', 'N/A')}")
            print(f"   Conseil risque: {predictions.get('risk_advice', 'N/A')}")
            
            # Confiance du modèle
            print(f"\n🎯 CONFIANCE DU MODÈLE:")
            confidence = result.get('model_confidence', {})
            print(f"   R² Budget: {confidence.get('budget_r2', 0):.4f}")
            print(f"   Accuracy Risque: {confidence.get('risk_accuracy', 0):.4f}")
            
            print("\n" + "="*80)
            
        else:
            print(f"❌ Erreur: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_health_check():
    """Test: Vérifier l'état du service"""
    print("\n" + "="*80)
    print("🏥 TEST: VÉRIFICATION DE L'ÉTAT DU SERVICE")
    print("="*80)
    
    try:
        response = requests.get(f"{AI_SERVICE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Service actif!")
            print(f"\n📊 État des modèles:")
            models = data.get('models_loaded', {})
            for model, loaded in models.items():
                status = "✅" if loaded else "❌"
                print(f"   {status} {model.capitalize()}")
            
            budget_stats = data.get('budget_stats', {})
            if budget_stats:
                print(f"\n💰 Statistiques Budget (USD):")
                print(f"   Moyenne: ${budget_stats.get('mean', 0):.2f}")
                print(f"   Écart-type: ${budget_stats.get('std', 0):.2f}")
                print(f"   Min: ${budget_stats.get('min', 0):.2f}")
                print(f"   Max: ${budget_stats.get('max', 0):.2f}")
        else:
            print(f"❌ Erreur: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    print("\n🚀 TESTS DE L'API - CALCUL DE BUDGET EN DINARS TUNISIENS")
    
    # Test 1: Vérifier l'état du service
    test_health_check()
    
    # Test 2: Calcul complet du budget
    test_budget_calculation_dinars()
    
    print("\n✨ TESTS TERMINÉS!")
