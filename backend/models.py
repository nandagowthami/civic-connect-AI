from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class UserRole(str):
    CITIZEN = "citizen"
    ADMIN = "admin"
    OFFICER = "officer"

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = ""
    role: Optional[str] = "citizen"
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = ""
    role: str
    department: Optional[str] = None
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LocationModel(BaseModel):
    address: str
    landmark: Optional[str] = ""
    latitude: float
    longitude: float

class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = "Other"
    address: str
    landmark: Optional[str] = ""
    latitude: float
    longitude: float
    image_url: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = ""
    resolution_proof_url: Optional[str] = None

class DepartmentAssign(BaseModel):
    department: str
    assigned_officer_id: Optional[str] = None
    notes: Optional[str] = ""

class SupportComplaint(BaseModel):
    notes: Optional[str] = ""
