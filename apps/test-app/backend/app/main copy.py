import asyncio
import json
from typing import Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import SYSTEM_MANIFEST_PATH
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

async def broadcast_manifest(manifest: dict):
    payload = {"event": "MANIFEST_COMPILED", "manifest": manifest}
    for client in list(CONNECTED_CLIENTS):
        try:
            await client.send_json(payload)
        except Exception:
            CONNECTED_CLIENTS.remove(client)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(watch_source_files(broadcast_manifest))

@app.get("/")
async def root():
    return {"status": "ok", "service": "Metastruct Compiler Engine"}

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