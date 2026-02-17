import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Boxes, Warehouse, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface SearchResult {
  type: 'shipment' | 'inventory' | 'warehouse' | 'alert';
  id: number;
  title: string;
  subtitle: string;
  url: string;
}

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Search API call
  useEffect(() => {
    const searchAll = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const [shipments, inventory, warehouses, alerts] = await Promise.all([
          api.get('/api/v1/shipments', { params: { limit: 5 } }),
          api.get('/api/v1/inventory', { params: { limit: 5 } }),
          api.get('/api/v1/warehouses', { params: { limit: 5 } }),
          api.get('/api/v1/alerts', { params: { limit: 5 } }),
        ]);

        const searchResults: SearchResult[] = [];

        // Filter shipments
        shipments.data
          .filter((s: any) =>
            s.tracking_number.toLowerCase().includes(query.toLowerCase())
          )
          .forEach((s: any) => {
            searchResults.push({
              type: 'shipment',
              id: s.id,
              title: s.tracking_number,
              subtitle: `Status: ${s.status}`,
              url: `/shipments/${s.id}`,
            });
          });

        // Filter inventory
        inventory.data
          .filter(
            (i: any) =>
              i.sku.toLowerCase().includes(query.toLowerCase()) ||
              i.name.toLowerCase().includes(query.toLowerCase())
          )
          .forEach((i: any) => {
            searchResults.push({
              type: 'inventory',
              id: i.id,
              title: i.name,
              subtitle: `SKU: ${i.sku}`,
              url: `/inventory`,
            });
          });

        // Filter warehouses
        warehouses.data
          .filter(
            (w: any) =>
              w.name.toLowerCase().includes(query.toLowerCase()) ||
              w.code.toLowerCase().includes(query.toLowerCase())
          )
          .forEach((w: any) => {
            searchResults.push({
              type: 'warehouse',
              id: w.id,
              title: w.name,
              subtitle: w.city,
              url: `/warehouses`,
            });
          });

        // Filter alerts
        alerts.data
          .filter((a: any) => a.title.toLowerCase().includes(query.toLowerCase()))
          .forEach((a: any) => {
            searchResults.push({
              type: 'alert',
              id: a.id,
              title: a.title,
              subtitle: `Severity: ${a.severity}`,
              url: `/alerts`,
            });
          });

        setResults(searchResults.slice(0, 10));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchAll, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'shipment':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'inventory':
        return <Boxes className="h-5 w-5 text-green-600" />;
      case 'warehouse':
        return <Warehouse className="h-5 w-5 text-purple-600" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Search className="h-5 w-5" />;
    }
  };

  const handleResultClick = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
        <kbd className="hidden md:inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-20">
      <div
        ref={searchRef}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shipments, inventory, warehouses..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white"
            autoFocus
          />
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result.url)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                >
                  {getIcon(result.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {result.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{result.subtitle}</p>
                  </div>
                  <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-gray-500">No results found</div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Start typing to search...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>⏎ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;