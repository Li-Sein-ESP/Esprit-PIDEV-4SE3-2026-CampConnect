# HOW TO RUN:
# 1. cd ml/ → pip install -r requirements.txt → python app.py   (port 5000)
# 2. Start CampConnect-Backend Spring Boot                        (port 8090)
# 3. Start angular-campconnect frontend                           (port 4200)
# Flow: Angular (4200) → Spring Boot (8090) → Flask (5000) → demand_model.pkl

from flask import Flask, request, jsonify
import os
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

BASE = os.path.dirname(os.path.abspath(__file__))

model       = joblib.load(os.path.join(BASE, 'demand_model.pkl'))
le_region   = joblib.load(os.path.join(BASE, 'le_region.pkl'))
le_activity = joblib.load(os.path.join(BASE, 'le_activity.pkl'))
le_customer = joblib.load(os.path.join(BASE, 'le_customer.pkl'))
le_meal     = joblib.load(os.path.join(BASE, 'le_meal.pkl'))
le_source   = joblib.load(os.path.join(BASE, 'le_source.pkl'))
le_season   = joblib.load(os.path.join(BASE, 'le_season.pkl'))

season_map = {
    1:'Hiver', 2:'Hiver', 3:'Printemps', 4:'Printemps', 5:'Printemps',
    6:'Été', 7:'Été', 8:'Été', 9:'Automne', 10:'Automne',
    11:'Automne', 12:'Hiver'
}

weather_advice_map = {
    ('Tabarka','Hiver'):      'Prévoir des abris contre la pluie et le vent — région humide en hiver.',
    ('Tabarka','Été'):        'Forte chaleur — prévoir des zones ombragées et des points d\'eau.',
    ('Tabarka','Printemps'):  'Risque de pluies printanières — vérifier les drainages.',
    ('Tabarka','Automne'):    'Températures agréables — période idéale pour la randonnée.',
    ('Bizerte','Hiver'):      'Vents marins forts — sécuriser les équipements légers.',
    ('Bizerte','Été'):        'Forte fréquentation balnéaire prévue — augmenter les stocks.',
    ('Bizerte','Printemps'):  'Bon ensoleillement — idéal pour promouvoir les activités nautiques.',
    ('Bizerte','Automne'):    'Mer agitée possible — limiter les activités nautiques.',
    ('Ain Draham','Hiver'):   'Risque de neige — prévoir chauffage et équipements chauds.',
    ('Ain Draham','Été'):     'Climat frais et agréable — point fort à mettre en avant.',
    ('Ain Draham','Printemps'): 'Forêts verdoyantes — promouvoir la randonnée et l\'écotourisme.',
    ('Ain Draham','Automne'): 'Feuillage automnal attractif — idéal pour la photographie nature.',
    ('Zaghouan','Été'):       'Chaleur intense — promouvoir les piscines naturelles et sources.',
    ('Zaghouan','Hiver'):     'Températures froides la nuit — prévoir des couvertures supplémentaires.',
    ('Zaghouan','Printemps'): 'Cascades et sources actives — point d\'attraction majeur.',
    ('Zaghouan','Automne'):   'Conditions idéales pour le camping — basse saison, tarifs attractifs.',
    ('Nabeul','Été'):         'Haute saison touristique — maximiser les réservations en avance.',
    ('Nabeul','Hiver'):       'Basse saison — proposer des tarifs réduits pour attirer les groupes.',
    ('Nabeul','Printemps'):   'Floraison et températures douces — idéal pour les familles.',
    ('Nabeul','Automne'):     'Fin de saison — promotions de dernière minute recommandées.',
    ('Hammamet','Été'):       'Pic touristique maximal — augmenter les prix et le personnel.',
    ('Hammamet','Hiver'):     'Basse saison — cibler les retraités et groupes scolaires.',
    ('Hammamet','Printemps'): 'Reprise progressive — lancer les campagnes de réservation tôt.',
    ('Hammamet','Automne'):   'Bonne fréquentation résiduelle — maintenir les tarifs standards.',
}

activity_suggestions_map = {
    'Été':       ['Natation', 'Kayak', 'Randonnée nocturne', 'Yoga en plein air', 'Observation des étoiles'],
    'Hiver':     ['Randonnée', 'Photographie nature', 'Feu de camp', 'Ateliers survie', 'Escalade'],
    'Printemps': ['Randonnée', 'Vélo', 'Bird watching', 'Escalade', 'Pique-nique nature'],
    'Automne':   ['Randonnée', 'Récolte de champignons', 'Photographie', 'Vélo de montagne', 'Camping sauvage'],
}

def safe_transform(encoder, value, field_name):
    try:
        return encoder.transform([value])[0]
    except ValueError:
        known = list(encoder.classes_)
        fallback_value = known[0]
        return encoder.transform([fallback_value])[0]

def get_pricing_advice(demand_level, current_price):
    if demand_level == 'HIGH':
        suggested = round(current_price * 1.20, 2)
        return f'Demande élevée — augmenter le prix de 20% (prix suggéré : {suggested} TND/nuit).'
    elif demand_level == 'MEDIUM':
        return f'Demande modérée — maintenir le prix actuel ({current_price} TND/nuit).'
    else:
        suggested = round(current_price * 0.85, 2)
        return f'Faible demande — réduire le prix de 15% pour attirer des réservations (prix suggéré : {suggested} TND/nuit).'

def get_staffing_advice(demand_level):
    if demand_level == 'HIGH':
        return 'Forte demande prévue — recruter du personnel supplémentaire et augmenter les stocks de nourriture.'
    elif demand_level == 'MEDIUM':
        return 'Demande modérée — effectifs normaux suffisants, prévoir des réserves légères.'
    else:
        return 'Faible demande — réduire les coûts opérationnels, proposer des offres promotionnelles.'

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/forecast', methods=['POST'])
def forecast():
    try:
        data = request.json
        campsites = data.get('campsites', [])
        target_month = data.get('target_month')

        if not campsites:
            return jsonify({"error": "campsites list is empty"}), 400
        if target_month is None or not (1 <= int(target_month) <= 12):
            return jsonify({"error": "target_month must be between 1 and 12"}), 400

        month = int(target_month)
        season = season_map[month]
        is_holiday = 1 if month in [7, 8, 12, 1] else 0
        
        results = []
        high_count = 0
        medium_count = 0
        low_count = 0

        for campsite in campsites:
            price = float(campsite.get('price_per_night', 60.0))
            capacity = int(campsite.get('capacity', 30))
            bookings_count = int(capacity * 0.7)
            occupancy_rate = round(bookings_count / capacity, 3)

            features = pd.DataFrame([{
                'month':                  month,
                'month_sin':              np.sin(2 * np.pi * month / 12),
                'month_cos':              np.cos(2 * np.pi * month / 12),
                'season_enc':             safe_transform(le_season,   season,                              'season'),
                'region_enc':             safe_transform(le_region,   campsite.get('region', 'Tabarka'),   'region'),
                'activity_enc':           safe_transform(le_activity, campsite.get('activity','Randonnée'),'activity'),
                'customer_enc':           safe_transform(le_customer, campsite.get('customer_type','Famille'), 'customer_type'),
                'meal_enc':               safe_transform(le_meal,     'Demi-pension',                      'meal_plan'),
                'source_enc':             safe_transform(le_source,   'Direct',                            'booking_source'),
                'capacity':               capacity,
                'price_per_night_tnd':    price,
                'is_expensive':           1 if price > 75 else 0,
                'rating':                 float(campsite.get('rating', 4.0)),
                'bookings_count':         bookings_count,
                'occupancy_rate':         occupancy_rate,
                'occupancy_pressure':     occupancy_rate,
                'is_weekend_peak':        1,
                'is_holiday_period':      is_holiday,
                'lead_time_avg_days':     14,
                'avg_stay_nights':        3.0,
                'previous_week_bookings': int(bookings_count * 0.9),
                'demand_momentum':        int(bookings_count * 0.1),
                'cancellation_rate':      0.10,
                'revenue_week_tnd':       round(bookings_count * price * 3.0, 2),
            }])

            prediction = model.predict(features)[0]
            probabilities = model.predict_proba(features)[0]
            classes = list(model.classes_)
            prob_dict = {cls: round(float(prob), 4) for cls, prob in zip(classes, probabilities)}
            demand_score = round(float(prob_dict.get('HIGH', 0.0)), 4)
            
            demand_level = prediction
            if demand_level == 'HIGH':
                high_count += 1
            elif demand_level == 'MEDIUM':
                medium_count += 1
            else:
                low_count += 1
                
            region_val = campsite.get('region', 'Tabarka')
            weather_advice = weather_advice_map.get((region_val, season), f"Conditions météo de la saison {season}.")
            
            result = {
                "campsite_id": campsite.get("id"),
                "campsite_name": campsite.get("name"),
                "region": region_val,
                "season": season,
                "target_month": month,
                "demand_level": demand_level,
                "demand_score": demand_score,
                "probabilities": prob_dict,
                "pricing_recommendation": get_pricing_advice(demand_level, price),
                "weather_advice": weather_advice,
                "staffing_recommendation": get_staffing_advice(demand_level),
                "activity_suggestions": activity_suggestions_map.get(season, [])
            }
            results.append(result)

        response = {
            "forecasts": results,
            "analysis_month": month,
            "analysis_season": season,
            "total_campsites_analyzed": len(campsites),
            "high_demand_count": high_count,
            "medium_demand_count": medium_count,
            "low_demand_count": low_count
        }
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
