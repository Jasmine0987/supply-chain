"""
Core package
Contains configuration, security, and Celery setup
"""
from app.core.celery_app import celery_app

__all__ = ["celery_app"]