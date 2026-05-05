from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()

# Charger les modèles
rf_model = joblib.load("rf_model.pkl")
dt_model = joblib.load("dt_model.pkl")
xgb_model = joblib.load("xgb_model.pkl")

@app.get("/")
def home():
    return {"message": "Matching API is running"}

@app.post("/predict")
def predict_compatibility(data: dict, model_type: str = 'rf'):
    profile1 = np.array(data["profile1"])
    profile2 = np.array(data["profile2"])

    # Combiner les 10 traits
    features = np.concatenate((profile1, profile2)).reshape(1, -1)

    # Choisir le modèle
    if model_type == 'rf':
        model = rf_model
    elif model_type == 'dt':
        model = dt_model
    elif model_type == 'xgb':
        model = xgb_model

    # Prédire la probabilité de compatibilité (1)
    probability = model.predict_proba(features)[0][1]

    return {
        "compatibility_score_percent": round(float(probability) * 100, 2)
    }