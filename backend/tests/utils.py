import uuid


def get_random_user_email():
    return f"u_{uuid.uuid4().hex}@test.com"
