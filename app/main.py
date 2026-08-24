import os
import secrets

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware

from app.auth import is_admin, verify_credentials
from app.database import Base, engine
from app.routers import queue, admin, customers

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Barbershop Queue")

cors_origins = [origin for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_secret = os.getenv("SESSION_SECRET_KEY")
if not session_secret:
    session_secret = secrets.token_hex(32)
session_https_only = os.getenv("SESSION_HTTPS_ONLY", "false").lower() == "true"
app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret,
    session_cookie="barbershop_session",
    https_only=session_https_only,
)

templates = Jinja2Templates(directory="app/templates")

app.include_router(queue.router)
app.include_router(queue.admin_router)
app.include_router(admin.public_router)
app.include_router(admin.router)
app.include_router(customers.router)


def _render(request: Request, template_name: str):
    return templates.TemplateResponse(
        template_name, {"request": request, "is_admin": is_admin(request)}
    )


def _require_admin_page(request: Request, template_name: str):
    if not is_admin(request):
        return RedirectResponse(url=f"/login?next={request.url.path}", status_code=303)
    return _render(request, template_name)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def checkin_page(request: Request):
    return _render(request, "checkin.html")


@app.get("/login")
def login_page(request: Request, next: str = "/dashboard"):
    if is_admin(request):
        return RedirectResponse(url=next, status_code=303)
    return templates.TemplateResponse(
        "login.html", {"request": request, "is_admin": False, "next": next, "error": None}
    )


@app.post("/login")
def login_submit(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    next: str = Form("/dashboard"),
):
    if verify_credentials(username, password):
        request.session["is_admin"] = True
        return RedirectResponse(url=next, status_code=303)
    return templates.TemplateResponse(
        "login.html",
        {
            "request": request,
            "is_admin": False,
            "next": next,
            "error": "Invalid username or password.",
        },
        status_code=401,
    )


@app.post("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/", status_code=303)


@app.get("/dashboard")
def dashboard_page(request: Request):
    return _require_admin_page(request, "dashboard.html")


@app.get("/history")
def history_page(request: Request):
    return _require_admin_page(request, "history.html")


@app.get("/customers")
def customers_page(request: Request):
    return _require_admin_page(request, "customers.html")


@app.get("/settings")
def settings_page(request: Request):
    return _require_admin_page(request, "settings.html")
