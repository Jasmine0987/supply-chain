"""
Multi-Forecast System for Probabilistic Inventory Allocation
Generates optimistic, pessimistic, and most likely demand forecasts
"""
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
import pandas as pd


class MultiForecastGenerator:
    """
    PATENTABLE: Multi-scenario forecasting system
    
    Generates three forecasts with different confidence levels:
    - Optimistic (P90): 90% chance demand will be below this
    - Most Likely (P50): 50% chance (median)
    - Pessimistic (P10): 10% chance demand will be below this
    """
    
    def __init__(self):
        self.historical_data = {}
        self.forecast_horizon = 30  # days
        
    def load_historical_demand(self, product_id: str, demand_history: List[float]):
        """Load historical demand data for a product"""
        self.historical_data[product_id] = demand_history
        
    def generate_forecasts(
        self,
        product_id: str,
        forecast_days: int = 30
    ) -> Dict[str, List[float]]:
        """
        Generate three forecasts: optimistic, most_likely, pessimistic
        
        Returns:
            Dict with keys: 'optimistic', 'most_likely', 'pessimistic'
            Each contains a list of daily forecasts
        """
        if product_id not in self.historical_data:
            # Generate synthetic data if no history
            self._generate_synthetic_history(product_id)
        
        history = self.historical_data[product_id]
        
        # Calculate statistics
        mean = np.mean(history)
        std = np.std(history)
        trend = self._calculate_trend(history)
        seasonality = self._calculate_seasonality(history)
        
        # Generate base forecast
        base_forecast = self._generate_base_forecast(
            mean, trend, seasonality, forecast_days
        )
        
        # Generate three scenarios
        forecasts = {
            'optimistic': self._generate_optimistic(base_forecast, std),
            'most_likely': base_forecast,
            'pessimistic': self._generate_pessimistic(base_forecast, std),
        }
        
        # Add metadata
        forecasts['metadata'] = {
            'product_id': product_id,
            'mean_demand': float(mean),
            'std_demand': float(std),
            'trend': float(trend),
            'forecast_days': forecast_days,
            'generated_at': datetime.now().isoformat()
        }
        
        return forecasts
    
    def _generate_synthetic_history(self, product_id: str, days: int = 90):
        """Generate synthetic demand history"""
        # Base demand with trend and seasonality
        base = 100
        trend = 0.5  # Daily increase
        seasonality_amplitude = 20
        noise_std = 15
        
        history = []
        for day in range(days):
            # Trend component
            trend_component = base + (trend * day)
            
            # Seasonality (weekly pattern)
            seasonality_component = seasonality_amplitude * np.sin(2 * np.pi * day / 7)
            
            # Random noise
            noise = np.random.normal(0, noise_std)
            
            demand = max(0, trend_component + seasonality_component + noise)
            history.append(demand)
        
        self.historical_data[product_id] = history
    
    def _calculate_trend(self, history: List[float]) -> float:
        """Calculate linear trend"""
        if len(history) < 2:
            return 0.0
        
        x = np.arange(len(history))
        y = np.array(history)
        
        # Simple linear regression
        coeffs = np.polyfit(x, y, 1)
        return coeffs[0]  # Slope
    
    def _calculate_seasonality(self, history: List[float], period: int = 7) -> List[float]:
        """Calculate seasonality pattern (weekly)"""
        if len(history) < period:
            return [0] * period
        
        # Average demand for each day of the week
        seasonality = []
        for i in range(period):
            day_values = [history[j] for j in range(i, len(history), period)]
            seasonality.append(np.mean(day_values) if day_values else 0)
        
        # Normalize to zero mean
        mean_seasonal = np.mean(seasonality)
        seasonality = [s - mean_seasonal for s in seasonality]
        
        return seasonality
    
    def _generate_base_forecast(
        self,
        mean: float,
        trend: float,
        seasonality: List[float],
        days: int
    ) -> List[float]:
        """Generate base (most likely) forecast"""
        forecast = []
        for day in range(days):
            # Trend component
            trend_component = mean + (trend * day)
            
            # Seasonality component
            seasonal_component = seasonality[day % len(seasonality)] if seasonality else 0
            
            forecast.append(max(0, trend_component + seasonal_component))
        
        return forecast
    
    def _generate_optimistic(self, base_forecast: List[float], std: float) -> List[float]:
        """
        Generate optimistic forecast (P90)
        90% chance actual demand will be below this
        """
        # Add positive uncertainty (1.28 std for 90th percentile)
        return [max(0, f + 1.28 * std) for f in base_forecast]
    
    def _generate_pessimistic(self, base_forecast: List[float], std: float) -> List[float]:
        """
        Generate pessimistic forecast (P10)
        10% chance actual demand will be below this
        """
        # Subtract uncertainty (1.28 std for 10th percentile)
        return [max(0, f - 1.28 * std) for f in base_forecast]
    
    def calculate_confidence_intervals(
        self,
        forecasts: Dict[str, List[float]]
    ) -> Dict[str, List[Tuple[float, float]]]:
        """Calculate confidence intervals for each day"""
        intervals = []
        
        optimistic = forecasts['optimistic']
        pessimistic = forecasts['pessimistic']
        
        for opt, pess in zip(optimistic, pessimistic):
            intervals.append((pess, opt))
        
        return {
            'intervals': intervals,
            'width': [opt - pess for opt, pess in intervals]
        }
    
    def get_forecast_accuracy(
        self,
        product_id: str,
        actual_demand: List[float],
        forecast_type: str = 'most_likely'
    ) -> Dict[str, float]:
        """Calculate forecast accuracy metrics"""
        if product_id not in self.historical_data:
            return {'error': 'No forecasts available'}
        
        forecasts = self.generate_forecasts(product_id, len(actual_demand))
        predicted = forecasts[forecast_type][:len(actual_demand)]
        
        # Calculate metrics
        mae = np.mean(np.abs(np.array(actual_demand) - np.array(predicted)))
        mape = np.mean(np.abs((np.array(actual_demand) - np.array(predicted)) / np.array(actual_demand))) * 100
        rmse = np.sqrt(np.mean((np.array(actual_demand) - np.array(predicted)) ** 2))
        
        return {
            'mae': float(mae),
            'mape': float(mape),
            'rmse': float(rmse),
            'forecast_type': forecast_type
        }


# Example usage and testing
if __name__ == "__main__":
    # Create forecaster
    forecaster = MultiForecastGenerator()
    
    # Generate forecasts for a product
    forecasts = forecaster.generate_forecasts('PROD001', forecast_days=30)
    
    print("Multi-Forecast Results:")
    print(f"Optimistic (Day 1): {forecasts['optimistic'][0]:.2f}")
    print(f"Most Likely (Day 1): {forecasts['most_likely'][0]:.2f}")
    print(f"Pessimistic (Day 1): {forecasts['pessimistic'][0]:.2f}")
    
    # Calculate confidence intervals
    intervals = forecaster.calculate_confidence_intervals(forecasts)
    print(f"\nConfidence Interval Width (Day 1): {intervals['width'][0]:.2f}")