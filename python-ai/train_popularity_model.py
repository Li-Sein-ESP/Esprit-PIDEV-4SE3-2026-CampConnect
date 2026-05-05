import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

print("--- Génération du Dataset Historique de Popularité (Mock) ---")

np.random.seed(42)
n_samples = 5000

# Features: category_id, capacity, duration_days, difficulty, season
category_id = np.random.choice([0, 1, 2], n_samples, p=[0.4, 0.4, 0.2]) # 0:Hike, 1:Workshop, 2:Campfire
capacity = np.random.randint(10, 150, n_samples)
duration_days = np.random.randint(1, 14, n_samples)
difficulty = np.random.choice([0, 1, 2], n_samples) # 0:Beginner, 1:Moderate, 2:Advanced
season = np.random.choice([0, 1, 2, 3], n_samples) # 0:Winter, 1:Spring, 2:Summer, 3:Fall

# Logique métier simulée pour le remplissage (Popularity)
# Règle générale : remplissage de base entre 40% et 90%
base_fill_rate = np.random.uniform(0.4, 0.9, n_samples)

# Ajustements logiques pour rendre l'IA "intelligente"
for i in range(n_samples):
    # Les ateliers (1) ont tendance à être complets
    if category_id[i] == 1:
        base_fill_rate[i] += 0.1
    # Les randos avancées (2) en hiver (0) ont moins de succès
    if category_id[i] == 0 and difficulty[i] == 2 and season[i] == 0:
        base_fill_rate[i] -= 0.3
    # L'été (2) booste presque tout
    if season[i] == 2:
        base_fill_rate[i] += 0.15
    # Les événements très longs (plus d'une semaine) sont plus durs à remplir
    if duration_days[i] > 7:
        base_fill_rate[i] -= 0.1

# Clamping entre 10% et 100% de remplissage
base_fill_rate = np.clip(base_fill_rate, 0.1, 1.0)

# Calcul du nombre final d'inscrits
attendees = np.round(capacity * base_fill_rate).astype(int)

df = pd.DataFrame({
    'category_id': category_id,
    'capacity': capacity,
    'duration_days': duration_days,
    'difficulty': difficulty,
    'season': season,
    'attendees': attendees
})

print(f"Dataset généré : {len(df)} lignes.")
print(df.head())

# Séparation des features et target
X = df[['category_id', 'capacity', 'duration_days', 'difficulty', 'season']]
y = df['attendees']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("\n--- Entraînement du Modèle (Random Forest) ---")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Évaluation
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"Mean Absolute Error : {mae:.2f} participants (L'IA se trompe de ~{int(mae)} personnes en moyenne)")
print(f"R2 Score : {r2:.4f} (Qualité de la prédiction)")

# Sauvegarde du modèle
os.makedirs("models", exist_ok=True)
model_path = "models/popularity_model.joblib"
joblib.dump(model, model_path)
print(f"\n✅ Modèle sauvegardé sous : {model_path}")
