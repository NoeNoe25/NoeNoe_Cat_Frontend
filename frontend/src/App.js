import React from 'react';
import { useState } from 'react';
import './App.css';
import AppointmentBooking from './components/AppointmentBooking.js';
import ThirtyBahtTreatment from './components/ThirtyBahtTreatment.js';
import LabImagingAnalysis from './components/LabImagingAnalysis.js';
import BMICalculator from './components/BMICalculator.js';
import MedicationReminder from './components/MedicationReminder.js';
import PeriodTracker from './components/PeriodTracker.js';
import PregnancyTracker from './components/PregnancyTracker.js';
import MedicalQA from './components/MedicalQA.js';
import SleepTracker from './components/SleepTracker.js';
import ScreenTimeTracker from './components/ScreenTimeTracker.js';
import TravelInfo from './components/TravelInfo.js';
function App() {
  const [activeTab, setActiveTab] = useState('summarization');
  const [searchQuery, setSearchQuery] = useState('');

  const services = {
    summarization: {
      title: "Medical Note Summarizer",
      description: "Transform lengthy medical notes into concise summaries for better patient overview.",
      icon: "📝"
    },
    qa: {
      title: "Medical Q&A",
      description: "Get accurate answers to your medical questions from our knowledge base.",
      icon: "❓"
    },
    cdss: {
      title: "Clinical Support",
      description: "AI-powered recommendations to assist in clinical decision making.",
      icon: "🩺"
    },
    lab: {
      title: "Lab & Imaging",
      description: "Automated analysis of lab results and medical imaging reports.",
      icon: "🔬"
    },
    benefit: {
      title: "30 Baht Benefit Info",
      description: "Complete information about Thailand's universal healthcare coverage.",
      icon: "💸"
    },
    travel: {
      title: "Travel Info",
      description: "Resources and assistance for patient transportation needs.",
      icon: "🚑"
    },
    booking: {
      title: "Appointment Assistant",
      description: "Help with scheduling and managing medical appointments.",
      icon: "📅"
    }
  };

  const selfCareTools = {
    bmi: {
      title: "BMI Calculator",
      icon: "⚖️",
      component: <BMICalculator />
    },
    medication: {
      title: "Medication Reminder",
      icon: "💊",
      component: <MedicationReminder/>
    },
    sleep: {
      title: "Sleep Tracker",
      icon: "😴",
      component: <SleepTracker />
    },
    screentime: {
      title: "Screen Time Tracker",
      icon: "📱",
      component: <ScreenTimeTracker/>
    },
    menstrual: {
      title: "Cycle Tracker",
      icon: "🌸",
      component: <PeriodTracker/>
    },
    pregnancy: {
      title: "Pregnancy Tracker",
      icon: "🤰",
      component: <PregnancyTracker/>
    }
  };

  const [activeTool, setActiveTool] = useState(null);

  const handleToolClick = (toolKey) => {
    setActiveTool(toolKey);
    setActiveTab(null); // Clear any active service tab
  };

  return (
    <div className="healthcare-app">
      <header className="app-header">
        <div className="logo-container">
          <h1>Medist</h1>
          <p>AI-powered Healthcare Solutions</p>
        </div>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search healthcare services..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>Search</button>
        </div>
      </header>

      <nav className="service-tabs">
        {Object.entries(services).map(([key, service]) => (
          <button
            key={key}
            className={`tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(key);
              setActiveTool(null); // Clear any active tool
            }}
          >
            <span className="tab-icon">{service.icon}</span>
            <span className="tab-title">{service.title}</span>
          </button>
        ))}
      </nav>

      <main className="service-content">
        <div className="service-card">
          {/* Show either the service content or the tool content */}
          {activeTool ? (
            <div className="tool-container">
              <h2>{selfCareTools[activeTool].title}</h2>
              <p>{selfCareTools[activeTool].description}</p>
              {selfCareTools[activeTool].component}
            </div>
          ) : (
            <>
              <h2>{services[activeTab].title}</h2>
              <p>{services[activeTab].description}</p>
              
              {/* Medical Services */}
              {activeTab === 'summarization' && (
                <div className="summarization-demo">
                  <textarea placeholder="Paste your medical notes here..."></textarea>
                  <button>Generate Summary</button>
                  <div className="result-placeholder">
                    <h4>Summary will appear here</h4>
                    <p>This is where the AI-generated summary of your medical notes will be displayed.</p>
                  </div>
                </div>
              )}

              {activeTab === 'qa' && (
                <div className="qa-demo">
                  <MedicalQA/>
                </div>
              )}

              {activeTab === 'cdss' && (
                <div className="cdss-demo">
                  <div className="patient-info-form">
                    <h4>Enter Patient Information:</h4>
                    <div className="form-group">
                      <label>Age</label>
                      <input type="number" />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Symptoms</label>
                      <textarea placeholder="Describe symptoms..."></textarea>
                    </div>
                    <button>Get Recommendations</button>
                  </div>
                </div>
              )}

              {activeTab === 'lab' && (
                <div className="lab-section">
                  <div className="service-card-full">
                    <LabImagingAnalysis />
                  </div>
                </div>
              )}

              {activeTab === 'benefit' && (
                <div className="benefit-section">
                  <div className="service-card-full">
                    <ThirtyBahtTreatment />
                  </div>
                </div>
              )}

              
              {activeTab === 'travel' && (
                <div className="travel-section">
                  <div className="service-card-full">
                    <TravelInfo />
                  </div>
                </div>
              )}


              {activeTab === 'booking' && (
                <div className="booking-section">
                  <div className="service-card-full">
                    <AppointmentBooking />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Self-Care Tools Section (replaces Key Features) */}
        <div className="selfcare-tools">
          <h3>Self-Care Tools</h3>
          <div className="tools-grid">
            {Object.entries(selfCareTools).map(([key, tool]) => (
              <div 
                key={key}
                className={`tool-card ${activeTool === key ? 'active' : ''}`}
                onClick={() => handleToolClick(key)}
              >
                <span className="tool-icon">{tool.icon}</span>
                <h4>{tool.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2023 MediAssist - Healthcare Innovation Hackathon</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}

export default App;