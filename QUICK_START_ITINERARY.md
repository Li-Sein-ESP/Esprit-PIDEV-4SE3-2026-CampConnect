# 🚀 Guide de Démarrage Rapide

## 1️⃣ Lancer le Service AI Python

```bash
cd ai_service
python app.py
```

✅ Le service démarre sur `http://localhost:5000`

Vérifier avec:

```bash
curl http://localhost:5000/health
```

---

## 2️⃣ Compiler et Lancer Angular

```bash
cd angular-campconnect
ng serve
```

✅ L'application démarre sur `http://localhost:4200`

---

## 3️⃣ Accéder au Planificateur d'Itinéraires

1. Aller à: **`http://localhost:4200/itinerary-planner`**
2. S'authentifier si nécessaire
3. Remplir le formulaire:
   - **Destination:** Bizerte
   - **Saison:** Été
   - **Durée:** 3 jours
   - **Personnes:** 2
   - **Budget max:** 500 DT (optionnel)
4. Cliquer **"Chercher"**

---

## 4️⃣ Tester les Fonctionnalités

### Voir 3 Itinéraires

```
L'API retourne 3 cartes:
🎒 Budget Économique (~350 DT)
⭐ Standard & Confort (~550 DT)
💎 Premium & Aventure (~850 DT)
```

### Voir le Détail du Budget

```
Cliquer sur une carte → L'API calcule le budget détaillé
Affiche:
- Décomposition (Transport/Hébergement/Nourriture/Activités)
- Graphiques en barres
- Conseil personnalisé
- Analyse de risque (% annulation)
```

---

## 📝 Endpoints de Test

### 1. Récupérer 3 Itinéraires

```bash
curl -X POST http://localhost:5000/recommend-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Bizerte",
    "season": "Été",
    "duration_days": 3,
    "num_people": 2,
    "distance_km": 150,
    "total_budget_tnd": 500
  }'
```

### 2. Calculer le Budget Détaillé

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

### 3. Vérifier la Santé du Service

```bash
curl http://localhost:5000/health
```

---

## 🧪 Cas de Test Rapides

### Test 1: Budget Serré ⚠️

```json
{
  "region": "Tunis",
  "season": "Hiver",
  "duration_days": 3,
  "num_people": 1,
  "total_budget_tnd": 200
}
```

**Attendu:** Options "Dépasse le budget" avec avertissement

### Test 2: Groupe Nombreux 👥

```json
{
  "region": "Tozeur",
  "season": "Printemps",
  "duration_days": 5,
  "num_people": 8,
  "total_budget_tnd": 2000
}
```

**Attendu:** Budget réparti entre 8 personnes

### Test 3: Budget Illimité 💰

```json
{
  "region": "Hammamet",
  "season": "Été",
  "duration_days": 7,
  "num_people": 4
}
```

**Attendu:** Option Premium sélectionnée par défaut

---

## 🔍 Points de Vérification

### Backend ✅

- [ ] Modèles Pydantic compilent sans erreur
- [ ] Endpoints retournent les données attendues
- [ ] Calculs de budget sont corrects
- [ ] Risque prédit correctement

### Frontend ✅

- [ ] Formulaire s'affiche correctement
- [ ] 3 cartes s'affichent après recherche
- [ ] Clic sur une carte affiche le détail
- [ ] Graphiques se rendent correctement
- [ ] Pas d'erreurs dans la console

### Intégration ✅

- [ ] Service Angular appelle correctement les APIs
- [ ] Authentification fonctionne
- [ ] Route `/itinerary-planner` est accessible
- [ ] Authentification requise (@AuthGuard)

---

## 🆘 Dépannage

### Service Python ne démarre pas

```
Erreur: "Address already in use"
Solution: Le port 5000 est utilisé
Commande: lsof -i :5000  (puis kill le processus)
```

### Modèle d'itinéraire introuvable

```
Erreur: "models/itinerary_model.pkl not found"
Solution: Réentraîner le modèle
Commande: python train_itinerary.py
```

### CORS Error dans Angular

```
Erreur: "No 'Access-Control-Allow-Origin'"
Solution: Backend FastAPI a déjà CORS configuré
Vérifier: Les deux services sont bien lancés
```

### Route inaccessible

```
Erreur: "Cannot match any routes"
Solution: L'authentification est requise
Vérifier: Vous êtes connecté avec un compte valide
```

---

## 📚 Documentation Complète

- **Guide complet:** `ITINERARY_BUDGET_IMPLEMENTATION_GUIDE.md`
- **Guide de test:** `ITINERARY_BUDGET_TEST_GUIDE.md`
- **Résumé exécutif:** `ITINERARY_BUDGET_QUICK_SUMMARY.md`

---

## ⏱️ Temps de Démarrage Estimé

| Étape                    | Temps            |
| ------------------------ | ---------------- |
| Lancer le service Python | 5 sec            |
| Compiler Angular         | 30 sec           |
| Accéder à la page        | 2 sec            |
| Effectuer une recherche  | 2-3 sec          |
| Voir le détail du budget | 1-2 sec          |
| **Total**                | **~45 secondes** |

---

## 🎯 Commandes Complètes (Copy-Paste)

### Terminal 1: Backend

```bash
cd ai_service
python app.py
```

### Terminal 2: Frontend

```bash
cd angular-campconnect
npm install  # si besoin
ng serve --open
```

### Browser

```
http://localhost:4200/itinerary-planner
```

**Et c'est tout! Vous êtes prêt à tester! 🚀**

---

**Questions? Consultez les guides dans le dossier principal!**
