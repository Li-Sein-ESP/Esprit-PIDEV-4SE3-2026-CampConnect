import pandas as pd

path = r'C:\Users\lenovo\Downloads\camping_tunisia_clean.xlsx'
try:
    df = pd.read_excel(path)
    print(f"Columns: {df.columns.tolist()}")
    print(f"Shape: {df.shape}")
    print("\nFirst 5 rows:")
    print(df.head())
except Exception as e:
    print(f"Error: {e}")
