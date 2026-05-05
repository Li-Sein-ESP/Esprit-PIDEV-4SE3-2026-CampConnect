import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

print("=== LOADING DATASET ===")

# Charger le fichier CSV (avec gestion robuste du chemin)
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, "personality.csv")
df = pd.read_csv(csv_path)

# ======================
# DATA CLEANING
# ======================
initial_rows = len(df)
df = df.drop_duplicates()
df = df.dropna()

# Validation des plages de valeurs (O,C,E,A,N doivent être entre 0 et 1)
traits = ["O", "C", "E", "A", "N"]
df = df[(df[traits] >= 0).all(axis=1) & (df[traits] <= 1).all(axis=1)]

cleaned_rows = len(df)
if initial_rows > cleaned_rows:
    print(f"--- Data cleaning: removed {initial_rows - cleaned_rows} problematic rows ---")

# Garder uniquement les colonnes Big Five
big_five = df[traits]

print("Dataset loaded and cleaned:", big_five.shape)

print("\n=== GENERATING BALANCED MATCHING DATASET ===")

matching_data = []

# Créer 3000 paires équilibrées
while len(matching_data) < 3000:

    p1 = big_five.sample(1).values[0]
    p2 = big_five.sample(1).values[0]

    distance = np.linalg.norm(p1 - p2)

    # Profils très proches → compatibles
    if distance < 0.35:
        label = 1

    # Profils très différents → non compatibles
    elif distance > 0.75:
        label = 0

    else:
        continue  # Ignorer les paires avec une distance moyenne

    row = np.concatenate((p1, p2, [label]))
    matching_data.append(row)

columns = [
    "O1", "C1", "E1", "A1", "N1",
    "O2", "C2", "E2", "A2", "N2",
    "label"
]

matching_df = pd.DataFrame(matching_data, columns=columns)

print("Dataset size:", matching_df.shape)
print("\nLabel distribution:")
print(matching_df["label"].value_counts())

# ======================
# TRAIN MODEL
# ======================

X = matching_df.drop("label", axis=1)
y = matching_df["label"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Créer et entraîner les modèles
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

dt_model = DecisionTreeClassifier(random_state=42)
dt_model.fit(X_train, y_train)

xgb_model = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss')
xgb_model.fit(X_train, y_train)

# Prédire et évaluer la précision de chaque modèle
rf_pred = rf_model.predict(X_test)
dt_pred = dt_model.predict(X_test)
xgb_pred = xgb_model.predict(X_test)

rf_accuracy = accuracy_score(y_test, rf_pred)
dt_accuracy = accuracy_score(y_test, dt_pred)
xgb_accuracy = accuracy_score(y_test, xgb_pred)

print("\nRandom Forest Accuracy:", round(rf_accuracy * 100, 2), "%")
print("Decision Tree Accuracy:", round(dt_accuracy * 100, 2), "%")
print("XGBoost Accuracy:", round(xgb_accuracy * 100, 2), "%")

# Sauvegarder les modèles (dans le dossier du script)
joblib.dump(rf_model, os.path.join(script_dir, "rf_model.pkl"))
joblib.dump(dt_model, os.path.join(script_dir, "dt_model.pkl"))
joblib.dump(xgb_model, os.path.join(script_dir, "xgb_model.pkl"))

print("\nModels saved successfully in:", script_dir)