from pymongo import MongoClient
from bson import DBRef

client = MongoClient('mongodb://localhost:27017/')
db = client['campconnectdb']

def fix_categories():
    courses = list(db.courses.find())
    for c in courses:
        cat = c.get('category')
        if isinstance(cat, str):
            print(f"Fixing course '{c.get('title')}' with category string '{cat}'")
            cat_doc = db.categories.find_one({'name': cat})
            if not cat_doc:
                res = db.categories.insert_one({'name': cat, 'description': f'{cat} skills'})
                cat_id = res.inserted_id
            else:
                cat_id = cat_doc['_id']
            
            # Using dict format for DBRef to avoid driver issues in some envs
            db.courses.update_one(
                {'_id': c['_id']}, 
                {'$set': {'category': {'$ref': 'categories', '$id': cat_id}}}
            )

fix_categories()
print("Done fixing course categories.")
