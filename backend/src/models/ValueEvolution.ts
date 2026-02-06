import mongoose from "mongoose";

const ValueSnapshotItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },               // e.g., "Safety"
    matchPercentage: { type: Number, required: true },    // e.g., 85
  },
  { _id: false }
);

const ValueEvolutionSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true, index: true },

    // optional; if not provided by frontend we’ll default to 0 in the route
    scenario_id: { type: Number, default: 0 },

    // exactly what your page sends
    value_list_snapshot: { type: [ValueSnapshotItemSchema], default: [] },

    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const ValueEvolution = mongoose.model("value_evolution", ValueEvolutionSchema);
