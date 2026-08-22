import asyncio
import os
from typing import Callable, Dict
from app.config import SOURCES_DIR
from app.compiler.pipeline import compile_system_manifest

async def watch_source_files(on_compiled_callback: Callable):
    """Watches JSON specs on disk and triggers compiler pipeline upon file mutation."""
    last_mtimes: Dict[str, float] = {}

    while True:
        if SOURCES_DIR.exists():
            changed = False
            for file_name in ["entity_spec.json", "ui_spec.json", "questionnaire_spec.json"]:
                full_path = SOURCES_DIR / file_name
                if full_path.exists():
                    mtime = os.path.getmtime(full_path)
                    if str(full_path) not in last_mtimes or last_mtimes[str(full_path)] != mtime:
                        last_mtimes[str(full_path)] = mtime
                        changed = True

            if changed:
                try:
                    compiled = compile_system_manifest()
                    await on_compiled_callback(compiled)
                except Exception as e:
                    print(f"[Compiler Error]: {e}")

        await asyncio.sleep(1)