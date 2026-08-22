from typing import Any, Dict, List, Union
from pydantic import BaseModel, Field


class WidgetSpec(BaseModel):
    type: str = "text"
    props: Dict[str, Any] = Field(default_factory=dict)


class UIFieldItem(BaseModel):
    key: str
    label: Optional[str] = None
    widget: WidgetSpec = Field(default_factory=WidgetSpec)


class LayoutSectionSpec(BaseModel):
    title: str
    fields: List[Union[str, UIFieldItem]] = Field(default_factory=list)


class UISpec(BaseModel):
    title: str
    sections: List[LayoutSectionSpec] = Field(default_factory=list)