from app.schemas.user import (
    User,
    UserCreate,
    UserUpdate,
    UserLogin,
    UserInToken,
    Token,
)
from app.schemas.warehouse import Warehouse, WarehouseCreate, WarehouseUpdate
from app.schemas.carrier import Carrier, CarrierCreate, CarrierUpdate
from app.schemas.shipment import Shipment, ShipmentCreate, ShipmentUpdate
from app.schemas.inventory import Inventory, InventoryCreate, InventoryUpdate
from app.schemas.alert import (
    Alert,
    AlertCreate,
    AlertUpdate,
    AlertList,
    AlertStats,
)
from app.schemas.iot_sensor import IoTSensor, IoTSensorCreate, IoTSensorUpdate

__all__ = [
    # User schemas
    "User",
    "UserCreate",
    "UserUpdate",
    "UserLogin",
    "UserInToken",
    "Token",
    # Warehouse schemas
    "Warehouse",
    "WarehouseCreate",
    "WarehouseUpdate",
    # Carrier schemas
    "Carrier",
    "CarrierCreate",
    "CarrierUpdate",
    # Shipment schemas
    "Shipment",
    "ShipmentCreate",
    "ShipmentUpdate",
    # Inventory schemas
    "Inventory",
    "InventoryCreate",
    "InventoryUpdate",
    # Alert schemas
    "Alert",
    "AlertCreate",
    "AlertUpdate",
    "AlertList",
    "AlertStats",
    # IoT Sensor schemas
    "IoTSensor",
    "IoTSensorCreate",
    "IoTSensorUpdate",
]