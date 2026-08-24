import os
import secrets

from fastapi import HTTPException, Request

def verify_credentials(username: str, password: str) -> bool:
    admin_password = os.getenv("ADMIN_PASSWORD", "")
    if not admin_password:
        return False
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    return secrets.compare_digest(username, admin_username) and secrets.compare_digest(
        password, admin_password
    )


def is_admin(request: Request) -> bool:
    return bool(request.session.get("is_admin"))


def require_admin(request: Request) -> None:
    """FastAPI dependency: raises 401 for API routes when not logged in as admin."""
    if not is_admin(request):
        raise HTTPException(status_code=401, detail="Admin login required")
