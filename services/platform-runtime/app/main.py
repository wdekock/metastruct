from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI(title="Metastruct Dynamic Runtime Engine", version="1.0.0")

class ManifestPayload(BaseModel):
    manifest: Dict[str, Any]
    data: Dict[str, Any]

@app.get("/health")
async def health_check():
    return {"status": "online", "engine": "Metastruct Async Runtime"}

@app.post("/api/v1/entity/validate")
async def validate_entity(payload: ManifestPayload):
    required_fields = payload.manifest.get("entity", {}).get("required", [])
    missing = [field for field in required_fields if field not in payload.data]
    
    if missing:
        raise HTTPException(status_code=422, detail=f"Validation failed. Missing required fields: {missing}")
        
    return {"valid": True, "message": "Payload conforms to entity schema."}
