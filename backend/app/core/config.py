from pydantic_settings import BaseSettings
from typing import List, Optional
import secrets
import json

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Supply Chain Analytics"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "postgresql://supplychain:supplychain123@localhost:5432/supplychain"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 0
    
    # Redis
    REDIS_URL: str
    
    # InfluxDB
    INFLUXDB_URL: str
    INFLUXDB_TOKEN: str
    INFLUXDB_ORG: str
    INFLUXDB_BUCKET: str
    
    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str
    KAFKA_TOPIC_SHIPMENTS: str = "shipments"
    KAFKA_TOPIC_IOT: str = "iot-data"
    KAFKA_TOPIC_ALERTS: str = "alerts"
    
    # MQTT
    MQTT_BROKER: str
    MQTT_PORT: int = 1883
    MQTT_USERNAME: str = ""
    MQTT_PASSWORD: str = ""
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # Added this field
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    # Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""
    
    # External APIs
    FEDEX_API_KEY: str = ""
    FEDEX_API_SECRET: str = ""
    UPS_API_KEY: str = ""
    DHL_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    WEATHER_API_KEY: str = ""
    MAPBOX_ACCESS_TOKEN: str = ""
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # Allow extra fields in .env that aren't in Settings
        extra = "ignore"  # This is the key addition!
        
        # Custom JSON decoder for CORS_ORIGINS
        @staticmethod
        def parse_env_var(field_name: str, raw_val: str):
            if field_name == 'CORS_ORIGINS':
                return json.loads(raw_val)
            return raw_val

settings = Settings()