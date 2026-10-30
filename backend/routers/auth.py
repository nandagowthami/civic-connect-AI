import os
import hashlib
import hmac
import secrets
import re
import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from database import users_col
from models import UserRegister, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

APP_ENV = os.getenv("APP_ENV", "development").lower()
SECRET_KEY = os.getenv("JWT_SECRET") or "local-development-only-change-before-deploying"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days for ease of testing

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 310_000)
    return f"pbkdf2_sha256$310000${salt.hex()}${digest.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        algorithm, rounds, salt_hex, digest_hex = hashed_password.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", plain_password.encode("utf-8"), bytes.fromhex(salt_hex), int(rounds)
        )
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        # Legacy local demo accounts are upgraded after a successful login.
        legacy = hashlib.sha256(("civicconnect_ai_salt_" + plain_password).encode("utf-8")).hexdigest()
        return hmac.compare_digest(legacy, hashed_password or "")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    if not credentials:
        return None
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            return None
    except JWTError:
        return None

    user = users_col.find_one({"_id": user_id})
    if not user:
        user = users_col.find_one({"id": user_id})
    return user

def require_current_user(user: Optional[dict] = Depends(get_current_user)) -> dict:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in."
        )
    return user


def require_admin(user: dict = Depends(require_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required.")
    return user


def require_officer_or_admin(user: dict = Depends(require_current_user)) -> dict:
    if user.get("role") not in {"officer", "admin"}:
        raise HTTPException(status_code=403, detail="Officer access required.")
    return user

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister):
    username = req.email.split("@", 1)[0]
    if not req.email.lower().endswith("@citizen.local") or not re.fullmatch(r"[a-zA-Z0-9._-]{3,24}", username):
        raise HTTPException(status_code=400, detail="Choose a username using 3–24 letters, numbers, dots, underscores, or hyphens.")
    if len(req.password) < 12:
        raise HTTPException(status_code=400, detail="Choose a password with at least 12 characters.")
    req_email = f"{username.lower()}@citizen.local"
    existing = users_col.find_one({"email": req_email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "id": user_id,
        "name": "Anonymous Citizen",
        "email": req_email,
        "password_hash": hash_password(req.password),
        "phone": "",
        # Public registration can only create citizen accounts.
        "role": "citizen",
        "department": None,
        "created_at": datetime.utcnow().isoformat()
    }
    users_col.insert_one(user_doc)

    access_token = create_access_token(data={"sub": user_id, "role": user_doc["role"], "name": user_doc["name"]})
    user_res = UserResponse(
        id=user_id,
        name=user_doc["name"],
        email=user_doc["email"],
        phone=user_doc["phone"],
        role=user_doc["role"],
        department=user_doc.get("department"),
        created_at=user_doc["created_at"]
    )
    return TokenResponse(access_token=access_token, user=user_res)

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin):
    login_identifier = req.email.strip().lower()
    if "@" not in login_identifier:
        login_identifier = f"{login_identifier}@citizen.local"
    user = users_col.find_one({"email": login_identifier})
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.get("password_hash", "").startswith("pbkdf2_sha256$"):
        users_col.update_one({"_id": user.get("_id")}, {"$set": {"password_hash": hash_password(req.password)}})
    
    uid = str(user.get("_id") or user.get("id"))
    access_token = create_access_token(data={"sub": uid, "role": user.get("role"), "name": user.get("name")})
    user_res = UserResponse(
        id=uid,
        name=user["name"],
        email=user["email"],
        phone=user.get("phone", ""),
        role=user.get("role", "citizen"),
        department=user.get("department"),
        created_at=user.get("created_at")
    )
    return TokenResponse(access_token=access_token, user=user_res)

@router.get("/me", response_model=UserResponse)
def me(user: dict = Depends(require_current_user)):
    uid = str(user.get("_id") or user.get("id"))
    return UserResponse(
        id=uid,
        name=user["name"],
        email=user["email"],
        phone=user.get("phone", ""),
        role=user.get("role", "citizen"),
        department=user.get("department"),
        created_at=user.get("created_at")
    )

@router.post("/demo-switch/{role_key}", response_model=TokenResponse)
def demo_switch(role_key: str, demo_access_key: Optional[str] = Header(None, alias="X-Demo-Key")):
    """
    Convenient 1-click role switcher for live demo and testing:
    - 'citizen' -> Citizen user
    - 'admin' -> Smart City Government Authority / Admin
    - 'roads_officer' -> Roads & Transportation Department Officer
    - 'sanitation_officer' -> Sanitation Department Officer
    - 'electricity_officer' -> Electricity Department Officer
    - 'water_officer' -> Water Supply Department Officer
    """
    if os.getenv("DEMO_MODE", "true").lower() not in {"1", "true", "yes"}:
        raise HTTPException(status_code=404, detail="Demo sign-in is disabled.")
    if APP_ENV == "production":
        expected_key = os.getenv("DEMO_ACCESS_KEY", "")
        if not expected_key or len(expected_key) < 24:
            raise HTTPException(status_code=404, detail="Demo sign-in is disabled.")
        if not demo_access_key or not hmac.compare_digest(demo_access_key, expected_key):
            raise HTTPException(status_code=403, detail="A valid demo access key is required.")

    email_map = {
        "citizen": "citizen@smartcity.gov",
        "admin": "admin@smartcity.gov",
        "roads_officer": "officer.roads@smartcity.gov",
        "sanitation_officer": "officer.sanitation@smartcity.gov",
        "electricity_officer": "officer.electricity@smartcity.gov",
        "water_officer": "officer.water@smartcity.gov"
    }

    target_email = email_map.get(role_key.lower())
    if not target_email:
        target_email = "citizen@smartcity.gov"

    user = users_col.find_one({"email": target_email})
    if not user:
        # Fallback to any user of that role
        user = users_col.find_one({"role": "admin" if role_key == "admin" else "citizen"})

    if not user:
        raise HTTPException(status_code=404, detail="Demo account not found. Seed data might be missing.")

    uid = str(user.get("_id") or user.get("id"))
    access_token = create_access_token(data={"sub": uid, "role": user.get("role"), "name": user.get("name")})
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=uid,
            name=user["name"],
            email=user["email"],
            phone=user.get("phone", ""),
            role=user.get("role", "citizen"),
            department=user.get("department"),
            created_at=user.get("created_at")
        )
    )
