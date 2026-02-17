import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getCausalGraph } from '../sensorFusionSlice';

const CausalGraphView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { causalGraph, loading } = useAppSelector((state) => state.sensorFusion);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    dispatch(getCausalGraph());
  }, [dispatch]);

  useEffect(() => {
    if (causalGraph && svgRef.current) {
      renderGraph();
    }
  }, [causalGraph]);

  const renderGraph = () => {
    if (!svgRef.current || !causalGraph) return;

    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const nodes = causalGraph.nodes || [];
    const edges = causalGraph.edges || [];

    if (nodes.length === 0) return;

    // Position nodes in a circle
    const radius = Math.min(width, height) / 3;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodePositions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((node: string, i: number) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      nodePositions[node] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Draw edges
    edges.forEach((edge: any) => {
      const from = nodePositions[edge.from];
      const to = nodePositions[edge.to];

      if (!from || !to) return;

      // Arrow line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', from.x.toString());
      line.setAttribute('y1', from.y.toString());
      line.setAttribute('x2', to.x.toString());
      line.setAttribute('y2', to.y.toString());
      line.setAttribute('stroke', '#60a5fa');
      line.setAttribute('stroke-width', (edge.strength * 4).toString());
      line.setAttribute('marker-end', 'url(#arrowhead)');
      line.setAttribute('opacity', '0.6');
      svg.appendChild(line);

      // Edge label
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', midX.toString());
      text.setAttribute('y', (midY - 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#9ca3af');
      text.setAttribute('font-size', '10');
      text.textContent = edge.strength.toFixed(2);
      svg.appendChild(text);
    });

    // Draw nodes
    nodes.forEach((node: string) => {
      const pos = nodePositions[node];

      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x.toString());
      circle.setAttribute('cy', pos.y.toString());
      circle.setAttribute('r', '25');
      circle.setAttribute('fill', '#3b82f6');
      circle.setAttribute('stroke', '#1e40af');
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);

      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x.toString());
      text.setAttribute('y', (pos.y + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-weight', 'bold');
      text.textContent = node.slice(0, 4);
      svg.appendChild(text);
    });

    // Add arrowhead marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', '#60a5fa');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.insertBefore(defs, svg.firstChild);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        🔗 Causal Relationship Graph
      </h2>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>💡 Causal Graph:</strong> Shows learned causal relationships between sensors.
          Arrows indicate causation direction, thickness shows relationship strength.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading causal graph...</p>
        </div>
      ) : causalGraph ? (
        <div>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Nodes</div>
              <div className="text-3xl font-bold text-blue-600">
                {causalGraph.nodes?.length || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Causal Edges</div>
              <div className="text-3xl font-bold text-purple-600">
                {causalGraph.total_edges || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Strength</div>
              <div className="text-3xl font-bold text-green-600">
                {causalGraph.edges?.length > 0
                  ? (causalGraph.edges.reduce((sum: number, e: any) => sum + e.strength, 0) / causalGraph.edges.length).toFixed(2)
                  : '0.00'}
              </div>
            </div>
          </div>

          {/* Graph Visualization */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Causal Network
            </h3>
            <svg
              ref={svgRef}
              className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg"
              style={{ height: '500px' }}
            />
          </div>

          {/* Edge Details Table */}
          {causalGraph.edges && causalGraph.edges.length > 0 && (
            <div className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Causal Relationships
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        From
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        →
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        To
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Strength
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Time Lag
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Mechanism
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {causalGraph.edges.map((edge: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {edge.from}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-blue-600">
                          →
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {edge.to}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className={`font-semibold ${edge.strength > 0.7 ? 'text-green-600' : edge.strength > 0.4 ? 'text-yellow-600' : 'text-gray-600'}`}>
                            {edge.strength.toFixed(3)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-700 dark:text-gray-300">
                          {edge.lag || 0} steps
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {edge.mechanism || 'unknown'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No causal graph available. Process a shipment first to learn causal relationships.
          </p>
        </div>
      )}
    </div>
  );
};

export default CausalGraphView;