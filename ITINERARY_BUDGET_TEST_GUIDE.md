# 🧪 Guide de Test Rapide: Itinéraires & Budget

## Prérequis

- Service Python AI (localhost:5000) démarré
- Application Angular compilée et servie
- Utilisateur authentifié

## Test 1: Lancer le Service Python

```bash
cd ai_service
python app.py
```

Vérifier la réponse:

```bash
curl http://localhost:5000/health
```

Réponse attendue:

```json
{
  "status": "healthy",
  "framework": "FastAPI",
  "models_loaded": {
    "budget": true,
    "risk": true,
    "itinerary": true
  }
}
```

## Test 2: Récupérer les 3 Itinéraires

**Endpoint:** `POST /recommend-itinerary`

```bash
curl -X POST http://localhost:5000/recommend-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Bizerte",
    "season": "Été",
    "duration_days": 3,
    "total_budget_tnd": 500,
    "num_people": 2,
    "distance_km": 150
  }'
```

Réponse attendue: 3 programmes avec décomposition de budget

## Test 3: Calculer le Budget pour un Itinéraire

**Endpoint:** `POST /calculate-budget-for-itinerary`

```bash
curl -X POST http://localhost:5000/calculate-budget-for-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Bizerte",
    "season": "Été",
    "duration_days": 3,
    "budget_level": "medium",
    "num_people": 2,
    "distance_km": 150,
    "user_proposed_budget_tnd": 500
  }'
```

Réponse attendue: Budget détaillé avec breakdown et conseil

## Test 4: Via l'Interface Angular

1. Aller à: `http://localhost:4200/itinerary-planner`
2. Remplir le formulaire:
   - Destination: "Bizerte"
   - Saison: "Été"
   - Durée: 3 jours
   - Personnes: 2
3. Cocher "J'ai un budget limite" et entrer 500 DT
4. Cliquer "Chercher"
5. Voir les 3 cartes d'itinéraires
6. Cliquer sur une carte pour voir le détail du budget
7. Analyser la décomposition et les risques

## Cas de Test

### Cas 1: Budget Économique

- Région: "Hammamet"
- Saison: "Printemps"
- Durée: 2 jours
- Personnes: 1
- Budget limite: 200 DT

**Attendu:** Option "Budget Économique" < 200 DT

### Cas 2: Option Premium

- Région: "Tozeur"
- Saison: "Été"
- Durée: 5 jours
- Personnes: 4
- Budget limite: None

**Attendu:** Option "Premium" avec activités haut de gamme

### Cas 3: Budget Serré

- Région: "Tunis"
- Saison: "Hiver"
- Durée: 3 jours
- Personnes: 3
- Budget limite: 300 DT

**Attendu:** Options "Dépasse le budget" avec avertissement

## Vérifications

- [ ] Les 3 itinéraires s'affichent correctement
- [ ] Les prix sont réalistes
- [ ] La décomposition est correcte (total = sum des catégories)
- [ ] Le status budget change selon le budget limite
- [ ] L'analyse de risque s'affiche
- [ ] Les transitions entre les composants fonctionnent
- [ ] Les messages d'erreur s'affichent correctement
- [ ] Le chargement se termine après ~2-3 secondes

## Points à Valider

✅ Endpoint `/recommend-itinerary` retourne 3 programmes
✅ Endpoint `/calculate-budget-for-itinerary` retourne un budget détaillé
✅ Service Angular `ItineraryService` appelle correctement les API
✅ Composant principal affiche le formulaire de recherche
✅ Composant cards affiche les 3 itinéraires
✅ Composant budget-detail affiche la décomposition
✅ Route `/itinerary-planner` fonctionne
✅ Authentification requise sur la route

## Logs à Vérifier

**Backend Python:**

```
INFO:     Application startup complete
Itinerary model loaded and normalized
...
POST /recommend-itinerary
POST /calculate-budget-for-itinerary
```

**Frontend Angular:**

```
AI Service Health: {status: 'healthy', ...}
[ITINERARY_PLANNER] Search initiated
[ITINERARY_PLANNER] Itineraries loaded
[ITINERARY_PLANNER] Budget calculated
```

---

**Tous les tests devraient passer sans erreurs! ✅**
