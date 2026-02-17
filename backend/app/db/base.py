"""
SQLAlchemy Base Class
All models will inherit from this Base
"""
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# DO NOT import models here!
# Alembic will import them from alembic/env.py