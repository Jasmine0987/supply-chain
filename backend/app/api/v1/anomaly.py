from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import logging
import traceback

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.anomaly import (
    AnomalyDetectionRequest,
    AnomalyResponse,
    TrainAnomalyModelRequest,
    SensorThresholdAlert
)
from app.services.ml.forecasting.data_preprocessor import DataPreprocessor
from app.services.ml.anomaly.isolation_forest import IsolationForestDetector
from app.services.ml.anomaly.statistical_detector import StatisticalAnomalyDetector
from app.services.ml.anomaly.threshold_alerts import ThresholdAlertGenerator

router = APIRouter()

# Set up logging
logger = logging.getLogger(__name__)


@router.post("/detect", response_model=AnomalyResponse)
async def detect_anomalies(
    request: AnomalyDetectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Detect anomalies using specified method
    
    Supports multiple detection methods:
    - isolation_forest: ML-based anomaly detection
    - z_score: Statistical z-score method
    - iqr: Interquartile range method
    - mad: Median absolute deviation
    - ensemble: Combination of multiple methods
    """
    try:
        logger.info(f"🔍 Anomaly detection request: method={request.method}, days={request.days}")
        
        # Get historical data
        preprocessor = DataPreprocessor(db)
        df = preprocessor.get_historical_demand(
            product_sku=request.product_sku,
            warehouse_id=request.warehouse_id,
            days=request.days
        )
        
        logger.info(f"📊 Retrieved {len(df)} data points")
        
        if df.empty or len(df) < 30:
            logger.warning(f"⚠️ Insufficient data: {len(df)} points (need 30+)")
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient data for anomaly detection. Got {len(df)} points, need at least 30 days."
            )
        
        anomalies = []
        severity_dist = {'low': 0, 'medium': 0, 'high': 0, 'critical': 0}
        
        # Apply detection method
        if request.method == "isolation_forest":
            logger.info("🤖 Using Isolation Forest detection")
            detector = IsolationForestDetector()
            
            # Try to load existing model
            try:
                detector.load_model()
                logger.info("✅ Loaded existing model")
            except Exception as load_error:
                # Train new model
                logger.info(f"⚠️ Could not load model ({str(load_error)}), training new one...")
                detector.train(df, contamination=request.contamination)
                detector.save_model()
                logger.info("✅ New model trained and saved")
            
            anomalies = detector.get_anomalies_with_context(df)
            
            # Count severity
            for anomaly in anomalies:
                severity_dist[anomaly['severity']] += 1
        
        elif request.method in ["z_score", "iqr", "mad", "ensemble"]:
            logger.info(f"📊 Using statistical method: {request.method}")
            stat_detector = StatisticalAnomalyDetector()
            
            if request.method == "z_score":
                anomalies = stat_detector.z_score_detection(
                    df,
                    threshold=request.threshold
                )
            elif request.method == "iqr":
                anomalies = stat_detector.iqr_detection(df, multiplier=1.5)
            elif request.method == "mad":
                anomalies = stat_detector.mad_detection(
                    df,
                    threshold=request.threshold
                )
            elif request.method == "ensemble":
                anomalies = stat_detector.ensemble_detection(df, min_methods=2)
            
            # Count severity
            for anomaly in anomalies:
                severity = anomaly.get('severity', 'medium')
                severity_dist[severity] += 1
        
        else:
            logger.error(f"❌ Unknown method: {request.method}")
            raise HTTPException(
                status_code=400,
                detail=f"Unknown method: {request.method}. Use: isolation_forest, z_score, iqr, mad, or ensemble"
            )
        
        logger.info(f"✅ Detection complete: {len(anomalies)} anomalies found")
        
        return AnomalyResponse(
            method=request.method,
            total_samples=len(df),
            anomalies_detected=len(anomalies),
            anomaly_percentage=(len(anomalies) / len(df)) * 100 if len(df) > 0 else 0,
            anomalies=anomalies,
            severity_distribution=severity_dist,
            generated_at=datetime.utcnow()
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the full error with traceback
        logger.error(f"❌ Error in anomaly detection:")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Anomaly detection failed: {type(e).__name__}: {str(e)}"
        )


@router.post("/train")
async def train_anomaly_model(
    request: TrainAnomalyModelRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Train anomaly detection model
    
    Trains a new model on historical data for better detection accuracy.
    """
    try:
        logger.info(f"🎓 Training request: method={request.method}, data_source={request.data_source}, days={request.historical_days}")
        
        # Get training data
        preprocessor = DataPreprocessor(db)
        df = preprocessor.get_historical_demand(days=request.historical_days)
        
        logger.info(f"📊 Retrieved {len(df)} training samples")
        
        if len(df) < 100:
            logger.warning(f"⚠️ Insufficient training data: {len(df)} points")
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient data for training. Got {len(df)} samples, need at least 100."
            )
        
        # Train model
        if request.method == "isolation_forest":
            logger.info("🤖 Training Isolation Forest model...")
            detector = IsolationForestDetector()
            stats = detector.train(df, contamination=request.contamination)
            model_path = detector.save_model()
            
            logger.info(f"✅ Training complete: {stats['anomalies_detected']} anomalies detected ({stats['anomaly_percentage']:.2f}%)")
            
            return {
                "success": True,
                "message": "Anomaly detection model trained successfully",
                "method": request.method,
                "stats": stats,
                "model_path": model_path
            }
        else:
            logger.info(f"ℹ️ Statistical method {request.method} doesn't require training")
            return {
                "success": True,
                "message": f"Statistical method {request.method} doesn't require training",
                "method": request.method
            }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the full error with traceback
        logger.error(f"❌ Error in model training:")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Model training failed: {type(e).__name__}: {str(e)}"
        )


@router.post("/check-sensor-threshold", response_model=SensorThresholdAlert)
async def check_sensor_threshold(
    sensor_id: int,
    sensor_type: str,
    value: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Check if sensor reading violates thresholds
    
    Used for real-time threshold monitoring.
    """
    try:
        logger.info(f"🌡️ Checking threshold: sensor_id={sensor_id}, type={sensor_type}, value={value}")
        
        alert_generator = ThresholdAlertGenerator(db)
        alert = alert_generator.check_sensor_thresholds(
            sensor_id=sensor_id,
            value=value,
            sensor_type=sensor_type
        )
        
        if alert:
            logger.info(f"⚠️ Threshold violation detected: {alert['severity']}")
            return SensorThresholdAlert(
                sensor_id=sensor_id,
                sensor_type=sensor_type,
                current_value=value,
                threshold_type=alert.get('threshold_type', ''),
                threshold_value=alert.get('threshold_value', 0),
                severity=alert['severity'],
                message=alert['message'],
                timestamp=datetime.utcnow()
            )
        else:
            logger.info("✅ No threshold violation")
            raise HTTPException(
                status_code=404,
                detail="No threshold violation detected"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error checking sensor threshold:")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Threshold check failed: {type(e).__name__}: {str(e)}"
        )


@router.get("/statistics")
async def get_anomaly_statistics(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get anomaly detection statistics
    
    Returns summary statistics for detected anomalies over time period.
    """
    try:
        logger.info(f"📈 Getting statistics for last {days} days")
        
        preprocessor = DataPreprocessor(db)
        df = preprocessor.get_historical_demand(days=days)
        
        logger.info(f"📊 Retrieved {len(df)} data points")
        
        if len(df) == 0:
            logger.warning("⚠️ No data available for statistics")
            return {
                "period_days": days,
                "total_data_points": 0,
                "anomalies_detected": 0,
                "anomaly_rate": 0,
                "severity_distribution": {
                    'low': 0,
                    'medium': 0,
                    'high': 0,
                    'critical': 0
                }
            }
        
        # Quick detection for stats
        stat_detector = StatisticalAnomalyDetector()
        anomalies = stat_detector.z_score_detection(df, threshold=3.0)
        
        logger.info(f"✅ Found {len(anomalies)} anomalies ({len(anomalies)/len(df)*100:.2f}%)")
        
        return {
            "period_days": days,
            "total_data_points": len(df),
            "anomalies_detected": len(anomalies),
            "anomaly_rate": (len(anomalies) / len(df)) * 100 if len(df) > 0 else 0,
            "severity_distribution": {
                severity: len([a for a in anomalies if a.get('severity') == severity])
                for severity in ['low', 'medium', 'high', 'critical']
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting statistics:")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Statistics retrieval failed: {type(e).__name__}: {str(e)}"
        )