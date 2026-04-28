import logging

logger = logging.getLogger(__name__)


# class LoggerMailer:
#    def send_password_reset_email(self, to_email: str, reset_link: str) -> None:
#        logger.info("password_reset_email to=%s link=%s", to_email, reset_link)


class LoggerMailer:
    def send_password_reset_email(self, to_email: str, reset_link: str) -> None:
        print(f"[PASSWORD_RESET] to={to_email} link={reset_link}")
