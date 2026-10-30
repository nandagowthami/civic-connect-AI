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

## Deploying to Vercel, Render, and MongoDB Atlas

Use Vercel for the React frontend, Render for the FastAPI API, and MongoDB Atlas for persistent app data. This keeps the current Vercel site and replaces Railway with the Render account already available. The included `render.yaml` creates a small free API service. Render's free service sleeps after 15 minutes without requests and can take about a minute to wake. Its filesystem is temporary, so production uploads are stored in Atlas GridFS. This setup is intended for the class demo and a few simultaneous users, not production.

1. Create an Atlas database and a database user limited to the `civicconnect_ai` database. Atlas requires a network access list. Use the network option supported by your Atlas and Render plans; if you choose broad `0.0.0.0/0` access for this demo, use a strong unique database password and store no real personal data.
2. In Render, create a Blueprint from this repository and select `render.yaml`. Enter `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_ORIGINS`, `DEMO_ACCESS_KEY`, and `DEMO_PASSWORD` in Render's environment settings. Use unique secrets and never commit them. `FRONTEND_ORIGINS` is a comma-separated list of the exact Vercel production and preview domains. After the first deploy, copy the service's `onrender.com` URL.
3. In Vercel Project Settings → Environment Variables, set `VITE_API_BASE_URL` to the Render API URL and `VITE_DEMO_MODE=true`. Apply them to Preview and Production, then redeploy so Vite includes them in the frontend build. These `VITE_` variables are public configuration; never put secrets there.
4. At demo sign-in, enter the private `DEMO_ACCESS_KEY`, then choose a persona. All personas use the configured `DEMO_PASSWORD`. The API seeds anonymous example reports only if Atlas has no reports. Citizen registration asks only for a username and password.

Production refuses to start without Atlas and strong JWT/admin credentials; it never falls back to the local JSON database. Uploaded photos are stored in GridFS and survive Render restarts. The Vercel site is public to anyone with the link; use a long, unguessable demo access key and do not reuse demo passwords elsewhere.

---

## 👥 Demo Sign-in

The production role switcher uses the shared `DEMO_PASSWORD` configured in Render for each persona. The demo sign-in also requires the private `DEMO_ACCESS_KEY`. Never put either value in source code or a `VITE_` variable. Local development uses the sample credentials above; they are not valid in the deployed demo.
