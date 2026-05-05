#!/usr/bin/env python3
"""
🔄 AUTO-MAPPER DATASETS - Mapper données externes au format CampConnect
Utilise: Hotel Booking Demand ou autres datasets tourisme
Output: CSV prêt pour entraînement
"""

import pandas as pd
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

def map_hotel_booking_demand(df_input):
    """
    Mapper Hotel Booking Demand → Format CampConnect
    
    Input: hotel_bookings.csv de Kaggle
    Output: DataFrame avec colonnes CampConnect
    """
    
    print("\n📊 MAPPING Hotel Booking Demand...")
    print("=" * 80)
    
    try:
        # Vérifier colonnes essentielles existent
        required_cols = ['adr', 'is_canceled', 'adults', 'children', 
                        'stays_in_weekend_nights', 'stays_in_week_nights', 
                        'arrival_date_month', 'country']
        
        missing = [col for col in required_cols if col not in df_input.columns]
        if missing:
            print(f"⚠️ Colonnes manquantes: {missing}")
            return None
        
        # Créer nouveau dataset mappé
        df_mapped = pd.DataFrame()
        
        # 1. user_proposed_budget ← adr * number of nights (approximation)
        nights = df_input['stays_in_weekend_nights'] + df_input['stays_in_week_nights']
        nights = nights.replace(0, 1)  # Éviter division par 0
        df_mapped['user_proposed_budget'] = (df_input['adr'] * nights).astype(float)
        
        # Nettoyer: remplacer 0 ou NaN par médiane
        median_budget = df_mapped['user_proposed_budget'][df_mapped['user_proposed_budget'] > 0].median()
        df_mapped['user_proposed_budget'] = df_mapped['user_proposed_budget'].replace(0, median_budget)
        df_mapped['user_proposed_budget'] = df_mapped['user_proposed_budget'].fillna(median_budget)
        
        # 2. duration_days ← stays_in_weekend_nights + stays_in_week_nights
        df_mapped['duration_days'] = nights.astype(int)
        df_mapped['duration_days'] = df_mapped['duration_days'].replace(0, 3)  # Default 3 jours
        
        # 3. group_size ← adults + children
        df_mapped['group_size'] = (df_input['adults'] + df_input.get('children', 0)).astype(int)
        df_mapped['group_size'] = df_mapped['group_size'].replace(0, 1)
        
        # 4. location ← country (encode 1-10)
        countries = df_input['country'].unique()
        country_map = {country: (i % 10) + 1 for i, country in enumerate(countries)}
        df_mapped['location'] = df_input['country'].map(country_map).astype(int)
        
        # 5. season ← arrival_date_month
        month_to_season = {
            'January': 1, 'February': 1, 'March': 1,      # Hiver
            'April': 2, 'May': 2, 'June': 2,              # Printemps
            'July': 3, 'August': 3, 'September': 3,       # Été
            'October': 4, 'November': 4, 'December': 4    # Automne
        }
        df_mapped['season'] = df_input['arrival_date_month'].map(month_to_season).astype(int)
        
        # 6. trip_type ← random (pas disponible)
        np.random.seed(42)
        df_mapped['trip_type'] = np.random.randint(1, 6, len(df_input))
        
        # 7. distance_km ← random entre 100-1500
        df_mapped['distance_km'] = np.random.randint(100, 1500, len(df_input))
        
        # 8. hotel_quality ← random 2-5 stars
        df_mapped['hotel_quality'] = np.random.randint(2, 6, len(df_input))
        
        # 9. rating_1_5 ← random 3.5-5.0
        df_mapped['rating_1_5'] = np.random.uniform(3.5, 5.0, len(df_input)).round(1)
        
        # 10. review_polarity ← random 0.5-1.0
        df_mapped['review_polarity'] = np.random.uniform(0.5, 1.0, len(df_input)).round(2)
        
        # 11. weather_score ← random 0.6-1.0
        df_mapped['weather_score'] = np.random.uniform(0.6, 1.0, len(df_input)).round(2)
        
        # 12. time_flexibility ← random 0.3-1.0
        df_mapped['time_flexibility'] = np.random.uniform(0.3, 1.0, len(df_input)).round(2)
        
        # 13. has_paid_activities ← random 0/1
        df_mapped['has_paid_activities'] = np.random.randint(0, 2, len(df_input))
        
        # 14. paid_activities_count ← random 0-8
        df_mapped['paid_activities_count'] = np.random.randint(0, 9, len(df_input))
        
        # 15. avg_activity_cost ← random 50-200
        df_mapped['avg_activity_cost'] = np.random.uniform(50, 200, len(df_input)).round(2)
        
        # 16. has_paid_visits ← random 0/1
        df_mapped['has_paid_visits'] = np.random.randint(0, 2, len(df_input))
        
        # 17. paid_visits_count ← random 0-5
        df_mapped['paid_visits_count'] = np.random.randint(0, 6, len(df_input))
        
        # 18. avg_visit_cost ← random 30-150
        df_mapped['avg_visit_cost'] = np.random.uniform(30, 150, len(df_input)).round(2)
        
        # 19. ambiguity_level ← (activities + visits) / 15
        total_activities = df_mapped['paid_activities_count'] + df_mapped['paid_visits_count']
        df_mapped['ambiguity_level'] = (total_activities / 15.0).clip(0, 1.0).round(3)
        
        # 20. budget_usd (target) ← user_proposed_budget (approximation)
        df_mapped['budget_usd'] = df_mapped['user_proposed_budget']
        
        # 21. accept_recommendation (target) ← is_canceled inversé
        # is_canceled=1 → rejette, is_canceled=0 → accepte
        df_mapped['accept_recommendation'] = (~df_input['is_canceled'].astype(bool)).astype(int)
        
        print(f"✅ Mapping réussi!")
        print(f"   Rows: {len(df_mapped)}")
        print(f"   Colonnes: {len(df_mapped.columns)}")
        print(f"   Budget moyen: ${df_mapped['budget_usd'].mean():.2f}")
        print(f"   Acceptance rate: {df_mapped['accept_recommendation'].mean()*100:.1f}%")
        
        return df_mapped
    
    except Exception as e:
        print(f"❌ Erreur mapping: {e}")
        return None

def map_travel_insurance(df_input):
    """
    Mapper Travel Insurance Dataset → Format CampConnect
    """
    
    print("\n📊 MAPPING Travel Insurance Dataset...")
    print("=" * 80)
    
    try:
        df_mapped = pd.DataFrame()
        
        # 1. user_proposed_budget ← AnnualIncome * 0.15 (15% income pour vacation)
        annual_income = df_input.get('AnnualIncome', 50000)
        df_mapped['user_proposed_budget'] = (annual_income * 0.15).astype(float)
        
        # 2. duration_days ← random 3-14 (Travel Insurance usually for multi-day)
        np.random.seed(42)
        df_mapped['duration_days'] = np.random.randint(3, 15, len(df_input))
        
        # 3. group_size ← FamilyMembers
        df_mapped['group_size'] = df_input.get('FamilyMembers', 2).astype(int)
        df_mapped['group_size'] = df_mapped['group_size'].clip(1, 20)
        
        # Autres features (similaire à Hotel Booking)
        df_mapped['location'] = np.random.randint(1, 11, len(df_input))
        df_mapped['season'] = np.random.randint(1, 5, len(df_input))
        df_mapped['trip_type'] = np.random.randint(1, 6, len(df_input))
        df_mapped['distance_km'] = np.random.randint(100, 1500, len(df_input))
        df_mapped['hotel_quality'] = np.random.randint(2, 6, len(df_input))
        df_mapped['rating_1_5'] = np.random.uniform(3.5, 5.0, len(df_input)).round(1)
        df_mapped['review_polarity'] = np.random.uniform(0.5, 1.0, len(df_input)).round(2)
        df_mapped['weather_score'] = np.random.uniform(0.6, 1.0, len(df_input)).round(2)
        df_mapped['time_flexibility'] = np.random.uniform(0.3, 1.0, len(df_input)).round(2)
        df_mapped['has_paid_activities'] = np.random.randint(0, 2, len(df_input))
        df_mapped['paid_activities_count'] = np.random.randint(0, 9, len(df_input))
        df_mapped['avg_activity_cost'] = np.random.uniform(50, 200, len(df_input)).round(2)
        df_mapped['has_paid_visits'] = np.random.randint(0, 2, len(df_input))
        df_mapped['paid_visits_count'] = np.random.randint(0, 6, len(df_input))
        df_mapped['avg_visit_cost'] = np.random.uniform(30, 150, len(df_input)).round(2)
        
        # Ambiguity
        total_act = df_mapped['paid_activities_count'] + df_mapped['paid_visits_count']
        df_mapped['ambiguity_level'] = (total_act / 15.0).clip(0, 1.0).round(3)
        
        # Targets
        df_mapped['budget_usd'] = df_mapped['user_proposed_budget']
        # TravelInsurance=1 → took insurance → moins risqué → accepte
        df_mapped['accept_recommendation'] = df_input.get('TravelInsurance', 0).astype(int)
        
        print(f"✅ Mapping réussi!")
        print(f"   Rows: {len(df_mapped)}")
        print(f"   Budget moyen: ${df_mapped['budget_usd'].mean():.2f}")
        
        return df_mapped
    
    except Exception as e:
        print(f"❌ Erreur mapping: {e}")
        return None

def merge_datasets(df_current, df_external, name_external="External"):
    """Merger données actuelles + externes"""
    
    print(f"\n🔀 MERGER {name_external}...")
    print("=" * 80)
    
    try:
        # Vérifier colonnes match
        cols_current = set(df_current.columns)
        cols_external = set(df_external.columns)
        
        if cols_current != cols_external:
            missing_in_external = cols_current - cols_external
            if missing_in_external:
                print(f"⚠️ Colonnes manquantes dans {name_external}: {missing_in_external}")
                # Ajouter avec valeurs par défaut
                for col in missing_in_external:
                    df_external[col] = df_current[col].median() if df_current[col].dtype in ['int64', 'float64'] else df_current[col].mode()[0]
        
        # Merger
        df_merged = pd.concat([df_current, df_external], ignore_index=True)
        
        print(f"✅ Merger réussi!")
        print(f"   Avant: {len(df_current)} + {len(df_external)} = {len(df_current) + len(df_external)}")
        print(f"   Après: {len(df_merged)} rows")
        
        return df_merged
    
    except Exception as e:
        print(f"❌ Erreur merge: {e}")
        return None

def main():
    """Script principal"""
    
    print("\n" + "="*80)
    print("🔄 AUTO-MAPPER DATASETS TOURISTIQUES")
    print("="*80)
    
    # Chemins
    current_data_path = Path('trips_data_realistic.csv')
    
    if not current_data_path.exists():
        print(f"❌ {current_data_path} non trouvé!")
        print("   Assure-toi d'avoir exécuté: python generate_realistic_data.py")
        return
    
    print(f"✅ Données actuelles: {current_data_path}")
    df_current = pd.read_csv(current_data_path)
    print(f"   {len(df_current)} rows, {len(df_current.columns)} colonnes")
    
    # Menu
    print("\n📂 DATASETS DISPONIBLES:")
    print("   1. Hotel Booking Demand (Kaggle)")
    print("   2. Travel Insurance (Kaggle)")
    print("   3. Custom (Specify path)")
    print("   4. Merger manuel (user input)")
    
    choice = input("\nQuel dataset veux-tu mapper? (1-4): ").strip()
    
    if choice == "1":
        path_external = input("Chemin vers hotel_bookings.csv: ").strip()
        if not Path(path_external).exists():
            print(f"❌ Fichier non trouvé: {path_external}")
            return
        
        df_external = pd.read_csv(path_external)
        print(f"✅ Chargé: {len(df_external)} rows")
        
        df_mapped = map_hotel_booking_demand(df_external)
        if df_mapped is None:
            return
        
        name = "Hotel Booking Demand"
    
    elif choice == "2":
        path_external = input("Chemin vers travel_insurance.csv: ").strip()
        if not Path(path_external).exists():
            print(f"❌ Fichier non trouvé: {path_external}")
            return
        
        df_external = pd.read_csv(path_external)
        print(f"✅ Chargé: {len(df_external)} rows")
        
        df_mapped = map_travel_insurance(df_external)
        if df_mapped is None:
            return
        
        name = "Travel Insurance"
    
    elif choice == "3":
        path_external = input("Chemin complet vers dataset: ").strip()
        if not Path(path_external).exists():
            print(f"❌ Fichier non trouvé: {path_external}")
            return
        
        print("Quel type? (hotel_booking / travel_insurance / custom): ").lower()
        dataset_type = input().strip()
        
        df_external = pd.read_csv(path_external)
        print(f"✅ Chargé: {len(df_external)} rows")
        
        if dataset_type == "hotel_booking":
            df_mapped = map_hotel_booking_demand(df_external)
        elif dataset_type == "travel_insurance":
            df_mapped = map_travel_insurance(df_external)
        else:
            print("Dataset custom - colonnes doivent matcher format CampConnect")
            df_mapped = df_external
        
        name = Path(path_external).name
    
    else:
        print("Saisis les colonnes (dev mode)")
        return
    
    if df_mapped is None:
        print("❌ Mapping échoué")
        return
    
    # Merger
    df_combined = merge_datasets(df_current, df_mapped, name)
    
    if df_combined is None:
        print("❌ Merge échoué")
        return
    
    # Sauvegarder
    output_path = "trips_data_combined.csv"
    df_combined.to_csv(output_path, index=False)
    
    print(f"\n✅ SUCCÈS!")
    print(f"   Données sauvegardées: {output_path}")
    print(f"   {len(df_combined)} rows au total")
    
    # Stats
    print(f"\n📊 STATISTIQUES COMBINÉES:")
    print(f"   Budget moyen: ${df_combined['budget_usd'].mean():.2f}")
    print(f"   Budget min: ${df_combined['budget_usd'].min():.2f}")
    print(f"   Budget max: ${df_combined['budget_usd'].max():.2f}")
    print(f"   Acceptance rate: {df_combined['accept_recommendation'].mean()*100:.1f}%")
    print(f"   Durée moyenne: {df_combined['duration_days'].mean():.1f} jours")
    print(f"   Groupe moyen: {df_combined['group_size'].mean():.1f} personnes")
    
    # Prochaine étape
    print(f"\n🚀 PROCHAINE ÉTAPE:")
    print(f"   1. Vérifier données: cat {output_path} | head -5")
    print(f"   2. Re-entraîner modèle:")
    print(f"      python train.py")
    print(f"   3. Valider résultats:")
    print(f"      python validate_predictions.py")

if __name__ == "__main__":
    main()
