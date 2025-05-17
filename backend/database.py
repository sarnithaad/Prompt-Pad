from pymongo import MongoClient
import os
from bson.objectid import ObjectId

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["prompt_pad"]
codes = db["codes"]

def save_code(code, title, language):
    doc = {"code": code, "title": title, "language": language}
    result = codes.insert_one(doc)
    return str(result.inserted_id)

def get_code(code_id):
    doc = codes.find_one({"_id": ObjectId(code_id)})
    if doc:
        return {"code": doc["code"], "title": doc.get("title", ""), "language": doc.get("language", "python")}
    return None
