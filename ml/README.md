# CampConnect Demand Forecaster ML Service

This service provides AI-powered demand forecasting and smart recommendations for campsites based on region, season, and historical data.

## Files

| File | Description |
|------|-------------|
| `app.py` | Main Flask application exposing `/forecast` and `/health` endpoints |
| `requirements.txt` | Python dependencies required to run the service |
| `demand_model.pkl` | Trained Random Forest Classifier model |
| `le_*.pkl` | Scikit-learn LabelEncoders for categorical features |
| `postman_tests.json` | Postman collection for testing endpoints |

## Setup and Running

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Flask application:**
   ```bash
   python app.py
   ```
   The service will run on `http://localhost:5000`.

## Endpoints

### 1. Health Check
`GET /health`
Returns `{"status": "ok"}` if the service is running.

### 2. Demand Forecast
`POST /forecast`
Predicts the demand level for a list of campsites.

**Input Field Table:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `campsites` | Array | List of campsite objects | `[ {...} ]` |
| `target_month` | Integer | Month to forecast (1-12) | `7` |
| `campsite.id` | String | Unique campsite ID | `"abc123"` |
| `campsite.name` | String | Campsite name | `"Camp Tabarka Nature"` |
| `campsite.region` | String | Campsite location/region | `"Tabarka"` |
| `campsite.capacity` | Integer | Maximum capacity | `40` |
| `campsite.price_per_night` | Float | Price in TND | `75.0` |
| `campsite.activity` | String | Main activity | `"Randonnée"` |
| `campsite.customer_type`| String | Target customer type | `"Famille"` |
| `campsite.rating` | Float | Average rating | `4.5` |

**Output Field Table:**

| Field | Description |
|-------|-------------|
| `demand_level` | The predicted demand: `HIGH`, `MEDIUM`, or `LOW` |
| `demand_score` | Confidence score (probability) of the `HIGH` demand class (0.0 to 1.0) |
| `probabilities` | Object containing probabilities for all three classes (`HIGH`, `MEDIUM`, `LOW`) |
| `pricing_recommendation` | Advice on adjusting prices based on the predicted demand level |
| `weather_advice` | Region and season-specific weather preparations |
| `staffing_recommendation`| Advice on staffing and logistics levels |
| `activity_suggestions` | Array of suggested activities suitable for the season |

**Demand Levels Explained:**
- **LOW:** The model predicts low occupancy. Recommends promotions and cost reductions.
- **MEDIUM:** The model predicts moderate occupancy. Recommends maintaining standard operations.
- **HIGH:** The model predicts high occupancy. Recommends price increases and staff reinforcement.

## How the Model Works

The `demand_model.pkl` is a Random Forest Classifier trained on a dataset of 3,000 Tunisian campsite observations. It uses 24 distinct features (including trigonometric encodings for months, label-encoded regions and activities, and derived operational metrics) to classify demand into 3 discrete classes (HIGH, MEDIUM, LOW).

## Architecture Flow

Angular (Port 4200) → Spring Boot (Port 8090) → Flask (Port 5000) → `demand_model.pkl`

## Demo Day Startup Order

Run these commands in separate terminal windows:

**1. Start ML Service (Port 5000)**
```bash
cd ml
pip install -r requirements.txt
python app.py
```

**2. Start Spring Boot Backend (Port 8090)**
```bash
cd backend
mvn spring-boot:run
```

**3. Start Angular Frontend (Port 4200)**
```bash
cd angular-campconnect
npm install
npm start
```
