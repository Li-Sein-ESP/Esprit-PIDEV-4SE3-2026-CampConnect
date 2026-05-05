from pymongo import MongoClient
from bson import ObjectId

client = MongoClient('mongodb://localhost:27017/')
db = client['campconnectdb']

updates = [
    ('69f8f504a2588d01f753e1ea', 'https://www.youtube.com/embed/0kFp6yHw9z8'),
    ('69f8f504a2588d01f753e1e9', 'https://www.youtube.com/embed/X0S6vXf47_U'),
    ('69f8f504a2588d01f753e1e8', 'https://www.youtube.com/embed/n_YHe6S8Xk8')
]

for vid_id, url in updates:
    db.videos.update_one({'_id': ObjectId(vid_id)}, {'$set': {'videoUrl': url}})

print("Successfully updated video links.")
