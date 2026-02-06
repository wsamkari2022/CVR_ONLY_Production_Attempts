import mongoose, { Schema } from "mongoose";

/**
 * One document per session_id.
 * Sections mirror the Feedback UI: cvr, apa, visualization, overall, and metricsSnapshot.
 */

const CvrSchema = new Schema(
  {
    initialReconsideration: { type: Boolean, default: null },
    finalReconsideration:   { type: Boolean, default: null },
    purposeClarity:         { type: Number, min: 1, max: 7, default: 4 },
    confidenceChange:       { type: Number, min: 1, max: 7, default: 4 },
    helpfulness:            { type: Number, min: 1, max: 7, default: 4 },
    clarity:                { type: Number, min: 1, max: 7, default: 4 },
    comfortLevel:           { type: Number, min: 1, max: 7, default: 4 },
    perceivedValue:         { type: Number, min: 1, max: 7, default: 4 },
    overallImpact:          { type: Number, min: 1, max: 7, default: 4 },
    comments:               { type: String, default: "" },
  },
  { _id: false }
);

// const ApaSchema = new Schema(
//   {
//     purposeClarity:            { type: Number, min: 1, max: 7, default: 4 },
//     easeOfUse:                 { type: Number, min: 1, max: 7, default: 4 },
//     controlUnderstanding:      { type: Number, min: 1, max: 7, default: 4 },
//     decisionReflection:        { type: Boolean, default: null },
//     scenarioAlignment:         { type: Boolean, default: null },
//     comparisonUsefulness:      { type: Number, min: 1, max: 7, default: 4 },
//     perspectiveValue:          { type: Number, min: 1, max: 7, default: 4 },
//     confidenceAfterReordering: { type: Number, min: 1, max: 7, default: 4 },
//     perceivedValue:            { type: Number, min: 1, max: 7, default: 4 },
//     tradeoffChallenge:         { type: Number, min: 1, max: 7, default: 4 },
//     reflectionDepth:           { type: Number, min: 1, max: 7, default: 4 },
//     comments:                  { type: String, default: "" },
//   },
//   { _id: false }
// );

const VisualizationSchema = new Schema(
  {
    usedTradeoffComparison:  { type: Boolean, default: null },
    clarity:                 { type: Number, min: 1, max: 7, default: 4 },
    usefulness:              { type: Number, min: 1, max: 7, default: 4 },
    tradeoffEvaluation:      { type: Number, min: 1, max: 7, default: 4 },
    tradeoffJustification:   { type: Number, min: 1, max: 7, default: 4 },
    expertUsefulness:        { type: Number, min: 1, max: 7, default: 4 },
    helpfulness:             { type: Boolean, default: null },
    expertConfidenceImpact:  { type: Boolean, default: null },
    comments:                { type: String, default: "" },
  },
  { _id: false }
);

const OverallSchema = new Schema(
  {
    scenarioAlignment:       { type: Boolean, default: null },
    decisionSatisfaction:    { type: Number, min: 1, max: 7, default: 4 },
    processSatisfaction:     { type: Number, min: 1, max: 7, default: 4 },
    confidenceConsistency:   { type: Number, min: 1, max: 7, default: 4 },
    learningInsight:         { type: Number, min: 1, max: 7, default: 4 },
    comments:                { type: String, default: "" },
  },
  { _id: false }
);

/** Optional snapshot of calculated metrics for convenience queries */
const MetricsSnapshotSchema = new Schema(
  {
    valueConsistencyIndex:   { type: Number, default: 0 },
    performanceComposite:    { type: Number, default: 0 },
    balanceIndex:            { type: Number, default: 0 },
    cvrArrivals:             { type: Number, default: 0 },
    cvrYesCount:             { type: Number, default: 0 },
    cvrNoCount:              { type: Number, default: 0 },
    //apaReorderings:          { type: Number, default: 0 },
    totalSwitches:           { type: Number, default: 0 },
    avgDecisionTime:         { type: Number, default: 0 },
    scenariosFinalDecisionLabels: [{ type: String }],
    checkingAlignmentList:       [{ type: String }],
  },
  { _id: false }
);

const SessionFeedbackSchema = new Schema(
  {
    session_id:     { type: String, required: true, unique: true, index: true },
    cvr:            { type: CvrSchema, required: true },
    // apa:            { type: ApaSchema, required: true },
    visualization:  { type: VisualizationSchema, required: true },
    overall:        { type: OverallSchema, required: true },
    metricsSnapshot:{ type: MetricsSnapshotSchema, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const SessionFeedback = mongoose.model("session_feedback", SessionFeedbackSchema);
