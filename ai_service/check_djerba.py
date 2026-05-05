import pickle
import pandas as pd

try:
    with open('models/itinerary_model.pkl', 'rb') as f:
        data = pickle.load(f)
    df = data['df']
    print("Columns:", df.columns.tolist())
    print("Unique Regions:", df['region'].unique().tolist())
    print("Unique Villes:", df['ville'].unique().tolist())
    
    djerba_data = df[df['region'].str.contains('Djerba', case=False, na=False) | df['ville'].str.contains('Djerba', case=False, na=False)]
    print(f"\nFound {len(djerba_data)} entries for Djerba")
    if not djerba_data.empty:
        print(djerba_data[['region', 'ville', 'activite']].head())
except Exception as e:
    print(f"Error: {e}")
