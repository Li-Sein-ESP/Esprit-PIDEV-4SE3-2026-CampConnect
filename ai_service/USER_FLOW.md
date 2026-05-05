# 🎯 FLUX UTILISATEUR - Création de Trip avec Prédiction Budget

## Vue d'ensemble du flux

```
┌─────────────────────────────────────────────────────────────┐
│  UTILISATEUR CRÉE UN TRIP                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: Informations de base (Angular Frontend)           │
│  - Titre du trip                                             │
│  - Destination (lieu)                                        │
│  - Dates (début/fin)                                         │
│  - Nombre de participants                                    │
│  - Budget PROPOSÉ par utilisateur ⭐ (CLEF!)               │
│  - Type de voyage (Beach, Mountain, Desert, Urban, Adventure)│
│  - Niveau de difficulté                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 2: Questions sur Activités & Visites Payantes        │
│                                                               │
│  Question 1: "Allez-vous faire des activités payantes?"      │
│              Réponse: Oui/Non                                │
│                                                               │
│  Question 2: "Combien d'activités payantes?"                 │
│              Réponse: 5 activités                            │
│                                                               │
│  Question 3: "Coût moyen par activité?"                      │
│              Réponse: $75.50                                 │
│                                                               │
│  Question 4: "Allez-vous visiter sites/musées payants?"      │
│              Réponse: Oui/Non                                │
│                                                               │
│  Question 5: "Combien de sites/musées?"                      │
│              Réponse: 3 sites                                │
│                                                               │
│  Question 6: "Coût moyen par site?"                          │
│              Réponse: $50.00                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 3: Backend Java collecte les données                  │
│                                                               │
│  POST /api/trips/predict-budget                              │
│  {                                                            │
│    "tripId": "trip-123",                                     │
│    "userProposedBudget": 5000,         ← Étape 1             │
│    "location": 3,                      ← Calcul backend       │
│    "season": 2,                        ← Calcul backend       │
│    "durationDays": 7,                  ← Étape 1 (fin-début)  │
│    "groupSize": 10,                    ← Étape 1              │
│    "tripType": 2,                      ← Étape 1              │
│    "distanceKm": 450,                  ← API externe?         │
│    "hotelQuality": 4,                  ← Paramètre système    │
│    "rating_1_5": 4.5,                  ← Paramètre système    │
│    "reviewPolarity": 0.8,              ← Paramètre système    │
│    "weatherScore": 0.9,                ← API météo            │
│    "timeFlexibility": 0.7,             ← Calcul (fin-début)   │
│    "hasPaidActivities": 1,             ← Étape 2 Q1           │
│    "paidActivitiesCount": 5,           ← Étape 2 Q2           │
│    "avgActivityCost": 75.5,            ← Étape 2 Q3           │
│    "hasPaidVisits": 1,                 ← Étape 2 Q4           │
│    "paidVisitsCount": 3,               ← Étape 2 Q5           │
│    "avgVisitCost": 50.0                ← Étape 2 Q6           │
│  }                                                             │
│                                                               │
│  Backend Java:                                               │
│  1. Valide le trip existe                                    │
│  2. Récupère les activités associées                         │
│  3. Forge la requête TripAIPredictionRequest                 │
│  4. Appelle le service AI Python (http://localhost:5000)     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 4: Service AI Python prédit                           │
│                                                               │
│  POST http://localhost:5000/predict                          │
│  (avec les 19 features)                                      │
│                           ↓                                  │
│  Normalisation: StandardScaler.transform()                   │
│                           ↓                                  │
│  Prédiction Budget: model_budget.predict()                   │
│  → Score normalisé: 0.225                                    │
│                           ↓                                  │
│  Dénormalisation correcte:                                   │
│  Vraie valeur = 4250.5 + (0.225 × 1850.3) = 4665.78 USD    │
│                           ↓                                  │
│  Prédiction Risque: model_risk.predict_proba()              │
│  → Probabilité acceptation: 0.752 (75.2%)                   │
│  → Probabilité annulation: 0.248 (24.8%)                    │
│                           ↓                                  │
│  Génération Conseils:                                        │
│  - Écart budget: 4665.78 vs 5000 proposé = -6.7%            │
│  - Complexité: 8 activités/visites = moyenne                │
│  → Budget: "✅ Budget optimisé..."                           │
│  → Risque: "ℹ️ Trip viable..."                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 5: Backend Java reçoit la réponse AI                  │
│                                                               │
│  {                                                            │
│    "status": "success",                                      │
│    "predictions": {                                          │
│      "predicted_budget_usd": 4665.78,                        │
│      "budget_risk_level": "Faible",                          │
│      "budget_advice": "✅ Budget optimisé...",               │
│      "cancellation_probability": 0.248,                      │
│      "acceptance_probability": 0.752,                        │
│      "risk_level": "Modéré",                                 │
│      "risk_advice": "ℹ️ Trip viable..."                      │
│    },                                                         │
│    "explanation": { ... },                                   │
│    "model_confidence": {                                     │
│      "budget_r2": 0.8234,                                    │
│      "risk_accuracy": 0.8512                                 │
│    }                                                          │
│  }                                                            │
│                                                               │
│  Backend Java:                                               │
│  1. Valide la réponse                                        │
│  2. Sauvegarde la prédiction dans la DB                      │
│  3. Retourne au Frontend avec tous les détails              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 6: Frontend affiche les résultats (Angular)           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 💰 BUDGET PRÉDIT: $4665.78                             │  │
│  │    Budget proposé: $5000                               │  │
│  │    Économies potentielles: $334.22 (-6.7%)             │  │
│  │    Risque budget: ✅ Faible                            │  │
│  │    Conseil: ✅ Budget optimisé. Vous pouvez faire      │  │
│  │             7 activités supplémentaires.               │  │
│  │                                                        │  │
│  │ ⚠️ RISQUE: 24.8%                                       │  │
│  │    Probabilité acceptation: 75.2% ✅                   │  │
│  │    Niveau de risque: Modéré                            │  │
│  │    Conseil: ℹ️ Trip viable. Certains membres          │  │
│  │             peuvent hésiter à cause de la              │  │
│  │             complexité et l'écart budget.             │  │
│  │                                                        │  │
│  │ 🎯 CONFIANCE MODÈLE:                                  │  │
│  │    Budget: 82.34% (R² = 0.8234)                       │  │
│  │    Risque: 85.12% (Accuracy = 0.8512)                 │  │
│  │                                                        │  │
│  │ 📊 DÉTAILS:                                            │  │
│  │    • Activités payantes: 5 × $75.50 = $377.50          │  │
│  │    • Visites payantes: 3 × $50.00 = $150.00            │  │
│  │    • Total expériences payantes: 8 ($527.50)           │  │
│  │    • Qualité hôtel: 4/5 (impactant le budget)          │  │
│  │    • Durée: 7 jours                                    │  │
│  │    • Complexité: Modérée (8 expériences)               │  │
│  │                                                        │  │
│  │ [✅ VALIDER BUDGET]  [📝 MODIFIER]                    │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 7: Utilisateur actionne                               │
│                                                               │
│  Option A: ✅ VALIDER BUDGET                                │
│  → Trip sauvegardé avec budget validé                        │
│  → Notification groupe: "Trip validé!"                       │
│  → Utilisateur peut maintenant ajouter les activités         │
│                                                               │
│  Option B: 📝 MODIFIER                                      │
│  → Retour à l'étape 1                                        │
│  → Modifier budget/nombre participants/dates                 │
│  → Relancer prédiction (itération)                           │
│                                                               │
│  Option C: ⚠️ IGNORER PRÉDICTION                            │
│  → Trip créé avec budget original ($5000)                    │
│  → Mais recommandation sauvegardée pour suivi               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Exemple Concret - Trip Randonnée Kabylie

### Entrées Utilisateur

```
ÉTAPE 1: Infos de base
─────────────────────
Titre:              "Randonnée Kabylie 2026"
Destination:        "Kabylie (Algérie)"
Dates:              15-22 Juin (7 jours)
Participants:       12 personnes
Budget proposé:     $4500
Type:               Mountain
Difficulté:         Moderate

ÉTAPE 2: Questions Activités/Visites
──────────────────────────────────────
Q1: Activités payantes?           Oui
Q2: Combien d'activités?          4 (randonnées guidées)
Q3: Coût moyen par activité?      $60 (guide + transport)

Q4: Sites/musées payants?         Oui
Q5: Combien de sites?             2 (musées locaux)
Q6: Coût moyen par site?          $15 (entrée musée)
```

### Données Envoyées au Service AI

```json
{
  "user_proposed_budget": 4500,
  "location": 8, // Kabylie
  "season": 3, // Été (Juin)
  "duration_days": 7,
  "group_size": 12,
  "trip_type": 2, // Mountain
  "distance_km": 350, // Distance parcourue
  "hotel_quality": 3, // Moyen-gamme
  "rating_1_5": 4.2,
  "review_polarity": 0.7,
  "weather_score": 0.85, // Juin = bon météo
  "time_flexibility": 0.8,
  "has_paid_activities": 1,
  "paid_activities_count": 4,
  "avg_activity_cost": 60,
  "has_paid_visits": 1,
  "paid_visits_count": 2,
  "avg_visit_cost": 15
}
```

### Calculs du Modèle

```
BUDGET:
─────
Hébergement:
  3 étoiles × $50/jour × 7 jours = $1050

Activités:
  4 randonnées × $60 = $240

Visites:
  2 musées × $15 = $30

Autres (nourriture, transport local):
  ~$800 (variable)

Budget réel prédit ≈ $2120

Mais les données normalisées + RandomForest →
Prédiction: $4150 USD

Écart avec proposé: 4500 vs 4150 = -$350 (-7.8%)

RISQUE:
──────
Écart budget: -7.8% (bon, utilisateur a sur-budgétisé)
Complexité: 6 activités/visites (modérée)
Flexibilité: 0.8 (bonne, 7 jours = flexible)

Modèle décide: Acceptation probable 78%
              Annulation probable: 22%
```

### Réponse Affichée à l'Utilisateur

```
╔════════════════════════════════════════════════════════════╗
║         PRÉDICTION BUDGET & RISQUE - KABYLIE 2026         ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ 💰 BUDGET PRÉDIT: $4,150                                  ║
║    Budget proposé: $4,500                                 ║
║    Surplus budgétaire: $350 (+7.8%)  ← Vous sur-budgétisez ║
║    Niveau de risque: ✅ FAIBLE                            ║
║                                                            ║
║ Conseil Budget:                                            ║
║ ✅ "Votre budget est très optimisé! Vous avez prévu       ║
║     $350 de trop. Vous pouvez ajouter 1-2 activités      ║
║     supplémentaires ou améliorer l'hébergement."          ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ ⚠️  RISQUE D'ANNULATION: 22%                              ║
║    Probabilité acceptation: 78% ✅ TRÈS BON              ║
║    Niveau de risque: TRÈS FAIBLE                          ║
║                                                            ║
║ Conseil Risque:                                            ║
║ ✅ "Signal Intelligence: Stabilité du voyage confirmée.   ║
║     Forte probabilité d'acceptation du groupe. Vous       ║
║     pouvez annoncer ce trip avec confiance!"              ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ 🎯 CONFIANCE DU MODÈLE:                                  ║
║    Budget: 82.34% ← Données du modèle fiables            ║
║    Risque: 85.12% ← Prédictions de risque précises        ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ 📊 DÉTAILS:                                               ║
║                                                            ║
║ Activités payantes:   4 randonnées × $60 = $240          ║
║ Visites payantes:     2 musées × $15 = $30               ║
║ Total expériences:    6 activités ($270)                  ║
║                                                            ║
║ Hébergement:          Qualité 3/5 × 7 jours              ║
║ Durée voyage:         7 jours (flexible)                  ║
║ Taille groupe:        12 personnes                        ║
║ Complexité:           Modérée                             ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║              [✅ VALIDER]    [📝 MODIFIER]                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Résultat Final

Utilisateur clique **[✅ VALIDER]**

```
✨ Trip créé avec succès!

📋 Informations sauvegardées:
   • Budget proposé: $4500
   • Budget prédit (par IA): $4150
   • Risque annulation: 22%
   • Confiance modèle: 82-85%
   • Prédiction timestamp: 2026-04-21 14:30:45

🚀 Prochaines étapes:
   1. Ajouter les 12 participants
   2. Proposer les 4 randonnées guidées
   3. Proposer les 2 musées à visiter
   4. Voter sur les activités (GroupDecision)
   5. Confirmer le budget final
```

---

## 🔄 Si Utilisateur Modifie

### Scénario: Utilisateur change les params

```
Avant:          Après modification:
Budget: $4500   Budget: $6000 (↑ $1500)
Activités: 4    Activités: 8 (↑ 4)
Visites: 2      Visites: 4 (↑ 2)

→ Nouvelle prédiction AI lancée

Résultat:
Budget prédit: $5800 (au lieu de $4150)
Risque: 35% (au lieu de 22%)
→ "⚠️ Budget élevé et risque modéré"

Utilisateur voit l'impact de ses changements → Aide à décider
```

---

## 📊 Résumé - Données Collectées

| Étape | Source        | Données                             | Utilité                  |
| ----- | ------------- | ----------------------------------- | ------------------------ |
| **1** | Frontend      | Budget proposé, dates, groupe, etc. | Base prédiction          |
| **2** | Questionnaire | Activités/visites payantes          | Complexité budget        |
| **3** | Backend API   | Météo, distance, hôtel qual.        | Features supplémentaires |
| **4** | Service AI    | 19 features total                   | Prédiction finale        |
| **5** | Utilisateur   | Validation/modification             | Feedback itératif        |

---

## 🎓 Clés à Retenir

1. **Budget proposé = CLEF** ⭐
   - C'est la première entrée utilisateur
   - Le modèle ajuste par rapport à cela
   - Révèle l'intention réelle de l'utilisateur

2. **Activités/visites payantes = DRIVERS** 🎯
   - Influencent fortement le budget réel
   - Donnent la complexité du trip
   - Expliquent le risque d'annulation

3. **Itération = OPTIMISATION** 🔄
   - Utilisateur peut modifier et voir impact
   - Plus informatif qu'une seule prédiction
   - Aide à converger vers budget réaliste

4. **Explainability = TRUST** 🤝
   - Montrer pourquoi c'est $4150, pas $5000
   - Donner confiance aux utilisateurs
   - Réduire contestations sur prix final

---

Créé: 21 Avril 2026 | Version: 2.0 Production Ready
