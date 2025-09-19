import React, { useState, useEffect } from 'react';
import './ScreenTimeTracker.css';

const ScreenTimeTracker = () => {
  const [apps, setApps] = useState([
    { id: 1, name: 'Social Media', time: 0, limit: 120, color: '#FF6B6B' },
    { id: 3, name: 'Gaming', time: 0, limit: 60, color: '#0bb602ff' },
    { id: 2, name: 'Productivity', time: 0, limit: 240, color: '#45B7D1' },
    
  ]);
  const [isTracking, setIsTracking] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  const [showAddApp, setShowAddApp] = useState(false);
  const [newApp, setNewApp] = useState({ name: '', limit: 60, color: '#8884d8' });

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('screenTimeData');
    if (savedData) {
      setApps(JSON.parse(savedData));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('screenTimeData', JSON.stringify(apps));
  }, [apps]);

  // Tracking logic
  useEffect(() => {
    let interval;
    if (isTracking && activeApp) {
      interval = setInterval(() => {
        setApps(prevApps => 
          prevApps.map(app => 
            app.id === activeApp 
              ? { ...app, time: app.time + 1 } 
              : app
          )
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, activeApp]);

  const startTracking = (appId) => {
    setIsTracking(true);
    setActiveApp(appId);
  };

  const stopTracking = () => {
    setIsTracking(false);
    setActiveApp(null);
  };

  const resetTime = (appId) => {
    setApps(prevApps => 
      prevApps.map(app => 
        app.id === appId 
          ? { ...app, time: 0 } 
          : app
      )
    );
  };

  const addNewApp = () => {
    if (newApp.name.trim()) {
      const app = {
        id: Date.now(),
        name: newApp.name,
        time: 0,
        limit: parseInt(newApp.limit) || 60,
        color: newApp.color
      };
      setApps([...apps, app]);
      setNewApp({ name: '', limit: 60, color: '#8884d8' });
      setShowAddApp(false);
    }
  };

  const removeApp = (appId) => {
    setApps(apps.filter(app => app.id !== appId));
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours > 0 ? `${hours}h` : null,
      minutes > 0 ? `${minutes}m` : null,
      `${secs}s`
    ].filter(Boolean).join(' ');
  };

  return (
    <div className="screen-time-tracker">
      <h2 id="main">🕒 Screen Time Tracker</h2>
      <p className="subtitle">Monitor and manage your app usage</p>

      <div className="controls">
        <button 
          onClick={() => setShowAddApp(!showAddApp)}
          className="add-app-btn"
        >
          {showAddApp ? 'Cancel' : '+ Add App'}
        </button>
        
        {isTracking ? (
          <button onClick={stopTracking} className="stop-btn">
            ⏹️ Stop Tracking
          </button>
        ) : (
          <div className="tracking-status">Not tracking</div>
        )}
      </div>

      {showAddApp && (
        <div className="add-app-form">
          <input
            type="text"
            placeholder="App name"
            value={newApp.name}
            onChange={(e) => setNewApp({...newApp, name: e.target.value})}
          />
          <div className="form-row">
            <label>
              Daily Limit (min):
              <input
                type="number"
                value={newApp.limit}
                onChange={(e) => setNewApp({...newApp, limit: e.target.value})}
                min="1"
              />
            </label>
            <label>
              Color:
              <input
                type="color"
                value={newApp.color}
                onChange={(e) => setNewApp({...newApp, color: e.target.value})}
              />
            </label>
          </div>
          <button onClick={addNewApp}>Save App</button>
        </div>
      )}

      <div className="app-grid">
        {apps.map(app => (
          <div 
            key={app.id} 
            className={`app-card ${activeApp === app.id ? 'active' : ''}`}
            style={{ borderColor: app.color }}
          >
            <div className="app-header">
              <h3>{app.name}</h3>
              <button 
                onClick={() => removeApp(app.id)}
                className="remove-btn"
              >
                ×
              </button>
            </div>
            
            <div className="time-display">
              <div className="current-time">{formatTime(app.time)}</div>
              <div className="limit">Limit: {Math.floor(app.limit / 60)}h {app.limit % 60}m</div>
            </div>
            
            <div className="progress-container">
              <div 
                className="progress-bar"
                style={{
                  width: `${Math.min(100, (app.time / app.limit) * 100)}%`,
                  backgroundColor: app.color
                }}
              ></div>
            </div>
            
            <div className="app-actions">
              {activeApp === app.id ? (
                <button 
                  onClick={stopTracking}
                  className="action-btn stop"
                >
                  ⏸️ Pause
                </button>
              ) : (
                <button 
                  onClick={() => startTracking(app.id)}
                  className="action-btn start"
                  disabled={isTracking && activeApp !== null}
                >
                  ▶️ Start
                </button>
              )}
              
              <button 
                onClick={() => resetTime(app.id)}
                className="action-btn reset"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-summary">
        <h3>📊 Daily Summary</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{formatTime(apps.reduce((acc, app) => acc + app.time, 0))}</div>
            <div className="stat-label">Total Screen Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {apps.filter(app => app.time > app.limit * 60).length}
            </div>
            <div className="stat-label">Apps Over Limit</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {apps.length > 0 
                ? formatTime(Math.floor(apps.reduce((acc, app) => acc + app.time, 0) / apps.length))
                : '0s'}
            </div>
            <div className="stat-label">Average per App</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenTimeTracker;