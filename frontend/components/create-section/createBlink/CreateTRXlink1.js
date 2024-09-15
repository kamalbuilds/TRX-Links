import React, { useState } from 'react';
import templates from '@/assets/TRXLinkTemplates.json';

function CreateBlink1({ currentBlinkObject, setCurrentBlinkObject, handleNextClick }) {
  const [currentBlinkObjectState, setCurrentBlinkObjectState] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  function updateBlinkObjectTemplate(id, name) {
    const newBlinkObject = { ...currentBlinkObject, templateId: id, templateName: name };
    setCurrentBlinkObject(newBlinkObject);
    setCurrentBlinkObjectState(true);
    setSelectedTemplate(name);
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zoom: "0.7" }} >
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8">
        Choose a Template For Creating your TRX Link
      </h3>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
        {Object.keys(templates).map((template, index) => (
          <div
            key={index}
            style={{
              backgroundColor: selectedTemplate === template ? "#f5f5f5" : "white",
              padding: '20px',
              margin: 10,
              borderRadius: 30,
              border: selectedTemplate === template ? "3px solid skyblue" : "3px solid transparent",
              transition: "all 0.3s ease-in-out",
              cursor: "pointer",
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column'
            }}
            onClick={() => updateBlinkObjectTemplate(index + 1, template)}
          >
            <a style={{ marginBottom: "20px", fontSize: "1.2em", fontWeight: "bold" }}>{templates[template].name}</a>
            <div dangerouslySetInnerHTML={{ __html: templates[template].html }} />
          </div>
        ))}
      </div>
      <button
        style={{ color: 'white', marginTop: 10, fontSize: "1.2em", padding: "10px", borderRadius: "5px", cursor: "pointer", backgroundColor: currentBlinkObjectState ? "#4b8cd0" : "black", width: "250px", height: "50px" }}
        onClick={handleNextClick}
        disabled={!currentBlinkObjectState}
      >
        {currentBlinkObjectState ? "Next" : "Choose a template"}
      </button>
    </div>
  );
}

export default CreateBlink1;
