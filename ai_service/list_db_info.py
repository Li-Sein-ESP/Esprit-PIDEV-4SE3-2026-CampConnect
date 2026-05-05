import pickle
import pandas as pd

try:
    with open('models/itinerary_model.pkl', 'rb') as f:
        data = pickle.load(f)
    df = data['df']
    print("Unique Regions in DB:", df['region'].unique().tolist())
    print("Unique Villes in DB:", df['ville'].unique().tolist())
except Exception as e:
    print(f"Error: {e}")
