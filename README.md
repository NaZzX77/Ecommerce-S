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

Authentication foundation:

- `backend/app/models/user.py` defines the SQLAlchemy `User` table model.
- `backend/app/schemas/auth.py` defines Pydantic request and response contracts for register, login, users, and tokens.
- `backend/app/auth/password.py` hashes and verifies passwords with Argon2 through `pwdlib`.
- `backend/app/auth/jwt.py` creates and decodes JWT access tokens using environment-based settings.
- `backend/app/auth/dependencies.py` verifies bearer tokens and loads the current authenticated user.
- `backend/app/services/user_service.py` keeps user lookup, creation, and credential checks out of route handlers.
- `backend/app/routes/auth.py` exposes register, login, and current-user endpoints.
- `backend/app/routes/protected.py` provides a small JWT-protected route example.
- `backend/app/database/init_db.py` creates starter tables from SQLAlchemy metadata for local foundation development.

Frontend authentication foundation:

- `frontend/src/pages/LoginPage.jsx` renders the login form.
- `frontend/src/pages/RegisterPage.jsx` renders the registration form.
- `frontend/src/pages/ProtectedDashboard.jsx` shows a simple JWT-protected dashboard.
- `frontend/src/components/AuthProvider.jsx` owns basic auth state.
- `frontend/src/components/ProtectedRoute.jsx` redirects anonymous users to login.
- `frontend/src/hooks/useAuth.js` exposes the auth state hook.
- `frontend/src/services/authApi.js` calls backend auth endpoints.
- `frontend/src/services/tokenStorage.js` stores the JWT in `sessionStorage` for this foundation stage. A later production hardening step should move tokens to an HTTP-only cookie flow.

Product management foundation:

- `backend/app/models/product.py` defines the SQLAlchemy `Product` table model.
- `backend/app/schemas/product.py` defines product create, update, and response schemas.
- `backend/app/services/product_service.py` keeps product CRUD logic out of route handlers.
- `backend/app/routes/products.py` exposes JWT-protected product CRUD endpoints.
- `frontend/src/pages/ProductsPage.jsx` renders the protected product form and table.
- `frontend/src/services/productApi.js` calls the product CRUD API with the stored JWT.

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

Local-only database URL format:

```text
mysql+pymysql://MYSQL_USER:MYSQL_PASSWORD@localhost:3306/ecommerce_s
```

Create a local MySQL database:

```sql
CREATE DATABASE IF NOT EXISTS ecommerce_s
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Then copy `backend/.env.example` to `backend/.env` and replace the placeholder database username, password, and JWT secret with local-only values. The `.env` file is ignored by Git, so secrets stay on your machine.

Database configuration files:

- `backend/.env` holds local-only database credentials and secrets.
- `backend/.env.example` documents safe placeholder variables for other developers.
- `backend/app/core/config.py` loads environment variables with Pydantic Settings.
- `backend/app/database/session.py` creates the SQLAlchemy engine and session factory from `DATABASE_URL`.
- `backend/app/database/init_db.py` creates starter tables from the registered SQLAlchemy models during local development.

## Major Decisions

- Tailwind CSS is wired through the modern Vite plugin so styling stays simple and fast.
- Backend settings live in one Pydantic Settings class so environment configuration does not spread across files.
- SQLAlchemy is configured in a dedicated database package so future models and migrations have a clear home.
- CORS allows local Vite origins by default, keeping frontend and backend development smooth without opening the API to every origin.
- JWT support is represented in the foundation dependencies and `auth` package, but login/register modules are intentionally left for the next step.
