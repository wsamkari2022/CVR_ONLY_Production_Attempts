const API = import.meta.env.VITE_API_URL || "/VRDS_CVR";

// ---- Session Manager (single source of truth) ----
let cachedSessionId: string | null = null;

function createNewSessionId(): string {
  // @ts-ignore
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2);
}

function getOrCreateSessionId(): string {
  if (cachedSessionId) return cachedSessionId;

  let id = localStorage.getItem("session_id");
  if (!id) {
    id = createNewSessionId();
    localStorage.setItem("session_id", id);
  }
  cachedSessionId = id;
  return id;
}

export const MongoService = {
  // ✅ Always use this to get the same id across pages
  getSessionId(): string {
    return getOrCreateSessionId();
  },

  async createUserSession(payload: {
    session_id: string;
    ExperimentCondition: string;
    demographics: {
      age: string;
      gender: string;
      aiExperience: string;
      moralReasoningExperience: string;
    };
    consent_agreed: boolean;
    consent_timestamp?: string;
  }) {
    const res = await fetch(`${API}/api/user-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      throw new Error(data?.error || "Failed to create user session");
    }
    return data; // { ok: true, id: "..." }
  },
  async insertValueEvolution(payload: {
    session_id: string;
    value_list_snapshot: { name: string; matchPercentage: number }[];
    // scenario_id optional from the page; server will default to 0
    scenario_id?: number;
  }) {
    const res = await fetch(`${API}/api/value-evolution`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(data?.error || "Failed to save value evolution");
    return data; // { ok: true, id: "..." }
  },

  async insertScenarioInteraction(payload: {
    session_id: string;
    scenario_id: number;
    event_type: string;
    option_id?: string;
    option_label?: string;
    option_title?: string;
    is_aligned?: boolean;
    time_since_start_ms?: number;
    switch_count?: number;
  }) {
    const res = await fetch(`${API}/api/scenario-interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(data?.error || "Failed to save scenario interaction");
    return data;
  },

  async insertCVRResponse(payload: {
    session_id: string;
    scenario_id: number;
    cvr_question: string;
    user_answer: boolean;
    response_time_ms?: number;
    decision_changed_after?: boolean;
    option_id?: string;
    option_label?: string;
  }) {
    const res = await fetch(`${API}/api/cvr-responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(data?.error || "Failed to save CVR response");
    return data;
  },

  async insertAPAReordering(payload: {
    session_id: string;
    scenario_id: number;
    preference_type: "moral_values" | "simulation_metrics";
    values_before: string[];
    values_after: string[];
    reorder_count?: number;
  }) {
    const res = await fetch(`${API}/api/apa-reorderings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(data?.error || "Failed to save APA reordering");
    return data;
  },

  async insertFinalDecision(payload: {
    session_id: string;
    scenario_id: number;
    scenario_title?: string;

    option_id: string;
    option_label: string;
    option_title?: string;

    is_aligned: boolean;
    from_top_two_ranked?: boolean;

    total_switches?: number;
    total_time_seconds?: number;

    cvr_visited?: boolean;
    cvr_visit_count?: number;
    cvr_yes_answers?: number;

    apa_reordered?: boolean;
    apa_reorder_count?: number;

    alternatives_explored?: number;

    final_metrics?: any; // { livesSaved, humanCasualties, ... }
    infeasible_options_checked?: Array<{ id: string; label: string; title: string; checked: boolean }>;
  }) {
    const res = await fetch(`${API}/api/final-decisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(data?.error || "Failed to save final decision");
    return data;
  },

  async insertSessionMetrics(payload: {
    session_id: string;

    // summary & indices
    cvrArrivals: number;
    cvrYesCount: number;
    cvrNoCount: number;
    apaReorderings: number;
    misalignAfterCvrApaCount: number;
    realignAfterCvrApaCount: number;

    switchCountTotal: number;
    avgDecisionTime: number;
    decisionTimes: number[];

    valueConsistencyIndex: number;
    performanceComposite: number;
    balanceIndex: number;
    finalAlignmentByScenario: boolean[];

    // // tables
    scenarioDetails: Array<{
      scenarioId: number;
      finalChoice: string;
      aligned: boolean;
      switches: number;
      timeSeconds: number;
      cvrVisited: boolean;
      cvrVisitCount: number;
      cvrYesAnswers: number;
      apaReordered: boolean;
      apaReorderCount: number;
    }>;
    valueOrderTrajectories: Array<{
      scenarioId: number;
      values: string[];
      preferenceType: string;
    }>;

    // debug tracking table lists

    debug_tracking: {
      rows: Array<{
        scenarioId: number;
        valueListsUsed: {
          scenarioMoralValueReorderedName: string;
          scenarioMoralValueReordered: string[];
          finalTopTwoValues: string[];
          infeasibleOptions?: Array<{ title: string; label: string; checked: boolean }>;
        };
        finalDecisionLabel: string;
        alignmentStatus: string;
        flagsAtConfirmation: {
          apaReordered: boolean;
          cvrYes: boolean;
          cvrNo: boolean;
          simMetricsReordered: boolean;
          moralValuesReordered: boolean;
        };
        interactionCounters: {
          apaReorders: number;
          cvrYesCount: number;
          cvrNoCount: number;
          alternativesAdded: number;
          switches: number;
        };
      }>;
    };
  }) {
    const res = await fetch(`${API}/api/session-metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(data?.error || "Failed to upsert session metrics");
    return data; // { ok: true, id: "..." }
  },

  async insertSessionFeedback(payload: {
    session_id: string;
    cvr: {
      initialReconsideration: boolean | null;
      finalReconsideration: boolean | null;
      purposeClarity: number;
      confidenceChange: number;
      helpfulness: number;
      clarity: number;
      comfortLevel: number;
      perceivedValue: number;
      overallImpact: number;
      comments: string;
    };
    // apa: {
    //   purposeClarity: number;
    //   easeOfUse: number;
    //   controlUnderstanding: number;
    //   decisionReflection: boolean | null;
    //   scenarioAlignment: boolean | null;
    //   comparisonUsefulness: number;
    //   perspectiveValue: number;
    //   confidenceAfterReordering: number;
    //   perceivedValue: number;
    //   tradeoffChallenge: number;
    //   reflectionDepth: number;
    //   comments: string;
    // };
    visualization: {
      usedTradeoffComparison: boolean | null;
      clarity: number;
      usefulness: number;
      tradeoffEvaluation: number;
      tradeoffJustification: number;
      expertUsefulness: number;
      helpfulness: boolean | null;
      expertConfidenceImpact: boolean | null;
      comments: string;
    };
    overall: {
      scenarioAlignment: boolean | null;
      decisionSatisfaction: number;
      processSatisfaction: number;
      confidenceConsistency: number;
      learningInsight: number;
      comments: string;
    };
    metricsSnapshot: {
      valueConsistencyIndex: number;
      performanceComposite: number;
      balanceIndex: number;
      cvrArrivals: number;
      cvrYesCount: number;
      cvrNoCount: number;
      //apaReorderings: number;
      totalSwitches: number;
      avgDecisionTime: number;
      scenariosFinalDecisionLabels: string[];
      checkingAlignmentList: string[];
    };
  }) {
    const res = await fetch(`${API}/api/session-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(data?.error || "Failed to upsert session feedback");
    return data;
  },

  async updateUserSession(sessionId: string, fields: Record<string, any>) {
    const res = await fetch(`${API}/api/user-sessions/${encodeURIComponent(sessionId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(data?.error || "Failed to update user session");
    return data;
  },

  async insertValueStability(payload: {
    session_id: string;
    overallStabilityScorePercent: number; // e.g., 86.7
    weights: { explicitWeight: number; implicitWeight: number }; // e.g., {0.4, 0.6}
    scenarios: Array<{
      scenarioId: number;
      scenarioLabel?: string;
      selectedValue: string;
      matches: {
        explicitValuesMatch: boolean;
        implicitValuesMatch: boolean;
        simulationValuesMatch: boolean;
      };
      stabilityStatus: string; // "Stable" | "Unstable"
      scorePercent: number;    // 0..100
    }>;
    summary?: { totalStableCount: number; totalScenarios: number };
  }) {
    const res = await fetch(`${API}/api/value-stability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(data?.error || "Failed to upsert value stability");
    return data; // { ok: true, id: "..." }
  },

};
