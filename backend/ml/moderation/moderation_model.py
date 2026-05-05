import json
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Sequence, Tuple

import joblib
import numpy as np
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


@dataclass
class DatasetSplit:
    safe_images: List[Path]
    unsafe_images: List[Path]


def _iter_images(base_dir: Path) -> Iterable[Path]:
    if not base_dir.exists():
        return
    for root, _, files in os.walk(base_dir):
        for file_name in files:
            ext = Path(file_name).suffix.lower()
            if ext in IMAGE_EXTENSIONS:
                yield Path(root) / file_name


def discover_dataset(dataset_dir: Path) -> DatasetSplit:
    safe_dirs = [
        dataset_dir / "emotions" / "train" / "Neutral",
        dataset_dir / "emotions" / "val" / "Neutral",
        dataset_dir / "emotions" / "test" / "Neutral",
    ]

    unsafe_dirs = [
        dataset_dir / "emotions" / "train" / "NSFW",
        dataset_dir / "emotions" / "val" / "NSFW",
        dataset_dir / "emotions" / "test" / "NSFW",
        dataset_dir / "knife" / "train",
        dataset_dir / "knife" / "test",
    ]

    safe_images: List[Path] = []
    unsafe_images: List[Path] = []

    for folder in safe_dirs:
        safe_images.extend(list(_iter_images(folder) or []))

    for folder in unsafe_dirs:
        unsafe_images.extend(list(_iter_images(folder) or []))

    if not safe_images or not unsafe_images:
        all_images = list(_iter_images(dataset_dir) or [])
        for image in all_images:
            path_lower = str(image).lower()
            if any(keyword in path_lower for keyword in ["nsfw", "knife", "weapon", "violence", "hate", "danger", "gun", "pistol", "rifle", "fusil", "pistolet", "arme"]):
                unsafe_images.append(image)
            elif any(keyword in path_lower for keyword in ["neutral", "safe", "normal", "nature", "forest", "camping"]):
                safe_images.append(image)

    return DatasetSplit(
        safe_images=sorted(set(safe_images)),
        unsafe_images=sorted(set(unsafe_images)),
    )


def _load_image_feature(image_path: Path, image_size: int) -> np.ndarray:
    with Image.open(image_path) as img:
        gray = img.convert("L")
        gray = gray.resize((image_size, image_size))
        arr = np.asarray(gray, dtype=np.float32) / 255.0
    return arr.flatten()


def _build_features(image_paths: Sequence[Path], image_size: int) -> Tuple[np.ndarray, List[Path]]:
    features: List[np.ndarray] = []
    valid_paths: List[Path] = []

    for image_path in image_paths:
        try:
            features.append(_load_image_feature(image_path, image_size))
            valid_paths.append(image_path)
        except Exception:
            continue

    if not features:
        return np.empty((0, image_size * image_size), dtype=np.float32), []

    return np.vstack(features), valid_paths


def train_model(
    dataset_dir: Path,
    model_path: Path,
    image_size: int = 64,
    max_samples_per_class: int = 3000,
    random_state: int = 42,
) -> Dict[str, object]:
    split = discover_dataset(dataset_dir)

    safe_images = split.safe_images[:max_samples_per_class]
    unsafe_images = split.unsafe_images[:max_samples_per_class]

    if len(safe_images) < 20 or len(unsafe_images) < 20:
        raise RuntimeError(
            f"Insufficient dataset for training. safe={len(safe_images)} unsafe={len(unsafe_images)}"
        )

    x_safe, safe_valid = _build_features(safe_images, image_size)
    x_unsafe, unsafe_valid = _build_features(unsafe_images, image_size)

    if x_safe.shape[0] < 20 or x_unsafe.shape[0] < 20:
        raise RuntimeError(
            f"Insufficient valid images after decoding. safe={x_safe.shape[0]} unsafe={x_unsafe.shape[0]}"
        )

    y_safe = np.zeros(x_safe.shape[0], dtype=np.int64)
    y_unsafe = np.ones(x_unsafe.shape[0], dtype=np.int64)

    x = np.vstack([x_safe, x_unsafe])
    y = np.concatenate([y_safe, y_unsafe])

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=random_state,
        stratify=y,
    )

    pipeline = make_pipeline(
        RandomForestClassifier(
            n_estimators=150,
            max_depth=25,
            min_samples_split=5,
            class_weight="balanced",
            random_state=random_state,
            n_jobs=-1
        ),
    )
    pipeline.fit(x_train, y_train)

    y_pred = pipeline.predict(x_test)
    y_prob = pipeline.predict_proba(x_test)[:, 1]

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
    }

    payload = {
        "model": pipeline,
        "image_size": image_size,
        "model_name": "image_safety_rf_v2",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "metrics": metrics,
        "class_distribution": {
            "safe": int(x_safe.shape[0]),
            "unsafe": int(x_unsafe.shape[0]),
        },
        "sample_paths": {
            "safe": [str(p) for p in safe_valid[:5]],
            "unsafe": [str(p) for p in unsafe_valid[:5]],
        },
    }

    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(payload, model_path)

    return {
        "success": True,
        "model_path": str(model_path),
        "model_name": payload["model_name"],
        "metrics": metrics,
        "class_distribution": payload["class_distribution"],
    }


def load_model(model_path: Path) -> Dict[str, object]:
    return joblib.load(model_path)


def keyword_text_risk(text: str) -> float:
    if not text:
        return 0.0
    normalized = text.lower()
    risky_keywords = [
        "kill", "knife", "weapon", "blood", "bomb", "hate", "nazi",
        "terror", "violence", "attack", "abuse", "racist", "extremist",
        "tuer", "couteau", "arme", "sang", "bombe", "haine", "terrorisme",
        "violence", "attaque", "abus", "raciste", "extremiste", "fusil", "pistolet"
    ]
    hits = sum(1 for kw in risky_keywords if kw in normalized)
    if hits == 0:
        return 0.0
    return min(1.0, (hits / float(len(risky_keywords))) * 3.0)


def predict_image(model_payload: Dict[str, object], image_path: Path, text: str = "") -> Dict[str, object]:
    image_size = int(model_payload.get("image_size", 64))
    model = model_payload["model"]
    model_name = str(model_payload.get("model_name", "image_safety_rf_v2"))

    x = _load_image_feature(image_path, image_size).reshape(1, -1)
    text_risk = float(keyword_text_risk(text))
    probabilities = model.predict_proba(x)[0]
    reasons: List[str] = []

    # Apply filename heuristics (Weapon detection)
    filename_risk_boost = 0.0
    for kw in ["gun", "weapon", "blood", "kill", "arme", "sang", "couteau", "knife", "ak47"]:
        if kw in str(image_path).lower():
            filename_risk_boost = 0.50
            reasons.append(f"Dangerous keyword '{kw}' detected in filename")
            break

    # Apply safe context boost (Flower/Nature detection)
    safe_boost = 0.0
    for kw in ["flower", "fleur", "nature", "rose", "beautiful", "beau", "camping", "forest", "foret"]:
        if kw in str(image_path).lower() or (text and kw in text.lower()):
            safe_boost = 0.40  # Strong boost for safe context
            reasons.append(f"Safe context '{kw}' detected (trust boost)")
            break

    # Combine AI probability with heuristics
    unsafe_probability = max(0.0, min(1.0, float(probabilities[1]) + filename_risk_boost - safe_boost))

    if unsafe_probability > 0.6:
        predicted_label = "unsafe"
        if not reasons: reasons.append("Image strongly resembles unsafe content")
    elif unsafe_probability > 0.1:
        predicted_label = "unsafe"
        if not reasons: reasons.append("Image may contain unsafe/inappropriate patterns (caution)")
    else:
        predicted_label = "safe"
        if not reasons: reasons.append("Image appears safe")

    return {
        "success": True,
        "model_name": model_payload["model_name"],
        "unsafe_probability": unsafe_probability,
        "predicted_label": predicted_label,
        "text_risk": text_risk,
        "reasons": list(set(reasons))
    }


def to_json_line(payload: Dict[str, object]) -> str:
    return json.dumps(payload, ensure_ascii=True)
