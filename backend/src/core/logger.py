import structlog
from structlog.stdlib import BoundLogger


def configure_logger() -> None:
    log_level = "INFO"
    structlog.configure_once(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.CallsiteParameterAdder(
                [
                    structlog.processors.CallsiteParameter.FILENAME,
                    structlog.processors.CallsiteParameter.FUNC_NAME,
                    structlog.processors.CallsiteParameter.LINENO,
                ]
            ),
            structlog.processors.add_log_level,
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(
                fmt="%d.%m.%Y %H:%M:%S",
                utc=True,
            ),
            structlog.processors.JSONRenderer(ensure_ascii=False),
        ],
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=False,
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
    )


configure_logger()
logger: BoundLogger = structlog.get_logger()


def get_logger() -> BoundLogger:
    return logger
