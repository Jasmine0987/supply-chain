"""
Multi-Modal Sensor Fusion Engine
PATENTABLE: Complete sensor fusion system
"""
from typing import Dict, List, Optional
from datetime import datetime
import logging

from .probabilistic_model import ProbabilisticGraphicalModel
from .sensor_aligner import SensorAligner
from .casual_learner import CausalLearner
from .damage_predictor import DamagePredictor

logger = logging.getLogger(__name__)


class SensorFusionEngine:
    """
    PATENTABLE: Complete multi-modal sensor fusion system
    """

    def __init__(self):
        self.aligner = SensorAligner()
        self.graphical_model = ProbabilisticGraphicalModel()
        self.causal_learner = CausalLearner()
        self.damage_predictor = DamagePredictor()

        self.sensor_types = ['temperature', 'humidity', 'shock', 'vibration', 'gps']
        self.fusion_state = {}
        self.initialized = False

    def initialize(self, historical_data: Optional[List[Dict]] = None):
        self.graphical_model.initialize_network()

        if historical_data:
            logger.info(f"Training with {len(historical_data)} historical samples")

            causal_graph = self.causal_learner.learn_causal_structure(
                historical_data,
                self.sensor_types,
                method='granger'
            )

            for edge in causal_graph['edges']:
                self.graphical_model.add_causal_edge(
                    edge['from'],
                    edge['to'],
                    strength=edge['strength']
                )

            self.graphical_model.learn_from_data(historical_data)

        self.initialized = True
        logger.info("Sensor fusion engine initialized")

    def add_sensor_reading(
        self,
        sensor_type: str,
        timestamp: datetime,
        value: float,
        metadata: Dict = None
    ):
        self.aligner.add_sensor_reading(
            sensor_type,
            timestamp,
            value,
            metadata
        )

    def process_shipment(
        self,
        shipment_id: str,
        sensor_data: List[Dict]
    ) -> Dict:

        if not self.initialized:
            self.initialize()

        logger.info(f"Processing shipment {shipment_id} with {len(sensor_data)} readings")

        # Step 1: Add sensor readings
        for reading in sensor_data:
            timestamp = reading.get('timestamp', datetime.now())
            for sensor_type, value in reading.items():
                if sensor_type == 'timestamp':
                    continue
                if sensor_type in self.sensor_types:
                    self.aligner.add_sensor_reading(
                        sensor_type,
                        timestamp,
                        value
                    )

        # Step 2: Align sensors
        aligned_data = self.aligner.align_sensors(method='interpolate')

        # Step 3: Detect anomalies
        anomalies = []
        for i, point in enumerate(aligned_data):
            sensors = point['sensors']

            for sensor, value in sensors.items():
                self.graphical_model.set_observation(sensor, value)

            is_anomaly, anomaly_score = self.graphical_model.detect_anomaly(sensors)

            if is_anomaly:
                anomalies.append({
                    'index': i,
                    'timestamp': point['timestamp'].isoformat(),  # ✅ FIX
                    'sensors': sensors,
                    'anomaly_score': float(anomaly_score)
                })

        # Step 4: Infer missing sensor values
        inferred_data = []
        for point in aligned_data:
            sensors = point['sensors']
            all_sensors = {}

            for sensor_type in self.sensor_types:
                if sensor_type in sensors:
                    all_sensors[sensor_type] = sensors[sensor_type]
                else:
                    for s, v in sensors.items():
                        self.graphical_model.set_observation(s, v)

                    inferred_value, _ = self.graphical_model.infer_unobserved(sensor_type)
                    all_sensors[sensor_type] = inferred_value

            inferred_data.append({
                'timestamp': point['timestamp'].isoformat(),  # ✅ FIX
                'sensors': all_sensors
            })

        # Step 5: Predict damage
        sensor_timeline = [d['sensors'] for d in inferred_data]
        time_intervals = [60.0] * len(sensor_timeline)

        damage_prediction = self.damage_predictor.predict_cumulative_damage(
            sensor_timeline,
            time_intervals
        )

        # Step 6: Causal graph
        causal_graph = self.causal_learner.get_causal_graph_summary()

        # Step 7: Alignment quality
        alignment_quality = self.aligner.get_alignment_quality()

        # Build report (JSON SAFE)
        report = {
            'shipment_id': shipment_id,
            'processing_timestamp': datetime.now().isoformat(),
            'data_summary': {
                'total_readings': len(sensor_data),
                'aligned_points': len(aligned_data),
                'time_span_seconds': (
                    aligned_data[-1]['timestamp'] - aligned_data[0]['timestamp']
                ).total_seconds() if aligned_data else 0
            },
            'damage_prediction': damage_prediction,
            'anomalies': {
                'count': len(anomalies),
                'details': anomalies[:10]
            },
            'causal_analysis': causal_graph,
            'alignment_quality': alignment_quality,
            'sensor_statistics': self._calculate_sensor_statistics(aligned_data),
            'recommendations': damage_prediction.get('recommendations', [])
        }

        self.fusion_state[shipment_id] = report

        logger.info(
            f"Shipment {shipment_id} processed: "
            f"Damage probability = {damage_prediction['final_damage_probability']:.2%}, "
            f"Anomalies = {len(anomalies)}"
        )

        return report

    def analyze_real_time(
        self,
        sensor_readings: Dict[str, float]
    ) -> Dict:

        if not self.initialized:
            self.initialize()

        damage_prediction = self.damage_predictor.predict_damage_probability(
            sensor_readings,
            causal_graph=self.causal_learner.get_causal_graph_summary()
        )

        is_anomaly, anomaly_score = self.graphical_model.detect_anomaly(sensor_readings)

        for sensor in sensor_readings:
            self.graphical_model.set_observation(sensor, sensor_readings[sensor])

        inferred_sensors = {}
        for sensor in self.sensor_types:
            if sensor not in sensor_readings:
                value, uncertainty = self.graphical_model.infer_unobserved(sensor)
                inferred_sensors[sensor] = {
                    'value': value,
                    'uncertainty': uncertainty
                }

        return {
            'timestamp': datetime.now().isoformat(),
            'observed_sensors': sensor_readings,
            'inferred_sensors': inferred_sensors,
            'damage_prediction': damage_prediction,
            'anomaly': {
                'is_anomaly': is_anomaly,
                'score': float(anomaly_score)
            }
        }

    def _calculate_sensor_statistics(
        self,
        aligned_data: List[Dict]
    ) -> Dict:
        import numpy as np

        statistics = {}

        for sensor in self.sensor_types:
            values = [
                point['sensors'][sensor]
                for point in aligned_data
                if sensor in point['sensors']
            ]

            if values:
                statistics[sensor] = {
                    'count': len(values),
                    'mean': float(np.mean(values)),
                    'std': float(np.std(values)),
                    'min': float(np.min(values)),
                    'max': float(np.max(values)),
                    'coverage': len(values) / len(aligned_data)
                }

        return statistics

    def get_fusion_summary(self, shipment_id: str) -> Optional[Dict]:
        return self.fusion_state.get(shipment_id)

    def export_causal_graph(self) -> Dict:
        return self.causal_learner.get_causal_graph_summary()

    def get_system_health(self) -> Dict:
        return {
            'initialized': self.initialized,
            'total_shipments_processed': len(self.fusion_state),
            'sensor_types': self.sensor_types,
            'causal_edges': self.causal_learner.get_causal_graph_summary()['total_edges'],
            'damage_statistics': self.damage_predictor.get_damage_statistics()
        }
