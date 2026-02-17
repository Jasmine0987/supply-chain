from prophet import Prophet
import pandas as pd
import random
from typing import Dict, Any
from app.db.session import SessionLocal
from app.models.inventory import Inventory
from sqlalchemy import func
from datetime import datetime, timedelta

def forecast_inventory_demand(sku: str, days: int = 30):
    """
    Simple demand forecasting using Prophet
    """
    db = SessionLocal()
    
    # Get historical data (simulated for now)
    # In real implementation, you'd have a sales/transactions table
    
    # Create sample data
    dates = pd.date_range(end=datetime.now(), periods=90, freq='D')
    data = pd.DataFrame({
        'ds': dates,
        'y': [random.randint(10, 50) for _ in range(90)]
    })
    
    # Train Prophet model
    model = Prophet()
    model.fit(data)
    
    # Make predictions
    future = model.make_future_dataframe(periods=days)
    forecast = model.predict(future)
    
    db.close()
    
    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(days).to_dict('records')