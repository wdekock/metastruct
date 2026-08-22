import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SOURCES_DIR = BASE_DIR / "sources"
MANIFESTS_DIR = BASE_DIR / "manifests"
SYSTEM_MANIFEST_PATH = MANIFESTS_DIR / "system_manifest.json"
