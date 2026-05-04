import argparse
import json
import sys
from pathlib import Path

# Add script directory to sys.path to ensure moderation_model is found
script_dir = Path(__file__).resolve().parent
if str(script_dir) not in sys.path:
    sys.path.append(str(script_dir))

try:
    from moderation_model import load_model, predict_image, to_json_line, train_model
except ImportError as e:
    # If the script is run without dependencies, fail gracefully with JSON
    print(json.dumps({"success": False, "error": f"Import error: {str(e)}. Please run setup_ml.bat"}))
    sys.exit(1)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train or run image moderation inference")
    subparsers = parser.add_subparsers(dest="command", required=True)

    train_parser = subparsers.add_parser("train", help="Train moderation model")
    train_parser.add_argument("--dataset-dir", required=True, help="Dataset root directory")
    train_parser.add_argument("--model-path", required=True, help="Output model path (.pkl)")
    train_parser.add_argument("--image-size", type=int, default=64)
    train_parser.add_argument("--max-samples-per-class", type=int, default=3000)

    predict_parser = subparsers.add_parser("predict", help="Predict moderation score for one image")
    predict_parser.add_argument("--image-path", required=True)
    predict_parser.add_argument("--model-path", required=True)
    predict_parser.add_argument("--dataset-dir", required=False)
    predict_parser.add_argument("--text", default="")

    return parser.parse_args()


def ensure_model(args: argparse.Namespace) -> Path:
    model_path = Path(args.model_path).resolve()
    if model_path.exists():
        return model_path

    if not args.dataset_dir:
        raise RuntimeError("Model not found and no --dataset-dir provided for auto-training")

    dataset_dir = Path(args.dataset_dir).resolve()
    result = train_model(
        dataset_dir=dataset_dir,
        model_path=model_path,
        image_size=64,
        max_samples_per_class=3000,
    )
    if not result.get("success"):
        raise RuntimeError("Failed to auto-train moderation model")
    return model_path


def cmd_train(args: argparse.Namespace) -> int:
    dataset_dir = Path(args.dataset_dir).resolve()
    model_path = Path(args.model_path).resolve()
    result = train_model(
        dataset_dir=dataset_dir,
        model_path=model_path,
        image_size=args.image_size,
        max_samples_per_class=args.max_samples_per_class,
    )
    print(to_json_line(result))
    return 0


def cmd_predict(args: argparse.Namespace) -> int:
    model_path = ensure_model(args)
    payload = load_model(model_path)
    image_path = Path(args.image_path).resolve()
    result = predict_image(payload, image_path=image_path, text=args.text)
    print(to_json_line(result))
    return 0


def main() -> int:
    args = parse_args()
    try:
        if args.command == "train":
            return cmd_train(args)
        if args.command == "predict":
            return cmd_predict(args)
        raise RuntimeError(f"Unsupported command: {args.command}")
    except Exception as exc:
        print(json.dumps({"success": False, "error": str(exc)}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
