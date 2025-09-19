import React, { useState, useRef } from 'react';
import './LabImagingAnalysis.css';

function LabImagingAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Analysis templates for different file types
  const analysisTemplates = {
    blood: {
      title: "Blood Test Analysis",
      icon: "💉",
      findings: (fileName) => `Analysis of ${fileName}`,
      possibleCauses: (content) => {
        const causes = [];
        if (content.includes('WBC') || content.includes('white blood cell')) {
          causes.push("Infection (bacterial/viral)");
          causes.push("Inflammatory condition");
          causes.push("Leukemia (if significantly elevated)");
        }
        if (content.includes('HGB') || content.includes('hemoglobin')){
          causes.push("Anemia (various types)");
          causes.push("Chronic disease");
          causes.push("Nutritional deficiency");
        }
        if (content.includes('GLU') || content.includes('glucose')){
          causes.push("Diabetes mellitus");
          causes.push("Stress response");
          causes.push("Pancreatic dysfunction");
        }
        return causes.length ? causes : ["No specific abnormalities detected"];
      },
      recommendations: (content) => {
        const recs = ["Consult with your physician about these results"];
        if (content.includes('WBC') && content.includes('high')) {
          recs.push("Consider infection workup if symptomatic");
        }
        if (content.includes('HGB') && content.includes('low')) {
          recs.push("Evaluate for iron studies if anemia suspected");
        }
        return recs;
      }
    },
    xray: {
      title: "X-Ray Analysis",
      icon: "🩺",
      findings: (fileName) => `Radiological findings from ${fileName}`,
      possibleCauses: (content) => {
        const causes = [];
        if (content.includes('chest')) {
          causes.push("Pneumonia (if opacity present)");
          causes.push("Pneumothorax (if lung collapse visible)");
          causes.push("Chronic obstructive pulmonary disease");
        }
        if (content.includes('bone') || content.includes('fracture')){
          causes.push("Traumatic fracture");
          causes.push("Osteoporosis with pathological fracture");
          causes.push("Bone metastasis (if lytic lesions present)");
        }
        return causes.length ? causes : ["No acute abnormalities detected"];
      },
      recommendations: (content) => {
        const recs = ["Radiologist interpretation recommended"];
        if (content.includes('chest') && content.includes('opacity')) {
          recs.push("Consider CT scan for further evaluation");
          recs.push("Clinical correlation for pneumonia symptoms");
        }
        return recs;
      }
    },
    mri: {
      title: "MRI Analysis",
      icon: "🧠",
      findings: (fileName) => `MRI findings from ${fileName}`,
      possibleCauses: (content) => {
        const causes = [];
        if (content.includes('brain')) {
          causes.push("Cerebral ischemia/stroke");
          causes.push("Neoplastic growth (if mass present)");
          causes.push("Neurodegenerative condition");
        }
        if (content.includes('spine')) {
          causes.push("Disc herniation");
          causes.push("Spinal stenosis");
          causes.push("Cord compression (if severe)");
        }
        return causes.length ? causes : ["No focal abnormalities detected"];
      },
      recommendations: (content) => {
        const recs = ["Neuroradiologist consultation advised"];
        if (content.includes('enhancing lesion')) {
          recs.push("Consider contrast-enhanced follow-up");
          recs.push("Neurology referral recommended");
        }
        return recs;
      }
    },
    default: {
      title: "Medical Image Analysis",
      icon: "📄",
      findings: (fileName) => `Review of ${fileName}`,
      possibleCauses: () => ["Specific analysis requires image interpretation"],
      recommendations: () => [
        "Consult with a specialist for detailed review",
        "Clinical correlation needed for accurate diagnosis"
      ]
    }
  };

  const detectFileType = (fileName) => {
    const lowerName = fileName.toLowerCase();
    if (/blood|test|lab|cbc|bmp/i.test(lowerName)) return 'blood';
    if (/xray|x-ray|radiograph|chest/i.test(lowerName)) return 'xray';
    if (/mri|fmri|brain|neuro/i.test(lowerName)) return 'mri';
    return 'default';
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setAnalysisResult(null);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('');
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    
    // Simulate analysis processing
    setTimeout(() => {
      const fileType = detectFileType(selectedFile.name);
      const template = analysisTemplates[fileType] || analysisTemplates.default;
      
      // In a real app, this would come from actual image analysis
      const mockContent = selectedFile.name.toLowerCase(); // Simulate content analysis
      
      setAnalysisResult({
        title: template.title,
        icon: template.icon,
        findings: template.findings(selectedFile.name),
        possibleCauses: template.possibleCauses(mockContent),
        recommendations: template.recommendations(mockContent),
        fileType
      });
      
      setIsLoading(false);
    }, 2000);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="lab-imaging-container">
      <h2>Upload Medical Image or Lab Result</h2>
      <p>Get AI-powered analysis of your medical images or lab reports</p>
      
      <div className="upload-section">
        <div 
          className={`upload-box ${selectedFile ? 'has-file' : ''}`}
          onClick={triggerFileInput}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Medical preview" className="image-preview" />
          ) : selectedFile ? (
            <>
              <div className="file-icon">📄</div>
              <p>{selectedFile.name}</p>
            </>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <p>Click to upload or drag and drop</p>
              <p className="file-types">Supports: X-Ray, MRI, CT, Blood Tests, PDFs</p>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.dicom,.txt"
            style={{ display: 'none' }}
          />
        </div>
      </div>
      
      {selectedFile && !analysisResult && (
        <button 
          className="analyze-button"
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze File'}
        </button>
      )}
      
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Analyzing {selectedFile?.name}...</p>
        </div>
      )}
      
      {analysisResult && (
        <div className="analysis-results">
          <div className="result-header">
            <span className="result-icon">{analysisResult.icon}</span>
            <h3>{analysisResult.title}</h3>
          </div>
          
          <div className="result-section">
            <h4>File Analyzed</h4>
            <p>{selectedFile.name}</p>
          </div>
          
          <div className="result-section">
            <h4>Key Findings</h4>
            <p>{analysisResult.findings}</p>
          </div>
          
          <div className="result-section">
            <h4>Possible Clinical Correlations</h4>
            <ul>
              {analysisResult.possibleCauses.map((cause, index) => (
                <li key={index}>{cause}</li>
              ))}
            </ul>
          </div>
          
          <div className="result-section">
            <h4>Recommendations</h4>
            <ul>
              {analysisResult.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
          
          <div className="disclaimer">
            <p><strong>Important:</strong> This automated analysis is preliminary and must be verified by a qualified healthcare professional. Results may not be accurate for all cases.</p>
          </div>
        </div>
      )}
      
      <div className="example-uses">
        <h3>Supported File Types</h3>
        <div className="use-case-cards">
          <div className={`use-case ${analysisResult?.fileType === 'blood' ? 'active' : ''}`}>
            <h4>💉 Blood Tests</h4>
            <p>CBC, Metabolic Panels, Lipid Profiles</p>
            <p className="examples">Example: CBC_Results_2023.pdf</p>
          </div>
          <div className={`use-case ${analysisResult?.fileType === 'xray' ? 'active' : ''}`}>
            <h4>🩺 X-Rays</h4>
            <p>Chest, Bone, Abdominal imaging</p>
            <p className="examples">Example: Chest_XRay_PA.jpg</p>
          </div>
          <div className={`use-case ${analysisResult?.fileType === 'mri' ? 'active' : ''}`}>
            <h4>🧠 MRI Scans</h4>
            <p>Brain, Spine, Joint imaging</p>
            <p className="examples">Example: Brain_MRI_T2.dcm</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabImagingAnalysis;