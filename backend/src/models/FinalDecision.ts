import mongoose, { Schema } from "mongoose";

const InfeasibleOptionSchema = new Schema(
  {
    id: String,
    label: String,
    title: String,
    checked: Boolean
  },
  { _id: false }
);

const FinalDecisionSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true, index: true },
    scenario_id: { type: Number, required: true },
    scenario_title: { type: String },

    // Option chosen
    option_id: { type: String, required: true },
    option_label: { type: String, required: true },
    option_title: { type: String },

    // Alignment & source
    is_aligned: { type: Boolean, required: true },
    from_top_two_ranked: { type: Boolean, default: false },

    // Telemetry
    total_switches: { type: Number, default: 0 },
    total_time_seconds: { type: Number, default: 0 },

    // CVR telemetry
    cvr_visited: { type: Boolean, default: false },
    cvr_visit_count: { type: Number, default: 0 },
    cvr_yes_answers: { type: Number, default: 0 },

    // APA telemetry
    // apa_reordered: { type: Boolean, default: false },
    // apa_reorder_count: { type: Number, default: 0 },

    // Exploration
    alternatives_explored: { type: Number, default: 0 },

    // Final metrics snapshot (object with numeric fields)
    final_metrics: { type: Schema.Types.Mixed }, // { livesSaved, humanCasualties, ... }

    // Scenario 3 specifics (or others)
    infeasible_options_checked: { type: [InfeasibleOptionSchema], default: [] },

    created_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const FinalDecision = mongoose.model("final_decisions", FinalDecisionSchema);
