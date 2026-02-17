# API Documentation

## Base URL
```
Development: http://localhost:8000/api/v1
Production: https://api.supplychain.com/api/v1
```

## Authentication

All API endpoints (except `/auth/login`) require a JWT token in the header:
```http
Authorization: Bearer <your_jwt_token>
```

### Get Access Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@supplychain.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@supplychain.com",
    "full_name": "Admin User",
    "role": "admin"
  }
}
```

## Endpoints

### 📦 Shipments

#### List All Shipments
```http
GET /shipments?skip=0&limit=100&status=in_transit
```

**Query Parameters:**
- `skip` (int): Pagination offset
- `limit` (int): Number of results (max 100)
- `status` (string): Filter by status (pending, in_transit, delivered, cancelled)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "tracking_number": "SHP-001-2024",
      "origin": "New York, NY",
      "destination": "Los Angeles, CA",
      "status": "in_transit",
      "carrier_id": 1,
      "estimated_delivery": "2024-01-15T10:00:00Z",
      "current_location": "Denver, CO"
    }
  ],
  "total": 150,
  "skip": 0,
  "limit": 100
}
```

#### Get Single Shipment
```http
GET /shipments/{shipment_id}
```

#### Create Shipment
```http
POST /shipments
Content-Type: application/json

{
  "tracking_number": "SHP-002-2024",
  "origin": "Chicago, IL",
  "destination": "Miami, FL",
  "carrier_id": 2,
  "items": [
    {
      "sku": "PROD-001",
      "quantity": 10,
      "weight": 5.5
    }
  ]
}
```

#### Update Shipment
```http
PUT /shipments/{shipment_id}
Content-Type: application/json

{
  "status": "delivered",
  "delivered_at": "2024-01-15T14:30:00Z"
}
```

### 📊 Inventory

#### Get Inventory Overview
```http
GET /inventory?warehouse_id=1
```

#### Update Stock Level
```http
PUT /inventory/{item_id}
Content-Type: application/json

{
  "quantity": 100,
  "warehouse_id": 1
}
```

### 🚨 Alerts

#### List Alerts
```http
GET /alerts?severity=critical&resolved=false
```

**Query Parameters:**
- `severity`: low, medium, high, critical
- `resolved`: true, false

#### Acknowledge Alert
```http
POST /alerts/{alert_id}/acknowledge
```

#### Resolve Alert
```http
POST /alerts/{alert_id}/resolve
Content-Type: application/json

{
  "resolution_note": "Issue resolved by restarting sensor
"
}

### 🏭 Warehouses

#### List Warehouses
```http
GET /warehouses
```

#### Get Warehouse Details
```http
GET /warehouses/{warehouse_id}
```

### 📡 IoT Sensors

#### Get Sensor Data
```http
GET /iot/sensors/{sensor_id}/data?start=2024-01-01&end=2024-01-31
```

**Response:**
```json
{
  "sensor_id": 1,
  "sensor_type": "temperature",
  "data_points": [
    {
      "timestamp": "2024-01-15T10:00:00Z",
      "value": 22.5,
      "unit": "celsius"
    }
  ]
}
```

#### Get Real-time Sensor Stream
```http
GET /iot/sensors/{sensor_id}/stream
```

Uses Server-Sent Events (SSE) for real-time streaming.

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- **Anonymous**: 100 requests/hour
- **Authenticated**: 1000 requests/hour
- **Premium**: 10000 requests/hour

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

## WebSocket API

### Connect to Real-time Updates
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/realtime');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

**Message Format:**
```json
{
  "type": "sensor_data",
  "data": {
    "sensor_id": 1,
    "value": 23.5,
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

## SDKs

### Python
```python
from supply_chain_client import SupplyChainAPI

client = SupplyChainAPI(
    api_key="your_api_key",
    base_url="https://api.supplychain.com"
)

shipments = client.shipments.list(status="in_transit")
```

### JavaScript/TypeScript
```javascript
import { SupplyChainClient } from '@supplychain/client';

const client = new SupplyChainClient({
  apiKey: 'your_api_key',
  baseURL: 'https://api.supplychain.com'
});

const shipments = await client.shipments.list({ status: 'in_transit' });
```

## Postman Collection

Import our Postman collection for easy API testing:
[Download Collection](../postman/supply-chain-api.json)

## OpenAPI Specification

Full OpenAPI 3.0 specification available at:
http://localhost:8000/openapi.json

Interactive docs:
http://localhost:8000/docs (Swagger UI)
http://localhost:8000/redoc (ReDoc)

