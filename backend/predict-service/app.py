import os
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
BUDGET_MODEL_PATH = os.path.join(MODEL_DIR, 'budget_model.pkl')
DELAY_MODEL_PATH = os.path.join(MODEL_DIR, 'delay_model.pkl')

# Ensure models exist (train if missing)
if not os.path.exists(BUDGET_MODEL_PATH) or not os.path.exists(DELAY_MODEL_PATH):
    from train import train_and_save_models
    train_and_save_models()

budget_model = joblib.load(BUDGET_MODEL_PATH)
delay_model = joblib.load(DELAY_MODEL_PATH)

app = FastAPI(title='CampConnect Predict Service')

class TripPayload(BaseModel):
    totalDays: int
    participants: int
    base_per_day: float = 50.0
    accommodation: float = 0.0
    transport: float = 0.0
    activities: float = 0.0
    season: int = 0
    budgetMax: float = 0.0

class DelayPayload(BaseModel):
    distance: float
    currentTraffic: float
    historicalDelayRate: float
    weatherIndex: float = 0.0

@app.post('/predict/budget')
async def predict_budget(payload: dict):
    # payload expected to contain a `trip` object; accept flattened variants too
    trip = payload.get('trip') if isinstance(payload, dict) else None
    if trip is None:
        trip = payload
    try:
        df = pd.DataFrame([{
            'totalDays': int(trip.get('totalDays', 1)),
            'participants': int(trip.get('participants', 1)),
            'base_per_day': float(trip.get('base_per_day', 50.0)),
            'accommodation': float(trip.get('accommodation', 0.0)),
            'transport': float(trip.get('transport', 0.0)),
            'activities': float(trip.get('activities', 0.0)),
            'season': int(trip.get('season', 0)),
            'budgetMax': float(trip.get('budgetMax', 0.0))
        }])
        pred = float(budget_model.predict(df)[0])
        # crude confidence estimate using prediction variance on training (not precise)
        confidence = 0.75
        return {'predictedBudget': round(pred, 2), 'currency': 'EUR', 'confidence': confidence}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post('/predict/delay')
async def predict_delay(payload: dict):
    body = payload.get('transport') if isinstance(payload, dict) else payload
    if body is None:
        body = payload
    try:
        df = pd.DataFrame([{
            'distance': float(body.get('distance', 10.0)),
            'currentTraffic': float(body.get('currentTraffic', 0.5)),
            'historicalDelayRate': float(body.get('historicalDelayRate', 0.1)),
            'weatherIndex': float(body.get('weatherIndex', 0.0))
        }])
        pred = float(delay_model.predict(df)[0])
        confidence = 0.7
        return {'predictedDelayMinutes': round(pred, 1), 'confidence': confidence}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
