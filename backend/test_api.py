import urllib.request
import json

base_url = "http://localhost:8090/api"

def sign_in():
    url = f"{base_url}/auth/signin"
    payload = {"username": "admin", "password": "admin123"}
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as response:
            body = json.loads(response.read().decode("utf-8"))
            return body.get("token")
    except Exception as e:
        print(f"Auth Error: {e}")
        return None

def create_post(token):
    url = f"{base_url}/posts"
    payload = {
        "title": "Danger au camping",
        "content": "J'ai apporte mon couteau de combat, attention a vous !",
        "authorName": "AdminUser",
        "imageUrls": ["/uploads/couteau_test.png"]
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data)
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as response:
            body = json.loads(response.read().decode("utf-8"))
            return body
    except Exception as e:
        print(f"Post Creation Error: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode("utf-8"))
        return None

def check_incidents(token):
    url = f"{base_url}/incidents"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as response:
            body = json.loads(response.read().decode("utf-8"))
            return body
    except Exception as e:
        print(f"Incident Fetch Error: {e}")
        return None

token = sign_in()
if token:
    print(f"Auth Successful. Token obtained.")
    post = create_post(token)
    if post:
        print("Post Created Successfully:")
        print(json.dumps(post, indent=2))
        
        print("\nChecking for Incidents...")
        incidents = check_incidents(token)
        if incidents:
            # Find the latest incident related to this post
            latest = sorted(incidents, key=lambda x: x.get('createdAt', ''), reverse=True)[0]
            print("Latest Incident Found:")
            print(json.dumps(latest, indent=2))
else:
    print("Failed to authenticate. Make sure the 'admin' user exists.")
