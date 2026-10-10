import resend

from src.config import settings
from src.tasks.celery_app import celery_app


@celery_app.task(bind=True, max_retries=3, default_retry_delay=20)
def send_email_code_task(self, to_email: str, code: str):
    try:
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send(
            {
                "from": f"Simul <{settings.RESEND_EMAIL}>",
                "to": to_email,
                "subject": f"{code} — ваш код для входа в Simul",
                "html": f"""
<html>
<head>
  <meta charset="utf-8">
  <style>
    .container {{
      font-family: Arial, sans-serif;
      margin: 20px; padding: 20px;
      background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;
    }}
    .header {{ font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333; }}
    .content {{ font-size: 16px; color: #555; line-height: 1.5; }}
    .footer {{ font-size: 12px; color: #999; margin-top: 20px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Новый вход в Simul!</div>
    <div class="content">
      Чтобы подтвердить вход, пожалуйста, введите код:<br>
      <b>{code}</b>
    </div>
    <div class="footer">
      Если вы не входили в Simul, просто проигнорируйте это письмо.
    </div>
  </div>
</body>
</html>
""",
            }
        )
    except Exception as exc:
        print("Send mail error:", repr(exc))
        raise self.retry(exc=exc)
