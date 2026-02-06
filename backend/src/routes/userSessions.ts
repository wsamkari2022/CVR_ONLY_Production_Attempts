import { Router, Request, Response } from "express";
import { UserSession } from "../models/UserSession.js";

const router = Router();

/**
 * POST /api/user-sessions
 * Body: { session_id, demographics, consent_agreed, consent_timestamp }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { session_id, demographics, consent_agreed, consent_timestamp } = req.body || {};

    if (!session_id || !demographics) {
      return res.status(400).json({ ok: false, error: "session_id and demographics are required" });
    }

    const ageNum = Number(demographics?.age);
    const ExperimentCondition = "2"; // Fixed string value for ExperimentCondition

    const doc = await UserSession.create({
      session_id,
      ExperimentCondition, // Add the fixed string value here
      demographics,
      age: Number.isNaN(ageNum) ? undefined : ageNum,
      gender: demographics?.gender,
      ai_experience: demographics?.aiExperience,
      moral_reasoning_experience: demographics?.moralReasoningExperience,
      consent_agreed: !!consent_agreed,
      consent_timestamp: consent_timestamp || null
    });

    return res.status(201).json({ ok: true, id: doc._id });
  } catch (err: any) {
    // duplicate session_id? (unique index) -> error shows here
    console.error("POST /api/user-sessions error:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// NEW: PATCH /api/user-sessions/:sessionId  (sessionId is the string session_id)
router.patch("/:sessionId", async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      return res.status(400).json({ ok: false, error: "Missing sessionId param" });
    }
    const doc = await UserSession.findOneAndUpdate(
      { session_id: sessionId },
      { $set: req.body },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }
    return res.status(200).json({ ok: true, id: doc._id });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
