#!/usr/bin/env python3
"""
Analyse des données d'entraînement et diagnostic du problème
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import pickle
import json

# Charger les données d'entraînement
df = pd.read_csv('trips_data_realistic.csv')

print("="*80)
print("📊 ANALYSE DES DONNÉES D'ENTRAÎNEMENT")
print("="*80)

print("\n🔍 FEATURES BRUTES - RANGES:")
print("-" * 80)

features_list = [
    'user_proposed_budget', 'location', 'season', 'duration_days',
    'group_size', 'trip_type', 'distance_km', 'hotel_quality',
    'rating_1_5', 'review_polarity', 'weather_score', 'time_flexibility',
    'has_paid_activities', 'paid_activities_count', 'avg_activity_cost',
    'has_paid_visits', 'paid_visits_count', 'avg_visit_cost',
    'ambiguity_level'
]

for feature in features_list:
    if feature in df.columns:
        min_val = df[feature].min()
        max_val = df[feature].max()
        mean_val = df[feature].mean()
        std_val = df[feature].std()
        print(f"{feature:25} | Min: {min_val:10.2f} | Max: {max_val:10.2f} | Mean: {mean_val:10.2f} | Std: {std_val:10.2f}")

print("\n💰 TARGET - BUDGET (USD):")
print("-" * 80)
print(f"Mean: ${df['budget_usd'].mean():.2f}")
print(f"Std: ${df['budget_usd'].std():.2f}")
print(f"Min: ${df['budget_usd'].min():.2f}")
print(f"Max: ${df['budget_usd'].max():.2f}")

# Charger le scaler et montrer les parametres de normalisation
with open('models/scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

print("\n🔧 SCALER - STATISTIQUES DE NORMALISATION:")
print("-" * 80)
print(f"Feature Names: {scaler.feature_names_in_}")
print(f"\nMeans (avant normalisation):")
for i, (fname, mean) in enumerate(zip(scaler.feature_names_in_, scaler.mean_)):
    print(f"  {fname:25}: {mean:10.2f}")

print(f"\nScale (écart-type, avant normalisation):")
for i, (fname, scale) in enumerate(zip(scaler.feature_names_in_, scaler.scale_)):
    print(f"  {fname:25}: {scale:10.2f}")

# Tester la normalisation avec une données de test
print("\n🧪 TEST DE NORMALISATION - DONNÉES DE TEST:")
print("-" * 80)

test_features = {
    'user_proposed_budget': 5000,  'location': 2, 'season': 2, 'duration_days': 7,
    'group_size': 5, 'trip_type': 2, 'distance_km': 600, 'hotel_quality': 4,
    'rating_1_5': 4.5, 'review_polarity': 0.8, 'weather_score': 0.9,
    'time_flexibility': 0.7, 'has_paid_activities': 1, 'paid_activities_count': 4,
    'avg_activity_cost': 80, 'has_paid_visits': 1, 'paid_visits_count': 3,
    'avg_visit_cost': 60, 'ambiguity_level': 0.467
}

# Créer un DataFrame avec les mêmes colonnes dans le même ordre
test_df = pd.DataFrame([test_features], columns=scaler.feature_names_in_)

print("\nFeatures brutes:")
for col in scaler.feature_names_in_:
    val = test_df[col].values[0]
    print(f"  {col:25}: {val:10.2f}")

# Normaliser
test_normalized = scaler.transform(test_df)
print("\nFeatures normalisées:")
for i, col in enumerate(scaler.feature_names_in_):
    val_norm = test_normalized[0, i]
    print(f"  {col:25}: {val_norm:10.2f}")

# Vérifier si une valeur sort extrêmement de la plage
print("\n⚠️ VALEURS EXTRÊMES DÉTECTÉES:")
print("-" * 80)
for i, col in enumerate(scaler.feature_names_in_):
    val_norm = test_normalized[0, i]
    if abs(val_norm) > 10:
        print(f"⚠️  {col:25}: VALEUR NORMALISÉE = {val_norm:.2f} (EXTRÊME!)")

print("\n" + "="*80)
