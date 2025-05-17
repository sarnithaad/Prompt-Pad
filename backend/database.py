from pymongo import MongoClient
import os
from bson.objectid import ObjectId

# Support both MONGODB_URI and MONGO_URI for flexibility
MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client["prompt_pad"]
codes = db["codes"]

def save_code(code, title, language):
    doc = {"code": code, "title": title, "language": language}
    result = codes.insert_one(doc)
    return str(result.inserted_id)

def get_code(code_id):
    try:
        doc = codes.find_one({"_id": ObjectId(code_id)})
    except Exception:
        # Invalid ObjectId format
        return None
    if doc:
        return {
            "code": doc["code"],
            "title": doc.get("title", ""),
            "language": doc.get("language", "python")
        }
    return None
