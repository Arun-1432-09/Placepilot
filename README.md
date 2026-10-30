# PlacePilot — AI-Powered Campus Placement Prediction System

> **"Your Journey to Placement Starts Here."**

PlacePilot is a production-grade, full-stack web application designed for engineering colleges and universities. It enables students to evaluate their campus placement readiness, predict placement outcomes using a real Scikit-Learn machine-learning model, diagnose personal skill gaps, and track preparation progress. It also provides faculty and placement cells with cohort analytics, department breakdowns, and exportable audit reports.

---

## 🌟 Key Features

### For Students
- **Multi-Factor Assessment Wizard**: 5-step evaluation covering Academic Standing (CGPA, Backlogs), Technical Core (DBMS, OS, Networks), Coding Fluency (DSA), Aptitude (Quant, Logic), Practical Portfolio (Projects, Internships, Certifications), and Interview Polish.
- **Genuine Machine-Learning Engine**: Real Scikit-Learn Random Forest classification pipeline predicting placement category (`Placement Ready`, `Developing`, `Needs Preparation`) and probability score (0–100%).
- **Interactive Readiness Dashboard**: Radar chart visualizing 5-pillar skill distributions, score cards, and diagnostic benchmarks.
- **Data-Driven Preparation Task Hub**: Actionable, prioritized recommendations generated directly from individual student score gaps, with interactive completion tracking saved to the database.
- **Assessment History & Progression Tracking**: Compare performance over consecutive attempts with continuous trend charts.

### For Faculty & Placement Coordinators
- **Cohort Intelligence Dashboard**: Real-time analytics tracking total enrolled vs. assessed students, average CGPA, coding fluency, and readiness distributions.
- **Departmental Benchmarks**: Comparative bar charts and statistics across departments (CSE, IT, ECE, Mechanical, etc.).
- **Searchable Student Directory**: Filter by department, readiness status, or search by student name, email, and registration number.
- **Full Student Profile Modal**: Drill down into any student's individual assessment runs, score breakdowns, and task progress.
- **One-Click Institutional CSV Export**: Generate formatted audit spreadsheets for university reviews and recruiter coordination.

---

## 🛠️ Architecture & Tech Stack

```
   ┌─────────────────────────────────────────────────────────────┐
   │                    PlacePilot Architecture                  │
   └─────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│       Frontend (Client)      │        │       Backend (REST API)     │
│  React 18 + TypeScript + Vite│◄──────►│       FastAPI + Python       │
│  Tailwind CSS + Lucide Icons │  HTTP  │  SQLAlchemy ORM + SQLite DB  │
│  Recharts (Radar/Bar/Donut)  │  JWT   │  Pydantic v2 Validation      │
└──────────────────────────────┘        └──────────────┬───────────────┘
                                                       │
                                        ┌──────────────┴───────────────┐
                                        ▼                              ▼
                         ┌─────────────────────────────┐ ┌─────────────┴──────────────┐
                         │   Scikit-Learn ML Engine    │ │  Persistent Relational DB  │
                         │  • Synthetic Data Generator │ │  • Users & Role Auth       │
                         │  • StandardScaler Pipeline  │ │  • Student Profiles        │
                         │  • Random Forest Classifier │ │  • Assessments & Runs      │
                         │  • Joblib Persisted Model   │ │  • Predictions & Metrics   │
                         └─────────────────────────────┘ │  • Actionable Roadmaps     │
                                                         └────────────────────────────┘
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Recharts, Lucide React, Axios.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite, PyJWT, Bcrypt.
- **Machine Learning**: Scikit-learn (RandomForestClassifier + StandardScaler Pipeline), Pandas, NumPy, Joblib.
- **Testing**: Pytest, FastAPI TestClient.

---

## 📂 Project Structure

```
placepilot/
├── backend/
│   ├── app/
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── data_generator.py      # Reproducible synthetic dataset generator
│   │   │   ├── train_model.py         # Model training & metrics evaluator
│   │   │   └── predict.py             # Model inference & recommendations logic
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                # Registration, login, JWT token generation
│   │   │   ├── students.py            # Student profile & dashboard summary
│   │   │   ├── assessments.py         # Multi-step assessment submission & runs
│   │   │   ├── predictions.py         # Latest prediction & model metadata
│   │   │   ├── recommendations.py     # Preparation checklist & completion toggles
│   │   │   └── admin.py               # Faculty analytics, directory & CSV export
│   │   ├── config.py                  # App settings & environment resolution
│   │   ├── database.py                # SQLAlchemy engine & SQLite session
│   │   ├── dependencies.py            # Role-based access control dependencies
│   │   ├── models.py                  # Relational database models
│   │   ├── schemas.py                 # Pydantic request & response schemas
│   │   ├── seed.py                    # Database initialization & sample data
│   │   └── main.py                    # FastAPI entry point & CORS configuration
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py                # 17 automated Pytest unit & integration tests
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── EmptyState.tsx     # Reusable empty state with call-to-action
│   │   │       ├── LoadingSpinner.tsx # Animated status indicator
│   │   │       ├── Navbar.tsx         # Public landing navigation
│   │   │       ├── ProtectedRoute.tsx # Route protection requiring active JWT
│   │   │       ├── RoleRoute.tsx      # Strict student vs faculty role gatekeeper
│   │   │       ├── Sidebar.tsx        # Responsive dashboard navigation & user card
│   │   │       └── StatusBadge.tsx    # Styled badges for readiness categories
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # Persistent user session & role state
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx     # Faculty KPIs, donut & department charts
│   │   │   ├── Dashboard.tsx          # Student overview, radar chart & tasks
│   │   │   ├── History.tsx            # Historical assessments & trend progression
│   │   │   ├── Landing.tsx            # SaaS landing page & feature overview
│   │   │   ├── Login.tsx              # Login page with 1-click Demo Fill pills
│   │   │   ├── NewAssessment.tsx      # 5-step interactive assessment wizard
│   │   │   ├── NotFound.tsx           # 404 handler
│   │   │   ├── Profile.tsx            # Student profile editor & academic record
│   │   │   ├── Recommendations.tsx    # Task hub with priority & status filters
│   │   │   ├── Register.tsx           # User registration with student/faculty toggle
│   │   │   ├── Results.tsx            # ML prediction outcome, probabilities & gaps
│   │   │   ├── StudentDetailModal.tsx # Drill-down student inspection modal
│   │   │   ├── StudentDirectory.tsx   # Filterable & searchable student registry
│   │   │   └── Unauthorized.tsx       # 403 access denied handler
│   │   ├── services/
│   │   │   └── api.ts                 # Typed Axios client & JWT interceptors
│   │   ├── types/
│   │   │   └── index.ts               # Core TypeScript interfaces
│   │   ├── App.tsx                    # Route definitions
│   │   ├── index.css                  # Tailwind styles & theme variables
│   │   └── main.tsx                   # React root entry point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── data/
│   └── synthetic_placement_data.csv   # Generated 2,000 synthetic student dataset
├── models/
│   ├── placement_model.joblib         # Trained Scikit-Learn model pipeline
│   └── model_metadata.json            # Model evaluation metrics & confusion matrix
├── .gitignore
└── README.md
```

---

## ⚡ Prerequisites

1. **Python 3.10, 3.11, 3.12, or 3.13** installed and added to `PATH`.
2. **Node.js v18+** and **npm** installed.

---

## 🚀 Quick Setup & Installation

### Step 1: Clone or Navigate to the Workspace
```powershell
# Windows PowerShell
cd "C:\Users\banot\.gemini\antigravity\scratch\placepilot"
```

### Step 2: Install Backend Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

### Step 3: Train the Machine Learning Model
The model trains on a 2,000-sample synthetic dataset with realistic correlations across 10 educational parameters.
```powershell
# From the backend directory:
python -m app.ml.train_model
```
*Output: Saves `models/placement_model.joblib` and `models/model_metadata.json` with ~85%+ accuracy.*

### Step 4: Seed the Database with Demo Data
Initializes SQLite database tables and seeds demo accounts and sample student assessment runs:
```powershell
python -m app.seed
```

### Step 5: Start the Backend Server
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

### Step 6: Install Frontend Dependencies & Start Vite
Open a second terminal window:
```powershell
cd "C:\Users\banot\.gemini\antigravity\scratch\placepilot\frontend"
npm install
npm run dev
```
- Web Application URL: `http://localhost:5173`

---

## 🔑 Demo Credentials

To test both portals during a project demonstration or viva review, use the pre-configured accounts:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Faculty / Admin** | `faculty@placepilot.edu` | `Faculty@123` | Full access to institutional dashboard, directory, and CSV export. |
| **Student** | `student@placepilot.edu` | `Student@123` | Sample student profile (Alex Mercer, CSE) with existing assessments. |

> **Tip**: On the Login page (`/login`), click the **"Demo Student"** or **"Demo Faculty"** quick-fill buttons to auto-populate credentials in one click!

---

## 🧪 Running Automated Tests

A comprehensive suite of 17 automated tests verifies authentication, role security, student profiles, assessment validation, machine learning inference, recommendation toggling, admin statistics, and CSV streaming.

```powershell
cd "C:\Users\banot\.gemini\antigravity\scratch\placepilot\backend"
pytest -p no:anyio -v tests/test_api.py
```

### Test Coverage Highlights:
- ✅ `test_health_check_endpoint`: Service operational status.
- ✅ `test_password_hashing`: Bcrypt password generation and verification.
- ✅ `test_jwt_token_creation_and_decoding`: Secure bearer token lifecycle.
- ✅ `test_user_registration`: Student onboarding and profile creation.
- ✅ `test_duplicate_registration_raises_http_exception`: Unique email enforcement.
- ✅ `test_user_login_success` & `test_user_login_invalid_password`: Auth credential checks.
- ✅ `test_role_based_access_restriction`: Verifies students cannot access faculty endpoints (403 Forbidden).
- ✅ `test_student_profile_get_and_update`: Persistence of academic metrics.
- ✅ `test_assessment_submission_and_ml_prediction`: End-to-end ML classification inference.
- ✅ `test_invalid_assessment_input_rejected`: Range and schema validation.
- ✅ `test_assessment_history_retrieval`: Relational assessment history queries.
- ✅ `test_recommendation_toggle`: Database persistence of completed preparation tasks.
- ✅ `test_student_dashboard_summary`: Multi-table dashboard aggregation.
- ✅ `test_admin_dashboard_stats`: Institutional cohort statistics and distribution.
- ✅ `test_admin_student_directory_and_filter`: Search and department filters.
- ✅ `test_admin_student_detail`: Complete student history drill-down.
- ✅ `test_admin_csv_export`: Formatted CSV stream generation.

---

## 🧠 Machine Learning Engine Details

### Feature Vector (10 Dimensions)
1. `cgpa`: Cumulative Grade Point Average (5.0 – 10.0)
2. `coding_score`: Algorithmic & Data Structure Fluency (0 – 100)
3. `technical_score`: Core CS Fundamentals: OS, DBMS, Networks, OOP (0 – 100)
4. `aptitude_score`: Quantitative Aptitude & Logical Reasoning (0 – 100)
5. `communication_score`: Verbal Articulation & Presentation (0 – 100)
6. `projects_count`: Deployable, verifiable software projects (0 – 10)
7. `internships_count`: Completed industry or research internships (0 – 5)
8. `certifications_count`: Recognized professional technical certifications (0 – 10)
9. `backlogs_count`: Active academic arrears / pending backlogs (0 – 10)
10. `resume_readiness`: Evaluated resume layout and impact formatting (0 – 100)

### Target Classification Categories
- **Placement Ready**: High likelihood of clearing company technical and HR rounds (Readiness score ≥ 68%).
- **Developing**: Good foundation with specific skill gaps that can be resolved before placement season (46% – 67%).
- **Needs Preparation**: Foundational gaps requiring dedicated remediation (< 46%).

### Algorithmic Pipeline
- **Preprocessing**: `StandardScaler` fitted exclusively on training data to prevent leakage.
- **Model**: `RandomForestClassifier(n_estimators=150, max_depth=7, min_samples_split=4, random_state=42)`.
- **Probabilities**: Continuous confidence score computed via `predict_proba()` to evaluate readiness stability.

---

## 🔒 Security & Privacy Practices

- Passwords hashed using **Bcrypt** with random salt rounds.
- Session authorization enforced via **JWT (JSON Web Tokens)** using SHA-256 HMAC signatures.
- **Role-Based Access Control (RBAC)** implemented as strict FastAPI dependency gates (`get_current_student`, `get_current_faculty`). Students receive `403 Forbidden` if attempting to reach faculty routes.
- Personal identifying attributes (names, emails) are excluded from the machine learning inference feature space.

---

## ⚖️ Model Limitations & Ethical Disclaimers

1. **Model Estimate**: Predictions represent an institutional statistical estimate and skill guidance tool. It does not constitute a legal or contractual guarantee of employment.
2. **Synthetic Training Baseline**: The training dataset is synthetically generated based on standard engineering college placement patterns and should be retrained on real institution-specific historical records when available.
3. **Continuous Revision**: Soft skills and live interview dynamics contain non-quantifiable factors that require personalized faculty mock interview feedback.

---

## 💡 Future Enhancements
- Automated Resume PDF Parsing using NLP to extract technical keywords and calculate resume readiness automatically.
- Integration with college ERP systems for automated CGPA and backlog synchronization.
- Coding contest integration (LeetCode / GitHub API) to verify project commits and algorithmic progress.
