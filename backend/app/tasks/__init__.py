"""
Celery tasks package
"""
from app.tasks.ml_training import train_demand_forecast_model
from app.tasks.data_sync import sync_shipping_data
from app.tasks.report_generation import generate_daily_report

__all__ = [
    "train_demand_forecast_model",
    "sync_shipping_data",
    "generate_daily_report"
]