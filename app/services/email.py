import os
import logging

import httpx

logger = logging.getLogger("barbershop.email")

EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "resend").lower()
EMAIL_FROM = os.getenv("EMAIL_FROM", "queue@yourbarbershop.com")
EMAIL_DRY_RUN = os.getenv("EMAIL_DRY_RUN", "true").lower() == "true"
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")


def send_email(to_email: str, subject: str, body: str) -> bool:
    """Send an email via Resend or SendGrid. Returns True on success (or dry-run)."""
    if EMAIL_DRY_RUN:
        logger.info("[DRY RUN] Email to %s | subject=%r | body=%r", to_email, subject, body)
        return True

    try:
        if EMAIL_PROVIDER == "resend":
            return _send_via_resend(to_email, subject, body)
        elif EMAIL_PROVIDER == "sendgrid":
            return _send_via_sendgrid(to_email, subject, body)
        else:
            logger.error("Unknown EMAIL_PROVIDER: %s", EMAIL_PROVIDER)
            return False
    except httpx.HTTPError:
        logger.exception("Failed to send email to %s", to_email)
        return False


def _send_via_resend(to_email: str, subject: str, body: str) -> bool:
    if not RESEND_API_KEY:
        logger.error("RESEND_API_KEY is not set; cannot send email")
        return False

    response = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
        json={
            "from": EMAIL_FROM,
            "to": [to_email],
            "subject": subject,
            "text": body,
        },
        timeout=10,
    )
    response.raise_for_status()
    return True


def _send_via_sendgrid(to_email: str, subject: str, body: str) -> bool:
    if not SENDGRID_API_KEY:
        logger.error("SENDGRID_API_KEY is not set; cannot send email")
        return False

    response = httpx.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers={"Authorization": f"Bearer {SENDGRID_API_KEY}"},
        json={
            "personalizations": [{"to": [{"email": to_email}]}],
            "from": {"email": EMAIL_FROM},
            "subject": subject,
            "content": [{"type": "text/plain", "value": body}],
        },
        timeout=10,
    )
    response.raise_for_status()
    return True


def send_admin_checkin_notification(customer_name: str, customer_phone: str, position: int) -> bool:
    """Notify the shop admin that a customer joined the queue. No-op if ADMIN_EMAIL is unset."""
    if not ADMIN_EMAIL:
        logger.warning("ADMIN_EMAIL is not set; skipping check-in notification")
        return False

    return send_email(
        ADMIN_EMAIL,
        subject="New customer checked in",
        body=f"{customer_name} ({customer_phone}) joined the queue at position #{position}.",
    )
