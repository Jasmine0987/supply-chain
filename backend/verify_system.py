# Quick Verification Script
# Run this after updating the files to verify everything works

import requests
import time

print("=" * 80)
print("VERIFICATION SCRIPT")
print("=" * 80)

# Step 1: Check if backend is running
print("\n1. Checking if backend is running...")
try:
    response = requests.get("http://localhost:8000/")
    print(f"   ✅ Backend is running: {response.json()['message']}")
except Exception as e:
    print(f"   ❌ Backend is NOT running: {e}")
    print("   → Start backend: uvicorn app.main:app --reload")
    exit(1)

# Step 2: Check IoT status
print("\n2. Checking IoT system status...")
try:
    response = requests.get("http://localhost:8000/api/v1/iot/status")
    status = response.json()
    
    mqtt_connected = status['mqtt']['connected']
    ws_clients = status['websocket']['active_connections']
    
    if mqtt_connected:
        print(f"   ✅ MQTT connected: {status['mqtt']['broker']}")
    else:
        print(f"   ❌ MQTT NOT connected")
        print("   → Check if MQTT broker (mosquitto) is running")
        print("   → docker-compose ps | grep mosquitto")
    
    print(f"   📊 WebSocket clients: {ws_clients}")
    
    if ws_clients == 0:
        print("   ⚠️  No WebSocket clients connected")
        print("   → Open http://localhost:5173/iot in your browser")
    else:
        print(f"   ✅ {ws_clients} client(s) connected")
        
except Exception as e:
    print(f"   ❌ Error checking status: {e}")

# Step 3: Test manual broadcast
print("\n3. Testing manual broadcast...")
print("   (Open your browser to http://localhost:5173/iot now if not already open)")
time.sleep(2)

try:
    response = requests.post("http://localhost:8000/api/v1/iot/test-broadcast")
    result = response.json()
    
    clients = result['clients_notified']
    if clients > 0:
        print(f"   ✅ Test broadcast sent to {clients} client(s)")
        print("   → Check your dashboard - you should see 'TEST-MANUAL-001' sensor!")
    else:
        print("   ⚠️  Test broadcast sent but no clients connected")
        print("   → Make sure IoT dashboard page is open")
        
except Exception as e:
    print(f"   ❌ Error sending broadcast: {e}")

print("\n" + "=" * 80)
print("NEXT STEPS:")
print("=" * 80)
print("\n1. If TEST-MANUAL-001 sensor appeared in dashboard:")
print("   ✅ WebSocket is working!")
print("   → Problem is MQTT handler not broadcasting")
print("   → Replace mqtt_handler.py with mqtt_handler_FIXED.py")
print("   → Restart backend")

print("\n2. If NO sensor appeared:")
print("   ❌ WebSocket connection issue")
print("   → Check browser console for errors")
print("   → Verify frontend is running on http://localhost:5173")

print("\n3. Make sure IoT simulator is running:")
print("   python scripts/iot_simulator.py")

print("\n" + "=" * 80)