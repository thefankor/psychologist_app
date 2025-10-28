from src.tasks.celery_app import celery_app
from src.utils.sms_provider import SMSProvider


@celery_app.task(bind=True, max_retries=3, default_retry_delay=20)
def send_sms_code_task(self, phone: str, code: str):
    try:
        SMSProvider.send_code(phone, code)
    except Exception as exc:
        raise self.retry(exc=exc)
