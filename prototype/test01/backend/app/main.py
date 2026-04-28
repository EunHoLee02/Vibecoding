from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import AnalyzeRequest, AnalysisResult, ParseStubRequest
from app.services import PrototypeService
from app.storage import init_db, load_analysis, save_analysis


service = PrototypeService()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="Well Track Prototype API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ok(data: dict) -> dict:
    return {"success": True, "data": data}


def fail(code: str, message: str) -> HTTPException:
    return HTTPException(status_code=400, detail={"code": code, "message": message})


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    if isinstance(exc.detail, dict):
        return fastapi_json_response(exc.status_code, {"success": False, "error": exc.detail})
    return fastapi_json_response(exc.status_code, {"success": False, "error": {"code": "http_error", "message": str(exc.detail)}})


def fastapi_json_response(status_code: int, content: dict):
    from fastapi.responses import JSONResponse

    return JSONResponse(status_code=status_code, content=content)


@app.get("/api/v1/health")
def get_health():
    return ok({"status": "ok"})


@app.get("/api/v1/sample-payloads")
def get_sample_payloads():
    samples = [item.model_dump() for item in service.list_samples()]
    return ok({"samples": samples})


@app.post("/api/v1/uploads/parse-stub")
def post_parse_stub(request: ParseStubRequest):
    if not request.sample_id and not request.file_name:
        raise fail("missing_sample_source", "sample_id 또는 file_name 중 하나는 필요합니다.")
    return ok(service.parse_stub_payload(request.sample_id, request.file_name))


@app.post("/api/v1/analyses")
def post_analysis(request: AnalyzeRequest):
    if not request.supplements:
        raise fail("missing_supplements", "최소 1개의 영양제 입력이 필요합니다.")
    result = service.build_analysis(request.supplements)
    payload = result.model_dump()
    save_analysis(result.analysis_id, result.status, payload)
    return ok(
        {
            "analysis_id": result.analysis_id,
            "status": result.status,
            "summary_line": result.summary_line,
        }
    )


@app.get("/api/v1/analyses/{analysis_id}")
def get_analysis(analysis_id: str):
    payload = load_analysis(analysis_id)
    if payload is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "analysis_not_found", "message": "분석 결과를 찾을 수 없습니다."},
        )

    result = AnalysisResult.model_validate(payload)
    return ok(result.model_dump())
