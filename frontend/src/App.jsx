import React, { useState } from "react"; // Import useState

// Assuming InputProcessing component exists and works as intended
import InputProcessing from "./components/input_processing/inp"; // Ensure path is correct

// Correct import for the Timeline component
import { Timeline } from "./components/timeline/Timeline"; // Ensure path/casing matches your structure

// Import the TimelineProvider
import { TimelineProvider } from "./context/TimelineProvider";

// Import the FinalScriptDisplay component
import FinalScriptDisplay from "./components/FinalScriptDisplay/FinalScriptDisplay";

import "./app.css"; // Assuming this CSS file exists

function App() {
  // --- NEW: State to track if a file has been uploaded ---
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  // --- NEW: Callback function to be passed to InputProcessing ---
  // This function will be called by InputProcessing when a file is uploaded.
  const handleFileUpload = () => {
    console.log("File upload detected by App component.");
    setIsFileUploaded(true); // Update state to show the script display
  };

  return (
    <TimelineProvider>
      <div className="App">
        <h1>Audio Generation Pipeline</h1>

        {/* Input Processing Component */}
        {/* --- NEW: Pass the callback function as a prop --- */}
        <InputProcessing onFileUpload={handleFileUpload} />

        {/* --- Conditionally render FinalScriptDisplay --- */}
        {/* It will only render if isFileUploaded is true */}
        {isFileUploaded && <FinalScriptDisplay />}

        {/* Render the Timeline component */}
        <Timeline />
      </div>
    </TimelineProvider>
  );
}

export default App;
