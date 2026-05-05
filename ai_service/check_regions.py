import pickle
import pandas as pd

with open('models/itinerary_model.pkl', 'rb') as f:
    data = pickle.load(f)
    df = data['df']
    print("Unique Regions:")
    print(df['region'].unique())
    print("\nUnique Villes:")
    print(df['ville'].unique())
