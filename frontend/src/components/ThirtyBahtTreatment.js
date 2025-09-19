import React, { useState } from 'react';
import './ThirtyBahtTreatment.css';

function ThirtyBahtTreatment() {
  const [step, setStep] = useState(1);
  const [nhssoId, setNhssoId] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const pilotProvinces = [
    "Bangkok", "Phuket", "Chiang Mai", "Khon Kaen",
    "Chonburi", "Surat Thani", "Nakhon Ratchasima", "Udon Thani"
  ];

  // Mock hospital data - in a real app, this would come from an API
  const hospitalsByProvince = {
    "Bangkok": [
      "Bangkok General Hospital",
      "Siriraj Hospital",
      "Chulalongkorn Hospital"
    ],
    "Chiang Mai": [
      "Chiang Mai University Hospital",
      "Maharaj Nakorn Chiang Mai Hospital"
    ],
    // Add other provinces...
  };

  const availableDates = [
    "2023-11-20", "2023-11-21", "2023-11-22",
    "2023-11-23", "2023-11-24"
  ];

  const handleCheckEligibility = () => {
    // Validate inputs
    if (!nhssoId || !selectedProvince) return;
    
    // In a real app, this would call NHSO API
    console.log("Checking eligibility for:", nhssoId);
    
    // Mock eligibility check - assume success
    setStep(2); // Move to hospital selection
  };

  const handleSelectHospital = () => {
    if (!selectedHospital) return;
    setStep(3); // Move to date selection
  };

  const handleConfirmAppointment = () => {
    // In a real app, this would book the appointment
    console.log("Booking appointment:", {
      nhssoId,
      province: selectedProvince,
      hospital: selectedHospital,
      date: selectedDate
    });
    setStep(4); // Move to confirmation
  };

  return (
    <div className="thirty-baht-container">
      {/* Progress indicator */}
      <div className="progress-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Eligibility</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Hospital</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Date</div>
        <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Confirm</div>
      </div>

      {/* Step 1: Eligibility Check */}
      {step === 1 && (
        <div className="step-content">
          <div className="policy-highlights">
            <h3>30 Baht Treatment Anywhere Policy</h3>
            <ul>
              <li>✅ Now available in 8 pilot provinces</li>
              <li>✅ No need to register at your home hospital first</li>
              <li>✅ Covers all essential medical services</li>
              <li>✅ Same 30 THB co-payment as home hospital</li>
            </ul>
          </div>

          <div className="benefit-form">
            <div className="form-group">
              <label>NHSO Member ID</label>
              <input 
                type="text" 
                placeholder="Enter your 13-digit NHSO ID"
                value={nhssoId}
                onChange={(e) => setNhssoId(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Select Province</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value="">Choose province</option>
                {pilotProvinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            <button 
              className="action-button"
              onClick={handleCheckEligibility}
              disabled={!nhssoId || !selectedProvince}
            >
              Check Eligibility
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Hospital Selection */}
      {step === 2 && (
        <div className="step-content">
          <h3>Select Participating Hospital</h3>
          <p>Available hospitals in {selectedProvince}:</p>
          
          <div className="hospital-list">
            {hospitalsByProvince[selectedProvince]?.map(hospital => (
              <div 
                key={hospital}
                className={`hospital-card ${selectedHospital === hospital ? 'selected' : ''}`}
                onClick={() => setSelectedHospital(hospital)}
              >
                <h4>{hospital}</h4>
                <p>Distance: 5km</p>
                <p>Wait Time: 30 mins</p>
              </div>
            ))}
          </div>

          <button 
            className="action-button"
            onClick={handleSelectHospital}
            disabled={!selectedHospital}
          >
            Select Hospital
          </button>
        </div>
      )}

      {/* Step 3: Date Selection */}
      {step === 3 && (
        <div className="step-content">
          <h3>Select Appointment Date</h3>
          <p>Available dates at {selectedHospital}:</p>
          
          <div className="date-grid">
            {availableDates.map(date => (
              <div 
                key={date}
                className={`date-card ${selectedDate === date ? 'selected' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            ))}
          </div>

          <button 
            className="action-button"
            onClick={handleConfirmAppointment}
            disabled={!selectedDate}
          >
            Confirm Appointment
          </button>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="confirmation">
          <div className="confirmation-icon">✓</div>
          <h3>Appointment Booked Successfully!</h3>
          
          <div className="appointment-details">
            <p><strong>Hospital:</strong> {selectedHospital}</p>
            <p><strong>Date:</strong> {selectedDate}</p>
            <p><strong>NHSO ID:</strong> {nhssoId}</p>
          </div>

          <div className="note">
            <p>Please bring your national ID card and NHSO documents.</p>
            <p>Arrive 15 minutes before your appointment time.</p>
          </div>

          <button 
            className="action-button"
            onClick={() => {
              setStep(1);
              setSelectedHospital('');
              setSelectedDate('');
            }}
          >
            Book Another Appointment
          </button>
        </div>
      )}
    </div>
  );
}

export default ThirtyBahtTreatment;