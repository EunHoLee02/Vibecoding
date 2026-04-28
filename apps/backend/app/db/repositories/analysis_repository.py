from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.analysis_guide import AnalysisGuide
from app.db.models.analysis_preview import AnalysisPreview
from app.db.models.analysis_purpose_recommendation import (
    AnalysisPurposeRecommendation,
)
from app.db.models.analysis_result_item import AnalysisResultItem
from app.db.models.analysis_run import AnalysisRun


class AnalysisRepository:
    def create_preview(self, db: Session, preview: AnalysisPreview) -> AnalysisPreview:
        db.add(preview)
        db.flush()
        db.refresh(preview)
        return preview

    def get_preview_by_id(self, db: Session, preview_id, user_id) -> AnalysisPreview | None:
        stmt = select(AnalysisPreview).where(
            AnalysisPreview.id == preview_id,
            AnalysisPreview.user_id == user_id,
        )
        return db.scalar(stmt)

    def get_reusable_run(self, db: Session, user_id, fingerprint: str) -> AnalysisRun | None:
        stmt = select(AnalysisRun).where(
            AnalysisRun.user_id == user_id,
            AnalysisRun.fingerprint == fingerprint,
            AnalysisRun.status == "completed",
        )
        return db.scalar(stmt)

    def create_run(self, db: Session, run: AnalysisRun) -> AnalysisRun:
        db.add(run)
        db.flush()
        db.refresh(run)
        return run

    def create_result_item(self, db: Session, result_item: AnalysisResultItem) -> AnalysisResultItem:
        db.add(result_item)
        db.flush()
        db.refresh(result_item)
        return result_item

    def create_guide(self, db: Session, guide: AnalysisGuide) -> AnalysisGuide:
        db.add(guide)
        db.flush()
        db.refresh(guide)
        return guide

    def create_purpose_recommendation(
        self,
        db: Session,
        recommendation: AnalysisPurposeRecommendation,
    ) -> AnalysisPurposeRecommendation:
        db.add(recommendation)
        db.flush()
        db.refresh(recommendation)
        return recommendation

    def get_run_by_id(self, db: Session, run_id, user_id) -> AnalysisRun | None:
        stmt = select(AnalysisRun).where(
            AnalysisRun.id == run_id,
            AnalysisRun.user_id == user_id,
        )
        return db.scalar(stmt)

    def list_runs(self, db: Session, user_id) -> list[AnalysisRun]:
        stmt = (
            select(AnalysisRun)
            .where(AnalysisRun.user_id == user_id)
            .order_by(AnalysisRun.created_at.desc())
        )
        return list(db.scalars(stmt).all())

    def get_result_items(self, db: Session, run_id) -> list[AnalysisResultItem]:
        stmt = select(AnalysisResultItem).where(
            AnalysisResultItem.analysis_run_id == run_id
        )
        return list(db.scalars(stmt).all())

    def get_guides(self, db: Session, run_id) -> list[AnalysisGuide]:
        stmt = (
            select(AnalysisGuide)
            .where(AnalysisGuide.analysis_run_id == run_id)
            .order_by(AnalysisGuide.display_order.asc())
        )
        return list(db.scalars(stmt).all())

    def get_purpose_recommendations(
        self,
        db: Session,
        run_id,
    ) -> list[AnalysisPurposeRecommendation]:
        stmt = (
            select(AnalysisPurposeRecommendation)
            .where(AnalysisPurposeRecommendation.analysis_run_id == run_id)
            .order_by(AnalysisPurposeRecommendation.display_order.asc())
        )
        return list(db.scalars(stmt).all())
