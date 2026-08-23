from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[3]
DEFAULT_MANIFEST_PATH = str((ROOT_DIR / "apps" / "test-app" / "manifests" / "system_manifest.json").resolve())
MANIFEST_PATH = Path(DEFAULT_MANIFEST_PATH)
DATABASE_URL = "sqlite+aiosqlite:///./metastruct.db"
