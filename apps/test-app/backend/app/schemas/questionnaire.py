from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.ui import WidgetSpec


class QuestionSpec(BaseModel):
    id: str
    entityName: str
    fieldKey: str
    questionText: str
    helpText: Optional[str] = None
    isRequired: bool = False
    readOnly: bool = False
    widget: Optional[WidgetSpec] = None


class QuestionnaireStep(BaseModel):
    id: str
    title: str
    questionIds: List[str] = Field(default_factory=list)


class QuestionnaireSpec(BaseModel):
    id: str
    title: str
    version: str = "1.0.0"
    targetEntity: str
    initialStep: str
    questions: Dict[str, QuestionSpec] = Field(default_factory=dict)
    steps: Dict[str, QuestionnaireStep] = Field(default_factory=dict)
    transitions: Dict[str, List[str]] = Field(default_factory=dict)