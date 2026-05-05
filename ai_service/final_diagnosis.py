#!/usr/bin/env python3
"""
Diagnostic final - Prédiction du modèle SANS dénormalisation
"""

import pickle
import numpy as np
import json
from sklearn.preprocessing import StandardScaler
import pandas as pd

print("="*80)
print("🔍 DIAGNOSTIC FINAL - PRÉDICTION DU MODÈLE")
print("="*80)

# Charger les ressources
print("\n📂 Chargement...")
with open('models/model_budget.pkl', 'rb') as f:
    model_budget = pickle.load(f)
with open('models/scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)
with open('models/model_stats.json', 'r') as f:
    model_stats = json.load(f)

print("✅ Modèles chargés")

# Préparer les données de test
features_order = [
    'user_proposed_budget', 'location', 'season', 'duration_days',
    'group_size', 'trip_type', 'distance_km', 'hotel_quality',
    'rating_1_5', 'review_polarity', 'weather_score', 'time_flexibility',
    'has_paid_activities', 'paid_activities_count', 'avg_activity_cost',
    'has_paid_visits', 'paid_visits_count', 'avg_visit_cost', 'ambiguity_level'
]

test_data = {
    'user_proposed_budget': 5000, 
    'location': 2, 'season': 2, 'duration_days': 7,
    'group_size': 5, 'trip_type': 2, 'distance_km': 600, 'hotel_quality': 4,
    'rating_1_5': 4.5, 'review_polarity': 0.8, 'weather_score': 0.9,
    'time_flexibility': 0.7, 'has_paid_activities': 1, 'paid_activities_count': 4,
    'avg_activity_cost': 80, 'has_paid_visits': 1, 'paid_visits_count': 3,
    'avg_visit_cost': 60, 'ambiguity_level': 0.467
}

# Créer DataFrame avec features dans l'ordre correct
test_df = pd.DataFrame([test_data], columns=features_order)

print(f"\n📋 Features brutes:")
for col in features_order[:5]:
    print(f"   {col}: {test_df[col].values[0]}")
print(f"   ... ({len(features_order)} features total)")

# Normaliser
features_normalized = scaler.transform(test_df)
print(f"\n🔧 Features normalisées:")
for i, col in enumerate(features_order[:5]):
    print(f"   {col}: {features_normalized[0, i]:.4f}")
print(f"   ... ({len(features_order)} features total)")

# Prédiction DIRECTE (sans dénormalisation)
print(f"\n🎯 PRÉDICTION DU MODÈLE (RAW):")
raw_prediction = model_budget.predict(features_normalized)[0]
print(f"   Valeur brute: ${raw_prediction:.2f}")

# Constater que le modèle prédit déjà en USD (pas normalisé)
print(f"\n💡 ANALYSE:")
print(f"   Le modèle a appris à prédire directement en USD.")
print(f"   Les features sont normalisées, mais la cible (y) ne l'était pas.")
print(f"   Donc la prédiction est directement en USD.")

# Comparaison avec la moyenne
mean_budget = model_stats['budget']['mean']
print(f"\n📊 CONTEXTE:")
print(f"   Budget moyen du training: ${mean_budget:.2f}")
print(f"   Budget prédit: ${raw_prediction:.2f}")
print(f"   Ratio: {raw_prediction / mean_budget:.1f}x")

if raw_prediction > 10000:
    print(f"\n⚠️  ALERTE: La prédiction est {raw_prediction/10000:.1f}x plus élevée que 10000!")
    print(f"   Cela indique un problème avec l'entraînement ou les features.")

# Convertir en dinars
USD_TO_TND_RATE = 3.15
predicted_budget_tnd = raw_prediction * USD_TO_TND_RATE
print(f"\n💱 CONVERSION EN DINARS:")
print(f"   ${raw_prediction:.2f} × 3.15 = {predicted_budget_tnd:.2f} DT")

print("\n" + "="*80)
