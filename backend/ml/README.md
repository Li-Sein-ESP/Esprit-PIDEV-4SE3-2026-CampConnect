# AI Moderation (Image + Text)

This folder contains the Python ML pipeline used by backend moderation.

## 1) Install Python dependencies

From `backend/`:

```bash
pip install -r ml/requirements.txt
```

## 2) Train model from your dataset

Default dataset configured in backend properties:

`C:/Users/marye/Downloads/datasets_clean`

Manual training command:

```bash
python ml/moderation/predict_moderation.py train \
  --dataset-dir "C:/Users/marye/Downloads/datasets_clean" \
  --model-path "ml/models/image_safety_model.pkl"
```

## 3) Predict one image manually

```bash
python ml/moderation/predict_moderation.py predict \
  --image-path "backend/uploads/example.jpg" \
  --model-path "ml/models/image_safety_model.pkl" \
  --dataset-dir "C:/Users/marye/Downloads/datasets_clean" \
  --text "this post contains dangerous weapon"
```

## 4) Backend integration

- `POST /api/posts` runs moderation automatically on uploaded image URLs.
- Moderation records are stored in `post_moderation_records`.
- Pending records can be reviewed by admin:
  - `GET /api/admin/community/moderation/pending-posts`
  - `PUT /api/admin/community/moderation/records/{id}/approve`
  - `PUT /api/admin/community/moderation/records/{id}/reject`
- Train model from admin endpoint:
  - `POST /api/admin/community/moderation/train-model`

## 5) Decision logic

- `ALLOW`: score < review threshold
- `REVIEW`: review threshold <= score < block threshold
- `BLOCK`: score >= block threshold

Thresholds are configurable in `application.properties`.
