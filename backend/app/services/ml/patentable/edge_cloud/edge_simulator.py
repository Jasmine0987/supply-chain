import random
import time
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class EdgeDeviceProfile:
    """Simulated edge device characteristics"""
    device_id: str
    device_type: str  # "raspberry_pi", "jetson_nano", "smartphone"
    cpu_cores: int
    ram_mb: int
    battery_level: float  # 0-100
    network_latency_ms: float
    bandwidth_mbps: float
    is_charging: bool
    
    def __post_init__(self):
        """Validate device profile"""
        self.battery_level = max(0, min(100, self.battery_level))


class EdgeDeviceSimulator:
    """
    Simulate edge device behavior for testing partitioning algorithms
    """
    
    def __init__(self):
        self.devices: Dict[str, EdgeDeviceProfile] = {}
        self.device_templates = {
            "raspberry_pi": {
                "cpu_cores": 4,
                "ram_mb": 4096,
                "network_latency_ms": (50, 200),
                "bandwidth_mbps": (10, 50)
            },
            "jetson_nano": {
                "cpu_cores": 4,
                "ram_mb": 8192,
                "network_latency_ms": (30, 150),
                "bandwidth_mbps": (20, 100)
            },
            "smartphone": {
                "cpu_cores": 8,
                "ram_mb": 6144,
                "network_latency_ms": (20, 100),
                "bandwidth_mbps": (30, 150)
            },
            "iot_sensor": {
                "cpu_cores": 1,
                "ram_mb": 512,
                "network_latency_ms": (100, 500),
                "bandwidth_mbps": (1, 10)
            }
        }
    
    def create_device(
        self,
        device_id: str,
        device_type: str = "raspberry_pi"
    ) -> EdgeDeviceProfile:
        """Create a simulated edge device"""
        if device_type not in self.device_templates:
            raise ValueError(f"Unknown device type: {device_type}")
        
        template = self.device_templates[device_type]
        
        device = EdgeDeviceProfile(
            device_id=device_id,
            device_type=device_type,
            cpu_cores=template["cpu_cores"],
            ram_mb=template["ram_mb"],
            battery_level=random.uniform(20, 100),
            network_latency_ms=random.uniform(*template["network_latency_ms"]),
            bandwidth_mbps=random.uniform(*template["bandwidth_mbps"]),
            is_charging=random.choice([True, False])
        )
        
        self.devices[device_id] = device
        return device
    
    def update_device_state(self, device_id: str) -> EdgeDeviceProfile:
        """
        Simulate dynamic changes in device state
        
        PATENT CLAIM: Real-time device state monitoring for adaptive partitioning
        """
        if device_id not in self.devices:
            raise ValueError(f"Device {device_id} not found")
        
        device = self.devices[device_id]
        
        # Simulate battery drain/charge
        if device.is_charging:
            device.battery_level = min(100, device.battery_level + random.uniform(0.5, 2))
        else:
            device.battery_level = max(0, device.battery_level - random.uniform(0.1, 1))
        
        # Simulate network fluctuations
        template = self.device_templates[device.device_type]
        device.network_latency_ms = random.uniform(*template["network_latency_ms"])
        device.bandwidth_mbps = random.uniform(*template["bandwidth_mbps"])
        
        # Randomly toggle charging state
        if random.random() < 0.05:  # 5% chance
            device.is_charging = not device.is_charging
        
        return device
    
    def get_device_metrics(self, device_id: str) -> Dict:
        """Get current device metrics"""
        if device_id not in self.devices:
            raise ValueError(f"Device {device_id} not found")
        
        device = self.devices[device_id]
        
        return {
            "device_id": device.device_id,
            "device_type": device.device_type,
            "battery_level": device.battery_level,
            "network_latency_ms": device.network_latency_ms,
            "bandwidth_mbps": device.bandwidth_mbps,
            "is_charging": device.is_charging,
            "ram_available_mb": device.ram_mb * random.uniform(0.4, 0.8),
            "cpu_usage_percent": random.uniform(10, 80),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def simulate_inference_time(
        self,
        device_id: str,
        layer_complexity: int
    ) -> float:
        """
        Simulate inference time for a layer on edge device
        
        Args:
            device_id: Device identifier
            layer_complexity: Arbitrary complexity score (higher = more compute)
            
        Returns:
            Inference time in seconds
        """
        device = self.devices[device_id]
        
        # Base time proportional to complexity
        base_time = layer_complexity * 0.01
        
        # Adjust for device capabilities
        cpu_factor = 1.0 / device.cpu_cores
        ram_factor = 1.0 if device.ram_mb > 4096 else 1.5
        battery_factor = 1.0 if device.battery_level > 50 else 1.3
        
        inference_time = base_time * cpu_factor * ram_factor * battery_factor
        
        return inference_time
    
    def get_all_devices(self) -> List[Dict]:
        """Get all device profiles"""
        return [self.get_device_metrics(device_id) for device_id in self.devices.keys()]


# Example usage
if __name__ == "__main__":
    simulator = EdgeDeviceSimulator()
    
    # Create devices
    devices = [
        simulator.create_device("sensor_001", "iot_sensor"),
        simulator.create_device("pi_001", "raspberry_pi"),
        simulator.create_device("jetson_001", "jetson_nano"),
    ]
    
    print("Created devices:")
    for device in devices:
        print(f"  {device.device_id}: {device.device_type}")
        print(f"    Battery: {device.battery_level:.1f}%")
        print(f"    Latency: {device.network_latency_ms:.1f}ms")
    
    # Simulate state changes
    print("\nSimulating state changes...")
    time.sleep(1)
    
    for device_id in ["sensor_001", "pi_001", "jetson_001"]:
        updated = simulator.update_device_state(device_id)
        metrics = simulator.get_device_metrics(device_id)
        print(f"\n{device_id} updated:")
        print(f"  Battery: {metrics['battery_level']:.1f}%")
        print(f"  Latency: {metrics['network_latency_ms']:.1f}ms")