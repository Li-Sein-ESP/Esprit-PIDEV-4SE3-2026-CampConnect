import pickle
import pandas as pd
import unicodedata

def norm(text):
    if pd.isna(text) or not text: return ""
    return "".join(c for c in unicodedata.normalize('NFD', str(text))
                 if unicodedata.category(c) != 'Mn').lower()

try:
    with open('models/itinerary_model.pkl', 'rb') as f:
        data = pickle.load(f)
    
    df = data['df']
    print(f"Columns: {df.columns.tolist()}")
    print(f"Unique Regions: {df['region'].unique()[:20]}")
    print(f"Unique Villes: {df['ville'].unique()[:20]}")
    
    search_term = "ain draham"
    match = df[df['region_norm'].str.contains(norm(search_term)) | df['ville_norm'].str.contains(norm(search_term))]
    print(f"\nMatches for '{search_term}': {len(match)}")
    if not match.empty:
        print(match[['region', 'ville', 'activite']].head())
    else:
        print("No matches found for 'ain draham'")

    search_term = "bni mtir"
    match = df[df['region_norm'].str.contains(norm(search_term)) | df['ville_norm'].str.contains(norm(search_term))]
    print(f"\nMatches for '{search_term}': {len(match)}")
    
except Exception as e:
    print(f"Error: {e}")
