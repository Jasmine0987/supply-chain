from fastapi import APIRouter, Depends, HTTPException
from typing import List
import random

from app.api.deps import get_current_user
from app.models.user import User

from app.schemas.edge_cloud import (
    CreateDeviceRequest,
    DeviceMetricsResponse,
    PartitionRequest,
    PartitionResponse,
    AdaptiveRepartitionRequest,
    AdaptiveRepartitionResponse,
    LayerAnalysisResponse,
    ComparePartitionsRequest,
)

from app.services.ml.patentable.edge_cloud.edge_simulator import EdgeDeviceSimulator
from app.services.ml.patentable.edge_cloud.partitioner import (
    EdgeCloudPartitioner,
    OptimizationObjective,
)

router = APIRouter(prefix="/edge-cloud", tags=["Edge–Cloud AI"])

# ─────────────────────────────────────────────────────────────
# GLOBAL SIMULATOR
# ─────────────────────────────────────────────────────────────
device_simulator = EdgeDeviceSimulator()


# ─────────────────────────────────────────────────────────────
# DEVICE MANAGEMENT  ✅ FIXED
# ─────────────────────────────────────────────────────────────
@router.post("/devices", response_model=DeviceMetricsResponse)
async def create_edge_device(
    request: CreateDeviceRequest,
    current_user: User = Depends(get_current_user),
):
    # Prevent duplicates
    if device_simulator.get_device(request.device_id):
        raise HTTPException(status_code=400, detail="Device already exists")

    device = device_simulator.create_device(
        device_id=request.device_id,
        device_type=request.device_type.value,
        battery_level=random.uniform(70, 100),
        network_latency_ms=random.uniform(20, 120),
    )

    return DeviceMetricsResponse(
        device_id=device.device_id,
        device_type=device.device_type,
        battery_level=device.battery_level,
        network_type=device.network_type,
        network_latency_ms=device.network_latency_ms,
        bandwidth=random.uniform(50, 150),
        cpu_usage=random.uniform(20, 80),
        ram_usage=random.uniform(2000, 6000),
        status="charging" if random.random() > 0.5 else "discharging",
    )


@router.get("/devices", response_model=List[DeviceMetricsResponse])
async def list_devices(
    current_user: User = Depends(get_current_user),
):
    devices = device_simulator.get_all_devices()

    return [
        DeviceMetricsResponse(
            device_id=d["device_id"],
            device_type=d["device_type"],
            battery_level=d["battery_level"],
            network_type=d.get("network_type", "WiFi"),
            network_latency_ms=d["network_latency_ms"],
            bandwidth=d.get("bandwidth", random.uniform(50, 150)),
            cpu_usage=d.get("cpu_usage", random.uniform(20, 80)),
            ram_usage=d.get("ram_usage", random.uniform(2000, 6000)),
            status=d.get("status", "charging"),
        )
        for d in devices
    ]


# ─────────────────────────────────────────────────────────────
# NETWORK ANALYSIS
# ─────────────────────────────────────────────────────────────
@router.get("/networks/{network_type}/analyze", response_model=LayerAnalysisResponse)
async def analyze_network(
    network_type: str,
    current_user: User = Depends(get_current_user),
):
    return LayerAnalysisResponse(
        total_layers=10,
        total_parameters=1_000_000,
        total_flops=5_000_000_000,
        total_memory_mb=100.0,
        layers=[
            {
                "layer_index": i,
                "layer_name": f"layer_{i}",
                "layer_type": "Conv2d" if i < 6 else "Linear",
                "params": 100_000 * (i + 1),
                "flops": 500_000_000 * (i + 1),
                "memory_mb": 10.0 * (i + 1),
                "time_ms": 5.0 * (i + 1),
            }
            for i in range(10)
        ],
        partition_candidates=[3, 5, 7],
    )


# ─────────────────────────────────────────────────────────────
# PARTITION OPTIMIZATION  ✅ FIXED
# ─────────────────────────────────────────────────────────────
@router.post("/partition/optimize", response_model=PartitionResponse)
async def optimize_partition(
    request: PartitionRequest,
    current_user: User = Depends(get_current_user),
):
    device = device_simulator.get_device(request.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    battery = device["battery_level"]
    latency = device["network_latency_ms"]

    if battery < 30 or latency > 100:
        point = 3
    elif battery > 70 and latency < 50:
        point = 7
    else:
        point = 5

    return PartitionResponse(
        device_id=request.device_id,
        optimal_partition_point=point,
        objective=request.objective.value,
        cost_details={
            "battery_level": battery,
            "network_latency_ms": latency,
        },
        deployment_plan={
            "edge_layers": list(range(point + 1)),
            "cloud_layers": list(range(point + 1, 10)),
            "recommendation": f"Optimal split at layer {point}",
        },
    )


# ─────────────────────────────────────────────────────────────
# ADAPTIVE REPARTITIONING
# ─────────────────────────────────────────────────────────────
@router.post("/partition/adaptive", response_model=AdaptiveRepartitionResponse)
async def adaptive_repartition(
    request: AdaptiveRepartitionRequest,
    current_user: User = Depends(get_current_user),
):
    return AdaptiveRepartitionResponse(
        new_partition=4,
        reason="Battery dropped below threshold",
        expected_latency_change_ms=-15,
        expected_energy_change_percent=-10,
    )


# ─────────────────────────────────────────────────────────────
# PARTITION COMPARISON
# ─────────────────────────────────────────────────────────────
@router.post("/partition/compare")
async def compare_partitions(
    request: ComparePartitionsRequest,
    current_user: User = Depends(get_current_user),
):
    comparisons = []
    for point in request.partition_points:
        comparisons.append({
            "partition_point": point,
            "total_latency_ms": abs(5 - point) * 20 + 100,
        })

    best = min(comparisons, key=lambda x: x["total_latency_ms"])

    return {
        "device_id": request.device_id,
        "objective": request.objective.value,
        "comparisons": comparisons,
        "recommended_partition": best["partition_point"],
    }


# ─────────────────────────────────────────────────────────────
# STATISTICS
# ─────────────────────────────────────────────────────────────
@router.get("/statistics")
async def get_partition_statistics(
    current_user: User = Depends(get_current_user),
):
    devices = device_simulator.get_all_devices()

    if not devices:
        return {
            "total_devices": 0,
            "average_battery": 0,
            "average_latency": 0,
        }

    return {
        "total_devices": len(devices),
        "average_battery": sum(d["battery_level"] for d in devices) / len(devices),
        "average_latency": sum(d["network_latency_ms"] for d in devices) / len(devices),
    }
