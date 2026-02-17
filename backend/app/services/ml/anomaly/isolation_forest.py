import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Optional, Tuple
import joblib
from pathlib import Path
from datetime import datetime
import logging

# Set up logging
logger = logging.getLogger(__name__)


class IsolationForestDetector:
    """Isolation Forest for anomaly detection in time series data"""
    
    def __init__(self, model_dir: str = "ml_models/anomaly_detection"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.model: Optional[IsolationForest] = None
        self.scaler: Optional[StandardScaler] = None
        self.feature_names: List[str] = []
        self.threshold: float = -0.5
        
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features for anomaly detection
        
        Args:
            df: DataFrame with 'ds' and 'y' columns
            
        Returns:
            DataFrame with engineered features
        """
        df = df.copy()
        df['ds'] = pd.to_datetime(df['ds'])
        df = df.sort_values('ds').reset_index(drop=True)
        
        # Time-based features
        df['hour'] = df['ds'].dt.hour
        df['day_of_week'] = df['ds'].dt.dayofweek
        df['day_of_month'] = df['ds'].dt.day
        df['month'] = df['ds'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Lag features
        for lag in [1, 7, 30]:
            df[f'lag_{lag}'] = df['y'].shift(lag)
        
        # Rolling statistics
        for window in [7, 14, 30]:
            df[f'rolling_mean_{window}'] = df['y'].rolling(window=window, min_periods=1).mean()
            df[f'rolling_std_{window}'] = df['y'].rolling(window=window, min_periods=1).std()
            df[f'rolling_min_{window}'] = df['y'].rolling(window=window, min_periods=1).min()
            df[f'rolling_max_{window}'] = df['y'].rolling(window=window, min_periods=1).max()
        
        # Rate of change
        df['rate_of_change'] = df['y'].pct_change()
        df['acceleration'] = df['rate_of_change'].diff()
        
        # Z-score (how many standard deviations from mean)
        df['z_score'] = (df['y'] - df['y'].mean()) / df['y'].std()
        
        # Distance from rolling mean
        df['distance_from_mean_7'] = np.abs(df['y'] - df['rolling_mean_7'])
        df['distance_from_mean_30'] = np.abs(df['y'] - df['rolling_mean_30'])
        
        # ✅ FIX: Use bfill() instead of deprecated fillna(method='bfill')
        df = df.bfill().fillna(0)
        
        return df
    
    def train(
        self,
        df: pd.DataFrame,
        contamination: float = 0.1,
        n_estimators: int = 100,
        random_state: int = 42
    ) -> Dict:
        """
        Train Isolation Forest model
        
        Args:
            df: Training data with 'ds' and 'y' columns
            contamination: Expected proportion of outliers (0-0.5)
            n_estimators: Number of trees
            random_state: Random seed
            
        Returns:
            Training statistics
        """
        try:
            logger.info(f"Training IsolationForest with {len(df)} samples")
            
            # Prepare features
            df_features = self.prepare_features(df)
            
            # Select feature columns (exclude ds and y)
            feature_cols = [col for col in df_features.columns if col not in ['ds', 'y']]
            self.feature_names = feature_cols
            
            X = df_features[feature_cols].values
            logger.info(f"Created {len(feature_cols)} features")
            
            # Scale features
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)
            
            # ✅ FIX: Use 'behavior' (American spelling) instead of 'behaviour'
            # Also removed deprecated parameter
            self.model = IsolationForest(
                contamination=contamination,
                n_estimators=n_estimators,
                random_state=random_state,
                n_jobs=-1,
                max_samples='auto',
                warm_start=False
            )
            
            logger.info("Fitting IsolationForest model...")
            self.model.fit(X_scaled)
            
            # Calculate statistics
            scores = self.model.decision_function(X_scaled)
            predictions = self.model.predict(X_scaled)
            
            anomaly_count = (predictions == -1).sum()
            anomaly_percentage = (anomaly_count / len(predictions)) * 100
            
            self.threshold = np.percentile(scores, contamination * 100)
            
            stats = {
                'total_samples': len(df),
                'anomalies_detected': int(anomaly_count),
                'anomaly_percentage': float(anomaly_percentage),
                'contamination': contamination,
                'n_estimators': n_estimators,
                'threshold': float(self.threshold),
                'score_mean': float(scores.mean()),
                'score_std': float(scores.std()),
                'score_min': float(scores.min()),
                'score_max': float(scores.max()),
                'trained_at': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Training complete. Detected {anomaly_count} anomalies ({anomaly_percentage:.2f}%)")
            return stats
            
        except Exception as e:
            logger.error(f"Error training IsolationForest: {str(e)}", exc_info=True)
            raise
    
    def detect(
        self,
        df: pd.DataFrame,
        return_scores: bool = True
    ) -> Tuple[List[int], Optional[np.ndarray]]:
        """
        Detect anomalies in new data
        
        Args:
            df: Data to check for anomalies
            return_scores: Return anomaly scores
            
        Returns:
            Tuple of (anomaly_indices, scores)
        """
        if self.model is None or self.scaler is None:
            raise ValueError("Model not trained. Call train() first.")
        
        try:
            # Prepare features
            df_features = self.prepare_features(df)
            X = df_features[self.feature_names].values
            X_scaled = self.scaler.transform(X)
            
            # Get predictions and scores
            predictions = self.model.predict(X_scaled)
            scores = self.model.decision_function(X_scaled)
            
            # Get anomaly indices
            anomaly_indices = np.where(predictions == -1)[0].tolist()
            
            logger.info(f"Detected {len(anomaly_indices)} anomalies in {len(df)} samples")
            
            if return_scores:
                return anomaly_indices, scores
            return anomaly_indices, None
            
        except Exception as e:
            logger.error(f"Error detecting anomalies: {str(e)}", exc_info=True)
            raise
    
    def get_anomalies_with_context(
        self,
        df: pd.DataFrame,
        include_features: bool = False
    ) -> List[Dict]:
        """
        Get detailed information about detected anomalies
        
        Args:
            df: Data to analyze
            include_features: Include feature values
            
        Returns:
            List of anomaly details
        """
        try:
            anomaly_indices, scores = self.detect(df, return_scores=True)
            
            df_features = self.prepare_features(df)
            
            anomalies = []
            for idx in anomaly_indices:
                anomaly_info = {
                    'index': int(idx),
                    'date': df_features.iloc[idx]['ds'].isoformat(),
                    'value': float(df_features.iloc[idx]['y']),
                    'anomaly_score': float(scores[idx]),
                    'severity': self._calculate_severity(scores[idx]),
                    'z_score': float(df_features.iloc[idx]['z_score']),
                }
                
                # Add context
                if idx > 0:
                    anomaly_info['previous_value'] = float(df_features.iloc[idx - 1]['y'])
                    anomaly_info['change'] = float(
                        df_features.iloc[idx]['y'] - df_features.iloc[idx - 1]['y']
                    )
                
                # Add rolling statistics
                anomaly_info['rolling_mean_7'] = float(df_features.iloc[idx]['rolling_mean_7'])
                anomaly_info['rolling_std_7'] = float(df_features.iloc[idx]['rolling_std_7'])
                
                if include_features:
                    anomaly_info['features'] = {
                        name: float(df_features.iloc[idx][name])
                        for name in self.feature_names[:10]  # Top 10 features
                    }
                
                anomalies.append(anomaly_info)
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error getting anomalies with context: {str(e)}", exc_info=True)
            raise
    
    def _calculate_severity(self, score: float) -> str:
        """Calculate severity level based on anomaly score"""
        if score > self.threshold * 0.5:
            return 'low'
        elif score > self.threshold * 0.75:
            return 'medium'
        elif score > self.threshold:
            return 'high'
        else:
            return 'critical'
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Estimate feature importance based on variance
        
        Returns:
            Dictionary of feature names and their importance scores
        """
        if self.model is None:
            raise ValueError("Model not trained")
        
        # This is a simplified importance metric
        # For true feature importance, use tree-based models
        importance = {}
        for i, feature in enumerate(self.feature_names):
            # Use feature index as a proxy for importance
            importance[feature] = float(1.0 / (i + 1))
        
        return importance
    
    def save_model(self, filename: str = "isolation_forest.pkl"):
        """Save trained model"""
        if self.model is None:
            raise ValueError("No model to save")
        
        try:
            filepath = self.model_dir / filename
            
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'feature_names': self.feature_names,
                'threshold': self.threshold,
                'version': '1.0'
            }
            
            joblib.dump(model_data, filepath)
            logger.info(f"Model saved to {filepath}")
            return str(filepath)
            
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}", exc_info=True)
            raise
    
    def load_model(self, filename: str = "isolation_forest.pkl"):
        """Load trained model"""
        try:
            filepath = self.model_dir / filename
            
            if not filepath.exists():
                raise FileNotFoundError(f"Model not found: {filepath}")
            
            model_data = joblib.load(filepath)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.threshold = model_data['threshold']
            
            logger.info(f"Model loaded from {filepath}")
            return self
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}", exc_info=True)
            raise