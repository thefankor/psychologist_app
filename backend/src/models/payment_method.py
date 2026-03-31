from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from src.models import BaseWithTimestamps
from src.models.enums.payment_methods import PaymentMethodType


class PaymentMethod(BaseWithTimestamps):
    __tablename__ = "payment_methods"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    type: Mapped[PaymentMethodType] = mapped_column(Enum(PaymentMethodType))
    phone: Mapped[str] = mapped_column(String, index=True)
    bank: Mapped[str]
