from pymongo import MongoClient
import os
from bson.objectid import ObjectId

# Support both MONGODB_URI and MONGO_URI for flexibility
MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client["prompt_pad"]
codes = db["codes"]

def save_code(code, title, language):
    """
    Save a code snippet to the database.
    Returns the inserted document's ID as a string.
    """
    doc = {
        "code": code,
        "title": title or "",
        "language": language or "python"
    }
    result = codes.insert_one(doc)
    return str(result.inserted_id)

def get_code(code_id):
    """
    Retrieve a code snippet from the database by its ID.
    Returns a dict with code, title, and language, or None if not found/invalid.
    """
    try:
        doc = codes.find_one({"_id": ObjectId(code_id)})
    except Exception:
        # Invalid ObjectId format or other error
        return None
    if doc:
        return {
            "code": doc.get("code", ""),
            "title": doc.get("title", ""),
            "language": doc.get("language", "python")
        }
    return None
