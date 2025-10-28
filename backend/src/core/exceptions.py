from fastapi import HTTPException, status


class BaseError(HTTPException):
    """Базовый класс для HTTP исключений.

    Args:
        detail (str | None, optional): Детальное описание ошибки. По умолчанию None.
    """

    def __init__(self, detail: str | None = None):
        super().__init__(status_code=self.status_code, detail=detail or self.detail)


class RegistrationException(BaseError):
    """Исключение при ошибках регистрации.

    Возникает при конфликтах во время регистрации пользователя.
    """

    status_code = status.HTTP_409_CONFLICT
    detail = "Ошибка при регистрации"


class AuthenticationException(BaseError):
    """Исключение при ошибках аутентификации.

    Возникает при проблемах с аутентификацией пользователя.
    """

    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Ошибка при аутентификации"


class ValidationException(BaseError):
    """Исключение при ошибках валидации.

    Возникает при несоответствии данных ожидаемому формату или правилам.
    """

    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    detail = "Ошибка валидации"


class NotFoundException(BaseError):
    """Исключение при отсутствии ресурса.

    Возникает при попытке доступа к несуществующему ресурсу.
    """

    status_code = status.HTTP_404_NOT_FOUND
    detail = "Ресурс не найден"


class DatabaseException(BaseError):
    """Исключение при ошибках базы данных.

    Возникает при проблемах с операциями в базе данных.
    """

    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail = "Ошибка базы данных"


class TokenException(BaseError):
    """Исключение при ошибках работы с токенами.

    Возникает при проблемах с JWT токенами.
    """

    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Ошибка работы с токенами"


class TooManyAttemptsException(BaseError):
    """Исключение при превышении количества попыток.

    Возникает при превышении лимита попыток выполнения операции.
    """

    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    detail = "Превышено количество попыток"


class EmailException(BaseError):
    """Исключение при ошибках отправки email.

    Возникает при проблемах с отправкой электронных писем.
    """

    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail = "Ошибка отправки email"


class RefreshTokenMissingException(BaseError):
    """Исключение при отсутствии refresh токена.

    Возникает, когда refresh токен не предоставлен или отсутствует.
    """

    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Токен отсутствует"


class UserExistsException(BaseError):
    """Исключение при попытке регистрации существующего пользователя.

    Возникает при попытке создать пользователя с уже существующим email.
    """

    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Пользователь с таким email уже существует"


class InvalidCodeException(BaseError):
    """Исключение при неверном коде подтверждения.

    Возникает при вводе неверного кода подтверждения или истечении срока его действия.
    """

    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Неверное заполнение полей"


class InvalidEmailException(BaseError):
    """Исключение при неверном email.

    Возникает при вводе неверного email адреса.
    """

    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Неверный email"


class InvalidTokenException(BaseError):
    """Исключение при невалидном токене.

    Возникает при использовании невалидного JWT токена.
    """

    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Невалидный токен"
