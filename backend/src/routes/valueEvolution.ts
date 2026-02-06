import { Router, Request, Response } from "express";
import { ValueEvolution } from "../models/ValueEvolution.js";

const router = Router();

/**
 * POST /api/value-evolution
 * Body (as your page sends):
 * {
 *   session_id: string,
 *   value_list_snapshot: [{ name: string, matchPercentage: number }]
 *   // scenario_id is optional; we will default to 0
 * }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { session_id, value_list_snapshot, scenario_id } = req.body ?? {};

    // only reject when truly missing
    const missingSession =
      session_id === undefined || session_id === null || String(session_id).trim() === "";
    if (missingSession) {
      return res.status(400).json({ ok: false, error: "Missing session_id" });
    }

    const sid = String(session_id).trim();
    const scen = (scenario_id === undefined || scenario_id === null)
      ? 0
      : Number(scenario_id);

    if (Number.isNaN(scen)) {
      return res.status(400).json({ ok: false, error: "scenario_id must be a number if provided" });
    }

    const snapshot = Array.isArray(value_list_snapshot) ? value_list_snapshot : [];

    const doc = await ValueEvolution.create({
      session_id: sid,
      scenario_id: scen,
      value_list_snapshot: snapshot,
    });

    return res.status(201).json({ ok: true, id: doc._id });
  } catch (err: any) {
    console.error("POST /api/value-evolution error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
