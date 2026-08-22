from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.ui import WidgetSpec


class CompiledField(BaseModel):
    key: str
    type: str
    label: str
    required: bool
    isPrimaryKey: bool = False
    isForeignKey: bool = False
    foreignEntity: Optional[str] = None
    defaultValue: Optional[Any] = None
    widget: WidgetSpec
    validationRules: Dict[str, Any] = Field(default_factory=dict)


class CompiledLayoutSection(BaseModel):
    title: str
    fields: List[str] = Field(default_factory=list)


class EntityManifest(BaseModel):
    entityName: str
    primaryKey: str
    schema: Dict[str, CompiledField] = Field(default_factory=dict)
    layout: List[CompiledLayoutSection] = Field(default_factory=list)


class CompiledQuestion(BaseModel):
    id: str
    entityName: str
    fieldKey: str
    questionText: str
    helpText: Optional[str] = None
    isRequired: bool = False
    readOnly: bool = False
    widget: WidgetSpec


class QuestionnaireManifest(BaseModel):
    id: str
    title: str
    targetEntity: str
    initialStep: str
    questions: Dict[str, CompiledQuestion] = Field(default_factory=dict)
    steps: Dict[str, Any] = Field(default_factory=dict)
    allowedTransitions: Dict[str, List[str]] = Field(default_factory=dict)


class SystemManifest(BaseModel):
    systemId: str
    version: str
    compiledAt: str
    entities: Dict[str, EntityManifest] = Field(default_factory=dict)
    questionnaires: Dict[str, QuestionnaireManifest] = Field(default_factory=dict)