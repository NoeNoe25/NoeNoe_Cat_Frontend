import React, { useState, useEffect, useRef } from 'react';
import './MedicationReminder.css';
import notificationSound from '../assets/notification.wav'; // You need to add this file to your project

function MedicationReminder() {
  // Medication data state
  const [medications, setMedications] = useState([]);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [times, setTimes] = useState([{ hour: '08', minute: '00' }]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Notification states
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showInAppNotification, setShowInAppNotification] = useState(false);
  const [currentMedication, setCurrentMedication] = useState(null);
  
  // Refs
  const notificationRef = useRef(null);
  const audioRef = useRef(null);
  
  // Time options
  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.volume = 0.5;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  // Check for due medications every minute
  useEffect(() => {
    const interval = setInterval(checkMedicationTimes, 60000);
    checkMedicationTimes(); // Run immediately on mount
    
    return () => clearInterval(interval);
  }, [medications]);

  const checkMedicationTimes = () => {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');

    medications.forEach(med => {
      med.times.forEach(time => {
        if (time.hour === currentHour && time.minute === currentMinute && isMedicationActive(med)) {
          showNotification(med);
        }
      });
    });
  };

  const isMedicationActive = (med) => {
    const today = new Date();
    const start = new Date(med.startDate);
    const end = med.endDate ? new Date(med.endDate) : null;
    return today >= start && (!end || today <= end);
  };

  const showNotification = (medication) => {
    // Play sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Rewind to start
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    // Show browser notification if permission granted
    if (notificationPermission === 'granted') {
      if (notificationRef.current) {
        notificationRef.current.close();
      }

      const options = {
        body: `Time to take ${medication.dosage} of ${medication.name}`,
        icon: '/medication-icon.png',
        vibrate: [200, 100, 200],
        silent: false
      };

      notificationRef.current = new Notification('Medication Reminder', options);
      
      setTimeout(() => {
        if (notificationRef.current) notificationRef.current.close();
      }, 30000);
    }

    // Show in-app notification
    setShowInAppNotification(true);
    setCurrentMedication(medication);
    const timer = setTimeout(() => setShowInAppNotification(false), 10000);
    
    return () => clearTimeout(timer);
  };

  const addTime = () => {
    if (times.length < 6) {
      setTimes([...times, { hour: '08', minute: '00' }]);
    }
  };

  const removeTime = (index) => {
    if (times.length > 1) {
      const newTimes = [...times];
      newTimes.splice(index, 1);
      setTimes(newTimes);
    }
  };

  const handleHourChange = (index, value) => {
    const newTimes = [...times];
    newTimes[index].hour = value;
    setTimes(newTimes);
  };

  const handleMinuteChange = (index, value) => {
    const newTimes = [...times];
    newTimes[index].minute = value;
    setTimes(newTimes);
  };

  const addMedication = () => {
    if (!name || !dosage || times.length === 0 || !startDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newMedication = {
      id: Date.now(),
      name,
      dosage,
      frequency,
      times: [...times].sort((a, b) => {
        if (a.hour !== b.hour) return a.hour.localeCompare(b.hour);
        return a.minute.localeCompare(b.minute);
      }),
      startDate,
      endDate: endDate || null
    };

    setMedications([...medications, newMedication]);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDosage('');
    setFrequency('daily');
    setTimes([{ hour: '08', minute: '00' }]);
    setStartDate('');
    setEndDate('');
  };

  const removeMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const toggleNotificationPermission = async () => {
    if (notificationPermission === 'granted') {
      setNotificationPermission('denied');
    } else {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const testNotification = () => {
    if (medications.length > 0) {
      showNotification(medications[0]);
    } else {
      showNotification({
        name: 'Test Medication',
        dosage: '500mg tablet',
        times: [{ hour: '00', minute: '00' }]
      });
    }
  };

  return (
    <div className="medication-reminder">
      {/* In-app notification popup */}
      {showInAppNotification && currentMedication && (
        <div className="in-app-notification">
          <div className="notification-bell">🔔</div>
          <div className="notification-content">
            <h4>Time to take your medication!</h4>
            <p>
              {currentMedication.dosage} of {currentMedication.name}
            </p>
          </div>
          <button 
            className="close-notification"
            onClick={() => setShowInAppNotification(false)}
          >
            ×
          </button>
        </div>
      )}

      <h2>Medication Reminder</h2>
      <p className="description">
        Set reminders for your medications and receive notifications when it's time to take them.
      </p>

      <div className="notification-controls">
        <button
          className={`notification-btn ${notificationPermission === 'granted' ? 'enabled' : ''}`}
          onClick={toggleNotificationPermission}
        >
          {notificationPermission === 'granted' ? '🔔 Notifications Enabled' : '🔕 Enable Notifications'}
        </button>
        <button className="test-btn" onClick={testNotification}>
          Test Notification
        </button>
      </div>

      <div className="medication-form">
        <div className="form-group">
          <label>Medication Name*</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Amoxicillin"
            required
          />
        </div>

        <div className="form-group">
          <label>Dosage*</label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g. 500mg tablet"
            required
          />
        </div>

        <div className="form-group">
          <label>Frequency*</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="asNeeded">As Needed</option>
          </select>
        </div>

        <div className="form-group">
          <label>Reminder Times*</label>
          {times.map((time, index) => (
            <div key={index} className="time-input-group">
              <div className="time-selectors">
                <select
                  value={time.hour}
                  onChange={(e) => handleHourChange(index, e.target.value)}
                >
                  {hourOptions.map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={time.minute}
                  onChange={(e) => handleMinuteChange(index, e.target.value)}
                >
                  {minuteOptions.map(minute => (
                    <option key={minute} value={minute}>{minute}</option>
                  ))}
                </select>
              </div>
              {times.length > 1 && (
                <button
                  type="button"
                  className="remove-time"
                  onClick={() => removeTime(index)}
                  disabled={times.length <= 1}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button 
            type="button" 
            className="add-time" 
            onClick={addTime}
            disabled={times.length >= 6}
          >
            + Add Another Time (max 6)
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date*</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>End Date (optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="add-btn" onClick={addMedication}>
            Add Medication
          </button>
          <button className="reset-btn" onClick={resetForm}>
            Reset Form
          </button>
        </div>
      </div>

      {medications.length > 0 && (
        <div className="medication-list">
          <h3>Your Medications</h3>
          <div className="list-header">
            <span>Medication</span>
            <span>Schedule</span>
            <span>Actions</span>
          </div>
          {medications.map(med => (
            <div key={med.id} className="medication-item">
              <div className="med-info">
                <span className="med-name">{med.name}</span>
                <span className="med-dosage">{med.dosage}</span>
              </div>
              <div className="med-schedule">
                {med.times.map(t => `${t.hour}:${t.minute}`).join(', ')} ({med.frequency})
                <br />
                {new Date(med.startDate).toLocaleDateString()} to{' '}
                {med.endDate ? new Date(med.endDate).toLocaleDateString() : 'ongoing'}
              </div>
              <button
                className="remove-btn"
                onClick={() => removeMedication(med.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="health-note">
        <p>
          <strong>Important:</strong> This reminder system does not replace professional medical advice.
          Always follow your healthcare provider's instructions.
        </p>
      </div>
    </div>
  );
}

export default MedicationReminder;