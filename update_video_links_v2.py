from pymongo import MongoClient
from bson import ObjectId

client = MongoClient('mongodb://localhost:27017/')
db = client['campconnectdb']

updates = [
    # Hypothermia
    ('69f8f504a2588d01f753e1ea', 'https://www.youtube.com/watch?v=0kFp6yHw9z8'),
    # Bow Drill / Fire
    ('69f8f504a2588d01f753e1e9', 'https://www.youtube.com/watch?v=X0S6vXf47_U'),
    # Shelter
    ('69f8f504a2588d01f753e1e8', 'https://www.youtube.com/watch?v=GZWK3KjFRpk')
]

for vid_id, url in updates:
    db.videos.update_one({'_id': ObjectId(vid_id)}, {'$set': {'videoUrl': url}})

# Also update the navigation one I added
db.videos.update_one({'title': 'Mastering Wilderness Navigation'}, {'$set': {'videoUrl': 'https://www.youtube.com/watch?v=0uB2v_W9Y3E'}})

print("Updated videos with standard watch?v= URLs.")
