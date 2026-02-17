"""
User Model
Stores user account details and authentication information.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    func
)
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    # -------------------------
    # Primary Key
    # -------------------------
    id = Column(Integer, primary_key=True, index=True)

    # -------------------------
    # User Identity
    # -------------------------
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)

    # -------------------------
    # Authentication
    # -------------------------
    hashed_password = Column(String(255), nullable=False)

    # -------------------------
    # Status & Roles
    # -------------------------
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String(50), default="user")  # admin, manager, operator, viewer

    # -------------------------
    # Timestamps
    # -------------------------
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # -------------------------
    # Representation
    # -------------------------
    def __repr__(self):
        return f"<User id={self.id} username='{self.username}' email='{self.email}'>"
