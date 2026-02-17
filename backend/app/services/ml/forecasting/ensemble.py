import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime

from app.services.ml.forecasting.prophet_model import ProphetForecaster
from app.services.ml.forecasting.arima_model import ARIMAForecaster


class EnsembleForecaster:
    """Ensemble multiple forecasting models for better accuracy"""
    
    def __init__(self):
        self.prophet = ProphetForecaster()
        self.arima = ARIMAForecaster()
        self.weights: Dict[str, float] = {'prophet': 1.0, 'arima': 0.0}
        self.metrics: Dict = {}
        self.arima_available = False
        self.prophet_metrics = {}
        self.arima_metrics = {}
    
    def train(self, df: pd.DataFrame) -> Dict:
        """Train all models with error handling"""
        
        # Always train Prophet
        print("Training Prophet model...")
        self.prophet_metrics = self.prophet.train(df)
        
        # Try ARIMA but don't fail if it errors
        print("\nTraining ARIMA model...")
        try:
            self.arima_metrics = self.arima.auto_train(df, seasonal=False)
            self.arima_available = True
            print("✅ ARIMA trained successfully")
            
            # Calculate weights
            prophet_weight = 1 / (self.prophet_metrics['mape'] + 1)
            arima_weight = 1 / (self.arima_metrics['mape'] + 1)
            total_weight = prophet_weight + arima_weight
            
            self.weights = {
                'prophet': prophet_weight / total_weight,
                'arima': arima_weight / total_weight
            }
            
            # Weighted average metrics
            ensemble_mape = (
                self.prophet_metrics['mape'] * self.weights['prophet'] +
                self.arima_metrics['mape'] * self.weights['arima']
            )
            ensemble_rmse = (
                self.prophet_metrics['rmse'] * self.weights['prophet'] +
                self.arima_metrics['rmse'] * self.weights['arima']
            )
            ensemble_mae = (
                self.prophet_metrics['mae'] * self.weights['prophet'] +
                self.arima_metrics['mae'] * self.weights['arima']
            )
            
            print(f"\nModel weights: Prophet={self.weights['prophet']:.2f}, ARIMA={self.weights['arima']:.2f}")
            
        except Exception as e:
            print(f"⚠️  ARIMA failed: {str(e)[:100]}")
            print("📊 Continuing with Prophet only...")
            self.arima_available = False
            self.weights = {'prophet': 1.0, 'arima': 0.0}
            self.arima_metrics = {'mape': 999, 'rmse': 999, 'mae': 999}
            
            # Use Prophet metrics
            ensemble_mape = self.prophet_metrics['mape']
            ensemble_rmse = self.prophet_metrics['rmse']
            ensemble_mae = self.prophet_metrics['mae']
        
        # Return flat format for /predict and /train endpoints
        self.metrics = {
            'mape': float(ensemble_mape),
            'rmse': float(ensemble_rmse),
            'mae': float(ensemble_mae),
            'samples': self.prophet_metrics.get('samples', len(df)),
            'prophet_mape': float(self.prophet_metrics['mape']),
            'arima_mape': float(self.arima_metrics['mape']),
            'prophet_weight': float(self.weights['prophet']),
            'arima_weight': float(self.weights['arima']),
            'models_used': 'Prophet + ARIMA' if self.arima_available else 'Prophet only'
        }
        
        return self.metrics
    
    def predict(self, periods: int = 30) -> pd.DataFrame:
        """Make ensemble predictions"""
        
        # Always get Prophet predictions
        prophet_pred = self.prophet.predict(periods)
        
        if not self.arima_available:
            return prophet_pred
        
        # Try ARIMA predictions
        try:
            arima_pred = self.arima.predict(periods)
            
            # Weighted average
            ensemble = pd.DataFrame({
                'ds': prophet_pred['ds'],
                'yhat': (
                    prophet_pred['yhat'] * self.weights['prophet'] +
                    arima_pred['yhat'] * self.weights['arima']
                ),
                'yhat_lower': (
                    prophet_pred['yhat_lower'] * self.weights['prophet'] +
                    arima_pred['yhat_lower'] * self.weights['arima']
                ),
                'yhat_upper': (
                    prophet_pred['yhat_upper'] * self.weights['prophet'] +
                    arima_pred['yhat_upper'] * self.weights['arima']
                ),
                'prophet_pred': prophet_pred['yhat'],
                'arima_pred': arima_pred['yhat']
            })
            
            return ensemble
            
        except:
            return prophet_pred
    
    def get_model_comparison(self, periods: int = 30) -> Dict:
        """Compare predictions from different models"""
        
        prophet_pred = self.prophet.predict(periods)
        
        comparison = {
            'prophet': prophet_pred.to_dict('records'),
            'arima': [],
            'ensemble': prophet_pred.to_dict('records'),
            'metrics': {
                'mape': float(self.metrics.get('mape', 0)),
                'rmse': float(self.metrics.get('rmse', 0)),
                'mae': float(self.metrics.get('mae', 0)),
                'prophet_mape': float(self.prophet_metrics.get('mape', 0)),
                'arima_mape': float(self.arima_metrics.get('mape', 999))
            }
        }
        
        if self.arima_available:
            try:
                arima_pred = self.arima.predict(periods)
                ensemble_pred = self.predict(periods)
                
                comparison['arima'] = arima_pred.to_dict('records')
                comparison['ensemble'] = ensemble_pred.to_dict('records')
            except:
                pass
        
        return comparison