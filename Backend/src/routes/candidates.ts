import express, { Request, Response } from "express";
import Candidate from "../models/Candidate"; 

const router = express.Router();

// GET all candidates
router.get("/", async (req: Request, res: Response) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
