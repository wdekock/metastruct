from typing import Any, Dict

def build_compiled_questions(
    q_spec: Dict[str, Any],
    ui_field_widgets: Dict[str, Any]
) -> Dict[str, Any]:
    """Applies Rule Q-006 cascading widget rules: Question -> UI Spec -> Default."""
    compiled_questions: Dict[str, Any] = {}

    for q_id, q_val in q_spec.get("questions", {}).items():
        f_key = q_val["fieldKey"]
        # Rule Q-006: Cascade Question widget -> UI Spec widget -> Default widget
        widget = (
            q_val.get("widget")
            or ui_field_widgets.get(f_key)
            or {"type": "text", "props": {}}
        )

        compiled_questions[q_id] = {
            "id": q_id,
            "entityName": q_val.get("entityName"),
            "fieldKey": f_key,
            "questionText": q_val.get("questionText"),
            "helpText": q_val.get("helpText"),
            "isRequired": q_val.get("isRequired", False),
            "readOnly": q_val.get("readOnly", False),
            "widget": widget,
        }

    return compiled_questions
