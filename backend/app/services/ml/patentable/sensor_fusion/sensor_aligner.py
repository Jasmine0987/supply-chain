"""
Sensor Data Aligner
PATENTABLE: Multi-modal sensor synchronization and alignment
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from scipy.interpolate import interp1d
import logging

logger = logging.getLogger(__name__)


class SensorAligner:
    """
    PATENTABLE: Multi-modal sensor data alignment and synchronization
    
    Key Innovation:
    - Handles different sampling rates across sensors
    - Temporal alignment with interpolation
    - Handles missing data and sensor dropouts
    - Spatial alignment for GPS data
    """
    
    def __init__(self, alignment_window_seconds: float = 10.0):
        """
        Initialize sensor aligner
        
        Args:
            alignment_window_seconds: Time window for alignment
        """
        self.alignment_window = alignment_window_seconds
        self.sensor_data = {}  # sensor_type -> [(timestamp, value)]
        self.aligned_data = []  # Synchronized data points
        
    def add_sensor_reading(
        self,
        sensor_type: str,
        timestamp: datetime,
        value: float,
        metadata: Dict = None
    ):
        """
        Add a sensor reading
        
        Args:
            sensor_type: Type of sensor (temperature, shock, etc.)
            timestamp: Reading timestamp
            value: Sensor value
            metadata: Additional metadata (GPS coordinates, etc.)
        """
        if sensor_type not in self.sensor_data:
            self.sensor_data[sensor_type] = []
        
        self.sensor_data[sensor_type].append({
            'timestamp': timestamp,
            'value': value,
            'metadata': metadata or {}
        })
    
    def align_sensors(
        self,
        reference_sensor: str = 'gps',
        method: str = 'interpolate'
    ) -> List[Dict]:
        """
        Align all sensors to common timestamps
        
        PATENTABLE: Multi-rate sensor synchronization
        
        Args:
            reference_sensor: Sensor to use as time reference
            method: Alignment method ('interpolate', 'nearest', 'forward_fill')
        
        Returns:
            List of aligned data points
        """
        if reference_sensor not in self.sensor_data:
            # Use sensor with most readings as reference
            reference_sensor = max(
                self.sensor_data.keys(),
                key=lambda s: len(self.sensor_data[s])
            )
        
        # Get reference timestamps
        ref_data = self.sensor_data[reference_sensor]
        ref_timestamps = [d['timestamp'] for d in ref_data]
        
        # Align each sensor to reference timestamps
        aligned_data = []
        
        for ref_ts in ref_timestamps:
            aligned_point = {
                'timestamp': ref_ts,
                'sensors': {}
            }
            
            # Align each sensor
            for sensor_type, readings in self.sensor_data.items():
                if len(readings) == 0:
                    continue
                
                aligned_value = self._align_single_sensor(
                    readings,
                    ref_ts,
                    method
                )
                
                if aligned_value is not None:
                    aligned_point['sensors'][sensor_type] = aligned_value
            
            aligned_data.append(aligned_point)
        
        self.aligned_data = aligned_data
        logger.info(f"Aligned {len(aligned_data)} data points across {len(self.sensor_data)} sensors")
        
        return aligned_data
    
    def _align_single_sensor(
        self,
        readings: List[Dict],
        target_timestamp: datetime,
        method: str
    ) -> Optional[float]:
        """
        Align single sensor to target timestamp
        
        Args:
            readings: Sensor readings
            target_timestamp: Target timestamp
            method: Alignment method
        
        Returns:
            Aligned value or None
        """
        if len(readings) == 0:
            return None
        
        timestamps = [r['timestamp'] for r in readings]
        values = [r['value'] for r in readings]
        
        # Convert to seconds for interpolation
        base_time = min(timestamps)
        time_secs = [(t - base_time).total_seconds() for t in timestamps]
        target_secs = (target_timestamp - base_time).total_seconds()
        
        if method == 'nearest':
            # Find nearest timestamp
            idx = np.argmin([abs((t - target_timestamp).total_seconds()) for t in timestamps])
            return values[idx]
        
        elif method == 'interpolate':
            # Linear interpolation
            if target_secs < min(time_secs) or target_secs > max(time_secs):
                # Outside range, use nearest
                if target_secs < min(time_secs):
                    return values[0]
                else:
                    return values[-1]
            
            # Interpolate
            interp_func = interp1d(time_secs, values, kind='linear')
            return float(interp_func(target_secs))
        
        elif method == 'forward_fill':
            # Use most recent reading
            valid_readings = [
                (t, v) for t, v in zip(timestamps, values)
                if t <= target_timestamp
            ]
            
            if valid_readings:
                return valid_readings[-1][1]
            else:
                return values[0]
        
        return None
    
    def detect_sensor_dropout(
        self,
        sensor_type: str,
        max_gap_seconds: float = 60.0
    ) -> List[Tuple[datetime, datetime]]:
        """
        Detect periods where sensor stopped reporting
        
        Args:
            sensor_type: Sensor to check
            max_gap_seconds: Maximum acceptable gap
        
        Returns:
            List of (start, end) tuples for dropout periods
        """
        if sensor_type not in self.sensor_data:
            return []
        
        readings = self.sensor_data[sensor_type]
        if len(readings) < 2:
            return []
        
        timestamps = [r['timestamp'] for r in readings]
        timestamps.sort()
        
        dropouts = []
        for i in range(len(timestamps) - 1):
            gap = (timestamps[i + 1] - timestamps[i]).total_seconds()
            if gap > max_gap_seconds:
                dropouts.append((timestamps[i], timestamps[i + 1]))
        
        return dropouts
    
    def calculate_sampling_rate(self, sensor_type: str) -> float:
        """
        Calculate average sampling rate for a sensor
        
        Args:
            sensor_type: Sensor type
        
        Returns:
            Samples per second
        """
        if sensor_type not in self.sensor_data:
            return 0.0
        
        readings = self.sensor_data[sensor_type]
        if len(readings) < 2:
            return 0.0
        
        timestamps = sorted([r['timestamp'] for r in readings])
        total_duration = (timestamps[-1] - timestamps[0]).total_seconds()
        
        if total_duration > 0:
            return (len(readings) - 1) / total_duration
        
        return 0.0
    
    def resample_sensor(
        self,
        sensor_type: str,
        target_rate_hz: float
    ) -> List[Dict]:
        """
        Resample sensor to target rate
        
        PATENTABLE: Adaptive resampling for multi-rate sensors
        
        Args:
            sensor_type: Sensor to resample
            target_rate_hz: Target sampling rate (Hz)
        
        Returns:
            Resampled readings
        """
        if sensor_type not in self.sensor_data:
            return []
        
        readings = self.sensor_data[sensor_type]
        if len(readings) < 2:
            return readings
        
        # Sort by timestamp
        readings = sorted(readings, key=lambda r: r['timestamp'])
        
        # Create target timestamps
        start_time = readings[0]['timestamp']
        end_time = readings[-1]['timestamp']
        duration = (end_time - start_time).total_seconds()
        
        num_samples = int(duration * target_rate_hz)
        sample_interval = timedelta(seconds=1.0 / target_rate_hz)
        
        resampled = []
        current_time = start_time
        
        for i in range(num_samples):
            aligned_value = self._align_single_sensor(
                readings,
                current_time,
                method='interpolate'
            )
            
            if aligned_value is not None:
                resampled.append({
                    'timestamp': current_time,
                    'value': aligned_value,
                    'metadata': {}
                })
            
            current_time += sample_interval
        
        return resampled
    
    def spatial_alignment(
        self,
        gps_readings: List[Dict],
        radius_meters: float = 100.0
    ) -> List[List[Dict]]:
        """
        Group sensor readings by spatial proximity
        
        Args:
            gps_readings: GPS readings with lat/lon
            radius_meters: Grouping radius
        
        Returns:
            List of spatially-grouped readings
        """
        if len(gps_readings) == 0:
            return []
        
        # Simple spatial clustering
        clusters = []
        used = set()
        
        for i, reading in enumerate(gps_readings):
            if i in used:
                continue
            
            lat1 = reading['metadata'].get('latitude', 0)
            lon1 = reading['metadata'].get('longitude', 0)
            
            cluster = [reading]
            used.add(i)
            
            # Find nearby readings
            for j, other in enumerate(gps_readings):
                if j in used:
                    continue
                
                lat2 = other['metadata'].get('latitude', 0)
                lon2 = other['metadata'].get('longitude', 0)
                
                # Haversine distance (simplified)
                distance = self._haversine_distance(lat1, lon1, lat2, lon2)
                
                if distance <= radius_meters:
                    cluster.append(other)
                    used.add(j)
            
            clusters.append(cluster)
        
        return clusters
    
    def _haversine_distance(
        self,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> float:
        """Calculate distance between two GPS coordinates in meters"""
        R = 6371000  # Earth radius in meters
        
        lat1_rad = np.radians(lat1)
        lat2_rad = np.radians(lat2)
        delta_lat = np.radians(lat2 - lat1)
        delta_lon = np.radians(lon2 - lon1)
        
        a = (np.sin(delta_lat / 2) ** 2 +
             np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(delta_lon / 2) ** 2)
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        
        return R * c
    
    def get_alignment_quality(self) -> Dict[str, float]:
        """
        Calculate alignment quality metrics
        
        Returns:
            Dictionary of quality metrics per sensor
        """
        quality = {}
        
        for sensor_type in self.sensor_data.keys():
            # Count how many aligned points have this sensor
            count = sum(
                1 for point in self.aligned_data
                if sensor_type in point['sensors']
            )
            
            coverage = count / len(self.aligned_data) if self.aligned_data else 0
            quality[sensor_type] = coverage
        
        return quality


# Example usage
if __name__ == "__main__":
    # Create aligner
    aligner = SensorAligner(alignment_window_seconds=10.0)
    
    # Add sensor readings
    base_time = datetime.now()
    
    # Temperature sensor (1 Hz)
    for i in range(10):
        aligner.add_sensor_reading(
            'temperature',
            base_time + timedelta(seconds=i),
            25.0 + np.random.randn()
        )
    
    # Shock sensor (10 Hz)
    for i in range(100):
        aligner.add_sensor_reading(
            'shock',
            base_time + timedelta(seconds=i * 0.1),
            5.0 + np.random.randn() * 2
        )
    
    # Align sensors
    aligned = aligner.align_sensors(reference_sensor='temperature')
    
    print(f"Aligned {len(aligned)} data points")
    print(f"Temperature sampling rate: {aligner.calculate_sampling_rate('temperature'):.2f} Hz")
    print(f"Shock sampling rate: {aligner.calculate_sampling_rate('shock'):.2f} Hz")