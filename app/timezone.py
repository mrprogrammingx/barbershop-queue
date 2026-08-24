from datetime import date, datetime
from zoneinfo import ZoneInfo

APP_TZ = ZoneInfo("Asia/Yerevan")


def now() -> datetime:
    return datetime.now(APP_TZ)


def today() -> date:
    return now().date()
