import os
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBRegressor

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

def make_budget_dataset(n=1000, random_state=42):
    rng = np.random.RandomState(random_state)
    totalDays = rng.randint(1, 15, size=n)
    participants = rng.randint(1, 6, size=n)
    base_per_day = rng.uniform(20, 150, size=n)
    accommodation = base_per_day * totalDays * participants * rng.uniform(0.3, 0.8, size=n)
    transport = rng.uniform(10, 500, size=n)
    activities = rng.uniform(0, 500, size=n)
    season = rng.randint(0, 4, size=n)
    budgetMax = (accommodation + transport + activities) * rng.uniform(1.0, 1.3, size=n)
    # target is total estimated cost
    total_cost = accommodation + transport + activities + rng.normal(0, 50, size=n)
    df = pd.DataFrame({
        'totalDays': totalDays,
        'participants': participants,
        'base_per_day': base_per_day,
        'accommodation': accommodation,
        'transport': transport,
        'activities': activities,
        'season': season,
        'budgetMax': budgetMax,
        'total_cost': total_cost
    })
    return df


def make_delay_dataset(n=1000, random_state=1):
    rng = np.random.RandomState(random_state)
    distance = rng.uniform(1, 1000, size=n)
    currentTraffic = rng.uniform(0, 1, size=n)
    historicalDelayRate = rng.uniform(0, 1, size=n)
    weatherIndex = rng.uniform(0,1,size=n)
    predicted_delay = (distance/100)*rng.uniform(0.5,1.5,size=n) + currentTraffic*30 + historicalDelayRate*20 + weatherIndex*10 + rng.normal(0,5,size=n)
    df = pd.DataFrame({
        'distance': distance,
        'currentTraffic': currentTraffic,
        'historicalDelayRate': historicalDelayRate,
        'weatherIndex': weatherIndex,
        'predicted_delay': predicted_delay
    })
    return df


def train_and_save_models():
    # budget model
    print('Preparing budget dataset...')
    df = make_budget_dataset()
    X = df[['totalDays','participants','base_per_day','accommodation','transport','activities','season','budgetMax']]
    y = df['total_cost']
    print('Training budget model...')
    budget_model = XGBRegressor(n_estimators=100, max_depth=6, random_state=42)
    budget_model.fit(X, y)
    joblib.dump(budget_model, os.path.join(MODEL_DIR, 'budget_model.pkl'))
    print('Saved budget_model.pkl')

    # delay model
    print('Preparing delay dataset...')
    df2 = make_delay_dataset()
    X2 = df2[['distance','currentTraffic','historicalDelayRate','weatherIndex']]
    y2 = df2['predicted_delay']
    print('Training delay model...')
    delay_model = XGBRegressor(n_estimators=100, max_depth=5, random_state=1)
    delay_model.fit(X2, y2)
    joblib.dump(delay_model, os.path.join(MODEL_DIR, 'delay_model.pkl'))
    print('Saved delay_model.pkl')

if __name__ == '__main__':
    train_and_save_models()
