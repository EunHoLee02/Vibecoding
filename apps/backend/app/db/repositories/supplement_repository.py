from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.common.enums import SupplementStatus
from app.db.models.supplement import Supplement


class SupplementRepository:
    def get_list(self, db: Session, user_id, include_deleted: bool = False) -> list[Supplement]:
        stmt = (
            select(Supplement)
            .where(Supplement.user_id == user_id)
            .options(selectinload(Supplement.ingredients))
            .order_by(Supplement.updated_at.desc())
        )

        if not include_deleted:
            stmt = stmt.where(Supplement.deleted_at.is_(None))

        return list(db.scalars(stmt).all())

    def get_by_id(self, db: Session, supplement_id, user_id) -> Supplement | None:
        stmt = (
            select(Supplement)
            .where(
                Supplement.id == supplement_id,
                Supplement.user_id == user_id,
            )
            .options(selectinload(Supplement.ingredients))
        )
        return db.scalar(stmt)

    def create(self, db: Session, supplement: Supplement) -> Supplement:
        db.add(supplement)
        db.flush()
        db.refresh(supplement)
        return supplement

    def soft_delete(self, db: Session, supplement: Supplement) -> Supplement:
        supplement.deleted_at = datetime.utcnow()
        supplement.status = SupplementStatus.DELETED
        db.flush()
        db.refresh(supplement)
        return supplement

    def restore(self, db: Session, supplement: Supplement) -> Supplement:
        supplement.deleted_at = None
        supplement.status = SupplementStatus.ACTIVE
        db.flush()
        db.refresh(supplement)
        return supplement