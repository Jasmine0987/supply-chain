# Getting Started Guide

Welcome to the Supply Chain Analytics Platform! This guide will help you get started.

## Table of Contents
1. [First Login](#first-login)
2. [Dashboard Overview](#dashboard-overview)
3. [Tracking Shipments](#tracking-shipments)
4. [Managing Inventory](#managing-inventory)
5. [Setting Up Alerts](#setting-up-alerts)
6. [Using IoT Sensors](#using-iot-sensors)

## First Login

1. Navigate to the application URL
2. Enter your credentials (provided by your administrator)
3. On first login, you'll be prompted to change your password
4. Complete your profile information

### Default Credentials (Demo)
- **Email**: demo@supplychain.com
- **Password**: demo123

**⚠️ Important**: Change these credentials immediately in production.

## Dashboard Overview

The dashboard provides a high-level view of your supply chain operations.

### Key Metrics
- **Total Shipments**: Current active shipments
- **In Transit**: Shipments currently being delivered
- **Alerts**: Critical notifications requiring attention
- **Warehouse Utilization**: Storage capacity usage

### Interactive Charts
- **Shipment Trends**: 30-day shipment volume
- **Carrier Performance**: Delivery time by carrier
- **Cost Analysis**: Shipping costs breakdown
- **Inventory Levels**: Stock levels across warehouses

## Tracking Shipments

### View All Shipments
1. Click **Shipments** in the sidebar
2. Use filters to narrow results:
   - Status (Pending, In Transit, Delivered)
   - Date range
   - Carrier
   - Origin/Destination

### Track a Specific Shipment
1. Enter tracking number in search bar, OR
2. Click on shipment in the list
3. View detailed information:
   - Real-time GPS location
   - Estimated delivery time
   - Delivery history
   - IoT sensor data (temperature, humidity, shock)

### Create a New Shipment
1. Click **+ New Shipment** button
2. Fill in required information:
   - Origin and destination addresses
   - Carrier selection
   - Package details (weight, dimensions)
   - Special handling instructions
3. Click **Create Shipment**
4. Tracking number will be generated automatically

## Managing Inventory

### View Inventory
1. Navigate to **Inventory** page
2. See real-time stock levels across all warehouses
3. Filter by:
   - SKU
   - Warehouse
   - Stock status (In Stock, Low Stock, Out of Stock)

### Low Stock Alerts
- Items below reorder point are highlighted in **orange**
- Items out of stock are highlighted in **red**
- Click on item to see detailed history

### Update Stock Levels
1. Click on an inventory item
2. Click **Edit** button
3. Update quantity
4. Add notes (optional)
5. Save changes

**Note**: All changes are logged for audit purposes.

## Setting Up Alerts

### Alert Types
- **Critical**: Urgent issues requiring immediate action
- **High**: Important issues to address soon
- **Medium**: Moderate priority issues
- **Low**: Informational notifications

### Configure Alert Rules
1. Go to **Settings** → **Alerts**
2. Click **+ New Rule**
3. Configure:
   - Trigger condition (e.g., temperature > 30°C)
   - Severity level
   - Recipients
   - Notification channels (Email, SMS, Push)
4. Save rule

### View and Manage Alerts
1. Navigate to **Alerts** page
2. Filter by severity or status
3. Click on alert to see details
4. Take action:
   - **Acknowledge**: Mark as seen
   - **Resolve**: Mark as fixed
   - **Escalate**: Increase priority

## Using IoT Sensors

### Sensor Dashboard
1. Go to **IoT Sensors** page
2. View all active sensors
3. See real-time data:
   - Temperature
   - Humidity
   - GPS Location
   - Shock/Impact detection

### Assign Sensor to Shipment
1. Open shipment details
2. Click **Assign Sensor**
3. Select sensor from dropdown
4. Sensor data will now appear in shipment tracking

### View Sensor History
1. Click on a sensor
2. Select date range
3. View historical data charts
4. Export data if needed

## Mobile App

### Install PWA
**On Chrome (Android/Desktop):**
1. Click the install icon in address bar
2. Click **Install**
3. App will be added to home screen/apps

**On Safari (iOS):**
1. Tap the Share button
2. Tap **Add to Home Screen**
3. Tap **Add**

### Offline Mode
- App works offline with cached data
- Changes sync automatically when connection restored
- Offline indicator shows connection status

## Keyboard Shortcuts

- `Ctrl/Cmd + K`: Global search
- `Ctrl/Cmd + /`: Show shortcuts help
- `Ctrl/Cmd + S`: Save current form
- `Esc`: Close modal/dialog

## Tips for Best Results

1. **Keep Browser Updated**: Use latest Chrome, Firefox, Safari, or Edge
2. **Enable Notifications**: Get real-time alerts
3. **Use Filters**: Quickly find what you need
4. **Export Data**: Download reports for analysis
5. **Mobile App**: Install PWA for offline access

## Need Help?

- **In-app Help**: Click the `?` icon in top-right
- **Support Email**: support@supplychain.com
- **Documentation**: https://docs.supplychain.com
- **Video Tutorials**: https://youtube.com/@supplychain

## Next Steps

- [Advanced Features Guide](advanced-features.md)
- [Analytics & Reporting](analytics.md)
- [Admin Guide](admin-guide.md)
- [API Documentation](../api/README.md)