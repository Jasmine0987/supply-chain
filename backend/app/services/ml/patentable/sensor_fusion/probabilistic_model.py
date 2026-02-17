"""
Probabilistic Graphical Model for Sensor Fusion
PATENTABLE: Multi-modal sensor fusion using Bayesian networks
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
from scipy.stats import norm, multivariate_normal
import logging

logger = logging.getLogger(__name__)


class ProbabilisticGraphicalModel:
    """
    PATENTABLE: Probabilistic graphical model for multi-sensor fusion
    
    Key Innovation:
    - Bayesian network representing sensor relationships
    - Handles missing data and sensor failures
    - Learns conditional dependencies between sensors
    - Provides uncertainty estimates for predictions
    """
    
    def __init__(self):
        self.sensor_types = ['temperature', 'humidity', 'shock', 'vibration', 'gps', 'image']
        self.nodes = {}  # Sensor nodes
        self.edges = {}  # Causal relationships
        self.conditional_probs = {}  # P(sensor_i | sensor_j)
        self.prior_probs = {}  # P(sensor_i)
        
    def initialize_network(self):
        """Initialize Bayesian network structure"""
        # Define nodes for each sensor type
        for sensor in self.sensor_types:
            self.nodes[sensor] = {
                'mean': 0.0,
                'std': 1.0,
                'observed': False,
                'value': None
            }
        
        # Initialize prior probabilities (uniform distribution)
        for sensor in self.sensor_types:
            self.prior_probs[sensor] = {
                'mean': 0.0,
                'std': 1.0
            }
        
        logger.info("Probabilistic network initialized")
    
    def add_causal_edge(
        self,
        from_sensor: str,
        to_sensor: str,
        strength: float = 1.0,
        conditional_params: Dict = None
    ):
        """
        Add causal edge between sensors
        
        Args:
            from_sensor: Cause sensor
            to_sensor: Effect sensor
            strength: Strength of causal relationship (0-1)
            conditional_params: Parameters for P(to_sensor | from_sensor)
        """
        if from_sensor not in self.edges:
            self.edges[from_sensor] = {}
        
        self.edges[from_sensor][to_sensor] = {
            'strength': strength,
            'params': conditional_params or {}
        }
        
        logger.info(f"Added causal edge: {from_sensor} -> {to_sensor} (strength: {strength})")
    
    def set_observation(self, sensor: str, value: float, uncertainty: float = 0.1):
        """
        Set observed value for a sensor
        
        Args:
            sensor: Sensor type
            value: Observed value
            uncertainty: Measurement uncertainty (std dev)
        """
        if sensor in self.nodes:
            self.nodes[sensor]['observed'] = True
            self.nodes[sensor]['value'] = value
            self.nodes[sensor]['std'] = uncertainty
    
    def infer_unobserved(self, target_sensor: str) -> Tuple[float, float]:
        """
        Infer value for unobserved sensor using Bayesian inference
        
        PATENTABLE: Multi-modal inference with uncertainty propagation
        
        Args:
            target_sensor: Sensor to infer
        
        Returns:
            (predicted_value, uncertainty)
        """
        if self.nodes[target_sensor]['observed']:
            return (
                self.nodes[target_sensor]['value'],
                self.nodes[target_sensor]['std']
            )
        
        # Find parent sensors (causes)
        parent_sensors = []
        for from_sensor, targets in self.edges.items():
            if target_sensor in targets and self.nodes[from_sensor]['observed']:
                parent_sensors.append(from_sensor)
        
        if not parent_sensors:
            # No observed parents, return prior
            return (
                self.prior_probs[target_sensor]['mean'],
                self.prior_probs[target_sensor]['std']
            )
        
        # Bayesian inference: P(target | parents)
        predicted_value = 0.0
        total_weight = 0.0
        uncertainty_sum = 0.0
        
        for parent in parent_sensors:
            edge = self.edges[parent][target_sensor]
            strength = edge['strength']
            
            # Conditional expectation
            parent_value = self.nodes[parent]['value']
            parent_std = self.nodes[parent]['std']
            
            # Simple linear Gaussian model: target = α * parent + noise
            alpha = edge['params'].get('coefficient', 1.0)
            predicted_value += strength * alpha * parent_value
            total_weight += strength
            
            # Uncertainty propagation
            uncertainty_sum += (alpha * parent_std) ** 2
        
        if total_weight > 0:
            predicted_value /= total_weight
            uncertainty = np.sqrt(uncertainty_sum) / total_weight
        else:
            predicted_value = self.prior_probs[target_sensor]['mean']
            uncertainty = self.prior_probs[target_sensor]['std']
        
        return predicted_value, uncertainty
    
    def joint_inference(self) -> Dict[str, Tuple[float, float]]:
        """
        Perform joint inference over all unobserved sensors
        
        Returns:
            Dictionary mapping sensor -> (value, uncertainty)
        """
        results = {}
        
        for sensor in self.sensor_types:
            if self.nodes[sensor]['observed']:
                results[sensor] = (
                    self.nodes[sensor]['value'],
                    self.nodes[sensor]['std']
                )
            else:
                results[sensor] = self.infer_unobserved(sensor)
        
        return results
    
    def calculate_joint_probability(
        self,
        sensor_values: Dict[str, float]
    ) -> float:
        """
        Calculate joint probability P(sensors)
        
        PATENTABLE: Efficient joint probability calculation
        
        Args:
            sensor_values: Dictionary of sensor values
        
        Returns:
            Joint probability (log scale)
        """
        log_prob = 0.0
        
        for sensor, value in sensor_values.items():
            if sensor not in self.nodes:
                continue
            
            # Find parent sensors
            parent_sensors = []
            for from_sensor, targets in self.edges.items():
                if sensor in targets:
                    parent_sensors.append(from_sensor)
            
            if not parent_sensors:
                # Use prior probability
                mean = self.prior_probs[sensor]['mean']
                std = self.prior_probs[sensor]['std']
                log_prob += norm.logpdf(value, loc=mean, scale=std)
            else:
                # Use conditional probability
                expected_value = 0.0
                total_weight = 0.0
                
                for parent in parent_sensors:
                    if parent not in sensor_values:
                        continue
                    
                    edge = self.edges[parent][sensor]
                    strength = edge['strength']
                    alpha = edge['params'].get('coefficient', 1.0)
                    
                    expected_value += strength * alpha * sensor_values[parent]
                    total_weight += strength
                
                if total_weight > 0:
                    expected_value /= total_weight
                    std = 0.1  # Conditional variance
                    log_prob += norm.logpdf(value, loc=expected_value, scale=std)
        
        return log_prob
    
    def detect_anomaly(
        self,
        sensor_values: Dict[str, float],
        threshold: float = -10.0
    ) -> Tuple[bool, float]:
        """
        Detect anomalous sensor readings
        
        Args:
            sensor_values: Observed sensor values
            threshold: Log probability threshold for anomaly
        
        Returns:
            (is_anomaly, anomaly_score)
        """
        log_prob = self.calculate_joint_probability(sensor_values)
        is_anomaly = log_prob < threshold
        
        # Anomaly score (higher = more anomalous)
        anomaly_score = max(0, threshold - log_prob)
        
        return is_anomaly, anomaly_score
    
    def learn_from_data(
        self,
        sensor_data: List[Dict[str, float]],
        learn_structure: bool = False
    ):
        """
        Learn model parameters from historical data
        
        PATENTABLE: Structure and parameter learning
        
        Args:
            sensor_data: List of sensor readings
            learn_structure: Whether to learn causal structure
        """
        if len(sensor_data) == 0:
            return
        
        # Learn prior distributions
        for sensor in self.sensor_types:
            values = [d.get(sensor, None) for d in sensor_data]
            values = [v for v in values if v is not None]
            
            if len(values) > 0:
                self.prior_probs[sensor]['mean'] = np.mean(values)
                self.prior_probs[sensor]['std'] = np.std(values)
        
        # Learn conditional distributions
        if learn_structure:
            self._learn_causal_structure(sensor_data)
        
        logger.info(f"Learned model parameters from {len(sensor_data)} samples")
    
    def _learn_causal_structure(self, sensor_data: List[Dict[str, float]]):
        """
        Learn causal structure using correlation analysis
        
        Simplified approach: Use correlation as proxy for causation
        """
        # Calculate correlation matrix
        data_matrix = []
        for d in sensor_data:
            row = [d.get(sensor, 0) for sensor in self.sensor_types]
            data_matrix.append(row)
        
        data_matrix = np.array(data_matrix)
        
        if data_matrix.shape[0] < 2:
            return
        
        # Correlation matrix
        corr_matrix = np.corrcoef(data_matrix.T)
        
        # Add edges for strong correlations
        for i, sensor_i in enumerate(self.sensor_types):
            for j, sensor_j in enumerate(self.sensor_types):
                if i != j and abs(corr_matrix[i, j]) > 0.5:
                    self.add_causal_edge(
                        sensor_i,
                        sensor_j,
                        strength=abs(corr_matrix[i, j]),
                        conditional_params={'coefficient': corr_matrix[i, j]}
                    )
    
    def get_network_structure(self) -> Dict:
        """Get current network structure for visualization"""
        return {
            'nodes': list(self.nodes.keys()),
            'edges': [
                {
                    'from': from_sensor,
                    'to': to_sensor,
                    'strength': edge_data['strength']
                }
                for from_sensor, targets in self.edges.items()
                for to_sensor, edge_data in targets.items()
            ]
        }


# Example usage
if __name__ == "__main__":
    # Create model
    model = ProbabilisticGraphicalModel()
    model.initialize_network()
    
    # Add some causal relationships
    model.add_causal_edge('temperature', 'humidity', strength=0.8)
    model.add_causal_edge('shock', 'vibration', strength=0.9)
    model.add_causal_edge('temperature', 'damage', strength=0.6)
    
    # Set observations
    model.set_observation('temperature', value=35.5, uncertainty=0.5)
    model.set_observation('shock', value=8.2, uncertainty=1.0)
    
    # Infer unobserved sensors
    humidity_pred, humidity_unc = model.infer_unobserved('humidity')
    print(f"Predicted humidity: {humidity_pred:.2f} ± {humidity_unc:.2f}")
    
    # Detect anomalies
    sensor_values = {'temperature': 50, 'humidity': 20, 'shock': 15}
    is_anomaly, score = model.detect_anomaly(sensor_values)
    print(f"Anomaly detected: {is_anomaly}, Score: {score:.2f}")