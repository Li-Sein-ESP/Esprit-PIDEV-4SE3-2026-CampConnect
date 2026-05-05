# 📊 Diagramme de Flux Détaillé du Système

## Flux d'Utilisation Complet

```
┌─────────────────────────────────────────────────────────────────────┐
│                    UTILISATEUR FINAL                                │
│               (Interface Angular - Port 4200)                       │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ 1. Remplit le formulaire
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              FORMULAIRE DE RECHERCHE (HTML/Tailwind)                │
│  - Destination (ex: Bizerte)                                        │
│  - Saison (Printemps/Été/Automne/Hiver)                             │
│  - Durée en jours                                                   │
│  - Nombre de personnes                                              │
│  - Budget limite TND (optionnel)                                    │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ 2. Clique "Chercher"
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│           ITINERARY SERVICE (Angular - src/services)                │
│                                                                      │
│  Method: getRecommendedItineraries()                                │
│  - Appelle: POST /recommend-itinerary                               │
│  - Env à: http://localhost:5000                                     │
│  - Envoi: ItineraryRequest                                          │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ 3. HTTP POST
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              SERVICE AI PYTHON (FastAPI - Port 5000)                │
│                      /recommend-itinerary                           │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ├─── 4. Charge itinerary_model.pkl
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ITINERARY MODEL (Machine Learning)                     │
│                                                                      │
│  1. Filtre les activités par région + saison                        │
│  2. Sélectionne données pour destination                            │
│  3. Utilise K-means clustering → 3 groupes                          │
│     - Cluster 0: Budget économique (prix bas)                       │
│     - Cluster 1: Standard (prix moyen)                              │
│     - Cluster 2: Premium (prix haut)                                │
│  4. Sélectionne activités pour chaque groupe                        │
│  5. Calcule les coûts                                               │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ 6. Retourne 3 programmes
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              RÉPONSE API: ItineraryResponse                         │
│                                                                      │
│  programs[0]:                                                       │
│  {                                                                  │
│    program_id: 1,                                                   │
│    title: "🎒 Budget Économique",                                   │
│    budget_level: "low",                                             │
│    total_estimated_cost_tnd: 350.50,                                │
│    average_per_person_tnd: 175.25,                                  │
│    breakdown: {                                                     │
│      transport: 75,                                                 │
│      hebergement: 150,                                              │
│      nourriture: 90,                                                │
│      activites: 35.50                                               │
│    },                                                               │
│    days: [...]                                                      │
│  }                                                                  │
│  programs[1]: { ... } (Standard)                                    │
│  programs[2]: { ... } (Premium)                                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ 7. Angular reçoit 3 programmes
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│         ITINERARY-CARDS COMPONENT (Affichage)                       │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  🎒 Budget      │  │  ⭐ Standard    │  │  💎 Premium     │     │
│  │  350 DT         │  │  550 DT         │  │  850 DT         │     │
│  │  Voir détails → │  │  Voir détails → │  │  Voir détails → │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                      │
│  Chaque carte affiche:                                              │
│  - Prix total et par personne                                       │
│  - Décomposition (transport/hébergement/nourriture/activités)       │
│  - Status budget (dans/dépasse)                                     │
│  - Nombre de jours planifiés                                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ 8. Utilisateur clique sur une carte
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│         SÉLECTION D'ITINÉRAIRE                                      │
│                                                                      │
│  Utilisateur clique: "Voir le Détail du Budget"                     │
│  Itinéraire sélectionné: "medium" (Standard)                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ 9. Appelle calculateBudgetForItinerary()
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│           ITINERARY SERVICE (Angular)                               │
│                                                                      │
│  Method: calculateBudgetForItinerary()                              │
│  - Appelle: POST /calculate-budget-for-itinerary                    │
│  - Envoi: SelectedItineraryRequest {                                │
│      region: "Bizerte",                                             │
│      season: "Été",                                                 │
│      duration_days: 3,                                              │
│      budget_level: "medium",                                        │
│      num_people: 2,                                                 │
│      user_proposed_budget_tnd: 500                                  │
│    }                                                                │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ 10. HTTP POST
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              SERVICE AI PYTHON (FastAPI)                            │
│             /calculate-budget-for-itinerary                         │
└─────────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │ Budget Model │  │ Risk Model   │  │   Scaler     │
        │   (utilisé)  │  │   Prédiction │  │  (Normalize) │
        └──────────────┘  └──────────────┘  └──────────────┘
                    │          │          │
                    │          ▼          │
                    │   Probabilité:      │
                    │   Annulation = 0.25 │
                    │   Risk = "Faible"   │
                    │          │          │
                    └──────────┼──────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              CALCULS DÉTAILLÉS                                      │
│                                                                      │
│  Transport = 150 km × 0.5 TND/km = 75 TND                          │
│                                                                      │
│  Hébergement = 3 jours × 2 pers × 45 TND/nuit = 270 TND            │
│                                                                      │
│  Nourriture = 3 jours × 2 pers × 30 TND/jour = 180 TND             │
│                                                                      │
│  Activités (medium) = 3 jours × 60 TND/jour = 180 TND              │
│                                                                      │
│  ┌─────────────────────────────────────────┐                       │
│  │ TOTAL = 75 + 270 + 180 + 180 = 705 TND │                       │
│  │ Par personne = 705 / 2 = 352.50 TND    │                       │
│  └─────────────────────────────────────────┘                       │
│                                                                      │
│  Comparaison avec budget limite:                                    │
│  705 TND > 500 TND → "Dépasse le budget"                            │
│  Écart = 705 - 500 = 205 TND de plus                                │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ 11. Retourne BudgetCalculationResponse
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              RÉPONSE API: BudgetCalculationResponse                 │
│                                                                      │
│  {                                                                  │
│    status: "success",                                               │
│    budget_level: "medium",                                          │
│    total_budget_tnd: 705.00,                                        │
│    per_person_tnd: 352.50,                                          │
│    breakdown: {                                                     │
│      transport: 75,                                                 │
│      hebergement: 270,                                              │
│      nourriture: 180,                                               │
│      activites: 180,                                                │
│      total: 705                                                     │
│    },                                                               │
│    budget_status: "Dépasse le budget",                              │
│    budget_advice: "⚠️ Ce programme coûte 705 DT, soit...",          │
│    cancellation_probability: 0.25,                                  │
│    risk_level: "Faible"                                             │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ 12. Angular reçoit les détails
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│       BUDGET-DETAIL COMPONENT (Affichage Détaillé)                  │
│                                                                      │
│  Titre: "Détails du Budget - ⭐ Standard & Confort"                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ BUDGET TOTAL: 705 DT │ PAR PERSONNE: 352.50 DT             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Décomposition (Graphiques en barres):                              │
│                                                                      │
│  🚗 Transport:     75 DT  ████░░░░░░░░░░░░░░░░  10.6%               │
│  🏕️ Hébergement:  270 DT  ████████████░░░░░░░░  38.3%               │
│  🍽️ Nourriture:   180 DT  ██████████░░░░░░░░░░  25.5%               │
│  🎯 Activités:    180 DT  ██████████░░░░░░░░░░  25.5%               │
│                                                                      │
│  Budget Status: ⚠️ "Dépasse le budget"                              │
│                                                                      │
│  💡 Conseil:                                                        │
│  "⚠️ Ce programme coûte 705 DT, soit 205 DT de plus que prévu.     │
│   Vous pouvez réduire les activités ou augmenter votre budget."   │
│                                                                      │
│  Analyse du Risque:                                                 │
│  Niveau: 🟢 Faible                                                  │
│  Probabilité d'annulation: 25%                                      │
│                                                                      │
│  [Voir d'autres options] [Réserver ce Voyage]                       │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ 13. Utilisateur agit:
                               │  - Clique "Réserver" → Flux de réservation
                               │  - Clique "Retour" → Retour aux 3 cartes
                               │
                               ▼
                        FIN DU FLUX
```

---

## Flux de Données (Schéma)

```
┌────────────┐
│ Utilisateur│
└────────────┘
      │
      │ Frontend Form
      │
      ├──────────────────────────────────────┐
      │                                      │
      ▼                                      ▼
┌──────────────────┐            ┌──────────────────┐
│ Input Validation │            │  HTTP Service    │
└──────────────────┘            └──────────────────┘
      │                                │
      └──────────────┬──────────────────┘
                     │
                     ▼
              ┌─────────────┐
              │ FastAPI App │
              └─────────────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
    ┌────────┐ ┌──────────┐ ┌────────┐
    │ Models │ │ Scaler   │ │Database│
    └────────┘ └──────────┘ └────────┘
          │          │          │
          └──────────┼──────────┘
                     │
                     ▼
              ┌─────────────┐
              │ JSON Response
              └─────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Angular UI   │
              │ (Components) │
              └──────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Utilisateur  │
              └──────────────┘
```

---

## Éléments de Traitement (Où se passe quoi)

| Élément               | Où?      | Quand?                             |
| --------------------- | -------- | ---------------------------------- |
| Validation formulaire | Frontend | Avant de cliquer "Chercher"        |
| Normalisation texte   | Backend  | Lors de la recherche des activités |
| Clustering activités  | Backend  | Pour chaque appel API              |
| Calcul coûts          | Backend  | Pour chaque itinéraire             |
| Prédiction risque     | Backend  | Lors du calcul de budget final     |
| Affichage cartes      | Frontend | Après réception réponse API        |
| Graphiques barres     | Frontend | Lors de l'affichage du détail      |
| Cache (optionnel)     | Frontend | Entre les recherches               |
| Logs                  | Backend  | À chaque appel endpoint            |

---

**Ce diagramme montre le flux complet du système!**
