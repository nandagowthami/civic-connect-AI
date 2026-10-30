# CivicConnect AI – Crowdsourced Civic Issue Reporting and AI-Based Priority Routing System

A modern, responsive Smart City civic issue reporting portal and automated priority routing system built with **FastAPI**, **MongoDB**, **React**, **Tailwind CSS**, **Leaflet (OpenStreetMap)**, and **Recharts**.

---

## 🌟 Key Features

### 1. Citizen Issue Reporting
- **Multimodal Uploads**: Capture and upload photographic proof of public infrastructure failures (potholes, garbage, broken streetlights, water pipeline leaks, sewer overflows).
- **Interactive Geocoding & GPS**: Draggable pin on OpenStreetMap or one-click automatic GPS geolocation detection.
- **Instant AI Multimodal Analysis**: Real-time evaluation of image surface roughness, texture, specular reflection, and text description urgency markers.

### 2. Civic AI Engine
- **Computer Vision Visual Damage Inspection**: Extracts image feature statistics (contrast, edge density, color variance) to detect potholes, asphalt cracks, debris, or water pooling.
- **NLP Text Classification**: Evaluates title and description against civic ontologies and hazard keywords (*"accident"*, *"electric wire"*, *"flooding"*, *"school zone"*, *"hospital"*).
- **Multi-Factor Priority Formula**:
  $$\text{Priority Score} = \text{Severity} (0\text{-}40) + \text{Safety Hazard} (0\text{-}25) + \text{Location Criticality} (0\text{-}15) + \text{Citizen Density} (0\text{-}20)$$
  - 🔴 **HIGH PRIORITY**: Score $\ge 70$ (or critical safety hazard $\ge 20$)
  - 🟠 **MEDIUM PRIORITY**: $42 \le \text{Score} < 70$
  - 🟢 **LOW PRIORITY**: $\text{Score} < 42$
- **Automatic Department Routing**: Auto-routes directly to Roads, Sanitation, Electricity, Water Supply, Municipal Engineering, or Emergency / Public Safety.
- **Spatial Duplicate Clustering**: Computes Haversine distance between new and active reports within 150m. If matching issues are found, reports are clustered (*"Reported by 9 citizens"*), elevating the issue's priority score.

### 3. Comprehensive Complaint Tracking
- Search complaints by **Complaint ID** (`CC-2026-XXXX`). Citizens can report and track a complaint ID without providing contact details.
- Interactive 5-step visual progress timeline:
  `Submitted` $\to$ `AI Verified` $\to$ `Assigned` $\to$ `In Progress` $\to$ `Resolved`.
- Citizen **"I Also Face This Issue"** crowd upvote button.
- Verification of before & after resolution photographs and official audit log history.

### 4. Role-Based Portals & One-Click Demo Switcher
- **Citizen Portal**: Personal dashboard, complaint cards, status filters, report history.
- **Government Authority / Admin Portal**: City-wide KPI cards, interactive Recharts analytics (Category breakdown, Priority distribution, Department workloads, Monthly statistics, Resolution rate %), department reassignment, and status management.
- **Department Officer Portal**: Dedicated work queues for Roads, Sanitation, Electricity, Water, etc., workflow progression (`Start Work` $\to$ `Update Notes` $\to$ `Upload Resolution Proof & Resolve`).
- **One-Click Persona Switcher**: In the navigation bar, seamlessly switch between Citizen, Municipal Admin, Roads Officer, Sanitation Officer, Electricity Officer, and Water Officer without retyping passwords.

### 5. Interactive Public Map
- Fullscreen Leaflet / OpenStreetMap view with color-coded pins:
  - 🔴 Red Marker: High Priority
  - 🟠 Orange Marker: Medium Priority
  - 🟢 Green Marker: Low Priority
- Clickable popup modal displaying photo thumbnail, category, priority, status, address, and direct audit link.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet, Recharts, Canvas-Confetti |
| **Backend** | Python 3, FastAPI, Uvicorn, Pydantic, Python-Jose (JWT), Passlib / Cryptography |
| **Database** | MongoDB Atlas in production; local JSON fallback for development only |
| **AI / Machine Learning** | Python Computer Vision (PIL/NumPy edge roughness & texture analysis) + NLP keyword extraction & Multi-factor Scoring Engine + Haversine spatial duplicate detector |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (Running on `localhost:27017` or uses included local fallback)

### Quick Run (Windows)
Double click `run_app.bat` or run:
```powershell
# Terminal 1: Backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
API Swagger Documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

## Deploying to Vercel and Railway

Vercel builds the React frontend using `vercel.json`. Railway builds the FastAPI API from `Dockerfile`; MongoDB Atlas stores persistent application data. One Railway replica and one MongoDB cluster are sufficient for this small class demo. Add a Railway volume mounted at `/data` so uploaded report images persist across restarts.

1. Create a MongoDB Atlas database and copy its URI. Restrict network access to the Railway service where practical.
2. Deploy this repository to Railway using `railway.json` and `Dockerfile`. Add a volume mounted at `/data`.
3. Set the backend variables from `backend/.env.example` in Railway. Set `FRONTEND_ORIGINS` to the exact Vercel domain(s), plus a unique `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. The administrator account is created on first start.
4. Deploy this repository to Vercel. Set `VITE_API_BASE_URL` to the Railway public service URL. Leave `VITE_DEMO_MODE` unset or `false` unless you want the demo persona switcher visible.

Production refuses to start without MongoDB and strong JWT/admin credentials. It does not use the JSON fallback. `UPLOAD_DIR=/data/uploads` stores uploaded images on the Railway volume. Local development retains the JSON fallback and demo personas. To enable persona switching for a closed class demo, set `DEMO_MODE=true`, `DEMO_ACCESS_KEY` (at least 24 characters), and `DEMO_PASSWORD` (at least 12 characters) in Railway, then set `VITE_DEMO_MODE=true` in Vercel. The access key is prompted from the operator and is never baked into the frontend build; use only with a private class link.

---

## 👥 Default Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Citizen** | `citizen@smartcity.gov` | `password123` |
| **Municipal Admin** | `admin@smartcity.gov` | `admin123` |
| **Roads Officer** | `officer.roads@smartcity.gov` | `officer123` |
| **Sanitation Officer** | `officer.sanitation@smartcity.gov` | `officer123` |
| **Electricity Officer** | `officer.electricity@smartcity.gov` | `officer123` |
| **Water Supply Officer** | `officer.water@smartcity.gov` | `officer123` |

These demo credentials are for local development only. The deployed app uses the administrator credentials configured in Railway. Production persona switching is off by default and can be protected with the class access key described above.
