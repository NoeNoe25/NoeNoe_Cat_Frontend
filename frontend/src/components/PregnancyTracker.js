import React, { useState } from 'react';
import './PregnancyTracker.css';

const WEEKLY_INFO = [
  // Weeks 1-21...
  {
  week: 1,
  description: "Your baby is now the size of a poppy seed!",
  size: "~0.04 inches, microscopic",
  fruit: "🌱",
  development: "Fertilization occurs, and the zygote begins rapid cell division."
},
{
  week: 2,
  description: "Your baby is now the size of a sesame seed!",
  size: "~0.1 inches",
  fruit: "⚫",
  development: "The blastocyst implants in the uterine wall."
},
{
  week: 3,
  description: "Your baby is now the size of a chia seed!",
  size: "~0.15 inches",
  fruit: "🌱",
  development: "Neural plate forms, marking the beginning of the nervous system."
},
{
  week: 4,
  description: "Your baby is now the size of an apple seed!",
  size: "~0.25 inches",
  fruit: "🍎",
  development: "Heart begins beating (about 105 bpm) and blood circulation starts."
},
{
  week: 5,
  description: "Your baby is now the size of a blueberry!",
  size: "~0.3 inches",
  fruit: "🫐",
  development: "Arm and leg buds appear, and major organs begin forming."
},
{
  week: 6,
  description: "Your baby is now the size of a sweet pea!",
  size: "~0.5 inches",
  fruit: "🟢",
  development: "Facial features start developing, and the brain divides into lobes."
},
{
  week: 7,
  description: "Your baby is now the size of a raspberry!",
  size: "~0.7 inches",
  fruit: "",
  development: "Fingers and toes begin webbing, and eyelids form."
},
{
  week: 8,
  description: "Your baby is now the size of a kidney bean!",
  size: "~0.9 inches",
  fruit: "🫘",
  development: "All major organs are present (but immature), and the tail disappears."
},
{
  week: 9,
  description: "Your baby is now the size of a grape!",
  size: "~1 inch, ~0.1 oz",
  fruit: "🍇",
  development: "Muscles start working, allowing tiny spontaneous movements."
},
{
  week: 10,
  description: "Your baby is now the size of a kumquat!",
  size: "~1.2 inches, ~0.2 oz",
  fruit: "🍊",
  development: "Critical organ development completes; nails and hair follicles form."
},
{
  week: 11,
  description: "Your baby is now the size of a fig!",
  size: "~1.6 inches, ~0.3 oz",
  fruit: "🍈",
  development: "The baby can hiccup and make tiny fists; bones begin hardening."
},
{
  week: 12,
  description: "Your baby is now the size of a lime!",
  size: "~2.1 inches, ~0.5 oz",
  fruit: "🍈",
  development: "Reflexes develop, and the baby responds to touch (though you can't feel it)."
},
{
  week: 13,
  description: "Your baby is now the size of a peach!",
  size: "~2.9 inches, ~0.8 oz",
  fruit: "🍑",
  development: "Vocal cords form, and unique fingerprints appear on tiny fingers."
},
{
  week: 14,
  description: "Your baby is now the size of a lemon!",
  size: "~3.4 inches, ~1.5 oz",
  fruit: "🍋",
  development: "The baby starts producing urine and grows fine hair (lanugo)."
},
{
  week: 15,
  description: "Your baby is now the size of an apple!",
  size: "~4 inches, ~2.5 oz",
  fruit: "🍏",
  development: "Taste buds develop, and legs grow longer than arms."
},
{
  week: 16,
  description: "Your baby is now the size of an avocado!",
  size: "~4.6 inches, ~3.5 oz",
  fruit: "🥑",
  development: "Eyebrows/lashes grow, and the baby can hear muffled sounds."
},
{
  week: 17,
  description: "Your baby is now the size of a pear!",
  size: "~5.1 inches, ~5 oz",
  fruit: "🍐",
  development: "Fat begins to form under the skin, smoothing out wrinkles."
},
{
  week: 18,
  description: "Your baby is now the size of a bell pepper!",
  size: "~5.6 inches, ~6.7 oz",
  fruit: "🫑",
  development: "The baby practices yawning and may start sucking its thumb."
},
{
  week: 19,
  description: "Your baby is now the size of a mango!",
  size: "~6 inches, ~8.5 oz",
  fruit: "🥭",
  development: "Vernix caseosa (protective waxy coating) covers the skin."
},
{
  week: 20,
  description: "Your baby is now the size of a banana!",
  size: "~6.5 inches, ~10.6 oz",
  fruit: "🍌",
  development: "Gender is visible on ultrasound; baby may react to loud noises."
},
{
  week: 21,
  description: "Your baby is now the size of a carrot!",
  size: "~10.5 inches, ~12.7 oz",
  fruit: "🥕",
  development: "Bone marrow starts producing blood cells; movements become coordinated."
},
    {
    week: 4,
    Description: "Your baby is now the size of a poppy seed!",
    Size: "~0.04 inches, microscopic",
    Fruit:" 🌱",
    Development: "The fertilized egg implants in the uterus, and cells begin dividing rapidly",
  },

  {
    week: 22,
    description: "Your baby is now the size of a papaya!",
    size: "~11 inches, ~1 pound",
    fruit: "🍈",
    development: "Eyelids and eyebrows are formed, and the baby is developing more defined sleep-wake cycles."
  },
  // Weeks 23-40...
  {
  week: 23,
  description: "Your baby is now the size of a grapefruit!",
  size: "~11.4 inches, ~1.1 pounds",
  fruit: "🍊",
  development: "The baby's hearing improves significantly, and lungs develop blood vessels."
},
{
  week: 24,
  description: "Your baby is now the size of an ear of corn!",
  size: "~12 inches, ~1.3 pounds",
  fruit: "🌽",
  development: "Taste buds fully form, and the baby's skin becomes less transparent."
},
{
  week: 25,
  description: "Your baby is now the size of a rutabaga!",
  size: "~13.6 inches, ~1.5 pounds",
  fruit: "🥬",
  development: "Hands are fully developed, and the baby may start sucking their thumb."
},
{
  week: 26,
  description: "Your baby is now the size of a scallion!",
  size: "~14 inches, ~1.7 pounds",
  fruit: "🧅",
  development: "Eyes begin to open, and the baby responds to light and sound."
},
{
  week: 27,
  description: "Your baby is now the size of a cauliflower!",
  size: "~14.5 inches, ~2 pounds",
  fruit: "🥦",
  development: "Practices breathing movements and shows more organized brain activity."
},
{
  week: 28,
  description: "Your baby is now the size of an eggplant!",
  size: "~14.8 inches, ~2.2 pounds",
  fruit: "🍆",
  development: "Eyelashes are visible, and the baby can dream during REM sleep."
},
{
  week: 29,
  description: "Your baby is now the size of a butternut squash!",
  size: "~15.2 inches, ~2.5 pounds",
  fruit: "🎃",
  development: "Muscles and lungs continue maturing, and kicks become stronger."
},
{
  week: 30,
  description: "Your baby is now the size of a cabbage!",
  size: "~15.7 inches, ~3 pounds",
  fruit: "🥬",
  development: "Eye coordination improves, and the baby can distinguish light/dark."
},
{
  week: 31,
  description: "Your baby is now the size of a coconut!",
  size: "~16.2 inches, ~3.3 pounds",
  fruit: "🥥",
  development: "Fat deposits smooth the skin, and the baby practices swallowing."
},
{
  week: 32,
  description: "Your baby is now the size of a jicama!",
  size: "~16.7 inches, ~3.8 pounds",
  fruit: "🍠",
  development: "Toenails are fully formed, and the baby settles into head-down position."
},
{
  week: 33,
  description: "Your baby is now the size of a pineapple!",
  size: "~17.2 inches, ~4.2 pounds",
  fruit: "🍍",
  development: "Bones harden (except the skull), and the immune system develops."
},
{
  week: 34,
  description: "Your baby is now the size of a cantaloupe!",
  size: "~17.7 inches, ~4.7 pounds",
  fruit: "🍈",
  development: "Lanugo (fine hair) begins to disappear, and fingernails reach fingertips."
},
{
  week: 35,
  description: "Your baby is now the size of a honeydew melon!",
  size: "~18.2 inches, ~5.3 pounds",
  fruit: "🍈",
  development: "Kidneys are fully developed, and the baby's reflexes are coordinated."
},
{
  week: 36,
  description: "Your baby is now the size of a head of romaine lettuce!",
  size: "~18.7 inches, ~6 pounds",
  fruit: "🥬",
  development: "The baby drops lower in the pelvis and gains about 1/2 pound per week."
},
{
  week: 37,
  description: "Your baby is now the size of a bunch of Swiss chard!",
  size: "~19.1 inches, ~6.3 pounds",
  fruit: "🥬",
  development: "Lungs are maturing rapidly, and the baby practices breathing motions."
},
{
  week: 38,
  description: "Your baby is now the size of a leek!",
  size: "~19.5 inches, ~6.8 pounds",
  fruit: "🧅",
  development: "Vernix (waxy coating) thickens, and the brain continues developing."
},
{
  week: 39,
  description: "Your baby is now the size of a mini watermelon!",
  size: "~19.8 inches, ~7.2 pounds",
  fruit: "🍉",
  development: "The baby's head molds to fit through the birth canal during labor."
},
{
  week: 40,
  description: "Your baby is now the size of a pumpkin!",
  size: "~20.2 inches, ~7.5 pounds",
  fruit: "🎃",
  development: "All organs are fully developed and ready for life outside the womb."
}
];

function calculatePregnancyInfo(lmpDateStr) {
  const lmpDate = new Date(lmpDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize time part
  
  // Calculate days pregnant (ensure positive value)
  const daysPregnant = Math.max(0, Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24)));
  const weeks = Math.floor(daysPregnant / 7);
  const days = daysPregnant % 7;
  
  const dueDate = new Date(lmpDate);
  dueDate.setDate(dueDate.getDate() + 280);
  
  const trimester = weeks <= 13 ? '1st' : weeks <= 27 ? '2nd' : '3rd';
  const weekInfo = WEEKLY_INFO[weeks] || {
    week: weeks,
    description: `Week ${weeks}: Stay healthy and hydrated!`,
    size: "",
    fruit: "👶",
    development: ""
  };
  
  return {
    gestationalAge: `${weeks} weeks, ${days} days`,
    dueDate: dueDate.toISOString().split('T')[0],
    trimester,
    weekInfo,
  };
}

const PregnancyTracker = () => {
  const [lmpDate, setLmpDate] = useState('');
  const [info, setInfo] = useState(null);
  const [symptom, setSymptom] = useState('');
  const [symptomsLog, setSymptomsLog] = useState([]);
  const [activeTab, setActiveTab] = useState('tracker');

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = today.toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (lmpDate) {
      const calculatedInfo = calculatePregnancyInfo(lmpDate);
      setInfo(calculatedInfo);
      setActiveTab('tracker');
    }
  };

  const handleDateChange = (e) => {
    setLmpDate(e.target.value);
  };

  const handleAddSymptom = () => {
    if (symptom.trim()) {
      const currentWeek = info ? parseInt(info.gestationalAge.split(' ')[0]) : '?';
      setSymptomsLog([...symptomsLog, {
        text: symptom, 
        date: new Date().toLocaleDateString(),
        week: currentWeek
      }]);
      setSymptom('');
    }
  };

  return (
    <div className="pregnancy-tracker">
      <h2>Pregnancy Tracker</h2>
      
      <div className="tabs">
        <button 
          className={activeTab === 'tracker' ? 'active' : ''}
          onClick={() => setActiveTab('tracker')}
        >
          Pregnancy Progress
        </button>
        <button 
          className={activeTab === 'symptoms' ? 'active' : ''}
          onClick={() => setActiveTab('symptoms')}
        >
          Symptoms Log
        </button>
      </div>

      {activeTab === 'tracker' && (
        <>
          <form onSubmit={handleSubmit} className="tracker-form">
            <label htmlFor="lmp">Last Menstrual Period (LMP):</label>
            <div className="input-group">
              <input
                type="date"
                id="lmp"
                value={lmpDate}
                onChange={handleDateChange}
                max={maxDate}
                required
                pattern="\d{4}-\d{2}-\d{2}"
              />
              <button type="submit">Calculate</button>
            </div>
          </form>

          {info && (
            <div className="tracker-result">
              <div className="pregnancy-card">
                <div className="fruit-display">
                  <span className="fruit" style={{ fontSize: '4rem' }}>
                    {info.weekInfo.fruit}
                  </span>
                </div>
                <div className="pregnancy-details">
                  <h3>Week {info.weekInfo.week}</h3>
                  <p className="fruit-description">{info.weekInfo.description}</p>
                  <p><strong>Size:</strong> {info.weekInfo.size}</p>
                  <p><strong>Development:</strong> {info.weekInfo.development}</p>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-box">
                  <h4>Gestational Age</h4>
                  <p>{info.gestationalAge}</p>
                </div>
                <div className="stat-box">
                  <h4>Estimated Due Date</h4>
                  <p>{info.dueDate}</p>
                </div>
                <div className="stat-box">
                  <h4>Current Trimester</h4>
                  <p>{info.trimester}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'symptoms' && (
        <div className="symptoms-log">
          <h3>Symptoms Journal</h3>
          
          <div className="add-symptom">
            <input
              type="text"
              placeholder="e.g. morning sickness, fatigue"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
            />
            <button onClick={handleAddSymptom}>+ Add</button>
          </div>

          {symptomsLog.length > 0 ? (
            <div className="symptoms-list">
              {symptomsLog.map((entry, index) => (
                <div key={index} className="symptom-entry">
                  <div className="symptom-meta">
                    <span className="week">Week {entry.week}</span>
                    <span className="date">{entry.date}</span>
                  </div>
                  <p className="symptom-text">{entry.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No symptoms logged yet. Add your first symptom above.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PregnancyTracker;