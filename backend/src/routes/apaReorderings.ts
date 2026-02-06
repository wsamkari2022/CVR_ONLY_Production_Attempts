import { Router, Request, Response } from "express";
import { APAReordering } from "../models/APAReordering.js";

const router = Router();

// POST /api/apa-reorderings
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    if (!body.session_id || body.scenario_id === undefined || !body.preference_type) {
      return res.status(400).json({ ok: false, error: "session_id, scenario_id, preference_type are required" });
    }
    const doc = await APAReordering.create(body);
    res.status(201).json({ ok: true, id: doc._id });
  } catch (err: any) {
    console.error("POST /api/apa-reorderings error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
