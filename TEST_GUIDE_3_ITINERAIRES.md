# 🧪 Guide de Test - Système d'Itinéraires à 3 Options

## 🎯 Objectif du Test

Vérifier que le système génère correctement 3 itinéraires avec 3 niveaux de budget différents et que l'utilisateur peut les sélectionner.

---

## 📋 Checklist de Test

### Phase 1 : Services Démarrés ✓

- [ ] Service Python FastAPI lancé sur `http://localhost:5000`

  ```bash
  python app.py
  # Vérifier: Affiche "Starting AI SERVICE (FastAPI) - CAMPCONNECT"
  ```

- [ ] Backend Spring Boot lancé sur `http://localhost:8080`

  ```bash
  mvn spring-boot:run
  # Vérifier: Affiche "Started Application"
  ```

- [ ] Angular Frontend lancé sur `http://localhost:4200`
  ```bash
  ng serve
  # Vérifier: "✔ Compiled successfully"
  ```

### Phase 2 : Santé des Services ✓

- [ ] Python Health Check

  ```bash
  curl http://localhost:5000/health
  # Réponse attendue:
  # {
  #   "status": "healthy",
  #   "models_loaded": {
  #     "itinerary": true
  #   }
  # }
  ```

- [ ] Backend Health Check
  ```bash
  curl http://localhost:8080/actuator/health
  # Réponse: {"status":"UP"}
  ```

### Phase 3 : Test du Modèle Python ✓

- [ ] Formation du modèle complétée

  ```bash
  cd ai_service
  python train_itinerary.py
  # Vérifier output:
  # "Loading dataset from C:\Users\lenovo\Downloads\dataset_clean.xlsx..."
  # "Clustering activities into 3 budget-based styles..."
  # "Cluster 0: Avg Price=... (HIGH budget)"
  # "Cluster 1: Avg Price=... (MEDIUM budget)"
  # "Cluster 2: Avg Price=... (LOW budget)"
  ```

- [ ] Fichier du modèle créé
  ```bash
  ls ai_service/models/itinerary_model.pkl
  # Doit exister
  ```

### Phase 4 : Test Direct Python API ✓

- [ ] Requête POST vers endpoint itinéraire

  ```bash
  curl -X POST http://localhost:5000/recommend-itinerary \
    -H "Content-Type: application/json" \
    -d '{
      "region": "Bizerte",
      "season": "Été",
      "duration_days": 3,
      "total_budget_tnd": 1350,
      "num_people": 3
    }'
  ```

- [ ] Vérifier la réponse:
  - Status: "success"
  - 3 programs dans la liste
  - Chaque program a:
    - programId: 1, 2, 3
    - budget_level: "low", "medium", "high"
    - title avec emoji: 🎒, ⭐, 💎
    - totalEstimatedCostTnd: chiffre positif
    - averagePerPersonTnd: calculé
    - days: tableau avec jours

### Phase 5 : Test Backend API ✓

- [ ] Endpoint du backend (besoin d'un tripId valide)

  ```bash
  curl http://localhost:8080/api/trips/ai/itinerary-options/TRIP_ID_123
  ```

- [ ] Réponse doit avoir structure ItineraryOptionsResponse

### Phase 6 : Interface Angular ✓

- [ ] Naviguer vers une page de trip
  - URL: `http://localhost:4200/trips/TRIP_ID/itinerary`
  - Doit voir le message "Generating 3 custom itinerary options..."

- [ ] Attendre le chargement (max 10 secondes)
  - Une animation de chargement doit s'afficher
  - Le spinner doit tourner

- [ ] Vue des 3 options s'affiche
  - 3 cartes visibles en grille (3 colonnes sur desktop)
  - Chaque carte montre:
    - Emoji du budget (🎒 / ⭐ / 💎)
    - Titre (Budget Économique / Standard & Confort / Premium & Luxe)
    - Description
    - Coût total en DT
    - Coût par personne en DT
    - Nombre de jours d'activités
    - Bouton "Choose" / "Selected"

### Phase 7 : Interaction & Sélection ✓

- [ ] Cliquer sur première option (Budget Économique)
  - Carte doit passer au fond violet
  - Bouton doit afficher "✓ Selected"
  - Les 2 autres restent normales

- [ ] Cliquer sur deuxième option (Standard)
  - Première revient à l'état normal
  - Deuxième passe au violet
  - Bouton affiche "✓ Selected"

- [ ] Cliquer sur troisième option (Premium)
  - Deuxième revient à l'état normal
  - Troisième passe au violet
  - Bouton affiche "✓ Selected"

### Phase 8 : Confirmation & Itinéraire ✓

- [ ] Cliquer "Confirm & View Itinerary"
  - Vue des options disparaît
  - Itinéraire complet s'affiche
  - Montre "← Change Selection" en haut
  - Affiche le titre de l'option sélectionnée
  - Montre le coût total

- [ ] Vérifier l'itinéraire affiche:
  - Jours numérotés (Jour 1, Jour 2, etc.)
  - Pour chaque jour:
    - Titre du jour
    - Liste des activités
    - Pour chaque activité:
      - Nom
      - Description
      - Durée (ex: "2h")
      - Prix (ex: "30 DT" ou "Gratuit")
      - Type d'activité

### Phase 9 : Changement de Sélection ✓

- [ ] Cliquer "← Change Selection"
  - Retour à la vue des 3 options
  - L'option précédemment sélectionnée reste sélectionnée
  - Bouton "Confirm & View Itinerary" toujours actif

- [ ] Sélectionner une autre option
  - Mise en avant immédiate
  - Les jours du nouvel itinéraire disparaissent
  - Cliquer confirmer pour afficher le nouvel itinéraire

### Phase 10 : Vérifications de Budget ✓

- [ ] Budget Économique (🎒)
  - Coût total < Coût Standard
  - Prix des activités bas
  - Activités: randonnées, visites culturelles gratuites

- [ ] Standard & Confort (⭐)
  - Coût total entre LOW et HIGH
  - Prix moyens
  - Mix d'activités variées

- [ ] Premium & Luxe (💎)
  - Coût total > autres options
  - Prix des activités élevés
  - Activités: excursions guidées, restaurants gastronomiques

### Phase 11 : Test de Responsive ✓

- [ ] Sur écran large (1920px)
  - 3 cartes côte à côte
  - Layout parfait

- [ ] Sur tablette (768px)
  - Cartes restent bien alignées
  - Responsive grid fonctionne

- [ ] Sur mobile (375px)
  - 1 carte par ligne
  - Cartes prennent toute la largeur
  - Boutons cliquables

### Phase 12 : Test d'Erreur & Edge Cases ✓

- [ ] Trip sans destination
  - Doit afficher "Generating..."
  - Ou message d'erreur approprié

- [ ] Pas de données pour la région
  - Fallback: utiliser toutes les données
  - Afficher toujours 3 options

- [ ] Dataset vide ou manquant
  - Message d'erreur: "Modèle d'itinéraire non chargé"

- [ ] Fermer navigateur et revenir
  - Charger trip → réappeler le service
  - Doit fonctionner normalement

---

## 📊 Test de Performance

### Temps de Réponse

- [ ] Réponse Python: < 2 secondes

  ```bash
  time curl -X POST http://localhost:5000/recommend-itinerary \
    -H "Content-Type: application/json" \
    -d '{"region":"Bizerte","season":"Été","duration_days":3,...}'
  ```

- [ ] Réponse Backend: < 5 secondes

- [ ] Affichage Angular: < 1 seconde

### Mémoire

- [ ] Python service: < 500MB RAM
- [ ] Backend: < 1GB RAM
- [ ] Angular: < 300MB RAM

---

## 🐛 Débogage Si Problèmes

### Problème: "Modèle d'itinéraire non chargé"

```bash
# Solution:
cd ai_service
python train_itinerary.py
python app.py
```

### Problème: Aucune option ne s'affiche

```bash
# Vérifier:
curl http://localhost:5000/health
# Si itinerary: false, relancer train_itinerary.py
```

### Problème: Cartes ne répondent pas au clic

```
# Vérifier console du navigateur:
F12 → Console
# Chercher les erreurs
```

### Problème: Coûts incorrects

```bash
# Vérifier le fichier Excel:
# C:\Users\lenovo\Downloads\dataset_clean.xlsx
# Colonnes: Prix (TND), Catégorie_budget
```

### Problème: Mauvaise région

```
# Vérifier mapping dans Java:
# backend/.../TripAIPredictionService.java
# Ligne: extractRegion() method
```

---

## 📸 Captures d'Écran Attendues

### État 1: Chargement

```
┌─────────────────────────────────┐
│     🌀 GENERATING...            │
│  AI is analyzing 3 options      │
└─────────────────────────────────┘
```

### État 2: 3 Options (Desktop)

```
┌────────────┬────────────┬────────────┐
│ 🎒 Low    │ ⭐ Medium │ 💎 High   │
│ 250 DT    │ 450 DT    │ 750 DT    │
│ [Choose] │ [Choose] │ [Choose] │
└────────────┴────────────┴────────────┘
```

### État 3: Itinéraire Affiché

```
← Change Selection          ⭐ 450 DT
═════════════════════════════════════
DAY 1 - Arrivée
  ☑ Activité 1 - 30 DT
  ☑ Activité 2 - Gratuit
═════════════════════════════════════
DAY 2 - Découverte
  ☑ Activité 1 - 25 DT
  ☑ Activité 2 - 20 DT
```

---

## ✅ Sign-Off

Quand tous les tests passent:

- [ ] Test complet = ✅ SUCCÈS
- [ ] Documenter tout problème trouvé
- [ ] Marquer comme "Ready for Production"

**Date de test:** ****\_\_\_****
**Testeur:** ****\_\_\_****
**Résultat:** ✅ PASS / ❌ FAIL
