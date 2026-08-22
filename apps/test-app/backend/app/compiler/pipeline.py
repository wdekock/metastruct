import json
from datetime import datetime
from typing import Any, Dict
from app.config import SOURCES_DIR, SYSTEM_MANIFEST_PATH
from app.compiler.questionnaire_builder import build_compiled_questions

def compile_system_manifest() -> Dict[str, Any]:
    """Orchestrates compilation of Entity, UI, and Questionnaire Specs into a System Manifest."""
    with open(SOURCES_DIR / "entity_spec.json", "r") as f:
        entity_spec = json.load(f)
    with open(SOURCES_DIR / "ui_spec.json", "r") as f:
        ui_spec = json.load(f)
    with open(SOURCES_DIR / "questionnaire_spec.json", "r") as f:
        q_spec = json.load(f)

    entity_name = entity_spec.get("title", "Entity")
    pk = entity_spec.get("primaryKey", "id")
    req_fields = set(entity_spec.get("required", []))

    schema_fields: Dict[str, Any] = {}
    ui_field_widgets: Dict[str, Any] = {}

    for section in ui_spec.get("sections", []):
        for field in section.get("fields", []):
            if isinstance(field, str):
                ui_field_widgets[field] = {"type": "text", "props": {}}
            elif isinstance(field, dict):
                f_key = field["key"]
                ui_field_widgets[f_key] = field.get("widget", {"type": "text", "props": {}})

    for prop_key, prop_val in entity_spec.get("properties", {}).items():
        widget = ui_field_widgets.get(prop_key, {"type": "text", "props": {}})
        schema_fields[prop_key] = {
            "key": prop_key,
            "type": prop_val.get("type", "string"),
            "label": prop_val.get("title", prop_key),
            "required": prop_key in req_fields,
            "isPrimaryKey": prop_key == pk,
            "isForeignKey": prop_val.get("isForeignKey", False),
            "foreignEntity": prop_val.get("foreignEntity"),
            "defaultValue": prop_val.get("default"),
            "widget": widget,
            "validationRules": {
                "minimum": prop_val.get("minimum"),
                "maximum": prop_val.get("maximum"),
            },
        }

    layout = [
        {
            "title": section.get("title", "Section"),
            "fields": [
                f if isinstance(f, str) else f["key"]
                for f in section.get("fields", [])
            ],
        }
        for section in ui_spec.get("sections", [])
    ]

    compiled_questions = build_compiled_questions(q_spec, ui_field_widgets)

    system_manifest = {
        "systemId": f"sys_{entity_name.lower()}",
        "version": entity_spec.get("version", "1.0.0"),
        "compiledAt": datetime.utcnow().isoformat() + "Z",
        "entities": {
            entity_name: {
                "entityName": entity_name,
                "primaryKey": pk,
                "schema": schema_fields,
                "layout": layout,
            }
        },
        "questionnaires": {
            q_spec.get("id"): {
                "id": q_spec.get("id"),
                "title": q_spec.get("title"),
                "targetEntity": q_spec.get("targetEntity"),
                "initialStep": q_spec.get("initialStep"),
                "questions": compiled_questions,
                "steps": q_spec.get("steps", {}),
                "allowedTransitions": q_spec.get("transitions", {}),
            }
        },
    }

    SYSTEM_MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(SYSTEM_MANIFEST_PATH, "w") as f:
        json.dump(system_manifest, f, indent=2)

    return system_manifest
