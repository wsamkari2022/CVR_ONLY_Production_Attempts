import mongoose, { Schema } from "mongoose";

const ScenarioDetailSchema = new Schema(
  {
    scenarioId: { type: Number, required: true },
    finalChoice: { type: String, default: "Unknown" },
    aligned: { type: Boolean, default: false },
    switches: { type: Number, default: 0 },
    timeSeconds: { type: Number, default: 0 },
    cvrVisited: { type: Boolean, default: false },
    cvrVisitCount: { type: Number, default: 0 },
    cvrYesAnswers: { type: Number, default: 0 },
    // apaReordered: { type: Boolean, default: false },
    // apaReorderCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const ValueOrderTrajectorySchema = new Schema(
  {
    scenarioId: { type: Number, required: true },
    values: [{ type: String }],
    preferenceType: { type: String, default: "unknown" },
  },
  { _id: false }
);

// === Debug Tracking nested schemas ===
const InfeasibleOptionSchema = new Schema(
  { title: String, label: String, checked: Boolean },
  { _id: false }
);

const ValueListsUsedSchema = new Schema(
  {
    scenarioMoralValueReorderedName: { type: String }, // e.g., "Scenario1_MoralValueReordered"
    scenarioMoralValueReordered: [{ type: String, default: [] }],
    finalTopTwoValues: [{ type: String, default: [] }],
    infeasibleOptions: { type: [InfeasibleOptionSchema], default: [] }, // only for S3
  },
  { _id: false }
);

const FlagsAtConfirmationSchema = new Schema(
  {
    // apaReordered: { type: Boolean, default: false },
    cvrYes: { type: Boolean, default: false },
    cvrNo: { type: Boolean, default: false },
    simMetricsReordered: { type: Boolean, default: false },
    moralValuesReordered: { type: Boolean, default: false },
  },
  { _id: false }
);

const InteractionCountersSchema = new Schema(
  {
    // apaReorders: { type: Number, default: 0 },
    cvrYesCount: { type: Number, default: 0 },
    cvrNoCount: { type: Number, default: 0 },
    alternativesAdded: { type: Number, default: 0 },
    switches: { type: Number, default: 0 },
  },
  { _id: false }
);

const DebugRowSchema = new Schema(
  {
    scenarioId: { type: Number, required: true },
    valueListsUsed: { type: ValueListsUsedSchema, required: true },
    finalDecisionLabel: { type: String, default: "N/A" },
    alignmentStatus: { type: String, default: "Unknown" }, // "Aligned" | "Misaligned" | "Unknown"
    flagsAtConfirmation: { type: FlagsAtConfirmationSchema, required: true },
    interactionCounters: { type: InteractionCountersSchema, required: true },
  },
  { _id: false }
);

const DebugTrackingSchema = new Schema(
  {
    rows: { type: [DebugRowSchema], default: [] }
  },
  { _id: false }
);

const SessionMetricsSchema = new Schema(
  {
    // one document per session
    session_id: { type: String, required: true, unique: true, index: true },

    // summary & indices
    cvrArrivals: { type: Number, default: 0 },
    cvrYesCount: { type: Number, default: 0 },
    cvrNoCount: { type: Number, default: 0 },
    // apaReorderings: { type: Number, default: 0 },
    misalignAfterCvrApaCount: { type: Number, default: 0 },
    realignAfterCvrApaCount: { type: Number, default: 0 },

    switchCountTotal: { type: Number, default: 0 },
    avgDecisionTime: { type: Number, default: 0 },
    decisionTimes: [{ type: Number }],

    valueConsistencyIndex: { type: Number, default: 0 },   // 0..1
    performanceComposite: { type: Number, default: 0 },    // 0..1
    balanceIndex: { type: Number, default: 0 },            // 0..1
    finalAlignmentByScenario: [{ type: Boolean }],

    // tables
    scenarioDetails: [ScenarioDetailSchema],
    valueOrderTrajectories: [ValueOrderTrajectorySchema],

    // NEW: exact mirror of the yellow Debug Tracking table
    debug_tracking: { type: DebugTrackingSchema, default: { rows: [] } },
  },
  { timestamps: true, versionKey: false }
);

export const SessionMetrics = mongoose.model("session_metrics", SessionMetricsSchema);
