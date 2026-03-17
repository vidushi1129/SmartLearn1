# 🎓 SmartLearn — AI Career Guidance Platform

> An intelligent, NSQF-aligned career guidance platform built for Indian students and graduates.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-smart--learn--1--vidushi1129.replit.app-gold?style=for-the-badge)](https://smart-learn-1--vidushi1129.replit.app)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0.2-black?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## ✨ What It Does

SmartLearn takes a student's academic background, skills, interests and goals — and returns a complete, personalised career plan in under 5 minutes. Every recommendation is mapped to India's **National Skills Qualification Framework (NSQF)**.

---

## 🚀 Features

- **AI Career Matching** — Scores 18+ career paths against your profile with zero data analytics bias
- **Google Sign-In** — One-click OAuth 2.0 authentication
- **Dynamic Skill Analysis** — Visual gap analysis between your current skills and what your target career needs
- **NSQF Roadmaps** — Step-by-step learning paths from your current level to job-ready
- **In-App Learning** — Structured modules with video lessons, key points, quizzes and XP tracking
- **Field-Aware Market Trends** — Job demand charts and salary data specific to your area of study
- **Salary Calculator** — Role and city-based salary estimates with 5-year growth projections
- **Resume Generator** — One-click AI resume built from your profile
- **Medical / Health Tech Careers** — 6 dedicated career paths for medical and health-tech graduates
- **Progress Tracking** — XP points, badges, streaks and completion rings

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Python, Flask, Flask-CORS |
| Auth | JWT, Google OAuth 2.0 |
| Charts | Chart.js |
| Deployment | Replit |

---

## 📁 Project Structure

```
SmartLearn/
├── frontend/
│   ├── index.html       # Main UI — all screens
│   ├── app.js           # All frontend logic
│   └── style.css        # Styling and animations
├── backend/
│   ├── server.py        # Flask API — all endpoints
│   └── requirements.txt # Python dependencies
```

---

## ⚡ Run Locally

**Backend**
```bash
cd backend
pip install -r requirements.txt
python server.py
# Runs on http://localhost:3001
```

**Frontend**
```bash
cd frontend
python -m http.server 5500
# Open http://localhost:5500
```

Demo login: `priya@example.com` / `password`

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/careers/match` | Get ranked career matches |
| GET | `/api/skills/analysis` | Skill gap analysis |
| GET | `/api/roadmap` | NSQF learning roadmap |
| GET | `/api/courses` | Recommended courses |
| GET | `/api/market` | Market trends data |
| GET | `/api/salary` | Salary estimates |

---



*Aligned with NCVET — National Council for Vocational Education and Training, Government of India*
