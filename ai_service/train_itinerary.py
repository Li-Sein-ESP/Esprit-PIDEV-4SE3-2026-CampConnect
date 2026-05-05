import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
import pickle
import os

def train_itinerary_model(xlsx_path):
    print(f"Loading dataset from {xlsx_path}...")
    df = pd.read_excel(xlsx_path)
    
    # Rename columns to avoid encoding issues
    # ['ID', 'Rgion', 'Ville', 'Camp/Destination', 'Type', 'Activit', 'Description', 'Dure (h)', 'Prix (TND)', 'Niveau', 'Saison', 'Prix_par_heure', 'Categorie_budget', 'Ville_code']
    new_columns = ['id', 'region', 'ville', 'destination', 'type', 'activite', 'description', 'duration_h', 'price_tnd', 'niveau', 'saison', 'price_per_h', 'budget_cat', 'ville_code']
    df.columns = new_columns
    
    # Sélectionner les features pour le clustering des activités
    # On cluster basé sur: prix, durée, type d'activité, niveau de difficulté
    features = ['duration_h', 'price_tnd', 'price_per_h']
    
    # Encodage des features catégoriques
    le_type = LabelEncoder()
    df['type_encoded'] = le_type.fit_transform(df['type'])
    
    le_niveau = LabelEncoder()
    df['niveau_encoded'] = le_niveau.fit_transform(df['niveau'])
    
    # Encodage de la catégorie budget
    le_budget = LabelEncoder()
    df['budget_encoded'] = le_budget.fit_transform(df['budget_cat'])
    
    # Features de clustering: prix, durée, type, niveau + budget (pour mieux séparer les 3 niveaux)
    clustering_features = features + ['type_encoded', 'niveau_encoded', 'budget_encoded']
    
    # Gestion des valeurs manquantes
    df[clustering_features] = df[clustering_features].fillna(0)
    
    # Normalisation
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df[clustering_features])
    
    # Clustering en 3 styles
    print("Clustering activities into 3 budget-based styles...")
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(X_scaled)
    
    # Sauvegarder les données et modèles
    os.makedirs('models', exist_ok=True)
    
    model_data = {
        'df': df,
        'le_type': le_type,
        'le_niveau': le_niveau,
        'le_budget': le_budget,
        'scaler': scaler,
        'kmeans': kmeans,
        'clustering_features': clustering_features,
        'timestamp': pd.Timestamp.now().isoformat()
    }
    
    with open('models/itinerary_model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    print("Itinerary model and data saved to models/itinerary_model.pkl")
    
    # Identifier les caractéristiques de chaque cluster
    for i in range(3):
        cluster_data = df[df['cluster'] == i]
        avg_price = cluster_data['price_tnd'].mean()
        avg_dur = cluster_data['duration_h'].mean()
        avg_budget_cat = cluster_data['budget_cat'].mode()[0] if not cluster_data['budget_cat'].mode().empty else 'N/A'
        print(f"Cluster {i}: Avg Price={avg_price:.2f} TND, Avg Duration={avg_dur:.2f}h, Budget Category={avg_budget_cat}, Count={len(cluster_data)}")

if __name__ == "__main__":
    xlsx_path = r'C:\Users\lenovo\Downloads\dataset_clean.xlsx'
    train_itinerary_model(xlsx_path)
