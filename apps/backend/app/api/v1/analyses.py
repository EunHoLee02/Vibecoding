from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_principal
from app.common.responses import success_response
from app.db.session import get_db
from app.schemas.analysis import (
    AnalysisCreateRequest,
    AnalysisCreateResponse,
    AnalysisGuideResponse,
    AnalysisHistoryItemResponse,
    AnalysisPreviewRequest,
    AnalysisPreviewResponse,
    AnalysisPurposeRecommendationResponse,
    AnalysisResultItemResponse,
    AnalysisStatusResponse,
)
from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/api/v1/analyses", tags=["analyses"])
service = AnalysisService()


@router.post("/preview", status_code=status.HTTP_201_CREATED)
def create_analysis_preview(
    payload: AnalysisPreviewRequest,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    preview = service.create_preview(db=db, user_id=principal.user_id, payload=payload)
    response = AnalysisPreviewResponse(
        id=preview.id,
        supplement_preview_list=preview.preview_payload["supplement_preview_list"],
        validation_summary=preview.validation_summary,
        ready_for_analysis=preview.ready_for_analysis,
        preview_status=preview.preview_status,
    )
    return success_response(data=response.model_dump())


@router.post("", status_code=status.HTTP_201_CREATED)
def create_analysis(
    payload: AnalysisCreateRequest,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    run = service.create_analysis(db=db, user_id=principal.user_id, payload=payload)
    response = AnalysisCreateResponse(
        analysis_run_id=run.id,
        analysis_status=run.status,
        is_reused_result=run.is_reused_result,
        reuse_reason=run.reuse_reason,
    )
    return success_response(data=response.model_dump())


@router.get("/history", status_code=status.HTTP_200_OK)
def list_analysis_history(
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    runs = service.list_analysis_runs(db=db, user_id=principal.user_id)
    return success_response(
        data=[
            AnalysisHistoryItemResponse(
                analysis_run_id=run.id,
                analysis_status=run.status,
                summary_level=run.summary_level,
                summary_title=run.summary_title,
                is_reused_result=run.is_reused_result,
                created_at=run.created_at.isoformat(),
                completed_at=run.completed_at.isoformat() if run.completed_at else None,
            ).model_dump()
            for run in runs
        ]
    )


@router.get("/{analysis_run_id}/status", status_code=status.HTTP_200_OK)
def get_analysis_status(
    analysis_run_id,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    run = service.get_analysis_status(db=db, user_id=principal.user_id, run_id=analysis_run_id)
    response = AnalysisStatusResponse(
        analysis_run_id=run.id,
        analysis_status=run.status,
        is_reused_result=run.is_reused_result,
        reuse_reason=run.reuse_reason,
        completed_at=run.completed_at.isoformat() if run.completed_at else None,
    )
    return success_response(data=response.model_dump())


@router.get("/{analysis_run_id}", status_code=status.HTTP_200_OK)
def get_analysis_result(
    analysis_run_id,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    run, result_items, guides, purpose_recommendations = service.get_analysis_result(
        db=db,
        user_id=principal.user_id,
        run_id=analysis_run_id,
    )

    return success_response(
        data={
            "analysis_run_id": str(run.id),
            "analysis_status": run.status,
            "summary_level": run.summary_level,
            "summary_title": run.summary_title,
            "summary_message": run.summary_message,
            "result_items": [
                AnalysisResultItemResponse.model_validate(item).model_dump()
                for item in result_items
            ],
            "guides": [
                AnalysisGuideResponse.model_validate(item).model_dump()
                for item in guides
            ],
            "purpose_recommendations": [
                AnalysisPurposeRecommendationResponse.model_validate(item).model_dump()
                for item in purpose_recommendations
            ],
        }
    )
