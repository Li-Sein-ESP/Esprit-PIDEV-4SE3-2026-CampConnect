import pymongo
from bson import ObjectId
from datetime import datetime, timedelta
import sys

sys.stdout.reconfigure(encoding='utf-8')

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["campconnectdb"]

expert_email = "wissallassoued76@gmail.com"
student_email = "wissallassoued951@gmail.com"

# Mettre à jour l'expert
res1 = db.users.update_many({"email": "expert@campconnect.tn"}, {"$set": {"email": expert_email}})
# Mettre à jour l'étudiant
res2 = db.users.update_many({"email": "student@campconnect.tn"}, {"$set": {"email": student_email}})

print("Comptes mis à jour avec vos vraies adresses emails :")
print(f"🏕️ EXPERT: {expert_email} / Test1234!")
print(f"🎒 ETUDIANT: {student_email} / Test1234!")
