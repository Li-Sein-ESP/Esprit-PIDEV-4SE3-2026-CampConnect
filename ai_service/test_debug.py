#!/usr/bin/env python3
"""
Script de diagnostic pour vérifier les modèles et la normalisation
"""

import pickle
import numpy as np
import json
import os

print("="*70)
print("🔍 DIAGNOSTIC DES MODÈLES ET DONNÉES")
print("="*70)

# Charger les ressources
print("\n📂 Chargement des fichiers...")

try:
    with open('models/model_budget.pkl', 'rb') as f:
        model_budget = pickle.load(f)
    print("✅ Modèle Budget chargé")
except:
    print("❌ Erreur: Impossible de charger model_budget.pkl")

try:
    with open('models/scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    print("✅ Scaler chargé")
except:
    print("❌ Erreur: Impossible de charger scaler.pkl")

try:
    with open('models/model_stats.json', 'r') as f:
        model_stats = json.load(f)
    print("✅ Statistiques chargées")
except:
    print("❌ Erreur: Impossible de charger model_stats.json")

# Afficher les statistiques
print("\n📊 STATISTIQUES BUDGET (USD):")
if model_stats:
    budget_stats = model_stats['budget']
    print(f"   Moyenne: ${budget_stats['mean']:.2f}")
    print(f"   Écart-type: ${budget_stats['std']:.2f}")
    print(f"   Min: ${budget_stats['min']:.2f}")
    print(f"   Max: ${budget_stats['max']:.2f}")

# Créer des données de test simple
print("\n🧪 TEST SIMPLE DE PRÉDICTION:")
print("-" * 70)

test_data = {
    'user_proposed_budget': 5000, 
    'location': 2, 'season': 2, 'duration_days': 7,
    'group_size': 5, 'trip_type': 2, 'distance_km': 600, 'hotel_quality': 4,
    'rating_1_5': 4.5, 'review_polarity': 0.8, 'weather_score': 0.9,
    'time_flexibility': 0.7, 'has_paid_activities': 1, 'paid_activities_count': 4,
    'avg_activity_cost': 80, 'has_paid_visits': 1, 'paid_visits_count': 3,
    'avg_visit_cost': 60, 'ambiguity_level': 0.467
}

features_order = [
    'user_proposed_budget', 'location', 'season', 'duration_days',
    'group_size', 'trip_type', 'distance_km', 'hotel_quality',
    'rating_1_5', 'review_polarity', 'weather_score', 'time_flexibility',
    'has_paid_activities', 'paid_activities_count', 'avg_activity_cost',
    'has_paid_visits', 'paid_visits_count', 'avg_visit_cost', 'ambiguity_level'
]

features = [float(test_data.get(f, 0)) for f in features_order]
print(f"\n📋 Features brutes ({len(features)} features):")
print(f"   {features[:5]}...")

# Normaliser
features_np = np.array([features])
features_normalized = scaler.transform(features_np)
print(f"\n🔧 Features normalisées:")
print(f"   {features_normalized[0][:5]}...")

# Prédire
budget_pred_scaled = model_budget.predict(features_normalized)[0]
print(f"\n🎯 Prédiction du modèle (valeur normalisée): {budget_pred_scaled}")

# Dénormaliser
budget_mean = model_stats['budget']['mean']
budget_std = model_stats['budget']['std']
predicted_budget = budget_mean + (budget_pred_scaled * budget_std)
print(f"\n📐 Dénormalisation:")
print(f"   Formula: budget_mean + (pred_scaled * budget_std)")
print(f"   = {budget_mean:.2f} + ({budget_pred_scaled:.2f} * {budget_std:.2f})")
print(f"   = {predicted_budget:.2f} USD")

# Convertir en dinars
USD_TO_TND_RATE = 3.15
predicted_budget_tnd = predicted_budget * USD_TO_TND_RATE
print(f"\n💱 Conversion en dinars:")
print(f"   = {predicted_budget:.2f} USD × {USD_TO_TND_RATE}")
print(f"   = {predicted_budget_tnd:.2f} DT")

print("\n" + "="*70)
