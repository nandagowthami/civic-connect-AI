@echo off
echo =====================================================================
echo  CivicConnect AI - Crowdsourced Civic Reporting & AI Priority Routing
echo =====================================================================
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "CivicConnect AI Backend" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Vite Frontend on http://localhost:5173 ...
cd frontend
start "CivicConnect AI Frontend" cmd /k "npm run dev"

echo.
echo Both servers started!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo =====================================================================
pause
