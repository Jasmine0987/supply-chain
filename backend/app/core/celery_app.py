"""
Celery application configuration
Background task processing with Redis as broker
"""
from celery import Celery
from app.core.config import settings

# Create Celery instance
celery_app = Celery(
    "supply_chain_analytics",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.ml_training", "app.tasks.data_sync", "app.tasks.report_generation"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Optional: Configure task routes
celery_app.conf.task_routes = {
    "app.tasks.ml_training.*": {"queue": "ml_tasks"},
    "app.tasks.data_sync.*": {"queue": "sync_tasks"},
    "app.tasks.report_generation.*": {"queue": "report_tasks"},
}

if __name__ == "__main__":
    celery_app.start()