import os
import json
import logging
from datetime import datetime
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

logger = logging.getLogger("civicconnect.db")

MONGO_URI = "mongodb+srv://nandagowthaminallagarla_db_user:Q9EDFj5c4c927aQu@cluster0.hutgjva.mongodb.net/"
DB_NAME =  "civicconnect_ai"

client = None
db = None
is_mongo_active = False

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500, tlsAllowInvalidCertificates=True)
    # Ping database to verify connection
    client.admin.command('ping')
    db = client[DB_NAME]
    is_mongo_active = True
    print(f"Connected to MongoDB at {MONGO_URI} (Database: {DB_NAME})")
    
    # Create indexes
    db.users.create_index([("email", ASCENDING)], unique=True)
    db.complaints.create_index([("complaint_id", ASCENDING)], unique=True)
    db.complaints.create_index([("status", ASCENDING)])
    db.complaints.create_index([("priority", ASCENDING)])
    db.complaints.create_index([("department", ASCENDING)])
    db.complaints.create_index([("created_at", DESCENDING)])
    db.notifications.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
except Exception as e:
    print(f"MongoDB ping error: {e}. Active fallback enabled.")
    is_mongo_active = False

FALLBACK_FILE = os.path.join(os.path.dirname(__file__), "local_store.json")

def load_fallback():
    if os.path.exists(FALLBACK_FILE):
        try:
            with open(FALLBACK_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "users": [],
        "complaints": [],
        "departments": [],
        "status_history": [],
        "notifications": []
    }

def save_fallback(data):
    try:
        with open(FALLBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, default=str, indent=2)
    except Exception as e:
        print(f"Error saving fallback store: {e}")

class CollectionWrapper:
    def __init__(self, name: str):
        self.name = name

    def find(self, query=None, sort=None, limit=None):
        query = query or {}
        if is_mongo_active and db is not None:
            try:
                cursor = db[self.name].find(query)
                if sort:
                    cursor = cursor.sort(sort)
                if limit:
                    cursor = cursor.limit(limit)
                docs = list(cursor)
                for d in docs:
                    if "_id" in d:
                        d["_id"] = str(d["_id"])
                return docs
            except Exception as e:
                print(f"MongoDB find failed: {e}")
        
        data = load_fallback()
        items = data.get(self.name, [])
        res = []
        for item in items:
            match = True
            for k, v in query.items():
                if k == "$or":
                    or_match = any(all(item.get(ck) == cv for ck, cv in cond.items()) for cond in v)
                    if not or_match:
                        match = False
                        break
                elif item.get(k) != v:
                    match = False
                    break
            if match:
                res.append(item)
        if sort:
            for s_col, s_dir in reversed(sort):
                res.sort(key=lambda x: str(x.get(s_col, "")), reverse=(s_dir == DESCENDING or s_dir == -1))
        if limit:
            res = res[:limit]
        return res

    def find_one(self, query=None):
        query = query or {}
        if is_mongo_active and db is not None:
            try:
                doc = db[self.name].find_one(query)
                if doc and "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                return doc
            except Exception as e:
                print(f"MongoDB find_one failed: {e}")
        res = self.find(query, limit=1)
        return res[0] if res else None

    def insert_one(self, document):
        doc = dict(document)
        import uuid
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        
        if is_mongo_active and db is not None:
            try:
                # remove custom _id if mongo generates or keep string id
                res = db[self.name].insert_one(dict(doc))
                doc["_id"] = str(res.inserted_id)
                return doc
            except Exception as e:
                print(f"MongoDB insert_one error: {e}")
        
        data = load_fallback()
        data.setdefault(self.name, []).append(doc)
        save_fallback(data)
        return doc

    def update_one(self, query, update):
        if is_mongo_active and db is not None:
            try:
                res = db[self.name].update_one(query, update)
                return res.matched_count > 0
            except Exception as e:
                print(f"MongoDB update_one error: {e}")
        
        data = load_fallback()
        items = data.get(self.name, [])
        for i, item in enumerate(items):
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                if "$set" in update:
                    item.update(update["$set"])
                if "$push" in update:
                    for pk, pv in update["$push"].items():
                        item.setdefault(pk, []).append(pv)
                if "$inc" in update:
                    for ik, iv in update["$inc"].items():
                        item[ik] = item.get(ik, 0) + iv
                items[i] = item
                save_fallback(data)
                return True
        return False

    def count_documents(self, query=None):
        query = query or {}
        if is_mongo_active and db is not None:
            try:
                return db[self.name].count_documents(query)
            except Exception as e:
                print(f"MongoDB count_documents error: {e}")
        return len(self.find(query))

    def delete_many(self, query=None):
        query = query or {}
        if is_mongo_active and db is not None:
            try:
                return db[self.name].delete_many(query)
            except Exception:
                pass
        data = load_fallback()
        data[self.name] = []
        save_fallback(data)

users_col = CollectionWrapper("users")
complaints_col = CollectionWrapper("complaints")
departments_col = CollectionWrapper("departments")
status_history_col = CollectionWrapper("status_history")
notifications_col = CollectionWrapper("notifications")
