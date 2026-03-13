from beanie import Document
from typing import Optional, Dict, Any
from datetime import datetime


class AuditLog(Document):
    user_id: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}
    ip_address: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

    class Settings:
        name = "audit_logs"
