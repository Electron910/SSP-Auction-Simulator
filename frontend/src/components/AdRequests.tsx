import React, { useState, useEffect, useCallback } from 'react';
import './AdRequests.css';
import { apiService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { AdRequestRecord, WebSocketMessage } from '../types';

type FilterType = 'all' | 'filled' | 'no_fill';

const AdRequests: React.FC = () => {
  const [requests, setRequests] = useState<AdRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [newRequestAlert, setNewRequestAlert] = useState(false);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'ad_request') {
      setNewRequestAlert(true);
      fetchRequests();
      setTimeout(() => setNewRequestAlert(false), 3000);
    }
  }, []);

  useWebSocket({ onMessage: handleWebSocketMessage });

  const fetchRequests = async () => {
    try {
      const response = await apiService.getAdRequests();
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch ad requests:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusBadge = (status: string) => {
    return status === 'filled' ? 
      <span className="badge badge-success">Filled</span> : 
      <span className="badge badge-warning">No Fill</span>;
  };

  if (loading) {
    return <div className="loading">Loading ad requests...</div>;
  }

  return (
    <div className="ad-requests">
      <div className="requests-header">
        <h2>Ad Requests Log</h2>
        {newRequestAlert && (
          <span className="new-request-alert">New request received!</span>
        )}
        <div className="filter-controls">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({requests.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'filled' ? 'active' : ''}`}
            onClick={() => setFilter('filled')}
          >
            Filled ({requests.filter(r => r.status === 'filled').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'no_fill' ? 'active' : ''}`}
            onClick={() => setFilter('no_fill')}
          >
            No Fill ({requests.filter(r => r.status === 'no_fill').length})
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="requests-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Timestamp</th>
              <th>Publisher</th>
              <th>Geo</th>
              <th>Device</th>
              <th>Status</th>
              <th>Winner DSP</th>
              <th>Bid (CPM)</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request, index) => (
              <tr key={request.id} className={index === 0 && newRequestAlert ? 'new-row' : ''}>
                <td>#{request.id}</td>
                <td>{new Date(request.created_at).toLocaleString()}</td>
                <td>{request.publisher_id}</td>
                <td>
                  <span className="geo-badge">{request.geo}</span>
                </td>
                <td>
                  <span className="device-badge">{request.device}</span>
                </td>
                <td>{getStatusBadge(request.status)}</td>
                <td>{request.dsp_name || '-'}</td>
                <td>
                  {request.winning_bid ? 
                    <span className="bid-amount">${request.winning_bid.toFixed(2)}</span> : 
                    '-'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredRequests.length === 0 && (
          <div className="no-data">
            No ad requests found for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdRequests;