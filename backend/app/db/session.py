"""
Database Session Management
Creates database engine and session factory
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.core.config import settings

# ---------------------------------------
# Create database engine
# ---------------------------------------
# pool_pre_ping=True prevents stale connections
# echo=settings.DEBUG enables SQL logs only in development
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG,
    future=True,  # required for SQLAlchemy 2.0 style operation
)

# ---------------------------------------
# Session factory
# ---------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)

# ---------------------------------------
# FastAPI dependency
# ---------------------------------------
def get_db() -> Generator[Session, None, None]:
    """
    Returns a new SQLAlchemy session for each request.
    
    Usage:
        @router.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
