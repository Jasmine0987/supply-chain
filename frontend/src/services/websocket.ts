import { store } from '../store/store';
import { updateSensorData } from '../store/slices/realtimeSlice';

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */
type EventHandler = (data?: any) => void;

/* ------------------------------------------------------------------ */
/* WebSocket Service */
/* ------------------------------------------------------------------ */
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private url: string;

  private listeners: Map<string, Set<EventHandler>> = new Map();
  private pingInterval: number | null = null;

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  }

  /* -------------------------------------------------- */
  /* Event System */
  /* -------------------------------------------------- */
  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler) {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }

  /* -------------------------------------------------- */
  /* Connection */
  /* -------------------------------------------------- */
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket...', this.url);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('✓ WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected');

        // Ping every 30s
        this.pingInterval = window.setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        this.cleanup();
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.attemptReconnect();
    }
  }

  /* -------------------------------------------------- */
  /* Message Handling */
  /* -------------------------------------------------- */
  private handleMessage(data: any) {
    console.log('📩 WebSocket message:', data);

    switch (data.type) {
      case 'sensor_update':
        // Redux update
        store.dispatch(updateSensorData(data.data));

        // Emit for components (IoTDashboard)
        this.emit('sensor_update', data.data);
        break;

      case 'alert':
        console.log('🚨 Alert received:', data);
        this.emit('alert', data);
        break;

      case 'pong':
        // Keep-alive acknowledged
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }

  /* -------------------------------------------------- */
  /* Reconnect Logic */
  /* -------------------------------------------------- */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  /* -------------------------------------------------- */
  /* Utilities */
  /* -------------------------------------------------- */
  disconnect() {
    this.cleanup();
    this.ws?.close();
    this.ws = null;
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Singleton Export */
/* ------------------------------------------------------------------ */
export const websocketService = new WebSocketService();
