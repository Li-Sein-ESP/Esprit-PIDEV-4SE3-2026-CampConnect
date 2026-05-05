import pymongo
import bcrypt

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['campconnectdb']

def hash_pw(pw):
    # Generates a $2b$ hash and replaces the prefix with $2a$ for Spring Security
    raw_hash = bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    return raw_hash.replace('$2b$', '$2a$')

new_password = hash_pw("123456")

# Update Admin
db.users.update_one({'email': 'admin@campconnect.tn'}, {'$set': {'password': new_password}})

# Update Expert
db.users.update_one({'email': 'wissallassoued76@gmail.com'}, {'$set': {'password': new_password}})

# Update Student
db.users.update_one({'email': 'wissallassoued951@gmail.com'}, {'$set': {'password': new_password}})

print("Tous les mots de passe ont été modifiés pour '123456' ! (Hachage compatible avec Spring Boot)")
