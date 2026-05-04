"""
Flask microservice for gear recommendation using a pre-trained ML model.
Loads 5 pkl files on startup and exposes /recommend and /health endpoints.
"""

import sys
import os
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Load model artifacts
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    model = joblib.load(os.path.join(BASE_DIR, "gear_rec_model.pkl"))
    print("[OK] gear_rec_model.pkl loaded")
except Exception as e:
    print(f"[FATAL] Failed to load gear_rec_model.pkl: {e}")
    sys.exit(1)

try:
    feature_encoders = joblib.load(os.path.join(BASE_DIR, "gear_rec_feature_encoders.pkl"))
    print("[OK] gear_rec_feature_encoders.pkl loaded")
except Exception as e:
    print(f"[FATAL] Failed to load gear_rec_feature_encoders.pkl: {e}")
    sys.exit(1)

try:
    target_encoders = joblib.load(os.path.join(BASE_DIR, "gear_rec_target_encoders.pkl"))
    print("[OK] gear_rec_target_encoders.pkl loaded")
except Exception as e:
    print(f"[FATAL] Failed to load gear_rec_target_encoders.pkl: {e}")
    sys.exit(1)

try:
    feature_cols = joblib.load(os.path.join(BASE_DIR, "gear_rec_feature_cols.pkl"))
    print(f"[OK] gear_rec_feature_cols.pkl loaded ({len(feature_cols)} features)")
except Exception as e:
    print(f"[FATAL] Failed to load gear_rec_feature_cols.pkl: {e}")
    sys.exit(1)

try:
    target_cols = joblib.load(os.path.join(BASE_DIR, "gear_rec_target_cols.pkl"))
    print(f"[OK] gear_rec_target_cols.pkl loaded ({len(target_cols)} targets)")
except Exception as e:
    print(f"[FATAL] Failed to load gear_rec_target_cols.pkl: {e}")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Lookup tables
# ---------------------------------------------------------------------------
DESTINATION_TERRAIN = {
    'Ain Draham': 'mountain', 'Zaghouan': 'mountain', 'Jugurtha Plateau': 'mountain',
    'Chambi Mountain': 'mountain', 'Kesra': 'mountain', 'Bargou': 'mountain',
    'Siliana Forest': 'mountain', 'Makthar': 'mountain', 'Le Kef': 'mountain',
    'Bou Hedma': 'mountain', 'Orbata Mountain': 'mountain',
    'Feija National Park': 'forest', 'Bellif Forest': 'forest', 'Tabarka Forest': 'forest',
    'Nefza Forest': 'forest', 'Sejnane': 'forest', 'Kroumirie Forest': 'forest',
    'Beja Forest': 'forest', 'Jendouba Forest': 'forest',
    'Djerba': 'beach', 'Hammamet': 'beach', 'Sousse Beach': 'beach', 'Bizerte Beach': 'beach',
    'Tabarka Beach': 'beach', 'Kelibia': 'beach', 'Nabeul Beach': 'beach', 'Zarzis': 'beach',
    'Mahdia Beach': 'beach', 'Sfax Coast': 'beach', 'Ghar El Melh': 'beach',
    'Douz': 'desert', 'Ksar Ghilane': 'desert', 'Tozeur': 'desert', 'Nefta': 'desert',
    'Chott El Jerid': 'desert', 'Matmata': 'desert', 'Tataouine': 'desert',
    'Remada': 'desert', 'Borj El Khadra': 'desert', 'Kebili': 'desert',
    'Medenine Oasis': 'desert',
    'Ichkeul Lake': 'lake', 'Bizerte Lake': 'lake', 'Tunis Lake': 'lake',
    'Remel Lake': 'lake', 'Sidi Salem Dam': 'lake', 'Nebhana Dam': 'lake',
    'Sejnane Dam': 'lake'
}

WEATHER_MATRIX = {
    ('mountain', 'winter'): 'high', ('mountain', 'fall'): 'medium',
    ('mountain', 'spring'): 'medium', ('mountain', 'summer'): 'low',
    ('forest', 'winter'): 'medium', ('forest', 'fall'): 'medium',
    ('forest', 'spring'): 'low', ('forest', 'summer'): 'low',
    ('beach', 'winter'): 'medium', ('beach', 'fall'): 'low',
    ('beach', 'spring'): 'low', ('beach', 'summer'): 'low',
    ('desert', 'winter'): 'medium', ('desert', 'fall'): 'low',
    ('desert', 'spring'): 'low', ('desert', 'summer'): 'high',
    ('lake', 'winter'): 'medium', ('lake', 'fall'): 'low',
    ('lake', 'spring'): 'low', ('lake', 'summer'): 'low',
}

MONTH_SEASON = {
    1: 'winter', 2: 'winter', 3: 'spring', 4: 'spring', 5: 'spring',
    6: 'summer', 7: 'summer', 8: 'summer', 9: 'fall', 10: 'fall',
    11: 'fall', 12: 'winter'
}

# ---------------------------------------------------------------------------
# Feature engineering (must match training pipeline)
# ---------------------------------------------------------------------------
def duration_bucket(d):
    if d == 1:
        return 'day_trip'
    elif d <= 3:
        return 'weekend'
    elif d <= 7:
        return 'week'
    else:
        return 'extended'


def group_bucket(g):
    if g == 1:
        return 'solo'
    elif g <= 3:
        return 'small'
    elif g <= 8:
        return 'medium'
    else:
        return 'large'


# ---------------------------------------------------------------------------
# Priority sort order
# ---------------------------------------------------------------------------
PRIORITY_ORDER = {'essential': 0, 'recommended': 1, 'optional': 2}

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model": "gear_recommender", "version": "1.0"})


@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json(force=True)

        # Required fields
        destination = data.get('destination')
        month = data.get('month')
        duration_days = data.get('duration_days')
        group_size = data.get('group_size')
        activity = data.get('activity')
        experience_level = data.get('experience_level')

        if not all([destination, month is not None, duration_days, group_size, activity, experience_level]):
            return jsonify({"error": "Missing required fields: destination, month, duration_days, group_size, activity, experience_level"}), 400

        month = int(month)
        duration_days = int(duration_days)
        group_size = int(group_size)

        # Derive terrain
        terrain = data.get('terrain') or DESTINATION_TERRAIN.get(destination, 'mountain')

        # Derive season
        season = data.get('season') or MONTH_SEASON.get(month, 'spring')

        # Derive weather_risk
        weather_risk = data.get('weather_risk') or WEATHER_MATRIX.get((terrain, season), 'low')

        # Build feature dict
        row = {
            'destination': destination,
            'terrain': terrain,
            'season': season,
            'month': month,
            'duration_days': duration_days,
            'group_size': group_size,
            'activity': activity,
            'experience_level': experience_level,
            'weather_risk': weather_risk,
            'duration_bucket': duration_bucket(duration_days),
            'group_bucket': group_bucket(group_size),
        }

        # Encode features
        encoded_row = {}
        for col in feature_cols:
            if col in row:
                raw_val = row[col]
                if col in feature_encoders:
                    encoder = feature_encoders[col]
                    try:
                        encoded_row[col] = encoder.transform([raw_val])[0]
                    except ValueError:
                        return jsonify({"error": f"Unknown value for field {col}: {raw_val}"}), 400
                else:
                    encoded_row[col] = raw_val
            else:
                encoded_row[col] = 0

        # Build DataFrame in column order
        df = pd.DataFrame([encoded_row], columns=feature_cols)

        # Predict
        predictions = model.predict(df)

        # Decode predictions
        if predictions.ndim == 1:
            predictions = predictions.reshape(1, -1)

        recommendations = []
        for i, col in enumerate(target_cols):
            pred_encoded = predictions[0][i]
            if col in target_encoders:
                decoder = target_encoders[col]
                try:
                    pred_val = decoder.inverse_transform([int(round(pred_encoded))])[0]
                except (ValueError, IndexError):
                    pred_val = str(pred_encoded)
            else:
                pred_val = str(pred_encoded)

            # target column format: "<category>_priority" -> category, priority
            if '_priority' in col:
                category = col.replace('_priority', '')
            else:
                category = col

            priority = str(pred_val).lower()

            # Filter out not_needed
            if priority == 'not_needed':
                continue

            recommendations.append({
                "category": category,
                "priority": priority
            })

        # Sort: essential first, recommended second, optional third
        recommendations.sort(key=lambda x: PRIORITY_ORDER.get(x['priority'], 99))

        return jsonify({
            "destination": destination,
            "terrain": terrain,
            "season": season,
            "recommendations": recommendations
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
