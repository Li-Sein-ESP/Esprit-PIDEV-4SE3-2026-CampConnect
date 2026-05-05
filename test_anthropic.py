import requests
import json

api_key = "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"
url = "https://api.anthropic.com/v1/messages"

headers = {
    "x-api-key": api_key,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
}

data = {
    "model": "claude-3-haiku-20240307",
    "max_tokens": 1024,
    "system": "System prompt",
    "messages": [
        {"role": "user", "content": "Hello"}
    ]
}

response = requests.post(url, headers=headers, json=data)
print(response.status_code)
print(response.text)
