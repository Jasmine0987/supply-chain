# backend/alembic/env.py

from logging.config import fileConfig
from alembic import context
from sqlalchemy import engine_from_config, pool
import os
import sys

# ----------------------------
# Fix Python import path
# ----------------------------
# Add backend/ to sys.path so "app" package can be imported
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, BASE_DIR)

# ----------------------------
# Alembic Config
# ----------------------------
config = context.config

# ----------------------------
# Load settings from app.core.config
# ----------------------------
from app.core.config import settings

# Override sqlalchemy.url from alembic.ini with actual env DB URL
if settings.DATABASE_URL:
    config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# ----------------------------
# Logging
# ----------------------------
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ----------------------------
# Import Base and all models
# ----------------------------
from app.db.base import Base

# Import every model module so metadata is registered for autogenerate
# (Update imports based on your actual models)
from app.models.user import User
# from app.models.warehouse import Warehouse
# from app.models.shipment import Shipment
# from app.models.inventory import Inventory
# from app.models.alert import Alert
# from app.models.iot_sensor import IoTSensor
# Add more model imports here...

target_metadata = Base.metadata


# ----------------------------
# Offline migration mode
# ----------------------------
def run_migrations_offline() -> None:
    """Run migrations without engine — just URL."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# ----------------------------
# Online migration mode
# ----------------------------
def run_migrations_online() -> None:
    """Run migrations with a database connection."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


# ----------------------------
# Detect mode
# ----------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
