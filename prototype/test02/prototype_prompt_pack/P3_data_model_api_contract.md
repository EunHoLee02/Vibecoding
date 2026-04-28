# P3 단계 프로토타입 데이터 모델 + API 계약 정의

## 1. 프로토타입 핵심 데이터 모델 목록
1. `IngredientItem`
2. `SupplementInput`
3. `SampleInputOption`
4. `UploadParseResult`
5. `AnalysisRequest`
6. `DuplicateIngredientItem`
7. `RiskItem`
8. `TimingGuide`
9. `AnalysisResult`

## 2. 각 데이터 모델의 필드 정의

### IngredientItem
```json
{
  "ingredient_name": "string",
  "amount": 0,
  "unit": "string"
}
```

### SupplementInput
```json
{
  "product_name": "string",
  "manufacturer": "string | null",
  "ingredients": [
    {
      "ingredient_name": "string",
      "amount": 0,
      "unit": "string"
    }
  ]
}
```

### SampleInputOption
```json
{
  "sample_id": "string",
  "sample_name": "string",
  "sample_type": "image | data",
  "description": "string",
  "supplements": []
}
```

### UploadParseResult
```json
{
  "parse_status": "parsed | failed",
  "source_type": "upload",
  "supplements": [],
  "parse_note": "string"
}
```

### AnalysisRequest
```json
{
  "source_type": "manual | upload | sample",
  "supplements": []
}
```

### DuplicateIngredientItem
```json
{
  "ingredient_name": "string",
  "product_names": ["string"],
  "total_amount": 0,
  "unit": "string",
  "note_text": "string"
}
```

### RiskItem
```json
{
  "ingredient_name": "string",
  "total_amount": 0,
  "unit": "string",
  "level": "caution | high",
  "reason_text": "string"
}
```

### TimingGuide
```json
{
  "product_name": "string",
  "recommended_time": "morning | afternoon | evening | with_meal | empty_stomach | anytime",
  "guide_text": "string"
}
```

### AnalysisResult
```json
{
  "analysis_status": "completed | failed",
  "supplements": [],
  "duplicated_ingredients": [],
  "risk_items": [],
  "timing_guides": [],
  "summary_text": "string"
}
```

## 3. 필수 상태값(enum) 정의
- `source_type`: `manual | upload | sample`
- `parse_status`: `parsed | failed`
- `analysis_status`: `completed | failed`
- `risk_level`: `caution | high`
- `recommended_time`: `morning | afternoon | evening | with_meal | empty_stomach | anytime`

## 4. 프로토타입 핵심 API 목록
1. `GET /api/v1/sample-inputs`
2. `POST /api/v1/uploads/parse`
3. `POST /api/v1/analyses`

## 5. 각 API의 method / endpoint / 목적
- `GET /api/v1/sample-inputs`: 샘플 입력 목록 조회
- `POST /api/v1/uploads/parse`: 업로드 mock/stub 파싱
- `POST /api/v1/analyses`: 분석 실행

## 6. 각 API의 요청 body 또는 파라미터
### POST /api/v1/uploads/parse
- `multipart/form-data`
- `file`: required
- `source_type`: optional, default `upload`

### POST /api/v1/analyses
```json
{
  "source_type": "manual",
  "supplements": [
    {
      "product_name": "Vitamin C 1000",
      "manufacturer": "ABC Health",
      "ingredients": [
        {
          "ingredient_name": "Vitamin C",
          "amount": 1000,
          "unit": "mg"
        }
      ]
    }
  ]
}
```

## 7. 각 API의 응답 형식
### 공통 성공
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### 공통 실패
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "STRING_CODE",
    "message": "사용자에게 보여줄 수 있는 짧은 설명"
  }
}
```

### 허용 에러 코드
- `INVALID_REQUEST`
- `SAMPLE_NOT_FOUND`
- `PARSE_FAILED`
- `ANALYSIS_FAILED`
- `INTERNAL_ERROR`

# 이번 단계 확정 사항
- API base path: `/api/v1`
- 핵심 API 3개 고정
- 필드명/enum/응답 포맷 고정
