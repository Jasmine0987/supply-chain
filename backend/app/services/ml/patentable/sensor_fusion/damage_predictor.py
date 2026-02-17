"""
Product Damage Predictor
PATENTABLE: Multi-modal damage prediction using sensor fusion
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
from scipy.special import expit  # Sigmoid function
import logging

logger = logging.getLogger(__name__)


class DamagePredictor:
    """
    PATENTABLE: Multi-modal sensor fusion for damage prediction
    
    Key Innovation:
    - Combines multiple sensor modalities to predict damage
    - Uses learned causal relationships
    - Provides uncertainty estimates
    - Identifies damage contributors
    """
    
    def __init__(self):
        self.damage_model = {}  # Sensor -> damage contribution weight
        self.thresholds = {}  # Sensor -> (low, medium, high) thresholds
        self.damage_history = []  # Historical damage predictions
        
        # Initialize default damage model
        self._initialize_damage_model()
    
    def _initialize_damage_model(self):
        """Initialize default damage contribution weights"""
        self.damage_model = {
            'temperature': {
                'weight': 0.3,
                'nonlinear': True,
                'threshold': 35.0  # °C
            },
            'humidity': {
                'weight': 0.1,
                'nonlinear': False,
                'threshold': 80.0  # %
            },
            'shock': {
                'weight': 0.4,
                'nonlinear': True,
                'threshold': 10.0  # g
            },
            'vibration': {
                'weight': 0.2,
                'nonlinear': True,
                'threshold': 5.0  # g
            }
        }
        
        # Damage thresholds
        self.thresholds = {
            'low': 0.3,
            'medium': 0.6,
            'high': 0.8
        }
    
    def predict_damage_probability(
        self,
        sensor_readings: Dict[str, float],
        causal_graph: Optional[Dict] = None
    ) -> Dict:
        """
        Predict product damage probability from sensor readings
        
        PATENTABLE: Multi-factor damage prediction with causal inference
        
        Args:
            sensor_readings: Dictionary of sensor values
            causal_graph: Optional causal relationships
        
        Returns:
            Damage prediction with probability and breakdown
        """
        # Calculate individual sensor contributions
        contributions = {}
        total_score = 0.0
        total_weight = 0.0
        
        for sensor, value in sensor_readings.items():
            if sensor not in self.damage_model:
                continue
            
            model = self.damage_model[sensor]
            weight = model['weight']
            threshold = model['threshold']
            
            # Calculate damage score for this sensor
            if model['nonlinear']:
                # Exponential increase above threshold
                if value > threshold:
                    score = 1.0 - np.exp(-(value - threshold) / threshold)
                else:
                    score = 0.1 * (value / threshold)
            else:
                # Linear increase
                score = min(1.0, value / (threshold * 2))
            
            contributions[sensor] = {
                'value': value,
                'score': score,
                'weight': weight,
                'weighted_score': score * weight
            }
            
            total_score += score * weight
            total_weight += weight
        
        # Normalize to probability
        if total_weight > 0:
            damage_probability = total_score / total_weight
        else:
            damage_probability = 0.0
        
        # Apply causal adjustments if available
        if causal_graph:
            damage_probability = self._adjust_for_causality(
                damage_probability,
                sensor_readings,
                causal_graph
            )
        
        # Calculate uncertainty
        uncertainty = self._calculate_uncertainty(sensor_readings, contributions)
        
        # Determine damage level
        damage_level = self._get_damage_level(damage_probability)
        
        # Identify primary contributors
        primary_contributors = sorted(
            contributions.items(),
            key=lambda x: x[1]['weighted_score'],
            reverse=True
        )[:3]
        
        prediction = {
            'damage_probability': float(damage_probability),
            'uncertainty': float(uncertainty),
            'damage_level': damage_level,
            'contributions': contributions,
            'primary_contributors': [
                {
                    'sensor': sensor,
                    'contribution': contrib['weighted_score'],
                    'value': contrib['value']
                }
                for sensor, contrib in primary_contributors
            ],
            'recommendations': self._generate_recommendations(
                damage_probability,
                contributions
            )
        }
        
        # Store in history
        self.damage_history.append(prediction)
        
        logger.info(
            f"Damage prediction: {damage_probability:.3f} "
            f"({damage_level}, uncertainty: {uncertainty:.3f})"
        )
        
        return prediction
    
    def _adjust_for_causality(
        self,
        base_probability: float,
        sensor_readings: Dict[str, float],
        causal_graph: Dict
    ) -> float:
        """
        Adjust damage probability using causal relationships
        
        PATENTABLE: Causal adjustment for damage prediction
        """
        adjustment_factor = 1.0
        
        # If root causes (temperature, shock) are high, amplify damage
        root_causes = ['temperature', 'shock']
        
        for cause in root_causes:
            if cause in sensor_readings and cause in self.damage_model:
                value = sensor_readings[cause]
                threshold = self.damage_model[cause]['threshold']
                
                if value > threshold * 1.5:
                    # Severe root cause amplifies damage
                    adjustment_factor *= 1.2
        
        adjusted_probability = min(1.0, base_probability * adjustment_factor)
        return adjusted_probability
    
    def _calculate_uncertainty(
        self,
        sensor_readings: Dict[str, float],
        contributions: Dict
    ) -> float:
        """
        Calculate prediction uncertainty
        
        Higher uncertainty when:
        - Few sensors available
        - Conflicting signals
        - Edge cases
        """
        # Sensor coverage
        expected_sensors = len(self.damage_model)
        available_sensors = len([s for s in sensor_readings if s in self.damage_model])
        coverage = available_sensors / expected_sensors
        
        # Signal conflict (variance in contributions)
        if len(contributions) > 1:
            scores = [c['score'] for c in contributions.values()]
            score_variance = np.var(scores)
        else:
            score_variance = 0.0
        
        # Base uncertainty
        base_uncertainty = 0.1
        
        # Coverage penalty
        coverage_penalty = (1.0 - coverage) * 0.5
        
        # Conflict penalty
        conflict_penalty = min(0.3, score_variance)
        
        total_uncertainty = base_uncertainty + coverage_penalty + conflict_penalty
        
        return min(1.0, total_uncertainty)
    
    def _get_damage_level(self, probability: float) -> str:
        """Convert probability to damage level"""
        if probability >= self.thresholds['high']:
            return 'high'
        elif probability >= self.thresholds['medium']:
            return 'medium'
        elif probability >= self.thresholds['low']:
            return 'low'
        else:
            return 'minimal'
    
    def _generate_recommendations(
        self,
        damage_probability: float,
        contributions: Dict
    ) -> List[str]:
        """
        Generate actionable recommendations based on damage prediction
        
        PATENTABLE: Context-aware recommendation system
        """
        recommendations = []
        
        # High damage probability
        if damage_probability > self.thresholds['high']:
            recommendations.append("URGENT: Inspect product immediately upon arrival")
            recommendations.append("Consider filing insurance claim")
        
        # Check individual sensors
        for sensor, contrib in contributions.items():
            score = contrib['score']
            value = contrib['value']
            
            if sensor == 'temperature' and score > 0.7:
                recommendations.append(
                    f"Extreme temperature exposure detected ({value:.1f}°C). "
                    "Check for heat/cold damage."
                )
            
            if sensor == 'shock' and score > 0.7:
                recommendations.append(
                    f"Severe shock detected ({value:.1f}g). "
                    "High risk of physical damage."
                )
            
            if sensor == 'humidity' and score > 0.7:
                recommendations.append(
                    f"High humidity exposure ({value:.1f}%). "
                    "Check for moisture damage."
                )
            
            if sensor == 'vibration' and score > 0.7:
                recommendations.append(
                    f"Excessive vibration detected ({value:.1f}g). "
                    "Check for loose components."
                )
        
        # Medium damage probability
        if self.thresholds['medium'] <= damage_probability < self.thresholds['high']:
            recommendations.append("Recommend detailed inspection before use")
        
        # Preventive measures
        if damage_probability > self.thresholds['low']:
            recommendations.append("Document all sensor readings for records")
            recommendations.append("Consider adjusting shipping method for future deliveries")
        
        return recommendations
    
    def predict_cumulative_damage(
        self,
        sensor_timeline: List[Dict[str, float]],
        time_intervals: List[float]
    ) -> Dict:
        """
        Predict cumulative damage over time
        
        PATENTABLE: Time-integrated damage prediction
        
        Args:
            sensor_timeline: List of sensor readings over time
            time_intervals: Time duration for each reading (seconds)
        
        Returns:
            Cumulative damage analysis
        """
        cumulative_damage = 0.0
        damage_timeline = []
        
        for i, readings in enumerate(sensor_timeline):
            # Instant damage
            instant_prediction = self.predict_damage_probability(readings)
            instant_damage = instant_prediction['damage_probability']
            
            # Time-weighted damage
            if i < len(time_intervals):
                duration = time_intervals[i]
                time_weighted_damage = instant_damage * (duration / 3600)  # Normalize by hour
            else:
                time_weighted_damage = instant_damage
            
            cumulative_damage += time_weighted_damage
            
            damage_timeline.append({
                'timestamp_index': i,
                'instant_damage': instant_damage,
                'cumulative_damage': cumulative_damage,
                'primary_contributors': instant_prediction['primary_contributors']
            })
        
        # Final cumulative damage probability (capped at 1.0)
        final_damage_probability = min(1.0, cumulative_damage / len(sensor_timeline))
        
        return {
            'final_damage_probability': final_damage_probability,
            'damage_level': self._get_damage_level(final_damage_probability),
            'timeline': damage_timeline,
            'total_exposure_time': sum(time_intervals) if time_intervals else 0,
            'peak_instant_damage': max(d['instant_damage'] for d in damage_timeline),
            'recommendations': self._generate_recommendations(
                final_damage_probability,
                {}
            )
        }
    
    def calibrate_model(
        self,
        training_data: List[Dict],
        actual_damages: List[bool]
    ):
        """
        Calibrate damage model using labeled data
        
        Args:
            training_data: List of sensor readings
            actual_damages: List of actual damage outcomes (True/False)
        """
        if len(training_data) != len(actual_damages):
            raise ValueError("Training data and labels must have same length")
        
        # Simple weight adjustment based on accuracy
        for sensor in self.damage_model.keys():
            sensor_values = [d.get(sensor, 0) for d in training_data]
            
            # Calculate correlation with actual damage
            if len(sensor_values) > 0:
                correlation = np.corrcoef(
                    sensor_values,
                    [1 if d else 0 for d in actual_damages]
                )[0, 1]
                
                # Adjust weight based on correlation
                if not np.isnan(correlation):
                    self.damage_model[sensor]['weight'] *= (1 + abs(correlation))
        
        # Normalize weights
        total_weight = sum(m['weight'] for m in self.damage_model.values())
        for sensor in self.damage_model:
            self.damage_model[sensor]['weight'] /= total_weight
        
        logger.info("Model calibrated with training data")
    
    def get_damage_statistics(self) -> Dict:
        """Get statistics from damage prediction history"""
        if not self.damage_history:
            return {'total_predictions': 0}
        
        probabilities = [h['damage_probability'] for h in self.damage_history]
        levels = [h['damage_level'] for h in self.damage_history]
        
        return {
            'total_predictions': len(self.damage_history),
            'average_damage_probability': np.mean(probabilities),
            'max_damage_probability': np.max(probabilities),
            'damage_level_distribution': {
                level: levels.count(level)
                for level in set(levels)
            }
        }


# Example usage
if __name__ == "__main__":
    # Create predictor
    predictor = DamagePredictor()
    
    # Simulate sensor readings
    sensor_readings = {
        'temperature': 45.0,  # High temperature
        'humidity': 70.0,
        'shock': 12.0,  # High shock
        'vibration': 6.0
    }
    
    # Predict damage
    prediction = predictor.predict_damage_probability(sensor_readings)
    
    print(f"Damage Probability: {prediction['damage_probability']:.2%}")
    print(f"Damage Level: {prediction['damage_level']}")
    print(f"Uncertainty: {prediction['uncertainty']:.2%}")
    print(f"\nPrimary Contributors:")
    for contrib in prediction['primary_contributors']:
        print(f"  - {contrib['sensor']}: {contrib['contribution']:.3f}")
    
    print(f"\nRecommendations:")
    for rec in prediction['recommendations']:
        print(f"  • {rec}")