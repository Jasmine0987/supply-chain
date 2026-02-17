"""
MQTT Handler Service
Receives IoT sensor data from MQTT broker and processes it
"""
import paho.mqtt.client as mqtt
import json
import logging
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.iot_sensor import IoTSensor
from app.models.alert import Alert

logger = logging.getLogger(__name__)

class MQTTHandler:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect
        self.connected = False
        
    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            logger.info("✓ Connected to MQTT broker")
            self.connected = True
            
            # Subscribe to all sensor topics
            client.subscribe("warehouse/+/sensors/#")
            client.subscribe("shipment/sensors/#")
            logger.info("✓ Subscribed to sensor topics")
        else:
            logger.error(f"✗ Connection failed with code {rc}")
            self.connected = False
    
    def on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker"""
        logger.warning(f"Disconnected from MQTT broker (code: {rc})")
        self.connected = False
    
    def on_message(self, client, userdata, msg):
        """Callback when a message is received"""
        try:
            # Parse message
            payload = json.loads(msg.payload.decode())
            topic = msg.topic
            
            logger.info(f"📩 Received: {topic} | {payload['device_id']}")
            
            # Process the sensor data
            self.process_sensor_data(payload)
            
        except json.JSONDecodeError as e:
            logger.error(f"✗ Invalid JSON in message: {str(e)}")
        except Exception as e:
            logger.error(f"✗ Error processing message: {str(e)}")
    
    def process_sensor_data(self, data: dict):
        """Process and store sensor data"""
        db = SessionLocal()
        try:
            device_id = data.get('device_id')
            sensor_type = data.get('sensor_type')
            value = data.get('value')
            
            # Find or create sensor record
            sensor = db.query(IoTSensor).filter(
                IoTSensor.device_id == device_id
            ).first()
            
            if sensor:
                # Update existing sensor
                sensor.last_reading = data
                sensor.last_reading_at = datetime.utcnow()
                sensor.battery_level = data.get('battery_level')
                sensor.signal_strength = data.get('signal_strength')
                
                # Check for alerts
                self.check_thresholds(db, sensor, value)
                
                db.commit()
                logger.info(f"✓ Updated sensor {device_id}")
            else:
                logger.warning(f"⚠ Sensor not found in database: {device_id}")
                
        except Exception as e:
            logger.error(f"✗ Error processing sensor data: {str(e)}")
            db.rollback()
        finally:
            db.close()
    
    def check_thresholds(self, db: Session, sensor: IoTSensor, value):
        """Check if sensor value exceeds thresholds and create alerts"""
        try:
            # For GPS sensors, value is a dict
            if isinstance(value, dict):
                return
            
            alert_created = False
            
            # Check max threshold
            if sensor.max_threshold and value > sensor.max_threshold:
                alert = Alert(
                    alert_type=f"{sensor.sensor_type}_high",
                    severity="high",
                    title=f"{sensor.sensor_type.title()} Threshold Exceeded",
                    message=f"Sensor {sensor.device_id} recorded {value} (threshold: {sensor.max_threshold})",
                    is_resolved=False,
                    is_sent=False
                )
                db.add(alert)
                alert_created = True
                logger.warning(f"🚨 Alert created: {sensor.device_id} exceeded max threshold")
            
            # Check min threshold
            elif sensor.min_threshold and value < sensor.min_threshold:
                alert = Alert(
                    alert_type=f"{sensor.sensor_type}_low",
                    severity="medium",
                    title=f"{sensor.sensor_type.title()} Below Threshold",
                    message=f"Sensor {sensor.device_id} recorded {value} (threshold: {sensor.min_threshold})",
                    is_resolved=False,
                    is_sent=False
                )
                db.add(alert)
                alert_created = True
                logger.warning(f"🚨 Alert created: {sensor.device_id} below min threshold")
            
            if alert_created:
                db.commit()
                
        except Exception as e:
            logger.error(f"✗ Error checking thresholds: {str(e)}")
    
    def connect(self):
        """Connect to MQTT broker"""
        try:
            logger.info(f"Connecting to MQTT broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}")
            
            if settings.MQTT_USERNAME and settings.MQTT_PASSWORD:
                self.client.username_pw_set(settings.MQTT_USERNAME, settings.MQTT_PASSWORD)
            
            self.client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
            self.client.loop_start()
            
            logger.info("✓ MQTT handler started")
            
        except Exception as e:
            logger.error(f"✗ Failed to connect to MQTT broker: {str(e)}")
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        self.client.loop_stop()
        self.client.disconnect()
        logger.info("✓ MQTT handler stopped")

# Global MQTT handler instance
mqtt_handler: Optional[MQTTHandler] = None

def get_mqtt_handler() -> MQTTHandler:
    """Get or create MQTT handler instance"""
    global mqtt_handler
    if mqtt_handler is None:
        mqtt_handler = MQTTHandler()
    return mqtt_handler

def start_mqtt_handler():
    """Start MQTT handler"""
    handler = get_mqtt_handler()
    handler.connect()
    return handler

def stop_mqtt_handler():
    """Stop MQTT handler"""
    global mqtt_handler
    if mqtt_handler:
        mqtt_handler.disconnect()
        mqtt_handler = None