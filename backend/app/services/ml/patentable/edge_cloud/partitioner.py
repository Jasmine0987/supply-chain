# backend/app/services/ml/patentable/edge_cloud/partitioner.py

from typing import Dict, Tuple, Optional, List
from enum import Enum

from app.services.ml.patentable.edge_cloud.layer_analyzer import (
    NeuralNetworkAnalyzer,
)
from app.services.ml.patentable.edge_cloud.edge_simulator import (
    EdgeDeviceSimulator,
)


class OptimizationObjective(Enum):
    MINIMIZE_LATENCY = "latency"
    MINIMIZE_ENERGY = "energy"
    MINIMIZE_COST = "cost"
    BALANCED = "balanced"


class EdgeCloudPartitioner:
    """
    Edge–Cloud ML Partitioning Engine
    """

    def __init__(
        self,
        analyzer: NeuralNetworkAnalyzer,
        simulator: EdgeDeviceSimulator,
    ):
        self.analyzer = analyzer
        self.simulator = simulator

        self.device_capacities = {
            "iot_sensor": 1e6,
            "raspberry_pi": 10e6,
            "jetson_nano": 472e9,
            "smartphone": 100e9,
        }

        self.cloud_capacity = 1e12  # FLOPs/sec

    # ------------------------------------------------------------
    # CORE COST MODEL
    # ------------------------------------------------------------

    def calculate_partition_cost(
        self,
        partition_point: int,
        device_id: str,
        objective: OptimizationObjective,
    ) -> Dict[str, float]:

        device = self.simulator.devices[device_id]
        metrics = self.simulator.get_device_metrics(device_id)

        device_capacity = self.device_capacities.get(
            device.device_type, 10e6
        )

        # --- EDGE LATENCY ---
        edge_latency = sum(
            self.analyzer.calculate_layer_latency(i, device_capacity)
            for i in range(partition_point + 1)
        )

        # --- CLOUD LATENCY ---
        cloud_latency = sum(
            self.analyzer.calculate_layer_latency(
                i, self.cloud_capacity
            )
            for i in range(partition_point + 1, len(self.analyzer.layers))
        )

        # --- DATA TRANSFER ---
        transfer_latency = self.analyzer.estimate_data_transfer_cost(
            partition_point, metrics["bandwidth_mbps"]
        )

        network_latency = (metrics["network_latency_ms"] / 1000.0) * 2

        total_latency = (
            edge_latency + cloud_latency + transfer_latency + network_latency
        )

        # --- ENERGY ---
        battery_factor = 1.0 if metrics["is_charging"] else 2.0
        energy_cost = edge_latency * battery_factor

        # --- COST ---
        monetary_cost = cloud_latency * 0.0001

        privacy_score = (partition_point + 1) / len(self.analyzer.layers)

        if objective == OptimizationObjective.MINIMIZE_LATENCY:
            combined_cost = total_latency
        elif objective == OptimizationObjective.MINIMIZE_ENERGY:
            combined_cost = energy_cost
        elif objective == OptimizationObjective.MINIMIZE_COST:
            combined_cost = monetary_cost
        else:
            combined_cost = (
                0.4 * total_latency
                + 0.3 * energy_cost
                + 0.2 * monetary_cost
                + 0.1 * (1 - privacy_score)
            )

        return {
            "partition_point": partition_point,
            "total_latency_ms": total_latency * 1000,
            "edge_latency_ms": edge_latency * 1000,
            "cloud_latency_ms": cloud_latency * 1000,
            "transfer_latency_ms": transfer_latency * 1000,
            "network_latency_ms": network_latency * 1000,
            "energy_cost": energy_cost,
            "monetary_cost": monetary_cost,
            "privacy_score": privacy_score,
            "combined_cost": combined_cost,
            "device_battery": metrics["battery_level"],
        }

    # ------------------------------------------------------------
    # OPTIMIZATION
    # ------------------------------------------------------------

    def find_optimal_partition(
        self,
        device_id: str,
        objective: OptimizationObjective = OptimizationObjective.BALANCED,
        constraints: Optional[Dict] = None,
    ) -> Tuple[int, Dict]:

        constraints = constraints or {}
        candidates = self.analyzer.identify_partition_candidates()

        best_point = None
        best_cost = float("inf")
        evaluated = []

        for p in candidates:
            cost = self.calculate_partition_cost(p, device_id, objective)

            if (
                constraints.get("max_latency_ms")
                and cost["total_latency_ms"] > constraints["max_latency_ms"]
            ):
                continue

            if (
                constraints.get("min_battery")
                and cost["device_battery"] < constraints["min_battery"]
            ):
                cost["combined_cost"] *= 1.5

            evaluated.append(cost)

            if cost["combined_cost"] < best_cost:
                best_cost = cost["combined_cost"]
                best_point = p

        if best_point is None:
            best_point = candidates[0]
            best_details = self.calculate_partition_cost(
                best_point, device_id, objective
            )
        else:
            best_details = next(
                c for c in evaluated if c["partition_point"] == best_point
            )

        best_details["objective"] = objective.value
        best_details["all_candidates"] = evaluated

        return best_point, best_details

    # ------------------------------------------------------------
    # DEPLOYMENT PLAN
    # ------------------------------------------------------------

    def generate_partition_plan(
        self, device_id: str, partition_point: int
    ) -> Dict:

        edge_layers = []
        cloud_layers = []

        for i, layer in enumerate(self.analyzer.layers):
            info = {
                "layer_id": layer.layer_id,
                "layer_name": layer.layer_name,
                "layer_type": layer.layer_type,
                "memory_mb": layer.memory_mb,
            }

            if i <= partition_point:
                edge_layers.append(info)
            else:
                cloud_layers.append(info)

        return {
            "device_id": device_id,
            "partition_point": partition_point,
            "edge_deployment": {
                "layers": edge_layers,
                "total_memory_mb": sum(l["memory_mb"] for l in edge_layers),
            },
            "cloud_deployment": {
                "layers": cloud_layers,
                "total_memory_mb": sum(l["memory_mb"] for l in cloud_layers),
            },
            "transfer_layer": self.analyzer.layers[partition_point].layer_name,
        }
