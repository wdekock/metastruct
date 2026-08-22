from typing import Any, Dict, Tuple


def build_entity_manifest(
    entity_spec: Dict[str, Any], ui_spec: Dict[str, Any]
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Builds compiled entity schema and layout while extracting UI field widgets[cite: 2, 3, 4]."""
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
                ui_field_widgets[f_key] = field.get(
                    "widget", {"type": "text", "props": {}}
                )

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

    compiled_entity = {
        "entityName": entity_name,
        "primaryKey": pk,
        "schema": schema_fields,
        "layout": layout,
    }

    return compiled_entity, ui_field_widgets