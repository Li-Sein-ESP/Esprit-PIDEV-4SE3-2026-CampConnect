import pymongo
from passlib.hash import bcrypt

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['campconnectdb']

# Generate a proper $2a$ hash with passlib
hash2a = bcrypt.using(ident='2a', rounds=10).hash('123456')

for email in ['admin@campconnect.tn', 'wissallassoued76@gmail.com', 'wissallassoued951@gmail.com']:
    db.users.update_one({'email': email}, {'$set': {'password': hash2a}})

print('PASSWORDS UPDATED SUCCESSFULLY TO 123456 USING PASSLIB $2a$ HASH!')
