# 🎯 AI Itinerary Generation - 3 Budget Options Implementation Guide

## 📋 Overview

Your CampConnect AI now generates **3 different itineraries** for each trip, tailored to three budget levels:

- 🎒 **Budget Économique** (Low): Economy activities, lowest prices
- ⭐ **Standard & Confort** (Medium): Balanced mix of activities
- 💎 **Premium & Luxe** (High): Premium experiences, highest prices

Users can **select their preferred option** before confirming the full itinerary.

---

## 🏗️ Architecture

### Flow Diagram

```
User Views Trip
    ↓
Angular Component calls generateThreeItineraryOptions(tripId)
    ↓
Backend TripAIPredictionService.generateThreeItineraryOptions()
    ↓
Calls Python FastAPI /recommend-itinerary endpoint
    ↓
Python Service:
  - Filters activities by region & season
  - Splits by budget quartiles (Q1, Q2-Q3, Q3+)
  - Selects 2 activities/day for duration
  - Returns 3 complete itineraries
    ↓
Backend returns ItineraryOptionsResponse with 3 ItineraryOptionDto objects
    ↓
Angular displays 3 cards with costs, sample activities
    ↓
User selects one option
    ↓
Full itinerary view displays all days & activities
```

---

## 📁 Modified Files

### 1. **Python AI Service**

📍 `ai_service/app.py`

**Changes:**

- Updated `ItineraryRequest` model with optional budget parameters
- Added `ItineraryOption` and `ItineraryOptionsResponse` Pydantic models
- Enhanced `/recommend-itinerary` endpoint:
  - Calculates price quartiles (Q1, Q3)
  - Creates 3 budget-filtered datasets
  - Prioritizes clusters: cluster 2 for LOW, cluster 1 for MEDIUM, cluster 0 for HIGH
  - Returns all 3 options with total and per-person costs

**Key Code:**

```python
@app.post("/recommend-itinerary")
async def recommend_itinerary(req: ItineraryRequest):
    # Filters by region, season, and budget level
    # Returns 3 complete programs with activities
```

### 2. **Training Model**

📍 `ai_service/train_itinerary.py`

**Changes:**

- Added `LabelEncoder` for budget categories
- Includes `budget_encoded` in clustering features
- Better separation of 3 budget tiers in KMeans clustering
- Displays budget category statistics per cluster

### 3. **Java Backend - DTOs**

📍 `backend/src/main/java/com/campconnect/predict/dto/`

**New Files:**

```
ItineraryActivityDto.java       # Single activity
ItineraryDayDto.java            # Day with activities list
ItineraryOptionDto.java         # One itinerary option (LOW/MEDIUM/HIGH)
ItineraryOptionsResponse.java   # Response with 3 options
```

### 4. **Java Backend - Service**

📍 `backend/src/main/java/com/campconnect/predict/service/TripAIPredictionService.java`

**New Method:**

```java
public ItineraryOptionsResponse generateThreeItineraryOptions(Trip trip)
```

Calls Python API and returns 3 options. Includes helper methods:

- `extractRegion(Trip)` - Determines region from trip destination
- `extractSeason()` - Returns current season

### 5. **Java Backend - Controller**

📍 `backend/src/main/java/com/campconnect/predict/controller/TripAIController.java`

**New Endpoint:**

```
GET /api/trips/ai/itinerary-options/{tripId}
→ Returns ItineraryOptionsResponse
```

### 6. **Angular Service**

📍 `angular-campconnect/src/app/core/services/trip-ai.service.ts`

**New Method & Interfaces:**

```typescript
generateThreeItineraryOptions(tripId): Observable<ItineraryOptionsResponse>

// New Interfaces:
- ItineraryActivity
- ItineraryDay
- ItineraryOption
- ItineraryOptionsResponse
```

### 7. **Angular Component - TypeScript**

📍 `angular-campconnect/src/app/features/trips/trip-itinerary/trip-itinerary.component.ts`

**New State:**

```typescript
itineraryOptions: ItineraryOption[] = [];
selectedOptionId = signal<number | null>(null);
showOptions = true;
selectedItinerary: ItineraryOption | null = null;
```

**New Methods:**

```typescript
loadItinerary(); // Tries 3-options first, falls back to single
selectOption(id); // Sets selected option and displays it
confirmSelection(); // Switches from options view to itinerary view
getBudgetIcon(level); // Returns emoji for budget level
```

### 8. **Angular Component - HTML Template**

📍 `angular-campconnect/src/app/features/trips/trip-itinerary/trip-itinerary.component.html`

**New Sections:**

- Options selection grid (3 responsive columns)
- Option cards with cost breakdown
- Sample activities preview
- "Choose" / "Selected" button per option
- "Confirm & View Itinerary" button
- "Change Selection" button in itinerary view

---

## 🚀 How to Use

### For Users

1. Navigate to Trip Detail → Itinerary section
2. AI generates 3 options automatically
3. View each option's:
   - Title (Budget level with emoji)
   - Description
   - Total cost & cost per person
   - Sample activities preview
4. Click on desired option to select
5. Click "Confirm & View Itinerary"
6. Review full itinerary day-by-day
7. Use "← Change Selection" to view other options

### For Developers

**To test locally:**

```bash
# 1. Start Python AI service
cd ai_service
python train_itinerary.py  # Train model
python app.py              # Start FastAPI on :5000

# 2. Start Java backend
cd backend
mvn spring-boot:run        # Port 8080

# 3. Start Angular frontend
cd angular-campconnect
ng serve                   # Port 4200
```

**Test endpoint directly:**

```bash
curl -X GET "http://localhost:8080/api/trips/ai/itinerary-options/{tripId}"
```

---

## 📊 Data Flow Details

### Budget Categorization

The system uses **price quartiles** to separate budgets:

| Budget Level | Price Range                  | Emoji | Activities                |
| ------------ | ---------------------------- | ----- | ------------------------- |
| **LOW**      | 0 - Q1 (25th percentile)     | 🎒    | Affordable, local, nature |
| **MEDIUM**   | Q1 - Q3 (25-75th percentile) | ⭐    | Balanced mix              |
| **HIGH**     | Q3+ (top 25%)                | 💎    | Premium, exclusive        |

**Example with 100 DT average activity:**

- LOW: 0-20 DT activities
- MEDIUM: 20-80 DT activities
- HIGH: 80+ DT activities

### Activity Selection Process

For each budget level:

1. Filter activities by region (if provided)
2. Filter by season (include "Toute l'année")
3. Calculate price quartiles
4. Filter by budget range
5. Prioritize corresponding cluster (0=HIGH, 1=MEDIUM, 2=LOW)
6. Sample 2 activities per day × duration days
7. Calculate total cost & per-person average

---

## 🔧 Configuration & Customization

### Change Budget Labels

Edit `app.py` line ~330:

```python
budget_levels = [
    {
        "level": "low",
        "label": "🎒 Budget Économique",  # Customize text/emoji
        "description": "Activités économiques...",
        ...
```

### Adjust Activities Per Day

Edit `app.py` line ~365:

```python
total_needed = max(req.duration_days * 2, 2)  # Change "* 2" to desired ratio
```

### Change Price Filtering

Edit `app.py` lines ~348-355:

```python
"price_filter": lambda df: df[df['price_tnd'] <= q1]  # Modify quartile logic
```

---

## 🐛 Troubleshooting

### "Modèle d'itinéraire non chargé"

**Issue:** Python AI service model not loaded
**Solution:**

```bash
cd ai_service
python train_itinerary.py
```

### "Service FastAPI AI n'est pas lancé"

**Issue:** Backend can't reach Python service
**Solution:**

```bash
# Check Python service is running on port 5000
curl http://localhost:5000/health

# If not running:
cd ai_service
python app.py
```

### Empty options returned

**Issue:** No activities match region/season filters
**Solution:**

- Verify dataset file exists: `C:\Users\lenovo\Downloads\dataset_clean.xlsx`
- Check region name matches dataset values
- Ensure season is valid (Hiver, Printemps, Été, Automne)

### Slow response time

**Issue:** Python service taking long to process
**Solution:**

- Increase `duration_days` filter (smaller = faster)
- Check dataset file size
- Monitor Python process resources

---

## ✅ Testing Checklist

- [ ] Python service returns 3 options with correct budget labels
- [ ] Options have different total costs (LOW < MEDIUM < HIGH)
- [ ] Per-person costs are calculated correctly
- [ ] Angular component displays 3 cards
- [ ] Selection UI updates on click
- [ ] Selected option shows full itinerary
- [ ] Activities have correct prices, durations, types
- [ ] "Change Selection" button works
- [ ] Cost breakdown matches selected option
- [ ] Mobile responsive (1 column on small screens)

---

## 📝 Future Enhancements

1. **Save Selection**
   - Store selected budget level to database
   - Reuse preference for next trips

2. **Regenerate Options**
   - Button to get 3 new options
   - Shuffle activities while maintaining budget

3. **Custom Budgets**
   - Allow users to set total budget
   - Filter options within their budget

4. **AI Feedback Loop**
   - Rate itinerary quality
   - Improve clustering based on feedback

5. **Export Options**
   - PDF download of all 3 options
   - Share comparison with group

---

## 📞 Support

For issues or questions:

1. Check Python service logs: `tail -f logs/app.log`
2. Check backend logs: `tail -f logs/application.log`
3. Browser console for Angular errors: F12 → Console tab
4. Test API directly with Postman/cURL
