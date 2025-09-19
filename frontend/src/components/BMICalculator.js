import React, { useState } from 'react';
import './BMICalculator.css';

function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric'); // 'metric' or 'imperial'

  const calculateBMI = () => {
    if (!height || !weight) return;

    let heightInMeters, weightInKg;

    if (unitSystem === 'metric') {
      heightInMeters = height / 100; // cm to m
      weightInKg = weight;
    } else {
      // imperial (lbs and inches)
      heightInMeters = height * 0.0254; // inches to meters
      weightInKg = weight * 0.453592; // lbs to kg
    }

    const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(bmiValue);

    // Determine category
    if (bmiValue < 18.5) {
      setBmiCategory('Underweight');
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      setBmiCategory('Normal weight');
    } else if (bmiValue >= 25 && bmiValue < 30) {
      setBmiCategory('Overweight');
    } else {
      setBmiCategory('Obese');
    }
  };

  const resetCalculator = () => {
    setHeight('');
    setWeight('');
    setBmi(null);
    setBmiCategory('');
  };

  const getHealthyWeightRange = () => {
    if (!height || bmi === null) return '';
    
    const heightInMeters = unitSystem === 'metric' 
      ? height / 100 
      : height * 0.0254;
    
    const lowerWeight = (18.5 * heightInMeters * heightInMeters).toFixed(1);
    const upperWeight = (24.9 * heightInMeters * heightInMeters).toFixed(1);
    
    if (unitSystem === 'metric') {
      return `${lowerWeight} - ${upperWeight} kg`;
    } else {
      const lowerLbs = (lowerWeight / 0.453592).toFixed(1);
      const upperLbs = (upperWeight / 0.453592).toFixed(1);
      return `${lowerLbs} - ${upperLbs} lbs`;
    }
  };

  return (
    <div className="bmi-calculator">
      <h3>BMI Calculator</h3>
      <p className="description">
        Body Mass Index (BMI) is a measure of body fat based on height and weight.
      </p>

      <div className="unit-toggle">
        <button
          className={`unit-btn ${unitSystem === 'metric' ? 'active' : ''}`}
          onClick={() => setUnitSystem('metric')}
        >
          Metric (kg, cm)
        </button>
        <button
          className={`unit-btn ${unitSystem === 'imperial' ? 'active' : ''}`}
          onClick={() => setUnitSystem('imperial')}
        >
          Imperial (lbs, in)
        </button>
      </div>

      <div className="input-group">
        <label>
          {unitSystem === 'metric' ? 'Height (cm)' : 'Height (inches)'}
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={unitSystem === 'metric' ? 'e.g. 175' : 'e.g. 69'}
          />
        </label>
      </div>

      <div className="input-group">
        <label>
          {unitSystem === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unitSystem === 'metric' ? 'e.g. 70' : 'e.g. 154'}
          />
        </label>
      </div>

      <div className="button-group">
        <button className="calculate-btn" onClick={calculateBMI}>
          Calculate BMI
        </button>
        <button className="reset-btn" onClick={resetCalculator}>
          Reset
        </button>
      </div>

      {bmi !== null && (
        <div className="results">
          <div className="bmi-value">
            <h4>Your BMI:</h4>
            <span className="value">{bmi}</span>
          </div>

          <div className={`bmi-category ${bmiCategory.toLowerCase().replace(' ', '-')}`}>
            {bmiCategory}
          </div>

          <div className="healthy-range">
            <h4>Healthy weight range for your height:</h4>
            <p>{getHealthyWeightRange()}</p>
          </div>

          <div className="bmi-chart">
            <h4>BMI Categories:</h4>
            <ul>
              <li className="underweight">Underweight: &lt;18.5</li>
              <li className="normal">Normal weight: 18.5–24.9</li>
              <li className="overweight">Overweight: 25–29.9</li>
              <li className="obese">Obese: 30 or higher</li>
            </ul>
          </div>
        </div>
      )}

      <div className="health-note">
        <p>
          <strong>Note:</strong> BMI is a screening tool but not a diagnostic of body fatness or health.
          Consult your healthcare provider for more comprehensive evaluation.
        </p>
      </div>
    </div>
  );
}

export default BMICalculator;