import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { analyzeSupplyChain, addEntity} from '../topologyGNNSlice';

const GraphVisualizer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { analysis, loading } = useAppSelector((state) => state.topologyGNN);
  const svgRef = useRef<SVGSVGElement>(null);

  const [showAddEntity, setShowAddEntity] = useState(false);
  const [newEntity, setNewEntity] = useState({ id: '', type: 'warehouse' });

  useEffect(() => {
    dispatch(analyzeSupplyChain());
  }, [dispatch]);

  useEffect(() => {
    if (analysis && svgRef.current) {
      renderGraph();
    }
  }, [analysis]);

  const renderGraph = () => {
    if (!svgRef.current || !analysis) return;

    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const nodes = analysis.node_details || [];
    if (nodes.length === 0) return;

    // Position nodes in grid
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const cellWidth = width / (cols + 1);
    const cellHeight = height / (Math.ceil(nodes.length / cols) + 1);

    const nodePositions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((node: any, i: number) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      nodePositions[node.node_id] = {
        x: (col + 1) * cellWidth,
        y: (row + 1) * cellHeight
      };
    });

    // Node colors by type
    const getNodeColor = (type: string) => {
      const colors: Record<string, string> = {
        supplier: '#3b82f6',
        warehouse: '#10b981',
        distributor: '#f59e0b',
        customer: '#ef4444',
        route: '#8b5cf6'
      };
      return colors[type] || '#6b7280';
    };

    // Draw nodes
    nodes.forEach((node: any) => {
      const pos = nodePositions[node.node_id];
      const size = 15 + (node.importance_score * 20);

      // Circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x.toString());
      circle.setAttribute('cy', pos.y.toString());
      circle.setAttribute('r', size.toString());
      circle.setAttribute('fill', getNodeColor(node.type));
      circle.setAttribute('stroke', '#1f2937');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('opacity', '0.9');
      svg.appendChild(circle);

      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x.toString());
      text.setAttribute('y', (pos.y + size + 15).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#9ca3af');
      text.setAttribute('font-size', '10');
      text.textContent = node.node_id.slice(0, 8);
      svg.appendChild(text);

      // Importance badge
      const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      badge.setAttribute('x', pos.x.toString());
      badge.setAttribute('y', (pos.y + 4).toString());
      badge.setAttribute('text-anchor', 'middle');
      badge.setAttribute('fill', 'white');
      badge.setAttribute('font-size', '9');
      badge.setAttribute('font-weight', 'bold');
      badge.textContent = node.importance_score.toFixed(2);
      svg.appendChild(badge);
    });
  };

  const handleAddEntity = async () => {
    if (!newEntity.id) return;
    
    await dispatch(addEntity({
      entity_id: newEntity.id,
      entity_type: newEntity.type,
      attributes: {}
    }));
    
    setShowAddEntity(false);
    setNewEntity({ id: '', type: 'warehouse' });
    dispatch(analyzeSupplyChain());
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          🕸️ Supply Chain Topology
        </h2>
        <button
          onClick={() => setShowAddEntity(!showAddEntity)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Entity
        </button>
      </div>

      {/* Add Entity Form */}
      {showAddEntity && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={newEntity.id}
              onChange={(e) => setNewEntity({ ...newEntity, id: e.target.value })}
              placeholder="Entity ID (e.g., SUP001)"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={newEntity.type}
              onChange={(e) => setNewEntity({ ...newEntity, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="supplier">Supplier</option>
              <option value="warehouse">Warehouse</option>
              <option value="distributor">Distributor</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <button
            onClick={handleAddEntity}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Entity
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : analysis ? (
        <div>
          {/* Graph Statistics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nodes</div>
              <div className="text-2xl font-bold">{analysis.graph_statistics?.total_nodes}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Edges</div>
              <div className="text-2xl font-bold">{analysis.graph_statistics?.total_edges}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Degree</div>
              <div className="text-2xl font-bold">{analysis.graph_statistics?.avg_degree?.toFixed(1)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Health</div>
              <div className={`text-xl font-bold ${
                analysis.topology_health === 'healthy' ? 'text-green-600' :
                analysis.topology_health === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analysis.topology_health}
              </div>
            </div>
          </div>

          {/* Graph Visualization */}
          <svg
            ref={svgRef}
            className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700"
            style={{ height: '500px' }}
          />

          {/* Legend */}
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">Supplier</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">Warehouse</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">Distributor</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-gray-700 dark:text-gray-300">Customer</span>
            </div>
          </div>

          {/* Critical Nodes */}
          {analysis.critical_nodes && analysis.critical_nodes.length > 0 && (
            <div className="mt-6 bg-white dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">🔥 Critical Nodes</h3>
              <div className="space-y-2">
                {analysis.critical_nodes.slice(0, 5).map((node: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="font-medium">{node.node_id}</span>
                    <span className="text-sm text-gray-500">
                      Importance: {node.importance.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No topology data. Initialize the system first.</p>
        </div>
      )}
    </div>
  );
};

export default GraphVisualizer;