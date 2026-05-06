# Ecommerce-S

Ecommerce-S is a modern AI-powered retail management system. This repository currently contains only the clean project foundation: a React + Vite + Tailwind frontend and a FastAPI + SQLAlchemy backend prepared for MySQL and JWT authentication.

Business modules and AI modules are intentionally not generated yet.

## Project Structure

```text
Ecommerce-S/
+-- frontend/
+-- backend/
+-- ai/
`-- docs/
```

## Frontend

The frontend uses React, Vite, and Tailwind CSS.

Generated sections:

- `frontend/package.json` defines scripts and frontend dependencies.
- `frontend/vite.config.js` enables React and Tailwind through Vite plugins.
- `frontend/src/index.css` imports Tailwind and defines the base visual theme.
- `frontend/src/main.jsx` mounts the React app.
- `frontend/src/App.jsx` connects the starter layout and home page.
- `frontend/src/components` holds reusable UI pieces.
- `frontend/src/pages` holds route-level screens.
- `frontend/src/services` holds API client code.
- `frontend/src/layouts` holds app shell layouts.
- `frontend/src/hooks` holds reusable React hooks.
- `frontend/src/utils` holds small shared helpers.

Setup:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server normally starts at `http://localhost:5173`.

## Backend

The backend uses FastAPI, SQLAlchemy 2.x, Pydantic 2.x, PyJWT, and PyMySQL.

Generated sections:

- `backend/requirements.txt` lists Python 3.14 compatible packages.
- `backend/.env.example` documents local environment variables.
- `backend/app/main.py` creates the FastAPI application and configures CORS.
- `backend/app/core/config.py` centralizes settings with Pydantic Settings.
- `backend/app/database/session.py` creates the SQLAlchemy engine and session factory.
- `backend/app/database/base.py` provides the declarative model base.
- `backend/app/routes/health.py` exposes a starter health endpoint.
- `backend/app/schemas` holds request and response schemas.
- `backend/app/models` is reserved for SQLAlchemy models.
- `backend/app/services` is reserved for business logic.
- `backend/app/auth` is reserved for JWT authentication helpers.
- `backend/app/utils` is reserved for shared backend helpers.

Setup:

```bash
cd backend
python --version
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

The FastAPI dev server normally starts at `http://localhost:8000`.

Use Python `3.14.x` for this backend. If `python --version` fails on Windows, install Python 3.14 and enable the installer option that adds Python to PATH, then open a new terminal.

Health check:

```bash
curl http://localhost:8000/api/v1/health
```

## Database

The backend is configured for MySQL through SQLAlchemy and PyMySQL.

Default local database URL:

```text
mysql+pymysql://root:password@localhost:3306/ecommerce_s
```

Update `backend/.env` with your actual MySQL username, password, host, port, and database name before running database-backed features.

## Major Decisions

- Tailwind CSS is wired through the modern Vite plugin so styling stays simple and fast.
- Backend settings live in one Pydantic Settings class so environment configuration does not spread across files.
- SQLAlchemy is configured in a dedicated database package so future models and migrations have a clear home.
- CORS allows local Vite origins by default, keeping frontend and backend development smooth without opening the API to every origin.
- JWT support is represented in the foundation dependencies and `auth` package, but login/register modules are intentionally left for the next step.
