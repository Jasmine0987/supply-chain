from pydantic import BaseModel

class AlertStats(BaseModel):
    total: int
    resolved: int
    unresolved: int
    critical: int
    warning: int
