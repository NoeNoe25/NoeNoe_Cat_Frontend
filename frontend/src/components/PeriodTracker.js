// PeriodTracker.jsx
import React, { useState, useEffect } from 'react';
import './PeriodTracker.css';

function calculatePeriodPrediction(lastPeriodStr, cycleLength = 28, periodLength = 5) {
  const lastPeriodDate = new Date(lastPeriodStr);
  const today = new Date();
  const nextPeriod = new Date(lastPeriodDate);
  nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
  const ovulationDate = new Date(lastPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() + cycleLength - 14);

  const cycleDay = Math.floor((today - lastPeriodDate) / (1000 * 60 * 60 * 24)) % cycleLength + 1;

  return {
    nextPeriod: nextPeriod.toISOString().split('T')[0],
    ovulationDate: ovulationDate.toISOString().split('T')[0],
    fertileWindow: [
      new Date(ovulationDate.getTime() - 2 * 86400000).toISOString().split('T')[0],
      new Date(ovulationDate.getTime() + 2 * 86400000).toISOString().split('T')[0],
    ],
    cycleDay
  };
}

const PeriodTracker = () => {
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [info, setInfo] = useState(null);
  const [tab, setTab] = useState('cycle');
  const [symptom, setSymptom] = useState('');
  const [mood, setMood] = useState('');
  const [logs, setLogs] = useState([]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('periodLogs');
    if (stored) setLogs(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('periodLogs', JSON.stringify(logs));
  }, [logs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (lastPeriodDate) {
      setInfo(calculatePeriodPrediction(lastPeriodDate, cycleLength, periodLength));
    }
  };

  const handleAddLog = () => {
    if (symptom.trim() || mood.trim()) {
      const today = new Date().toISOString().split('T')[0];
      const cycleWeek = info ? Math.ceil(info.cycleDay / 7) : '?';
      const newLog = { date: today, mood, symptom, week: cycleWeek };
      setLogs([...logs, newLog]);
      setSymptom('');
      setMood('');
    }
  };

  return (
    <div className="tracker-container">
      <h2 id="main_title">🌸 Period Tracker</h2>
      
      <button 
        className="info-button"
        onClick={() => setShowInfo(!showInfo)}
      >
        {showInfo ? 'Hide Info' : 'How This Works'}
      </button>

      {showInfo && (
        <div className="info-section">
          <h3>Understanding Your Cycle</h3>
          <p>
            The average menstrual cycle is 28 days, but normal cycles can range from 21 to 35 days.
            Your period typically lasts 3-7 days. Ovulation usually occurs about 14 days before your
            next period starts.
          </p>
          <p>
            This tracker helps predict your fertile window (when pregnancy is most likely) based on
            the dates you enter. For best results, track several cycles to understand your personal patterns.
          </p>
        </div>
      )}

      <div className="tab-buttons">
        <button
          className={tab === 'cycle' ? 'active' : ''}
          onClick={() => setTab('cycle')}
        >
          📈 Menstrual Cycle
        </button>
        <button
          className={tab === 'log' ? 'active' : ''}
          onClick={() => setTab('log')}
        >
          📖 Period Log
        </button>
      </div>

      {tab === 'cycle' && (
        <>
          <form onSubmit={handleSubmit} className="tracker-form">
            <label>📅 Last Period Start Date:</label>
            <input type="date" value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} />

            <label>🔁 Cycle Length (days):</label>
            <input type="number" value={cycleLength} onChange={(e) => setCycleLength(Number(e.target.value))} />

            <label>🩸 Period Length (days):</label>
            <input type="number" value={periodLength} onChange={(e) => setPeriodLength(Number(e.target.value))} />

            <button type="submit">🔍 Predict My Cycle</button>
          </form>

          {info && (
            <div className="tracker-result">
              <p><strong>📆 Current Cycle Day:</strong> {info.cycleDay}</p>
              <p><strong>🔴 Next Period:</strong> {info.nextPeriod}</p>
              <p><strong>💙 Ovulation Day:</strong> {info.ovulationDate}</p>
              <p><strong>🌱 Fertile Window:</strong> {info.fertileWindow[0]} to {info.fertileWindow[1]}</p>
            </div>
          )}
        </>
      )}

      {tab === 'log' && (
        <div className="symptom-log">
          <h4>📝 Log Your Mood & Symptoms</h4>
          <input
            type="text"
            placeholder="😊 Mood (e.g. happy, moody)"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />
          <input
            type="text"
            placeholder="🤕 Symptoms (e.g. cramps, fatigue)"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
          />
          <button onClick={handleAddLog}>➕ Add Log</button>
          
          {logs.length > 0 ? (
            <ul className="symptom-list">
              {logs.map((entry, index) => (
                <li key={index}>
                  <span className="log-date">{entry.date}</span>
                  <span className="log-week">Week {entry.week}</span>
                  <span className="log-mood">Mood: {entry.mood || '–'}</span>
                  <span className="log-symptom">Symptom: {entry.symptom || '–'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-logs">No logs yet. Add your first log to track symptoms and mood!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PeriodTracker;