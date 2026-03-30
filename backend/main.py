from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import pandas as pd

# Import backend logic
from backend.core.parser_engine import ResumeReader
from backend.core.role_predictor import JobRolePredictor
from backend.core.job_skill_finder import find_skills_for_job


# ----------------- APP INITIALIZATION -----------------
app = FastAPI(title="AI Resume Reader & Job Skill Explorer")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Enable CORS (for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_PATH = os.path.join(os.path.dirname(__file__), "core", "job_roles.csv")


# ----------------- API ROUTES -----------------
api = FastAPI(title="Backend API Routes")

@api.get("/health")
async def health_check():
    """Check if backend API is running."""
    return {"status": "ok", "message": "Backend is alive!"}


@api.get("/job-titles/")
async def get_job_titles():
    """Return all available job titles."""
    if not os.path.exists(CSV_PATH):
        return JSONResponse(status_code=404, content={"error": "job_roles.csv not found"})
    df = pd.read_csv(CSV_PATH)
    if "Job Title" not in df.columns:
        return JSONResponse(status_code=400, content={"error": "Missing 'Job Title' column"})
    return {"job_titles": sorted(df["Job Title"].dropna().unique().tolist())}


@api.get("/job-skills/")
async def get_job_skills(title: str = Query(..., description="Job title to get skills for")):
    """Return skills for a given job title."""
    try:
        result = find_skills_for_job(title)
        if not result or "error" in result:
            return JSONResponse(status_code=404, content={"error": "No skills found for this job"})
        return result
    except Exception as e:
        print(f"❌ Error in /job-skills/: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@api.post("/upload/")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and parse a resume file."""
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    parser = ResumeReader(UPLOAD_DIR)
    parsed_data = parser.parse_resume(file.filename)
    return {"filename": file.filename, "parsed_data": parsed_data}


@api.post("/suggest-role/")
async def suggest_role(file: UploadFile = File(...)):
    """Suggest matching job roles for a resume."""
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    parser = ResumeReader(UPLOAD_DIR)
    parsed_data = parser.parse_resume(file.filename)
    skills = parsed_data.get("skills", [])

    predictor = JobRolePredictor()
    suggestions = predictor.suggest_roles(skills)
    return {
        "filename": file.filename,
        "skills_extracted": skills,
        "suggested_roles": suggestions,
    }


# Mount API app at /api
app.mount("/api", api)


# ----------------- FRONTEND ROUTING (FINAL FIX) -----------------
from starlette.responses import FileResponse
from starlette.requests import Request

frontend_path = os.path.join(os.path.dirname(__file__), "../frontend/dist")

# Serve static React build (JS, CSS, assets)
if os.path.exists(os.path.join(frontend_path, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

@app.middleware("http")
async def spa_fallback(request: Request, call_next):
    """
    Middleware that serves React index.html for any route not under /api.
    This prevents 404s when reloading SPA routes like /job-skills or /analyze.
    """
    # Handle API routes normally
    if request.url.path.startswith("/api"):
        return await call_next(request)

    # Try to serve normally
    response = await call_next(request)
    if response.status_code == 404:
        index_file = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
    return response


# Serve built React files statically under root
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")


@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Fallback to index.html for client-side routing."""
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return JSONResponse(status_code=404, content={"error": "Frontend not built"})

