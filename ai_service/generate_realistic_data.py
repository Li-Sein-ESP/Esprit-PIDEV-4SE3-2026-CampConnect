"""
Générateur de données réalistes pour CampConnect
Génère des données avec budget utilisateur intégré et activités payantes
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

np.random.seed(42)

# Paramètres réalistes pour les voyages en Tunisie
n_samples = 3000  # Augmenté pour une meilleure généralisation

regions_info = {
    'Tunis': {'id': 1, 'cost_index': 1.3}, 
    'Kairouan': {'id': 2, 'cost_index': 0.8}, 
    'Bizerte': {'id': 3, 'cost_index': 1.1}, 
    'Nabeul': {'id': 4, 'cost_index': 1.2}, 
    'Tozeur': {'id': 5, 'cost_index': 1.4}, 
    'Kebili': {'id': 6, 'cost_index': 1.2}, 
    'Siliana': {'id': 7, 'cost_index': 0.7}, 
    'Zaghouan': {'id': 8, 'cost_index': 0.8},
    'Beja': {'id': 9, 'cost_index': 0.75}, 
    'Jendouba': {'id': 10, 'cost_index': 0.9}, 
    'Gabes': {'id': 11, 'cost_index': 0.9}
}

seasons = {
    'Winter': {'id': 1, 'multiplier': 0.8}, 
    'Spring': {'id': 2, 'multiplier': 1.0}, 
    'Summer': {'id': 3, 'multiplier': 1.5}, 
    'Fall': {'id': 4, 'multiplier': 0.9}
}

trip_types = {'Beach': 1, 'Mountain': 2, 'Desert': 3, 'Urban': 4, 'Adventure': 5}

# Charger les prix réels depuis le nouveau dataset
real_activities_avg = 45.0
try:
    df_real = pd.read_excel("camping_tunisia_clean.xlsx")
    if 'prix_TND' in df_real.columns:
        real_activities_avg = df_real['prix_TND'].mean()
        print(f"Prix moyen reel detecte: {real_activities_avg:.2f} TND")
except Exception as e:
    print(f"Erreur lecture prix reels: {e}")

# Générer les données
data = []

for i in range(n_samples):
    # Sélection aléatoire de la région et saison
    region_name = np.random.choice(list(regions_info.keys()))
    region_data = regions_info[region_name]
    
    season_name = np.random.choice(list(seasons.keys()))
    season_data = seasons[season_name]
    
    duration_days = np.random.randint(1, 15)
    group_size = np.random.randint(1, 20)
    trip_type = np.random.randint(1, 6)
    
    # Distance réaliste (Tunisie max ~800km Nord-Sud)
    distance_km = np.random.uniform(50, 600)
    
    hotel_quality = np.random.randint(1, 6)
    rating_1_5 = np.random.uniform(3, 5)
    review_polarity = np.random.uniform(0, 1)
    weather_score = np.random.uniform(0.4, 1.0)
    time_flexibility = np.random.uniform(0.1, 0.9)
    
    # Activités payantes (Basées sur les prix réels du fichier Excel)
    has_paid_activities = np.random.choice([0, 1], p=[0.2, 0.8])
    paid_activities_count = np.random.randint(1, 6) if has_paid_activities else 0
    # On utilise la moyenne réelle + un facteur de variation régionale
    avg_activity_cost = real_activities_avg * region_data['cost_index'] * np.random.uniform(0.8, 1.2) if has_paid_activities else 0
    
    has_paid_visits = np.random.choice([0, 1], p=[0.2, 0.8])
    paid_visits_count = np.random.randint(1, 8) if has_paid_visits else 0
    avg_visit_cost = (real_activities_avg * 0.6) * region_data['cost_index'] * np.random.uniform(0.8, 1.2) if has_paid_visits else 0
    
    # ==================== CALCUL DU BUDGET RÉEL (TARGET) ====================
    # Logique de calcul basée sur les coûts réels en Tunisie
    
    # 1. Transport (Coût fixe de base + KM)
    transport_cost = (100 + (distance_km * 0.5)) * season_data['multiplier']
    
    # 2. Hébergement (Par personne, par nuit)
    base_hotel_price = 40 + (hotel_quality * 30)
    accommodation_cost = (base_hotel_price * duration_days * group_size) * region_data['cost_index'] * season_data['multiplier']
    
    # 3. Nourriture (Par personne, par jour)
    food_cost = (30 * duration_days * group_size) * region_data['cost_index']
    
    # 4. Activités (Coût total)
    activities_total = (paid_activities_count * avg_activity_cost * group_size * 0.7) # Réduction groupe
    visits_total = (paid_visits_count * avg_visit_cost * group_size * 0.8)
    
    actual_budget_usd = (transport_cost + accommodation_cost + food_cost + activities_total + visits_total) / 3.15 # Convert to USD for model
    
    # ==================== BUDGET PROPOSÉ PAR L'UTILISATEUR ====================
    # L'utilisateur propose souvent un budget un peu décalé par rapport à la réalité
    user_proposed_budget_usd = actual_budget_usd * np.random.uniform(0.6, 1.4)
    
    # ==================== ACCEPTATION (CANCELLATION RISK) ====================
    # L'acceptation dépend de l'écart de budget et de la qualité attendue
    budget_ratio = user_proposed_budget_usd / actual_budget_usd
    
    # Si le budget proposé est > 90% du coût réel, bonne chance d'acceptation
    accept_score = (budget_ratio * 0.6) + (time_flexibility * 0.2) + (weather_score * 0.2)
    accept_recommendation = 1.0 if accept_score > 0.8 else -1.0
    
    # Ambiguity level
    ambiguity_level = (paid_activities_count + paid_visits_count) / 15.0
    
    data.append({
        'user_proposed_budget': user_proposed_budget_usd * 3.15, # Store in TND
        'location': region_data['id'],
        'season': season_data['id'],
        'duration_days': duration_days,
        'group_size': group_size,
        'trip_type': trip_type,
        'distance_km': distance_km,
        'hotel_quality': hotel_quality,
        'rating_1_5': rating_1_5,
        'review_polarity': review_polarity,
        'weather_score': weather_score,
        'time_flexibility': time_flexibility,
        'has_paid_activities': has_paid_activities,
        'paid_activities_count': paid_activities_count,
        'avg_activity_cost': avg_activity_cost,
        'has_paid_visits': has_paid_visits,
        'paid_visits_count': paid_visits_count,
        'avg_visit_cost': avg_visit_cost,
        'ambiguity_level': ambiguity_level,
        'budget_usd': actual_budget_usd,
        'accept_recommendation': accept_recommendation
    })

# ==================== CRÉER DATAFRAME ====================
df = pd.DataFrame(data)
output_file = 'trips_data_realistic.csv'
df.to_csv(output_file, index=False)
print(f"✅ Dataset amélioré généré : {len(df)} lignes.")


# Sauvegarder aussi un fichier de statistiques pour l'inférence
stats = {
    'budget_mean': float(df['budget_usd'].mean()),
    'budget_std': float(df['budget_usd'].std()),
    'user_proposed_budget_mean': float(df['user_proposed_budget'].mean()),
    'user_proposed_budget_std': float(df['user_proposed_budget'].std()),
    'n_samples': len(df),
    'features': list(df.columns)
}

with open('training_stats.json', 'w') as f:
    json.dump(stats, f, indent=2)

print(f"✅ Statistiques sauvegardées dans: training_stats.json")
print("\n" + "=" * 70)
print("✨ Dataset prêt pour training!")
print("=" * 70)
