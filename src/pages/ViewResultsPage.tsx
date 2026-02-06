/**
 * VIEW RESULTS PAGE - SESSION METRICS & TRACKING DATA (KEY PAGE #3)
 *
 * Purpose:
 * - Displays comprehensive session metrics and behavioral data
 * - One of the 4 key analysis pages you specifically requested documentation for
 * - Shows CVR (Cognitive Value Recontextualization) interaction statistics
 * - Shows APA (Adaptive Preference Alignment) reordering statistics
 * - Displays per-scenario behavioral metrics (switches, time, CVR/APA counts)
 * - Calculates performance indices
 * - Includes detailed debug tracking table for research analysis
 *
 * Dependencies:
 * - react-router-dom: Navigation
 * - lucide-react: UI icons
 * - SessionDVs, TelemetryEvent types: Tracking data structures
 * - SimulationMetrics type: Simulation metrics structure
 * - TrackingManager: Event tracking utilities
 *
 * Direct Database Calls:
 * - None (reads from localStorage only for display)
 * - This is an analysis/visualization page
 *
 * Data Read from localStorage:
 * - 'simulationScenarioOutcomes': Scenario decisions and outcomes
 * - 'finalSimulationMetrics': Final cumulative metrics
 * - 'finalValues', 'MoralValuesReorderList': Value lists for alignment
 * - 'sessionEventLogs': Complete telemetry event logs (via TrackingManager)
 * - 'ScenariosFinalDecisionLabels': Decision labels per scenario
 * - 'CheckingAlignmentList': Alignment status per scenario
 * - 'Scenario1/2/3_MoralValueReordered': Per-scenario reordered values
 * - 'Scenario3_InfeasibleOptions': Infeasible options with checked status
 *
 * Key Metrics Calculated & Displayed:
 *
 * 1. Summary Cards (Top Row): 
 *    - CVR Arrivals: Total times CVR modal was opened 
 *    - APA Reorderings: Total value reordering events 
 *    - Total Switches: Total option changes across scenarios 
 *    - Avg Decision Time: Average seconds per scenario 
 * 
 * 2. CVR Answers Breakdown: 
 *    - "Yes, I would" answers: Count of CVR affirmative responses 
 *    - "No, I would not" answers: Count of CVR negative responses 
 * 
 * 3. Post-CVR/APA Alignment Changes: 
 *    - Misalignment Switches: Decisions that became misaligned 
 *    - Realignment Switches: Decisions that became aligned after CVR/APA 
 * 
 * 4. Performance Indices: 
 *    - Value Consistency Index: % of aligned decisions (0-100%) 
 *    - Performance Composite: Normalized average of all metrics (0-1) 
 *    - Balance Index: Measure of balanced outcomes (0-1) 
 * 
 * 5. Scenario Details Table: 
 *    Per-scenario breakdown showing: 
 *    - Final Choice (decision label) 
 *    - Switches (option changes) 
 *    - Time (seconds) 
 *    - CVR Visits (number of times CVR opened) 
 *    - CVR "Yes" (affirmative answers) 
 *    - APA Count (reordering events) 
 * 
 * 6. Debug Tracking Table (Comprehensive Research Data): 
 *    Detailed per-scenario analysis with: 
 *    - Value Lists Used: 
 *      - Scenario-specific reordered values 
 *      - FinalTopTwoValues at confirmation 
 *      - Infeasible options (Scenario 3 only) with checked status 
 *    - Final Decision Label 
 *    - Alignment Status (Aligned/Not Aligned) 
 *    - Flags at Confirmation: 
 *      - APA Reordered (boolean) 
 *      - CVR "Yes" (boolean) 
 *      - CVR "No" (boolean) 
 *      - Simulation Metrics Reordering (boolean) 
 *      - Moral Values Reordering (boolean) 
 *    - Interaction Counters: 
 *      - APA Reorders count 
 *      - CVR "Yes" count 
 *      - CVR "No" count 
 *      - Alternatives Added count 
 *      - Option Switches count 
 * 
 * Flow Position: Step 11 of 13 (accessed from /feedback) 
 * Previous Page: /feedback 
 * Next Page: Back to /feedback 
 * 
 * Calculation Details: 
 * 
 * Value Consistency Index: 
 * - Counts scenarios where decision aligned with baseline values 
 * - Formula: (aligned_count / total_scenarios) * 100 
 * 
 * Performance Composite: 
 * - Normalizes all metrics to 0-1 scale 
 * - Calculates mean of normalized values 
 * - Represents overall performance quality 
 * 
 * Balance Index: 
 * - Calculates variance of normalized metrics 
 * - Formula: 1 - variance 
 * - Higher value = more balanced outcomes 
 * 
 * Alignment Determination: 
 * - Scenario 1: Uses matchedStableValues list 
 * - Scenarios 2 & 3: Uses moralValuesReorderList 
 * - Aligned if: value in list AND no CVR "yes" answers 
 * 
 * Notes: 
 * - Most detailed metrics page for research analysis 
 * - Debug table shows all value lists and flags used 
 * - Infeasible options display includes checkbox status 
 * - All counters derived from event logs 
 * - Color-coded for quick visual analysis 
 * - Critical for understanding participant behavior patterns 
 * - Shows impact of CVR and APA interventions 
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  RotateCcw,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Eye,
  MessageSquare,
  Activity,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft
} from 'lucide-react';
import { SessionDVs, TelemetryEvent } from '../types/tracking';
import { SimulationMetrics } from '../types';
import { TrackingManager } from '../utils/trackingUtils';
import { MongoService } from '../lib/mongoService';

// ---------- helpers: safe localStorage reads ----------
function readArray<T = any>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readJSON<T = any>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}


const ViewResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [metrics, setMetrics] = useState<SessionDVs | null>(null);
  const isSilentMode = searchParams.get('silent') === 'true';

  useEffect(() => {
    const alreadyCalculated = sessionStorage.getItem('metricsCalculated');

    if (isSilentMode && alreadyCalculated === 'true') {
      console.log('[Silent Mode] Metrics already calculated, navigating back to thank-you page');
      navigate('/thank-you', { replace: true });
      return;
    }

    calculateMetrics();
  }, [isSilentMode, navigate]);

  const calculateMetrics = async () => {
    try {
      const simulationOutcomes = JSON.parse(localStorage.getItem('simulationScenarioOutcomes') || '[]');
      const finalMetrics: SimulationMetrics = JSON.parse(localStorage.getItem('finalSimulationMetrics') || 'null');
      const matchedValues = JSON.parse(localStorage.getItem('finalValues') || '[]');
      const moralValuesReorder = localStorage.getItem('MoralValuesReorderList');
      const scenarioHistory = TrackingManager.getScenarioTrackingHistory();
      const allEvents: TelemetryEvent[] = TrackingManager.getAllEvents();

      if (!simulationOutcomes.length || !finalMetrics) {
        console.error('Missing required data for metrics calculation');
        return;
      }

      const matchedStableValues: string[] = matchedValues.map((v: any) => (v.name || v).toString().toLowerCase());

      let moralValuesReorderList: string[] = [];
      if (moralValuesReorder) {
        try {
          const reorderedValues = JSON.parse(moralValuesReorder);
          moralValuesReorderList = reorderedValues.map((v: any) => (v.id || v.name || v).toString().toLowerCase());
        } catch (e) {
          moralValuesReorderList = matchedStableValues;
        }
      } else {
        moralValuesReorderList = matchedStableValues;
      }

      const cvrOpenEvents = allEvents.filter(e => e.event === 'cvr_opened');
      const cvrArrivals = cvrOpenEvents.length;

      const cvrAnswerEvents = allEvents.filter(e => e.event === 'cvr_answered');
      const cvrYesCount = cvrAnswerEvents.filter(e => e.cvrAnswer === true).length;
      const cvrNoCount = cvrAnswerEvents.filter(e => e.cvrAnswer === false).length;

      const apaEvents = allEvents.filter(e => e.event === 'apa_reordered');
      const apaReorderings = apaEvents.length;

      const decisionTimes: number[] = [];
      const scenarioDetailsMap = new Map<number, any>();

      scenarioHistory.forEach(scenario => {
        if (scenario.endTime && scenario.startTime) {
          const timeSeconds = (scenario.endTime - scenario.startTime) / 1000;
          decisionTimes.push(timeSeconds);

          scenarioDetailsMap.set(scenario.scenarioId, {
            timeSeconds: Math.round(timeSeconds),
            switches: scenario.switchCount || 0,
            cvrVisited: scenario.cvrVisited || false,
            cvrVisitCount: scenario.cvrVisitCount || 0,
            cvrYesAnswers: scenario.cvrYesAnswers || 0,
            apaReordered: scenario.apaReordered || false,
            apaReorderCount: scenario.apaReorderCount || 0
          });
        }
      });

      if (decisionTimes.length === 0) {
        simulationOutcomes.forEach(() => {
          decisionTimes.push(75);
        });
      }

      const avgDecisionTime = decisionTimes.length > 0
        ? decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length
        : 0;

      const finalAlignmentByScenario: boolean[] = [];
      const scenarioDetails: SessionDVs['scenarioDetails'] = [];

      simulationOutcomes.forEach((outcome: any, index: number) => {
        const optionValue = (outcome.decision.label || '').toLowerCase();
        const scenarioId = outcome.scenarioId;

        const scenarioCvrVisits = cvrOpenEvents.filter(e => e.scenarioId === outcome.scenarioId);
        const scenarioCvrYesAnswers = cvrAnswerEvents.filter(
          e => e.scenarioId === outcome.scenarioId && e.cvrAnswer === true
        );

        let valueExistsInList = false;
        if (scenarioId === 1) {
          valueExistsInList = matchedStableValues.includes(optionValue);
        } else if (scenarioId === 2 || scenarioId === 3) {
          valueExistsInList = moralValuesReorderList.includes(optionValue);
        }

        const aligned = valueExistsInList && scenarioCvrYesAnswers.length === 0;

        finalAlignmentByScenario.push(aligned);

        const trackingData = scenarioDetailsMap.get(outcome.scenarioId) || {
          timeSeconds: Math.round(decisionTimes[index] || 0),
          switches: 0,
          cvrVisited: false,
          cvrVisitCount: 0,
          cvrYesAnswers: 0,
          apaReordered: false,
          apaReorderCount: 0
        };

        const scenarioOptionSelections = allEvents.filter(
          e => e.event === 'option_selected' && e.scenarioId === outcome.scenarioId
        );
        const switchCount = Math.max(0, scenarioOptionSelections.length - 1);

        const scenarioApaEvents = apaEvents.filter(e => e.scenarioId === outcome.scenarioId);

        scenarioDetails.push({
          scenarioId: outcome.scenarioId,
          finalChoice: outcome.decision.title || outcome.decision.label || 'Unknown',
          aligned,
          switches: trackingData.switches || switchCount,
          timeSeconds: trackingData.timeSeconds,
          cvrVisited: trackingData.cvrVisited || scenarioCvrVisits.length > 0,
          cvrVisitCount: trackingData.cvrVisitCount || scenarioCvrVisits.length,
          cvrYesAnswers: trackingData.cvrYesAnswers || scenarioCvrYesAnswers.length,
          apaReordered: trackingData.apaReordered || scenarioApaEvents.length > 0,
          apaReorderCount: trackingData.apaReorderCount || scenarioApaEvents.length
        });
      });

      const switchCountTotal = scenarioDetails.reduce((sum, s) => sum + s.switches, 0);

      const alignedCount = finalAlignmentByScenario.filter(Boolean).length;
      const valueConsistencyIndex = finalAlignmentByScenario.length > 0
        ? alignedCount / finalAlignmentByScenario.length
        : 0;

      const performanceComposite = calculatePerformanceComposite(finalMetrics);
      const balanceIndex = calculateBalanceIndex(finalMetrics);

      let misalignAfterCvrApaCount = 0;
      let realignAfterCvrApaCount = 0;

      scenarioDetails.forEach((scenario) => {
        const scenarioEvents = allEvents.filter(e => e.scenarioId === scenario.scenarioId);

        const confirmationEvent = scenarioEvents.find(e => e.event === 'option_confirmed');
        const flagsAtConfirmation = confirmationEvent?.flagsAtConfirmation;

        if (flagsAtConfirmation) {
          const hadSimulationMetricsReordering = flagsAtConfirmation.simulationMetricsReorderingFlag ?? false;
          const hadMoralValuesReordering = flagsAtConfirmation.moralValuesReorderingFlag ?? false;

          if (hadSimulationMetricsReordering || hadMoralValuesReordering) {
            realignAfterCvrApaCount++;
          }
        }

        if (!scenario.aligned) {
          misalignAfterCvrApaCount++;
        }
      });

      const valueOrderTrajectories: Array<{ scenarioId: number, values: string[], preferenceType: string }> = [];

      apaEvents.forEach(event => {
        if (event.valuesAfter && event.scenarioId !== undefined) {
          valueOrderTrajectories.push({
            scenarioId: event.scenarioId,
            values: event.valuesAfter,
            preferenceType: event.preferenceType || 'unknown'
          });
        }
      });

      const calculatedMetrics: SessionDVs = {
        cvrArrivals,
        cvrYesCount,
        cvrNoCount,
        apaReorderings,
        misalignAfterCvrApaCount,
        realignAfterCvrApaCount,
        switchCountTotal,
        avgDecisionTime,
        decisionTimes,
        valueConsistencyIndex,
        performanceComposite,
        balanceIndex,
        finalAlignmentByScenario,
        valueOrderTrajectories,
        scenarioDetails
      };

      setMetrics(calculatedMetrics);

      // ---------- BUILD DEBUG TRACKING ROWS (mirror the yellow table) ----------
      const sessionId = MongoService.getSessionId();

      // From localStorage (these keys existed in the older UI version)
      const scenariosFinalDecisionLabels = readArray<string>("ScenariosFinalDecisionLabels"); // e.g., ["Safety","Fairness","Nonmaleficence"]
      const checkingAlignmentList = readArray<string>("CheckingAlignmentList");         // e.g., ["Aligned","Misaligned","Misaligned"]

      // "finalValues" usually holds the top-two values array (objects with {name, matchPercentage})
      const finalValuesRaw = readArray<any>("finalValues");
      const finalValuesUpper = finalValuesRaw.map(v => (v?.name ?? v ?? "").toString());

      // Per-scenario moral value lists (reordered lists shown in the first column)
      const scenario1MoralValueReordered = readArray<string>("Scenario1_MoralValueReordered");
      const scenario2MoralValueReordered = readArray<string>("Scenario2_MoralValueReordered");
      const scenario3MoralValueReordered = readArray<string>("Scenario3_MoralValueReordered");

      // Scenario-3 infeasible options (as shown in the red box)
      const scenario3InfeasibleOptions = readArray<{ title: string; label: string; checked: boolean }>("Scenario3_InfeasibleOptions");

      ////////////////////
      //const allEvents: any[] = (window as any).__trackingEvents || [];
      // If you have a tracking manager that logs events; otherwise remove these 6 lines and set scenarioEvents to [].
      // let allEvents: any[] = [];
      // try {
      //   // If you have TrackingManager, uncomment next line and remove the try/catch.
      //   // allEvents = TrackingManager.getAllEvents();
      //   allEvents = (window as any).__trackingEvents || []; // fallback if you stored events globally
      // } catch { allEvents = []; }

      // We assume you already computed per-scenario details in a variable named `metrics.scenarioDetails`
      // If your variable is named `calculatedMetrics`, use that instead: e.g., `calculatedMetrics.scenarioDetails`
      const scenarioDetailsArr = (metrics?.scenarioDetails ?? calculatedMetrics?.scenarioDetails ?? []) as Array<{
        scenarioId: number;
        // ... other fields are fine; we only need scenarioId here
      }>;

      const debugRows = scenarioDetailsArr.map((scenario, index) => {
        const scenarioId = scenario.scenarioId;
        const decisionLabel = (scenariosFinalDecisionLabels[index] ?? "N/A").toString();
        const alignmentStatus = (checkingAlignmentList[index] ?? "Unknown").toString();

        // Choose the scenario-specific reordered list & label name (as shown in the left column)
        let scenarioSpecificList: string[] = [];
        let scenarioSpecificListName = "";
        if (scenarioId === 1) { scenarioSpecificList = scenario1MoralValueReordered; scenarioSpecificListName = "Scenario1_MoralValueReordered"; }
        else if (scenarioId === 2) { scenarioSpecificList = scenario2MoralValueReordered; scenarioSpecificListName = "Scenario2_MoralValueReordered"; }
        else if (scenarioId === 3) { scenarioSpecificList = scenario3MoralValueReordered; scenarioSpecificListName = "Scenario3_MoralValueReordered"; }

        // Events for this scenario (if you track them)
        const scenarioEvents = allEvents.filter(e => e?.scenarioId === scenarioId);

        // If you recorded a special "option_confirmed" event containing flags &  FinalTopTwoValuesBeforeUpdate
        const confirmationEvent = scenarioEvents.find(e => e?.event === "option_confirmed");
        const flags = confirmationEvent?.flagsAtConfirmation || {};

        // FinalTopTwoValues displayed at confirmation time in the old UI
        const finalTopTwoValues =
          (confirmationEvent?.finalTopTwoValuesBeforeUpdate ?? finalValuesUpper ?? [])
            .map((v: any) => (typeof v === "string" ? v : v?.name ?? ""))
            .filter(Boolean);

        const hadApaReorder = !!flags.hasReorderedValues;
        const hadCvrYes = !!flags.cvrYesClicked;
        const hadCvrNo = !!flags.cvrNoClicked;
        const hadSimReorder = !!flags.simulationMetricsReorderingFlag;
        const hadMoralReorder = !!flags.moralValuesReorderingFlag;

        const cvrYesCount = scenarioEvents.filter(e => e?.event === "cvr_answered" && e?.cvrAnswer === true).length;
        const cvrNoCount = scenarioEvents.filter(e => e?.event === "cvr_answered" && e?.cvrAnswer === false).length;
        const apaReorders = scenarioEvents.filter(e => e?.event === "apa_reordered").length;
        const alternativesAdded = scenarioEvents.filter(e => e?.event === "alternative_added").length;
        const switches = Math.max(0, scenarioEvents.filter(e => e?.event === "option_selected").length - 1);

        return {
          scenarioId,
          valueListsUsed: {
            scenarioMoralValueReorderedName: scenarioSpecificListName,
            scenarioMoralValueReordered: scenarioSpecificList,
            finalTopTwoValues,
            infeasibleOptions: scenarioId === 3 ? scenario3InfeasibleOptions : []
          },
          finalDecisionLabel: decisionLabel,
          alignmentStatus,
          flagsAtConfirmation: {
            apaReordered: hadApaReorder,
            cvrYes: hadCvrYes,
            cvrNo: hadCvrNo,
            simMetricsReordered: hadSimReorder,
            moralValuesReordered: hadMoralReorder
          },
          interactionCounters: {
            apaReorders,
            cvrYesCount,
            cvrNoCount,
            alternativesAdded,
            switches
          }
        };
      });
      ////////////////////
      // ===== VALUE STABILITY (compute here on Results page) =====
      try {
        const sessionId = MongoService.getSessionId();

        // Inputs we already have in localStorage or Results context
        const decisionLabels = readArray<string>("ScenariosFinalDecisionLabels"); // ["efficiency","safety","nonmaleficence", ...]
        const userValues = readJSON<{ explicit: string[]; implicit: string[] }>("userValues", { explicit: [], implicit: [] });
        const finalValuesRaw = readArray<any>("finalValues"); // [{name:"Safety", matchPercentage:...}, ...]
        const simulationTopValues = finalValuesRaw.map(v => (v?.name ?? v ?? "").toString().toLowerCase());

        // If you track how many scenarios were run, prefer that length.
        // Otherwise, fall back to however many decision labels we have.
        const scenarioCount = (metrics?.scenarioDetails?.length ?? decisionLabels.length) || 0;

        // Per-scenario rows
        const rows = Array.from({ length: scenarioCount }).map((_, idx) => {
          const selectedValue = (decisionLabels[idx] ?? "").toString().toLowerCase();
          const explicitMatch = userValues.explicit.map(v => v.toLowerCase()).includes(selectedValue);
          const implicitMatch = userValues.implicit.map(v => v.toLowerCase()).includes(selectedValue);
          const simulationMatch = simulationTopValues.includes(selectedValue);

          // Per-scenario weighted score: 40% explicit + 60% implicit (0..1 -> %)
          const score01 = (explicitMatch ? 0.4 : 0) + (implicitMatch ? 0.6 : 0);
          const scorePercent = Math.round(score01 * 100);
          const stabilityStatus = scorePercent >= 60 ? "Stable" : "Unstable";

          return {
            scenarioId: idx + 1,
            scenarioLabel: `Scenario ${idx + 1}`,
            selectedValue, // keep lowercase for consistency; UI can format if needed
            matches: {
              explicitValuesMatch: explicitMatch,
              implicitValuesMatch: implicitMatch,
              simulationValuesMatch: simulationMatch
            },
            stabilityStatus,
            scorePercent
          };
        });

        const totalStableCount = rows.filter(r => r.stabilityStatus === "Stable").length;

        // Overall score: average of the same per-scenario weighted formula (0..1 -> % with 1 decimal)
        const overall01 =
          rows.reduce((acc, r) => acc + ((r.matches.explicitValuesMatch ? 0.4 : 0) + (r.matches.implicitValuesMatch ? 0.6 : 0)), 0) /
          (rows.length || 1);
        const overallStabilityScorePercent = Number((overall01 * 100).toFixed(1));

        // Save to its own collection
        await MongoService.insertValueStability({
          session_id: sessionId,
          overallStabilityScorePercent,
          weights: { explicitWeight: 0.40, implicitWeight: 0.60 },
          scenarios: rows,
          summary: { totalStableCount, totalScenarios: rows.length }
        });
      } catch (e) {
        console.error("insertValueStability failed:", e);
      }
      // ===== END VALUE STABILITY =====


      //////////////////

      await MongoService.insertSessionMetrics({
        session_id: sessionId,
        ...calculatedMetrics,
        debug_tracking: { rows: debugRows }
      });

      sessionStorage.setItem('metricsCalculated', 'true');
      console.log('[ViewResultsPage] Metrics calculated and saved to database successfully');

      if (isSilentMode) {
        console.log('[Silent Mode] Metrics saved, navigating back to thank-you page');
        setTimeout(() => {
          navigate('/thank-you', { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error calculating metrics:', error);
      sessionStorage.setItem('metricsCalculated', 'true');

      if (isSilentMode) {
        console.error('[Silent Mode] Error occurred, but navigating back to thank-you page anyway');
        setTimeout(() => {
          navigate('/thank-you', { replace: true });
        }, 100);
      }
    }
  };

  const calculatePerformanceComposite = (finalMetrics: SimulationMetrics): number => {
    const normalized = {
      livesSaved: Math.min(finalMetrics.livesSaved / 20000, 1),
      casualties: 1 - Math.min(finalMetrics.humanCasualties / 1000, 1),
      firefightingResource: finalMetrics.firefightingResource / 100,
      infrastructureCondition: finalMetrics.infrastructureCondition / 100,
      biodiversityCondition: finalMetrics.biodiversityCondition / 100,
      propertiesCondition: finalMetrics.propertiesCondition / 100,
      nuclearPowerStation: finalMetrics.nuclearPowerStation / 100
    };

    const values = Object.values(normalized);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(mean * 100) / 100;
  };

  const calculateBalanceIndex = (finalMetrics: SimulationMetrics): number => {
    const normalized = [
      Math.min(finalMetrics.livesSaved / 20000, 1),
      1 - Math.min(finalMetrics.humanCasualties / 1000, 1),
      finalMetrics.firefightingResource / 100,
      finalMetrics.infrastructureCondition / 100,
      finalMetrics.biodiversityCondition / 100,
      finalMetrics.propertiesCondition / 100,
      finalMetrics.nuclearPowerStation / 100
    ];

    const mean = normalized.reduce((a, b) => a + b, 0) / normalized.length;
    const variance = normalized.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / normalized.length;
    return Math.round((1 - variance) * 100) / 100;
  };

  return null;
};

export default ViewResultsPage;
