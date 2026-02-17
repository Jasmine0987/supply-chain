from fastapi import APIRouter

from app.api.v1 import (
    auth,
    users,
    shipments,
    inventory,
    warehouses,
    carriers,
    alerts,
    iot,
    profile,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(shipments.router, prefix="/shipments", tags=["shipments"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(warehouses.router, prefix="/warehouses", tags=["warehouses"])
api_router.include_router(carriers.router, prefix="/carriers", tags=["carriers"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(iot.router, prefix="/iot", tags=["iot"])
api_router.include_router(profile.router, tags=["profile"])
