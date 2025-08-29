// src/components/FinalScriptDisplay/FinalScriptDisplay.js
import React, { useState, useEffect } from "react";
import { useTimelineDispatch } from "../../context/TimelineProvider"; // Adjust path if needed

// The *initial* predefined script text
const initialFinalScriptText = `
Characters:

Pranav: A cheerful and optimistic friend.
Prem: A moody and easily frustrated friend.

----

Script:

Pranav: ( Bursting in with excitement, the sound of a door swinging open ) Prem! You won’t believe what just happened to me today!

(Sound effect: Door creaking open loudly)

Prem: ( Groaning, annoyed ) Oh great, Pranav, what now? Did you win a million dollars or something? I’m trying to relax here!

Pranav: ( Grinning, practically bouncing ) Better than that! I got us tickets to the concert tonight! Front row, Prem! FRONT ROW!

(Sound effect: Paper tickets rustling)

Prem: ( Suddenly shifting to surprised happiness ) Wait, what?! Are you serious? You’re the best, Pranav! I take back every mean thing I’ve ever said!`;

// --- Configuration for Finalize Loading Steps ---
const TOTAL_FINALIZE_DURATION = 5000; // 5 seconds total
const FINALIZE_STEPS = [
  // Define the messages for each step
  "Processing...",
  "Generating voices for the characters...",
  "Getting sound effects...",
  "Combining everything into timeline editor...",
];
const NUM_STEPS = FINALIZE_STEPS.length;
const STEP_DURATION = TOTAL_FINALIZE_DURATION / NUM_STEPS; // Duration per step (1250ms)

// --- Helper function to create a delay ---
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Styles as provided by user (with dark background) ---
const processingStyle = {
  minHeight: "80px", // Match the script display height
  padding: "10px",
  border: "1px solid #333", // Slightly adjust border for dark theme
  background: "#12121f", // User's desired dark background
  marginBottom: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff", // White text for dark background
  fontFamily: "sans-serif",
  fontStyle: "italic",
  borderRadius: "4px", // Added for consistency
};
const containerStyle = {
  margin: "20px 0",
  padding: "15px",
  border: "1px solid #555", // Adjusted border for visibility
  borderRadius: "5px",
};
const scriptDisplayStyle = {
  minHeight: "80px", // Adjusted height
  padding: "10px",
  border: "1px solid #333", // Slightly adjust border for dark theme
  background: "#12121f", // User's desired dark background
  color: "#eee", // Light text for script
  marginBottom: "15px",
  whiteSpace: "pre-wrap",
  fontFamily: "monospace",
  borderRadius: "4px", // Added for consistency
};
// Style for the textarea, inheriting from scriptDisplayStyle
const textareaStyle = {
  ...scriptDisplayStyle, // Inherit base styles
  width: "100%", // Take full width
  boxSizing: "border-box", // Include padding/border in width
  resize: "vertical", // Allow vertical resizing
};
// --- End Styles ---

function FinalScriptDisplay() {
  // State for the initial component load delay
  const [isLoading, setIsLoading] = useState(true);
  // State for the finalization process
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizingMessage, setFinalizingMessage] = useState("");
  // --- NEW STATE for editing ---
  const [isEditing, setIsEditing] = useState(false);
  const [currentScriptText, setCurrentScriptText] = useState(
    initialFinalScriptText
  );

  const dispatch = useTimelineDispatch();

  // Effect for the initial 5-second 'Processing...' delay
  useEffect(() => {
    const initialLoadTimer = setTimeout(() => {
      setIsLoading(false);
      console.log("Initial load finished.");
    }, 5000);
    return () => clearTimeout(initialLoadTimer);
  }, []);

  // Async handler for the Finalize button click
  const handleFinalizeClick = async () => {
    if (isFinalizing || isEditing) return; // Don't finalize if editing

    console.log("Finalize button clicked - starting process...");
    setIsFinalizing(true);

    try {
      for (const stepMessage of FINALIZE_STEPS) {
        console.log(`Finalizing Step: ${stepMessage}`);
        setFinalizingMessage(stepMessage);
        await delay(STEP_DURATION);
      }

      // Original dispatch logic
      console.log("Finalization steps complete. Dispatching ADD_CLIPS.");
      // --- NOTE: You might want to parse the `currentScriptText` here ---
      // ---       to generate more relevant placeholder clips in the future ---
      const placeholderClips = [
        {
          id: `clip-${Date.now()}-1`,
          trackId: "track-char1",
          start: 0,
          end: 2,
          label: "Pranav - Line 1",
        },
        {
          id: `clip-${Date.now()}-2`,
          trackId: "track-char2",
          start: 3,
          end: 6.5,
          label: "Prem - Line 2",
        },
        {
          id: `clip-${Date.now()}-3`,
          trackId: "track-char1",
          start: 6.5,
          end: 8.5,
          label: "Pranav - Line 3",
        },
        {
          id: `clip-${Date.now()}-4`,
          trackId: "track-char2",
          start: 9,
          end: 11,
          label: "Prem - Line 4",
        },
        {
          id: `clip-${Date.now()}-5`,
          trackId: "track-sfx",
          start: 2,
          end: 3,
          label: "SFX - Door Slam",
        },
        {
          id: `clip-${Date.now()}-6`,
          trackId: "track-sfx",
          start: 8.5,
          end: 9,
          label: "SFX - Paper rustling",
        },
      ];
      const placeholderTracks = [
        { id: "track-char1", title: "Character 1" },
        { id: "track-char2", title: "Character 2" },
        { id: "track-sfx", title: "Sound Effects" },
      ];

      if (dispatch) {
        dispatch({
          type: "ADD_CLIPS",
          payload: { clips: placeholderClips, tracks: placeholderTracks },
        });
        console.log("Dispatched ADD_CLIPS action with payload:", {
          clips: placeholderClips,
          tracks: placeholderTracks,
        });
      } else {
        console.error("Timeline dispatch function is not available.");
      }
    } catch (error) {
      console.error(
        "An error occurred during the finalization process:",
        error
      );
      setFinalizingMessage("An error occurred during finalization.");
      await delay(2000);
    } finally {
      console.log("Finalization process finished. Resetting state.");
      setIsFinalizing(false);
      setFinalizingMessage("");
    }
  };

  // --- NEW HANDLER for Edit/Save button ---
  const handleEditToggle = () => {
    setIsEditing((prev) => !prev); // Toggle the editing state
    if (isEditing) {
      console.log(
        "Script changes saved (state updated). Script:",
        currentScriptText
      );
      // Optionally: Add logic here to persist the script if needed
    } else {
      console.log("Entering edit mode.");
    }
  };

  // --- NEW HANDLER for textarea changes ---
  const handleScriptChange = (event) => {
    setCurrentScriptText(event.target.value);
  };

  return (
    <div className="final-script-section" style={containerStyle}>
      <h2>Final Script</h2>

      {/* --- Conditional Rendering based on initial isLoading state --- */}
      {isLoading ? (
        // Show initial "Processing..." message using the specified dark style
        <div className="script-display-loading" style={processingStyle}>
          Processing...
        </div>
      ) : (
        // Show the actual script/editor and buttons when initial loading is finished
        <>
          {/* --- Display Finalizing Message Block OR Script Display/Editor --- */}
          {isFinalizing ? (
            <div className="finalizing-message-display" style={processingStyle}>
              {finalizingMessage}
            </div>
          ) : // --- Show Textarea if editing, otherwise show static Div ---
          isEditing ? (
            <textarea
              className="script-editor"
              style={textareaStyle} // Use the new textarea style
              value={currentScriptText}
              onChange={handleScriptChange}
              disabled={isFinalizing} // Should technically not be reachable if finalizing, but good practice
            />
          ) : (
            <div className="script-display" style={scriptDisplayStyle}>
              {currentScriptText}{" "}
              {/* Display the current script text from state */}
            </div>
          )}

          {/* --- Action Buttons --- */}
          <div className="script-actions" style={{ marginTop: "15px" }}>
            <button
              style={{ marginRight: "10px" }}
              onClick={handleEditToggle} // Use the new toggle handler
              disabled={isFinalizing} // Disable Edit/Save button during finalization
            >
              {isEditing ? "Save Script" : "Edit Script"}{" "}
              {/* Change button text */}
            </button>
            <button
              onClick={handleFinalizeClick}
              disabled={isFinalizing || isLoading || isEditing} // Disable if finalizing, initial loading, OR editing
            >
              {isFinalizing ? "Please wait..." : "Finalize"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default FinalScriptDisplay;
