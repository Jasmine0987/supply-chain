import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.shipment import Shipment


class DataPreprocessor:
    """Prepare data for forecasting models"""

    def __init__(self, db: Session):
        self.db = db

    def get_historical_demand(
        self,
        product_sku: Optional[str] = None,  # kept for API compatibility
        warehouse_id: Optional[int] = None,
        days: int = 365
    ) -> pd.DataFrame:
        """
        Build historical demand time series from shipments.
        Demand = number of shipments per day.
        """

        cutoff_date = datetime.utcnow() - timedelta(days=days)

        query = (
            self.db.query(
                func.date(Shipment.shipped_at).label("ds"),
                func.count(Shipment.id).label("y")
            )
            .filter(Shipment.shipped_at.isnot(None))
            .filter(Shipment.shipped_at >= cutoff_date)
        )

        # Filter by origin warehouse
        if warehouse_id:
            query = query.filter(Shipment.origin_warehouse_id == warehouse_id)

        query = (
            query
            .group_by(func.date(Shipment.shipped_at))
            .order_by(func.date(Shipment.shipped_at))
        )

        results = query.all()

        if not results:
            return self._generate_synthetic_demand(days)

        df = pd.DataFrame(results, columns=["ds", "y"])
        df["ds"] = pd.to_datetime(df["ds"])
        df["y"] = df["y"].astype(float)

        return df

    def _generate_synthetic_demand(self, days: int = 365) -> pd.DataFrame:
        """Generate synthetic demand data for demonstration"""
        np.random.seed(42)

        dates = pd.date_range(
            end=datetime.utcnow(),
            periods=days,
            freq="D"
        )

        trend = np.linspace(50, 120, days)
        seasonality = 15 * np.sin(2 * np.pi * np.arange(days) / 7)
        noise = np.random.normal(0, 8, days)

        demand = trend + seasonality + noise
        demand = np.maximum(demand, 0)

        return pd.DataFrame({
            "ds": dates,
            "y": demand
        })

    def validate_data(self, df: pd.DataFrame) -> bool:
        """Validate data quality for forecasting"""
        if df is None or df.empty:
            return False

        if len(df) < 30:
            return False

        if "ds" not in df.columns or "y" not in df.columns:
            return False

        if df["y"].isna().sum() > 0:
            return False

        return True

    def split_train_test(
        self,
        df: pd.DataFrame,
        test_size: int = 30
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Split data into train and test sets"""
        return df.iloc[:-test_size], df.iloc[-test_size:]
