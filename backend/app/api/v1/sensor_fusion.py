"""
API Endpoints for Multi-Modal Sensor Fusion
PATENTABLE FEATURE: Sensor fusion for damage prediction
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.sensor_fusion import (
    AddSensorReadingRequest,
    ProcessShipmentRequest,
    RealTimeAnalysisRequest,
    ShipmentReportResponse,
    RealTimeAnalysisResponse,
    SystemHealthResponse,
    CausalGraphExportResponse,
    TrainModelRequest,
    CalibrateModelRequest,
)
from app.services.ml.patentable.sensor_fusion.fusion_engine import SensorFusionEngine

router = APIRouter()

# Global fusion engine instance
fusion_engine = SensorFusionEngine()


# ------------------------------------------------------------------
# INITIALIZATION
# ------------------------------------------------------------------

@router.post("/initialize")
async def initialize_engine(
    request: TrainModelRequest = None,
    current_user: User = Depends(get_current_user)
):
    try:
        historical_data = request.historical_data if request else None
        fusion_engine.initialize(historical_data)

        return {
            "success": True,
            "message": "Sensor fusion engine initialized",
            "trained_with_data": len(historical_data) if historical_data else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------
# SENSOR INGESTION
# ------------------------------------------------------------------

@router.post("/sensor/add")
async def add_sensor_reading(
    request: AddSensorReadingRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        fusion_engine.add_sensor_reading(
            sensor_type=request.sensor_type.value,
            timestamp=datetime.fromisoformat(request.timestamp),
            value=request.value,
            metadata=request.metadata
        )

        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sensor/batch")
async def add_sensor_batch(
    readings: List[AddSensorReadingRequest],
    current_user: User = Depends(get_current_user)
):
    try:
        for reading in readings:
            fusion_engine.add_sensor_reading(
                sensor_type=reading.sensor_type.value,
                timestamp=datetime.fromisoformat(reading.timestamp),
                value=reading.value,
                metadata=reading.metadata
            )

        return {"success": True, "count": len(readings)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------
# SHIPMENT PROCESSING (🔥 FIXED 🔥)
# ------------------------------------------------------------------

@router.post("/shipment/process", response_model=ShipmentReportResponse)
async def process_shipment(
    request: ProcessShipmentRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Process shipment sensor data and ALWAYS return frontend-safe fields
    """
    try:
        # Normalize timestamps
        sensor_data = []
        for reading in request.sensor_data:
            r = reading.copy()
            r["timestamp"] = datetime.fromisoformat(r["timestamp"])
            sensor_data.append(r)

        # Run fusion engine
        report = fusion_engine.process_shipment(
            shipment_id=request.shipment_id,
            sensor_data=sensor_data
        ) or {}

        # ---------------------------------------------------------
        # 🔒 HARD GUARANTEES FOR FRONTEND
        # ---------------------------------------------------------

        overall_risk_score = float(report.get("overall_risk_score", 0.0))
        damage_probability = float(report.get("damage_probability", 0.0))
        critical_events = report.get("critical_events", [])

        anomalies = report.get("anomalies", {
            "count": len(critical_events),
            "details": critical_events
        })

        recommendations = report.get(
            "recommendations",
            ["✓ Shipment conditions within normal parameters"]
        )

        return ShipmentReportResponse(
            shipment_id=request.shipment_id,
            overall_risk_score=round(overall_risk_score, 2),
            damage_probability=round(damage_probability, 2),
            critical_events=critical_events,
            anomalies=anomalies,
            recommendations=recommendations
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------
# REAL-TIME ANALYSIS
# ------------------------------------------------------------------

@router.post("/analyze/realtime", response_model=RealTimeAnalysisResponse)
async def analyze_realtime(
    request: RealTimeAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        analysis = fusion_engine.analyze_real_time(request.sensor_readings)

        return RealTimeAnalysisResponse(
            damage_probability=analysis.get("damage_probability", 0.0),
            overall_risk_score=analysis.get("overall_risk_score", 0.0),
            risk_level=analysis.get("risk_level", "LOW"),
            sensor_contributions=analysis.get("sensor_contributions", {}),
            recommendations=analysis.get("recommendations", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------
# REPORTS & DIAGNOSTICS
# ------------------------------------------------------------------

@router.get("/shipment/{shipment_id}", response_model=ShipmentReportResponse)
async def get_shipment_report(
    shipment_id: str,
    current_user: User = Depends(get_current_user)
):
    report = fusion_engine.get_fusion_summary(shipment_id)

    if not report:
        raise HTTPException(status_code=404, detail="Shipment not found")

    return ShipmentReportResponse(
        shipment_id=shipment_id,
        overall_risk_score=report.get("overall_risk_score", 0.0),
        damage_probability=report.get("damage_probability", 0.0),
        critical_events=report.get("critical_events", []),
        anomalies=report.get("anomalies", {}),
        recommendations=report.get("recommendations", [])
    )


@router.get("/causal-graph", response_model=CausalGraphExportResponse)
async def get_causal_graph(
    current_user: User = Depends(get_current_user)
):
    return fusion_engine.export_causal_graph()


@router.get("/health", response_model=SystemHealthResponse)
async def get_system_health(
    current_user: User = Depends(get_current_user)
):
    return fusion_engine.get_system_health()


@router.post("/calibrate")
async def calibrate_damage_model(
    request: CalibrateModelRequest,
    current_user: User = Depends(get_current_user)
):
    fusion_engine.damage_predictor.calibrate_model(
        training_data=request.training_data,
        actual_damages=request.actual_damages
    )

    return {"success": True}


@router.get("/statistics")
async def get_statistics(
    current_user: User = Depends(get_current_user)
):
    return {
        "system_health": fusion_engine.get_system_health(),
        "alignment_quality": fusion_engine.aligner.get_alignment_quality(),
        "damage_statistics": fusion_engine.damage_predictor.get_damage_statistics()
    }
