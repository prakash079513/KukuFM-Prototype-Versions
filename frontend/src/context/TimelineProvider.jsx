import React, { createContext, useReducer, useContext } from "react";
// Assuming initialData contains objects keyed by ID, like:
// export const initialTracksData = { track1: { id: 'track1', title: '...' } };
// export const initialClipsData = { clip1: { id: 'clip1', trackId: 'track1', ... } };
import {
  initialTracksData,
  initialClipsData,
  alternativeClipsData,
} from "../data/initialData"; // Ensure path is correct
import { v4 as uuidv4 } from "uuid"; // Keep for potential future use, though ADD_CLIPS expects IDs

const TimelineStateContext = createContext();
const TimelineDispatchContext = createContext();

const initialState = {
  tracks: initialTracksData || {}, // Ensure these are objects keyed by ID
  clips: initialClipsData || {}, // Ensure these are objects keyed by ID
  selectedClipId: null,
};

function timelineReducer(state, action) {
  switch (action.type) {
    case "SELECT_CLIP": {
      return { ...state, selectedClipId: action.payload.clipId };
    }
    case "UPDATE_CLIP": {
      // --- Existing UPDATE_CLIP logic ---
      const { clipId, updates } = action.payload;
      if (!state.clips[clipId]) return state; // Safety check
      // Ensure numeric updates are numbers
      const numericUpdates = {};
      if (updates.startTime !== undefined)
        numericUpdates.startTime = Math.max(0, Number(updates.startTime) || 0);
      // Handle duration update - ensure it's based on the potentially updated startTime if both change
      const currentClip = state.clips[clipId];
      const newStartTime =
        numericUpdates.startTime !== undefined
          ? numericUpdates.startTime
          : currentClip.startTime;
      if (updates.duration !== undefined) {
        numericUpdates.duration = Math.max(
          0.1,
          Number(updates.duration) || currentClip.duration
        ); // Min duration 0.1s
      }
      if (updates.volume !== undefined)
        numericUpdates.volume = Math.max(
          0,
          Math.min(1, Number(updates.volume) || 0)
        );
      if (updates.fadeInDuration !== undefined)
        numericUpdates.fadeInDuration = Math.max(
          0,
          Number(updates.fadeInDuration) || 0
        );
      if (updates.fadeOutDuration !== undefined)
        numericUpdates.fadeOutDuration = Math.max(
          0,
          Number(updates.fadeOutDuration) || 0
        );

      // Combine updates, applying sanitized numeric ones last
      const updatedClipData = {
        ...currentClip,
        ...updates,
        ...numericUpdates,
      };

      // Re-validate fades based on potentially new duration
      const maxFade = updatedClipData.duration / 2;
      updatedClipData.fadeInDuration = Math.min(
        updatedClipData.fadeInDuration,
        maxFade
      );
      updatedClipData.fadeOutDuration = Math.min(
        updatedClipData.fadeOutDuration,
        maxFade
      );

      return {
        ...state,
        clips: {
          ...state.clips,
          [clipId]: updatedClipData,
        },
      };
    }
    case "REPLACE_CLIP": {
      // --- Existing REPLACE_CLIP logic (simplified for clarity) ---
      const { selectedClipId, alternativeKey } = action.payload;
      if (
        !selectedClipId ||
        !alternativeClipsData[alternativeKey] ||
        !state.clips[selectedClipId]
      )
        return state;

      const alternativeData = alternativeClipsData[alternativeKey];
      const originalClip = state.clips[selectedClipId];
      const newDuration = alternativeData.duration
        ? Math.max(0.1, Number(alternativeData.duration))
        : originalClip.duration;

      return {
        ...state,
        clips: {
          ...state.clips,
          [selectedClipId]: {
            ...originalClip,
            name: alternativeData.name,
            src: alternativeData.src,
            duration: newDuration,
            // Re-validate fades? Depends on requirements
          },
        },
      };
    }
    case "REGENERATE_CLIP": {
      // Simulation
      // --- Existing REGENERATE_CLIP logic ---
      const { clipId } = action.payload;
      if (!clipId || !state.clips[clipId]) return state;
      const originalClip = state.clips[clipId];
      console.log(`Simulating regeneration for: ${originalClip.name}`);
      const newName = `${originalClip.name.replace(
        / \(Regen v\d+\)/,
        ""
      )} (Regen v${Math.floor(Math.random() * 10) + 2})`;
      return {
        ...state,
        clips: {
          ...state.clips,
          [clipId]: { ...originalClip, name: newName },
        },
      };
    }
    case "ADD_CLIP": {
      // --- Existing ADD_CLIP logic ---
      const { trackId, clipData } = action.payload;
      if (!state.tracks[trackId] || !clipData) return state;

      const newClipId = clipData.id || uuidv4();
      if (state.clips[newClipId]) {
        console.warn(
          `ADD_CLIP: Clip ID "${newClipId}" already exists. Skipping.`
        );
        return state; // Avoid overwriting
      }

      const newClip = {
        id: newClipId,
        trackId: trackId,
        name: "New Clip",
        src: "",
        startTime: 0,
        duration: 5, // Default duration
        volume: 1,
        fadeInDuration: 0,
        fadeOutDuration: 0,
        alternatives: {},
        effects: {},
        ...clipData, // Override defaults with provided data
        // Ensure numeric values are numbers and valid
        startTime: Math.max(0, Number(clipData.startTime) || 0),
        duration: Math.max(0.1, Number(clipData.duration) || 5),
        volume: Math.max(0, Math.min(1, Number(clipData.volume) || 1)),
        fadeInDuration: Math.max(0, Number(clipData.fadeInDuration) || 0),
        fadeOutDuration: Math.max(0, Number(clipData.fadeOutDuration) || 0),
      };

      const maxFade = newClip.duration / 2;
      newClip.fadeInDuration = Math.min(newClip.fadeInDuration, maxFade);
      newClip.fadeOutDuration = Math.min(newClip.fadeOutDuration, maxFade);

      return {
        ...state,
        clips: {
          ...state.clips,
          [newClipId]: newClip,
        },
        selectedClipId: newClipId,
      };
    }
    case "DELETE_CLIP": {
      // --- Existing DELETE_CLIP logic ---
      const { clipId } = action.payload;
      if (!clipId || !state.clips[clipId]) return state;

      const { [clipId]: deletedClip, ...remainingClips } = state.clips;

      return {
        ...state,
        clips: remainingClips,
        selectedClipId:
          state.selectedClipId === clipId ? null : state.selectedClipId,
      };
    }

    // --- NEW CASE TO HANDLE ADDING MULTIPLE CLIPS/TRACKS ---
    case "ADD_CLIPS": {
      console.log("Reducer handling ADD_CLIPS:", action.payload);
      // Default to empty arrays if payload parts are missing
      const { clips: newClipsPayload = [], tracks: newTracksPayload = [] } =
        action.payload || {};

      let stateChanged = false;

      // --- Process Tracks ---
      const updatedTracks = { ...state.tracks }; // Start with existing tracks map
      newTracksPayload.forEach((trackData) => {
        if (!trackData || !trackData.id) {
          console.warn(
            "Reducer ADD_CLIPS: Skipping track data without ID",
            trackData
          );
          return;
        }
        if (!updatedTracks[trackData.id]) {
          // Check if track ID doesn't exist
          updatedTracks[trackData.id] = {
            // Set required track properties, using defaults if needed
            id: trackData.id,
            title: trackData.title || `Track ${trackData.id}`, // Use provided title or default
            // Add any other default track properties your app needs (e.g., height, collapsed state)
          };
          console.log(`Reducer: Added track ${trackData.id}`);
          stateChanged = true;
        } else {
          console.log(`Reducer: Track ${trackData.id} already exists.`);
          // Optional: Update existing track properties if needed
          // if (trackData.title && updatedTracks[trackData.id].title !== trackData.title) {
          //    updatedTracks[trackData.id].title = trackData.title;
          //    stateChanged = true;
          // }
        }
      });

      // --- Process Clips ---
      const updatedClips = { ...state.clips }; // Start with existing clips map
      newClipsPayload.forEach((clipData) => {
        if (!clipData || !clipData.id || !clipData.trackId) {
          console.warn(
            "Reducer ADD_CLIPS: Skipping clip data missing id or trackId",
            clipData
          );
          return;
        }

        // Check if the target track exists (in the potentially updated tracks map)
        if (!updatedTracks[clipData.trackId]) {
          console.warn(
            `Reducer ADD_CLIPS: Track ID "${clipData.trackId}" for clip "${
              clipData.label || clipData.id
            }" does not exist. Skipping clip.`
          );
          return; // Skip this clip
        }

        const clipId = clipData.id;

        // Check if clip ID already exists
        if (updatedClips[clipId]) {
          console.warn(
            `Reducer ADD_CLIPS: Clip ID "${clipId}" already exists. Skipping addition.`
          );
          return; // Skip adding duplicate clip ID
        }

        // Calculate duration from start/end if provided, otherwise default
        // Use clipData.start and clipData.end from the payload
        const startTime = Math.max(0, Number(clipData.start) || 0);
        let duration = Math.max(0.1, Number(clipData.duration) || 0); // Use duration if provided directly
        if (duration <= 0.01 && clipData.end !== undefined) {
          // Only calculate if duration isn't valid and end exists
          duration = Math.max(0.1, Number(clipData.end) - startTime);
        }
        if (duration <= 0.01) {
          // Fallback duration if still invalid
          duration = 1; // Default to 1 second
          console.warn(
            `Reducer ADD_CLIPS: Invalid or zero duration for clip ${clipId}, defaulting to 1s.`
          );
        }

        // Apply defaults and validation (similar structure to ADD_CLIP)
        const validatedClip = {
          // Core properties
          id: clipId,
          trackId: clipData.trackId,
          name: clipData.label || clipData.name || `Clip ${clipId}`, // Use label/name from payload, fallback
          src: clipData.src || "", // Default src if not provided

          // Timing and volume (validated)
          startTime: startTime,
          duration: duration,
          volume: Math.max(0, Math.min(1, Number(clipData.volume) || 1)),

          // Fades (validated)
          fadeInDuration: Math.max(0, Number(clipData.fadeInDuration) || 0),
          fadeOutDuration: Math.max(0, Number(clipData.fadeOutDuration) || 0),

          // Other potential properties
          alternatives: clipData.alternatives || {},
          effects: clipData.effects || {},
          // Add any other fields your Clip component expects from the state
        };

        // Final validation for fades relative to duration
        const maxFade = validatedClip.duration / 2;
        validatedClip.fadeInDuration = Math.min(
          validatedClip.fadeInDuration,
          maxFade
        );
        validatedClip.fadeOutDuration = Math.min(
          validatedClip.fadeOutDuration,
          maxFade
        );

        updatedClips[clipId] = validatedClip; // Add the validated clip to the map
        console.log(
          `Reducer: Added clip ${clipId} ("${validatedClip.name}") to track ${clipData.trackId}`
        );
        stateChanged = true;
      });

      // Only return new state object if something actually changed
      if (!stateChanged) {
        console.log(
          "Reducer ADD_CLIPS: No changes detected, returning current state."
        );
        return state;
      }

      console.log("Reducer ADD_CLIPS: State updated.");
      return {
        ...state,
        tracks: updatedTracks, // The updated map of tracks
        clips: updatedClips, // The updated map of clips
        // selectedClipId remains unchanged by this action
      };
    }
    // --- END OF NEW CASE ---

    default: {
      // Keep the existing default error throwing
      console.error(`Unhandled action type: ${action.type}`, action); // Log the action too
      // Optional: return state instead of throwing? Depends on desired strictness
      // return state;
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

// --- Provider Component and Hooks (No changes needed here) ---
export function TimelineProvider({ children }) {
  const [state, dispatch] = useReducer(timelineReducer, initialState);
  return (
    <TimelineStateContext.Provider value={state}>
      <TimelineDispatchContext.Provider value={dispatch}>
        {children}
      </TimelineDispatchContext.Provider>
    </TimelineStateContext.Provider>
  );
}

export function useTimelineState() {
  const context = useContext(TimelineStateContext);
  if (context === undefined) {
    throw new Error("useTimelineState must be used within a TimelineProvider");
  }
  return context;
}

export function useTimelineDispatch() {
  const context = useContext(TimelineDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useTimelineDispatch must be used within a TimelineProvider"
    );
  }
  return context;
}
