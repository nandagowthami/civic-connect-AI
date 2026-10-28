from fpdf import FPDF
import os

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "CivicConnect_AI_Technical_Overview.pdf")

INDIGO        = (63,  81, 181)
INDIGO_LIGHT  = (232, 234, 246)
SLATE_DARK    = (30,  41,  59)
SLATE_MID     = (71,  85, 105)
SLATE_LIGHT   = (241, 245, 249)
WHITE         = (255, 255, 255)
GREEN         = (22, 163,  74)
GREEN_LIGHT   = (220, 252, 231)
AMBER         = (180, 108,   0)
AMBER_LIGHT   = (254, 243, 199)
BLUE          = ( 37, 99,  235)
BLUE_LIGHT    = (219, 234, 254)
PURPLE        = (109,  40, 217)
PURPLE_LIGHT  = (237, 233, 254)
RED_LIGHT     = (254, 226, 226)
BORDER_GREY   = (203, 213, 225)

class PDF(FPDF):
    def header(self):
        self.set_fill_color(*INDIGO)
        self.rect(0, 0, 210, 28, style='F')
        self.set_xy(0, 5)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*WHITE)
        self.cell(0, 10, "CivicConnect AI", align="C")
        self.ln()
        self.set_font("Helvetica", "", 9)
        self.set_text_color(200, 210, 255)
        self.cell(0, 6, "Technical Architecture Overview", align="C")
        self.ln()
        self.set_text_color(*SLATE_DARK)
        self.ln(6)

    def footer(self):
        self.set_y(-13)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*SLATE_MID)
        self.set_draw_color(*BORDER_GREY)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(1)
        self.cell(0, 6, f"CivicConnect AI  |  Technical Overview  |  Page {self.page_no()}", align="C")

    def section_title(self, num, title, bg=INDIGO_LIGHT, fg=INDIGO):
        self.ln(3)
        self.set_fill_color(*bg)
        self.set_draw_color(*fg)
        self.set_line_width(0.5)
        self.rect(10, self.get_y(), 190, 9, style='FD')
        self.set_xy(13, self.get_y() + 1.5)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*fg)
        self.cell(0, 6, f"{num}.  {title}")
        self.ln()
        self.set_text_color(*SLATE_DARK)
        self.ln(1)

    def body(self, text, indent=13):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*SLATE_DARK)
        self.set_x(indent)
        self.multi_cell(190 - (indent - 10), 5.5, text)

    def bullet(self, label, value, label_w=62, indent=15):
        self.set_x(indent)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*SLATE_DARK)
        self.cell(label_w, 5.5, label)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*SLATE_MID)
        self.multi_cell(190 - label_w - (indent - 10), 5.5, value)

    def kv_row(self, key, val, bg=None):
        y = self.get_y()
        if bg:
            self.set_fill_color(*bg)
            self.rect(10, y, 190, 7, style='F')
        self.set_x(13)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*SLATE_DARK)
        self.cell(60, 7, key)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*SLATE_MID)
        self.cell(130, 7, val)
        self.ln()

    def table_header(self, cols, widths):
        self.set_fill_color(*INDIGO)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 9)
        self.set_x(10)
        for col, w in zip(cols, widths):
            self.cell(w, 7, col, fill=True, align="C")
        self.ln()

    def table_row(self, cells, widths, bg=WHITE):
        self.set_fill_color(*bg)
        self.set_text_color(*SLATE_DARK)
        self.set_font("Helvetica", "", 8.5)
        self.set_x(10)
        for cell, w in zip(cells, widths):
            self.cell(w, 6.5, cell, fill=True, align="C")
        self.ln()

    def divider(self):
        self.set_draw_color(*BORDER_GREY)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)

    def info_box(self, text, bg=SLATE_LIGHT, fg=SLATE_MID):
        self.set_x(10)
        self.set_fill_color(*bg)
        self.set_draw_color(*fg)
        self.set_line_width(0.3)
        self.set_font("Helvetica", "I", 8.8)
        self.set_text_color(*fg)
        self.multi_cell(190, 5.5, text, border=1, fill=True)
        self.set_text_color(*SLATE_DARK)
        self.ln(1)

    def sub_heading(self, text, fg=AMBER):
        self.set_font("Helvetica", "B", 9.5)
        self.set_text_color(*fg)
        self.set_x(13)
        self.cell(0, 6, text)
        self.ln()
        self.set_text_color(*SLATE_DARK)


# ---------------------------------------------------------------
pdf = PDF()
pdf.set_auto_page_break(auto=True, margin=18)
pdf.add_page()

# Meta bar
pdf.set_fill_color(*SLATE_LIGHT)
pdf.rect(10, pdf.get_y(), 190, 10, style='F')
pdf.set_x(13)
pdf.set_font("Helvetica", "", 8.5)
pdf.set_text_color(*SLATE_MID)
pdf.cell(63, 10, "Project:  CivicConnect AI")
pdf.cell(63, 10, "Type:  Full-Stack Web Application")
pdf.cell(64, 10, "Date:  October 2026")
pdf.ln()
pdf.ln(4)

# ── 1. FRONTEND ──────────────────────────────────────────────────
pdf.section_title("1", "Frontend", bg=BLUE_LIGHT, fg=BLUE)

pdf.bullet("Framework:",      "React 18 with Vite (fast HMR dev server, ES-module bundler)")
pdf.bullet("Styling:",        "TailwindCSS v3 with a custom 'smart-*' colour palette (indigo-based)")
pdf.bullet("Icons / Charts:", "lucide-react (icons),  recharts (analytics charts)")
pdf.bullet("Maps:",           "react-leaflet wrapping OpenStreetMap tiles (Leaflet.js)")
pdf.bullet("HTTP Client:",    "axios -- all /api/* calls proxied from port 5173 -> 8000 via vite.config.js")
pdf.bullet("Auth State:",     "Custom React Context (AuthContext.jsx) -- no Redux. JWT + user in localStorage")
pdf.bullet("Navigation:",     "useState tab switching in App.jsx (no React Router, no URL changes)")
pdf.bullet("Polling:",        "Notifications fetched every 15 s via setInterval inside AuthContext")
pdf.ln(2)
pdf.info_box(
    "Key Choice: Tab-based navigation (currentTab state) is used instead of React Router,"
    " keeping the SPA self-contained without URL management. Trades deep-link support"
    " for simplicity.",
    bg=BLUE_LIGHT, fg=BLUE
)

# ── 2. BACKEND ──────────────────────────────────────────────────
pdf.section_title("2", "Backend", bg=PURPLE_LIGHT, fg=PURPLE)

pdf.bullet("Framework:",    "FastAPI (Python) -- async ASGI framework, auto OpenAPI /docs")
pdf.bullet("Server:",       "Uvicorn ASGI (port 8000), --reload flag in dev mode")
pdf.bullet("Structure:",    "Modular routers: auth.py, issues.py, departments.py, analytics.py, notifications.py")
pdf.bullet("Auth:",         "JWT tokens via python-jose; SHA-256 + salt hashing (not bcrypt)")
pdf.bullet("Token Expiry:", "7 days (optimised for demo / testing workflows)")
pdf.bullet("Demo Auth:",    "POST /api/auth/demo-switch/{role} -- 1-click role impersonation endpoint")
pdf.bullet("Uploads:",      "python-multipart handles multipart; images saved to /uploads/proofs/")
pdf.bullet("Static Files:", "Starlette StaticFiles mounts /uploads as a public HTTP endpoint")
pdf.bullet("CORS:",         "Fully open (allow_origins=['*']) -- suitable for local development")
pdf.ln(2)

pdf.set_font("Helvetica", "B", 9)
pdf.set_text_color(*PURPLE)
pdf.set_x(13)
pdf.cell(0, 6, "Router Modules:")
pdf.ln()
pdf.set_text_color(*SLATE_DARK)

routers = [
    ("auth.py",           "Register, login, /me profile, demo role-switch"),
    ("issues.py",         "CRUD for complaints, AI submission, duplicate detection"),
    ("departments.py",    "Department listings, officer assignment"),
    ("analytics.py",      "Aggregated stats for admin dashboard charts"),
    ("notifications.py",  "Notification feed, mark-as-read, 15s polling support"),
]
alt = False
for r, desc in routers:
    pdf.kv_row(r, desc, bg=SLATE_LIGHT if alt else WHITE)
    alt = not alt

# ── 3. DATABASE ──────────────────────────────────────────────────
pdf.section_title("3", "Database", bg=GREEN_LIGHT, fg=GREEN)

pdf.bullet("Primary DB:",   "MongoDB -- pymongo driver, URI: mongodb://localhost:27017")
pdf.bullet("DB Name:",      "civicconnect_ai")
pdf.bullet("Collections:",  "users, complaints, departments, status_history, notifications")
pdf.bullet("Indexes:",      "Unique on email; unique on complaint_id; indexed on status, priority, department, created_at")
pdf.ln(2)

pdf.sub_heading("Smart JSON Fallback System:", fg=GREEN)
pdf.body(
    "If MongoDB is unavailable, the entire DB layer falls back automatically to a local"
    " flat-file store (backend/local_store.json). A custom CollectionWrapper class in"
    " database.py mimics the MongoDB API surface -- find, find_one, insert_one, update_one,"
    " count_documents, delete_many -- including $set, $push, $inc operators, query"
    " matching, sorting, and limit. The file auto-saves after every write.",
    indent=15
)
pdf.ln(1)
pdf.info_box(
    "Result: The app runs fully offline without any MongoDB installation."
    " Zero infrastructure dependencies for demos or evaluation.",
    bg=GREEN_LIGHT, fg=GREEN
)

# ── 4. AI ENGINE ──────────────────────────────────────────────────
pdf.section_title("4", "AI Engine  (ai_engine.py)", bg=AMBER_LIGHT, fg=AMBER)

pdf.info_box(
    "Important: There is NO external AI API (no OpenAI, no Gemini, no cloud calls)."
    " The entire pipeline runs locally in pure Python -- zero internet dependency.",
    bg=AMBER_LIGHT, fg=AMBER
)
pdf.ln(1)

# Step 1
pdf.sub_heading("Step 1 -- NLP Text Categorization", fg=AMBER)
pdf.body(
    "Scans issue title + description for keyword matches against a predefined category"
    " dictionary (Road Damage, Water Leakage, Garbage Problem, Streetlight Failure, etc.)."
    " Title keywords score 3 pts; description keywords score 2 pts. The user's manually"
    " selected category adds 4 bonus pts. The highest-scoring category wins.",
    indent=15
)
pdf.ln(2)

# Step 2
pdf.sub_heading("Step 2 -- Computer Vision via Pillow (no ML model)", fg=AMBER)
pdf.body(
    "Analyzes uploaded images using raw pixel arithmetic -- no neural network required."
    " Detects: edge roughness via horizontal/vertical pixel gradient differences (pothole"
    " damage proxy); mean brightness (dim = nighttime hazard); RGB variance (garbage /litter"
    " texture); grey reflectivity (water ponding signature). Produces a"
    " visual_confidence_boost (0-12) applied to the priority score.",
    indent=15
)
pdf.ln(2)

# Step 3 table
pdf.sub_heading("Step 3 -- Multi-Factor Priority Scoring  (max 100 pts)", fg=AMBER)
pdf.ln(1)
pdf.table_header(["Factor", "Max Pts", "How it is calculated"], [72, 26, 92])
rows = [
    ("Base Severity (by category)",       "40", "Hardcoded per category + image edge-roughness boost"),
    ("Public Safety Hazard Keywords",      "25", "Trigger word count x 8 pts  (danger, sparking, collapse...)"),
    ("Location Importance",                "15", "Keyword match: school, hospital, railway, highway..."),
    ("Citizen Crowd / Duplicate Reports",  "20", "1 report=0, 2-3=8 pts, 4-6=14 pts, 7+=20 pts"),
]
alt = False
for r in rows:
    pdf.table_row(r, [72, 26, 92], bg=SLATE_LIGHT if alt else WHITE)
    alt = not alt

pdf.ln(3)
pdf.set_font("Helvetica", "B", 9)
pdf.set_text_color(*SLATE_DARK)
pdf.set_x(13)
pdf.cell(0, 5.5, "Priority Thresholds:")
pdf.ln()
pdf.table_header(["Priority Level", "Condition", "Badge"], [48, 97, 45])
pdf.table_row(["HIGH",   "Score >= 70  OR  safety score >= 20", "Red    (critical)"], [48, 97, 45], bg=RED_LIGHT)
pdf.table_row(["MEDIUM", "Score  42 - 69",                      "Amber  (moderate)"], [48, 97, 45], bg=AMBER_LIGHT)
pdf.table_row(["LOW",    "Score  < 42",                         "Green  (routine)"],  [48, 97, 45], bg=GREEN_LIGHT)
pdf.ln(2)

# Step 4
pdf.sub_heading("Step 4 -- Duplicate Issue Detection", fg=AMBER)
pdf.body(
    "Uses the Haversine formula to compute great-circle distance (in metres) between the"
    " incoming report and all existing open complaints. If another complaint is within 150 m,"
    " a Jaccard-style word-overlap similarity check (threshold > 0.25) and/or exact category"
    " match is performed. On a match, the new submission is linked to the parent complaint and"
    " the parent's report_count is incremented -- boosting its crowd priority score.",
    indent=15
)
pdf.ln(2)

# Step 5
pdf.sub_heading("Step 5 -- Department Routing", fg=AMBER)
pdf.body(
    "Each category has a statically configured target department in the CATEGORIES dictionary:"
    " Road Damage -> Roads & Transportation Dept,"
    " Water Leakage -> Water Supply Dept,"
    " Garbage Problem -> Sanitation Dept,"
    " Public Safety Issue -> Emergency / Public Safety Dept, etc."
    " After classification, the AI maps the detected category to its department instantly.",
    indent=15
)

# ── 5. KEY DESIGN DECISIONS ──────────────────────────────────────
pdf.section_title("5", "Key Design Decisions", bg=INDIGO_LIGHT, fg=INDIGO)

decisions = [
    ("No External AI API",         "Fully offline; zero API costs, no rate limits, no latency"),
    ("JSON Fallback Database",      "App runs without MongoDB -- great for demos and evaluation"),
    ("SHA-256 Auth (no bcrypt)",    "Lightweight; no C-extension dependency; fast on Python 3.13"),
    ("Tab-based Navigation",        "Simpler than React Router; no URL management for SPA demo"),
    ("Vite Proxy for API",          "Frontend (5173) and backend (8000) separate; Vite forwards /api/* transparently"),
    ("CollectionWrapper Pattern",   "Abstracts MongoDB vs JSON; swap DB backend with zero frontend changes"),
    ("Seed Data on Startup",        "seed_data.py runs at uvicorn startup to populate realistic civic issues"),
    ("Static File Uploads",         "Images on disk (not in DB); Starlette serves /uploads as static mount"),
]
alt = False
for key, val in decisions:
    pdf.kv_row(key, val, bg=SLATE_LIGHT if alt else WHITE)
    alt = not alt

# ── 6. TECH STACK SUMMARY ────────────────────────────────────────
pdf.section_title("6", "Tech Stack at a Glance", bg=PURPLE_LIGHT, fg=PURPLE)

headers = ("Layer", "Technology", "Version / Notes")
pdf.table_header(headers, [52, 72, 66])
stack = [
    ("Frontend",          "React + Vite",                "React 18, Vite 6"),
    ("CSS Framework",     "TailwindCSS",                 "v3.4 with custom palette"),
    ("Maps",              "Leaflet / react-leaflet",     "OpenStreetMap tiles"),
    ("Charts",            "Recharts",                    "v2.15"),
    ("Backend",           "FastAPI + Uvicorn",           "FastAPI 0.162, Uvicorn 0.54"),
    ("Language",          "Python",                      "3.13"),
    ("Database",          "MongoDB + JSON fallback",     "pymongo 4.19"),
    ("Auth",              "JWT via python-jose",         "HS256, 7-day tokens"),
    ("Image Processing",  "Pillow",                      "v12, raw pixel analysis"),
    ("HTTP Client",       "axios",                       "v1.7 (frontend)"),
]
for i, row in enumerate(stack):
    pdf.table_row(row, [52, 72, 66], bg=SLATE_LIGHT if i % 2 else WHITE)

pdf.ln(5)
pdf.divider()
pdf.set_font("Helvetica", "I", 8)
pdf.set_text_color(*SLATE_MID)
pdf.cell(0, 5, "Generated from codebase analysis  |  CivicConnect AI Project  |  October 2026", align="C")
pdf.ln()

pdf.output(OUTPUT_PATH)
print(f"PDF saved -> {OUTPUT_PATH}")
