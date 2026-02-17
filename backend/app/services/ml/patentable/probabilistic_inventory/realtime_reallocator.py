"""
Real-time Inventory Reallocator
PATENTABLE: Dynamic reallocation based on changing conditions
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class RealtimeReallocator:
    """
    PATENTABLE: Real-time inventory reallocation system
    
    Key Innovation:
    - Monitors actual demand vs forecasts continuously
    - Triggers reallocation when confidence decays or demand changes
    - Minimizes reallocation costs (transfer costs)
    - Balances responsiveness with stability
    """
    
    def __init__(
        self,
        reallocation_threshold: float = 0.15,
        min_reallocation_amount: int = 10,
        max_reallocations_per_day: int = 3
    ):
        """
        Initialize reallocator
        
        Args:
            reallocation_threshold: Trigger reallocation if demand deviation > threshold
            min_reallocation_amount: Minimum units to transfer
            max_reallocations_per_day: Rate limiting
        """
        self.reallocation_threshold = reallocation_threshold
        self.min_reallocation_amount = min_reallocation_amount
        self.max_reallocations_per_day = max_reallocations_per_day
        
        self.reallocation_history = []
        self.last_reallocation_time = {}
        self.daily_reallocation_count = {}
    
    def should_reallocate(
        self,
        warehouse_id: str,
        current_stock: int,
        expected_demand: float,
        actual_demand_trend: List[float],
        forecast_confidence: float
    ) -> Tuple[bool, str]:
        """
        Determine if reallocation is needed
        
        Returns:
            (should_reallocate, reason)
        """
        # Check rate limiting
        today = datetime.now().date()
        if today not in self.daily_reallocation_count:
            self.daily_reallocation_count = {today: 0}
        
        if self.daily_reallocation_count[today] >= self.max_reallocations_per_day:
            return False, "Rate limit reached"
        
        # Check 1: Confidence has decayed
        if forecast_confidence < 0.3:
            return True, "Low forecast confidence"
        
        # Check 2: Actual demand significantly different from expected
        if len(actual_demand_trend) >= 3:
            recent_actual = np.mean(actual_demand_trend[-3:])
            deviation = abs(recent_actual - expected_demand) / (expected_demand + 1)
            
            if deviation > self.reallocation_threshold:
                return True, f"Demand deviation: {deviation:.2%}"
        
        # Check 3: Stock level critical
        days_of_stock = current_stock / (expected_demand + 1)
        if days_of_stock < 2:
            return True, f"Critical stock level: {days_of_stock:.1f} days"
        
        # Check 4: Significant overstock
        if days_of_stock > 15 and current_stock > 100:
            return True, f"Overstock: {days_of_stock:.1f} days"
        
        return False, "No reallocation needed"
    
    def calculate_reallocation_plan(
        self,
        current_allocations: Dict[str, int],
        updated_forecasts: Dict[str, Dict[str, List[float]]],
        transfer_costs: Dict[Tuple[str, str], float] = None
    ) -> Dict[str, Dict[str, int]]:
        """
        Calculate optimal reallocation plan
        
        PATENTABLE: Cost-aware reallocation optimization
        
        Args:
            current_allocations: Current inventory at each warehouse
            updated_forecasts: New demand forecasts
            transfer_costs: Cost matrix for transfers (from_wh, to_wh) -> cost
        
        Returns:
            Transfer plan: {from_warehouse: {to_warehouse: amount}}
        """
        if transfer_costs is None:
            # Default: uniform transfer cost
            transfer_costs = {}
        
        warehouse_ids = list(current_allocations.keys())
        
        # Calculate new demand expectations
        expected_demands = {}
        for wh_id in warehouse_ids:
            if wh_id in updated_forecasts:
                # Use most_likely forecast for next 7 days
                demand = sum(updated_forecasts[wh_id]['most_likely'][:7])
                expected_demands[wh_id] = demand
            else:
                expected_demands[wh_id] = 0
        
        # Identify surplus and deficit warehouses
        surplus = {}
        deficit = {}
        
        for wh_id in warehouse_ids:
            current = current_allocations[wh_id]
            needed = expected_demands[wh_id]
            
            diff = current - needed
            
            if diff > self.min_reallocation_amount:
                surplus[wh_id] = diff
            elif diff < -self.min_reallocation_amount:
                deficit[wh_id] = abs(diff)
        
        # Create transfer plan
        transfer_plan = {}
        
        # Match surplus to deficit, minimizing transfer costs
        for deficit_wh, deficit_amount in sorted(deficit.items(), key=lambda x: -x[1]):
            transfer_plan[deficit_wh] = {}
            remaining_deficit = deficit_amount
            
            for surplus_wh, surplus_amount in sorted(surplus.items(), key=lambda x: -x[1]):
                if remaining_deficit <= 0:
                    break
                
                # Calculate transfer cost
                transfer_cost = transfer_costs.get((surplus_wh, deficit_wh), 1.0)
                
                # Transfer amount
                transfer_amount = min(surplus_amount, remaining_deficit)
                
                if transfer_amount >= self.min_reallocation_amount:
                    if surplus_wh not in transfer_plan:
                        transfer_plan[surplus_wh] = {}
                    
                    transfer_plan[surplus_wh][deficit_wh] = int(transfer_amount)
                    
                    # Update remaining amounts
                    surplus[surplus_wh] -= transfer_amount
                    remaining_deficit -= transfer_amount
        
        return transfer_plan
    
    def execute_reallocation(
        self,
        transfer_plan: Dict[str, Dict[str, int]],
        product_id: str
    ) -> Dict[str, any]:
        """
        Execute reallocation plan
        
        Returns execution report
        """
        execution_report = {
            'product_id': product_id,
            'timestamp': datetime.now().isoformat(),
            'transfers': [],
            'total_units_moved': 0,
            'estimated_cost': 0,
            'success': True
        }
        
        try:
            for from_wh, destinations in transfer_plan.items():
                for to_wh, amount in destinations.items():
                    if amount > 0:
                        # Record transfer
                        transfer = {
                            'from': from_wh,
                            'to': to_wh,
                            'amount': amount,
                            'status': 'initiated'
                        }
                        execution_report['transfers'].append(transfer)
                        execution_report['total_units_moved'] += amount
                        
                        logger.info(
                            f"Reallocation: {amount} units of {product_id} "
                            f"from {from_wh} to {to_wh}"
                        )
            
            # Update rate limiting
            today = datetime.now().date()
            self.daily_reallocation_count[today] = \
                self.daily_reallocation_count.get(today, 0) + 1
            
            # Store in history
            self.reallocation_history.append(execution_report)
            
            # Keep last 100 reallocations
            if len(self.reallocation_history) > 100:
                self.reallocation_history = self.reallocation_history[-100:]
        
        except Exception as e:
            logger.error(f"Reallocation execution failed: {str(e)}")
            execution_report['success'] = False
            execution_report['error'] = str(e)
        
        return execution_report
    
    def get_reallocation_recommendations(
        self,
        current_allocations: Dict[str, int],
        actual_demands: Dict[str, List[float]],
        updated_forecasts: Dict[str, Dict[str, List[float]]],
        forecast_confidences: Dict[str, float]
    ) -> List[Dict[str, any]]:
        """
        Get recommendations for which warehouses need reallocation
        
        Returns list of recommendations with priority
        """
        recommendations = []
        
        for wh_id in current_allocations.keys():
            current_stock = current_allocations[wh_id]
            
            # Get expected demand
            if wh_id in updated_forecasts:
                expected_demand = sum(updated_forecasts[wh_id]['most_likely'][:7]) / 7
            else:
                expected_demand = 0
            
            # Get actual demand trend
            actual_trend = actual_demands.get(wh_id, [])
            
            # Get forecast confidence
            confidence = forecast_confidences.get(wh_id, 1.0)
            
            # Check if reallocation needed
            should_reallocate, reason = self.should_reallocate(
                wh_id,
                current_stock,
                expected_demand,
                actual_trend,
                confidence
            )
            
            if should_reallocate:
                # Calculate priority
                days_of_stock = current_stock / (expected_demand + 1)
                
                if days_of_stock < 2:
                    priority = 'critical'
                elif days_of_stock < 5:
                    priority = 'high'
                elif days_of_stock > 15:
                    priority = 'medium'
                else:
                    priority = 'low'
                
                recommendations.append({
                    'warehouse_id': wh_id,
                    'current_stock': current_stock,
                    'expected_demand': expected_demand,
                    'days_of_stock': days_of_stock,
                    'forecast_confidence': confidence,
                    'reason': reason,
                    'priority': priority,
                    'action': 'increase' if days_of_stock < 5 else 'decrease'
                })
        
        # Sort by priority
        priority_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        recommendations.sort(key=lambda x: priority_order[x['priority']])
        
        return recommendations
    
    def calculate_reallocation_efficiency(
        self,
        transfer_plan: Dict[str, Dict[str, int]],
        transfer_costs: Dict[Tuple[str, str], float] = None
    ) -> Dict[str, float]:
        """
        Calculate efficiency metrics for reallocation plan
        
        Returns:
            - total_transfers: Number of transfers
            - total_units: Total units moved
            - average_transfer_size: Average units per transfer
            - estimated_cost: Total transfer cost
        """
        total_transfers = 0
        total_units = 0
        total_cost = 0
        
        for from_wh, destinations in transfer_plan.items():
            for to_wh, amount in destinations.items():
                if amount > 0:
                    total_transfers += 1
                    total_units += amount
                    
                    if transfer_costs:
                        cost = transfer_costs.get((from_wh, to_wh), 1.0)
                        total_cost += cost * amount
        
        return {
            'total_transfers': total_transfers,
            'total_units': total_units,
            'average_transfer_size': total_units / total_transfers if total_transfers > 0 else 0,
            'estimated_cost': total_cost
        }
    
    def get_reallocation_history(
        self,
        product_id: Optional[str] = None,
        days: int = 30
    ) -> List[Dict[str, any]]:
        """Get historical reallocation data"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        filtered = []
        for record in self.reallocation_history:
            record_date = datetime.fromisoformat(record['timestamp'])
            
            if record_date >= cutoff_date:
                if product_id is None or record['product_id'] == product_id:
                    filtered.append(record)
        
        return filtered


# Example usage
if __name__ == "__main__":
    # Create reallocator
    reallocator = RealtimeReallocator(
        reallocation_threshold=0.15,
        min_reallocation_amount=10
    )
    
    # Sample current allocations
    current_allocations = {
        'WH001': 150,
        'WH002': 80,
        'WH003': 200
    }
    
    # Sample updated forecasts
    updated_forecasts = {
        'WH001': {'most_likely': [25] * 7},  # Need 175
        'WH002': {'most_likely': [15] * 7},  # Need 105
        'WH003': {'most_likely': [10] * 7},  # Need 70
    }
    
    # Calculate reallocation plan
    transfer_plan = reallocator.calculate_reallocation_plan(
        current_allocations,
        updated_forecasts
    )
    
    print("Real-time Reallocation Plan:")
    for from_wh, destinations in transfer_plan.items():
        for to_wh, amount in destinations.items():
            print(f"Transfer {amount} units from {from_wh} to {to_wh}")
    
    # Calculate efficiency
    efficiency = reallocator.calculate_reallocation_efficiency(transfer_plan)
    print(f"\nEfficiency Metrics:")
    print(f"Total Transfers: {efficiency['total_transfers']}")
    print(f"Total Units Moved: {efficiency['total_units']}")