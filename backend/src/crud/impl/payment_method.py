from src.crud.impl.base import BaseDAO
from src.models import PaymentMethod


class PaymentMethodDAO(BaseDAO):
    """
    DAO для работы с методами оплаты клиентов.
    """

    model = PaymentMethod
