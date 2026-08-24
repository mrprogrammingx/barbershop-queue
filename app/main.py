from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates

from app.database import Base, engine
from app.routers import queue, admin, customers

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Barbershop Queue")

templates = Jinja2Templates(directory="app/templates")

app.include_router(queue.router)
app.include_router(admin.router)
app.include_router(customers.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def checkin_page(request: Request):
    return templates.TemplateResponse("checkin.html", {"request": request})


@app.get("/dashboard")
def dashboard_page(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/history")
def history_page(request: Request):
    return templates.TemplateResponse("history.html", {"request": request})


@app.get("/customers")
def customers_page(request: Request):
    return templates.TemplateResponse("customers.html", {"request": request})
