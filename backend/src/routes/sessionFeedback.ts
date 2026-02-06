import { Router, Request, Response } from "express";
import { SessionFeedback } from "../models/SessionFeedback.js";

const router = Router();

/** Upsert by session_id so you always have exactly one feedback doc per session */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body || {};
    if (!session_id || typeof session_id !== "string") {
      return res.status(400).json({ ok: false, error: "Missing session_id" });
    }

    const doc = await SessionFeedback.findOneAndUpdate(
      { session_id },
      { $set: req.body },
      { upsert: true, new: true }
    );

    return res.status(200).json({ ok: true, id: doc._id });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
