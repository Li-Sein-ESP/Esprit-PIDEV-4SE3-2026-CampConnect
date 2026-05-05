import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score
import joblib
import os


# Charger le dataset (avec gestion robuste du chemin)
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, "personality.csv")

data = pd.read_csv(csv_path)

# ======================
# DATA CLEANING
# ======================
initial_rows = len(data)
data = data.drop_duplicates()
data = data.dropna()

# Validation des plages de valeurs (O,C,E,A,N doivent être entre 0 et 1)
traits = ["O", "C", "E", "A", "N"]
data = data[(data[traits] >= 0).all(axis=1) & (data[traits] <= 1).all(axis=1)]

cleaned_rows = len(data)
if initial_rows > cleaned_rows:
    print(f"--- Data cleaning: removed {initial_rows - cleaned_rows} problematic rows ---")

# Afficher les 5 premières lignes
print("\n=== HEAD ===")
print(data.head())

# Afficher les informations générales
print("\n=== INFO ===")
print(data.info())

# Afficher statistiques
print("\n=== DESCRIPTION ===")
print(data.describe())

# Afficher les noms des colonnes
print("\n=== COLUMNS ===")
print(data.columns)
print("\n=== KEEP ONLY BIG FIVE ===")

big_five = data[['O', 'C', 'E', 'A', 'N']]
print(big_five.head())


# Fonction de compatibilité
def compatibility_score(profile1, profile2):
    distance = np.linalg.norm(profile1 - profile2)
    score = 1 - distance  # plus distance petite, plus score proche de 1
    return score

# Test avec 2 premiers profils
p1 = big_five.iloc[0].values
p2 = big_five.iloc[1].values

score = compatibility_score(p1, p2)

print("\n=== COMPATIBILITY TEST ===")
print("Profile 1:", p1)
print("Profile 2:", p2)
print("Compatibility Score:", round(score, 4))

import random

print("\n=== GENERATING MATCHING DATASET ===")

matching_data = []

for _ in range(3000):  # générer 3000 paires
    idx1 = random.randint(0, len(big_five)-1)
    idx2 = random.randint(0, len(big_five)-1)

    profile1 = big_five.iloc[idx1].values
    profile2 = big_five.iloc[idx2].values

    score = compatibility_score(profile1, profile2)

    # règle simple : compatible si score > 0.7
    label = 1 if score > 0.7 else 0

    row = list(profile1) + list(profile2) + [label]
    matching_data.append(row)

columns = [
    "O1","C1","E1","A1","N1",
    "O2","C2","E2","A2","N2",
    "label"
]

matching_df = pd.DataFrame(matching_data, columns=columns)

print(matching_df.head())
print("\nDataset size:", matching_df.shape)

print("\n=== TRAINING MODEL ===")

# Séparer features et label
X = matching_df.drop("label", axis=1)
y = matching_df["label"]

# Diviser train / test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Créer modèle
model = RandomForestClassifier(n_estimators=100, random_state=42)

# Entraîner
model.fit(X_train, y_train)

# Prédire
y_pred = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, y_pred)

print("Model Accuracy:", round(accuracy, 4))

print("\n=== SAVING MODEL ===")

# Sauvegarder (dans le dossier du script)
save_path = os.path.join(script_dir, "compatibility_model.pkl")
joblib.dump(model, save_path)

print(f"Model saved successfully in: {save_path}")