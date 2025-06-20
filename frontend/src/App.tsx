import { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import AdRequests from './components/AdRequests';
import DSPManager from './components/DSPManager';
import Analytics from './components/Analytics';

type TabType = 'dashboard' | 'requests' | 'dsps' | 'analytics';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'requests':
        return <AdRequests />;
      case 'dsps':
        return <DSPManager />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>SSP Ad Auction Simulator</h1>
        <p>Supply Side Platform Admin Panel</p>
      </header>
      
      <nav className="app-nav">
        <button 
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Ad Requests
        </button>
        <button 
          className={`nav-button ${activeTab === 'dsps' ? 'active' : ''}`}
          onClick={() => setActiveTab('dsps')}
        >
          DSP Manager
        </button>
        <button 
          className={`nav-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </nav>
      
      <main className="app-content">
        {renderContent()}
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2024 SSP Ad Auction Simulator | Built with React & Node.js</p>
      </footer>
    </div>
  );
}

export default App;