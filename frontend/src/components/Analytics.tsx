import React, { useState, useEffect, useCallback } from 'react';
import './Analytics.css';
import { apiService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { Analytics as AnalyticsData, WebSocketMessage } from '../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRequests: 0,
    filledRequests: 0,
    fillRate: 0,
    dspPerformance: [],
    cpmTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'ad_request' || message.type === 'analytics_update') {
      fetchAnalytics();
      setLastUpdate(new Date());
    }
  }, []);

  useWebSocket({ onMessage: handleWebSocketMessage });

  const fetchAnalytics = async () => {
    try {
      const response = await apiService.getAnalytics();
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fillRateData = [
    { name: 'Filled', value: analytics.filledRequests },
    { name: 'No Fill', value: analytics.totalRequests - analytics.filledRequests }
  ];

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <span className="last-update">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </span>
      </div>

      <div className="analytics-grid">
        <div className="chart-container">
          <h3>CPM Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.cpmTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avg_cpm" 
                stroke="#667eea" 
                strokeWidth={2}
                name="Average CPM"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Fill Rate Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fillRateData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {fillRateData.map((_, index) => (
  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container full-width">
          <h3>DSP Win Rate Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.dspPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${value}%`} />
              <Legend />
              <Bar dataKey="winRate" fill="#667eea" name="Win Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container full-width">
          <h3>Average CPM by DSP</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.dspPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${value ? Number(value).toFixed(2) : '0.00'}`} />
              <Legend />
              <Bar dataKey="avg_cpm" fill="#764ba2" name="Average CPM ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="metrics-summary">
        <h3>Performance Metrics Summary</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Total Ad Requests</h4>
            <p className="metric-value">{analytics.totalRequests.toLocaleString()}</p>
          </div>
          <div className="metric-card">
            <h4>Fill Rate</h4>
            <p className="metric-value">{analytics.fillRate}%</p>
          </div>
          <div className="metric-card">
            <h4>Average CPM</h4>
            <p className="metric-value">
              ${analytics.cpmTrend.length > 0 
                ? (analytics.cpmTrend.reduce((sum, day) => sum + (day.avg_cpm || 0), 0) / analytics.cpmTrend.length).toFixed(2)
                : '0.00'
              }
            </p>
          </div>
          <div className="metric-card">
            <h4>Best Performing DSP</h4>
            <p className="metric-value">
              {analytics.dspPerformance.length > 0
                ? analytics.dspPerformance.reduce((prev, current) => 
                    (prev.winRate > current.winRate) ? prev : current
                  ).name
                : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h3>Key Insights</h3>
        <div className="insights-list">
          <div className="insight-item">
            <span className="insight-icon">📊</span>
            <div>
              <h4>Fill Rate Trend</h4>
              <p>
                Your current fill rate is {analytics.fillRate}%. 
                {analytics.fillRate > 80 ? ' Excellent performance!' : ' Consider adding more DSPs to improve fill rate.'}
              </p>
            </div>
          </div>
          <div className="insight-item">
            <span className="insight-icon">💰</span>
            <div>
              <h4>Revenue Optimization</h4>
              <p>
                {analytics.dspPerformance.length > 0 && 
                  `${analytics.dspPerformance[0].name} has the highest win rate at ${analytics.dspPerformance[0].winRate}%.`
                }
              </p>
            </div>
          </div>
          <div className="insight-item">
            <span className="insight-icon">📈</span>
            <div>
              <h4>CPM Performance</h4>
              <p>
                Average CPM across all DSPs is trending 
                {analytics.cpmTrend.length > 1 && 
                  (analytics.cpmTrend[analytics.cpmTrend.length - 1].avg_cpm! > analytics.cpmTrend[0].avg_cpm! ? ' up' : ' down')
                }.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;