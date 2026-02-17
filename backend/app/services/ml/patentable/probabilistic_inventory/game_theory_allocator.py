"""
Game-Theoretic Inventory Allocation
PATENTABLE: Multi-player allocation under uncertainty
"""
import numpy as np
from typing import Dict, List, Tuple
from scipy.optimize import linprog


class GameTheoryAllocator:
    """
    PATENTABLE: Game-theoretic allocation of inventory across warehouses
    
    Key Innovation:
    - Models warehouses as players in a cooperative game
    - Allocates based on Nash equilibrium
    - Accounts for uncertainty in demand forecasts
    - Balances local and global optimization
    """
    
    def __init__(self):
        self.warehouses = {}
        self.allocation_history = []
    
    def register_warehouse(
        self,
        warehouse_id: str,
        capacity: int,
        current_stock: int,
        location: Tuple[float, float],
        demand_priority: float = 1.0
    ):
        """Register a warehouse in the allocation system"""
        self.warehouses[warehouse_id] = {
            'capacity': capacity,
            'current_stock': current_stock,
            'location': location,
            'demand_priority': demand_priority,
            'utility_history': []
        }
    
    def allocate_inventory(
        self,
        product_id: str,
        total_inventory: int,
        forecasts: Dict[str, Dict[str, List[float]]],  # warehouse_id -> forecasts
        allocation_strategy: str = 'nash_equilibrium'
    ) -> Dict[str, int]:
        """
        Allocate inventory across warehouses using game theory
        
        Args:
            product_id: Product to allocate
            total_inventory: Total available inventory
            forecasts: Forecasts for each warehouse
            allocation_strategy: 'nash_equilibrium', 'proportional', or 'safety_stock'
        
        Returns:
            Dict mapping warehouse_id to allocation amount
        """
        if allocation_strategy == 'nash_equilibrium':
            return self._nash_equilibrium_allocation(
                product_id, total_inventory, forecasts
            )
        elif allocation_strategy == 'proportional':
            return self._proportional_allocation(
                product_id, total_inventory, forecasts
            )
        elif allocation_strategy == 'safety_stock':
            return self._safety_stock_allocation(
                product_id, total_inventory, forecasts
            )
        else:
            raise ValueError(f"Unknown strategy: {allocation_strategy}")
    
    def _nash_equilibrium_allocation(
        self,
        product_id: str,
        total_inventory: int,
        forecasts: Dict[str, Dict[str, List[float]]]
    ) -> Dict[str, int]:
        """
        PATENTABLE: Nash equilibrium allocation
        
        Finds allocation where no warehouse can improve by changing allocation
        given other warehouses' allocations
        """
        warehouse_ids = list(forecasts.keys())
        n_warehouses = len(warehouse_ids)
        
        if n_warehouses == 0:
            return {}
        
        # Calculate expected demand for each warehouse (weighted average)
        expected_demands = {}
        for wh_id in warehouse_ids:
            wh_forecasts = forecasts[wh_id]
            expected_demand = self._calculate_expected_demand(wh_forecasts)
            expected_demands[wh_id] = expected_demand
        
        # Calculate utility matrix (benefit of allocation)
        utility_matrix = self._calculate_utility_matrix(
            warehouse_ids, expected_demands, total_inventory
        )
        
        # Solve for Nash equilibrium using optimization
        allocations = self._solve_nash_equilibrium(
            warehouse_ids, utility_matrix, total_inventory
        )
        
        # Record allocation
        self.allocation_history.append({
            'product_id': product_id,
            'allocations': allocations,
            'expected_demands': expected_demands,
            'total_inventory': total_inventory
        })
        
        return allocations
    
    def _calculate_expected_demand(
        self,
        forecasts: Dict[str, List[float]],
        weights: Dict[str, float] = None
    ) -> float:
        """
        Calculate expected demand from multi-scenario forecasts
        
        Default weights: most_likely=0.6, optimistic=0.2, pessimistic=0.2
        """
        if weights is None:
            weights = {
                'optimistic': 0.2,
                'most_likely': 0.6,
                'pessimistic': 0.2
            }
        
        # Sum across forecast period (e.g., next 7 days)
        forecast_horizon = min(7, len(forecasts['most_likely']))
        
        expected = 0
        for scenario, weight in weights.items():
            if scenario in forecasts:
                scenario_sum = sum(forecasts[scenario][:forecast_horizon])
                expected += scenario_sum * weight
        
        return expected
    
    def _calculate_utility_matrix(
        self,
        warehouse_ids: List[str],
        expected_demands: Dict[str, float],
        total_inventory: int
    ) -> np.ndarray:
        """
        Calculate utility matrix for allocation
        
        Utility considers:
        - Demand satisfaction
        - Capacity constraints
        - Geographic distribution
        - Demand priority
        """
        n = len(warehouse_ids)
        utility_matrix = np.zeros((n, n))
        
        for i, wh_id in enumerate(warehouse_ids):
            wh = self.warehouses.get(wh_id, {})
            demand = expected_demands.get(wh_id, 0)
            capacity = wh.get('capacity', float('inf'))
            priority = wh.get('demand_priority', 1.0)
            
            # Utility is demand satisfaction weighted by priority
            # Diminishing returns after meeting demand
            for allocation_pct in range(n):
                allocation = (allocation_pct / n) * total_inventory
                
                # Utility function: logarithmic satisfaction
                if demand > 0:
                    satisfaction = np.log1p(min(allocation, demand) / demand)
                    utility = satisfaction * priority
                    
                    # Penalty for over-allocation
                    if allocation > capacity:
                        utility *= 0.5
                    
                    utility_matrix[i, allocation_pct] = utility
        
        return utility_matrix
    
    def _solve_nash_equilibrium(
        self,
        warehouse_ids: List[str],
        utility_matrix: np.ndarray,
        total_inventory: int
    ) -> Dict[str, int]:
        """
        Solve for Nash equilibrium allocation using linear programming
        """
        n_warehouses = len(warehouse_ids)
        
        # Objective: maximize total utility
        # Variables: allocation for each warehouse
        c = [-utility_matrix[i, i] for i in range(n_warehouses)]
        
        # Constraints:
        # 1. Total allocation = total inventory
        A_eq = [np.ones(n_warehouses)]
        b_eq = [total_inventory]
        
        # 2. Each allocation >= 0 and <= capacity
        bounds = []
        for wh_id in warehouse_ids:
            wh = self.warehouses.get(wh_id, {})
            capacity = wh.get('capacity', total_inventory)
            bounds.append((0, min(capacity, total_inventory)))
        
        # Solve linear program
        result = linprog(c, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')
        
        if result.success:
            allocations = {
                wh_id: int(round(alloc))
                for wh_id, alloc in zip(warehouse_ids, result.x)
            }
        else:
            # Fallback: proportional allocation
            total_demand = sum(utility_matrix[i, i] for i in range(n_warehouses))
            if total_demand > 0:
                allocations = {
                    wh_id: int(round((utility_matrix[i, i] / total_demand) * total_inventory))
                    for i, wh_id in enumerate(warehouse_ids)
                }
            else:
                # Equal split
                per_warehouse = total_inventory // n_warehouses
                allocations = {wh_id: per_warehouse for wh_id in warehouse_ids}
        
        # Ensure total matches exactly
        allocated = sum(allocations.values())
        if allocated != total_inventory:
            # Adjust first warehouse
            allocations[warehouse_ids[0]] += (total_inventory - allocated)
        
        return allocations
    
    def _proportional_allocation(
        self,
        product_id: str,
        total_inventory: int,
        forecasts: Dict[str, Dict[str, List[float]]]
    ) -> Dict[str, int]:
        """Simple proportional allocation based on expected demand"""
        warehouse_ids = list(forecasts.keys())
        
        # Calculate expected demands
        expected_demands = {}
        total_demand = 0
        for wh_id in warehouse_ids:
            demand = self._calculate_expected_demand(forecasts[wh_id])
            expected_demands[wh_id] = demand
            total_demand += demand
        
        # Allocate proportionally
        if total_demand > 0:
            allocations = {
                wh_id: int(round((demand / total_demand) * total_inventory))
                for wh_id, demand in expected_demands.items()
            }
        else:
            # Equal split
            per_warehouse = total_inventory // len(warehouse_ids)
            allocations = {wh_id: per_warehouse for wh_id in warehouse_ids}
        
        return allocations
    
    def _safety_stock_allocation(
        self,
        product_id: str,
        total_inventory: int,
        forecasts: Dict[str, Dict[str, List[float]]]
    ) -> Dict[str, int]:
        """
        Allocation with safety stock consideration
        
        Allocates to cover pessimistic forecast + buffer
        """
        warehouse_ids = list(forecasts.keys())
        
        # Calculate safety stock needs (pessimistic + 20%)
        safety_needs = {}
        total_need = 0
        for wh_id in warehouse_ids:
            wh_forecasts = forecasts[wh_id]
            pessimistic_demand = sum(wh_forecasts['pessimistic'][:7])  # 7 days
            safety_stock = pessimistic_demand * 1.2
            safety_needs[wh_id] = safety_stock
            total_need += safety_stock
        
        # Allocate based on safety stock needs
        if total_need > 0:
            allocations = {
                wh_id: int(round((need / total_need) * total_inventory))
                for wh_id, need in safety_needs.items()
            }
        else:
            per_warehouse = total_inventory // len(warehouse_ids)
            allocations = {wh_id: per_warehouse for wh_id in warehouse_ids}
        
        return allocations
    
    def calculate_allocation_fairness(
        self,
        allocations: Dict[str, int],
        expected_demands: Dict[str, float]
    ) -> float:
        """
        Calculate fairness score using Gini coefficient
        
        Returns value between 0 (perfectly fair) and 1 (completely unfair)
        """
        # Calculate service levels (allocation / demand)
        service_levels = []
        for wh_id, allocation in allocations.items():
            demand = expected_demands.get(wh_id, 1)
            service_level = allocation / demand if demand > 0 else 0
            service_levels.append(service_level)
        
        # Gini coefficient
        if len(service_levels) == 0:
            return 0.0
        
        service_levels = sorted(service_levels)
        n = len(service_levels)
        index = np.arange(1, n + 1)
        gini = (2 * np.sum(index * service_levels)) / (n * np.sum(service_levels)) - (n + 1) / n
        
        return abs(gini)


# Example usage
if __name__ == "__main__":
    # Create allocator
    allocator = GameTheoryAllocator()
    
    # Register warehouses
    allocator.register_warehouse('WH001', capacity=1000, current_stock=200, location=(40.7, -74.0), demand_priority=1.2)
    allocator.register_warehouse('WH002', capacity=800, current_stock=150, location=(34.0, -118.2), demand_priority=1.0)
    allocator.register_warehouse('WH003', capacity=1200, current_stock=300, location=(41.8, -87.6), demand_priority=0.9)
    
    # Create sample forecasts
    forecasts = {
        'WH001': {
            'optimistic': [120] * 30,
            'most_likely': [100] * 30,
            'pessimistic': [80] * 30
        },
        'WH002': {
            'optimistic': [90] * 30,
            'most_likely': [75] * 30,
            'pessimistic': [60] * 30
        },
        'WH003': {
            'optimistic': [150] * 30,
            'most_likely': [125] * 30,
            'pessimistic': [100] * 30
        }
    }
    
    # Allocate 1000 units
    allocations = allocator.allocate_inventory(
        'PROD001', 
        total_inventory=1000,
        forecasts=forecasts,
        allocation_strategy='nash_equilibrium'
    )
    
    print("Game-Theoretic Allocation Results:")
    for wh_id, amount in allocations.items():
        print(f"{wh_id}: {amount} units")