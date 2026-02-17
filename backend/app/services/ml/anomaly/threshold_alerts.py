from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.iot_sensor import IoTSensor


class ThresholdAlertGenerator:
    """Generate alerts based on threshold violations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_sensor_thresholds(
        self,
        sensor_id: int,
        value: float,
        sensor_type: str
    ) -> Optional[Dict]:
        """
        Check if sensor reading violates thresholds
        
        Args:
            sensor_id: Sensor ID
            value: Current reading
            sensor_type: Type of sensor
            
        Returns:
            Alert details if threshold violated
        """
        thresholds = self._get_sensor_thresholds(sensor_type)
        
        if not thresholds:
            return None
        
        # Check critical thresholds
        if 'critical_high' in thresholds and value > thresholds['critical_high']:
            return self._create_alert(
                sensor_id=sensor_id,
                severity='critical',
                message=f"{sensor_type} critically high: {value:.2f}",
                threshold_type='critical_high',
                threshold_value=thresholds['critical_high'],
                actual_value=value
            )
        
        if 'critical_low' in thresholds and value < thresholds['critical_low']:
            return self._create_alert(
                sensor_id=sensor_id,
                severity='critical',
                message=f"{sensor_type} critically low: {value:.2f}",
                threshold_type='critical_low',
                threshold_value=thresholds['critical_low'],
                actual_value=value
            )
        
        # Check warning thresholds
        if 'warning_high' in thresholds and value > thresholds['warning_high']:
            return self._create_alert(
                sensor_id=sensor_id,
                severity='high',
                message=f"{sensor_type} high: {value:.2f}",
                threshold_type='warning_high',
                threshold_value=thresholds['warning_high'],
                actual_value=value
            )
        
        if 'warning_low' in thresholds and value < thresholds['warning_low']:
            return self._create_alert(
                sensor_id=sensor_id,
                severity='high',
                message=f"{sensor_type} low: {value:.2f}",
                threshold_type='warning_low',
                threshold_value=thresholds['warning_low'],
                actual_value=value
            )
        
        return None
    
    def _get_sensor_thresholds(self, sensor_type: str) -> Dict:
        """Get threshold values for sensor type"""
        thresholds = {
            'temperature': {
                'critical_high': 30.0,
                'warning_high': 25.0,
                'warning_low': 2.0,
                'critical_low': -5.0
            },
            'humidity': {
                'critical_high': 85.0,
                'warning_high': 75.0,
                'warning_low': 30.0,
                'critical_low': 20.0
            },
            'shock': {
                'critical_high': 8.0,
                'warning_high': 5.0
            },
            'pressure': {
                'critical_high': 1050.0,
                'warning_high': 1030.0,
                'warning_low': 970.0,
                'critical_low': 950.0
            }
        }
        
        return thresholds.get(sensor_type, {})
    
    def _create_alert(
        self,
        sensor_id: int,
        severity: str,
        message: str,
        threshold_type: str,
        threshold_value: float,
        actual_value: float
    ) -> Dict:
        """Create alert in database"""
        alert = Alert(
            alert_type='sensor_threshold',
            severity=severity,
            title=f"Sensor Threshold Violation",
            message=message,
            source='anomaly_detection',
            metadata={
                'sensor_id': sensor_id,
                'threshold_type': threshold_type,
                'threshold_value': threshold_value,
                'actual_value': actual_value
            }
        )
        
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        
        return {
            'alert_id': alert.id,
            'severity': severity,
            'message': message
        }