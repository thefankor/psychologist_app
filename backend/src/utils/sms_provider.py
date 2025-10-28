import requests

from src.config import settings


class SMSProvider:
    @staticmethod
    def send_code(phone: str, code: str):
        URL = f"https://{settings.SMS_AERO_LOGIN}:{settings.SMS_AERO_KEY}@gate.smsaero.ru/v2/sms/send"
        payload = {
            "number": phone,
            "text": f"{code} — ваш код подтверждения подтверждения номера в Simul",
            "sign": settings.SMS_AERO_SIGN,
        }
        res = requests.post(URL, json=payload, timeout=10)
        data = res.json()

        if res.status_code != 200 or data["success"] is False:
            raise Exception(f"SMS API error: {data}")
