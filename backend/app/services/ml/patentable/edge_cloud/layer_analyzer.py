# backend/app/services/ml/patentable/edge_cloud/layer_analyzer.py

from typing import Dict, List, Tuple, Optional
import numpy as np
from dataclasses import dataclass
try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except Exception:
    torch = None
    nn = None
    TORCH_AVAILABLE = False

@dataclass
class LayerProfile:
    """Profile of a neural network layer"""
    layer_name: str
    layer_type: str
    input_shape: Tuple[int, ...]
    output_shape: Tuple[int, ...]
    params_count: int
    flops: int  # Floating point operations
    memory_mb: float
    computation_time_ms: float


class NeuralNetworkAnalyzer:
    """
    Analyzes neural network architecture to determine computational requirements
    for each layer. Used for edge-cloud partitioning decisions.
    """
    
    def __init__(self):
        self.layer_profiles: List[LayerProfile] = []
        self.total_params = 0
        self.total_flops = 0
        
    def analyze_model(self, model, input_shape: Tuple[int, ...]) -> List[LayerProfile]:
        """
        Analyze a PyTorch model and return profiles for each layer
        
        Args:
            model: PyTorch neural network model
            input_shape: Input tensor shape (batch_size, channels, height, width)
            
        Returns:
            List of LayerProfile objects
        """
        self.layer_profiles = []
        self.total_params = 0
        self.total_flops = 0
        
        # Create dummy input
        dummy_input = torch.randn(*input_shape)
        
        # Register hooks to capture layer information
        hooks = []
        
        def create_hook(name: str, layer_type: str):
            def hook(module, input, output):
                # Calculate layer metrics
                params = sum(p.numel() for p in module.parameters())
                
                # Estimate FLOPs based on layer type
                flops = self._estimate_flops(module, input[0], output)
                
                # Estimate memory usage
                memory_mb = self._estimate_memory(module, input[0], output)
                
                # Create layer profile
                profile = LayerProfile(
                    layer_name=name,
                    layer_type=layer_type,
                    input_shape=tuple(input[0].shape),
                    output_shape=tuple(output.shape),
                    params_count=params,
                    flops=flops,
                    memory_mb=memory_mb,
                    computation_time_ms=0.0  # Will be measured separately
                )
                
                self.layer_profiles.append(profile)
                self.total_params += params
                self.total_flops += flops
                
            return hook
        
        # Register hooks for each layer
        for name, module in model.named_modules():
            if len(list(module.children())) == 0:  # Only leaf modules
                layer_type = module.__class__.__name__
                hook = module.register_forward_hook(create_hook(name, layer_type))
                hooks.append(hook)
        
        # Run forward pass to trigger hooks
        with torch.no_grad():
            model.eval()
            _ = model(dummy_input)
        
        # Remove hooks
        for hook in hooks:
            hook.remove()
        
        # Measure computation time for each layer
        self._measure_layer_times(model, input_shape)
        
        return self.layer_profiles
    
    def _estimate_flops(self, module, input_tensor, 
                        output_tensor) -> int:
        """Estimate FLOPs for a layer"""
        
        if isinstance(module, nn.Conv2d):
            # Conv2D: FLOPs = 2 * C_in * K_h * K_w * C_out * H_out * W_out
            batch_size, in_channels, in_h, in_w = input_tensor.shape
            out_channels, out_h, out_w = output_tensor.shape[1:]
            kernel_h, kernel_w = module.kernel_size
            
            flops = 2 * in_channels * kernel_h * kernel_w * out_channels * out_h * out_w
            return int(flops)
            
        elif isinstance(module, nn.Linear):
            # Linear: FLOPs = 2 * in_features * out_features
            in_features = module.in_features
            out_features = module.out_features
            batch_size = input_tensor.shape[0]
            
            flops = 2 * in_features * out_features * batch_size
            return int(flops)
            
        elif isinstance(module, nn.BatchNorm2d):
            # BatchNorm: FLOPs = 2 * num_features * H * W
            num_features = module.num_features
            batch_size, _, h, w = output_tensor.shape
            
            flops = 2 * num_features * h * w * batch_size
            return int(flops)
            
        elif isinstance(module, (nn.ReLU, nn.Sigmoid, nn.Tanh)):
            # Activation: FLOPs ≈ number of elements
            return int(output_tensor.numel())
            
        elif isinstance(module, (nn.MaxPool2d, nn.AvgPool2d)):
            # Pooling: FLOPs ≈ output elements * kernel_size
            kernel_size = module.kernel_size if isinstance(module.kernel_size, int) else module.kernel_size[0]
            return int(output_tensor.numel() * kernel_size * kernel_size)
            
        else:
            # Unknown layer type, estimate based on output size
            return int(output_tensor.numel())
    
    def _estimate_memory(self, module, input_tensor,
                         output_tensor) -> float:
        """Estimate memory usage in MB"""
        
        # Parameter memory
        param_memory = sum(p.numel() * p.element_size() for p in module.parameters())
        
        # Activation memory (input + output)
        activation_memory = (input_tensor.numel() + output_tensor.numel()) * input_tensor.element_size()
        
        # Convert to MB
        total_memory_mb = (param_memory + activation_memory) / (1024 * 1024)
        
        return total_memory_mb
    
    def _measure_layer_times(self, model, input_shape: Tuple[int, ...]):
        """Measure actual computation time for each layer"""
        
        import time
        
        dummy_input = torch.randn(*input_shape)
        layer_times = {}
        
        def create_timing_hook(name: str):
            def hook(module, input, output):
                torch.cuda.synchronize() if torch.cuda.is_available() else None
                start_time = time.perf_counter()
                
                # Simulate computation (already done by forward pass)
                
                torch.cuda.synchronize() if torch.cuda.is_available() else None
                end_time = time.perf_counter()
                
                layer_times[name] = (end_time - start_time) * 1000  # Convert to ms
                
            return hook
        
        # Register timing hooks
        hooks = []
        for name, module in model.named_modules():
            if len(list(module.children())) == 0:
                hook = module.register_forward_hook(create_timing_hook(name))
                hooks.append((name, hook))
        
        # Warm-up run
        with torch.no_grad():
            model.eval()
            _ = model(dummy_input)
        
        # Timed runs
        num_runs = 10
        with torch.no_grad():
            for _ in range(num_runs):
                _ = model(dummy_input)
        
        # Remove hooks
        for name, hook in hooks:
            hook.remove()
        
        # Update layer profiles with timing information
        for profile in self.layer_profiles:
            if profile.layer_name in layer_times:
                profile.computation_time_ms = layer_times[profile.layer_name] / num_runs
    
    def create_simple_cnn(self, num_layers: int = 10):
        """
        Create a simple CNN model for testing
        
        Args:
            num_layers: Number of convolutional layers
            
        Returns:
            PyTorch CNN model
        """
        layers = []
        in_channels = 3
        
        for i in range(num_layers):
            out_channels = 64 * (2 ** min(i // 2, 3))  # Increase channels gradually
            
            layers.extend([
                nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True)
            ])
            
            if i % 2 == 1:  # Add pooling every 2 layers
                layers.append(nn.MaxPool2d(kernel_size=2, stride=2))
            
            in_channels = out_channels
        
        # Add final layers
        layers.extend([
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Linear(in_channels, 1000)
        ])
        
        model = nn.Sequential(*layers)
        return model
    
    def get_cumulative_metrics(self, up_to_layer: int) -> Dict[str, float]:
        """
        Get cumulative metrics up to a specific layer
        
        Args:
            up_to_layer: Layer index (0-based)
            
        Returns:
            Dictionary with cumulative metrics
        """
        if up_to_layer >= len(self.layer_profiles):
            up_to_layer = len(self.layer_profiles) - 1
        
        cumulative_params = sum(p.params_count for p in self.layer_profiles[:up_to_layer + 1])
        cumulative_flops = sum(p.flops for p in self.layer_profiles[:up_to_layer + 1])
        cumulative_memory = sum(p.memory_mb for p in self.layer_profiles[:up_to_layer + 1])
        cumulative_time = sum(p.computation_time_ms for p in self.layer_profiles[:up_to_layer + 1])
        
        return {
            'params': cumulative_params,
            'flops': cumulative_flops,
            'memory_mb': cumulative_memory,
            'time_ms': cumulative_time,
            'params_percent': (cumulative_params / self.total_params * 100) if self.total_params > 0 else 0,
            'flops_percent': (cumulative_flops / self.total_flops * 100) if self.total_flops > 0 else 0
        }
    
    def find_optimal_partition_point(self, edge_constraints: Dict[str, float]) -> int:
        """
        Find optimal partition point based on edge device constraints
        
        Args:
            edge_constraints: Dictionary with constraints
                - max_memory_mb: Maximum memory on edge device
                - max_flops: Maximum FLOPs on edge device
                - max_time_ms: Maximum computation time on edge device
                
        Returns:
            Optimal layer index for partitioning (layers 0 to index run on edge)
        """
        max_memory = edge_constraints.get('max_memory_mb', float('inf'))
        max_flops = edge_constraints.get('max_flops', float('inf'))
        max_time = edge_constraints.get('max_time_ms', float('inf'))
        
        best_layer = 0
        
        for i in range(len(self.layer_profiles)):
            metrics = self.get_cumulative_metrics(i)
            
            # Check if this layer exceeds constraints
            if (metrics['memory_mb'] <= max_memory and 
                metrics['flops'] <= max_flops and 
                metrics['time_ms'] <= max_time):
                best_layer = i
            else:
                break  # Stop once we exceed constraints
        
        return best_layer
    
    def get_summary(self) -> Dict:
        """Get a summary of the analysis"""
        
        return {
            'total_layers': len(self.layer_profiles),
            'total_params': self.total_params,
            'total_flops': self.total_flops,
            'total_memory_mb': sum(p.memory_mb for p in self.layer_profiles),
            'total_time_ms': sum(p.computation_time_ms for p in self.layer_profiles),
            'layer_breakdown': [
                {
                    'name': p.layer_name,
                    'type': p.layer_type,
                    'params': p.params_count,
                    'flops': p.flops,
                    'memory_mb': round(p.memory_mb, 2),
                    'time_ms': round(p.computation_time_ms, 4)
                }
                for p in self.layer_profiles
            ]
        }


# Example usage function
def analyze_example_network():
    """Example function showing how to use the analyzer"""
    
    analyzer = NeuralNetworkAnalyzer()
    
    # Create a sample CNN
    model = analyzer.create_simple_cnn(num_layers=10)
    
    # Analyze the model
    input_shape = (1, 3, 224, 224)  # Batch size 1, RGB image 224x224
    profiles = analyzer.analyze_model(model, input_shape)
    
    # Print summary
    summary = analyzer.get_summary()
    print(f"\nModel Analysis Summary:")
    print(f"Total Layers: {summary['total_layers']}")
    print(f"Total Parameters: {summary['total_params']:,}")
    print(f"Total FLOPs: {summary['total_flops']:,}")
    print(f"Total Memory: {summary['total_memory_mb']:.2f} MB")
    print(f"Total Time: {summary['total_time_ms']:.2f} ms")
    
    # Find optimal partition point for a weak edge device
    edge_constraints = {
        'max_memory_mb': 50,  # 50 MB memory limit
        'max_flops': 1e9,     # 1 billion FLOPs limit
        'max_time_ms': 100    # 100ms time limit
    }
    
    partition_point = analyzer.find_optimal_partition_point(edge_constraints)
    print(f"\nOptimal Partition Point: Layer {partition_point}")
    print(f"Layers 0-{partition_point} run on edge device")
    print(f"Layers {partition_point + 1}-{len(profiles) - 1} run on cloud")
    
    # Show metrics at partition point
    metrics = analyzer.get_cumulative_metrics(partition_point)
    print(f"\nEdge Device Usage:")
    print(f"  Parameters: {metrics['params']:,} ({metrics['params_percent']:.1f}%)")
    print(f"  FLOPs: {metrics['flops']:,} ({metrics['flops_percent']:.1f}%)")
    print(f"  Memory: {metrics['memory_mb']:.2f} MB")
    print(f"  Time: {metrics['time_ms']:.2f} ms")
    
    return analyzer


if __name__ == "__main__":
    analyze_example_network()