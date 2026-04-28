from typing import Protocol


class Mailer(Protocol):
    def send_password_reset_email(self, to_email: str, reset_link: str) -> None: ...
