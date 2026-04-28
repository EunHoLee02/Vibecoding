from sqlalchemy.orm import Session

from app.db.models.admin_action_log import AdminActionLog


class AdminActionLogRepository:
    def create(self, db: Session, log: AdminActionLog) -> AdminActionLog:
        db.add(log)
        db.flush()
        db.refresh(log)
        return log