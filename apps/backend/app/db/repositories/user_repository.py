from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.user import User


class UserRepository:
    def get_by_email(self, db: Session, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return db.scalar(stmt)

    def get_by_id(self, db: Session, user_id) -> User | None:
        stmt = select(User).where(User.id == user_id)
        return db.scalar(stmt)

    def create(self, db: Session, email: str, password_hash: str, name: str) -> User:
        user = User(
            email=email,
            password_hash=password_hash,
            name=name,
            role="user",
            status="active",
        )
        db.add(user)
        db.flush()
        db.refresh(user)
        return user
