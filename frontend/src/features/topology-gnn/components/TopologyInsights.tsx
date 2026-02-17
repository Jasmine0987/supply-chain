import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getInsights, getStatistics } from '../topologyGNNSlice';

const TopologyInsights: React.FC = () => {
  const dispatch = useAppDispatch();
  const { insights, statistics, loading } = useAppSelector((state) => state.topologyGNN);

  useEffect(() => {
    dispatch(getInsights());
    dispatch(getStatistics());
  }, [dispatch]);

  if (loading && !insights) return <div className="animate-pulse p-10 text-center">Loading Network Intelligence...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Network Resilience Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg">
          <h3 className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1">Network Resilience</h3>
          <div className="text-4xl font-black">{insights?.resilience_score?.toFixed(2) || '0.00'}</div>
          <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-1000" 
              style={{ width: `${(insights?.resilience_score || 0) * 100}%` }}
            />
          </div>
        </div>

        {/* Bottleneck Alert Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase mb-1">Critical Bottlenecks</h3>
          <div className="text-3xl font-bold text-orange-500">
            {insights?.bottlenecks?.length || 0} Nodes
          </div>
          <p className="text-xs text-gray-400 mt-2">Identified via GNN Attention Mechanisms</p>
        </div>

        {/* Graph Density Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase mb-1">Total Connections</h3>
          <div className="text-3xl font-bold dark:text-white">
            {statistics?.graph_statistics?.num_edges || 0}
          </div>
          <p className="text-xs text-gray-400 mt-2">Active supply chain edges</p>
        </div>
      </div>

      {/* Deep Insights List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 dark:text-white">Temporal Attention Insights</h3>
        <div className="space-y-3">
          {insights?.recommendations?.map((rec: string, i: number) => (
            <div key={i} className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
              <span className="mr-3 mt-1">💡</span>
              <p className="text-sm text-blue-900 dark:text-blue-200">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopologyInsights;