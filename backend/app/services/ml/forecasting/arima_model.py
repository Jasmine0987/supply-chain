import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
from pmdarima import auto_arima
from typing import Dict, Optional, Tuple
import joblib
from pathlib import Path
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


class ARIMAForecaster:
    """ARIMA/SARIMA-based time series forecasting"""
    
    def __init__(self, model_dir: str = "ml_models/demand_forecast"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.model: Optional[SARIMAX] = None
        self.order: Optional[Tuple] = None
        self.seasonal_order: Optional[Tuple] = None
        self.metrics: Dict = {}
    
    def auto_train(
        self,
        df: pd.DataFrame,
        seasonal: bool = True,
        m: int = 7  # Seasonal period (7 for weekly)
    ) -> Dict:
        """
        Automatically find best ARIMA parameters and train
        
        Args:
            df: DataFrame with 'ds' and 'y' columns
            seasonal: Use SARIMA (seasonal ARIMA)
            m: Seasonal period
            
        Returns:
            Training metrics
        """
        # Prepare data
        y = df['y'].values
        
        # Auto ARIMA to find best parameters
        print("Finding optimal ARIMA parameters...")
        
        auto_model = auto_arima(
            y,
            start_p=1, start_q=1,
            max_p=5, max_q=5,
            seasonal=seasonal,
            m=m if seasonal else 1,
            start_P=0, start_Q=0,
            max_P=2, max_Q=2,
            d=None,  # Auto-detect differencing
            D=None,  # Auto-detect seasonal differencing
            trace=True,
            error_action='ignore',
            suppress_warnings=True,
            stepwise=True
        )
        
        self.order = auto_model.order
        self.seasonal_order = auto_model.seasonal_order if seasonal else (0, 0, 0, 0)
        
        print(f"Best parameters: ARIMA{self.order} x {self.seasonal_order}")
        
        # Train final model
        return self.train(df, self.order, self.seasonal_order)
    
    def train(
        self,
        df: pd.DataFrame,
        order: Tuple[int, int, int],
        seasonal_order: Tuple[int, int, int, int] = (0, 0, 0, 0)
    ) -> Dict:
        """
        Train SARIMA model with specific parameters
        
        Args:
            df: DataFrame with 'ds' and 'y' columns
            order: (p, d, q) - ARIMA order
            seasonal_order: (P, D, Q, m) - Seasonal order
            
        Returns:
            Training metrics
        """
        self.order = order
        self.seasonal_order = seasonal_order
        
        # Prepare data
        y = df['y'].values
        
        # Fit model
        self.model = SARIMAX(
            y,
            order=order,
            seasonal_order=seasonal_order,
            enforce_stationarity=False,
            enforce_invertibility=False
        )
        
        self.model = self.model.fit(disp=False)
        
        # Calculate metrics
        self.metrics = self._calculate_metrics(df)
        
        return self.metrics
    
    def predict(
        self,
        periods: int = 30,
        return_confidence: bool = True
    ) -> pd.DataFrame:
        """
        Make predictions
        
        Args:
            periods: Number of periods to forecast
            return_confidence: Include confidence intervals
            
        Returns:
            DataFrame with predictions
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Make predictions
        forecast = self.model.forecast(steps=periods)
        
        # Get confidence intervals
        if return_confidence:
            forecast_result = self.model.get_forecast(steps=periods)
            conf_int = forecast_result.conf_int()
            
            df = pd.DataFrame({
                'yhat': forecast.values,
                'yhat_lower': conf_int.iloc[:, 0].values,
                'yhat_upper': conf_int.iloc[:, 1].values
            })
        else:
            df = pd.DataFrame({'yhat': forecast.values})
        
        # Add dates
        last_date = datetime.utcnow()
        dates = [last_date + timedelta(days=i+1) for i in range(periods)]
        df.insert(0, 'ds', dates)
        
        return df
    
    def _calculate_metrics(self, df: pd.DataFrame) -> Dict:
        """Calculate model performance metrics"""
        # In-sample predictions
        fitted = self.model.fittedvalues
        actual = df['y'].values
        
        # Align lengths (fitted values may have fewer points due to differencing)
        min_len = min(len(fitted), len(actual))
        fitted = fitted[-min_len:]
        actual = actual[-min_len:]
        
        # Calculate metrics
        mae = np.mean(np.abs(actual - fitted))
        mape = np.mean(np.abs((actual - fitted) / actual)) * 100
        rmse = np.sqrt(np.mean((actual - fitted) ** 2))
        
        # AIC and BIC
        aic = self.model.aic
        bic = self.model.bic
        
        return {
            'mae': float(mae),
            'mape': float(mape),
            'rmse': float(rmse),
            'aic': float(aic),
            'bic': float(bic),
            'order': self.order,
            'seasonal_order': self.seasonal_order,
            'model_type': 'arima',
            'trained_at': datetime.utcnow().isoformat()
        }
    
    def save_model(self, filename: str = "arima_model.pkl"):
        """Save trained model"""
        if self.model is None:
            raise ValueError("No model to save")
        
        filepath = self.model_dir / filename
        
        model_data = {
            'model': self.model,
            'order': self.order,
            'seasonal_order': self.seasonal_order,
            'metrics': self.metrics,
            'version': '1.0'
        }
        
        joblib.dump(model_data, filepath)
        return str(filepath)
    
    def load_model(self, filename: str = "arima_model.pkl"):
        """Load trained model"""
        filepath = self.model_dir / filename
        
        if not filepath.exists():
            raise FileNotFoundError(f"Model not found: {filepath}")
        
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.order = model_data['order']
        self.seasonal_order = model_data['seasonal_order']
        self.metrics = model_data.get('metrics', {})
        
        return self


# Example usage
if __name__ == "__main__":
    from data_preprocessor import DataPreprocessor
    
    # Generate sample data
    preprocessor = DataPreprocessor(None)
    df = preprocessor._generate_synthetic_demand(365)
    
    # Auto train
    forecaster = ARIMAForecaster()
    metrics = forecaster.auto_train(df, seasonal=True, m=7)
    print("Training Metrics:", metrics)
    
    # Make predictions
    predictions = forecaster.predict(periods=30)
    print("\nPredictions:")
    print(predictions.head())
    
    # Save model
    forecaster.save_model()
    print("\nModel saved successfully")