import { Router, Request, Response } from "express";
import { SessionMetrics } from "../models/SessionMetrics.js";

const router = Router();

// UPSERT by session_id so each run has exactly one doc
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const sid = (body.session_id ?? "").toString().trim();

    if (!sid) {
      return res.status(400).json({ ok: false, error: "Missing session_id" });
    }

    const updated = await SessionMetrics.findOneAndUpdate(
      { session_id: sid },
      { $set: body },
      { upsert: true, new: true }
    );

    return res.status(200).json({ ok: true, id: updated._id });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
