import { Router, Request, Response } from "express";
import { ScenarioInteraction } from "../models/ScenarioInteraction";

const router = Router();

// POST /api/scenario-interactions
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    if (!body.session_id || body.scenario_id === undefined) {
      return res.status(400).json({ ok: false, error: "session_id and scenario_id are required" });
    }
    const doc = await ScenarioInteraction.create(body);
    res.status(201).json({ ok: true, id: doc._id });
  } catch (err: any) {
    console.error("POST /api/scenario-interactions error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
