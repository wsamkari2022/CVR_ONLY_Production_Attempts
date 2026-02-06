import mongoose, { Schema } from "mongoose";

/**
 * One document per session_id.
 * Mirrors the "Value Stability Analysis" card/table:
 * - overall score + weights
 * - per-scenario rows with readable fields
 */

const MatchFlagsSchema = new Schema(
  {
    explicitValuesMatch: { type: Boolean, required: true },   // ✓ Explicit Values
    implicitValuesMatch: { type: Boolean, required: true },   // ✓ Implicit Values
    simulationValuesMatch: { type: Boolean, required: true }, // ✓/✗ Simulation Values
  },
  { _id: false }
);

const ScenarioStabilityRowSchema = new Schema(
  {
    scenarioId: { type: Number, required: true },         // 1 | 2 | 3
    scenarioLabel: { type: String, default: "" },         // "Scenario 1" (optional)
    selectedValue: { type: String, required: true },      // "efficiency" | "safety" | "nonmaleficence"
    matches: { type: MatchFlagsSchema, required: true },
    stabilityStatus: { type: String, required: true },    // "Stable" | "Unstable"
    scorePercent: { type: Number, required: true },       // 0..100
  },
  { _id: false }
);

const WeightsSchema = new Schema(
  {
    explicitWeight: { type: Number, default: 0.4 }, // e.g., 0.40
    implicitWeight: { type: Number, default: 0.6 }, // e.g., 0.60
  },
  { _id: false }
);

const ValueStabilitySchema = new Schema(
  {
    session_id: { type: String, required: true, unique: true, index: true },

    // headline
    overallStabilityScorePercent: { type: Number, required: true }, // e.g., 86.7
    weights: { type: WeightsSchema, default: () => ({ explicitWeight: 0.4, implicitWeight: 0.6 }) },

    // table rows
    scenarios: { type: [ScenarioStabilityRowSchema], default: [] },

    // optional reference/cross-check (so future analysis can link back)
    summary: {
      totalStableCount: { type: Number, default: 0 },
      totalScenarios: { type: Number, default: 0 }
    }
  },
  { timestamps: true, versionKey: false }
);

export const ValueStability = mongoose.model("value_stability", ValueStabilitySchema);
