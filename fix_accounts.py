import pymongo

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['campconnectdb']

def fix():
    # 1. Wissall (student) fix
    # find the oldest one (the real one)
    users_wissal = list(db.users.find({'email': 'wissallassoued951@gmail.com'}).sort('_id', 1))
    if len(users_wissal) > 1:
        real_user = users_wissal[0]
        fake_user = users_wissal[1]
        db.users.delete_one({'_id': fake_user['_id']})
        db.users.update_one({'_id': real_user['_id']}, {'$set': {'roles': ['ROLE_USER'], 'trustScore': 50}})
        db.user_certifications.update_many({'certificationName': 'Basic Camp Setup'}, {'$set': {'user': {'$ref': 'users', '$id': real_user['_id']}}})
    elif len(users_wissal) == 1:
        real_user = users_wissal[0]
        db.users.update_one({'_id': real_user['_id']}, {'$set': {'roles': ['ROLE_USER'], 'trustScore': 50}})
        db.user_certifications.update_many({'certificationName': 'Basic Camp Setup'}, {'$set': {'user': {'$ref': 'users', '$id': real_user['_id']}}})

    # 2. Fix passwords for other accounts (convert $2b$ to $2a$)
    admin = db.users.find_one({'email': 'admin@campconnect.tn'})
    if admin and 'password' in admin and admin['password'].startswith('$2b$'):
        new_pass = admin['password'].replace('$2b$', '$2a$')
        db.users.update_one({'_id': admin['_id']}, {'$set': {'password': new_pass}})

    expert = db.users.find_one({'email': 'wissallassoued76@gmail.com'})
    if expert and 'password' in expert and expert['password'].startswith('$2b$'):
        new_pass = expert['password'].replace('$2b$', '$2a$')
        db.users.update_one({'_id': expert['_id']}, {'$set': {'password': new_pass}})

    # Remove expert duplicate if any
    experts = list(db.users.find({'email': 'wissallassoued76@gmail.com'}).sort('_id', 1))
    if len(experts) > 1:
        db.users.delete_one({'_id': experts[1]['_id']})

    print("Accounts fixed. Try logging in now!")

fix()
