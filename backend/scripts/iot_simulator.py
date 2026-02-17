"""
IoT Device Simulator
Simulates multiple IoT sensors publishing data to MQTT broker
Run this script to generate test data for the dashboard
"""

import paho.mqtt.client as mqtt
import json
import random
import time
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class IoTSimulator:
    def __init__(self, broker="localhost", port=1883):
        self.broker = broker
        self.port = port
        self.client = mqtt.Client()
        self.running = False

        # Define sensors
        self.sensors = [
            {
                "device_id": "SENSOR-CHI-DC-01-TEMP-001",
                "type": "temperature",
                "warehouse": "CHI-DC-01",
                "base_value": 22.0,
                "variance": 3.0,
                "unit": "°C"
            },
            {
                "device_id": "SENSOR-CHI-DC-01-HUM-001",
                "type": "humidity",
                "warehouse": "CHI-DC-01",
                "base_value": 45.0,
                "variance": 10.0,
                "unit": "%"
            },
            {
                "device_id": "SENSOR-LA-FC-01-TEMP-001",
                "type": "temperature",
                "warehouse": "LA-FC-01",
                "base_value": 20.0,
                "variance": 2.5,
                "unit": "°C"
            },
            {
                "device_id": "SENSOR-NY-CS-01-TEMP-001",
                "type": "temperature",
                "warehouse": "NY-CS-01",
                "base_value": 5.0,
                "variance": 2.0,
                "unit": "°C"
            },
            {
                "device_id": "SENSOR-SHIP-001-GPS",
                "type": "gps",
                "warehouse": None,
                "base_value": {"lat": 41.8781, "lng": -87.6298},
                "variance": 0.1,
                "unit": "coordinates"
            },
            {
                "device_id": "SENSOR-SHIP-001-SHOCK",
                "type": "shock",
                "warehouse": None,
                "base_value": 0.5,
                "variance": 1.5,
                "unit": "g"
            },
        ]

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print(f"✓ Connected to MQTT broker at {self.broker}:{self.port}")
            self.running = True
        else:
            print(f"✗ Connection failed with code {rc}")

    def generate_sensor_data(self, sensor):
        """Generate realistic sensor data"""
        timestamp = datetime.utcnow().isoformat()

        if sensor["type"] == "gps":
            lat = sensor["base_value"]["lat"] + random.uniform(
                -sensor["variance"], sensor["variance"]
            )
            lng = sensor["base_value"]["lng"] + random.uniform(
                -sensor["variance"], sensor["variance"]
            )
            value = {
                "latitude": round(lat, 6),
                "longitude": round(lng, 6)
            }
        else:
            value = sensor["base_value"] + random.uniform(
                -sensor["variance"], sensor["variance"]
            )
            value = round(value, 2)

            # 5% chance to generate alert-level spike
            if random.random() < 0.05:
                if sensor["type"] == "temperature":
                    value += random.uniform(5, 10)
                elif sensor["type"] == "shock":
                    value += random.uniform(3, 8)

        battery_level = round(random.uniform(85, 100), 1)
        signal_strength = round(random.uniform(70, 100), 1)

        data = {
            "device_id": sensor["device_id"],
            "sensor_type": sensor["type"],
            "value": value,
            "unit": sensor["unit"],
            "battery_level": battery_level,
            "signal_strength": signal_strength,
            "timestamp": timestamp
        }

        if sensor["warehouse"]:
            data["warehouse_code"] = sensor["warehouse"]

        return data

    def publish_sensor_data(self):
        """Publish data from all sensors"""
        for sensor in self.sensors:
            data = self.generate_sensor_data(sensor)

            if sensor["warehouse"]:
                topic = f"warehouse/{sensor['warehouse']}/sensors/{sensor['type']}"
            else:
                topic = f"shipment/sensors/{sensor['type']}"

            payload = json.dumps(data)
            result = self.client.publish(topic, payload)

            if result.rc == 0:
                print(
                    f"📡 [{sensor['type'].upper():12}] "
                    f"{sensor['device_id']:30} | "
                    f"Value: {str(data['value'])[:20]:20} | "
                    f"Battery: {data['battery_level']}%"
                )
            else:
                print(f"✗ Failed to publish {sensor['device_id']}")

    def run(self, interval=5):
        """Run the simulator"""
        print("=" * 100)
        print("IoT DEVICE SIMULATOR")
        print("=" * 100)
        print(f"Simulating {len(self.sensors)} IoT sensors")
        print(f"Publishing every {interval} seconds")
        print(f"MQTT Broker: {self.broker}:{self.port}")
        print("=" * 100)
        print()

        self.client.on_connect = self.on_connect

        try:
            self.client.connect(self.broker, self.port, 60)
            self.client.loop_start()

            time.sleep(2)

            if not self.running:
                print("✗ Could not connect to MQTT broker")
                return

            print("✓ Simulator started. Press Ctrl+C to stop.")
            print("-" * 100)

            while self.running:
                self.publish_sensor_data()
                print("-" * 100)
                time.sleep(interval)

        except KeyboardInterrupt:
            print("\n\n✓ Simulator stopped by user")
        except Exception as e:
            print(f"\n✗ Error: {str(e)}")
        finally:
            self.client.loop_stop()
            self.client.disconnect()
            print("✓ Disconnected from MQTT broker")


if __name__ == "__main__":
    simulator = IoTSimulator(broker="localhost", port=1883)
    simulator.run(interval=5)
