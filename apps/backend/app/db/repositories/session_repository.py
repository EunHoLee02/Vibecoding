from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.models.user_session import UserSession


class SessionRepository:
    def create(
        self,
        db: Session,
        user_id,
        token_hash: str,
        expires_at,
        ip_address: str | None,
        user_agent: str | None,
    ) -> UserSession:
        session = UserSession(
            user_id=user_id,
            session_token_hash=token_hash,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(session)
        db.flush()
        db.refresh(session)
        return session

    def get_active_by_token_hash(
        self, db: Session, token_hash: str
    ) -> UserSession | None:
        now = datetime.now(timezone.utc)
        stmt = (
            select(UserSession)
            .options(joinedload(UserSession.user))
            .where(
                UserSession.session_token_hash == token_hash,
                UserSession.revoked_at.is_(None),
                UserSession.expires_at > now,
            )
        )
        return db.scalar(stmt)

    def revoke(self, db: Session, session: UserSession) -> UserSession:
        session.revoked_at = datetime.now(timezone.utc)
        db.flush()
        db.refresh(session)
        return session

    def rotate(
        self, db: Session, session: UserSession, new_token_hash: str, new_expires_at
    ) -> UserSession:
        session.session_token_hash = new_token_hash
        session.expires_at = new_expires_at
        session.last_seen_at = datetime.now(timezone.utc)
        db.flush()
        db.refresh(session)
        return session
