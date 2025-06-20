import React, { useState, useEffect, useCallback } from 'react';
import './DSPManager.css';
import { apiService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { DSP, DSPFormData, TargetingRules, WebSocketMessage } from '../types';

const DSPManager: React.FC = () => {
  const [dsps, setDsps] = useState<DSP[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDsp, setEditingDsp] = useState<DSP | null>(null);
  const [formData, setFormData] = useState<DSPFormData>({
    name: '',
    baseBid: '',
    targetingGeo: [],
    targetingDevice: []
  });
  const [updateNotification, setUpdateNotification] = useState('');

  const geoOptions = ['US', 'CA', 'UK', 'DE', 'FR', 'JP', 'AU'];
  const deviceOptions = ['mobile', 'desktop', 'tablet'];

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'dsp_update') {
      setUpdateNotification(`DSP ${message.data.action}`);
      fetchDsps();
      setTimeout(() => setUpdateNotification(''), 3000);
    }
  }, []);

  useWebSocket({ onMessage: handleWebSocketMessage });

  const fetchDsps = async () => {
    try {
      const response = await apiService.getDSPs();
      setDsps(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch DSPs:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDsps();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetingRules: TargetingRules = {
      geo: formData.targetingGeo,
      device: formData.targetingDevice
    };

    const payload = {
      name: formData.name,
      baseBid: parseFloat(formData.baseBid),
      targetingRules,
      creativeUrl: `https://via.placeholder.com/300x250/667eea/FFFFFF?text=${formData.name.replace(/\s+/g, '+')}`
    };

    try {
      if (editingDsp) {
        await apiService.updateDSP(editingDsp.id, payload);
      } else {
        await apiService.createDSP(payload);
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to save DSP:', error);
      alert('Failed to save DSP. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      baseBid: '',
      targetingGeo: [],
      targetingDevice: []
    });
    setEditingDsp(null);
    setShowForm(false);
  };

  const handleEdit = (dsp: DSP) => {
    const targeting: TargetingRules = JSON.parse(dsp.targeting_rules);
    setFormData({
      name: dsp.name,
      baseBid: dsp.base_bid.toString(),
      targetingGeo: targeting.geo || [],
      targetingDevice: targeting.device || []
    });
    setEditingDsp(dsp);
    setShowForm(true);
  };

  const handleCheckboxChange = (type: 'targetingGeo' | 'targetingDevice', value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
                : [...prev[type], value]
    }));
  };

  if (loading) {
    return <div className="loading">Loading DSPs...</div>;
  }

  return (
    <div className="dsp-manager">
      <div className="dsp-header">
        <h2>DSP Manager</h2>
        {updateNotification && (
          <span className="update-notification">{updateNotification}</span>
        )}
        <button 
          className="add-dsp-btn"
          onClick={() => setShowForm(true)}
        >
          + Add New DSP
        </button>
      </div>

      {showForm && (
        <div className="dsp-form-container">
          <form className="dsp-form" onSubmit={handleSubmit}>
            <h3>{editingDsp ? 'Edit DSP' : 'Create New DSP'}</h3>
            
            <div className="form-group">
              <label>DSP Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Enter DSP name"
              />
            </div>

            <div className="form-group">
              <label>Base Bid (CPM in $)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.baseBid}
                onChange={(e) => setFormData({...formData, baseBid: e.target.value})}
                required
                placeholder="e.g., 2.50"
              />
            </div>

            <div className="form-group">
              <label>Geographic Targeting</label>
              <div className="checkbox-group">
                {geoOptions.map(geo => (
                  <label key={geo} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.targetingGeo.includes(geo)}
                      onChange={() => handleCheckboxChange('targetingGeo', geo)}
                    />
                    {geo}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Device Targeting</label>
              <div className="checkbox-group">
                {deviceOptions.map(device => (
                  <label key={device} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.targetingDevice.includes(device)}
                      onChange={() => handleCheckboxChange('targetingDevice', device)}
                    />
                    {device}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingDsp ? 'Update DSP' : 'Create DSP'}
              </button>
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="dsp-list">
        <h3>Existing DSPs</h3>
        <div className="dsp-grid">
          {dsps.map(dsp => {
            const targeting: TargetingRules = JSON.parse(dsp.targeting_rules);
            return (
              <div key={dsp.id} className="dsp-card">
                <div className="dsp-card-header">
                  <h4>{dsp.name}</h4>
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(dsp)}
                  >
                    Edit
                  </button>
                </div>
                <div className="dsp-info">
                  <p><strong>Base Bid:</strong> ${dsp.base_bid.toFixed(2)}</p>
                  <p><strong>Geo Targeting:</strong> {targeting.geo.join(', ')}</p>
                  <p><strong>Device Targeting:</strong> {targeting.device.join(', ')}</p>
                  <p><strong>Created:</strong> {new Date(dsp.created_at).toLocaleDateString()}</p>
                </div>
                <div className="dsp-preview">
                  <img src={dsp.creative_url} alt={`${dsp.name} creative`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DSPManager;