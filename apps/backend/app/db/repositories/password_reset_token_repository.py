from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.models.password_reset_token import PasswordResetToken


class PasswordResetTokenRepository:
    def create(
        self,
        db: Session,
        user_id,
        token_hash: str,
        expires_at,
        requested_ip_hash: str | None,
        requested_user_agent: str | None,
    ) -> PasswordResetToken:
        token = PasswordResetToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            requested_ip_hash=requested_ip_hash,
            requested_user_agent=requested_user_agent,
        )
        db.add(token)
        db.flush()
        db.refresh(token)
        return token

    def get_active_by_token_hash(
        self, db: Session, token_hash: str
    ) -> PasswordResetToken | None:
        now = datetime.now(timezone.utc)
        stmt = (
            select(PasswordResetToken)
            .options(joinedload(PasswordResetToken.user))
            .where(
                PasswordResetToken.token_hash == token_hash,
                PasswordResetToken.used_at.is_(None),
                PasswordResetToken.expires_at > now,
            )
        )
        return db.scalar(stmt)

    def mark_used(self, db: Session, token: PasswordResetToken) -> PasswordResetToken:
        token.used_at = datetime.now(timezone.utc)
        db.flush()
        db.refresh(token)
        return token
