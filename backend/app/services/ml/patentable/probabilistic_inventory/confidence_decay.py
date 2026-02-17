"""
Confidence Decay Function for Forecasts
PATENTABLE: Time-based confidence decay mechanism
"""
import numpy as np
from typing import List, Dict, Tuple
from datetime import datetime, timedelta


class ConfidenceDecay:
    """
    PATENTABLE: Exponential confidence decay for forecasts
    
    Key Innovation:
    - Older forecasts have lower confidence weights
    - Decay rate adapts to forecast accuracy
    - Different decay rates for different scenarios
    """
    
    def __init__(self, base_decay_rate: float = 0.05):
        """
        Initialize confidence decay
        
        Args:
            base_decay_rate: Daily decay rate (0-1)
        """
        self.base_decay_rate = base_decay_rate
        self.accuracy_history = {}
    
    def calculate_confidence(
        self,
        days_old: int,
        forecast_accuracy: float = 1.0,
        scenario: str = 'most_likely'
    ) -> float:
        """
        Calculate confidence weight for a forecast
        
        Args:
            days_old: How many days ago the forecast was made
            forecast_accuracy: Historical accuracy (0-1)
            scenario: 'optimistic', 'most_likely', or 'pessimistic'
        
        Returns:
            Confidence weight (0-1)
        """
        # Adjust decay rate based on scenario
        decay_rate = self._get_scenario_decay_rate(scenario)
        
        # Exponential decay
        base_confidence = np.exp(-decay_rate * days_old)
        
        # Adjust by forecast accuracy
        adjusted_confidence = base_confidence * forecast_accuracy
        
        return max(0.0, min(1.0, adjusted_confidence))
    
    def _get_scenario_decay_rate(self, scenario: str) -> float:
        """
        Get decay rate for different scenarios
        
        Most likely forecasts decay slower than extreme scenarios
        """
        rates = {
            'most_likely': self.base_decay_rate,
            'optimistic': self.base_decay_rate * 1.2,  # Decay faster
            'pessimistic': self.base_decay_rate * 1.2,  # Decay faster
        }
        return rates.get(scenario, self.base_decay_rate)
    
    def apply_decay_to_forecasts(
        self,
        forecasts: Dict[str, List[float]],
        forecast_age_days: int = 0
    ) -> Dict[str, List[float]]:
        """
        Apply confidence decay to all forecasts
        
        Args:
            forecasts: Dict with 'optimistic', 'most_likely', 'pessimistic'
            forecast_age_days: How old the forecast is
        
        Returns:
            Weighted forecasts with decay applied
        """
        decayed_forecasts = {}
        
        for scenario, values in forecasts.items():
            if scenario == 'metadata':
                decayed_forecasts[scenario] = values
                continue
            
            # Calculate confidence for this scenario
            confidence = self.calculate_confidence(
                days_old=forecast_age_days,
                scenario=scenario
            )
            
            # Apply decay weight
            decayed_values = [v * confidence for v in values]
            decayed_forecasts[scenario] = decayed_values
            decayed_forecasts[f'{scenario}_confidence'] = confidence
        
        return decayed_forecasts
    
    def adaptive_decay_rate(
        self,
        product_id: str,
        recent_accuracy: float
    ) -> float:
        """
        Adapt decay rate based on recent forecast accuracy
        
        PATENTABLE: Self-adjusting decay mechanism
        """
        if product_id not in self.accuracy_history:
            self.accuracy_history[product_id] = []
        
        # Store accuracy
        self.accuracy_history[product_id].append(recent_accuracy)
        
        # Keep last 10 measurements
        if len(self.accuracy_history[product_id]) > 10:
            self.accuracy_history[product_id] = self.accuracy_history[product_id][-10:]
        
        # Calculate average accuracy
        avg_accuracy = np.mean(self.accuracy_history[product_id])
        
        # If accuracy is high, decay slower
        # If accuracy is low, decay faster
        if avg_accuracy > 0.8:
            adjusted_rate = self.base_decay_rate * 0.7  # Slower decay
        elif avg_accuracy < 0.5:
            adjusted_rate = self.base_decay_rate * 1.5  # Faster decay
        else:
            adjusted_rate = self.base_decay_rate
        
        return adjusted_rate
    
    def get_reforecast_threshold(
        self,
        current_confidence: float,
        min_confidence: float = 0.3
    ) -> bool:
        """
        Determine if forecasts should be regenerated
        
        Returns True if confidence has decayed below threshold
        """
        return current_confidence < min_confidence
    
    def calculate_weighted_demand(
        self,
        forecasts: Dict[str, List[float]],
        scenario_weights: Dict[str, float] = None
    ) -> List[float]:
        """
        Calculate weighted average demand across scenarios
        
        Args:
            forecasts: Multi-scenario forecasts
            scenario_weights: Custom weights for each scenario
        
        Returns:
            Weighted average forecast
        """
        if scenario_weights is None:
            # Default weights favor most likely
            scenario_weights = {
                'optimistic': 0.2,
                'most_likely': 0.6,
                'pessimistic': 0.2
            }
        
        weighted_forecast = []
        forecast_length = len(forecasts['most_likely'])
        
        for i in range(forecast_length):
            weighted_value = (
                forecasts['optimistic'][i] * scenario_weights['optimistic'] +
                forecasts['most_likely'][i] * scenario_weights['most_likely'] +
                forecasts['pessimistic'][i] * scenario_weights['pessimistic']
            )
            weighted_forecast.append(weighted_value)
        
        return weighted_forecast
    
    def get_confidence_bands(
        self,
        forecasts: Dict[str, List[float]],
        days_old: int
    ) -> Dict[str, List[Tuple[float, float]]]:
        """
        Calculate confidence bands for visualization
        
        Returns lower and upper bounds for each day
        """
        bands = []
        
        optimistic = forecasts['optimistic']
        pessimistic = forecasts['pessimistic']
        
        # Apply decay to bands
        opt_confidence = self.calculate_confidence(days_old, scenario='optimistic')
        pess_confidence = self.calculate_confidence(days_old, scenario='pessimistic')
        
        for opt, pess in zip(optimistic, pessimistic):
            lower = pess * pess_confidence
            upper = opt * opt_confidence
            bands.append((lower, upper))
        
        return {
            'bands': bands,
            'optimistic_confidence': opt_confidence,
            'pessimistic_confidence': pess_confidence
        }


# Example usage
if __name__ == "__main__":
    # Create decay calculator
    decay = ConfidenceDecay(base_decay_rate=0.05)
    
    # Test confidence calculation
    print("Confidence Decay Examples:")
    for days in [0, 5, 10, 15, 20]:
        conf = decay.calculate_confidence(days_old=days)
        print(f"Day {days}: Confidence = {conf:.3f}")
    
    # Test scenario-specific decay
    print("\nScenario-Specific Decay (10 days):")
    for scenario in ['optimistic', 'most_likely', 'pessimistic']:
        conf = decay.calculate_confidence(days_old=10, scenario=scenario)
        print(f"{scenario}: {conf:.3f}")
    
    # Test adaptive decay
    print("\nAdaptive Decay Rate:")
    for accuracy in [0.9, 0.7, 0.4]:
        rate = decay.adaptive_decay_rate('PROD001', accuracy)
        print(f"Accuracy {accuracy}: Decay rate = {rate:.4f}")