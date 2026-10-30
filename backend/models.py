from typing import List, Optional, Any, Dict, Literal
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
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

class ComplaintCreate(BaseModel):
    title: str = Field(min_length=5, max_length=140)
    description: str = Field(min_length=10, max_length=5000)
    category: Optional[str] = Field(default="Other", max_length=60)
    address: str = Field(min_length=3, max_length=300)
    landmark: Optional[str] = Field(default="", max_length=200)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    image_url: Optional[str] = Field(default=None, max_length=500)

class StatusUpdate(BaseModel):
    status: Literal["Submitted", "Under AI Review", "Assigned", "In Progress", "Resolved", "Rejected"]
    notes: Optional[str] = Field(default="", max_length=1000)
    resolution_proof_url: Optional[str] = Field(default=None, max_length=500)

class DepartmentAssign(BaseModel):
    department: str = Field(min_length=3, max_length=120)
    assigned_officer_id: Optional[str] = Field(default=None, max_length=120)
    notes: Optional[str] = Field(default="", max_length=1000)

class SupportComplaint(BaseModel):
    notes: Optional[str] = Field(default="", max_length=500)
