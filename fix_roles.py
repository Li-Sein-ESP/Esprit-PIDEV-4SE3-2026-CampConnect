from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['campconnectdb']

role_user = db.roles.find_one({'name': 'ROLE_USER'})
role_admin = db.roles.find_one({'name': 'ROLE_ADMIN'})

if role_user:
    db.users.update_one({'email': 'wissallassoued951@gmail.com'}, {'$set': {'roles': [{'$id': role_user['_id'], '$ref': 'roles'}]}})
if role_admin:
    db.users.update_one({'email': 'admin@campconnect.tn'}, {'$set': {'roles': [{'$id': role_admin['_id'], '$ref': 'roles'}]}})

print("Roles fixed using explicit DBRef dicts with $id!")
