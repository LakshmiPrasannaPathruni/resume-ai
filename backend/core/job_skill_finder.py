import os
import pandas as pd
from sentence_transformers import SentenceTransformer, util
import torch

# ✅ Path to your dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), "job_roles.csv")

# ✅ Load model and dataset once
model = SentenceTransformer("all-MiniLM-L6-v2")
df = pd.read_csv(DATA_PATH)

if "Job Title" not in df.columns or "Required Skills" not in df.columns:
    raise ValueError("CSV must contain 'Job Title' and 'Required Skills' columns.")

# ✅ Pre-compute embeddings for all job titles
job_titles = df["Job Title"].astype(str).tolist()
job_embeddings = model.encode(job_titles, convert_to_tensor=True, show_progress_bar=False)


def categorize_skill(skill):
    skill = skill.lower()
    if any(word in skill for word in ["python", "sql", "java", "cloud", "ai", "ml", "data", "software", "programming"]):
        return "Technical Skills"
    elif any(word in skill for word in ["manage", "plan", "lead", "organize", "budget"]):
        return "Management Skills"
    else:
        return "Soft Skills"


def find_skills_for_job(job_title: str):
    if not job_title.strip():
        return {"error": "No job title provided"}

    query = job_title.strip()
    print(f"🔍 Searching for job title: {query}")  # Debug

    try:
        query_embedding = model.encode(query, convert_to_tensor=True)
        cosine_scores = util.cos_sim(query_embedding, job_embeddings)[0]
        top_results = torch.topk(cosine_scores, k=min(3, len(df)))

        matches = []
        for idx_tensor, score_tensor in zip(top_results.indices, top_results.values):
            idx = int(idx_tensor.item())
            score = float(score_tensor.item())

            job_name = df.iloc[idx]["Job Title"]
            skills_raw = str(df.iloc[idx]["Required Skills"]).split(",")
            skills = [s.strip().capitalize() for s in skills_raw if s.strip()]

            categorized = {}
            for skill in skills:
                cat = categorize_skill(skill)
                categorized.setdefault(cat, []).append(skill)

            matches.append({
                "job_title": job_name,
                "similarity_score": round(score * 100, 2),
                "total_skills": len(skills),
                "skills_by_category": categorized
            })

        if not matches:
            return {"error": "No matching job found"}

        return {
            "searched_title": query,
            "message": f"Top {len(matches)} closest job roles found.",
            "matched_roles": matches
        }

    except Exception as e:
        print(f"❌ Error in find_skills_for_job: {e}")
        return {"error": str(e)}

