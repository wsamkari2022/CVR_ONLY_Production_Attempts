import mongoose from "mongoose";

const ScenarioInteractionSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true, index: true },
    scenario_id: { type: Number, required: true },

    // What happened
    event_type: { type: String, required: true }, // "option_selected", "confirmed", "radar_viewed", "alternatives_opened", etc.

    // Option context (when applicable)
    option_id: { type: String },
    option_label: { type: String },
    option_title: { type: String },

    // Alignment context (when applicable)
    is_aligned: { type: Boolean },

    // Timing/switch telemetry (when applicable)
    time_since_start_ms: { type: Number }, // ms since scenario start
    switch_count: { type: Number },

    created_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const ScenarioInteraction = mongoose.model("scenario_interactions", ScenarioInteractionSchema);
