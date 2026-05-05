import pandas as pd
import numpy as np
import random
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report
import os

print("🏕️ Starting CampConnect ML Pipeline (English Version)")

# 1. Génération du Mock Dataset (10 000 lignes) - ENGLISH
print("\n--- STEP 1: Data (Generating 10 000+ lines in English) ---")
category_map = {0: "Hiking", 1: "Workshop", 2: "Campfire"}

hike_keywords = ["mountain", "trail", "walk", "summit", "discovery", "nature", "forest", "trek", "boots", "backpack", "kilometers", "climb", "landscape", "altitude", "sport"]
workshop_keywords = ["survival", "learn", "knots", "compass", "training", "workshop", "guide", "techniques", "first aid", "build", "fire", "shelter", "tent", "orientation"]
campfire_keywords = ["evening", "marshmallow", "music", "stars", "relax", "group", "campfire", "stories", "night", "sing", "social", "meet", "share", "moon", "guitar"]

data = []
for _ in range(10500):
    cat = random.choice([0, 1, 2])
    if cat == 0:
        words = random.sample(hike_keywords, k=random.randint(4, 10))
    elif cat == 1:
        words = random.sample(workshop_keywords, k=random.randint(4, 10))
    else:
        words = random.sample(campfire_keywords, k=random.randint(4, 10))
    
    desc = "Join our upcoming event! " + " ".join(words) + " guaranteed in this outdoor session. "
    if random.random() > 0.8:
        desc += " Please bring some water."
    
    data.append({"description": desc, "category": cat})

df = pd.DataFrame(data)

# Introduire "volontairement" des données sales (pour le prof)
df.loc[100:150, "description"] = None
df = pd.concat([df, df.iloc[200:400]]) 

print(f"-> Generated dataset size : {len(df)} lines")

# 2. Nettoyage
print("\n--- STEP 2: Cleaning (Duplicates, Missing values, 0-1-2 Encoding) ---")
print(f"Lines before cleaning: {len(df)}")
df = df.dropna()
df = df.drop_duplicates()
print(f"Lines after cleaning: {len(df)} (ready for split)")

X = df["description"]
y = df["category"] 

# 3. Vectorisation NLP et Split
print("\n--- STEP 3: Model (NLP Vectorization and 80/20 Split) ---")
vectorizer = TfidfVectorizer(max_features=5000)
X_vec = vectorizer.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2, random_state=42)

print(f"-> Training set (80%) : {X_train.shape[0]} events")
print(f"-> Testing set (20%) : {X_test.shape[0]} events")

# 4. Modèle et Prédiction
print("\n--- STEP 4: Prediction (Model Training) ---")
model = MultinomialNB()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"-> Global Accuracy : {acc * 100:.2f}%")

print("\nRapport détaillé de Classification:")
print(classification_report(y_test, y_pred, target_names=["0 (Hiking)", "1 (Workshop)", "2 (Campfire)"]))

# 5. Sauvegarde
print("\n--- STEP 5: Saving for API (Joblib) ---")
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/event_classifier_model.joblib")
joblib.dump(vectorizer, "models/tfidf_vectorizer.joblib")
print("✅ Model and Vectorizer saved in 'models/' folder!")
