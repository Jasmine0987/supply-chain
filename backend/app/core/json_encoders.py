# backend/app/core/json_encoders.py

from datetime import datetime, date
from decimal import Decimal
import json

def custom_json_encoder(obj):
    """Custom JSON encoder for FastAPI responses"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")