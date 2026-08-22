import json
import os
import uuid
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import create_async_engine

from app.db.generic_repository import GenericSchemaRepository

app = FastAPI(title="Metastruct Dynamic Runtime Engine", version="1.0.0")

MANIFEST_PATH = Path(os.getenv("METASTRUCT_MANIFEST_PATH", "manifest.json"))
DATABASE_URL = os.getenv("METASTRUCT_DATABASE_URL", "sqlite+aiosqlite:///./metastruct.db")
engine = create_async_engine(DATABASE_URL)
repository = GenericSchemaRepository(engine)
manifest: Dict[str, Any] = {}

class ManifestPayload(BaseModel):
    manifest: Dict[str, Any]
    data: Dict[str, Any]

@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "engine": "Metastruct Async Runtime",
        "manifest_loaded": bool(manifest),
        "database": DATABASE_URL.split(":", 1)[0],
    }


@app.on_event("startup")
async def load_manifest():
    global manifest
    if MANIFEST_PATH.exists():
        manifest = json.loads(MANIFEST_PATH.read_text())

@app.post("/api/v1/entity/validate")
async def validate_entity(payload: ManifestPayload):
    entity = next(iter(payload.manifest.get("entities", {}).values()), {})
    required_fields = [
        key for key, field in entity.get("schema", {}).items()
        if field.get("required")
    ]
    missing = [field for field in required_fields if field not in payload.data]
    
    if missing:
        raise HTTPException(status_code=422, detail=f"Validation failed. Missing required fields: {missing}")
        
    return {"valid": True, "message": "Payload conforms to entity schema."}


def get_entity(entity_name: str) -> Dict[str, Any]:
    entity = manifest.get("entities", {}).get(entity_name)
    if not entity:
        raise HTTPException(status_code=404, detail=f"Entity '{entity_name}' is not in the loaded manifest")
    return {"systemId": manifest.get("systemId"), "entities": {entity_name: entity}}


@app.get("/api/v1/entities/{entity_name}/records")
async def list_records(
    entity_name: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
):
    entity_manifest = get_entity(entity_name)
    return await repository.list_records(entity_manifest, page, page_size)


@app.post("/api/v1/entities/{entity_name}/records")
async def create_record(entity_name: str, record: Dict[str, Any]):
    entity_manifest = get_entity(entity_name)
    primary_key = next(iter(entity_manifest["entities"].values()))["primaryKey"]
    record_id = str(record.get(primary_key) or uuid.uuid4())
    return await repository.insert_record(entity_manifest, record_id, record)


@app.get("/api/v1/entities/{entity_name}/records/{record_id}")
async def get_record(entity_name: str, record_id: str):
    record = await repository.get_by_id(get_entity(entity_name), record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@app.put("/api/v1/entities/{entity_name}/records/{record_id}")
async def update_record(entity_name: str, record_id: str, record: Dict[str, Any]):
    updated = await repository.update_record(get_entity(entity_name), record_id, record)
    if updated is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return updated


@app.delete("/api/v1/entities/{entity_name}/records/{record_id}")
async def delete_record(entity_name: str, record_id: str):
    deleted = await repository.delete_record(get_entity(entity_name), record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"status": "deleted", "id": record_id}
