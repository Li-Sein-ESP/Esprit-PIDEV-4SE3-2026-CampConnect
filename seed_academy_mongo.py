import pymongo
from bson import ObjectId
from datetime import datetime, timedelta
import sys

# Change default encoding to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["campconnectdb"]

print("========================================")
print("  SEEDING MODULE ACADEMY VIA MONGODB    ")
print("========================================")

# 1. Obtenir des IDs de cours approuvés
courses = list(db["courses"].find({"status": "APPROVED"}))
if not courses:
    print("ATTENTION: Aucun cours approuve trouve.")
    course_ids = []
else:
    course_ids = [str(c["_id"]) for c in courses]
    print(f"Trouve {len(courses)} cours approuves.")

# 2. Créer des certifications
certs_data = [
    {
        "_class": "com.campconnect.academy.entity.Certification",
        "name": "Certified Wilderness Expert",
        "description": "The highest recognition for wilderness survival mastery. Holders demonstrate exceptional proficiency in fire, shelter, water sourcing, navigation, and first aid.",
        "requirements": ["Complete Wilderness Survival course", "Pass AI quiz with 60% minimum", "Demonstrate practical skills"],
        "validityPeriod": 12,
        "imageUrl": "🏆 CWE",
        "issuer": "CampConnect Wilderness Academy",
        "requiredCourses": [{"$ref": "courses", "$id": ObjectId(cid)} for cid in course_ids[:2]] if len(course_ids) >= 2 else []
    },
    {
        "_class": "com.campconnect.academy.entity.Certification",
        "name": "Expert Trail Navigator",
        "description": "Demonstrates mastery of orienteering, map reading, GPS navigation and route planning for backcountry expeditions in all conditions.",
        "requirements": ["Complete Navigation course", "Pass quiz with 60%", "Plan a real-world navigation route"],
        "validityPeriod": 12,
        "imageUrl": "🧭 ETN",
        "issuer": "CampConnect Academy",
        "requiredCourses": [{"$ref": "courses", "$id": ObjectId(cid)} for cid in course_ids[1:3]] if len(course_ids) >= 3 else []
    },
    {
        "_class": "com.campconnect.academy.entity.Certification",
        "name": "Wilderness First Aid Professional",
        "description": "Internationally recognized certification for wilderness medical response. Manage emergencies with limited resources in remote environments.",
        "requirements": ["Complete First Aid course", "Score 70% on assessment", "CPR demonstration"],
        "validityPeriod": 24,
        "imageUrl": "🏥 WFA",
        "issuer": "CampConnect Medical Academy",
        "requiredCourses": []
    }
]

db["certifications"].delete_many({}) # Nettoyer les anciennes pour éviter doublons
res_certs = db["certifications"].insert_many(certs_data)
print(f"OK Cree {len(res_certs.inserted_ids)} certifications.")

# 3. Créer UserCertifications pour la démo des stats (TACHE 2) et filtrage (TACHE 3)
admin_user = db["users"].find_one({"role": "ADMIN"})
if not admin_user:
    admin_user = db["users"].find_one() # Prendre n'importe quel user si pas d'admin

if admin_user and len(res_certs.inserted_ids) >= 2:
    db["user_certifications"].delete_many({})
    
    now = datetime.now()
    uc_data = [
        {
            "_class": "com.campconnect.academy.entity.UserCertification",
            "certification": {"$ref": "certifications", "$id": res_certs.inserted_ids[0]},
            "user": {"$ref": "users", "$id": admin_user["_id"]},
            "earnedDate": now - timedelta(days=90),
            "expiryDate": now + timedelta(days=275),
            "status": "ACTIVE"
        },
        {
            "_class": "com.campconnect.academy.entity.UserCertification",
            "certification": {"$ref": "certifications", "$id": res_certs.inserted_ids[1]},
            "user": {"$ref": "users", "$id": admin_user["_id"]},
            "earnedDate": now - timedelta(days=400),
            "expiryDate": now - timedelta(days=35),
            "status": "EXPIRED"
        }
    ]
    res_uc = db["user_certifications"].insert_many(uc_data)
    print(f"OK Cree {len(res_uc.inserted_ids)} UserCertifications (ACTIVE + EXPIRED) pour TACHE 3 et Scheduler TACHE 1.")

# 4. Créer Vidéos
videos_data = [
    {
        "_class": "com.campconnect.academy.entity.KnowledgeVideo",
        "title": "Building a Debris Hut Shelter",
        "description": "Expert shows how to build a debris hut shelter using only natural materials. No tools required. Essential wilderness survival skill.",
        "videoUrl": "https://www.youtube.com/embed/GZWK3KjFRpk",
        "thumbnailUrl": "https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800",
        "category": "survival",
        "type": "TUTORIAL",
        "views": 4821,
        "helpfulCount": 312,
        "takeaways": ["Use dry dead leaves for insulation", "Hut should barely fit your body", "Cover with at least 2 feet of debris"]
    },
    {
        "_class": "com.campconnect.academy.entity.KnowledgeVideo",
        "title": "Bow Drill Fire Technique",
        "description": "Complete guide to starting fire with the bow drill technique. Wood selection, proper form, and troubleshooting the most common mistakes.",
        "videoUrl": "https://www.youtube.com/embed/dLbWTFQ5nzo",
        "thumbnailUrl": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
        "category": "survival",
        "type": "TUTORIAL",
        "views": 6234,
        "helpfulCount": 487,
        "takeaways": ["Dry wood is non-negotiable", "Consistent pressure not speed", "Prepare tinder bundle first"]
    },
    {
        "_class": "com.campconnect.academy.entity.KnowledgeVideo",
        "title": "Wilderness First Aid - Hypothermia",
        "description": "Emergency response for hypothermia in the field. Recognize symptoms, proper rewarming techniques, when to call for evacuation.",
        "videoUrl": "https://www.youtube.com/embed/QlBnFcU2GHE",
        "thumbnailUrl": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800",
        "category": "first-aid",
        "type": "TUTORIAL",
        "views": 8934,
        "helpfulCount": 721,
        "takeaways": ["Remove wet clothing first", "Insulate from ground up", "Rewarm slowly never rub skin"]
    }
]
db["videos"].delete_many({})
res_vid = db["videos"].insert_many(videos_data)
print(f"OK Cree {len(res_vid.inserted_ids)} videos.")

# 5. Créer Badges
badges_data = [
    {
        "_class": "com.campconnect.academy.entity.Badge",
        "name": "Fire Master",
        "description": "Awarded for demonstrating expert-level fire-starting skills using primitive methods",
        "icon": "🔥",
        "categoryName": "Bushcraft",
        "rarity": "RARE",
        "requirements": ["Complete Fire Crafting course", "Start fire with 3 different methods"]
    },
    {
        "_class": "com.campconnect.academy.entity.Badge",
        "name": "Navigation Pro",
        "description": "For campers who can navigate precisely using map and compass alone",
        "icon": "🧭",
        "categoryName": "Navigation",
        "rarity": "UNCOMMON",
        "requirements": ["Complete Navigation course", "Navigate a marked route within 10% of optimal path"]
    },
    {
        "_class": "com.campconnect.academy.entity.Badge",
        "name": "Wilderness Guardian",
        "description": "Elite badge for those who have mastered all core wilderness disciplines",
        "icon": "🛡️",
        "categoryName": "Elite",
        "rarity": "LEGENDARY",
        "requirements": ["Hold at least 3 other certifications", "Complete 100+ hours of outdoor education"]
    }
]
db["badges"].delete_many({})
res_badge = db["badges"].insert_many(badges_data)
print(f"OK Cree {len(res_badge.inserted_ids)} badges.")

print("========================================")
print("          SEED TERMINE!                 ")
print("========================================")
