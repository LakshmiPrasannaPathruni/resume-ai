import pandas as pd
from typing import List, Dict, Any
import os
import re
from fuzzywuzzy import fuzz


class JobRolePredictor:
    """
    Intelligent Job Role Suggestion Engine (Render Compatible)

    Features:
      • Cleans and flattens skill text
      • Detects Technical / Non-Technical / Mixed resumes
      • Suggests best-fit roles with insights
      • Returns fuzzy-matched related roles
      • Includes lightweight 'secondary' job titles for cross-domain exploration
    """

    def __init__(self, csv_path: str = None):
        if csv_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            csv_path = os.path.join(base_dir, "job_roles.csv")

        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Job roles CSV not found at {csv_path}")

        # Load dataset
        self.roles_df = pd.read_csv(csv_path)
        self.roles_df.columns = [c.strip().lower() for c in self.roles_df.columns]

        if "job title" not in self.roles_df.columns or "required skills" not in self.roles_df.columns:
            raise ValueError("CSV must contain 'Job Title' and 'Required Skills' columns.")

        # Clean skills
        def clean_skills(skill_text: str) -> List[str]:
            if pd.isna(skill_text):
                return []
            text = re.sub(r"[\(\)]", "", skill_text)
            parts = [x.strip().lower() for x in text.split(",") if x.strip()]
            return parts

        self.roles_df["required skills"] = self.roles_df["required skills"].apply(clean_skills)

    # ------------------------------------------------------------------
    # Resume Type Detection
    # ------------------------------------------------------------------
    def detect_resume_type(self, skills: List[str]) -> str:
        tech_keywords = {
            "python", "java", "c", "c++", "javascript", "html", "css",
            "sql", "database", "react", "node", "testing", "automation",
            "debugging", "linux", "programming", "system", "algorithms",
            "development", "engineering", "devops", "network", "data",
            "cloud", "ml", "ai", "software", "hardware"
        }

        soft_keywords = {
            "communication", "writing", "presentation", "teamwork", "organization",
            "leadership", "time management", "creativity", "adaptability",
            "problem-solving", "negotiation", "critical thinking", "collaboration",
            "reporting", "planning", "customer service"
        }

        total = len(skills) or 1
        sset = set(skills)
        tech_ratio = len(sset & tech_keywords) / total
        soft_ratio = len(sset & soft_keywords) / total

        if tech_ratio >= 0.25:
            return "Technical"
        elif soft_ratio >= 0.25 and tech_ratio < 0.15:
            return "Non-Technical"
        else:
            return "Mixed"

    # ------------------------------------------------------------------
    # Related Job Roles (via Fuzzy Matching)
    # ------------------------------------------------------------------
    def find_related_roles(self, base_role: str, top_n: int = 5) -> List[str]:
        related = []
        for _, row in self.roles_df.iterrows():
            role_name = row["job title"]
            if role_name.lower() == base_role.lower():
                continue
            score = fuzz.token_sort_ratio(base_role.lower(), role_name.lower())
            if score >= 55:
                related.append((role_name, score))
        related_sorted = sorted(related, key=lambda x: x[1], reverse=True)
        return [r[0] for r in related_sorted[:top_n]]

    # ------------------------------------------------------------------
    # Core Suggestion Logic
    # ------------------------------------------------------------------
    def suggest_roles(self, user_skills: List[str]) -> Dict[str, Any]:
        if not user_skills:
            return {"message": "No skills found in resume to compare."}

        user_skills_lower = [s.lower().strip() for s in user_skills]
        resume_type = self.detect_resume_type(user_skills_lower)

        main_suggestions = []
        secondary_titles = set()

        for _, row in self.roles_df.iterrows():
            role = row["job title"]
            job_skills = row["required skills"]

            # Determine relevance group (main vs secondary)
            if resume_type == "Technical":
                if any(k in role.lower() for k in [
                    "hr", "assistant", "manager", "director", "marketing",
                    "recruiter", "sales", "writer", "communication",
                    "scheduler", "trainer", "public relations", "content",
                    "designer", "artist", "dispatch", "clerk"
                ]):
                    group = "secondary"
                elif any(k in role.lower() for k in [
                    "developer", "engineer", "programmer", "tester", "qa",
                    "data", "ai", "ml", "software", "hardware", "cyber",
                    "cloud", "devops", "scientist", "analyst", "architect"
                ]):
                    group = "main"
                else:
                    group = "secondary"

            elif resume_type == "Non-Technical":
                if any(k in role.lower() for k in [
                    "developer", "engineer", "programmer", "tester",
                    "qa", "data", "ml", "ai", "software", "devops"
                ]):
                    group = "secondary"
                else:
                    group = "main"
            else:
                group = "main"

            # Compute overlap
            matched = set(user_skills_lower) & set(job_skills)
            missing = list(set(job_skills) - set(user_skills_lower))
            total = len(set(job_skills))
            score = round((len(matched) / total) * 100, 2) if total else 0

            if score >= 25:
                if score >= 80:
                    note = "Excellent match — you are highly suited for this role."
                elif score >= 50:
                    note = "Strong potential fit — consider learning a few additional skills."
                else:
                    note = "Partial match — could become a strong fit with focused upskilling."

                if group == "main":
                    main_suggestions.append({
                        "job_title": role,
                        "match_score": score,
                        "matched_skills": sorted(list(matched)),
                        "missing_skills": sorted(missing),
                        "insight": note,
                        "related_roles": self.find_related_roles(role)
                    })
                elif group == "secondary":
                    secondary_titles.add(role)

        # Sort and limit
        main_suggestions = sorted(main_suggestions, key=lambda x: x["match_score"], reverse=True)[:5]
        secondary_titles = sorted(list(secondary_titles))[:5]

        return {
            "resume_type": resume_type,
            "total_roles_considered": len(self.roles_df),
            "main_suggestions": main_suggestions,
            "secondary_exploration": secondary_titles
        }

