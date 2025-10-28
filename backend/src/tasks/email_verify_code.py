import email.utils
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from src.config import settings
from src.tasks.celery_app import celery_app


@celery_app.task(bind=True, max_retries=3, default_retry_delay=20)
def send_email_code_task(self, to_email: str, code: str):
    try:
        print(to_email, code)

        # Заголовки и контейнер
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{code} — ваш код для входа в Simul"
        msg["From"] = (
            settings.SMTP_USER
        )  # должен совпадать с аутентифицируемым ящиком Mail.ru
        msg["To"] = to_email
        msg["Date"] = email.utils.formatdate(localtime=True)
        msg["Message-ID"] = email.utils.make_msgid()
        msg["MIME-Version"] = "1.0"
        msg["X-Priority"] = "3"
        msg["Importance"] = "High"

        html_content = f"""\
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
"""
        text_content = f"""\
Новый вход в Simul!

Чтобы подтвердить вход, введите код: {code}

Если вы не входили в Simul, просто проигнорируйте это письмо.
"""

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        # Отправка письма
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())

    except Exception as exc:
        print("Send mail error:", repr(exc))
