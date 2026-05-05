import pandas as pd
import os

def clean_personality_data():
    """
    Cleans personality.csv by removing nulls, duplicates, and validating ranges.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, "personality.csv")

    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return

    print(f"=== Cleaning {file_path} ===")
    df = pd.read_csv(file_path)
    initial_rows = len(df)
    
    # Drop nulls and duplicates
    df = df.dropna()
    df = df.drop_duplicates()
    
    # Validation des plages [0, 1] for O, C, E, A, N
    traits = ["O", "C", "E", "A", "N"]
    df = df[(df[traits] >= 0).all(axis=1) & (df[traits] <= 1).all(axis=1)]
    
    final_rows = len(df)
    removed = initial_rows - final_rows
    
    if removed > 0:
        print(f"Removed {removed} problematic rows.")
        df.to_csv(file_path, index=False)
        print(f"File updated. New row count: {final_rows}")
    else:
        print("Data is already clean. No changes made.")

if __name__ == "__main__":
    clean_personality_data()
