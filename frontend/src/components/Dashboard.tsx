import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import { apiService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { Analytics, AdRequest, AuctionResult, WebSocketMessage } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Analytics>({
    totalRequests: 0,
    filledRequests: 0,
    fillRate: 0,
    dspPerformance: [],
    cpmTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<AuctionResult | null>(null);
  const [realtimeUpdate, setRealtimeUpdate] = useState<string>('');

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'ad_request') {
      setRealtimeUpdate(`New ad request: ${message.data.status} - ${message.data.geo}`);
      // Refresh analytics when new request comes in
      fetchAnalytics();
    } else if (message.type === 'analytics_update') {
      fetchAnalytics();
    }
  }, []);

  useWebSocket({ onMessage: handleWebSocketMessage });

  const fetchAnalytics = async () => {
    try {
      const response = await apiService.getAnalytics();
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleTestRequest = async () => {
    const testData: AdRequest = {
      publisherId: `pub_${Date.now()}`,
      geo: ['US', 'CA', 'UK'][Math.floor(Math.random() * 3)],
      device: ['mobile', 'desktop'][Math.floor(Math.random() * 2)],
      userId: `user_${Math.floor(Math.random() * 1000)}`
    };

    try {
      const response = await apiService.createAdRequest(testData);
      setTestResult(response.data);
    } catch (error) {
      console.error('Test request failed:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>
      
      {realtimeUpdate && (
        <div className="realtime-notification">
          <span className="pulse-dot"></span>
          {realtimeUpdate}
        </div>
      )}
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Requests</h3>
            <p className="stat-value">{stats.totalRequests.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Filled Requests</h3>
            <p className="stat-value">{stats.filledRequests.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Fill Rate</h3>
            <p className="stat-value">{stats.fillRate}%</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Active DSPs</h3>
            <p className="stat-value">{stats.dspPerformance.length}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>DSP Performance</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>DSP Name</th>
                <th>Wins</th>
                <th>Win Rate</th>
                <th>Avg CPM</th>
              </tr>
            </thead>
            <tbody>
              {stats.dspPerformance.map(dsp => (
                <tr key={dsp.id}>
                  <td>{dsp.name}</td>
                  <td>{dsp.wins}</td>
                  <td>{dsp.winRate}%</td>
                  <td>${dsp.avg_cpm ? dsp.avg_cpm.toFixed(2) : '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Test Ad Request</h3>
        <button className="test-button" onClick={handleTestRequest}>
          Send Test Request
        </button>
        
        {testResult && (
          <div className="test-result">
            <h4>Test Result:</h4>
            <pre>{JSON.stringify(testResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;