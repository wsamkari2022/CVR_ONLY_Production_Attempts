import { Router, Request, Response } from "express";
import { CVRResponse } from "../models/CVRResponse.js";

const router = Router();

// POST /api/cvr-responses
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    if (!body.session_id || body.scenario_id === undefined || body.cvr_question === undefined || body.user_answer === undefined) {
      return res.status(400).json({ ok: false, error: "session_id, scenario_id, cvr_question, user_answer are required" });
    }
    const doc = await CVRResponse.create(body);
    res.status(201).json({ ok: true, id: doc._id });
  } catch (err: any) {
    console.error("POST /api/cvr-responses error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
