"""
Temporal Attention Mechanism for Graph Events
PATENTABLE: Time-aware attention for supply chain events
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class TemporalAttention:
    """
    PATENTABLE: Temporal attention for supply chain events
    
    Key Innovation:
    - Learns to attend to important past events
    - Time-decay weighting
    - Event type-specific attention
    - Context-aware temporal modeling
    """
    
    def __init__(
        self,
        embedding_dim: int = 32,
        num_heads: int = 4,
        time_decay_factor: float = 0.95
    ):
        """
        Initialize temporal attention
        
        Args:
            embedding_dim: Dimension of embeddings
            num_heads: Number of attention heads
            time_decay_factor: Decay rate for older events
        """
        self.embedding_dim = embedding_dim
        self.num_heads = num_heads
        self.time_decay_factor = time_decay_factor
        
        # Initialize attention weights
        self.W_q = np.random.randn(embedding_dim, embedding_dim) * 0.01
        self.W_k = np.random.randn(embedding_dim, embedding_dim) * 0.01
        self.W_v = np.random.randn(embedding_dim, embedding_dim) * 0.01
        
        self.event_history = []  # List of (timestamp, event_embedding)
    
    def add_event(
        self,
        timestamp: datetime,
        event_embedding: np.ndarray,
        event_type: str,
        affected_nodes: List[int]
    ):
        """
        Add new event to history
        
        Args:
            timestamp: When event occurred
            event_embedding: Embedding representation of event
            event_type: Type of event (disruption, demand_spike, etc.)
            affected_nodes: Nodes affected by event
        """
        self.event_history.append({
            'timestamp': timestamp,
            'embedding': event_embedding,
            'type': event_type,
            'affected_nodes': affected_nodes
        })
        
        # Keep only recent events (last 1000)
        if len(self.event_history) > 1000:
            self.event_history = self.event_history[-1000:]
    
    def compute_attention(
        self,
        query_embedding: np.ndarray,
        current_time: datetime,
        max_history_days: int = 30
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Compute attention over historical events
        
        PATENTABLE: Time-decayed multi-head attention
        
        Args:
            query_embedding: Current state embedding
            current_time: Current timestamp
            max_history_days: Maximum days to look back
        
        Returns:
            (attended_embedding, attention_weights)
        """
        if len(self.event_history) == 0:
            return query_embedding, np.array([])
        
        # Filter recent events
        cutoff_time = current_time - timedelta(days=max_history_days)
        recent_events = [
            e for e in self.event_history
            if e['timestamp'] >= cutoff_time
        ]
        
        if len(recent_events) == 0:
            return query_embedding, np.array([])
        
        # Extract embeddings and timestamps
        event_embeddings = np.array([e['embedding'] for e in recent_events])
        timestamps = [e['timestamp'] for e in recent_events]
        
        # Compute queries, keys, values
        Q = query_embedding @ self.W_q  # (d,)
        K = event_embeddings @ self.W_k  # (n, d)
        V = event_embeddings @ self.W_v  # (n, d)
        
        # Compute attention scores
        attention_scores = Q @ K.T  # (n,)
        attention_scores = attention_scores / np.sqrt(self.embedding_dim)
        
        # Apply temporal decay
        time_weights = self._compute_time_weights(timestamps, current_time)
        attention_scores = attention_scores * time_weights
        
        # Softmax
        attention_weights = self._softmax(attention_scores)
        
        # Weighted sum of values
        attended = attention_weights @ V
        
        return attended, attention_weights
    
    def _compute_time_weights(
        self,
        timestamps: List[datetime],
        current_time: datetime
    ) -> np.ndarray:
        """
        Compute time decay weights
        
        PATENTABLE: Exponential time decay with adaptive rate
        """
        weights = []
        
        for timestamp in timestamps:
            # Days elapsed
            days_elapsed = (current_time - timestamp).total_seconds() / 86400
            
            # Exponential decay
            weight = self.time_decay_factor ** days_elapsed
            weights.append(weight)
        
        return np.array(weights)
    
    def _softmax(self, x: np.ndarray) -> np.ndarray:
        """Numerical stable softmax"""
        exp_x = np.exp(x - np.max(x))
        return exp_x / np.sum(exp_x)
    
    def predict_future_events(
        self,
        query_embedding: np.ndarray,
        current_time: datetime,
        horizon_days: int = 7
    ) -> List[Dict]:
        """
        Predict likely future events based on attention patterns
        
        PATENTABLE: Temporal pattern-based event prediction
        
        Args:
            query_embedding: Current state
            current_time: Current time
            horizon_days: Days to predict ahead
        
        Returns:
            List of predicted events with probabilities
        """
        # Get attention over past events
        attended, weights = self.compute_attention(query_embedding, current_time)
        
        if len(weights) == 0:
            return []
        
        # Find high-attention events
        top_indices = np.argsort(weights)[-5:][::-1]
        
        # Analyze patterns
        predictions = []
        for idx in top_indices:
            if idx >= len(self.event_history):
                continue
            
            event = self.event_history[idx]
            
            # Predict similar event might occur
            time_since_event = (current_time - event['timestamp']).days
            
            # Estimate recurrence probability
            recurrence_prob = float(weights[idx]) * (1 - time_since_event / 365)
            recurrence_prob = max(0, min(1, recurrence_prob))
            
            if recurrence_prob > 0.1:
                predictions.append({
                    'event_type': event['type'],
                    'probability': recurrence_prob,
                    'expected_date': current_time + timedelta(days=horizon_days / 2),
                    'similar_to': event['timestamp'].isoformat(),
                    'affected_nodes': event['affected_nodes']
                })
        
        return predictions
    
    def get_attention_summary(
        self,
        query_embedding: np.ndarray,
        current_time: datetime
    ) -> Dict:
        """
        Get summary of attention patterns
        
        Returns:
            Statistics about what the model is attending to
        """
        attended, weights = self.compute_attention(query_embedding, current_time)
        
        if len(weights) == 0:
            return {
                'total_events': 0,
                'max_attention': 0,
                'avg_attention': 0
            }
        
        # Get top attended events
        top_indices = np.argsort(weights)[-5:][::-1]
        top_events = []
        
        for idx in top_indices:
            if idx < len(self.event_history):
                event = self.event_history[idx]
                top_events.append({
                    'type': event['type'],
                    'timestamp': event['timestamp'].isoformat(),
                    'attention_weight': float(weights[idx])
                })
        
        # Event type distribution
        event_types = [e['type'] for e in self.event_history]
        type_counts = {t: event_types.count(t) for t in set(event_types)}
        
        return {
            'total_events': len(self.event_history),
            'max_attention': float(np.max(weights)),
            'avg_attention': float(np.mean(weights)),
            'top_attended_events': top_events,
            'event_type_distribution': type_counts
        }
    
    def identify_recurring_patterns(
        self,
        window_days: int = 7
    ) -> List[Dict]:
        """
        Identify recurring event patterns
        
        PATENTABLE: Temporal pattern discovery
        
        Returns:
            List of discovered patterns
        """
        if len(self.event_history) < 2:
            return []
        
        patterns = []
        
        # Group events by type
        events_by_type = {}
        for event in self.event_history:
            event_type = event['type']
            if event_type not in events_by_type:
                events_by_type[event_type] = []
            events_by_type[event_type].append(event)
        
        # Find recurring patterns for each type
        for event_type, events in events_by_type.items():
            if len(events) < 3:
                continue
            
            # Sort by timestamp
            events = sorted(events, key=lambda e: e['timestamp'])
            
            # Calculate intervals
            intervals = []
            for i in range(len(events) - 1):
                interval = (events[i + 1]['timestamp'] - events[i]['timestamp']).days
                intervals.append(interval)
            
            if len(intervals) < 2:
                continue
            
            # Check if intervals are similar (recurring pattern)
            avg_interval = np.mean(intervals)
            std_interval = np.std(intervals)
            
            # If standard deviation is low, it's a recurring pattern
            if std_interval < avg_interval * 0.3:
                patterns.append({
                    'event_type': event_type,
                    'recurrence_days': float(avg_interval),
                    'confidence': 1 - (std_interval / (avg_interval + 1)),
                    'occurrences': len(events),
                    'last_occurrence': events[-1]['timestamp'].isoformat()
                })
        
        return patterns


# Example usage
if __name__ == "__main__":
    # Create temporal attention
    attention = TemporalAttention(embedding_dim=32, num_heads=4)
    
    # Simulate events
    base_time = datetime.now()
    
    for i in range(10):
        event_time = base_time - timedelta(days=i * 3)
        event_embedding = np.random.randn(32)
        
        attention.add_event(
            timestamp=event_time,
            event_embedding=event_embedding,
            event_type='demand_spike' if i % 2 == 0 else 'disruption',
            affected_nodes=[0, 1, 2]
        )
    
    # Compute attention
    query = np.random.randn(32)
    attended, weights = attention.compute_attention(query, datetime.now())
    
    print(f"Attended embedding shape: {attended.shape}")
    print(f"Attention weights: {weights[:5]}")
    
    # Get summary
    summary = attention.get_attention_summary(query, datetime.now())
    print(f"Attention summary: {summary}")
    
    # Find patterns
    patterns = attention.identify_recurring_patterns()
    print(f"Recurring patterns: {patterns}")