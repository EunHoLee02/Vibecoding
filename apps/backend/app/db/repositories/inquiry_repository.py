from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.inquiry import Inquiry


class InquiryRepository:
    def create(self, db: Session, inquiry: Inquiry) -> Inquiry:
        db.add(inquiry)
        db.flush()
        db.refresh(inquiry)
        return inquiry

    def get_by_id(self, db: Session, inquiry_id) -> Inquiry | None:
        stmt = select(Inquiry).where(Inquiry.id == inquiry_id)
        return db.scalar(stmt)

    def get_user_list(self, db: Session, user_id) -> list[Inquiry]:
        stmt = (
            select(Inquiry)
            .where(Inquiry.user_id == user_id)
            .order_by(Inquiry.created_at.desc())
        )
        return list(db.scalars(stmt).all())

    def get_admin_list(self, db: Session) -> list[Inquiry]:
        stmt = select(Inquiry).order_by(Inquiry.created_at.desc())
        return list(db.scalars(stmt).all())