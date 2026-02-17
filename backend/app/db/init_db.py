"""
Database Initialization
Creates tables and seeds initial data
"""
from app.core.config import settings
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine
from app.models.user import User
from app.core.security import get_password_hash
import logging

logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    """
    Initialize database with tables and initial data
    This runs when the application starts
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
    
    # Check if we need to create initial admin user
    user = db.query(User).filter(User.email == "admin@supplychain.com").first()
    if not user:
        logger.info("Creating initial admin user...")
        admin_user = User(
            email="admin@supplychain.com",
            username="admin",
            full_name="System Administrator",
            hashed_password=get_password_hash("admin123"),
            is_active=True,
            is_superuser=True,
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        logger.info(f"Admin user created: {admin_user.email}")
    else:
        logger.info("Admin user already exists")

def create_tables() -> None:
    """
    Create all database tables
    Called from alembic migrations or manual setup
    """
    Base.metadata.create_all(bind=engine)
    logger.info("All tables created")

def drop_tables() -> None:
    """
    Drop all database tables
    WARNING: This deletes all data!
    Only use in development
    """
    if not settings.DEBUG:
        raise Exception("Cannot drop tables in production!")
    
    Base.metadata.drop_all(bind=engine)
    logger.info("All tables dropped")