import pymongo
from bson import ObjectId
from datetime import datetime, timedelta
import sys

sys.stdout.reconfigure(encoding='utf-8')

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["campconnectdb"]

print("========================================")
print("  PREPARATION DES DONNEES DE TEST POUR  ")
print("        LA DEMO SCENARIO ACADEMY        ")
print("========================================")

import bcrypt
def hash_pw(pw):
    return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# 1. Ensure users exist
admin_email = "admin@campconnect.tn"
expert_email = "expert@campconnect.tn"
student_email = "student@campconnect.tn"

default_pw = hash_pw("Test1234!")

admin_user = db.users.find_one({"email": admin_email})
if not admin_user:
    res = db.users.insert_one({
        "_class": "com.campconnect.model.User",
        "username": "Admin", "name": "Admin System", "email": admin_email, "password": default_pw,
        "roles": ["ROLE_ADMIN"], "trustScore": 100, "verifiedExpert": True, "dateJoined": datetime.now()
    })
    admin_user = {"_id": res.inserted_id}

expert_user = db.users.find_one({"email": expert_email})
if not expert_user:
    res = db.users.insert_one({
        "_class": "com.campconnect.model.User",
        "username": "Expert", "name": "Expert Survivaliste", "email": expert_email, "password": default_pw,
        "roles": ["ROLE_USER"], "trustScore": 95, "verifiedExpert": True, "dateJoined": datetime.now()
    })
    expert_user = {"_id": res.inserted_id}

student_user = db.users.find_one({"email": student_email})
if not student_user:
    res = db.users.insert_one({
        "_class": "com.campconnect.model.User",
        "username": "Student", "name": "Etudiant Campeur", "email": student_email, "password": default_pw,
        "roles": ["ROLE_USER"], "trustScore": 50, "verifiedExpert": False, "dateJoined": datetime.now()
    })
    student_user = {"_id": res.inserted_id}

print("OK Utilisateurs verifies/crees.")

# 2. Add a PENDING course created by expert
db.courses.delete_many({"title": "Advanced Fire Crafting (Demo)"})
res_course = db.courses.insert_one({
    "_class": "com.campconnect.academy.entity.Course",
    "title": "Advanced Fire Crafting (Demo)",
    "description": "Un cours avance pour la demonstration du scenario. Ce cours est en attente d'approbation.",
    "category": "Survival",
    "difficulty": "ADVANCED",
    "status": "PENDING",
    "duration": 5,
    "price": 150,
    "passingScore": 60,
    "imageUrl": "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800",
    "creator": {"$ref": "users", "$id": expert_user["_id"]},
    "instructorName": "Expert Survivaliste",
    "createdAt": datetime.now()
})
print("OK Cours 'PENDING' cree pour tester la confirmation de l'Admin.")

# 3. Add an EXPIRED certification for the student to trigger notification
res_cert = db.certifications.insert_one({
    "_class": "com.campconnect.academy.entity.Certification",
    "name": "Basic Camp Setup",
    "description": "Certification de base, utilisee pour tester l'expiration.",
    "validityPeriod": 12,
    "issuer": "CampConnect"
})

db.user_certifications.delete_many({"certificationName": "Basic Camp Setup"})
db.user_certifications.insert_one({
    "_class": "com.campconnect.academy.entity.UserCertification",
    "certification": {"$ref": "certifications", "$id": res_cert.inserted_id},
    "user": {"$ref": "users", "$id": student_user["_id"]},
    "certificationName": "Basic Camp Setup",
    "earnedDate": datetime.now() - timedelta(days=400),
    "expiryDate": datetime.now() - timedelta(days=35),
    "status": "EXPIRED"
})
print("OK Certification EXPIRED creee pour tester la notification du Student.")

print("\n========================================")
print("     COMPTES A UTILISER POUR LE TEST    ")
print("========================================")
print(f"👨‍💼 ADMIN: {admin_email} / Test1234!")
print(f"🏕️ EXPERT: {expert_email} / Test1234!")
print(f"🎒 ETUDIANT: {student_email} / Test1234!")
print("========================================")
