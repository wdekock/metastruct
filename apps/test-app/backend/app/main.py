import asyncio
import json
from pathlib import Path
import uuid
from typing import Set, Dict, Any, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import SYSTEM_MANIFEST_PATH, SOURCES_DIR
from app.services.watcher import watch_source_files

app = FastAPI(title="Metastruct Modular Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONNECTED_CLIENTS: Set[WebSocket] = set()
DB_STORE: Dict[str, Dict[str, Dict[str, Any]]] = {}

SEED_DATA_PATH = SOURCES_DIR / "seed_data.json"
ENTITY_SPEC_PATH = SOURCES_DIR / "entity_spec.json"

def load_initial_seed_data():
    """Populate in-memory DB_STORE from seed_data.json and entity_spec.json on startup."""
    global DB_STORE
    entity_name = "Vendor"
    pk_field = "vendor_id"

    if ENTITY_SPEC_PATH.exists():
        try:
            with open(ENTITY_SPEC_PATH, "r") as f:
                entity_spec = json.load(f)
                entity_name = entity_spec.get("entityName", entity_name)
                pk_field = entity_spec.get("primaryKey", pk_field)
        except Exception as e:
            print(f"Error loading entity spec for seed initialization: {e}")

    DB_STORE[entity_name] = {}

    if SEED_DATA_PATH.exists():
        try:
            with open(SEED_DATA_PATH, "r") as f:
                seed_records = json.load(f)
                for rec in seed_records:
                    pk_val = rec.get(pk_field) or str(uuid.uuid4())[:8]
                    rec[pk_field] = pk_val
                    DB_STORE[entity_name][pk_val] = rec
            print(f"Loaded {len(DB_STORE[entity_name])} initial seed records for '{entity_name}'")
        except Exception as e:
            print(f"Error loading seed_data.json: {e}")

async def broadcast_manifest(manifest: dict):
    payload = {"event": "MANIFEST_COMPILED", "manifest": manifest}
    for client in list(CONNECTED_CLIENTS):
        try:
            await client.send_json(payload)
        except Exception:
            CONNECTED_CLIENTS.remove(client)

@app.on_event("startup")
async def startup_event():
    load_initial_seed_data()
    asyncio.create_task(watch_source_files(broadcast_manifest))

@app.get("/")
async def root():
    return {"status": "ok", "service": "Metastruct Compiler Engine"}

# --- Dynamic CRUD API Endpoints ---

@app.get("/api/db/{entity_name}")
async def get_records(entity_name: str) -> List[Dict[str, Any]]:
    return list(DB_STORE.get(entity_name, {}).values())

@app.post("/api/db/{entity_name}")
async def create_record(entity_name: str, record: Dict[str, Any]):
    if entity_name not in DB_STORE:
        DB_STORE[entity_name] = {}

    pk_key = record.get("vendor_id") or str(uuid.uuid4())[:8]
    record["vendor_id"] = pk_key
    DB_STORE[entity_name][pk_key] = record
    return record

@app.put("/api/db/{entity_name}/{record_id}")
async def update_record(entity_name: str, record_id: str, record: Dict[str, Any]):
    if entity_name not in DB_STORE or record_id not in DB_STORE[entity_name]:
        raise HTTPException(status_code=404, detail="Record not found")

    DB_STORE[entity_name][record_id].update(record)
    return DB_STORE[entity_name][record_id]

@app.delete("/api/db/{entity_name}/{record_id}")
async def delete_record(entity_name: str, record_id: str):
    if entity_name in DB_STORE and record_id in DB_STORE[entity_name]:
        del DB_STORE[entity_name][record_id]
        return {"status": "deleted", "id": record_id}
    raise HTTPException(status_code=404, detail="Record not found")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    CONNECTED_CLIENTS.add(websocket)
    try:
        if SYSTEM_MANIFEST_PATH.exists():
            with open(SYSTEM_MANIFEST_PATH, "r") as f:
                await websocket.send_json({
                    "event": "MANIFEST_COMPILED",
                    "manifest": json.load(f),
                })
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        CONNECTED_CLIENTS.remove(websocket)