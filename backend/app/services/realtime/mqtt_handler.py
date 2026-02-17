"""
MQTT Handler - SIMPLIFIED VERSION (No Database Checking)
Just receives MQTT messages and broadcasts to WebSocket
"""

import json
from datetime import datetime
import paho.mqtt.client as mqtt
import asyncio


class MQTTHandler:
    def __init__(self, broker_host="localhost", broker_port=1883):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.websocket_manager = None
        self.loop = None
        
    def set_websocket_manager(self, manager):
        """Set the WebSocket manager for broadcasting"""
        self.websocket_manager = manager
        print("✅ WebSocket manager set in MQTT handler")
        
    def set_event_loop(self, loop):
        """Set the event loop for async operations"""
        self.loop = loop
        print("✅ Event loop set in MQTT handler")
        
    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            print(f"✅ Connected to MQTT broker at {self.broker_host}:{self.broker_port}")
            # Subscribe to all sensor topics
            client.subscribe("#")  # Subscribe to everything
            print("✅ Subscribed to all topics (#)")
        else:
            print(f"❌ Failed to connect to MQTT broker. Return code: {rc}")
    
    def on_message(self, client, userdata, msg):
        """Callback when message received from MQTT"""
        try:
            # Parse the message
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            
            sensor_id = payload.get('sensor_id', 'unknown')
            value = payload.get('value', 0)
            
            print(f"📡 Received: {topic} | {sensor_id} = {value}")
            
            # Create broadcast message
            broadcast_message = {
                "type": "sensor_update",
                "data": payload
            }
            
            # Broadcast to WebSocket clients
            if self.websocket_manager and self.loop:
                # Schedule async broadcast
                asyncio.run_coroutine_threadsafe(
                    self.websocket_manager.broadcast(broadcast_message),
                    self.loop
                )
                print(f"  ✅ Broadcasted!")
            else:
                print("  ⚠️ Cannot broadcast - manager or loop not set")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def connect(self):
        """Connect to MQTT broker"""
        try:
            self.client.connect(self.broker_host, self.broker_port, 60)
            return True
        except Exception as e:
            print(f"❌ Failed to connect to MQTT broker: {e}")
            return False
    
    def start(self):
        """Start the MQTT client loop in a separate thread"""
        self.client.loop_start()
        print("✅ MQTT handler started (background thread)")
    
    def stop(self):
        """Stop the MQTT client loop"""
        self.client.loop_stop()
        self.client.disconnect()
        print("✅ MQTT handler stopped")


# Global instance
mqtt_handler = MQTTHandler()