import pandas as pd
import os

EXTERNAL_ITINERARY_XLSX_PATHS = [
    r"C:\Users\lenovo\Downloads\tunisia_improved.xlsx",
    "tunisia_improved.xlsx",
    os.path.join("data", "tunisia_improved.xlsx"),
]

path = next((p for p in EXTERNAL_ITINERARY_XLSX_PATHS if os.path.exists(p)), None)

if path:
    df = pd.read_excel(path)
    print("Columns:", df.columns.tolist())
    print("\nValue counts for Region:")
    print(df.iloc[:, 0].value_counts().head(20)) # Assuming first column is region
    
    # Let's try to find 'Tunis'
    tunis_rows = df[df.apply(lambda row: row.astype(str).str.contains('Tunis', case=False).any(), axis=1)]
    print(f"\nTotal rows containing 'Tunis': {len(tunis_rows)}")
    
    if len(tunis_rows) > 0:
        print("\nFirst 10 rows containing 'Tunis':")
        print(tunis_rows[['region', 'ville', 'activite']].head(10))
else:
    print("Dataset not found")
