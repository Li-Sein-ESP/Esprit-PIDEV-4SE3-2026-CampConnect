#!/usr/bin/env python3
"""
🧪 SCRIPT DE VALIDATION COMPLET - MODÈLE AI CAMPCONNECT
Vérifie que le modèle fait de bonnes prédictions selon les demandes utilisateur
"""

import requests
import json
from typing import Dict, List, Tuple
from datetime import datetime

# Configuration
AI_SERVICE_URL = "http://localhost:5000"
RESULTS_FILE = "validation_results.json"

class AIModelValidator:
    """Classe pour valider le modèle AI"""
    
    def __init__(self, service_url: str):
        self.service_url = service_url
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "tests": [],
            "summary": {}
        }
    
    def test_health(self) -> bool:
        """✅ Test 1: Vérifier que le service est actif"""
        print("\n" + "="*80)
        print("TEST 1: Vérifier État du Service")
        print("="*80)
        
        try:
            response = requests.get(f"{self.service_url}/health", timeout=5)
            
            if response.status_code != 200:
                print(f"❌ Service indisponible: {response.status_code}")
                return False
            
            data = response.json()
            print("✅ Service est ACTIF!")
            
            # Afficher les modèles chargés
            print(f"\n📊 Modèles chargés:")
            for model, loaded in data.get('models_loaded', {}).items():
                status = "✅" if loaded else "❌"
                print(f"   {status} {model}")
            
            # Afficher les stats budget
            if data.get('budget_stats'):
                stats = data['budget_stats']
                print(f"\n💰 Statistiques Budget Training:")
                print(f"   Moyenne: ${stats['mean']:.2f}")
                print(f"   Écart-type: ${stats['std']:.2f}")
                print(f"   Min: ${stats['min']:.2f}")
                print(f"   Max: ${stats['max']:.2f}")
            
            # Afficher performance
            if data.get('model_performance'):
                perf = data['model_performance']
                print(f"\n🎯 Performance Modèle:")
                print(f"   Budget R²: {perf['budget_r2']:.4f} (Excellent si > 0.75)")
                print(f"   Risque Accuracy: {perf['risk_accuracy']:.4f} (Excellent si > 0.80)")
            
            self.results['tests'].append({
                "name": "Health Check",
                "status": "PASS",
                "details": data
            })
            
            return True
        
        except Exception as e:
            print(f"❌ Erreur: {e}")
            self.results['tests'].append({
                "name": "Health Check",
                "status": "FAIL",
                "error": str(e)
            })
            return False
    
    def predict(self, test_name: str, payload: Dict) -> Dict:
        """Faire une prédiction"""
        try:
            response = requests.post(
                f"{self.service_url}/predict",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Status {response.status_code}", "text": response.text}
        except Exception as e:
            return {"error": str(e)}
    
    def test_realistic_budget(self) -> bool:
        """✅ Test 2: Prédiction avec budget RÉALISTE"""
        print("\n" + "="*80)
        print("TEST 2: Budget RÉALISTE (Cas normal)")
        print("="*80)
        
        payload = {
            "user_proposed_budget": 5000,
            "location": 2,
            "season": 2,
            "duration_days": 7,
            "group_size": 10,
            "trip_type": 2,
            "distance_km": 450,
            "hotel_quality": 4,
            "rating_1_5": 4.5,
            "review_polarity": 0.8,
            "weather_score": 0.9,
            "time_flexibility": 0.7,
            "has_paid_activities": 1,
            "paid_activities_count": 5,
            "avg_activity_cost": 75.5,
            "has_paid_visits": 1,
            "paid_visits_count": 3,
            "avg_visit_cost": 50.0
        }
        
        print(f"\n📝 Inputs:")
        print(f"   Budget proposé: ${payload['user_proposed_budget']}")
        print(f"   Durée: {payload['duration_days']} jours")
        print(f"   Groupe: {payload['group_size']} personnes")
        print(f"   Distance: {payload['distance_km']} km")
        print(f"   Activités: {payload['paid_activities_count']} × ${payload['avg_activity_cost']}")
        print(f"   Visites: {payload['paid_visits_count']} × ${payload['avg_visit_cost']}")
        
        result = self.predict("realistic_budget", payload)
        
        if "error" in result:
            print(f"❌ Erreur: {result['error']}")
            return False
        
        preds = result.get('predictions', {})
        
        # Vérifications
        pred_budget = preds.get('predicted_budget_usd', 0)
        user_budget = payload['user_proposed_budget']
        
        # La prédiction doit être raisonnablement proche du budget proposé
        ratio = pred_budget / user_budget if user_budget > 0 else 0
        is_reasonable = 0.5 <= ratio <= 2.0  # Entre 50% et 200%
        
        status = "✅" if is_reasonable else "⚠️"
        
        print(f"\n💰 Prédiction Budget:")
        print(f"   {status} Prédit: ${pred_budget:.2f}")
        print(f"   Ratio: {ratio:.2f}x budget proposé")
        print(f"   Conseil: {preds.get('budget_advice', 'N/A')}")
        
        print(f"\n⚠️ Risque Acceptation:")
        print(f"   Probabilité acceptation: {preds.get('acceptance_probability', 0)*100:.1f}%")
        print(f"   Conseil: {preds.get('risk_advice', 'N/A')}")
        
        print(f"\n🎯 Confiance Modèle:")
        conf = result.get('model_confidence', {})
        print(f"   Budget R²: {conf.get('budget_r2', 0):.4f}")
        print(f"   Risque Accuracy: {conf.get('risk_accuracy', 0):.4f}")
        
        # Verdict
        verdict = "PASS" if is_reasonable else "ALERT"
        print(f"\n{status} VERDICT: {verdict}")
        if not is_reasonable:
            print(f"   ⚠️ Prédiction {ratio:.2f}x budget proposé (anormal!)")
        
        self.results['tests'].append({
            "name": "Realistic Budget",
            "status": verdict,
            "prediction": pred_budget,
            "user_budget": user_budget,
            "ratio": ratio,
            "is_reasonable": is_reasonable
        })
        
        return is_reasonable
    
    def test_premium_trip(self) -> bool:
        """✅ Test 3: Trip PREMIUM (budget élevé)"""
        print("\n" + "="*80)
        print("TEST 3: Trip PREMIUM (Budget élevé + beaucoup activités)")
        print("="*80)
        
        payload = {
            "user_proposed_budget": 12000,
            "location": 1,
            "season": 3,
            "duration_days": 14,
            "group_size": 20,
            "trip_type": 5,
            "distance_km": 1200,
            "hotel_quality": 5,
            "rating_1_5": 5.0,
            "review_polarity": 1.0,
            "weather_score": 1.0,
            "time_flexibility": 0.9,
            "has_paid_activities": 1,
            "paid_activities_count": 10,
            "avg_activity_cost": 150.0,
            "has_paid_visits": 1,
            "paid_visits_count": 6,
            "avg_visit_cost": 100.0
        }
        
        print(f"\n📝 Inputs PREMIUM:")
        print(f"   Budget proposé: ${payload['user_proposed_budget']}")
        print(f"   Durée: {payload['duration_days']} jours (LONG)")
        print(f"   Groupe: {payload['group_size']} personnes (GRAND)")
        print(f"   Hôtel: {payload['hotel_quality']}⭐ (LUXE)")
        print(f"   Activités: {payload['paid_activities_count']} × ${payload['avg_activity_cost']} (PREMIUM)")
        print(f"   Visites: {payload['paid_visits_count']} × ${payload['avg_visit_cost']} (PREMIUM)")
        
        # Calculer le coût d'activités
        total_activities = (payload['paid_activities_count'] * payload['avg_activity_cost'] +
                           payload['paid_visits_count'] * payload['avg_visit_cost'])
        print(f"   Total activités+visites: ${total_activities:.0f} (TRÈS CHER)")
        
        result = self.predict("premium_trip", payload)
        
        if "error" in result:
            print(f"❌ Erreur: {result['error']}")
            return False
        
        preds = result.get('predictions', {})
        pred_budget = preds.get('predicted_budget_usd', 0)
        user_budget = payload['user_proposed_budget']
        
        # Pour un trip premium, la prédiction doit être élevée mais pas impossible
        ratio = pred_budget / user_budget if user_budget > 0 else 0
        is_reasonable = 0.5 <= ratio <= 1.5  # Moins de marge pour premium
        
        status = "✅" if is_reasonable else "⚠️"
        
        print(f"\n💰 Prédiction Budget:")
        print(f"   {status} Prédit: ${pred_budget:.2f}")
        print(f"   Ratio: {ratio:.2f}x budget proposé")
        print(f"   Conseil: {preds.get('budget_advice', 'N/A')}")
        
        # Verdict
        verdict = "PASS" if is_reasonable else "ALERT"
        print(f"\n{status} VERDICT: {verdict}")
        
        self.results['tests'].append({
            "name": "Premium Trip",
            "status": verdict,
            "prediction": pred_budget,
            "user_budget": user_budget,
            "ratio": ratio,
            "is_reasonable": is_reasonable
        })
        
        return is_reasonable
    
    def test_budget_trip(self) -> bool:
        """✅ Test 4: Trip BUDGET (très bas)"""
        print("\n" + "="*80)
        print("TEST 4: Trip BUDGET (Budget très bas)")
        print("="*80)
        
        payload = {
            "user_proposed_budget": 1500,
            "location": 4,
            "season": 1,
            "duration_days": 3,
            "group_size": 4,
            "trip_type": 1,
            "distance_km": 150,
            "hotel_quality": 2,
            "rating_1_5": 3.5,
            "review_polarity": 0.6,
            "weather_score": 0.7,
            "time_flexibility": 0.5,
            "has_paid_activities": 0,
            "paid_activities_count": 0,
            "avg_activity_cost": 0,
            "has_paid_visits": 1,
            "paid_visits_count": 1,
            "avg_visit_cost": 20.0
        }
        
        print(f"\n📝 Inputs BUDGET:")
        print(f"   Budget proposé: ${payload['user_proposed_budget']}")
        print(f"   Durée: {payload['duration_days']} jours (COURT)")
        print(f"   Groupe: {payload['group_size']} personnes (PETIT)")
        print(f"   Hôtel: {payload['hotel_quality']}⭐ (BASIQUE)")
        print(f"   Activités: AUCUNE")
        print(f"   Visites: {payload['paid_visits_count']} × ${payload['avg_visit_cost']}")
        
        result = self.predict("budget_trip", payload)
        
        if "error" in result:
            print(f"❌ Erreur: {result['error']}")
            return False
        
        preds = result.get('predictions', {})
        pred_budget = preds.get('predicted_budget_usd', 0)
        user_budget = payload['user_proposed_budget']
        
        # La prédiction doit être > 0 et raisonnablement proche
        is_positive = pred_budget > 0
        ratio = pred_budget / user_budget if user_budget > 0 else 0
        is_reasonable = 0.7 <= ratio <= 2.5  # Plus de marge pour très budget
        
        status = "✅" if (is_positive and is_reasonable) else "⚠️"
        
        print(f"\n💰 Prédiction Budget:")
        print(f"   {status} Prédit: ${pred_budget:.2f}")
        if pred_budget <= 0:
            print(f"   ❌ INVALIDE: Budget négatif/nul!")
        else:
            print(f"   Ratio: {ratio:.2f}x budget proposé")
        print(f"   Conseil: {preds.get('budget_advice', 'N/A')}")
        
        # Verdict
        verdict = "PASS" if (is_positive and is_reasonable) else "ALERT"
        print(f"\n{status} VERDICT: {verdict}")
        
        self.results['tests'].append({
            "name": "Budget Trip",
            "status": verdict,
            "prediction": pred_budget,
            "user_budget": user_budget,
            "ratio": ratio if is_positive else 0,
            "is_reasonable": is_positive and is_reasonable
        })
        
        return is_positive and is_reasonable
    
    def test_dinars_conversion(self) -> bool:
        """✅ Test 5: Conversion en Dinars correcte"""
        print("\n" + "="*80)
        print("TEST 5: Conversion USD → Dinars Tunisiens (TND)")
        print("="*80)
        
        payload = {
            "user_proposed_budget": 1000,
            "location": 1,
            "season": 2,
            "duration_days": 5,
            "group_size": 3,
            "trip_type": 1,
            "distance_km": 200,
            "hotel_quality": 3,
            "rating_1_5": 4.0,
            "review_polarity": 0.7,
            "weather_score": 0.8,
            "time_flexibility": 0.6,
            "has_paid_activities": 1,
            "paid_activities_count": 2,
            "avg_activity_cost": 50.0,
            "has_paid_visits": 0,
            "paid_visits_count": 0,
            "avg_visit_cost": 0
        }
        
        result = self.predict("dinars_conversion", payload)
        
        if "error" in result:
            print(f"❌ Erreur: {result['error']}")
            return False
        
        # Vérifier le rate
        USD_TO_TND = 3.15
        
        explanation = result.get('predictions', {}).get('explanation', {})
        budget_analysis = explanation.get('budget_analysis_dinars', {})
        
        user_usd = budget_analysis.get('user_proposed_usd', 0)
        user_tnd = budget_analysis.get('user_proposed_tnd', 0)
        pred_usd = budget_analysis.get('predicted_usd', 0)
        pred_tnd = budget_analysis.get('predicted_tnd', 0)
        
        # Vérifier les conversions
        user_tnd_expected = user_usd * USD_TO_TND
        pred_tnd_expected = pred_usd * USD_TO_TND
        
        user_conversion_ok = abs(user_tnd - user_tnd_expected) < 0.1
        pred_conversion_ok = abs(pred_tnd - pred_tnd_expected) < 0.1
        
        print(f"\n💱 Conversions (Taux: 1 USD = {USD_TO_TND} TND):")
        
        print(f"\n   Budget Utilisateur:")
        print(f"   ${user_usd:.2f} → {user_tnd:.2f} DT")
        print(f"   Attendu: {user_tnd_expected:.2f} DT")
        status = "✅" if user_conversion_ok else "❌"
        print(f"   {status} Conversion correcte")
        
        print(f"\n   Budget Prédit:")
        print(f"   ${pred_usd:.2f} → {pred_tnd:.2f} DT")
        print(f"   Attendu: {pred_tnd_expected:.2f} DT")
        status = "✅" if pred_conversion_ok else "❌"
        print(f"   {status} Conversion correcte")
        
        # Breakdown des coûts
        breakdown = budget_analysis.get('breakdown_tnd', {})
        if breakdown:
            print(f"\n📊 Détail Budget en TND:")
            print(f"   Transport: {breakdown.get('transport_cost', 0):.2f} DT")
            print(f"   Hôtel ({breakdown.get('duration_days', 0)} nuits): {breakdown.get('hotel_total', 0):.2f} DT")
            print(f"   Activités ({breakdown.get('paid_activities', 0)}): {breakdown.get('activities_cost', 0):.2f} DT")
            print(f"   Visites ({breakdown.get('paid_visits', 0)}): {breakdown.get('visits_cost', 0):.2f} DT")
            total = breakdown.get('transport_cost', 0) + breakdown.get('hotel_total', 0) + \
                   breakdown.get('activities_cost', 0) + breakdown.get('visits_cost', 0)
            print(f"   TOTAL: {total:.2f} DT")
        
        is_ok = user_conversion_ok and pred_conversion_ok
        verdict = "PASS" if is_ok else "ALERT"
        print(f"\n{'✅' if is_ok else '❌'} VERDICT: {verdict}")
        
        self.results['tests'].append({
            "name": "Dinars Conversion",
            "status": verdict,
            "user_conversion_ok": user_conversion_ok,
            "pred_conversion_ok": pred_conversion_ok
        })
        
        return is_ok
    
    def test_explainability(self) -> bool:
        """✅ Test 6: Vérifier que explainability est complète"""
        print("\n" + "="*80)
        print("TEST 6: Explainability - Conseils et Détails")
        print("="*80)
        
        payload = {
            "user_proposed_budget": 3000,
            "location": 2,
            "season": 2,
            "duration_days": 5,
            "group_size": 5,
            "trip_type": 2,
            "distance_km": 300,
            "hotel_quality": 3,
            "rating_1_5": 4.0,
            "review_polarity": 0.7,
            "weather_score": 0.8,
            "time_flexibility": 0.6,
            "has_paid_activities": 1,
            "paid_activities_count": 3,
            "avg_activity_cost": 60.0,
            "has_paid_visits": 1,
            "paid_visits_count": 2,
            "avg_visit_cost": 40.0
        }
        
        result = self.predict("explainability", payload)
        
        if "error" in result:
            print(f"❌ Erreur: {result['error']}")
            return False
        
        preds = result.get('predictions', {})
        
        # Vérifier tous les conseils sont présents
        checks = {
            "Budget Advice": preds.get('budget_advice') is not None,
            "Budget Risk Level": preds.get('budget_risk_level') is not None,
            "Risk Advice": preds.get('risk_advice') is not None,
            "Risk Level": preds.get('risk_level') is not None,
            "Acceptance Probability": preds.get('acceptance_probability') is not None,
            "Cancellation Probability": preds.get('cancellation_probability') is not None,
        }
        
        print(f"\n📋 Éléments Explainability:")
        all_present = True
        for check, present in checks.items():
            status = "✅" if present else "❌"
            print(f"   {status} {check}")
            if not present:
                all_present = False
        
        print(f"\n💬 Conseils Générés:")
        print(f"   Budget: {preds.get('budget_advice', 'N/A')}")
        print(f"   Risque: {preds.get('risk_advice', 'N/A')}")
        
        print(f"\n📊 Probabilités:")
        print(f"   Acceptation: {preds.get('acceptance_probability', 0)*100:.1f}%")
        print(f"   Annulation: {preds.get('cancellation_probability', 0)*100:.1f}%")
        
        verdict = "PASS" if all_present else "ALERT"
        print(f"\n{'✅' if all_present else '❌'} VERDICT: {verdict}")
        
        self.results['tests'].append({
            "name": "Explainability",
            "status": verdict,
            "all_elements_present": all_present
        })
        
        return all_present
    
    def run_all_tests(self) -> None:
        """Exécuter tous les tests"""
        print("\n" + "="*80)
        print("🧪 VALIDATION COMPLÈTE - MODÈLE AI CAMPCONNECT")
        print("="*80)
        
        results = {
            "Health Check": self.test_health(),
            "Realistic Budget": self.test_realistic_budget(),
            "Premium Trip": self.test_premium_trip(),
            "Budget Trip": self.test_budget_trip(),
            "Dinars Conversion": self.test_dinars_conversion(),
            "Explainability": self.test_explainability()
        }
        
        # Résumé
        print("\n" + "="*80)
        print("📊 RÉSUMÉ DES RÉSULTATS")
        print("="*80)
        
        passed = sum(1 for v in results.values() if v)
        total = len(results)
        percentage = (passed / total) * 100
        
        for test_name, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"   {status}: {test_name}")
        
        print(f"\n🎯 SCORE GLOBAL: {passed}/{total} ({percentage:.0f}%)")
        
        if percentage == 100:
            print("🎉 EXCELLENT! Le modèle est FIABLE POUR PRODUCTION ✅")
            confidence = "EXCELLENT"
        elif percentage >= 80:
            print("✅ TRÈS BON! Le modèle peut être utilisé en production")
            confidence = "VERY_GOOD"
        elif percentage >= 60:
            print("⚠️ BON mais quelques améliorations recommandées")
            confidence = "GOOD"
        else:
            print("❌ PROBLÈMES DÉTECTÉS - Ne pas déployer")
            confidence = "POOR"
        
        # Sauvegarder résultats
        self.results['summary'] = {
            "total_tests": total,
            "passed": passed,
            "percentage": percentage,
            "confidence": confidence
        }
        
        with open(RESULTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📁 Résultats sauvegardés dans: {RESULTS_FILE}")


if __name__ == "__main__":
    print("Vérification que le service AI est actif sur http://localhost:5000...")
    print("Si le service n'est pas lancé, exécutez d'abord:")
    print("  cd ai_service && python app.py")
    
    validator = AIModelValidator(AI_SERVICE_URL)
    validator.run_all_tests()
