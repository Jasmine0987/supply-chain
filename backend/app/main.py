# backend/app/main.py

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from typing import List
from datetime import datetime
import logging
import asyncio

# -------------------------------------------------
# Core imports
# -------------------------------------------------
from app.core.config import settings
from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.services.iot import start_mqtt_handler, stop_mqtt_handler
from app.services.realtime.websocket_manager import manager
from app.services.realtime.mqtt_handler import mqtt_handler

# API Routers
from app.api.v1 import (
    auth,
    users,
    profile,
    anomaly,
    routing,
    shipments,
    inventory,
    warehouses,
    carriers,
    alerts,
    iot,
    forecasting,
    temporal_graph,
    probabilistic_inventory,
    edge_cloud,
    sensor_fusion,
    topology_gnn,
)

# -------------------------------------------------
# Logging configuration
# -------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------------------------------
# WebSocket Connection Manager
# -------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"🔌 WebSocket connected ({len(self.active_connections)})")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"❌ WebSocket disconnected ({len(self.active_connections)})")

    async def broadcast(self, message: dict):
        disconnected = []
        for ws in self.active_connections:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(ws)

        for ws in disconnected:
            self.disconnect(ws)

manager = ConnectionManager()

# -------------------------------------------------
# Lifespan (Startup / Shutdown)
# -------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting application")
    logger.info(f"ENV={settings.ENVIRONMENT} DEBUG={settings.DEBUG}")

    # Database init
    try:
        db = SessionLocal()
        init_db(db)
        db.close()
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.error(f"❌ Database init failed: {e}")

    # MQTT
    try:
        start_mqtt_handler()
        logger.info("✅ MQTT handler started")
    except Exception as e:
        logger.error(f"❌ MQTT start failed: {e}")

    yield

    logger.info("🛑 Shutting down application")

    try:
        stop_mqtt_handler()
        logger.info("✅ MQTT handler stopped")
    except Exception as e:
        logger.error(f"❌ MQTT shutdown failed: {e}")

# -------------------------------------------------
# FastAPI App
# -------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Predictive Supply Chain Analytics Platform with IoT",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    json_encoders={datetime: lambda v: v.isoformat()},
)

# -------------------------------------------------
# Middleware
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Routers
# -------------------------------------------------
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(profile.router, prefix="/api/v1/profile", tags=["Profile"])
app.include_router(anomaly.router, prefix="/api/v1/anomaly", tags=["Anomaly"])
app.include_router(routing.router, prefix="/api/v1/routing", tags=["Routing"])
app.include_router(shipments.router, prefix="/api/v1/shipments", tags=["Shipments"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(warehouses.router, prefix="/api/v1/warehouses", tags=["Warehouses"])
app.include_router(carriers.router, prefix="/api/v1/carriers", tags=["Carriers"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(iot.router, prefix="/api/v1/iot", tags=["IoT"])
app.include_router(forecasting.router, prefix="/api/v1/forecasting", tags=["Forecasting"])

app.include_router(
    temporal_graph.router,
    prefix="/api/v1/temporal-graph",
    tags=["temporal-knowledge-graph"],
)
app.include_router(
    probabilistic_inventory.router,
    prefix="/api/v1/probabilistic-inventory",
    tags=["probabilistic-inventory"],
)
app.include_router(
    edge_cloud.router,
    prefix="/api/v1/edge-cloud",
    tags=["edge-cloud-partitioning"],
)
app.include_router(
    sensor_fusion.router,
    prefix="/api/v1/sensor-fusion",
    tags=["sensor-fusion"],
)
app.include_router(
    topology_gnn.router,
    prefix="/api/v1/topology-gnn",
    tags=["topology-gnn"],
)

# -------------------------------------------------
# WebSocket Endpoint
# -------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time sensor data"""
    await manager.connect(websocket)
    
    try:
        while True:
            # Keep connection alive, don't do anything with received messages
            data = await websocket.receive_text()
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        manager.disconnect(websocket)


# -------------------------------------------------
# Background IoT Sensor Broadcast
# -------------------------------------------------
async def broadcast_sensor_updates():
    from app.models.iot_sensor import IoTSensor

    while True:
        try:
            await asyncio.sleep(5)
            db = SessionLocal()

            sensors = (
                db.query(IoTSensor)
                .filter(IoTSensor.is_active == True)
                .all()
            )

            payload = [
                {
                    "id": s.id,
                    "device_id": s.device_id,
                    "sensor_type": s.sensor_type,
                    "last_reading": s.last_reading,
                    "battery_level": s.battery_level,
                    "signal_strength": s.signal_strength,
                }
                for s in sensors
            ]

            db.close()

            if payload:
                await manager.broadcast(
                    {"type": "sensor_update", "data": payload}
                )

        except Exception as e:
            logger.error(f"❌ Sensor broadcast error: {e}")

@app.on_event("startup")
async def startup_event():
    """Initialize services when application starts"""
    print("=" * 80)
    print("🚀 Starting Supply Chain Analytics API")
    print("=" * 80)
    
    # Get the current event loop
    loop = asyncio.get_event_loop()
    
    # Set event loop in MQTT handler (CRITICAL FOR BROADCASTING)
    mqtt_handler.set_event_loop(loop)
    print("✅ Event loop set in MQTT handler")
    
    # Set WebSocket manager in MQTT handler
    mqtt_handler.set_websocket_manager(manager)
    
    # Connect to MQTT broker
    print("📡 Connecting to MQTT broker...")
    if mqtt_handler.connect():
        mqtt_handler.start()
        print("✅ MQTT handler connected and started")
        print(f"   Broker: {mqtt_handler.broker_host}:{mqtt_handler.broker_port}")
        print(f"   Subscribed to: sensors/#")
    else:
        print("❌ Failed to connect MQTT handler")
        print("   IoT features will not work!")
    
    print("=" * 80)
    print("✅ Application startup complete")
    print(f"   API Docs: http://localhost:8000/docs")
    print(f"   WebSocket: ws://localhost:8000/ws")
    print("=" * 80)

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup when application stops"""
    print("=" * 80)
    print("🛑 Shutting down Supply Chain Analytics API")
    print("=" * 80)
    
    # Stop MQTT handler
    mqtt_handler.stop()
    print("✅ MQTT handler stopped")
    
    print("=" * 80)
    print("✅ Application shutdown complete")
    print("=" * 80)
    
# -------------------------------------------------
# Health & Root
# -------------------------------------------------
@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Supply Chain Analytics API",
        "docs": "/docs",
        "health": "/health",
        "websocket": "/ws",
        "status": "running",
    }
@app.get("/api/v1/iot/status")
async def get_iot_status():
    """Get IoT system status"""
    return {
        "mqtt": {
            "connected": mqtt_handler.client.is_connected(),
            "broker": f"{mqtt_handler.broker_host}:{mqtt_handler.broker_port}",
            "topics": ["sensors/#"]
        },
        "websocket": {
            "active_connections": manager.get_connection_count()
        },
        "status": "operational" if mqtt_handler.client.is_connected() else "mqtt_disconnected"
    }
    

@app.post("/api/v1/iot/test-broadcast")
async def test_broadcast():  # No auth parameters
    """Test broadcast"""
    test_message = {
        "type": "sensor_update",
        "data": {
            "sensor_id": "TEST-001",
            "sensor_type": "temperature",
            "value": 99.9,
            "timestamp": datetime.utcnow().isoformat(),
            "battery_level": 100,
            "signal_strength": 100
        }
    }
    
    await manager.broadcast(test_message)
    
    return {
        "message": "Test sent",
        "clients": manager.get_connection_count()
    }

    
@app.get("/api/v1/iot/sensors")
async def get_sensors():
    """Get list of active sensors"""
    # This would normally query your database
    # For now, return mock data
    return {
        "sensors": [
            {
                "id": "SENSOR-CHI-DC-01-TEMP-001",
                "type": "temperature",
                "location": "Chicago DC",
                "status": "active"
            },
            {
                "id": "SENSOR-CHI-DC-01-HUM-001",
                "type": "humidity",
                "location": "Chicago DC",
                "status": "active"
            }
        ],
        "total": 6
    }
    
# -------------------------------------------------
# Exception Handlers
# -------------------------------------------------
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "Not Found"})

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"🔥 Server error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

# -------------------------------------------------
# Run (Local)
# -------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
