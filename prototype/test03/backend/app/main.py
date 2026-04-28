from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas import AnalysisRequest
from app.services import PrototypeService


service = PrototypeService()

app = FastAPI(title="Well Track Prototype API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
    allow_origin_regex=r"http://(127\.0\.0\.1|localhost):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def success(data: dict) -> dict:
    return {"success": True, "data": data, "error": None}


def error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "data": None,
            "error": {"code": code, "message": message},
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    if isinstance(exc.detail, dict):
        return error_response(
            exc.status_code,
            exc.detail.get("code", "http_error"),
            exc.detail.get("message", "요청 처리 중 문제가 발생했습니다."),
        )
    return error_response(exc.status_code, "http_error", str(exc.detail))


@app.exception_handler(RequestValidationError)
async def request_validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    first_error = exc.errors()[0] if exc.errors() else None
    message = "입력 형식을 다시 확인해 주세요."
    if first_error and first_error.get("loc"):
        message = f"{first_error['loc'][-1]} 입력 형식을 다시 확인해 주세요."
    return error_response(422, "validation_error", message)


@app.get("/health")
def get_health() -> dict:
    return success({"status": "ok"})


@app.get("/api/v1/sample-inputs")
def get_sample_inputs() -> dict:
    sample_inputs = [item.model_dump() for item in service.list_sample_inputs()]
    return success({"sample_inputs": sample_inputs})


@app.post("/api/v1/uploads/parse")
async def post_upload_parse(
    sample_id: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
) -> dict:
    if not sample_id and file is None:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "missing_upload_source",
                "message": "샘플 선택 또는 업로드 파일 중 하나는 필요합니다.",
            },
        )

    result = service.parse_upload_or_sample(sample_id=sample_id, file_name=file.filename if file else None)
    if result.parse_status == "failed":
        raise HTTPException(
            status_code=400,
            detail={
                "code": "parse_failed",
                "message": result.message or "업로드 입력을 파싱하지 못했습니다.",
            },
        )

    return success(result.model_dump())


@app.post("/api/v1/analyses")
def post_analyses(request: AnalysisRequest) -> dict:
    if not request.supplements:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "missing_supplements",
                "message": "최소 1개 이상의 영양제 입력이 필요합니다.",
            },
        )

    result = service.build_analysis(request.supplements)
    return success(result.model_dump())
