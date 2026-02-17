import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple, Optional
from datetime import datetime


class StatisticalAnomalyDetector:
    """Statistical methods for anomaly detection"""
    
    def __init__(self):
        self.statistics: Dict = {}
    
    def z_score_detection(
        self,
        df: pd.DataFrame,
        threshold: float = 3.0,
        window: Optional[int] = None
    ) -> List[Dict]:
        """
        Detect anomalies using Z-score method
        
        Args:
            df: DataFrame with 'ds' and 'y' columns
            threshold: Number of standard deviations
            window: Rolling window size (None for global stats)
            
        Returns:
            List of anomalies
        """
        df = df.copy()
        
        if window:
            # Rolling Z-score
            df['rolling_mean'] = df['y'].rolling(window=window, center=True).mean()
            df['rolling_std'] = df['y'].rolling(window=window, center=True).std()
            df['z_score'] = (df['y'] - df['rolling_mean']) / df['rolling_std']
        else:
            # Global Z-score
            mean = df['y'].mean()
            std = df['y'].std()
            df['z_score'] = (df['y'] - mean) / std
        
        # Find anomalies
        anomalies = df[np.abs(df['z_score']) > threshold]
        
        results = []
        for _, row in anomalies.iterrows():
            results.append({
                'date': row['ds'].isoformat() if hasattr(row['ds'], 'isoformat') else row['ds'],
                'value': float(row['y']),
                'z_score': float(row['z_score']),
                'method': 'z_score',
                'threshold': threshold,
                'severity': self._z_score_severity(abs(row['z_score']))
            })
        
        return results
    
    def iqr_detection(
        self,
        df: pd.DataFrame,
        multiplier: float = 1.5
    ) -> List[Dict]:
        """
        Detect anomalies using Interquartile Range (IQR) method
        
        Args:
            df: DataFrame with 'ds' and 'y' columns
            multiplier: IQR multiplier (1.5 = outliers, 3.0 = extreme outliers)
            
        Returns:
            List of anomalies
        """
        df = df.copy()
        
        Q1 = df['y'].quantile(0.25)
        Q3 = df['y'].quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - multiplier * IQR
        upper_bound = Q3 + multiplier * IQR
        
        anomalies = df[(df['y'] < lower_bound) | (df['y'] > upper_bound)]
        
        results = []
        for _, row in anomalies.iterrows():
            distance_from_bounds = min(
                abs(row['y'] - lower_bound),
                abs(row['y'] - upper_bound)
            )
            
            results.append({
                'date': row['ds'].isoformat() if hasattr(row['ds'], 'isoformat') else row['ds'],
                'value': float(row['y']),
                'lower_bound': float(lower_bound),
                'upper_bound': float(upper_bound),
                'distance': float(distance_from_bounds),
                'method': 'iqr',
                'severity': 'high' if row['y'] < Q1 - 3*IQR or row['y'] > Q3 + 3*IQR else 'medium'
            })
        
        return results
    
    def mad_detection(
        self,
        df: pd.DataFrame,
        threshold: float = 3.5
    ) -> List[Dict]:
        """
        Detect anomalies using Median Absolute Deviation (MAD)
        More robust to outliers than Z-score
        
        Args:
            df: DataFrame with 'ds' and 'y' columns
            threshold: MAD threshold
            
        Returns:
            List of anomalies
        """
        df = df.copy()
        
        median = df['y'].median()
        mad = np.median(np.abs(df['y'] - median))
        
        # Modified Z-score using MAD
        modified_z_score = 0.6745 * (df['y'] - median) / mad
        df['mad_score'] = modified_z_score
        
        anomalies = df[np.abs(df['mad_score']) > threshold]
        
        results = []
        for _, row in anomalies.iterrows():
            results.append({
                'date': row['ds'].isoformat() if hasattr(row['ds'], 'isoformat') else row['ds'],
                'value': float(row['y']),
                'mad_score': float(row['mad_score']),
                'median': float(median),
                'mad': float(mad),
                'method': 'mad',
                'severity': self._mad_severity(abs(row['mad_score']))
            })
        
        return results
    
    def grubbs_test(
        self,
        df: pd.DataFrame,
        alpha: float = 0.05
    ) -> List[Dict]:
        """
        Grubbs' test for outliers (one at a time)
        
        Args:
            df: DataFrame with 'ds' and 'y' columns
            alpha: Significance level
            
        Returns:
            List of detected outliers
        """
        df = df.copy()
        values = df['y'].values
        outliers = []
        
        while len(values) > 2:
            mean = np.mean(values)
            std = np.std(values, ddof=1)
            
            # Calculate Grubbs statistic
            abs_diff = np.abs(values - mean)
            max_idx = np.argmax(abs_diff)
            max_diff = abs_diff[max_idx]
            G = max_diff / std
            
            # Critical value
            n = len(values)
            t_dist = stats.t.ppf(1 - alpha / (2 * n), n - 2)
            G_critical = ((n - 1) / np.sqrt(n)) * np.sqrt(t_dist**2 / (n - 2 + t_dist**2))
            
            if G > G_critical:
                # Found an outlier
                outlier_value = values[max_idx]
                outlier_date = df.iloc[max_idx]['ds']
                
                outliers.append({
                    'date': outlier_date.isoformat() if hasattr(outlier_date, 'isoformat') else outlier_date,
                    'value': float(outlier_value),
                    'grubbs_statistic': float(G),
                    'critical_value': float(G_critical),
                    'method': 'grubbs',
                    'severity': 'critical'
                })
                
                # Remove outlier and continue
                values = np.delete(values, max_idx)
                df = df.drop(df.index[max_idx]).reset_index(drop=True)
            else:
                break
        
        return outliers
    
    def seasonal_decomposition_anomalies(
        self,
        df: pd.DataFrame,
        period: int = 7,
        threshold: float = 3.0
    ) -> List[Dict]:
        """
        Detect anomalies in residuals after seasonal decomposition
        
        Args:
            df: DataFrame with 'ds' and 'y' columns
            period: Seasonal period
            threshold: Z-score threshold for residuals
            
        Returns:
            List of anomalies
        """
        from statsmodels.tsa.seasonal import seasonal_decompose
        
        df = df.copy()
        df = df.set_index('ds')
        
        # Decompose
        decomposition = seasonal_decompose(
            df['y'],
            model='additive',
            period=period,
            extrapolate_trend='freq'
        )
        
        # Analyze residuals
        residuals = decomposition.resid.dropna()
        mean_resid = residuals.mean()
        std_resid = residuals.std()
        
        z_scores = (residuals - mean_resid) / std_resid
        
        anomalies = residuals[np.abs(z_scores) > threshold]
        
        results = []
        for date, value in anomalies.items():
            results.append({
                'date': date.isoformat() if hasattr(date, 'isoformat') else str(date),
                'value': float(df.loc[date, 'y']),
                'residual': float(value),
                'z_score': float(z_scores[date]),
                'trend': float(decomposition.trend[date]),
                'seasonal': float(decomposition.seasonal[date]),
                'method': 'seasonal_decomposition',
                'severity': self._z_score_severity(abs(z_scores[date]))
            })
        
        return results
    
    def ensemble_detection(
        self,
        df: pd.DataFrame,
        min_methods: int = 2
    ) -> List[Dict]:
        """
        Combine multiple methods for robust detection
        
        Args:
            df: DataFrame with 'ds' and 'y' columns
            min_methods: Minimum number of methods that must agree
            
        Returns:
            List of high-confidence anomalies
        """
        # Run all methods
        z_score_anomalies = self.z_score_detection(df, threshold=3.0)
        iqr_anomalies = self.iqr_detection(df, multiplier=1.5)
        mad_anomalies = self.mad_detection(df, threshold=3.5)
        
        # Count detections per date
        detection_counts = {}
        all_anomalies = {}
        
        for method_results in [z_score_anomalies, iqr_anomalies, mad_anomalies]:
            for anomaly in method_results:
                date = anomaly['date']
                detection_counts[date] = detection_counts.get(date, 0) + 1
                if date not in all_anomalies:
                    all_anomalies[date] = anomaly
                else:
                    # Merge information
                    all_anomalies[date]['methods'] = all_anomalies[date].get('methods', [])
                    all_anomalies[date]['methods'].append(anomaly['method'])
        
        # Filter by minimum methods
        ensemble_results = []
        for date, count in detection_counts.items():
            if count >= min_methods:
                anomaly = all_anomalies[date].copy()
                anomaly['detection_count'] = count
                anomaly['confidence'] = count / 3.0  # Confidence score
                anomaly['method'] = 'ensemble'
                ensemble_results.append(anomaly)
        
        return sorted(ensemble_results, key=lambda x: x['confidence'], reverse=True)
    
    def _z_score_severity(self, z_score: float) -> str:
        """Determine severity from Z-score"""
        if z_score < 3:
            return 'low'
        elif z_score < 4:
            return 'medium'
        elif z_score < 5:
            return 'high'
        else:
            return 'critical'
    
    def _mad_severity(self, mad_score: float) -> str:
        """Determine severity from MAD score"""
        if mad_score < 3.5:
            return 'low'
        elif mad_score < 5:
            return 'medium'
        elif mad_score < 7:
            return 'high'
        else:
            return 'critical'