
import uuid
import sys
import os
from datetime import datetime, timedelta
from random import choice, randint, uniform

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base

from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.carrier import Carrier
from app.models.shipment import Shipment
from app.models.inventory import Inventory
from app.models.alert import Alert
from app.models.iot_sensor import IoTSensor

from app.core.security import get_password_hash


# --------------------------------------------------
# CREATE TABLES
# --------------------------------------------------
def create_tables():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")


# --------------------------------------------------
# SEED USERS
# --------------------------------------------------
def seed_users(db: Session):
    print("\nSeeding users...")

    users_data = [
        {
            "email": "admin@supplychain.com",
            "username": "admin",
            "full_name": "System Administrator",
            "password": "admin123",
            "role": "admin",
            "is_superuser": True
        },
        {
            "email": "manager@supplychain.com",
            "username": "manager",
            "full_name": "Operations Manager",
            "password": "manager123",
            "role": "manager",
            "is_superuser": False
        },
        {
            "email": "operator@supplychain.com",
            "username": "operator",
            "full_name": "Warehouse Operator",
            "password": "operator123",
            "role": "operator",
            "is_superuser": False
        },
        {
            "email": "viewer@supplychain.com",
            "username": "viewer",
            "full_name": "Dashboard Viewer",
            "password": "viewer123",
            "role": "viewer",
            "is_superuser": False
        }
    ]

    for user_data in users_data:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            user = User(
                email=user_data["email"],
                username=user_data["username"],
                full_name=user_data["full_name"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
                is_superuser=user_data["is_superuser"],
                is_active=True
            )
            db.add(user)
            print(f"  ✓ Created user: {user.email} (password: {user_data['password']})")

    db.commit()
    print("✓ Users seeded successfully")


# --------------------------------------------------
# SEED WAREHOUSES
# --------------------------------------------------
def seed_warehouses(db: Session):
    print("\nSeeding warehouses...")

    warehouses_data = [
        {
            "name": "Chicago Distribution Center",
            "code": "CHI-DC-01",
            "address": "1234 Industrial Parkway",
            "city": "Chicago",
            "state": "IL",
            "country": "USA",
            "postal_code": "60601",
            "latitude": 41.8781,
            "longitude": -87.6298,
            "total_capacity": 50000,
            "current_utilization": 35000,
            "warehouse_type": "distribution",
            "manager_name": "John Smith",
            "phone": "+1-312-555-0100",
            "email": "chicago@supplychain.com"
        },
        {
            "name": "Los Angeles Fulfillment Center",
            "code": "LA-FC-01",
            "address": "5678 Commerce Blvd",
            "city": "Los Angeles",
            "state": "CA",
            "country": "USA",
            "postal_code": "90001",
            "latitude": 34.0522,
            "longitude": -118.2437,
            "total_capacity": 75000,
            "current_utilization": 52000,
            "warehouse_type": "fulfillment",
            "manager_name": "Maria Garcia",
            "phone": "+1-213-555-0200",
            "email": "losangeles@supplychain.com"
        },
        {
            "name": "New York Cold Storage",
            "code": "NY-CS-01",
            "address": "9012 Port Avenue",
            "city": "New York",
            "state": "NY",
            "country": "USA",
            "postal_code": "10001",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "total_capacity": 30000,
            "current_utilization": 22000,
            "warehouse_type": "cold_storage",
            "manager_name": "David Lee",
            "phone": "+1-212-555-0300",
            "email": "newyork@supplychain.com"
        }
    ]

    for wh_data in warehouses_data:
        existing = db.query(Warehouse).filter(Warehouse.code == wh_data["code"]).first()
        if not existing:
            warehouse = Warehouse(**wh_data)
            db.add(warehouse)
            print(f"  ✓ Created warehouse: {warehouse.name} ({warehouse.code})")

    db.commit()
    print("✓ Warehouses seeded successfully")


# --------------------------------------------------
# SEED CARRIERS
# --------------------------------------------------
def seed_carriers(db: Session):
    print("\nSeeding carriers...")

    carriers_data = [
        {
            "name": "FedEx",
            "code": "FEDEX",
            "service_type": "express",
            "on_time_delivery_rate": 94.5,
            "average_delivery_days": 2.1,
            "total_shipments": 15420,
            "contact_email": "support@fedex.com",
            "contact_phone": "+1-800-463-3339"
        },
        {
            "name": "UPS",
            "code": "UPS",
            "service_type": "ground",
            "on_time_delivery_rate": 92.8,
            "average_delivery_days": 3.5,
            "total_shipments": 18750,
            "contact_email": "support@ups.com",
            "contact_phone": "+1-800-742-5877"
        }
    ]

    for carrier_data in carriers_data:
        existing = db.query(Carrier).filter(Carrier.code == carrier_data["code"]).first()
        if not existing:
            carrier = Carrier(**carrier_data)
            db.add(carrier)
            print(f"  ✓ Created carrier: {carrier.name} ({carrier.code})")

    db.commit()
    print("✓ Carriers seeded successfully")


# --------------------------------------------------
# SEED SHIPMENTS
# --------------------------------------------------
# --------------------------------------------------
# SEED SHIPMENTS
# --------------------------------------------------
# --------------------------------------------------
# UPDATED SEED SHIPMENTS - WITH RECENT ANOMALIES
# --------------------------------------------------
# This version creates anomalies WITHIN the last 90 days
# so they will be detected when using days=90 parameter
# --------------------------------------------------

def seed_shipments(db: Session):
    print("\nSeeding shipments...")

    warehouses = db.query(Warehouse).all()
    carriers = db.query(Carrier).all()

    if not warehouses or not carriers:
        print("  ⚠ Skipping shipments - need warehouses and carriers first")
        return

    statuses = ["pending", "in_transit", "delivered", "exception"]
    priorities = ["normal", "high", "urgent"]

    DAYS = 365   # Full year of historical data

    total_created = 0

    for day in range(DAYS):

        # --------------------------------------------------
        # CREATE TRAFFIC PATTERNS + ANOMALIES
        # --------------------------------------------------

        # ⭐ RECENT SPIKE DAYS (WITHIN LAST 90 DAYS)
        # These WILL be detected by anomaly detection with days=90
        if day in [15, 45, 75]:  # 15, 45, 75 days ago
            shipments_today = randint(80, 120)
            print(f"  📈 Creating SPIKE at day {day} (within detection window)")

        # ⭐ RECENT DROP DAYS (WITHIN LAST 90 DAYS)
        # These WILL be detected by anomaly detection with days=90
        elif day in [30, 60]:  # 30, 60 days ago
            shipments_today = randint(1, 3)
            print(f"  📉 Creating DROP at day {day} (within detection window)")

        # Historical spikes (for training data, outside 90-day window)
        elif day in [120, 240, 300]:
            shipments_today = randint(80, 120)

        # Historical drops (for training data, outside 90-day window)
        elif day in [150, 275]:
            shipments_today = randint(1, 3)

        # Normal business days
        else:
            shipments_today = randint(15, 35)

        shipped_date = datetime.utcnow() - timedelta(days=day)

        for _ in range(shipments_today):

            origin = choice(warehouses)
            destination = choice([w for w in warehouses if w.id != origin.id])
            carrier = choice(carriers)
            status = choice(statuses)

            shipment = Shipment(
                tracking_number = f"TRK-{uuid.uuid4().hex[:10].upper()}",
                carrier_id=carrier.id,
                origin_warehouse_id=origin.id,
                destination_warehouse_id=destination.id,
                status=status,
                priority=choice(priorities),

                current_location=f"In transit near {destination.city}",
                current_latitude=uniform(25, 48),
                current_longitude=uniform(-125, -70),

                origin_address=origin.address,
                destination_address=destination.address,

                shipped_at=shipped_date,

                estimated_delivery=shipped_date + timedelta(days=randint(2, 7)),

                actual_delivery=(
                    shipped_date + timedelta(days=randint(2, 7))
                    if status == "delivered"
                    else None
                ),

                weight=uniform(1.0, 500.0),

                dimensions={
                    "length": randint(10, 100),
                    "width": randint(10, 100),
                    "height": randint(10, 100)
                },

                package_type=choice(["box", "pallet", "envelope"]),
                shipping_cost=uniform(15.0, 500.0),
            )

            db.add(shipment)
            total_created += 1

    db.commit()

    print(f"✓ Created {total_created} shipments across {DAYS} days")
    print(f"✓ Recent anomalies (last 90 days): 3 spikes + 2 drops")
    print("✓ Shipments seeded successfully")


# --------------------------------------------------
# SEED INVENTORY
# --------------------------------------------------
def seed_inventory(db: Session):
    print("\nSeeding inventory...")

    warehouses = db.query(Warehouse).all()
    if not warehouses:
        print("  ⚠ Skipping inventory - need warehouses first")
        return

    categories = ["Electronics", "Clothing", "Food", "Pharma"]
    products = ["Laptop", "Jeans", "Canned Goods", "Medication A", "Machine Parts"]

    for warehouse in warehouses:
        for _ in range(20):
            product_name = choice(products)

            inventory = Inventory(
                sku=f"SKU-{warehouse.code}-{randint(1000, 9999)}",
                name=product_name,
                warehouse_id=warehouse.id,
                location_code=f"{choice(['A', 'B', 'C'])}-{randint(1, 20)}-{randint(1, 10)}",
                quantity_available=randint(0, 500),
                quantity_reserved=randint(0, 50),
                quantity_incoming=randint(0, 100),
                reorder_point=randint(10, 50),
                reorder_quantity=randint(50, 200),
                category=choice(categories),
                unit_cost=uniform(5.0, 500.0),
                unit_price=uniform(10.0, 1000.0),
                weight=uniform(0.1, 50.0),
                requires_refrigeration="Food" in product_name,
                is_hazardous="Chemical" in product_name,
                is_fragile="Electronics" in product_name,
                last_counted=datetime.utcnow() - timedelta(days=randint(1, 30)),
                last_restocked=datetime.utcnow() - timedelta(days=randint(1, 60))
            )

            db.add(inventory)

    db.commit()
    print("✓ Inventory seeded successfully")


# --------------------------------------------------
# SEED ALERTS
# --------------------------------------------------
def seed_alerts(db: Session):
    print("\nSeeding alerts...")

    shipments = db.query(Shipment).limit(10).all()
    warehouses = db.query(Warehouse).limit(5).all()
    inventory_items = db.query(Inventory).limit(10).all()

    alert_types = ["delay", "temperature", "stock_low"]
    severities = ["low", "medium", "high"]

    for i in range(15):
        resolved = choice([True, False])

        alert = Alert(
            alert_type=choice(alert_types),
            severity=choice(severities),
            title=f"Alert {i+1}",
            message=f"Sample alert message #{i+1}",

            shipment_id=choice(shipments).id if shipments else None,
            warehouse_id=choice(warehouses).id if warehouses else None,
            inventory_id=choice(inventory_items).id if inventory_items else None,

            # ✅ CORRECT FIELD NAME
            resolved=resolved,
            resolved_at=datetime.utcnow() if resolved else None,

            is_sent=True,
            sent_at=datetime.utcnow()
        )

        db.add(alert)

    db.commit()
    print("✓ Alerts seeded successfully")



# --------------------------------------------------
# SEED IOT SENSORS
# --------------------------------------------------
def seed_iot_sensors(db: Session):
    print("\nSeeding IoT sensors...")

    warehouses = db.query(Warehouse).all()

    for warehouse in warehouses:
        for sensor_type in ["temperature", "humidity", "door"]:
            sensor = IoTSensor(
                device_id=f"SENSOR-{warehouse.code}-{sensor_type}-{randint(100, 999)}",
                name=f"{warehouse.name} - {sensor_type.title()} Sensor",
                sensor_type=sensor_type,
                warehouse_id=warehouse.id,
                location_description=f"Zone {choice(['A', 'B', 'C'])}",
                is_active=True,
                battery_level=uniform(40.0, 100.0),
                signal_strength=uniform(50.0, 100.0),
                last_reading={"value": uniform(10, 30)},
                last_reading_at=datetime.utcnow(),
                min_threshold=10.0,
                max_threshold=30.0,
                firmware_version="v1.0.0",
                manufacturer="SensorCorp",
                model=f"SC-{sensor_type.upper()}-2000"
            )
            db.add(sensor)

    db.commit()
    print("✓ IoT sensors seeded successfully")


# --------------------------------------------------
# MAIN
# --------------------------------------------------
def main():
    print("=" * 60)
    print("DATABASE SEEDING SCRIPT")
    print("=" * 60)

    create_tables()
    db = SessionLocal()

    try:
        seed_users(db)
        seed_warehouses(db)
        seed_carriers(db)
        seed_shipments(db)
        seed_inventory(db)
        seed_alerts(db)
        seed_iot_sensors(db)

        print("\n" + "=" * 60)
        print("✓ DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 60)

    except Exception as e:
        print(f"\n✗ Error during seeding: {str(e)}")
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
