from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
import jwt
import datetime
import random

# ─── NEW: Google Auth ───────────────────────────────────────────────────────
# pip install google-auth
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as grequests
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False
    print("[WARNING] google-auth not installed. Run: pip install google-auth")
    print("[WARNING] Google Sign-In will return 503 until installed.")
# ────────────────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)

JWT_SECRET = "pathforge_secret_2025"

# ─── IMPORTANT: Replace with your actual Google OAuth Client ID ─────────────
# Get it from: https://console.cloud.google.com → APIs & Services → Credentials
GOOGLE_CLIENT_ID = "178470613680-f7grjhb4s2evs8f8u36rtouljh6dpgj3.apps.googleusercontent.com"
# ────────────────────────────────────────────────────────────────────────────

db = {
    "users": [
        {
            "id": 1,
            "name": "Priya Sharma",
            "email": "priya@example.com",
            "password_hash": bcrypt.hashpw("password".encode(), bcrypt.gensalt()).decode(),
            "google_id": None,
            "profile": {
                "qualification": "ug",
                "field": "cs",
                "year": "2024",
                "timeline": "6m",
                "goals": ["IT Jobs", "Data & Analytics"],
                "interests": ["Technology", "Data Science"],
                "skills": {"prog": 60, "data": 40, "comm": 75, "prob": 70, "tech": 45},
                "tools": ["Excel", "Statistics"],
                "learning": ["Online Learning"],
                "hours": "10"
            },
            "skill_states": {},
            "streak": 5,
            "last_login": datetime.datetime.utcnow().isoformat()
        }
    ]
}

# ─────────────────────────────────────────────────────────────────────────────
# CAREERS  (original 12 + 6 new medical/healthcare careers)
# ─────────────────────────────────────────────────────────────────────────────
ALL_CAREERS = [
    # ── 1. Data Analyst ──────────────────────────────────────────────────────
    {
        "id": 1,
        "name": "Data Analyst",
        "nsqf_level": 5,
        "base_salary": {"0": [4.5, 7], "2": [7, 12], "4": [12, 18], "7": [18, 28]},
        "city_mult": {"bangalore": 1.2, "hyderabad": 1.1, "mumbai": 1.15, "delhi": 1.1, "pune": 1.0, "chennai": 0.95, "tier2": 0.75},
        "demand": "Very High",
        "growth": "+22%",
        "openings": "48,000",
        "tags": ["SQL", "Excel", "Power BI", "Statistics"],
        "skill_weights": {"prog": 0.15, "data": 0.35, "comm": 0.15, "prob": 0.20, "tech": 0.15},
        "tool_boost": {"SQL": 8, "Excel": 7, "Statistics": 7, "Power BI": 6, "Tableau": 6, "Python": 5},
        "goal_match": ["IT Jobs", "Data & Analytics"],
        "interest_match": ["Technology", "Data Science", "Business", "Finance"],
        "field_match": ["cs", "commerce", "science", "engg"],
        "required_skills": {
            "Python": {"needed_prog": 60, "weight": "high"},
            "SQL": {"needed_data": 50, "weight": "high"},
            "Data Visualization": {"needed_data": 40, "weight": "high"},
            "Power BI / Tableau": {"needed_tech": 40, "weight": "medium"},
            "Statistics": {"needed_data": 50, "weight": "medium"},
            "Excel Advanced": {"needed_data": 30, "weight": "low"},
            "Communication": {"needed_comm": 60, "weight": "low"}
        },
        "roadmap_template": "data_analyst"
    },
    # ── 2. Business Intelligence Analyst ─────────────────────────────────────
    {
        "id": 2,
        "name": "Business Intelligence Analyst",
        "nsqf_level": 5,
        "base_salary": {"0": [5, 8], "2": [8, 14], "4": [14, 22], "7": [22, 35]},
        "city_mult": {"bangalore": 1.2, "hyderabad": 1.1, "mumbai": 1.15, "delhi": 1.1, "pune": 1.0, "chennai": 0.95, "tier2": 0.75},
        "demand": "High",
        "growth": "+18%",
        "openings": "22,000",
        "tags": ["Power BI", "Tableau", "SQL", "Business Analysis"],
        "skill_weights": {"prog": 0.10, "data": 0.30, "comm": 0.25, "prob": 0.20, "tech": 0.15},
        "tool_boost": {"Power BI": 9, "Tableau": 9, "SQL": 8, "Excel": 6},
        "goal_match": ["IT Jobs", "Data & Analytics", "Business"],
        "interest_match": ["Technology", "Business", "Data Science", "Finance"],
        "field_match": ["cs", "commerce", "engg"],
        "required_skills": {
            "Power BI": {"needed_tech": 50, "weight": "high"},
            "Tableau": {"needed_tech": 40, "weight": "high"},
            "SQL": {"needed_data": 50, "weight": "high"},
            "Business Analysis": {"needed_comm": 60, "weight": "medium"},
            "DAX / M Language": {"needed_prog": 40, "weight": "medium"},
            "Data Modeling": {"needed_data": 40, "weight": "low"}
        },
        "roadmap_template": "bi_analyst"
    },
    # ── 3. AI / ML Technician ─────────────────────────────────────────────────
    {
        "id": 3,
        "name": "AI / ML Technician",
        "nsqf_level": 6,
        "base_salary": {"0": [7, 12], "2": [12, 20], "4": [20, 32], "7": [32, 55]},
        "city_mult": {"bangalore": 1.25, "hyderabad": 1.15, "mumbai": 1.15, "delhi": 1.1, "pune": 1.05, "chennai": 1.0, "tier2": 0.8},
        "demand": "Very High",
        "growth": "+42%",
        "openings": "38,000",
        "tags": ["Python", "Machine Learning", "TensorFlow", "Statistics"],
        "skill_weights": {"prog": 0.40, "data": 0.25, "comm": 0.10, "prob": 0.15, "tech": 0.10},
        "tool_boost": {"Python": 10, "ML": 10, "Statistics": 7, "Cloud": 5},
        "goal_match": ["IT Jobs"],
        "interest_match": ["Technology", "Data Science", "Research"],
        "field_match": ["cs", "engg", "science"],
        "required_skills": {
            "Python Advanced": {"needed_prog": 70, "weight": "high"},
            "Machine Learning": {"needed_prog": 60, "weight": "high"},
            "Statistics and Math": {"needed_data": 65, "weight": "high"},
            "TensorFlow or PyTorch": {"needed_prog": 55, "weight": "medium"},
            "Data Preprocessing": {"needed_data": 50, "weight": "medium"},
            "Cloud AWS or GCP": {"needed_tech": 45, "weight": "low"}
        },
        "roadmap_template": "ml_engineer"
    },
    # ── 4. Data Engineer ──────────────────────────────────────────────────────
    {
        "id": 4,
        "name": "Data Engineer",
        "nsqf_level": 6,
        "base_salary": {"0": [6, 10], "2": [10, 18], "4": [18, 28], "7": [28, 45]},
        "city_mult": {"bangalore": 1.22, "hyderabad": 1.12, "mumbai": 1.15, "delhi": 1.1, "pune": 1.05, "chennai": 0.98, "tier2": 0.78},
        "demand": "High",
        "growth": "+35%",
        "openings": "29,000",
        "tags": ["Python", "Spark", "SQL", "Cloud", "ETL"],
        "skill_weights": {"prog": 0.35, "data": 0.25, "comm": 0.10, "prob": 0.15, "tech": 0.15},
        "tool_boost": {"Python": 9, "SQL": 8, "Cloud": 8},
        "goal_match": ["IT Jobs"],
        "interest_match": ["Technology", "Data Science"],
        "field_match": ["cs", "engg"],
        "required_skills": {
            "Python": {"needed_prog": 65, "weight": "high"},
            "SQL and Databases": {"needed_data": 55, "weight": "high"},
            "Apache Spark": {"needed_prog": 55, "weight": "high"},
            "Cloud Platforms": {"needed_tech": 50, "weight": "medium"},
            "ETL Pipelines": {"needed_data": 45, "weight": "medium"},
            "Data Warehousing": {"needed_data": 50, "weight": "low"}
        },
        "roadmap_template": "data_engineer"
    },
    # ── 5. Product Analyst ────────────────────────────────────────────────────
    {
        "id": 5,
        "name": "Product Analyst",
        "nsqf_level": 5,
        "base_salary": {"0": [5, 8], "2": [8, 15], "4": [15, 22], "7": [22, 35]},
        "city_mult": {"bangalore": 1.18, "hyderabad": 1.08, "mumbai": 1.15, "delhi": 1.1, "pune": 1.0, "chennai": 0.95, "tier2": 0.75},
        "demand": "High",
        "growth": "+20%",
        "openings": "15,000",
        "tags": ["Analytics", "SQL", "Communication", "Product Thinking"],
        "skill_weights": {"prog": 0.15, "data": 0.25, "comm": 0.30, "prob": 0.20, "tech": 0.10},
        "tool_boost": {"SQL": 7, "Excel": 6, "Python": 5},
        "goal_match": ["IT Jobs", "Entrepreneurship", "Business"],
        "interest_match": ["Technology", "Business", "Design"],
        "field_match": ["cs", "commerce", "engg", "arts"],
        "required_skills": {
            "SQL": {"needed_data": 45, "weight": "high"},
            "Product Thinking": {"needed_comm": 65, "weight": "high"},
            "Data Analysis": {"needed_data": 50, "weight": "medium"},
            "A/B Testing": {"needed_data": 40, "weight": "medium"},
            "Communication": {"needed_comm": 70, "weight": "medium"}
        },
        "roadmap_template": "product_analyst"
    },
    # ── 6. IT Systems Analyst ─────────────────────────────────────────────────
    {
        "id": 6,
        "name": "IT Systems Analyst",
        "nsqf_level": 5,
        "base_salary": {"0": [4, 7], "2": [7, 12], "4": [12, 18], "7": [18, 28]},
        "city_mult": {"bangalore": 1.1, "hyderabad": 1.05, "mumbai": 1.1, "delhi": 1.05, "pune": 0.98, "chennai": 0.92, "tier2": 0.72},
        "demand": "Medium",
        "growth": "+12%",
        "openings": "18,000",
        "tags": ["Systems Analysis", "Documentation", "Problem Solving"],
        "skill_weights": {"prog": 0.20, "data": 0.20, "comm": 0.25, "prob": 0.25, "tech": 0.10},
        "tool_boost": {},
        "goal_match": ["IT Jobs", "Government Jobs"],
        "interest_match": ["Technology", "Government"],
        "field_match": ["cs", "engg", "science"],
        "required_skills": {
            "Systems Documentation": {"needed_tech": 40, "weight": "high"},
            "Business Analysis": {"needed_comm": 60, "weight": "high"},
            "SQL Basics": {"needed_data": 35, "weight": "medium"},
            "Project Management": {"needed_comm": 55, "weight": "medium"}
        },
        "roadmap_template": "it_systems"
    },
    # ── 7. Digital Marketing Analyst ──────────────────────────────────────────
    {
        "id": 7,
        "name": "Digital Marketing Analyst",
        "nsqf_level": 4,
        "base_salary": {"0": [3.5, 6], "2": [6, 10], "4": [10, 16], "7": [16, 25]},
        "city_mult": {"bangalore": 1.1, "hyderabad": 1.0, "mumbai": 1.12, "delhi": 1.08, "pune": 0.98, "chennai": 0.92, "tier2": 0.7},
        "demand": "High",
        "growth": "+28%",
        "openings": "24,000",
        "tags": ["Google Analytics", "SEO", "Social Media", "Excel"],
        "skill_weights": {"prog": 0.10, "data": 0.20, "comm": 0.35, "prob": 0.15, "tech": 0.20},
        "tool_boost": {"Excel": 6},
        "goal_match": ["Entrepreneurship", "IT Jobs", "Freelance"],
        "interest_match": ["Business", "Technology", "Design", "Education"],
        "field_match": ["commerce", "arts", "cs", "engg"],
        "required_skills": {
            "Google Analytics": {"needed_tech": 40, "weight": "high"},
            "SEO and SEM": {"needed_tech": 35, "weight": "high"},
            "Content Marketing": {"needed_comm": 60, "weight": "medium"},
            "Social Media Ads": {"needed_tech": 35, "weight": "medium"},
            "Excel Sheets": {"needed_data": 30, "weight": "low"}
        },
        "roadmap_template": "digital_marketing"
    },
    # ── 8. QA Test Analyst ────────────────────────────────────────────────────
    {
        "id": 8,
        "name": "QA Test Analyst",
        "nsqf_level": 4,
        "base_salary": {"0": [3.5, 6], "2": [6, 10], "4": [10, 15], "7": [15, 22]},
        "city_mult": {"bangalore": 1.1, "hyderabad": 1.05, "mumbai": 1.08, "delhi": 1.05, "pune": 0.98, "chennai": 0.92, "tier2": 0.7},
        "demand": "Medium",
        "growth": "+8%",
        "openings": "12,000",
        "tags": ["Testing", "Selenium", "JIRA", "Documentation"],
        "skill_weights": {"prog": 0.20, "data": 0.15, "comm": 0.25, "prob": 0.25, "tech": 0.15},
        "tool_boost": {},
        "goal_match": ["IT Jobs"],
        "interest_match": ["Technology"],
        "field_match": ["cs", "engg", "science"],
        "required_skills": {
            "Manual Testing": {"needed_tech": 30, "weight": "high"},
            "Selenium Automation": {"needed_prog": 45, "weight": "high"},
            "JIRA Bug Tracking": {"needed_tech": 35, "weight": "medium"},
            "API Testing": {"needed_prog": 40, "weight": "medium"}
        },
        "roadmap_template": "qa_analyst"
    },
    # ── 9. Government Data Officer ────────────────────────────────────────────
    {
        "id": 9,
        "name": "Government Data Officer",
        "nsqf_level": 5,
        "base_salary": {"0": [4, 7], "2": [7, 11], "4": [11, 16], "7": [16, 24]},
        "city_mult": {"bangalore": 1.0, "hyderabad": 1.0, "mumbai": 1.0, "delhi": 1.05, "pune": 0.95, "chennai": 0.95, "tier2": 0.9},
        "demand": "Medium",
        "growth": "+15%",
        "openings": "8,000",
        "tags": ["Data Management", "Policy Analysis", "Excel", "Reporting"],
        "skill_weights": {"prog": 0.10, "data": 0.30, "comm": 0.30, "prob": 0.20, "tech": 0.10},
        "tool_boost": {"Excel": 7, "Statistics": 6},
        "goal_match": ["Government Jobs"],
        "interest_match": ["Government", "Education", "Healthcare"],
        "field_match": ["commerce", "arts", "cs", "science", "law"],
        "required_skills": {
            "Data Reporting": {"needed_data": 40, "weight": "high"},
            "Policy Documentation": {"needed_comm": 65, "weight": "high"},
            "Excel MIS": {"needed_data": 35, "weight": "medium"},
            "Statistical Analysis": {"needed_data": 40, "weight": "medium"}
        },
        "roadmap_template": "govt_data"
    },
    # ── 10. Cloud Solutions Architect ─────────────────────────────────────────
    {
        "id": 10,
        "name": "Cloud Solutions Architect",
        "nsqf_level": 7,
        "base_salary": {"0": [8, 14], "2": [14, 25], "4": [25, 40], "7": [40, 65]},
        "city_mult": {"bangalore": 1.25, "hyderabad": 1.15, "mumbai": 1.18, "delhi": 1.12, "pune": 1.08, "chennai": 1.0, "tier2": 0.82},
        "demand": "High",
        "growth": "+38%",
        "openings": "14,000",
        "tags": ["AWS", "Azure", "DevOps", "System Design"],
        "skill_weights": {"prog": 0.30, "data": 0.15, "comm": 0.15, "prob": 0.20, "tech": 0.20},
        "tool_boost": {"Cloud": 10, "Python": 6, "Java": 6},
        "goal_match": ["IT Jobs"],
        "interest_match": ["Technology"],
        "field_match": ["cs", "engg"],
        "required_skills": {
            "AWS Azure GCP": {"needed_tech": 60, "weight": "high"},
            "System Design": {"needed_prog": 65, "weight": "high"},
            "DevOps CI CD": {"needed_prog": 55, "weight": "high"},
            "Networking Basics": {"needed_tech": 45, "weight": "medium"},
            "Security Concepts": {"needed_tech": 40, "weight": "medium"}
        },
        "roadmap_template": "cloud_architect"
    },
    # ── 11. Healthcare Data Analyst ───────────────────────────────────────────
    {
        "id": 11,
        "name": "Healthcare Data Analyst",
        "nsqf_level": 5,
        "base_salary": {"0": [4, 7], "2": [7, 12], "4": [12, 18], "7": [18, 26]},
        "city_mult": {"bangalore": 1.1, "hyderabad": 1.05, "mumbai": 1.12, "delhi": 1.08, "pune": 1.0, "chennai": 0.95, "tier2": 0.78},
        "demand": "High",
        "growth": "+30%",
        "openings": "10,000",
        "tags": ["Healthcare Analytics", "SQL", "Excel", "HMIS"],
        "skill_weights": {"prog": 0.15, "data": 0.35, "comm": 0.20, "prob": 0.20, "tech": 0.10},
        "tool_boost": {"SQL": 7, "Excel": 7, "Statistics": 8},
        "goal_match": ["Healthcare"],
        "interest_match": ["Healthcare", "Data Science", "Research"],
        "field_match": ["medical", "science", "cs", "commerce"],
        "required_skills": {
            "Healthcare Data Systems": {"needed_tech": 40, "weight": "high"},
            "SQL": {"needed_data": 50, "weight": "high"},
            "Statistical Analysis": {"needed_data": 50, "weight": "high"},
            "Data Visualization": {"needed_data": 40, "weight": "medium"},
            "HMIS EHR Systems": {"needed_tech": 35, "weight": "medium"}
        },
        "roadmap_template": "healthcare_analyst"
    },
    # ── 12. Freelance Data Consultant ─────────────────────────────────────────
    {
        "id": 12,
        "name": "Freelance Data Consultant",
        "nsqf_level": 5,
        "base_salary": {"0": [3, 8], "2": [8, 18], "4": [18, 35], "7": [35, 70]},
        "city_mult": {"bangalore": 1.0, "hyderabad": 1.0, "mumbai": 1.0, "delhi": 1.0, "pune": 1.0, "chennai": 1.0, "tier2": 1.0},
        "demand": "High",
        "growth": "+40%",
        "openings": "Unlimited",
        "tags": ["Data Analysis", "Python", "Excel", "Client Communication"],
        "skill_weights": {"prog": 0.20, "data": 0.30, "comm": 0.25, "prob": 0.15, "tech": 0.10},
        "tool_boost": {"Python": 7, "Excel": 8, "SQL": 6, "Tableau": 6},
        "goal_match": ["Freelance", "Entrepreneurship"],
        "interest_match": ["Business", "Technology", "Data Science"],
        "field_match": ["cs", "commerce", "engg", "arts", "science"],
        "required_skills": {
            "Data Analysis": {"needed_data": 55, "weight": "high"},
            "Client Communication": {"needed_comm": 70, "weight": "high"},
            "Excel Google Sheets": {"needed_data": 45, "weight": "medium"},
            "Basic Python": {"needed_prog": 40, "weight": "medium"},
            "Portfolio Building": {"needed_comm": 60, "weight": "low"}
        },
        "roadmap_template": "freelance"
    },

    # ══════════════════════════════════════════════════════════════════════════
    # NEW MEDICAL / HEALTHCARE TECHNOLOGY CAREERS (IDs 13–18)
    # ══════════════════════════════════════════════════════════════════════════

    # ── 13. Health Informatics Engineer ───────────────────────────────────────
    {
        "id": 13,
        "name": "Health Informatics Engineer",
        "nsqf_level": 6,
        "base_salary": {"0": [6, 10], "2": [10, 18], "4": [18, 28], "7": [28, 45]},
        "city_mult": {"bangalore": 1.2, "hyderabad": 1.1, "mumbai": 1.15, "delhi": 1.1, "pune": 1.05, "chennai": 1.0, "tier2": 0.78},
        "demand": "High",
        "growth": "+32%",
        "openings": "9,000",
        "tags": ["HL7 FHIR", "EHR Systems", "SQL", "Python", "Healthcare IT"],
        "skill_weights": {"prog": 0.30, "data": 0.25, "comm": 0.15, "prob": 0.20, "tech": 0.10},
        "tool_boost": {"SQL": 8, "Python": 7, "HL7 FHIR": 10, "EHR": 9},
        "goal_match": ["Healthcare", "IT Jobs"],
        "interest_match": ["Healthcare", "Technology", "Data Science", "Research"],
        "field_match": ["medical", "cs", "engg", "science"],
        "required_skills": {
            "HL7 and FHIR Standards": {"needed_tech": 50, "weight": "high"},
            "EHR EMR Systems": {"needed_tech": 45, "weight": "high"},
            "SQL and Databases": {"needed_data": 55, "weight": "high"},
            "Python for Healthcare": {"needed_prog": 55, "weight": "medium"},
            "ICD-10 Medical Coding": {"needed_tech": 40, "weight": "medium"},
            "Data Privacy HIPAA": {"needed_comm": 45, "weight": "low"}
        },
        "roadmap_template": "health_informatics"
    },
    # ── 14. Medical Device Software Engineer ──────────────────────────────────
    {
        "id": 14,
        "name": "Medical Device Software Engineer",
        "nsqf_level": 6,
        "base_salary": {"0": [7, 12], "2": [12, 22], "4": [22, 35], "7": [35, 55]},
        "city_mult": {"bangalore": 1.25, "hyderabad": 1.15, "mumbai": 1.15, "delhi": 1.1, "pune": 1.1, "chennai": 1.05, "tier2": 0.8},
        "demand": "High",
        "growth": "+28%",
        "openings": "7,500",
        "tags": ["C/C++", "Embedded Systems", "IEC 62304", "FDA Regulations"],
        "skill_weights": {"prog": 0.45, "data": 0.10, "comm": 0.10, "prob": 0.25, "tech": 0.10},
        "tool_boost": {"C/C++": 10, "Embedded Systems": 9, "Python": 5},
        "goal_match": ["IT Jobs", "Healthcare"],
        "interest_match": ["Healthcare", "Technology", "Research"],
        "field_match": ["engg", "cs", "medical"],
        "required_skills": {
            "C and C++ Programming": {"needed_prog": 70, "weight": "high"},
            "Embedded Systems RTOS": {"needed_prog": 65, "weight": "high"},
            "IEC 62304 Standard": {"needed_tech": 50, "weight": "high"},
            "FDA 21 CFR Part 11": {"needed_comm": 40, "weight": "medium"},
            "Signal Processing": {"needed_data": 45, "weight": "medium"},
            "Hardware Interfacing": {"needed_tech": 45, "weight": "low"}
        },
        "roadmap_template": "medical_device_sw"
    },
    # ── 15. Clinical Data Engineer ────────────────────────────────────────────
    {
        "id": 15,
        "name": "Clinical Data Engineer",
        "nsqf_level": 6,
        "base_salary": {"0": [6, 11], "2": [11, 20], "4": [20, 32], "7": [32, 50]},
        "city_mult": {"bangalore": 1.2, "hyderabad": 1.12, "mumbai": 1.15, "delhi": 1.1, "pune": 1.08, "chennai": 1.0, "tier2": 0.8},
        "demand": "High",
        "growth": "+35%",
        "openings": "6,000",
        "tags": ["Clinical Trials", "CDISC", "SAS", "R", "Python"],
        "skill_weights": {"prog": 0.30, "data": 0.35, "comm": 0.10, "prob": 0.15, "tech": 0.10},
        "tool_boost": {"Python": 8, "SAS": 9, "R": 8, "SQL": 7},
        "goal_match": ["Healthcare", "Research", "IT Jobs"],
        "interest_match": ["Healthcare", "Research", "Data Science"],
        "field_match": ["medical", "science", "cs", "engg"],
        "required_skills": {
            "CDISC Standards SDTM ADaM": {"needed_tech": 55, "weight": "high"},
            "SAS Programming": {"needed_prog": 60, "weight": "high"},
            "Clinical Trial Protocols": {"needed_data": 50, "weight": "high"},
            "R or Python for Statistics": {"needed_prog": 55, "weight": "medium"},
            "Regulatory Submissions": {"needed_comm": 45, "weight": "medium"},
            "Medical Terminology": {"needed_tech": 40, "weight": "low"}
        },
        "roadmap_template": "clinical_data"
    },
    # ── 16. AI Diagnostics Engineer ───────────────────────────────────────────
    {
        "id": 16,
        "name": "AI Diagnostics Engineer",
        "nsqf_level": 7,
        "base_salary": {"0": [9, 15], "2": [15, 26], "4": [26, 42], "7": [42, 70]},
        "city_mult": {"bangalore": 1.3, "hyderabad": 1.18, "mumbai": 1.2, "delhi": 1.15, "pune": 1.12, "chennai": 1.05, "tier2": 0.82},
        "demand": "Very High",
        "growth": "+48%",
        "openings": "5,500",
        "tags": ["Medical Imaging AI", "PyTorch", "DICOM", "Computer Vision", "Deep Learning"],
        "skill_weights": {"prog": 0.40, "data": 0.25, "comm": 0.05, "prob": 0.20, "tech": 0.10},
        "tool_boost": {"Python": 9, "PyTorch": 10, "TensorFlow": 9, "OpenCV": 8},
        "goal_match": ["Healthcare", "Research", "IT Jobs"],
        "interest_match": ["Healthcare", "Technology", "Research", "Data Science"],
        "field_match": ["medical", "cs", "engg", "science"],
        "required_skills": {
            "Deep Learning CNN": {"needed_prog": 75, "weight": "high"},
            "DICOM Medical Imaging": {"needed_tech": 60, "weight": "high"},
            "PyTorch or TensorFlow": {"needed_prog": 70, "weight": "high"},
            "Computer Vision OpenCV": {"needed_prog": 60, "weight": "high"},
            "Medical Image Datasets": {"needed_data": 55, "weight": "medium"},
            "Model Validation FDA": {"needed_comm": 40, "weight": "low"}
        },
        "roadmap_template": "ai_diagnostics"
    },
    # ── 17. Telemedicine Platform Developer ───────────────────────────────────
    {
        "id": 17,
        "name": "Telemedicine Platform Developer",
        "nsqf_level": 6,
        "base_salary": {"0": [6, 10], "2": [10, 18], "4": [18, 28], "7": [28, 45]},
        "city_mult": {"bangalore": 1.2, "hyderabad": 1.1, "mumbai": 1.15, "delhi": 1.1, "pune": 1.05, "chennai": 1.0, "tier2": 0.85},
        "demand": "High",
        "growth": "+38%",
        "openings": "8,000",
        "tags": ["WebRTC", "React", "Node.js", "IoT", "Healthcare APIs"],
        "skill_weights": {"prog": 0.40, "data": 0.10, "comm": 0.20, "prob": 0.20, "tech": 0.10},
        "tool_boost": {"Python": 6, "JavaScript": 8, "WebRTC": 9, "IoT": 8},
        "goal_match": ["Healthcare", "IT Jobs", "Entrepreneurship"],
        "interest_match": ["Healthcare", "Technology", "Design", "Business"],
        "field_match": ["cs", "engg", "medical"],
        "required_skills": {
            "React or Angular Frontend": {"needed_prog": 60, "weight": "high"},
            "Node.js Backend": {"needed_prog": 55, "weight": "high"},
            "WebRTC Video Calls": {"needed_tech": 50, "weight": "high"},
            "Healthcare API FHIR": {"needed_tech": 45, "weight": "medium"},
            "IoT Device Integration": {"needed_tech": 40, "weight": "medium"},
            "Data Security HIPAA": {"needed_comm": 45, "weight": "low"}
        },
        "roadmap_template": "telemedicine_dev"
    },
    # ── 18. Biomedical AI Researcher ──────────────────────────────────────────
    {
        "id": 18,
        "name": "Biomedical AI Researcher",
        "nsqf_level": 7,
        "base_salary": {"0": [8, 14], "2": [14, 24], "4": [24, 40], "7": [40, 65]},
        "city_mult": {"bangalore": 1.25, "hyderabad": 1.15, "mumbai": 1.18, "delhi": 1.12, "pune": 1.1, "chennai": 1.05, "tier2": 0.82},
        "demand": "High",
        "growth": "+45%",
        "openings": "4,000",
        "tags": ["Genomics", "Bioinformatics", "Python", "R", "ML for Healthcare"],
        "skill_weights": {"prog": 0.30, "data": 0.30, "comm": 0.10, "prob": 0.20, "tech": 0.10},
        "tool_boost": {"Python": 9, "R": 9, "TensorFlow": 7, "Statistics": 8},
        "goal_match": ["Healthcare", "Research"],
        "interest_match": ["Healthcare", "Research", "Data Science", "Technology"],
        "field_match": ["medical", "science", "cs", "engg"],
        "required_skills": {
            "Python and R Programming": {"needed_prog": 65, "weight": "high"},
            "Bioinformatics Genomics": {"needed_data": 65, "weight": "high"},
            "ML for Drug Discovery": {"needed_prog": 60, "weight": "high"},
            "Statistical Modeling": {"needed_data": 60, "weight": "medium"},
            "Research Paper Writing": {"needed_comm": 55, "weight": "medium"},
            "Clinical Data Interpretation": {"needed_data": 50, "weight": "low"}
        },
        "roadmap_template": "biomedical_ai"
    }
]

# ─────────────────────────────────────────────────────────────────────────────
# ROADMAP TEMPLATES  (original + 6 new medical templates)
# ─────────────────────────────────────────────────────────────────────────────
ROADMAP_TEMPLATES = {
    "data_analyst": [
        {"nsqf": "NSQF Level 3", "title": "Foundation Skills",      "base_desc": "Python basics, Excel, statistics fundamentals.",         "duration_weeks": 4,  "state_threshold": 40},
        {"nsqf": "NSQF Level 4", "title": "Core Data Skills",       "base_desc": "SQL, data cleaning, basic dashboards with Excel.",       "duration_weeks": 6,  "state_threshold": 55},
        {"nsqf": "NSQF Level 5", "title": "Advanced Certification", "base_desc": "Power BI, Tableau, advanced Python, statistical models.","duration_weeks": 8,  "state_threshold": 70},
        {"nsqf": "NSQF Level 5", "title": "Apprenticeship",         "base_desc": "Real-world project under NCVET. Stipend 10000-15000 per month.", "duration_weeks": 12, "state_threshold": 85},
        {"nsqf": "NSQF Level 5", "title": "Entry-Level Job Ready",  "base_desc": "Portfolio review, interview prep, placement support.",   "duration_weeks": 2,  "state_threshold": 100}
    ],
    "bi_analyst": [
        {"nsqf": "NSQF Level 3", "title": "Data and Business Basics",  "base_desc": "Excel, basic SQL, business communication fundamentals.", "duration_weeks": 4,  "state_threshold": 40},
        {"nsqf": "NSQF Level 4", "title": "BI Foundations",            "base_desc": "Power BI Desktop, SQL queries, basic DAX.",             "duration_weeks": 6,  "state_threshold": 55},
        {"nsqf": "NSQF Level 5", "title": "Advanced BI and Reporting", "base_desc": "Tableau, advanced DAX, data modeling, dashboards.",      "duration_weeks": 8,  "state_threshold": 70},
        {"nsqf": "NSQF Level 5", "title": "Industry Project",          "base_desc": "Live BI project with industry partner under NCVET.",     "duration_weeks": 10, "state_threshold": 85},
        {"nsqf": "NSQF Level 5", "title": "BI Analyst Job Ready",      "base_desc": "Portfolio, BI certifications, interview prep.",          "duration_weeks": 2,  "state_threshold": 100}
    ],
    "ml_engineer": [
        {"nsqf": "NSQF Level 4", "title": "Python and Math Foundations", "base_desc": "Python, linear algebra, statistics, NumPy and Pandas.", "duration_weeks": 6,  "state_threshold": 40},
        {"nsqf": "NSQF Level 5", "title": "Core ML Concepts",           "base_desc": "Supervised and unsupervised learning, Scikit-learn.",   "duration_weeks": 8,  "state_threshold": 60},
        {"nsqf": "NSQF Level 6", "title": "Deep Learning and AI",       "base_desc": "TensorFlow, PyTorch, CNNs, NLP basics.",               "duration_weeks": 10, "state_threshold": 75},
        {"nsqf": "NSQF Level 6", "title": "ML Project Internship",      "base_desc": "End-to-end ML project with NCVET apprenticeship.",      "duration_weeks": 12, "state_threshold": 90},
        {"nsqf": "NSQF Level 6", "title": "ML Engineer Job Ready",      "base_desc": "Kaggle portfolio, GitHub, interview preparation.",      "duration_weeks": 2,  "state_threshold": 100}
    ],
    "data_engineer": [
        {"nsqf": "NSQF Level 4", "title": "Python and SQL Foundations", "base_desc": "Python, advanced SQL, database design basics.",         "duration_weeks": 5,  "state_threshold": 40},
        {"nsqf": "NSQF Level 5", "title": "Data Pipeline Basics",       "base_desc": "ETL concepts, pandas, basic Spark.",                   "duration_weeks": 7,  "state_threshold": 58},
        {"nsqf": "NSQF Level 6", "title": "Big Data and Cloud",         "base_desc": "Apache Spark, Kafka, AWS or GCP data services.",       "duration_weeks": 9,  "state_threshold": 72},
        {"nsqf": "NSQF Level 6", "title": "Data Engineering Project",   "base_desc": "Build a real-time data pipeline project.",             "duration_weeks": 10, "state_threshold": 88},
        {"nsqf": "NSQF Level 6", "title": "Data Engineer Job Ready",    "base_desc": "Portfolio, cloud certifications, interview prep.",     "duration_weeks": 2,  "state_threshold": 100}
    ],
    "product_analyst": [
        {"nsqf": "NSQF Level 3", "title": "Product and Data Basics",    "base_desc": "Product thinking, Excel, basic analytics.",            "duration_weeks": 4,  "state_threshold": 40},
        {"nsqf": "NSQF Level 4", "title": "Analytics Tools",            "base_desc": "SQL, Google Analytics, A/B testing concepts.",         "duration_weeks": 6,  "state_threshold": 55},
        {"nsqf": "NSQF Level 5", "title": "Advanced Product Analysis",  "base_desc": "Mixpanel, Amplitude, Python basics for data.",         "duration_weeks": 7,  "state_threshold": 70},
        {"nsqf": "NSQF Level 5", "title": "Product Internship",         "base_desc": "Internship at a product company under NCVET scheme.",  "duration_weeks": 10, "state_threshold": 88},
        {"nsqf": "NSQF Level 5", "title": "Product Analyst Job Ready",  "base_desc": "Case studies, interview prep, portfolio.",            "duration_weeks": 2,  "state_threshold": 100}
    ],
    "it_systems": [
        {"nsqf": "NSQF Level 3", "title": "IT Fundamentals",           "base_desc": "Computer basics, networking, OS fundamentals.",        "duration_weeks": 4,  "state_threshold": 35},
        {"nsqf": "NSQF Level 4", "title": "Systems Analysis Basics",   "base_desc": "UML diagrams, requirement gathering, SDLC.",          "duration_weeks": 6,  "state_threshold": 50},
        {"nsqf": "NSQF Level 5", "title": "Advanced SA Skills",        "base_desc": "Agile, project management, SQL, documentation.",      "duration_weeks": 7,  "state_threshold": 68},
        {"nsqf": "NSQF Level 5", "title": "Industry Placement",        "base_desc": "Systems analyst internship under NCVET scheme.",      "duration_weeks": 10, "state_threshold": 85},
        {"nsqf": "NSQF Level 5", "title": "Job Ready",                 "base_desc": "Interview prep, resume, certification prep.",         "duration_weeks": 2,  "state_threshold": 100}
    ],
    "digital_marketing": [
        {"nsqf": "NSQF Level 3", "title": "Marketing Fundamentals",     "base_desc": "Digital marketing basics, social media, branding.",   "duration_weeks": 3,  "state_threshold": 35},
        {"nsqf": "NSQF Level 4", "title": "SEO and Analytics",          "base_desc": "Google Analytics, SEO, SEM, paid ads basics.",       "duration_weeks": 5,  "state_threshold": 50},
        {"nsqf": "NSQF Level 4", "title": "Advanced Digital Marketing", "base_desc": "Content strategy, email marketing, CRM tools.",      "duration_weeks": 6,  "state_threshold": 65},
        {"nsqf": "NSQF Level 4", "title": "Campaign Internship",        "base_desc": "Live digital campaign with agency under NCVET.",      "duration_weeks": 8,  "state_threshold": 82},
        {"nsqf": "NSQF Level 4", "title": "Digital Marketer Job Ready", "base_desc": "Portfolio, Google and Meta certification, interview.","duration_weeks": 2,  "state_threshold": 100}
    ],
    "qa_analyst": [
        {"nsqf": "NSQF Level 3", "title": "Software Testing Basics",   "base_desc": "Manual testing concepts, STLC, bug life cycle.",      "duration_weeks": 4,  "state_threshold": 35},
        {"nsqf": "NSQF Level 4", "title": "Automation Basics",         "base_desc": "Selenium WebDriver, Python for testing.",             "duration_weeks": 6,  "state_threshold": 52},
        {"nsqf": "NSQF Level 4", "title": "Advanced QA Tools",         "base_desc": "JIRA, Postman, API testing, CI/CD basics.",          "duration_weeks": 7,  "state_threshold": 68},
        {"nsqf": "NSQF Level 4", "title": "QA Internship",             "base_desc": "QA project with software company under NCVET.",       "duration_weeks": 8,  "state_threshold": 84},
        {"nsqf": "NSQF Level 4", "title": "QA Engineer Job Ready",     "base_desc": "ISTQB certification prep, interview, portfolio.",    "duration_weeks": 2,  "state_threshold": 100}
    ],
    "govt_data": [
        {"nsqf": "NSQF Level 3", "title": "Data and Policy Basics",    "base_desc": "Government data systems, Excel, report writing.",     "duration_weeks": 4,  "state_threshold": 35},
        {"nsqf": "NSQF Level 4", "title": "Data Analysis for Gov",     "base_desc": "SQL, MIS reporting, basic statistics.",              "duration_weeks": 6,  "state_threshold": 50},
        {"nsqf": "NSQF Level 5", "title": "Advanced Analytics",        "base_desc": "Power BI, data dashboards for governance.",          "duration_weeks": 6,  "state_threshold": 65},
        {"nsqf": "NSQF Level 5", "title": "Government Internship",     "base_desc": "Internship with government body under NCVET scheme.", "duration_weeks": 12, "state_threshold": 82},
        {"nsqf": "NSQF Level 5", "title": "Job Ready",                 "base_desc": "Competitive exam prep, interview coaching.",         "duration_weeks": 4,  "state_threshold": 100}
    ],
    "cloud_architect": [
        {"nsqf": "NSQF Level 5", "title": "Cloud Fundamentals",        "base_desc": "AWS or Azure basics, networking, Linux, virtualization.","duration_weeks": 6, "state_threshold": 45},
        {"nsqf": "NSQF Level 5", "title": "Core Cloud Services",       "base_desc": "EC2, S3, RDS, Azure VMs, IAM, security.",           "duration_weeks": 8,  "state_threshold": 60},
        {"nsqf": "NSQF Level 6", "title": "DevOps and Architecture",   "base_desc": "Docker, Kubernetes, CI/CD, system design.",          "duration_weeks": 10, "state_threshold": 75},
        {"nsqf": "NSQF Level 6", "title": "Cloud Project",             "base_desc": "End-to-end cloud architecture project.",             "duration_weeks": 8,  "state_threshold": 88},
        {"nsqf": "NSQF Level 7", "title": "Cloud Architect Job Ready", "base_desc": "AWS or Azure certification, interview prep.",        "duration_weeks": 3,  "state_threshold": 100}
    ],
    "healthcare_analyst": [
        {"nsqf": "NSQF Level 3", "title": "Healthcare Data Basics",    "base_desc": "Healthcare systems, Excel, basic statistics.",       "duration_weeks": 4,  "state_threshold": 38},
        {"nsqf": "NSQF Level 4", "title": "SQL and HMIS",              "base_desc": "SQL, health management information systems.",        "duration_weeks": 6,  "state_threshold": 55},
        {"nsqf": "NSQF Level 5", "title": "Analytics and Visualization","base_desc": "Power BI for healthcare, statistical reporting.",   "duration_weeks": 7,  "state_threshold": 70},
        {"nsqf": "NSQF Level 5", "title": "Healthcare Internship",     "base_desc": "Hospital or health agency internship under NCVET.", "duration_weeks": 10, "state_threshold": 86},
        {"nsqf": "NSQF Level 5", "title": "Healthcare Analyst Ready",  "base_desc": "Portfolio, domain certification, interview prep.",  "duration_weeks": 2,  "state_threshold": 100}
    ],
    "freelance": [
        {"nsqf": "NSQF Level 3", "title": "Core Skill Building",       "base_desc": "Excel, Python basics, data analysis fundamentals.", "duration_weeks": 4,  "state_threshold": 38},
        {"nsqf": "NSQF Level 4", "title": "Freelance Platform Setup",  "base_desc": "Upwork or Fiverr profile, proposal writing, niche.","duration_weeks": 3,  "state_threshold": 52},
        {"nsqf": "NSQF Level 5", "title": "Build Portfolio",           "base_desc": "3 to 5 real client projects, GitHub, LinkedIn.",   "duration_weeks": 8,  "state_threshold": 68},
        {"nsqf": "NSQF Level 5", "title": "First Clients",             "base_desc": "Land first 3 paying clients, build testimonials.", "duration_weeks": 6,  "state_threshold": 85},
        {"nsqf": "NSQF Level 5", "title": "Scale Freelance Business",  "base_desc": "Raise rates, specialize, build recurring revenue.","duration_weeks": 0,  "state_threshold": 100}
    ],

    # ── NEW MEDICAL ROADMAP TEMPLATES ─────────────────────────────────────────
    "health_informatics": [
        {"nsqf": "NSQF Level 4", "title": "Healthcare IT Basics",      "base_desc": "Introduction to EHR systems, healthcare workflows, HMIS basics.",       "duration_weeks": 4,  "state_threshold": 35},
        {"nsqf": "NSQF Level 5", "title": "HL7 and FHIR Standards",    "base_desc": "HL7 v2/v3, FHIR R4, API integration with hospital systems.",            "duration_weeks": 7,  "state_threshold": 55},
        {"nsqf": "NSQF Level 5", "title": "SQL and Data Pipelines",    "base_desc": "Clinical databases, SQL queries, ICD-10 coding, patient data handling.","duration_weeks": 6,  "state_threshold": 70},
        {"nsqf": "NSQF Level 6", "title": "Hospital IT Internship",    "base_desc": "Live project at hospital or health-tech company under NCVET.",          "duration_weeks": 10, "state_threshold": 86},
        {"nsqf": "NSQF Level 6", "title": "Health Informatics Ready",  "base_desc": "HL7 FHIR certification, portfolio, interview prep.",                    "duration_weeks": 2,  "state_threshold": 100}
    ],
    "medical_device_sw": [
        {"nsqf": "NSQF Level 4", "title": "Embedded C Foundations",    "base_desc": "C programming, microcontrollers, RTOS fundamentals.",                   "duration_weeks": 6,  "state_threshold": 38},
        {"nsqf": "NSQF Level 5", "title": "Medical Device Standards",  "base_desc": "IEC 62304, ISO 13485, FDA 21 CFR Part 11 compliance basics.",           "duration_weeks": 7,  "state_threshold": 55},
        {"nsqf": "NSQF Level 6", "title": "Embedded Medical Software", "base_desc": "ECG/EEG signal processing, hardware interfacing, safety-critical code.","duration_weeks": 10, "state_threshold": 72},
        {"nsqf": "NSQF Level 6", "title": "Industry Internship",       "base_desc": "Internship at medical device company (GE Healthcare, Philips, etc.).",  "duration_weeks": 12, "state_threshold": 88},
        {"nsqf": "NSQF Level 6", "title": "Medical Device SW Ready",   "base_desc": "IEC 62304 certification, portfolio, interview prep.",                   "duration_weeks": 2,  "state_threshold": 100}
    ],
    "clinical_data": [
        {"nsqf": "NSQF Level 4", "title": "Clinical Research Basics",  "base_desc": "Clinical trial phases, GCP guidelines, regulatory frameworks.",         "duration_weeks": 4,  "state_threshold": 35},
        {"nsqf": "NSQF Level 5", "title": "CDISC and SAS",             "base_desc": "CDISC SDTM, ADaM models, SAS BASE and PROC SQL for clinical data.",     "duration_weeks": 8,  "state_threshold": 55},
        {"nsqf": "NSQF Level 6", "title": "Statistical Programming",   "base_desc": "R or Python for biostatistics, survival analysis, regulatory submissions.","duration_weeks": 8,"state_threshold": 72},
        {"nsqf": "NSQF Level 6", "title": "CRO or Pharma Internship",  "base_desc": "Contract Research Organization internship with real trial data.",       "duration_weeks": 12, "state_threshold": 88},
        {"nsqf": "NSQF Level 6", "title": "Clinical Data Engineer Ready","base_desc": "SAS certification, portfolio, regulatory interview prep.",             "duration_weeks": 2,  "state_threshold": 100}
    ],
    "ai_diagnostics": [
        {"nsqf": "NSQF Level 5", "title": "Deep Learning Foundations", "base_desc": "CNNs, PyTorch basics, image classification fundamentals.",               "duration_weeks": 7,  "state_threshold": 38},
        {"nsqf": "NSQF Level 6", "title": "Medical Imaging Basics",    "base_desc": "DICOM format, radiology datasets, preprocessing medical images.",        "duration_weeks": 6,  "state_threshold": 55},
        {"nsqf": "NSQF Level 6", "title": "AI Diagnostic Models",      "base_desc": "Segmentation, detection models for X-ray, MRI, pathology slides.",      "duration_weeks": 10, "state_threshold": 72},
        {"nsqf": "NSQF Level 7", "title": "Hospital AI Internship",    "base_desc": "Deploy AI model in clinical setting, IRB ethics, FDA SaMD guidelines.", "duration_weeks": 12, "state_threshold": 88},
        {"nsqf": "NSQF Level 7", "title": "AI Diagnostics Engineer Ready","base_desc": "Research publication, portfolio, interview at health-AI company.",   "duration_weeks": 2,  "state_threshold": 100}
    ],
    "telemedicine_dev": [
        {"nsqf": "NSQF Level 4", "title": "Web Dev Foundations",       "base_desc": "HTML, CSS, JavaScript, React basics, REST APIs.",                       "duration_weeks": 6,  "state_threshold": 38},
        {"nsqf": "NSQF Level 5", "title": "Real-Time Communication",   "base_desc": "WebRTC, Socket.IO, video call integration, Node.js backend.",           "duration_weeks": 7,  "state_threshold": 55},
        {"nsqf": "NSQF Level 6", "title": "Healthcare Platform Dev",   "base_desc": "FHIR APIs, prescription modules, patient portal, IoT sensor data.",     "duration_weeks": 8,  "state_threshold": 72},
        {"nsqf": "NSQF Level 6", "title": "Healthtech Internship",     "base_desc": "Build or contribute to a live telemedicine platform under NCVET.",      "duration_weeks": 10, "state_threshold": 87},
        {"nsqf": "NSQF Level 6", "title": "Telemedicine Dev Ready",    "base_desc": "Portfolio, HIPAA compliance knowledge, interview prep.",                "duration_weeks": 2,  "state_threshold": 100}
    ],
    "biomedical_ai": [
        {"nsqf": "NSQF Level 5", "title": "Bioinformatics Basics",     "base_desc": "Genomics intro, Python for biology (Biopython), sequence analysis.",    "duration_weeks": 6,  "state_threshold": 38},
        {"nsqf": "NSQF Level 6", "title": "ML for Healthcare",         "base_desc": "Scikit-learn, survival models, drug target prediction, scRNA-seq.",     "duration_weeks": 8,  "state_threshold": 55},
        {"nsqf": "NSQF Level 6", "title": "Deep Learning in Biomedicine","base_desc": "Graph neural networks, protein structure prediction, AlphaFold basics.","duration_weeks": 10,"state_threshold": 72},
        {"nsqf": "NSQF Level 7", "title": "Research Collaboration",    "base_desc": "IIT/AIIMS research project, publish or present findings.",              "duration_weeks": 16, "state_threshold": 88},
        {"nsqf": "NSQF Level 7", "title": "Biomedical AI Researcher Ready","base_desc": "Publication, PhD or industry research role applications.",          "duration_weeks": 2,  "state_threshold": 100}
    ]
}


# ─────────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS  (unchanged from original)
# ─────────────────────────────────────────────────────────────────────────────
def compute_score(career, profile):
    skills = profile.get("skills", {})
    prog = skills.get("prog", 0)
    data = skills.get("data", 0)
    comm = skills.get("comm", 0)
    prob = skills.get("prob", 0)
    tech = skills.get("tech", 0)
    field = profile.get("field", "other")
    qual  = profile.get("qualification", "ug")

    # ── 1. Base skill score using career-specific weights ──────────────────
    w = career["skill_weights"]
    base_skill_score = (prog*w["prog"] + data*w["data"] +
                        comm*w["comm"] + prob*w["prob"] + tech*w["tech"])

    # ── 2. Field match — STRONG signal, no penalty for unrelated fields ────
    # Instead of penalising (-15) for field mismatch, just reward matches.
    # This stops data roles always topping the list for every field.
    field_bonus = 0
    if field != "other":
        if field in career["field_match"]:
            field_bonus = 30          # strong positive signal
        else:
            field_bonus = -10         # mild discouragement, not a killer

    # ── 3. Field-specific career category bonus ────────────────────────────
    # Boosts careers that are naturally suited to the field of study
    FIELD_CAREER_BONUS = {
        "medical":   [11, 13, 14, 15, 16, 17, 18],   # healthcare careers
        "engg":      [3, 4, 10, 14, 17],              # ML, data eng, cloud, embedded
        "cs":        [1, 2, 3, 4, 5, 8, 10],          # data, ml, cloud, qa
        "commerce":  [2, 5, 7, 9, 12],                # BI, product, marketing, govt, freelance
        "science":   [1, 3, 11, 15, 18],              # data, ML, healthcare, clinical, biomedical
        "arts":      [7, 5, 12, 9],                   # digital marketing, product, freelance, govt
        "law":       [9, 5, 12],                      # govt, product, freelance
    }
    natural_fit_bonus = 0
    if field in FIELD_CAREER_BONUS and career["id"] in FIELD_CAREER_BONUS[field]:
        natural_fit_bonus = 15

    # ── 4. Goal alignment ─────────────────────────────────────────────────
    goals = profile.get("goals", [])
    goal_bonus = 0
    for goal in goals:
        if goal in career["goal_match"]:
            goal_bonus += 10
    goal_bonus = min(goal_bonus, 20)

    # ── 5. Interest alignment ─────────────────────────────────────────────
    interests = profile.get("interests", [])
    interest_bonus = 0
    for interest in interests:
        if interest in career["interest_match"]:
            interest_bonus += 5
    interest_bonus = min(interest_bonus, 15)

    # ── 6. Tool / technology match ────────────────────────────────────────
    tools = profile.get("tools", [])
    tool_bonus = sum([career["tool_boost"].get(t, 0) for t in tools])
    tool_bonus = min(tool_bonus, 20)

    # ── 7. Qualification suitability ─────────────────────────────────────
    qual_scores = {"phd": 5, "pg": 4, "ug": 3, "diploma": 2, "12th": 1, "10th": 0}
    qual_val = qual_scores.get(qual, 2)
    nsqf_needed = career["nsqf_level"]
    if nsqf_needed >= 6 and qual_val >= 3:
        qual_bonus = 4
    elif nsqf_needed <= 4:
        qual_bonus = 5
    else:
        qual_bonus = qual_val

    # ── 8. Skill deficit penalty (reduces score if you lack core skills) ──
    reqs = career.get("required_skills", {})
    max_needed = {"prog": 0, "data": 0, "comm": 0, "tech": 0}
    for req_name, req_info in reqs.items():
        if "needed_prog" in req_info:
            max_needed["prog"] = max(max_needed["prog"], req_info["needed_prog"])
        if "needed_data" in req_info:
            max_needed["data"] = max(max_needed["data"], req_info["needed_data"])
        if "needed_comm" in req_info:
            max_needed["comm"] = max(max_needed["comm"], req_info["needed_comm"])
        if "needed_tech" in req_info:
            max_needed["tech"] = max(max_needed["tech"], req_info["needed_tech"])
    deficit = 0
    if prog < max_needed["prog"]: deficit += (max_needed["prog"] - prog) * w["prog"]
    if data < max_needed["data"]: deficit += (max_needed["data"] - data) * w["data"]
    if comm < max_needed["comm"]: deficit += (max_needed["comm"] - comm) * w["comm"]
    if tech < max_needed["tech"]: deficit += (max_needed["tech"] - tech) * w["tech"]
    skill_deficit_penalty = deficit * 2.5

    # ── 9. Final score ────────────────────────────────────────────────────
    raw_score = (base_skill_score + field_bonus + natural_fit_bonus +
                 goal_bonus + interest_bonus + tool_bonus +
                 qual_bonus - skill_deficit_penalty)

    # Normalize to 0–99 range (max theoretical raw ~200)
    match_pct = (raw_score / 200.0) * 100
    return min(99, max(15, round(match_pct)))

def compute_skill_gaps(career, profile, skill_states):
    skills = profile.get("skills", {})
    tools = profile.get("tools", [])
    have = []
    need = []
    learning = []
    for skill_name, req in career["required_skills"].items():
        state = skill_states.get(skill_name, "needs")
        already_has = False
        for tool in tools:
            if tool.lower() in skill_name.lower() or skill_name.lower() in tool.lower():
                already_has = True
                break
        if not already_has:
    
            if "needed_prog" in req and skills.get("prog", 0) >= max(req["needed_prog"], 70):
                already_has = True
            if "needed_data" in req and skills.get("data", 0) >= max(req["needed_data"], 70):
                already_has = True
            if "needed_comm" in req and skills.get("comm", 0) >= max(req["needed_comm"], 70):
                already_has = True
            if "needed_tech" in req and skills.get("tech", 0) >= max(req["needed_tech"], 70):
                already_has = True
            
        if already_has or state == "completed":
            have.append({"name": skill_name, "weight": req.get("weight", "medium"), "state": "completed"})
        elif state == "learning":
            learning.append({"name": skill_name, "weight": req.get("weight", "medium"), "state": "learning"})
        else:
            need.append({"name": skill_name, "weight": req.get("weight", "medium"), "state": "needs"})
    return {"have": have, "need": need, "learning": learning}


def build_roadmap(career, profile, skill_gaps):
    template_key = career.get("roadmap_template", "data_analyst")
    template = ROADMAP_TEMPLATES.get(template_key, ROADMAP_TEMPLATES["data_analyst"])
    have_count = len(skill_gaps["have"])
    total_skills = have_count + len(skill_gaps["need"]) + len(skill_gaps["learning"])
    if total_skills > 0:
        skill_pct = have_count / total_skills * 100
    else:
        skill_pct = 0
    hours_map = {"5": 1.8, "10": 1.2, "20": 0.9, "40": 0.6}
    hours = profile.get("hours", "10")
    mult = hours_map.get(hours, 1.2)
    roadmap = []
    for i, step in enumerate(template):
        threshold = step["state_threshold"]
        if skill_pct >= threshold:
            state = "done"
        elif skill_pct >= (threshold - 20):
            state = "active"
        else:
            state = "pending"
        adj_weeks = max(2, round(step["duration_weeks"] * mult))
        desc = step["base_desc"]
        if adj_weeks > 0:
            if adj_weeks == 1:
                desc = desc + " Duration: 1 week."
            else:
                desc = desc + " Duration: " + str(adj_weeks) + " weeks."
        roadmap.append({
            "step": i + 1,
            "nsqf": step["nsqf"],
            "title": step["title"],
            "desc": desc,
            "state": state,
            "duration_weeks": adj_weeks
        })
    return roadmap


def compute_salary(career, profile):
    year = profile.get("year", "2025")
    qual = profile.get("qualification", "ug")
    try:
        if str(year).isdigit():
            grad_yr = int(year)
        else:
            grad_yr = 2025
        # ── UPDATED: handle future grad years (2026-2030) as 0 experience ──
        current_year = datetime.datetime.utcnow().year
        exp_years = max(0, current_year - grad_yr)
    except Exception:
        exp_years = 0
    if exp_years <= 1:
        exp_key = "0"
    elif exp_years <= 3:
        exp_key = "2"
    elif exp_years <= 6:
        exp_key = "4"
    else:
        exp_key = "7"
    qual_boost = {"phd": 1.25, "pg": 1.15, "ug": 1.0, "diploma": 0.9, "12th": 0.82, "10th": 0.75}
    q_mult = qual_boost.get(qual, 1.0)
    base = career["base_salary"].get(exp_key, [5, 10])
    lo = round(base[0] * q_mult, 1)
    hi = round(base[1] * q_mult, 1)
    return {"exp_key": exp_key, "exp_years": exp_years, "lo": lo, "hi": hi, "avg": round((lo + hi) / 2, 1)}


def find_user_by_email(email):
    return next((u for u in db["users"] if u["email"] == email), None)


def find_user_by_id(uid):
    return next((u for u in db["users"] if u["id"] == uid), None)


def get_token():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth.split(" ")[1]
    return None


def verify_token():
    token = get_token()
    if not token:
        return None, jsonify({"error": "No token provided"}), 401
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload, None, None
    except Exception:
        return None, jsonify({"error": "Invalid token"}), 401


def make_token(uid, email):
    payload = {
        "id": uid,
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def user_public(u):
    return {
        "id": u["id"],
        "name": u["name"],
        "email": u["email"],
        "profile": u.get("profile"),
        "hasProfile": u.get("profile") is not None,
        "streak": u.get("streak", 0),
        "skillStates": u.get("skill_states", {})
    }


# ─────────────────────────────────────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/auth/register", methods=["POST"])
def register():
    d = request.get_json()
    name = d.get("name", "").strip()
    email = d.get("email", "").strip()
    password = d.get("password", "")
    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400
    if find_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 409
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = {
        "id": len(db["users"]) + 1,
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "google_id": None,
        "profile": None,
        "skill_states": {},
        "streak": 0,
        "last_login": datetime.datetime.utcnow().isoformat()
    }
    db["users"].append(user)
    token = make_token(user["id"], email)
    return jsonify({"token": token, "user": user_public(user)}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    d = request.get_json()
    email = d.get("email", "").strip()
    password = d.get("password", "")
    user = find_user_by_email(email)
    if not user or not user.get("password_hash") or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Invalid credentials"}), 401
    try:
        last = datetime.datetime.fromisoformat(user["last_login"])
        days = (datetime.datetime.utcnow() - last).days
        if days == 1:
            user["streak"] = user.get("streak", 0) + 1
        elif days > 1:
            user["streak"] = 1
    except Exception:
        pass
    user["last_login"] = datetime.datetime.utcnow().isoformat()
    token = make_token(user["id"], email)
    return jsonify({"token": token, "user": user_public(user)})


# ── NEW: Google Sign-In route ─────────────────────────────────────────────────
@app.route("/api/auth/google", methods=["POST"])
def google_login():
    """
    Frontend sends the Google credential token here after user clicks
    the Google Sign-In button. This verifies it and returns a JWT.
    """
    if not GOOGLE_AUTH_AVAILABLE:
        return jsonify({"error": "Google auth library not installed on server. Run: pip install google-auth"}), 503

    data = request.get_json()
    credential = data.get("credential")
    if not credential:
        return jsonify({"error": "No Google credential provided"}), 400

    if GOOGLE_CLIENT_ID == "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com":
        return jsonify({"error": "Google Client ID not configured in server.py. Replace GOOGLE_CLIENT_ID with your real client ID."}), 503

    try:
        # Verify the Google token
        id_info = id_token.verify_oauth2_token(
            credential,
            grequests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
 )
       
        google_id = id_info["sub"]
        email = id_info["email"]
        name = id_info.get("name", email.split("@")[0])

        # Find existing user by google_id or email
        user = next((u for u in db["users"] if u.get("google_id") == google_id), None)
        if not user:
            user = find_user_by_email(email)

        if user:
            # Link Google ID if not already linked
            if not user.get("google_id"):
                user["google_id"] = google_id
        else:
            # Create new user via Google
            user = {
                "id": len(db["users"]) + 1,
                "name": name,
                "email": email,
                "password_hash": None,
                "google_id": google_id,
                "profile": None,
                "skill_states": {},
                "streak": 0,
                "last_login": datetime.datetime.utcnow().isoformat()
            }
            db["users"].append(user)

        # Update streak
        try:
            last = datetime.datetime.fromisoformat(user["last_login"])
            days = (datetime.datetime.utcnow() - last).days
            if days == 1:
                user["streak"] = user.get("streak", 0) + 1
            elif days > 1:
                user["streak"] = 1
        except Exception:
            pass
        user["last_login"] = datetime.datetime.utcnow().isoformat()

        token = make_token(user["id"], email)
        return jsonify({"token": token, "user": user_public(user)})

    except ValueError as e:
        return jsonify({"error": "Invalid Google token: " + str(e)}), 401
    except Exception as e:
        return jsonify({"error": "Google login failed: " + str(e)}), 500
# ─────────────────────────────────────────────────────────────────────────────


@app.route("/api/user/me", methods=["GET"])
def get_me():
    payload, err, code = verify_token()
    if err is not None:
        return err, code
    user = find_user_by_id(payload["id"])
    if not user:
        return jsonify({"error": "Not found"}), 404
    return jsonify(user_public(user))


@app.route("/api/user/profile", methods=["POST"])
def save_profile():
    payload, err, code = verify_token()
    if err is not None:
        return err, code
    user = find_user_by_id(payload["id"])
    if not user:
        return jsonify({"error": "Not found"}), 404
    user["profile"] = request.get_json()
    return jsonify({"success": True, "profile": user["profile"]})


@app.route("/api/user/skills", methods=["PATCH"])
def update_skills():
    payload, err, code = verify_token()
    if err is not None:
        return err, code
    user = find_user_by_id(payload["id"])
    if not user:
        return jsonify({"error": "Not found"}), 404
    user["skill_states"].update(request.get_json())
    return jsonify({"success": True, "skillStates": user["skill_states"]})


@app.route("/api/careers/match", methods=["GET"])
def match_careers():
    payload, err, code = verify_token()
    if err is not None:
        return err, code
    user = find_user_by_id(payload["id"])
    if not user or not user.get("profile"):
        return jsonify({"careers": [], "message": "No profile found"})
    profile = user["profile"]
    results = []
    for career in ALL_CAREERS:
        score = compute_score(career, profile)
        sal = compute_salary(career, profile)
        salary_str = "Rs." + str(sal["lo"]) + "-" + str(sal["hi"]) + " LPA"
        nsqf_str = "Level " + str(career["nsqf_level"])
        results.append({
            "id": career["id"],
            "name": career["name"],
            "score": score,
            "nsqf": nsqf_str,
            "tags": career["tags"],
            "salary": salary_str,
            "demand": career["demand"],
            "growth": career["growth"],
            "openings": career["openings"]
        })
    results.sort(key=lambda x: x["score"], reverse=True)
    for i, c in enumerate(results):
        c["rank"] = i + 1
    return jsonify({"careers": results})


@app.route("/api/skills/analysis", methods=["GET"])
def skill_analysis():
    payload, err, code = verify_token()
    if err is not None:
        return err, code
    user = find_user_by_id(payload["id"])
    if not user or not user.get("profile"):
        return jsonify({"error": "No profile"}), 400
    profile = user["profile"]
    skill_states = user.get("skill_states", {})
    career_id = request.args.get("career_id", None)
    if career_id:
        career = next((c for c in ALL_CAREERS if c["id"] == int(career_id)), None)
    else:
        scored = sorted(ALL_CAREERS, key=lambda c: compute_score(c, profile), reverse=True)
        career = scored[0] if scored else ALL_CAREERS[0]
    if not career:
        return jsonify({"error": "Career not found"}), 404
    gaps = compute_skill_gaps(career, profile, skill_states)
    score = compute_score(career, profile)
    have_count = len(gaps["have"]) + len(gaps["learning"]) * 0.5
    total = len(gaps["have"]) + len(gaps["need"]) + len(gaps["learning"])
    if total > 0:
        adjusted_score = min(99, round(score + (have_count / total) * 15))
    else:
        adjusted_score = score
    nsqf_str = "Level " + str(career["nsqf_level"])
    return jsonify({
        "career": {"id": career["id"], "name": career["name"], "nsqf": nsqf_str},
        "match_score": adjusted_score,
        "have": [g["name"] for g in gaps["have"]],
        "need": [{"name": g["name"], "weight": g["weight"]} for g in gaps["need"]],
        "learning": [g["name"] for g in gaps["learning"]],
        "skill_states": skill_states
    })


@app.route("/api/roadmap", methods=["GET"])
def get_roadmap():
    payload, err, code = verify_token()
    if err is not None:
        return err, code
    user = find_user_by_id(payload["id"])
    if not user or not user.get("profile"):
        return jsonify({"error": "No profile"}), 400
    profile = user["profile"]
    skill_states = user.get("skill_states", {})
    career_id = request.args.get("career_id", None)
    if career_id:
        career = next((c for c in ALL_CAREERS if c["id"] == int(career_id)), None)
    else:
        scored = sorted(ALL_CAREERS, key=lambda c: compute_score(c, profile), reverse=True)
        career = scored[0] if scored else ALL_CAREERS[0]
    if not career:
        return jsonify({"error": "Career not found"}), 404
    gaps = compute_skill_gaps(career, profile, skill_states)
    roadmap = build_roadmap(career, profile, gaps)
    return jsonify({
        "career": {"id": career["id"], "name": career["name"]},
        "roadmap": roadmap
    })


@app.route("/api/salary", methods=["GET"])
def get_salary():
    payload, err, code = verify_token()
    if err is not None:
        return err, code
    user = find_user_by_id(payload["id"])
    if not user or not user.get("profile"):
        return jsonify({"error": "No profile"}), 400
    profile = user["profile"]
    career_id = request.args.get("career_id", 1)
    city = request.args.get("city", "bangalore")
    career = next((c for c in ALL_CAREERS if c["id"] == int(career_id)), ALL_CAREERS[0])
    sal = compute_salary(career, profile)
    city_mult = career["city_mult"].get(city, 1.0)
    lo = round(sal["lo"] * city_mult, 1)
    hi = round(sal["hi"] * city_mult, 1)
    avg = round((lo + hi) / 2, 1)
    monthly_avg = round(avg * 100000 / 12)
    inhand = round(monthly_avg * 0.70)
    growth_proj = []
    for yr in range(6):
        proj_lo = round(lo * (1.12 ** yr), 1)
        proj_hi = round(hi * (1.12 ** yr), 1)
        proj_avg = round((proj_lo + proj_hi) / 2, 1)
        if yr == 0:
            label = "Now"
        else:
            label = "Year " + str(yr)
        growth_proj.append({"year": yr, "label": label, "lo": proj_lo, "hi": proj_hi, "avg": proj_avg})
    all_roles = []
    for c in ALL_CAREERS:
        c_sal = compute_salary(c, profile)
        c_city_mult = c["city_mult"].get(city, 1.0)
        all_roles.append({
            "id": c["id"],
            "name": c["name"],
            "lo": round(c_sal["lo"] * c_city_mult, 1),
            "hi": round(c_sal["hi"] * c_city_mult, 1)
        })
    return jsonify({
        "career": career["name"],
        "city": city,
        "experience_years": sal["exp_years"],
        "salary_range": {"lo": lo, "hi": hi, "avg": avg},
        "monthly_avg": monthly_avg,
        "monthly_inhand": inhand,
        "with_bonus": round(hi * 1.15, 1),
        "growth_projection": growth_proj,
        "all_roles": all_roles
    })


@app.route("/api/market", methods=["GET"])
def get_market():
    payload, err, code = verify_token()
    if err is not None:
        return err, code
    return jsonify({
        "insights": [
            {"label": "Avg. Data Analyst Salary", "val": "Rs.7.5 LPA", "sub": "Up 18% YoY"},
            {"label": "Job Postings (India)",      "val": "48,000+",    "sub": "Active this month"},
            {"label": "Top Hiring City",           "val": "Bengaluru",  "sub": "Followed by Hyderabad"},
            {"label": "Fastest Growing Role",      "val": "AI Engineer","sub": "Up 42% demand"},
            {"label": "Remote Jobs",               "val": "34%",        "sub": "Of all Data roles"},
            {"label": "Fresher Openings",          "val": "12,000+",    "sub": "Entry-level posts"}
        ],
        "heatmap": [
            {"city": "Bengaluru", "jobs": "48,200", "heat": 1.0},
            {"city": "Hyderabad", "jobs": "32,500", "heat": 0.85},
            {"city": "Mumbai",    "jobs": "28,100", "heat": 0.75},
            {"city": "Delhi NCR", "jobs": "26,800", "heat": 0.72},
            {"city": "Pune",      "jobs": "19,400", "heat": 0.58},
            {"city": "Chennai",   "jobs": "15,200", "heat": 0.48},
            {"city": "Noida",     "jobs": "14,700", "heat": 0.44},
            {"city": "Gurugram",  "jobs": "18,900", "heat": 0.55},
            {"city": "Kolkata",   "jobs": "8,300",  "heat": 0.30},
            {"city": "Ahmedabad", "jobs": "6,100",  "heat": 0.22}
        ],
        "trends": {
            "demandLabels": ["Data Analyst", "ML Engineer", "Cloud Architect", "Cybersecurity", "BI Analyst", "DevOps", "Data Scientist", "UI/UX"],
            "demandValues": [48, 38, 29, 24, 22, 35, 32, 18],
            "salaryRoles":  ["Data Analyst", "BI Analyst", "Data Scientist", "ML Engineer", "Data Engineer", "Cloud Architect"],
            "salaryMin":    [5, 7, 10, 12, 10, 14],
            "salaryMax":    [12, 15, 22, 28, 25, 32]
        },
        "whatsNew": [
            "Data Analyst demand up 22% in the last 30 days - highest in 18 months",
            "New NSQF Level 5 certification launched by NASSCOM FutureSkills",
            "Bengaluru surpassed Hyderabad as top hiring city for data roles",
            "Average fresher salary for ML roles crossed Rs.8 LPA for the first time",
            "Python overtook Java as the most-listed skill in Indian job postings"
        ]
    })


@app.route("/api/courses", methods=["GET"])
def get_courses():
    payload, err, code = verify_token()
    if err is not None:
        return err, code
    user = find_user_by_id(payload["id"])
    needed_skills = []
    if user and user.get("profile"):
        profile = user["profile"]
        skill_states = user.get("skill_states", {})
        scored = sorted(ALL_CAREERS, key=lambda c: compute_score(c, profile), reverse=True)
        if scored:
            gaps = compute_skill_gaps(scored[0], profile, skill_states)
            needed_skills = [g["name"] for g in gaps["need"]]
    all_courses = [
        {"provider": "NIELIT / NSDC",        "name": "Data Analytics Fundamentals",      "nsqf": "NSQF Level 4", "dur": "8 weeks",  "free": True,  "skills": ["SQL", "Data Analysis", "Statistics"]},
        {"provider": "NPTEL (IIT)",           "name": "Python for Data Science",           "nsqf": "NSQF Level 5", "dur": "12 weeks", "free": True,  "skills": ["Python Advanced", "Basic Python", "Data Preprocessing"]},
        {"provider": "Skill India Portal",    "name": "SQL and Database Basics",           "nsqf": "NSQF Level 4", "dur": "4 weeks",  "free": True,  "skills": ["SQL", "SQL and Databases"]},
        {"provider": "Microsoft x NSDC",      "name": "Power BI Data Visualisation",       "nsqf": "NSQF Level 5", "dur": "6 weeks",  "free": False, "skills": ["Power BI", "Data Visualization"]},
        {"provider": "Google (Coursera)",     "name": "Data Analytics Certificate",        "nsqf": "NSQF Level 5", "dur": "6 months", "free": False, "skills": ["Data Analysis", "Statistics", "SQL"]},
        {"provider": "NASSCOM FutureSkills",  "name": "Machine Learning Essentials",       "nsqf": "NSQF Level 6", "dur": "10 weeks", "free": False, "skills": ["Machine Learning", "Statistics and Math"]},
        {"provider": "Swayam (GOI)",          "name": "Introduction to Big Data",          "nsqf": "NSQF Level 5", "dur": "8 weeks",  "free": True,  "skills": ["Apache Spark", "ETL Pipelines", "Cloud Platforms"]},
        {"provider": "Internshala Training",  "name": "Data Visualization with Tableau",   "nsqf": "NSQF Level 4", "dur": "5 weeks",  "free": False, "skills": ["Tableau", "Data Visualization"]},
        {"provider": "Google Digital Garage", "name": "Digital Marketing Fundamentals",    "nsqf": "NSQF Level 3", "dur": "6 weeks",  "free": True,  "skills": ["Google Analytics", "SEO and SEM"]},
        {"provider": "AWS Training",          "name": "AWS Cloud Practitioner",            "nsqf": "NSQF Level 5", "dur": "8 weeks",  "free": False, "skills": ["AWS Azure GCP", "Cloud Platforms"]},
        {"provider": "ISTQB",                 "name": "Software Testing Foundation",       "nsqf": "NSQF Level 4", "dur": "6 weeks",  "free": False, "skills": ["Manual Testing", "JIRA Bug Tracking"]},
        {"provider": "Coursera (IBM)",        "name": "Business Intelligence Reporting",   "nsqf": "NSQF Level 5", "dur": "8 weeks",  "free": False, "skills": ["Power BI", "DAX / M Language", "Data Modeling"]},
        # NEW medical courses
        {"provider": "Coursera (Johns Hopkins)","name": "Health Informatics Specialization","nsqf": "NSQF Level 5", "dur": "4 months", "free": False, "skills": ["HL7 and FHIR Standards", "EHR EMR Systems", "Healthcare Data Systems"]},
        {"provider": "NPTEL (IIT Kharagpur)", "name": "Medical Informatics",               "nsqf": "NSQF Level 5", "dur": "8 weeks",  "free": True,  "skills": ["HMIS EHR Systems", "Healthcare Data Systems", "ICD-10 Medical Coding"]},
        {"provider": "edX (MIT)",             "name": "Computational Biology",             "nsqf": "NSQF Level 6", "dur": "12 weeks", "free": False, "skills": ["Bioinformatics Genomics", "Python and R Programming", "Statistical Modeling"]},
        {"provider": "Coursera (Duke Univ)",  "name": "Clinical Data Science",             "nsqf": "NSQF Level 6", "dur": "5 months", "free": False, "skills": ["CDISC Standards SDTM ADaM", "SAS Programming", "Clinical Trial Protocols"]},
        {"provider": "Swayam (GOI)",          "name": "Biomedical Signal Processing",      "nsqf": "NSQF Level 5", "dur": "10 weeks", "free": True,  "skills": ["Signal Processing", "C and C++ Programming", "Embedded Systems RTOS"]},
        {"provider": "NASSCOM FutureSkills",  "name": "AI in Healthcare",                  "nsqf": "NSQF Level 6", "dur": "8 weeks",  "free": False, "skills": ["Deep Learning CNN", "DICOM Medical Imaging", "Medical Image Datasets"]},
        {"provider": "Coursera (Stanford)",   "name": "AI in Medicine Specialization",     "nsqf": "NSQF Level 7", "dur": "6 months", "free": False, "skills": ["ML for Drug Discovery", "Clinical Data Interpretation", "Model Validation FDA"]},
        {"provider": "Skill India Portal",    "name": "Digital Health and Telemedicine",   "nsqf": "NSQF Level 5", "dur": "6 weeks",  "free": True,  "skills": ["Healthcare API FHIR", "Data Security HIPAA", "IoT Device Integration"]}
    ]

    def course_relevance(course):
        for skill in course.get("skills", []):
            for ns in needed_skills:
                if skill.lower() in ns.lower() or ns.lower() in skill.lower():
                    return 0
        return 1

    sorted_courses = sorted(all_courses, key=course_relevance)
    for c in sorted_courses:
        c.pop("skills", None)
    return jsonify({"courses": sorted_courses})


@app.route("/api/tips", methods=["GET"])
def get_tip():
    payload, err, code = verify_token()
    user = None
    if err is None:
        user = find_user_by_id(payload["id"])
    tips = [
        "Python is the number 1 skill employers look for in Data roles in India in 2025.",
        "NSQF Level 5 certifications increase salary negotiation leverage by up to 28 percent.",
        "Candidates with both SQL and data visualisation get 40 percent more interview calls.",
        "LinkedIn profiles with certifications get 6 times more views from recruiters.",
        "Bengaluru alone added 14000 new data roles in Q1 2025.",
        "Power BI proficiency can increase a fresher starting package by 1 to 2 LPA.",
        "80 percent of Data Analyst job descriptions now require at least basic Python knowledge.",
        "NCVET apprenticeships offer stipends up to 15000 per month while you learn.",
        "Soft skills like communication add up to 30 percent weight in data role interviews.",
        "Adding a Kaggle profile with 2 to 3 projects can double your shortlisting rate.",
        # NEW medical tips
        "HL7 FHIR is the most in-demand standard in Health IT - learning it adds 2 to 3 LPA.",
        "AI in Medical Imaging is growing 48 percent per year - fastest healthcare tech role.",
        "Clinical Data Engineers with SAS certification earn 25 percent more than uncertified peers.",
        "Telemedicine platform developers are among the top 10 highest-paid healthtech roles in India.",
        "Biomedical AI research roles at AIIMS and IITs offer stipends of Rs.50000 to Rs.80000 per month."
    ]
    if user and user.get("profile"):
        skills = user["profile"].get("skills", {})
        field = user["profile"].get("field", "")
        if skills.get("prog", 0) < 50:
            tips.insert(0, "Your programming score is low - focus on Python basics to unlock higher-paying roles.")
        if skills.get("data", 0) < 50:
            tips.insert(0, "Boosting your data analysis skills could raise your match score by 15 points.")
        if skills.get("comm", 0) > 70:
            tips.insert(0, "Your strong communication skills are great - consider Product Analyst roles.")
        # Medical field specific tips
        if field == "medical":
            tips.insert(0, "Your medical background is a unique advantage - Health Informatics and Clinical Data roles value domain knowledge highly.")
    return jsonify({"tip": random.choice(tips[:6])})


# ── NEW: endpoint to get valid graduation years ───────────────────────────────
@app.route("/api/config/years", methods=["GET"])
def get_valid_years():
    """Returns list of valid graduation years from 2015 to 2030."""
    current_year = datetime.datetime.utcnow().year
    years = list(range(2015, 2031))   # 2015 → 2030 inclusive
    return jsonify({"years": years, "current_year": current_year})
# ─────────────────────────────────────────────────────────────────────────────


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "PathForge Backend running"})


if __name__ == "__main__":
    print("")
    print("PathForge Smart Python Backend")
    print("=" * 50)
    print("Running on  : http://localhost:3001")
    print("Demo login  : priya@example.com / password")
    print("Google Auth : Set GOOGLE_CLIENT_ID before using")
    print("New features: Google Sign-In, Medical Careers (13-18), Years up to 2030")
    print("=" * 50)
    print("")
    app.run(port=3001, debug=True)