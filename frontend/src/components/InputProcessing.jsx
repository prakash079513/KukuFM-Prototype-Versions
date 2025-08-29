// src/components/input_processing/inp.js (Example Implementation)
import React from "react";

// --- NEW: Accept onFileUpload as a prop ---
function InputProcessing({ onFileUpload }) {
  const handleFileChange = (event) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      console.log("InputProcessing: File selected -", file.name);

      // --- NEW: Call the callback function passed from App.js ---
      // Ensure the prop exists before calling it
      if (typeof onFileUpload === "function") {
        onFileUpload();
      } else {
        console.warn(
          "InputProcessing: onFileUpload prop is missing or not a function."
        );
      }

      // You would typically add more logic here to handle the file
      // (e.g., read it, display info, maybe upload to a server)
      // For this feature, we just need to signal that *a* file was selected.
    } else {
      console.log("InputProcessing: No file selected or selection cancelled.");
    }
  };

  // Example using a basic file input element
  return (
    <div
      className="input-processing-section"
      style={{
        margin: "20px 0",
        padding: "15px",
        border: "1px dashed #ccc",
        background: "#f0f8ff",
      }}
    >
      <h2>1. Input File</h2> {/* Added heading number for clarity */}
      <p>Select an audio file or script to begin:</p>
      <input
        type="file"
        onChange={handleFileChange}
        // You might want to add 'accept' attribute e.g., accept=".wav,.mp3,.txt"
        style={{ display: "block", marginTop: "10px" }}
      />
      {/* If you use a dropzone, call onFileUpload() in its onDrop handler */}
    </div>
  );
}

export default InputProcessing;
