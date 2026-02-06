import { Router, Request, Response } from "express";
import { ValueStability } from "../models/ValueStability.js";

const router = Router();

/**
 * Upsert by session_id so each session has exactly one Value Stability doc.
 * Body shape must match the model.
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body || {};
    if (!session_id || typeof session_id !== "string") {
      return res.status(400).json({ ok: false, error: "Missing session_id" });
    }

    const doc = await ValueStability.findOneAndUpdate(
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
