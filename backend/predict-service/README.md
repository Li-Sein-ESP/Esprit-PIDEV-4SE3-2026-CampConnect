Predict service for CampConnect

Setup (venv recommended):

python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

Train models (if not automatically created):
python train.py

Run service:
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

Endpoints:

- POST /predict/budget (body: {"trip": { ... }})
- POST /predict/delay (body: {"transport": { ... }})

The Java backend `PredictionController` can call http://localhost:8000/predict/budget and /predict/delay.
