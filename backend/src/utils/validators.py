import phonenumbers


def normalize_and_validate_phone(phone: str, default_region: str = None) -> str:
    """
    Проверяет, валиден ли номер, и возвращает его в формате E.164.

    :param phone: Входной номер (может быть с пробелами, скобками и т.п.)
    :param default_region: Регион по умолчанию, например "RU"
    :return: Стандартизированный номер (E.164)
    :raises ValueError: если номер некорректный
    """
    try:
        phone_obj = phonenumbers.parse(phone, default_region)
        if not phonenumbers.is_possible_number(phone_obj):
            raise ValueError("Invalid phone number format")
        if not phonenumbers.is_valid_number(phone_obj):
            raise ValueError("Invalid phone number format")
        return phonenumbers.format_number(
            phone_obj, phonenumbers.PhoneNumberFormat.E164
        )
    except phonenumbers.NumberParseException:
        raise ValueError("Invalid phone number format")
