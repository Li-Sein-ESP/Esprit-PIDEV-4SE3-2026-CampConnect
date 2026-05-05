# 📋 Guide d'Intégration : Système d'Itinéraires & Budget AI

## Vue d'ensemble

Cette implémentation ajoute un système intelligentd'itinéraires avec calcul de budget basé sur l'IA à CampConnect. Les utilisateurs peuvent:

1. **Chercher des itinéraires** - Spécifier une destination, saison, durée et nombre de personnes
2. **Découvrir 3 options** - L'IA propose 3 itinéraires différents (Budget, Standard, Premium)
3. **Calculer le budget** - Pour chaque option, le budget détaillé est calculé
4. **Analyser les risques** - Le système évalue la probabilité d'annulation du voyage

## Architecture

### Backend (Python FastAPI)

#### Fichier: `ai_service/app.py`

**Nouveaux Modèles Pydantic:**

- `SelectedItineraryRequest` - Paramètres pour le calcul de budget
- `BudgetBreakdown` - Décomposition du budget (transport, hébergement, nourriture, activités)
- `BudgetCalculationResponse` - Réponse du calcul avec conseils et risques

**Nouveaux Endpoints:**

1. `/recommend-itinerary` (POST) - Retourne 3 itinéraires proposés
   - Input: `ItineraryRequest` (région, saison, durée, budget)
   - Output: `ItineraryResponse` avec 3 programmes détaillés

2. `/calculate-budget-for-itinerary` (POST) - Calcule le budget pour l'itinéraire choisi
   - Input: `SelectedItineraryRequest` (itinéraire choisi + détails)
   - Output: `BudgetCalculationResponse` avec décomposition et conseils

**Flux de Calcul:**

```
Entrée utilisateur (destination, saison, durée, personnes)
    ↓
Filtrage des activités par région et saison
    ↓
Clustering des activités en 3 niveaux de budget (K-means)
    ↓
Génération de 3 programmes d'itinéraires
    ↓
Calcul des coûts (transport, hébergement, nourriture, activités)
    ↓
Prédiction du risque (modèle ML)
    ↓
Retour des 3 options avec budget détaillé
```

### Frontend (Angular)

#### Structure: `angular-campconnect/src/app/features/itinerary/`

```
itinerary/
├── models/
│   ├── itinerary.models.ts       # Interfaces TypeScript
│   └── index.ts
├── services/
│   ├── itinerary.service.ts      # Appel API au service Python
│   └── index.ts
├── components/
│   ├── itinerary-planner.component.ts       # Composant principal
│   ├── itinerary-cards/
│   │   └── itinerary-cards.component.ts     # Affichage des 3 options
│   ├── budget-detail/
│   │   └── budget-detail.component.ts       # Détail du budget sélectionné
│   └── index.ts
└── index.ts
```

#### Composants:

1. **ItineraryPlannerComponent** (Principal)
   - Formulaire de recherche (destination, saison, durée, personnes, budget limit optionnel)
   - Gère la logique de recherche et sélection
   - Affiche les résultats ou les détails du budget

2. **ItineraryCardsComponent**
   - Affiche les 3 itinéraires proposés sous forme de cartes
   - Chaque carte montre: titre, prix, décomposition, status budget
   - Cliquable pour voir le détail du budget

3. **BudgetDetailComponent**
   - Affiche la décomposition détaillée du budget
   - Graphiques en barres pour chaque catégorie
   - Analyse du risque et probabilité d'annulation
   - Boutons d'action (retour, réserver)

## Utilisation

### Pour les Utilisateurs

1. **Accéder à la page:**
   - URL: `/itinerary-planner`
   - Requires: Authentification (`@AuthGuard`)

2. **Rechercher des itinéraires:**

   ```
   1. Entrer destination (ex: "Bizerte")
   2. Sélectionner saison
   3. Spécifier durée en jours
   4. Entrer nombre de personnes
   5. Optionnel: Ajouter limite de budget
   6. Cliquer "Chercher"
   ```

3. **Sélectionner un itinéraire:**
   - Cliquer sur "Voir le Détail du Budget" sur une carte
   - Le système calcule automatiquement le budget complet

4. **Analyser le budget:**
   - Voir la décomposition en 4 catégories
   - Vérifier le status budget (dans/dépasse)
   - Consulter l'analyse de risque
   - Cliquer "Réserver ce Voyage" pour continuer

### Pour les Développeurs

#### Installation et Configuration

1. **Assurer que le service Python est lancé:**

   ```bash
   cd ai_service
   python app.py
   # Service disponible sur http://localhost:5000
   ```

2. **Importer le service dans un autre composant:**

   ```typescript
   import { ItineraryService } from './features/itinerary/services/itinerary.service';

   constructor(private itineraryService: ItineraryService) {}
   ```

3. **Exemple d'utilisation:**

   ```typescript
   // Rechercher des itinéraires
   const request: ItineraryRequest = {
     region: "Bizerte",
     season: "Été",
     duration_days: 3,
     num_people: 2,
     distance_km: 150,
   };

   this.itineraryService.getRecommendedItineraries(request).subscribe({
     next: (response) => console.log(response),
     error: (err) => console.error(err),
   });

   // Calculer le budget pour un itinéraire
   const budgetRequest: SelectedItineraryRequest = {
     region: "Bizerte",
     season: "Été",
     duration_days: 3,
     budget_level: "medium",
     num_people: 2,
     user_proposed_budget_tnd: 500,
   };

   this.itineraryService.calculateBudgetForItinerary(budgetRequest).subscribe({
     next: (response) => console.log(response),
     error: (err) => console.error(err),
   });
   ```

## Modèles de Réponse

### ItineraryResponse

```typescript
{
  status: "success",
  region: "Bizerte",
  duration_days: 3,
  user_limit_tnd: 500,
  programs: [
    {
      program_id: 1,
      title: "🎒 Budget Économique (Optimisé)",
      budget_level: "low",
      description: "Priorité aux activités gratuites et locales",
      total_estimated_cost_tnd: 450,
      average_per_person_tnd: 225,
      budget_status: "Dans le budget",
      breakdown: {
        transport: 75,
        hebergement: 180,
        nourriture: 135,
        activites: 60
      },
      days: [
        {
          day: 1,
          title: "Jour 1: Plage de Raf Raf + Repos",
          camping_site: "Camping Nord",
          activities: [...]
        }
      ]
    },
    // ... 2 autres options (medium, high)
  ]
}
```

### BudgetCalculationResponse

```typescript
{
  status: "success",
  budget_level: "medium",
  total_budget_tnd: 650.50,
  per_person_tnd: 325.25,
  breakdown: {
    transport: 75,
    hebergement: 270,
    nourriture: 180,
    activites: 125.50,
    total: 650.50
  },
  budget_status: "Dépasse le budget",
  budget_advice: "⚠️ Ce programme coûte 650 DT, soit 150 DT de plus que prévu.",
  cancellation_probability: 0.25,
  risk_level: "Faible",
  timestamp: "2026-05-02T14:30:00"
}
```

## Configuration de l'URL du Service

Le service Python est configuré sur `http://localhost:5000` dans le `ItineraryService`.

Pour changer cette URL en production:

```typescript
// Dans itinerary.service.ts
private aiServiceUrl = 'https://api.campconnect.com/ai'; // URL de production
```

## Intégration avec le Menu de Navigation

Pour ajouter un lien dans le menu:

```html
<a routerLink="/itinerary-planner" routerLinkActive="active">
  🗺️ Planificateur d'Itinéraires
</a>
```

## Points d'Amélioration Futurs

1. **Sauvegarde des itinéraires** - Permettre aux utilisateurs de sauvegarder leurs itinéraires favoris
2. **Partage en groupe** - Partager un itinéraire avec les membres du groupe
3. **Intégration avec les réservations** - Lier directement aux réservations d'hébergement
4. **Recommandations personnalisées** - Basées sur l'historique de l'utilisateur
5. **Données en temps réel** - Intégrer les prix actuels des hébergements et activités
6. **Mode hors ligne** - Télécharger les itinéraires pour consultation hors ligne
7. **Intégration GPS** - Navigation guidée pendant le voyage

## Dépannage

### Service Python non disponible

- Vérifier que le service est lancé: `python ai_service/app.py`
- Vérifier le port 5000 n'est pas déjà utilisé
- Consulter les logs du service

### Modèle d'itinéraire non chargé

- S'assurer que `models/itinerary_model.pkl` existe
- Relancer l'entraînement: `python train_itinerary.py`
- Redémarrer le service

### CORS Error

- Vérifier la configuration CORS dans `app.py`
- Ajouter le domaine Angular à la liste des origins autorisées

## Fichiers Modifiés/Créés

✅ `ai_service/app.py` - Ajout des modèles et endpoints
✅ `angular-campconnect/src/app/app.routes.ts` - Ajout de la route
✅ `angular-campconnect/src/app/features/itinerary/` - Toute la feature
✅ `angular-campconnect/src/app/features/itinerary/models/itinerary.models.ts`
✅ `angular-campconnect/src/app/features/itinerary/services/itinerary.service.ts`
✅ `angular-campconnect/src/app/features/itinerary/components/itinerary-planner.component.ts`
✅ `angular-campconnect/src/app/features/itinerary/components/itinerary-cards/itinerary-cards.component.ts`
✅ `angular-campconnect/src/app/features/itinerary/components/budget-detail/budget-detail.component.ts`

---

**Implémentation complète et prête pour la production! 🚀**
