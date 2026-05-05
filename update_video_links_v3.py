from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['campconnectdb']

# High-quality embed-friendly videos
db.videos.update_one({'title': 'Wilderness First Aid - Hypothermia'}, {'$set': {'videoUrl': 'https://www.youtube.com/watch?v=R9UfI_hH8pE'}})
db.videos.update_one({'title': 'Bow Drill Fire Technique'}, {'$set': {'videoUrl': 'https://www.youtube.com/watch?v=X0S6vXf47_U'}})
db.videos.update_one({'title': 'Building a Debris Hut Shelter'}, {'$set': {'videoUrl': 'https://www.youtube.com/watch?v=GZWK3KjFRpk'}})
db.videos.update_one({'title': 'Mastering Wilderness Navigation'}, {'$set': {'videoUrl': 'https://www.youtube.com/watch?v=0uB2v_W9Y3E'}})

print("Done updating high-quality links.")
