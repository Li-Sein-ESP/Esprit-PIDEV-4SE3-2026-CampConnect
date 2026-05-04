"""
CampConnect Marketplace — Demand Prediction Flask API
Loads the trained RandomForest model and label encoders,
exposes POST /predict for Spring Boot to call.
"""

import os
import numpy as np
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ── Load model & encoders ────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model       = joblib.load(os.path.join(BASE_DIR, "demand_model.pkl"))
le_category = joblib.load(os.path.join(BASE_DIR, "le_category.pkl"))
le_season   = joblib.load(os.path.join(BASE_DIR, "le_season.pkl"))
le_region   = joblib.load(os.path.join(BASE_DIR, "le_region.pkl"))

print("[OK] Model and encoders loaded successfully")
print(f"   Categories : {list(le_category.classes_)}")
print(f"   Seasons    : {list(le_season.classes_)}")
print(f"   Regions    : {list(le_region.classes_)}")


# ── Helpers ───────────────────────────────────────────────────────────────────
def month_to_season(month: int) -> str:
    """Map a month number (1-12) to a season name."""
    if month in (3, 4, 5):
        return "Spring"
    elif month in (6, 7, 8):
        return "Summer"
    elif month in (9, 10, 11):
        return "Fall"
    else:
        return "Winter"


def safe_encode(encoder, value: str, fallback: int = 0) -> int:
    """Encode a label, falling back to `fallback` if the value is unknown."""
    try:
        return int(encoder.transform([value])[0])
    except (ValueError, KeyError):
        # Value not seen during training → use fallback
        return fallback


def suggest_price(avg_price: float, predicted_demand: int) -> dict:
    """
    Simple pricing logic based on demand level.
    Returns suggested_price and a human-readable price_action.
    """
    if predicted_demand > 150:
        factor = 1.15
        action = "High demand -- consider raising price by ~15%"
    elif predicted_demand > 100:
        factor = 1.05
        action = "Moderate demand -- slight price increase OK (+5%)"
    elif predicted_demand > 50:
        factor = 1.00
        action = "Normal demand -- keep current price"
    else:
        factor = 0.90
        action = "Low demand -- consider a 10% discount to boost rentals"

    suggested = round(avg_price * factor, 2)
    return {"suggested_price": suggested, "price_action": action}


# ── Prediction endpoint ──────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)

    # Extract inputs
    year            = data.get("year", 2026)
    month           = data.get("month", 1)
    category_raw    = data.get("category", "tents")
    region_raw      = data.get("region", "all")
    views           = data.get("views", 100)
    rentals         = data.get("rentals", 20)
    purchases       = data.get("purchases", 5)
    avg_price       = data.get("avg_price", 50.0)
    avg_rating      = data.get("avg_rating", 4.0)
    is_holiday      = data.get("is_holiday", 0)
    delivery_demand = data.get("delivery_demand", 10)

    # Derive season from month
    season_raw = month_to_season(month)

    # Encode categorical features
    category_enc = safe_encode(le_category, category_raw)
    season_enc   = safe_encode(le_season, season_raw)
    region_enc   = safe_encode(le_region, region_raw)

    # Cyclical month encoding
    month_sin = np.sin(2 * np.pi * month / 12)
    month_cos = np.cos(2 * np.pi * month / 12)

    # Derived features
    rental_to_view_ratio    = rentals / views if views > 0 else 0
    purchase_to_rental_ratio = purchases / rentals if rentals > 0 else 0
    total_current_demand    = views + rentals + purchases

    # Build feature vector (must match training column order — 17 features)
    features = np.array([[
        year,
        month,
        month_sin,
        month_cos,
        category_enc,
        season_enc,
        region_enc,
        views,
        rentals,
        purchases,
        avg_price,
        avg_rating,
        is_holiday,
        delivery_demand,
        rental_to_view_ratio,
        purchase_to_rental_ratio,
        total_current_demand
    ]])

    # Predict
    predicted_demand = int(model.predict(features)[0])

    # Pricing suggestion
    pricing = suggest_price(avg_price, predicted_demand)

    return jsonify({
        "category":         category_raw,
        "month":            month,
        "season":           season_raw,
        "predicted_demand": predicted_demand,
        "suggested_price":  pricing["suggested_price"],
        "price_action":     pricing["price_action"]
    })


# ── Health check ──────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "demand_model.pkl"})


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
