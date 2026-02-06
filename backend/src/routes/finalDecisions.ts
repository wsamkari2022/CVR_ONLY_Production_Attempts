import { Router, Request, Response } from "express";
import { FinalDecision } from "../models/FinalDecision";

const router = Router();

// POST /api/final-decisions
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    if (!body.session_id || body.scenario_id === undefined || !body.option_id || !body.option_label) {
      return res.status(400).json({ ok: false, error: "session_id, scenario_id, option_id, option_label are required" });
    }
    const doc = await FinalDecision.create(body);
    res.status(201).json({ ok: true, id: doc._id });
  } catch (err: any) {
    console.error("POST /api/final-decisions error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
