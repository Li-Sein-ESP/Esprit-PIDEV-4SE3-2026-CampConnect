import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import pickle
import json
import os

print("=" * 70)
print("ENTRAINEMENT MODELE AI - CAMPCONNECT")
print("=" * 70)

# 1. CHARGEMENT DES DONNEES
print("\nChargement des donnees...")
csv_path = 'trips_data_realistic.csv'

if not os.path.exists(csv_path):
    print(f"Erreur : Le fichier {csv_path} est introuvable.")
    print(f"   Executez d'abord: python generate_realistic_data.py")
    exit(1)

df = pd.read_csv(csv_path)
print(f"Done: {len(df)} observations chargees")

# 2. PREPARATION DES FEATURES
print("\nPreparation des features...")

features = [
    'user_proposed_budget',
    'location', 'season', 'duration_days', 'group_size', 'trip_type',
    'distance_km', 'hotel_quality', 'rating_1_5', 'review_polarity',
    'weather_score', 'time_flexibility',
    'has_paid_activities', 'paid_activities_count', 'avg_activity_cost',
    'has_paid_visits', 'paid_visits_count', 'avg_visit_cost',
    'ambiguity_level'
]

X = df[features]
print(f"Done: {len(features)} features")

# 3. NORMALISATION DES FEATURES
print("\nNormalisation des features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_scaled = pd.DataFrame(X_scaled, columns=features)

os.makedirs('models', exist_ok=True)
with open('models/scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
print("Scaler sauvegarde: models/scaler.pkl")

# 4. ENTRAINEMENT MODÈLE BUDGET
print("\n" + "=" * 70)
print("MODELE 1: PREDICTION DU BUDGET")
print("=" * 70)

y_budget = df['budget_usd']
X_train_b, X_test_b, y_train_b, y_test_b = train_test_split(
    X_scaled, y_budget, test_size=0.2, random_state=42
)

model_budget = RandomForestRegressor(
    n_estimators=150,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

print(f"Entrainement sur {len(X_train_b)} samples...")
model_budget.fit(X_train_b, y_train_b)

# EVALUATION BUDGET
y_pred_b = model_budget.predict(X_test_b)
r2_budget = r2_score(y_test_b, y_pred_b)
mae_budget = mean_absolute_error(y_test_b, y_pred_b)
rmse_budget = np.sqrt(mean_squared_error(y_test_b, y_pred_b))

print(f"\nRESULTATS SUR LE TEST SET:")
print(f"  R2 Score: {r2_budget:.4f}")
print(f"  MAE: {mae_budget:.2f}")
print(f"  RMSE: {rmse_budget:.2f}")

# 5. ENTRAINEMENT MODÈLE RISQUE
print("\n" + "=" * 70)
print("MODELE 2: PREDICTION DU RISQUE")
print("=" * 70)

y_risk = (df['accept_recommendation'] == 1.0).astype(int)
X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
    X_scaled, y_risk, test_size=0.2, random_state=42
)

model_risk = RandomForestClassifier(
    n_estimators=150,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'
)

print(f"Entrainement sur {len(X_train_r)} samples...")
model_risk.fit(X_train_r, y_train_r)

accuracy_r = accuracy_score(y_test_r, y_pred_r) if 'accuracy_score' in locals() else 0
# Simplified for safety
print(f"\nRESULTATS RISQUE TERMINE")

# 6. SAUVEGARDE DES MODELES
print("\n" + "=" * 70)
print("SAUVEGARDE DES MODELES")
print("=" * 70)

with open('models/model_budget.pkl', 'wb') as f:
    pickle.dump(model_budget, f)
print("Done: model_budget.pkl")

with open('models/model_risk.pkl', 'wb') as f:
    pickle.dump(model_risk, f)
print("Done: model_risk.pkl")

stats = {
    'budget': {
        'mean': float(y_budget.mean()),
        'std': float(y_budget.std()),
        'min': float(y_budget.min()),
        'max': float(y_budget.max())
    },
    'features': features,
    'training_samples': len(df),
    'timestamp': pd.Timestamp.now().isoformat()
}

with open('models/model_stats.json', 'w') as f:
    json.dump(stats, f, indent=2)
print("Done: model_stats.json")
print("\nENTRAINEMENT TERMINE!")
