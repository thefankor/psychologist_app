import enum


class PaymentMethodType(enum.Enum):
    SBP = "SBP"


class TransactionStatus(enum.Enum):
    canceled = "canceled"
    succeeded = "succeeded"
    errored = "errored"
