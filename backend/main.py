from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import pandas as pd

print("🚀 Server booting...")

# ----------------- LAZY IMPORTS -----------------
def get_resume_reader():
    from backend.core.parser_engine import ResumeReader
    return ResumeReader

def get_role_predictor():
    from backend.core.role_predictor import JobRolePredictor
    return JobRolePredictor

def get_skill_finder():
    from backend.core.job_skill_finder import find_skills_for_job
    return find_skills_for_job


# ----------------- APP INIT -----------------
app = FastAPI(title="AI Resume Reader")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_PATH = os.path.join(os.path.dirname(__file__), "core", "job_roles.csv")


@app.on_event("startup")
async def startup():
    print("✅ FastAPI started successfully")


# ----------------- ROUTES -----------------
@app.get("/")
def home():
    return {"message": "API running 🚀"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/job-titles/")
async def get_job_titles():
    if not os.path.exists(CSV_PATH):
        return JSONResponse(status_code=404, content={"error": "CSV not found"})

    df = pd.read_csv(CSV_PATH)

    return {"job_titles": sorted(df["Job Title"].dropna().unique().tolist())}


@app.get("/api/job-skills/")
async def get_job_skills(title: str = Query(...)):
    try:
        find_skills_for_job = get_skill_finder()
        result = find_skills_for_job(title)

        if not result or "error" in result:
            return JSONResponse(status_code=404, content={"error": "No skills found"})

        return result

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/upload/")
async def upload_resume(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    ResumeReader = get_resume_reader()
    parser = ResumeReader(UPLOAD_DIR)

    parsed_data = parser.parse_resume(file.filename)

    return {"filename": file.filename, "parsed_data": parsed_data}


@app.post("/api/suggest-role/")
async def suggest_role(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    ResumeReader = get_resume_reader()
    parser = ResumeReader(UPLOAD_DIR)

    parsed_data = parser.parse_resume(file.filename)

    skills = parsed_data.get("skills", [])

    JobRolePredictor = get_role_predictor()
    predictor = JobRolePredictor()

    suggestions = predictor.suggest_roles(skills)

    return {
        "filename": file.filename,
        "skills_extracted": skills,
        "suggested_roles": suggestions,
    }