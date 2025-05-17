from pymongo import MongoClient
import os
from bson.objectid import ObjectId

# Get MongoDB URI from environment variables
MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017/"
client = MongoClient(MONGODB_URI)
try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    # Force connection on a request as the connect=True parameter of MongoClient seems
    # to be useless here
    client.server_info()
except Exception as e:
    print("MongoDB connection error:", e)
    raise

db = client["prompt_pad"]
codes = db["codes"]

def save_code(code, title, language):
    doc = {
        "code": code,
        "title": title or "",
        "language": language or "python"
    }
    result = codes.insert_one(doc)
    return str(result.inserted_id)

def get_code(code_id):
    try:
        doc = codes.find_one({"_id": ObjectId(code_id)})
    except Exception:
        return None
    if doc:
        return {
            "id": str(doc["_id"]),
            "code": doc.get("code", ""),
            "title": doc.get("title", ""),
            "language": doc.get("language", "python")
        }
    return None

def update_code(code_id, code=None, title=None, language=None):
    update_fields = {}
    if code is not None:
        update_fields["code"] = code
    if title is not None:
        update_fields["title"] = title
    if language is not None:
        update_fields["language"] = language
    if not update_fields:
        return False
    try:
        result = codes.update_one({"_id": ObjectId(code_id)}, {"$set": update_fields})
        return result.modified_count > 0
    except Exception:
        return False

def delete_code(code_id):
    try:
        result = codes.delete_one({"_id": ObjectId(code_id)})
        return result.deleted_count > 0
    except Exception:
        return False
