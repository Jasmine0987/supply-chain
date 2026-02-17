"""
Probabilistic Inventory Allocator - Main Orchestrator
PATENTABLE: Complete probabilistic allocation system
"""
from typing import Dict, List, Optional
from datetime import datetime
import logging

from .multi_forecast import MultiForecastGenerator
from .confidence_decay import ConfidenceDecay
from .game_theory_allocator import GameTheoryAllocator
from .realtime_reallocator import RealtimeReallocator

logger = logging.getLogger(__name__)


class ProbabilisticInventoryAllocator:
    """
    PATENTABLE: Complete probabilistic inventory allocation system
    
    Integrates:
    1. Multi-scenario forecasting
    2. Confidence decay
    3. Game-theoretic allocation
    4. Real-time reallocation
    """
    
    def __init__(self):
        self.forecaster = MultiForecastGenerator()
        self.confidence_decay = ConfidenceDecay(base_decay_rate=0.05)
        self.game_allocator = GameTheoryAllocator()
        self.reallocator = RealtimeReallocator()
        
        self.allocation_state = {}  # Track current allocations
        self.forecast_cache = {}    # Cache forecasts with timestamps
    
    def register_warehouse(
        self,
        warehouse_id: str,
        capacity: int,
        current_stock: int,
        location: tuple,
        demand_priority: float = 1.0
    ):
        """Register a warehouse in the system"""
        self.game_allocator.register_warehouse(
            warehouse_id,
            capacity,
            current_stock,
            location,
            demand_priority
        )
        logger.info(f"Registered warehouse: {warehouse_id}")
    
    def load_demand_history(
        self,
        product_id: str,
        warehouse_id: str,
        demand_history: List[float]
    ):
        """Load historical demand data"""
        cache_key = f"{product_id}_{warehouse_id}"
        self.forecaster.load_historical_demand(cache_key, demand_history)
        logger.info(f"Loaded demand history for {product_id} at {warehouse_id}")
    
    def generate_allocation(
        self,
        product_id: str,
        total_inventory: int,
        warehouse_ids: List[str],
        forecast_days: int = 30,
        allocation_strategy: str = 'nash_equilibrium'
    ) -> Dict[str, any]:
        """
        Generate complete allocation plan
        
        PATENTABLE: End-to-end allocation with multi-forecast and game theory
        
        Returns:
            Complete allocation report with forecasts, confidence, and allocations
        """
        logger.info(f"Generating allocation for {product_id}, {total_inventory} units")
        
        # Step 1: Generate forecasts for each warehouse
        warehouse_forecasts = {}
        
        for wh_id in warehouse_ids:
            cache_key = f"{product_id}_{wh_id}"
            
            # Generate multi-scenario forecasts
            forecasts = self.forecaster.generate_forecasts(
                cache_key,
                forecast_days=forecast_days
            )
            
            # Apply confidence decay (if forecasts exist in cache)
            if cache_key in self.forecast_cache:
                old_forecast = self.forecast_cache[cache_key]
                forecast_age = (datetime.now() - old_forecast['timestamp']).days
                
                if forecast_age > 0:
                    forecasts = self.confidence_decay.apply_decay_to_forecasts(
                        forecasts,
                        forecast_age_days=forecast_age
                    )
            
            warehouse_forecasts[wh_id] = forecasts
            
            # Cache forecasts
            self.forecast_cache[cache_key] = {
                'forecasts': forecasts,
                'timestamp': datetime.now()
            }
        
        # Step 2: Allocate using game theory
        allocations = self.game_allocator.allocate_inventory(
            product_id,
            total_inventory,
            warehouse_forecasts,
            allocation_strategy=allocation_strategy
        )
        
        # Step 3: Calculate confidence metrics
        confidence_metrics = {}
        for wh_id in warehouse_ids:
            forecasts = warehouse_forecasts[wh_id]
            
            # Get confidence from decay (if available)
            confidence = forecasts.get('most_likely_confidence', 1.0)
            confidence_metrics[wh_id] = confidence
        
        # Step 4: Calculate expected demands
        expected_demands = {}
        for wh_id in warehouse_ids:
            forecasts = warehouse_forecasts[wh_id]
            expected_demand = self.confidence_decay.calculate_weighted_demand(forecasts)
            expected_demands[wh_id] = sum(expected_demand[:7])  # 7-day total
        
        # Step 5: Calculate fairness
        fairness_score = self.game_allocator.calculate_allocation_fairness(
            allocations,
            expected_demands
        )
        
        # Step 6: Store allocation state
        self.allocation_state[product_id] = {
            'allocations': allocations,
            'forecasts': warehouse_forecasts,
            'expected_demands': expected_demands,
            'confidence_metrics': confidence_metrics,
            'timestamp': datetime.now(),
            'total_inventory': total_inventory
        }
        
        # Build comprehensive report
        report = {
            'product_id': product_id,
            'total_inventory': total_inventory,
            'allocation_strategy': allocation_strategy,
            'allocations': allocations,
            'warehouse_forecasts': warehouse_forecasts,
            'expected_demands': expected_demands,
            'confidence_metrics': confidence_metrics,
            'fairness_score': fairness_score,
            'timestamp': datetime.now().isoformat(),
            'metadata': {
                'forecast_days': forecast_days,
                'num_warehouses': len(warehouse_ids)
            }
        }
        
        logger.info(f"Allocation complete: {allocations}")
        logger.info(f"Fairness score: {fairness_score:.3f}")
        
        return report
    
    def check_and_reallocate(
        self,
        product_id: str,
        actual_demands: Dict[str, List[float]]
    ) -> Optional[Dict[str, any]]:
        """
        Check if reallocation is needed and execute if necessary
        
        Args:
            product_id: Product to check
            actual_demands: Recent actual demand data per warehouse
        
        Returns:
            Reallocation report if reallocation occurred, None otherwise
        """
        if product_id not in self.allocation_state:
            logger.warning(f"No allocation found for {product_id}")
            return None
        
        state = self.allocation_state[product_id]
        current_allocations = state['allocations']
        forecasts = state['forecasts']
        confidence_metrics = state['confidence_metrics']
        
        # Get reallocation recommendations
        recommendations = self.reallocator.get_reallocation_recommendations(
            current_allocations,
            actual_demands,
            forecasts,
            confidence_metrics
        )
        
        # If critical or high priority recommendations exist, reallocate
        critical_recs = [r for r in recommendations if r['priority'] in ['critical', 'high']]
        
        if len(critical_recs) > 0:
            logger.info(f"Reallocation triggered for {product_id}: {len(critical_recs)} critical items")
            
            # Calculate reallocation plan
            transfer_plan = self.reallocator.calculate_reallocation_plan(
                current_allocations,
                forecasts
            )
            
            # Execute reallocation
            execution_report = self.reallocator.execute_reallocation(
                transfer_plan,
                product_id
            )
            
            # Update allocation state
            for from_wh, destinations in transfer_plan.items():
                for to_wh, amount in destinations.items():
                    current_allocations[from_wh] -= amount
                    current_allocations[to_wh] += amount
            
            state['allocations'] = current_allocations
            state['last_reallocation'] = datetime.now()
            
            return {
                'product_id': product_id,
                'recommendations': recommendations,
                'transfer_plan': transfer_plan,
                'execution_report': execution_report,
                'updated_allocations': current_allocations
            }
        
        return None
    
    def get_allocation_summary(self, product_id: str) -> Optional[Dict[str, any]]:
        """Get current allocation summary for a product"""
        if product_id not in self.allocation_state:
            return None
        
        state = self.allocation_state[product_id]
        
        # Calculate days since allocation
        age = (datetime.now() - state['timestamp']).days
        
        # Get average confidence
        avg_confidence = sum(state['confidence_metrics'].values()) / len(state['confidence_metrics'])
        
        return {
            'product_id': product_id,
            'allocations': state['allocations'],
            'expected_demands': state['expected_demands'],
            'total_inventory': state['total_inventory'],
            'allocation_age_days': age,
            'average_confidence': avg_confidence,
            'needs_reforecast': avg_confidence < 0.3 or age > 7
        }
    
    def compare_allocation_strategies(
        self,
        product_id: str,
        total_inventory: int,
        warehouse_ids: List[str],
        strategies: List[str] = None
    ) -> Dict[str, Dict[str, any]]:
        """
        Compare different allocation strategies
        
        Returns comparison of nash_equilibrium, proportional, and safety_stock
        """
        if strategies is None:
            strategies = ['nash_equilibrium', 'proportional', 'safety_stock']
        
        # Generate forecasts once
        warehouse_forecasts = {}
        for wh_id in warehouse_ids:
            cache_key = f"{product_id}_{wh_id}"
            forecasts = self.forecaster.generate_forecasts(cache_key, forecast_days=30)
            warehouse_forecasts[wh_id] = forecasts
        
        # Calculate expected demands
        expected_demands = {}
        for wh_id in warehouse_ids:
            forecasts = warehouse_forecasts[wh_id]
            expected_demand = self.confidence_decay.calculate_weighted_demand(forecasts)
            expected_demands[wh_id] = sum(expected_demand[:7])
        
        # Compare strategies
        comparison = {}
        
        for strategy in strategies:
            allocations = self.game_allocator.allocate_inventory(
                product_id,
                total_inventory,
                warehouse_forecasts,
                allocation_strategy=strategy
            )
            
            fairness = self.game_allocator.calculate_allocation_fairness(
                allocations,
                expected_demands
            )
            
            # Calculate service levels
            service_levels = {}
            for wh_id in warehouse_ids:
                demand = expected_demands[wh_id]
                allocation = allocations[wh_id]
                service_level = (allocation / demand * 100) if demand > 0 else 100
                service_levels[wh_id] = service_level
            
            comparison[strategy] = {
                'allocations': allocations,
                'fairness_score': fairness,
                'service_levels': service_levels,
                'avg_service_level': sum(service_levels.values()) / len(service_levels)
            }
        
        return comparison
    
    def get_system_health(self) -> Dict[str, any]:
        """Get overall system health metrics"""
        total_products = len(self.allocation_state)
        
        if total_products == 0:
            return {'status': 'no_allocations', 'total_products': 0}
        
        # Calculate average confidence
        all_confidences = []
        stale_allocations = 0
        
        for product_id, state in self.allocation_state.items():
            confidences = list(state['confidence_metrics'].values())
            all_confidences.extend(confidences)
            
            age = (datetime.now() - state['timestamp']).days
            if age > 7:
                stale_allocations += 1
        
        avg_confidence = sum(all_confidences) / len(all_confidences)
        
        return {
            'status': 'healthy' if avg_confidence > 0.5 else 'degraded',
            'total_products': total_products,
            'average_confidence': avg_confidence,
            'stale_allocations': stale_allocations,
            'stale_percentage': (stale_allocations / total_products) * 100,
            'total_reallocations_today': self.reallocator.daily_reallocation_count.get(
                datetime.now().date(), 0
            )
        }


# Example usage
if __name__ == "__main__":
    # Create allocator
    allocator = ProbabilisticInventoryAllocator()
    
    # Register warehouses
    allocator.register_warehouse('WH001', 1000, 200, (40.7, -74.0), 1.2)
    allocator.register_warehouse('WH002', 800, 150, (34.0, -118.2), 1.0)
    allocator.register_warehouse('WH003', 1200, 300, (41.8, -87.6), 0.9)
    
    # Generate allocation
    report = allocator.generate_allocation(
        'PROD001',
        total_inventory=1000,
        warehouse_ids=['WH001', 'WH002', 'WH003'],
        forecast_days=30,
        allocation_strategy='nash_equilibrium'
    )
    
    print("Probabilistic Allocation Report:")
    print(f"Allocations: {report['allocations']}")
    print(f"Fairness Score: {report['fairness_score']:.3f}")
    print(f"Average Confidence: {sum(report['confidence_metrics'].values()) / 3:.3f}")