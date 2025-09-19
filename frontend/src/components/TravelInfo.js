import React, { useState, useEffect } from 'react';
import './TravelInfo.css';

const TravelInfo = () => {
  const [travelLog, setTravelLog] = useState([]);
  const [purpose, setPurpose] = useState('');
  const [transport, setTransport] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user's location and nearby hospitals
  useEffect(() => {
    const fetchLocationAndHospitals = async () => {
      try {
        setLoading(true);
        
        // Get user's current location
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Fetch nearby hospitals (using mock data for demonstration)
        const mockHospitals = await fetchNearbyHospitals(latitude, longitude);
        setHospitals(mockHospitals);
        
      } catch (err) {
        setError("Unable to get location. Using default hospitals.");
        console.error(err);
        setHospitals(getDefaultHospitals());
      } finally {
        setLoading(false);
      }
    };

    fetchLocationAndHospitals();
    
    // Load saved travel logs from localStorage
    const savedLogs = localStorage.getItem('travelLogs');
    if (savedLogs) {
      setTravelLog(JSON.parse(savedLogs));
    }
  }, []);

  // Save travel logs to localStorage when they change
  useEffect(() => {
    localStorage.setItem('travelLogs', JSON.stringify(travelLog));
  }, [travelLog]);

  // Mock function to simulate API call
  const fetchNearbyHospitals = async (lat, lng) => {
    // In a real app, you would call an actual API like Google Places
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            name: 'Nearest General Hospital',
            distance: '1.2 km',
            department: 'Emergency',
            status: 'Open',
            mapLink: `https://maps.google.com?q=hospital&near=${lat},${lng}`
          },
          {
            name: 'City Medical Center',
            distance: '2.8 km',
            department: 'OB/GYN',
            status: 'Open',
            mapLink: `https://maps.google.com?q=medical+center&near=${lat},${lng}`
          }
        ]);
      }, 1000);
    });
  };

  const getDefaultHospitals = () => {
    return [
      {
        name: 'Bangkok General Hospital',
        distance: 'Unknown distance',
        department: 'OB/GYN',
        status: 'Open',
        mapLink: 'https://maps.google.com?q=Bangkok+General+Hospital'
      },
      {
        name: 'Vajira Hospital',
        distance: 'Unknown distance',
        department: 'General',
        status: 'Closed',
        mapLink: 'https://maps.google.com?q=Vajira+Hospital'
      }
    ];
  };

  const handleAddLog = () => {
    if (!purpose.trim() || !transport.trim()) return;
    
    const log = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      purpose,
      transport
    };
    
    setTravelLog([log, ...travelLog]); // Newest first
    setPurpose('');
    setTransport('');
  };

  const handleDeleteLog = (id) => {
    setTravelLog(travelLog.filter(log => log.id !== id));
  };

  const getDirections = (hospital) => {
    if (userLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${hospital.name}&travelmode=driving`;
    }
    return hospital.mapLink;
  };

  return (
    <div className="travel-info-container">
      <h2> Travel Information</h2>

      <section className="hospital-list">
        <h3>🏥 Nearby Hospitals</h3>
        
        {loading && <p className="loading">Finding hospitals near you...</p>}
        {error && <p className="error">{error}</p>}
        
        <div className="hospital-grid">
          {hospitals.map((hospital, idx) => (
            <div key={idx} className="hospital-card">
              <div className="hospital-header">
                <h4>{hospital.name}</h4>
                <span className={`status ${hospital.status === 'Open' ? 'open' : 'closed'}`}>
                  {hospital.status === 'Open' ? '✅ Open' : '❌ Closed'}
                </span>
              </div>
              
              <div className="hospital-details">
                <p>📍 {hospital.distance}</p>
                <p>🩺 {hospital.department}</p>
              </div>
              
              <div className="hospital-actions">
                <a 
                  href={getDirections(hospital)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  🗺 Get Directions
                </a>
                {userLocation && (
                  <span className="travel-time">
                    🚗 ~{Math.floor(Math.random() * 15) + 5} min
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="travel-log">
        <h3>📝 Travel Log</h3>
        
        <div className="log-form">
          <input
            type="text"
            placeholder="Purpose (e.g. checkup, emergency)"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="log-input"
          />
          <input
            type="text"
            placeholder="Transport (e.g. taxi, car, ambulance)"
            value={transport}
            onChange={(e) => setTransport(e.target.value)}
            className="log-input"
          />
          <button 
            onClick={handleAddLog}
            className="add-log-btn"
            disabled={!purpose.trim() || !transport.trim()}
          >
            ➕ Add Travel Entry
          </button>
        </div>

        {travelLog.length > 0 ? (
          <ul className="travel-log-list">
            {travelLog.map((log) => (
              <li key={log.id} className="log-item">
                <div className="log-content">
                  <span className="log-date">{log.date}</span>
                  <span className="log-purpose">{log.purpose}</span>
                  <span className="log-transport">via {log.transport}</span>
                </div>
                <button 
                  onClick={() => handleDeleteLog(log.id)}
                  className="delete-log-btn"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-logs">No travel logs yet. Add your first entry!</p>
        )}
      </section>
    </div>
  );
};

export default TravelInfo;